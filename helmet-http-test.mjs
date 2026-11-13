import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:net';
const dir=mkdtempSync(join(tmpdir(),'helmet-http-')),probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));const origin='http://127.0.0.1:'+port;
let server;
const request=(path,body,headers={})=>fetch(origin+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',Origin:origin,...headers},body:body===undefined?undefined:JSON.stringify(body)});
async function boot(){server=spawn(process.execPath,['server.mjs'],{cwd:new URL('.',import.meta.url),env:{...process.env,PORT:String(port),POKER_PUBLIC_ORIGIN:origin,POKER_BIND_HOST:'127.0.0.1',POKER_REFERENCE_HOME:'1',POKER_DATA_DIR:dir},stdio:['ignore','ignore','inherit']});for(let n=0;;n++){if(n>100||server.exitCode!==null)throw Error('Server not ready');try{if((await request('/api/tables')).ok)break}catch{}await new Promise(r=>setTimeout(r,30))}}
async function stop(){if(server?.exitCode===null&&!server.signalCode){const done=once(server,'exit');server.kill();await done}}
try{
 await boot();const cookies=[];for(const name of ['HelmetOne','HelmetTwo']){const r=await request('/local/create',{name,pin:'123456'});assert.equal(r.status,200);cookies.push(r.headers.get('set-cookie').split(';')[0])}
 const key=readFileSync(join(dir,'owner.key'),'utf8').trim();assert.equal((await request('/api/tables',{id:'helmet',name:'Helmet',stack:120,blind:4,open:true},{Authorization:'Bearer '+key})).status,200);const room=(await(await request('/api/hosted')).json()).find(t=>t.id==='helmet').room,base='/api/rooms/'+room,players=[];
 for(const Cookie of cookies){const r=await request(base+'/join',{useProfile:true},{Cookie});assert.equal(r.status,200);players.push(await r.json())}
 const auth={Authorization:'Bearer '+players[0].issued,Cookie:cookies[0]},other={Authorization:'Bearer '+players[1].issued,Cookie:cookies[1]},before=await(await request(base+'/state',undefined,auth)).json();
 assert.equal((await request(base+'/helmet',undefined,auth)).status,405);
 for(const headers of [{},{Authorization:auth.Authorization},{...auth,Cookie:cookies[1]},{...auth,Authorization:'Bearer stale'}])assert.equal((await request(base+'/helmet',{muted:true},headers)).status,401);
 assert.equal((await request(base+'/helmet',{muted:true},{...auth,Origin:'https://foreign.invalid'})).status,403);assert.equal((await request(base+'/helmet',{muted:'true'},auth)).status,400);assert.equal((await request(base+'/helmet',{muted:true,seat:1},auth)).status,400);assert.equal((await request(base+'/helmet',{muted:true,padding:'x'.repeat(2100)},auth)).status,413);
 let r=await request(base+'/helmet',{muted:true},auth);assert.equal(r.status,200);const on=await r.json();assert.deepEqual(on.helmets,[true,false,false,false,false,false]);assert.deepEqual(on.hand,before.hand);assert.equal((await(await request(base+'/helmet',{muted:true},auth)).json()).version,on.version);assert.deepEqual((await(await request(base+'/watch')).json()).helmets,on.helmets);
 assert.equal((await request(base+'/chat',{text:'blocked'},auth)).status,403);assert.equal((await request(base+'/chat',{reaction:1},auth)).status,403);assert.equal((await request(base+'/chat',{text:'Other player'},other)).status,200);
 await stop();await boot();assert.equal((await(await request(base+'/state',undefined,auth)).json()).helmets[0],true);assert.equal((await request(base+'/helmet',{muted:false},auth)).status,200);assert.equal((await request(base+'/chat',{text:'Resumed'},auth)).status,200);
 assert.equal((await request('/local/logout',{}, {Cookie:cookies[0]})).status,200);assert.equal((await request(base+'/helmet',{muted:true},auth)).status,401);assert.ok(!readFileSync(join(dir,'rooms.json'),'utf8').includes(players[0].issued));
 console.log('PASS HTTP helmet:POST-only,seat+account auth,foreign-origin/body guards,public state,idempotence,chat isolation,coldrestart,unmute andlogout rejection');
}finally{await stop();rmSync(dir,{recursive:true,force:true})}
