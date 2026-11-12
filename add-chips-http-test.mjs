import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:net';
const dir=mkdtempSync(join(tmpdir(),'add-chips-http-')),probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));const origin='http://127.0.0.1:'+port;let child,key;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function boot(){child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),POKER_BIND_HOST:'127.0.0.1',POKER_PUBLIC_ORIGIN:origin,POKER_REFERENCE_HOME:'1',POKER_DATA_DIR:dir},stdio:['ignore','ignore','inherit']});for(let n=0;n<200;n++){try{if((await fetch(origin+'/api/tables')).ok)return}catch{}if(child.exitCode!==null)throw Error('Server exited');await delay(25)}throw Error('Server timeout')}
async function stop(){if(child&&child.exitCode===null){const done=once(child,'exit');child.kill();await done}}
const call=(path,body,headers={})=>fetch(origin+path,{method:body===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
try{
 await boot();key=readFileSync(join(dir,'owner.key'),'utf8').trim();const cookies={},tokens={};
 for(const name of ['Alice','Bob']){const r=await call('/local/create',{name,pin:'123456'});assert.equal(r.status,200);cookies[name]=r.headers.get('set-cookie').split(';')[0]}
 assert.equal((await call('/api/tables',{id:'fund',name:'Fund',stack:120,minBuyIn:60,maxBuyIn:240,blind:4,open:true},{Authorization:'Bearer '+key})).status,200);
 const id=(await(await call('/api/hosted')).json()).find(t=>t.id==='fund').room,path='/api/rooms/'+id;
 for(const [seat,name]of ['Alice','Bob'].entries()){const r=await call(path+'/join',{useProfile:true,name,seat,buyIn:120},{Cookie:cookies[name]});assert.equal(r.status,200);tokens[name]=(await r.json()).issued}
 const auth=name=>({Cookie:cookies[name],Authorization:'Bearer '+tokens[name]}),state=async name=>(await call(path+'/state',undefined,auth(name))).json(),wallet=async name=>(await(await call('/local/wallet',undefined,{Cookie:cookies[name]})).json()).available;
 let s=await state('Alice');assert.equal((await call(path+'/start',{version:s.version},auth('Alice'))).status,200);s=await state('Alice');const hand=s.hand,body={number:s.number,version:s.version,amount:60};
 assert.equal((await call(path+'/add-chips',body,{...auth('Alice'),Origin:'http://elsewhere.invalid'})).status,403);assert.equal((await call(path+'/add-chips',body,{Cookie:cookies.Alice})).status,401);assert.equal((await call(path+'/add-chips',body,{Authorization:'Bearer '+tokens.Alice,Cookie:cookies.Bob})).status,401);assert.equal((await call(path+'/add-chips',undefined,auth('Alice'))).status,405);assert.equal((await call(path+'/add-chips',body,{...auth('Alice'),'Content-Type':'text/plain'})).status,415);assert.equal((await call(path+'/add-chips',{...body,pad:'x'.repeat(2048)},auth('Alice'))).status,413);
 const zero=await call(path+'/add-chips',{...body,amount:0},auth('Alice'));assert.equal(zero.status,200);assert.equal((await zero.json()).pendingAdd,undefined);assert.equal((await state('Alice')).ready[0],false);assert.equal(await wallet('Alice'),9880,'Zero addition is a no-debit, no-ready operation');
 let r=await call(path+'/add-chips',body,auth('Alice'));assert.equal(r.status,200);const pending=await r.json();assert.deepEqual(pending.pendingAdd,{number:s.number,amount:60});assert.deepEqual(pending.hand,hand);assert.equal(await wallet('Alice'),9820);assert.equal((await call(path+'/add-chips',body,auth('Alice'))).status,200);assert.equal(await wallet('Alice'),9820);assert.equal((await call(path+'/add-chips',{...body,amount:80},auth('Alice'))).status,409);assert.equal((await state('Bob')).pendingAdd,undefined);assert.equal((await(await call(path+'/watch')).json()).pendingAdd,undefined);
 await stop();await boot();assert.equal(await wallet('Alice'),9820);assert.deepEqual((await state('Alice')).pendingAdd,pending.pendingAdd);
 s=await state('Alice');const actor=s.hand.turn,name=s.names[actor];const own=await state(name);assert.equal((await call(path+'/act',{version:own.version,action:'fold'},auth(name))).status,200);s=await state('Alice');assert.ok(s.hand.end);const closing=[...s.hand.stacks];assert.equal((await call(path+'/leave',{version:s.version},auth('Alice'))).status,200);assert.equal(await wallet('Alice'),9880+closing[0]);s=await state('Bob');assert.equal((await call(path+'/leave',{version:s.version},auth('Bob'))).status,200);assert.equal((await wallet('Alice'))+(await wallet('Bob')),20000);
 console.log('PASS add-chips HTTP: method/origin/session/token/JSON/body guards; active hand unchanged, private pending receipt, one debit/retry/restart, conflicting request rejected, settled leave refunds and total wallets20000');
}finally{await stop();rmSync(dir,{recursive:true,force:true})}
