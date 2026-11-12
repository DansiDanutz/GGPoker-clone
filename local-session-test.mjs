import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {mkdtempSync,rmSync,readFileSync,writeFileSync,mkdirSync,rmdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {profiles} from './local-profile.mjs';
const dir=mkdtempSync(join(tmpdir(),'local-session-')),file=join(dir,'players.json'),clock=Date.now;let now=clock();Date.now=()=>now;
let store=profiles(file);
async function call(path,cookie='',body={}){
 const req=Readable.from([JSON.stringify(body)]);req.method=path==='/local/me'?'GET':'POST';req.headers={host:'127.0.0.1:1234',origin:'http://127.0.0.1:1234',cookie};
 const headers={};let result;await store.handle(req,{setHeader:(key,value)=>headers[key]=value},path,(status,data)=>result={status,data});return {...result,headers};
}
try{
 const created=await call('/local/create','',{name:'Persistent',pin:'123456'}),first=created.headers['Set-Cookie'].split(';')[0];
 assert.equal(created.status,200);store=profiles(file);assert.equal((await call('/local/me',first)).status,200);
 assert.equal((await call('/local/me','prefix-'+first)).status,401);assert.equal((await call('/local/me','other=1; '+first+'; final=2')).status,200);
 assert.ok(!readFileSync(file,'utf8').includes(first.split('=')[1]));assert.equal(statSync(file).mode&0o777,0o600);
 const second=(await call('/local/login','',{name:'Persistent',pin:'123456'})).headers['Set-Cookie'].split(';')[0];
 await call('/local/avatar',first,{avatar:4});store=profiles(file);assert.equal((await call('/local/me',second)).data.avatar,4);
 const before=readFileSync(file,'utf8');mkdirSync(file+'.tmp');
 await assert.rejects(()=>call('/local/login','',{name:'Persistent',pin:'123456'}));assert.equal(readFileSync(file,'utf8'),before);
 await assert.rejects(()=>call('/local/logout',first));assert.equal((await call('/local/me',first)).status,200);assert.equal(readFileSync(file,'utf8'),before);rmdirSync(file+'.tmp');
 await call('/local/logout',first);store=profiles(file);assert.equal((await call('/local/me',first)).status,401);assert.equal((await call('/local/me',second)).status,200);
 now+=43200000;assert.equal((await call('/local/me',second)).status,401);store=profiles(file);assert.equal((await call('/local/me',second)).status,401);
 const accountData=JSON.parse(readFileSync(file,'utf8')).accounts,legacy=join(dir,'legacy.json');writeFileSync(legacy,JSON.stringify(accountData));
 store=profiles(legacy);assert.equal((await call('/local/login','',{name:'Persistent',pin:'123456'})).status,200);assert.deepEqual(JSON.parse(readFileSync(legacy,'utf8')).accounts,accountData);
 const invalid=join(dir,'invalid.json');writeFileSync(invalid,JSON.stringify({version:2,accounts:accountData,sessions:[]}));assert.throws(()=>profiles(invalid),/Invalid local account/);
 writeFileSync(invalid,JSON.stringify({version:1,accounts:accountData,sessions:[['not-a-digest',{name:'Persistent',until:now+1000}]]}));assert.throws(()=>profiles(invalid),/Invalid local session/);
 const duplicate=['a'.repeat(64),{name:'Persistent',until:now+1000}];writeFileSync(invalid,JSON.stringify({version:1,accounts:accountData,sessions:[duplicate,duplicate]}));assert.throws(()=>profiles(invalid),/duplicate/);
 console.log('PASS durable sessions: hashed cookies, restart, independent logout, 12h expiry, failed-write rollback and lossless legacy migration');
}finally{Date.now=clock;rmSync(dir,{recursive:true,force:true})}
