import {image} from './avatar-image-test.mjs';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {mkdtempSync,rmSync,mkdirSync,rmdirSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {profiles} from './local-profile.mjs';
const dir=mkdtempSync(join(tmpdir(),'local-profile-'));
try{
 const account=profiles(join(dir,'accounts.json'));
 async function call(path,{method='POST',origin='http://127.0.0.1:1234',cookie='',body={}}={}){
  const req=Readable.from([JSON.stringify(body)]);req.method=method;req.headers={host:'127.0.0.1:1234',origin,cookie};
  const headers={};let result;await account.handle(req,{setHeader:(k,v)=>headers[k]=v},path,(status,data)=>result={status,data});
  return {...result,headers};
 }
 const created=await call('/local/create',{body:{name:'PlayerOne',pin:'123456'}});
 assert.equal(created.status,200);const cookie=created.headers['Set-Cookie'].split(';')[0];
 assert.equal((await call('/local/me',{method:'GET',cookie})).status,200);
 assert.equal((await call('/local/avatar',{cookie,body:{avatar:2}})).status,200);
 assert.equal((await call('/local/me',{method:'GET',cookie})).data.avatar,2);
 mkdirSync(join(dir,'accounts.json.tmp'));await assert.rejects(()=>call('/local/avatar',{cookie,body:{avatar:3}}));rmdirSync(join(dir,'accounts.json.tmp'));
 assert.equal(account.avatar('PlayerOne'),2);assert.equal((await call('/local/avatar',{cookie,body:{avatar:3}})).status,200);assert.equal(profiles(join(dir,'accounts.json')).avatar('PlayerOne'),3);
 for(const avatar of [-1,7,1.5,'2',null])assert.equal((await call('/local/avatar',{cookie,body:{avatar}})).status,400);
 assert.equal((await call('/local/avatar',{body:{avatar:1}})).status,401);
 assert.equal((await call('/local/avatar',{cookie,origin:'https://foreign.invalid',body:{avatar:1}})).status,403);
 assert.equal((await call('/local/logout',{cookie,origin:'https://foreign.invalid'})).status,403);
 assert.equal((await call('/local/logout',{cookie,method:'GET'})).status,403);
 assert.equal((await call('/local/me',{method:'GET',cookie})).status,200);
 assert.equal((await call('/local/avatar',{body:{image}})).status,401);assert.equal((await call('/local/avatar',{cookie,origin:'https://foreign.invalid',body:{image}})).status,403);
 const uploaded=await call('/local/avatar',{cookie,body:{image}});assert.equal(uploaded.status,200);assert.match(uploaded.data.avatar,/^\/local\/avatar-images\/[a-f0-9]{64}\.png$/);assert.equal(account.avatar('PlayerOne'),uploaded.data.avatar);assert.ok(account.image(uploaded.data.avatar.split('/').at(-1).slice(0,-4)).length>0);assert.equal(profiles(join(dir,'accounts.json')).avatar('PlayerOne'),uploaded.data.avatar);
 mkdirSync(join(dir,'accounts.json.tmp'));await assert.rejects(()=>call('/local/avatar',{cookie,body:{image}}));rmdirSync(join(dir,'accounts.json.tmp'));assert.equal(account.avatar('PlayerOne'),uploaded.data.avatar);
 assert.equal((await call('/local/avatar',{cookie,body:{image:'data:image/svg+xml;base64,PHN2Zz4='}})).status,400);
 assert.equal((await call('/local/avatar',{cookie,body:{avatar:1}})).status,200);assert.equal((await call('/local/avatar',{cookie,body:{avatar:'custom'}})).data.avatar,uploaded.data.avatar);
 const out=await call('/local/logout',{cookie});assert.equal(out.status,200);assert.match(out.headers['Set-Cookie'],/Max-Age=0/);
 assert.equal((await call('/local/me',{method:'GET',cookie})).status,401);
 assert.equal((await call('/local/login',{body:{name:'PlayerOne',pin:'123456'}})).status,200);
 mkdirSync(join(dir,'accounts.json.tmp'));
 await assert.rejects(()=>call('/local/create',{body:{name:'RetryPlayer',pin:'123456'}}));
 rmdirSync(join(dir,'accounts.json.tmp'));
 assert.equal((await call('/local/login',{body:{name:'RetryPlayer',pin:'123456'}})).status,401);
 assert.equal((await call('/local/create',{body:{name:'RetryPlayer',pin:'123456'}})).status,200);
 console.log('PASS failed registration write leaves no phantom account and succeeds on retry');
 console.log('PASS local profile: hostile/GET logout rejected, old token invalidated, account can sign in again');
}finally{rmSync(dir,{recursive:true,force:true})}
