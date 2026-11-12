import {avatarImage} from './avatar-image.mjs';
import {randomBytes,scrypt,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import {readFileSync,writeFileSync,renameSync} from 'node:fs';
const derive=promisify(scrypt);
export function profiles(file){
 let accounts={},sessions=new Map();
 try{
  const saved=JSON.parse(readFileSync(file,'utf8'));
  if(typeof saved.version==='number'){
   if(saved.version!==1||!saved.accounts||typeof saved.accounts!=='object'||Array.isArray(saved.accounts)||!Array.isArray(saved.sessions))throw Error('Invalid local account store');
   accounts=saved.accounts;
   const seen=new Set();
   for(const item of saved.sessions){
    if(!Array.isArray(item)||item.length!==2||typeof item[0]!=='string'||!/^[0-9a-f]{64}$/.test(item[0])||!item[1]||typeof item[1].name!=='string'||!Number.isSafeInteger(item[1].until)||accounts[item[1].name.toLowerCase()]?.name!==item[1].name)throw Error('Invalid local session store');
    if(seen.has(item[0]))throw Error('Invalid duplicate local session');seen.add(item[0]);
    if(item[1].until>Date.now())sessions.set(item[0],item[1]);
   }
  }else accounts=saved;
 }catch(e){if(e.code!=='ENOENT')throw e}
 const attempts=new Map(),sessionKey=token=>createHash('sha256').update(token).digest('hex');
 const cookieToken=req=>/(?:^|;)\s*localplayer=([0-9a-f]{48})(?:;|$)/.exec(req.headers.cookie||'')?.[1];
 // shortcut: one saved custom image per account; add a gallery if multiple uploads are required.
 function customAvatar(name){const custom=accounts[String(name).toLowerCase()]?.customAvatar;return custom?'/local/avatar-images/'+custom.hash+'.png':null}
 function avatar(name){const a=accounts[String(name).toLowerCase()];return a?.avatar==='custom'?customAvatar(name):a?.avatar??0}
 function image(hash){const custom=Object.values(accounts).find(a=>a.customAvatar?.hash===hash)?.customAvatar;return custom?Buffer.from(custom.png,'base64'):null}
 function save(next,nextSessions=sessions){
  const live=new Map([...nextSessions].filter(([,session])=>session.until>Date.now()));
  writeFileSync(file+'.tmp',JSON.stringify({version:1,accounts:next,sessions:[...live]}),{mode:0o600});renameSync(file+'.tmp',file);accounts=next;sessions=live;
 }
 function identity(req){
  const token=cookieToken(req),session=token?sessions.get(sessionKey(token)):null;
  return session&&session.until>Date.now()?session.name:null;
 }
 async function handle(req,res,path,json){
  const nameOnSession=identity(req);
  if(path==='/local/me')return nameOnSession?json(200,{name:nameOnSession,avatar:avatar(nameOnSession),...(customAvatar(nameOnSession)?{customAvatar:customAvatar(nameOnSession)}:{})}):json(401,{error:'Sign in locally'});
  if(req.method!=='POST'||req.headers.origin!=='http://'+req.headers.host)return json(403,{error:'Local form required'});
  if(path==='/local/logout'){
   const token=cookieToken(req);
   if(token&&sessions.has(sessionKey(token))){const nextSessions=new Map(sessions);nextSessions.delete(sessionKey(token));save(accounts,nextSessions)}
   res.setHeader('Set-Cookie','localplayer=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return json(200,{signedOut:true});
  }
  let raw='';for await(const c of req){raw+=c;if(raw.length>(path==='/local/avatar'?531024:1024))return json(413,{error:'Too large'})}
  let b;try{b=JSON.parse(raw)}catch{return json(400,{error:'Invalid form'})}
  if(path==='/local/avatar'){
   if(!nameOnSession)return json(401,{error:'Sign in locally'});
   const key=nameOnSession.toLowerCase();let custom;
   if(b?.image!==undefined){try{custom=avatarImage(b.image)}catch(error){return json(error.status||400,{error:error.message})}}
   else if(b?.avatar==='custom'){if(!accounts[key].customAvatar)return json(400,{error:'Upload a custom avatar first'})}
   else if(!Number.isInteger(b?.avatar)||b.avatar<0||b.avatar>6)return json(400,{error:'Choose an available avatar'});
   save({...accounts,[key]:{...accounts[key],avatar:custom?'custom':b.avatar,...(custom?{customAvatar:custom}:{})}});
   return json(200,{name:nameOnSession,avatar:avatar(nameOnSession),...(customAvatar(nameOnSession)?{customAvatar:customAvatar(nameOnSession)}:{})});
  }
  const name=b?.name,key=String(name).toLowerCase();
  if(!/^[a-z0-9][a-z0-9_-]{1,19}$/i.test(name||'')||typeof b.pin!=='string'||!/^\d{6}$/.test(b.pin))return json(400,{error:'Use a 2–20 character nickname and six-digit local PIN'});
  const previous=attempts.get(key)||[];const recent=previous.filter(t=>t>Date.now()-60000);if(recent.length>=6)return json(429,{error:'Try again in one minute'});attempts.set(key,[...recent,Date.now()]);
  const account=Object.hasOwn(accounts,key)?accounts[key]:null;
  const salt=account?.salt||randomBytes(16).toString('hex'),hash=await derive(b.pin,salt,32);
  let nextAccounts=accounts;
  if(path==='/local/create'){if(Object.hasOwn(accounts,key))return json(409,{error:'Nickname already registered'});nextAccounts={...accounts,[key]:{name,salt,hash:hash.toString('hex')}}}
  else if(!account||!timingSafeEqual(hash,Buffer.from(account.hash,'hex')))return json(401,{error:'Nickname or PIN incorrect'});
  const issued=randomBytes(24).toString('hex'),nextSessions=new Map(sessions);nextSessions.set(sessionKey(issued),{name:nextAccounts[key].name,until:Date.now()+43200000});save(nextAccounts,nextSessions);
  res.setHeader('Set-Cookie','localplayer='+issued+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200');return json(200,{name:accounts[key].name})
 }
 return {identity,handle,avatar,image,names:()=>Object.values(accounts).map(a=>a.name)};
}
