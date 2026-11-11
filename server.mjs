import {openRooms} from './rooms.mjs';
import http from 'node:http';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {readFileSync,writeFileSync,renameSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {homedir} from 'node:os';
import {fileURLToPath} from 'node:url';
const port=Number(process.env.PORT||18765),host=process.env.POKER_BIND_HOST||'127.0.0.1', origin=process.env.POKER_PUBLIC_ORIGIN||('http://'+host+':'+port);
const directory=process.env.POKER_DATA_DIR||join(homedir(),'.local/share/river-room');mkdirSync(directory,{recursive:true,mode:0o700});
const roomRequest=openRooms(join(directory,'rooms.json'));
const keyPath=join(directory,'owner.key'),db=join(directory,'tables.json');
try{writeFileSync(keyPath,randomBytes(32).toString('hex'),{mode:0o600,flag:'wx'})}catch(e){if(e.code!=='EEXIST')throw e}
const key=readFileSync(keyPath,'utf8').trim();
let tables=[{id:'practice',name:'Green Felt',stack:200,blind:4,open:true}];
try{tables=JSON.parse(readFileSync(db,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}
const files=new Set(['index.html','ui.mjs','game.mjs','engine/hand.mjs','engine/pots.mjs','engine/deck.mjs','engine/table.mjs','network.html','network.mjs','nolimit.html','nolimit.mjs','lobby.html','lobby.mjs']);
http.createServer(async(req,res)=>{
 const json=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data))};
 try{
 if(req.headers.host!==new URL(origin).host)return json(403,{error:'Local host required'});
 const path=new URL(req.url,origin).pathname;
 const match=/^\/api\/rooms\/([0-9a-f]{48})\/(join|state|act|ready|leave)$/.exec(path);
 if(match){
  const [,id,op]=match;
  if(req.method!==(op==='state'?'GET':'POST'))return json(405,{error:'Method not allowed'});
  if(req.headers.origin&&req.headers.origin!==origin)return json(403,{error:'Origin not allowed'});
  let body={};
  if(req.method==='POST'){
   if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Expected JSON'});
   let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>2048)return json(413,{error:'Request too large'});chunks.push(chunk)}
   try{body=JSON.parse(Buffer.concat(chunks));if(!body||typeof body!=='object'||Array.isArray(body))throw Error()}catch{return json(400,{error:'Invalid JSON'})}
  }
  try{return json(200,roomRequest(id,op,(req.headers.authorization||'').replace(/^Bearer /,''),body))}
  catch(e){if(e.status)return json(e.status,{error:e.message});throw e}
 }
 if(path==='/api/tables'&&req.method==='GET')return json(200,tables);
 if(path==='/api/tables'&&req.method==='POST'){
  if(origin!=='http://127.0.0.1:'+port||host!=='127.0.0.1')return json(403,{error:'Owner changes require local-only mode'});
  const token=Buffer.from((req.headers.authorization||'').replace(/^Bearer /,''));const expected=Buffer.from(key);
  if(req.headers.origin&&req.headers.origin!==origin)return json(403,{error:'Local origin required'});
  if(token.length!==expected.length||!timingSafeEqual(token,expected))return json(401,{error:'Owner key required'});
  let body='';for await(const c of req){body+=c;if(body.length>4096)return json(413,{error:'Request too large'})}
  let t;try{t=JSON.parse(body)}catch{return json(400,{error:'Invalid JSON'})}
  if(!t||typeof t.id!=='string'||!/^[a-z0-9-]{1,40}$/.test(t.id)||typeof t.name!=='string'||!t.name.trim()||t.name.length>60||!Number.isInteger(t.stack)||!Number.isInteger(t.blind)||t.blind<2||t.blind%2||t.stack<t.blind*4||t.stack>1000000||typeof t.open!=='boolean')return json(400,{error:'Invalid table settings'});
  const next=tables.filter(x=>x.id!==t.id).concat({id:t.id,name:t.name.trim(),stack:t.stack,blind:t.blind,open:t.open});
  writeFileSync(db+'.tmp',JSON.stringify(next),{mode:0o600});renameSync(db+'.tmp',db);tables=next;return json(200,{saved:true})
 }
 const file=path==='/'?'lobby.html':path.slice(1);
 if(req.method!=='GET'||!files.has(file))return json(404,{error:'Not found'});
 res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':'text/javascript','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(readFileSync(fileURLToPath(new URL(file,import.meta.url))))
 }catch{if(!res.headersSent)json(500,{error:'Local operation failed'});else res.end()}
}).listen(port,host,()=>console.log('River Room: '+origin+' · owner key file: '+keyPath));
