import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {once} from 'node:events';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createServer} from 'node:net';
const dir=mkdtempSync(join(tmpdir(),'rush-helmet-http-')),probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));const origin='http://127.0.0.1:'+port;let server;
const request=(path,body,headers={})=>fetch(origin+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',Origin:origin,...headers},body:body===undefined?undefined:JSON.stringify(body)});
async function boot(){server=spawn(process.execPath,['server.mjs'],{cwd:new URL('.',import.meta.url),env:{...process.env,PORT:String(port),POKER_PUBLIC_ORIGIN:origin,POKER_BIND_HOST:'127.0.0.1',POKER_REFERENCE_HOME:'1',POKER_DATA_DIR:dir},stdio:['ignore','ignore','inherit']});for(let n=0;;n++){if(n>100||server.exitCode!==null)throw Error('Server not ready');try{if((await request('/api/tables')).ok)break}catch{}await new Promise(r=>setTimeout(r,30))}}
async function stop(){if(server?.exitCode===null&&!server.signalCode){const done=once(server,'exit');server.kill();await done}}
try{
 await boot();const cookies=[];for(const name of ['RushHelmetA','RushHelmetB']){const r=await request('/local/create',{name,pin:'123456'});assert.equal(r.status,200);cookies.push(r.headers.get('set-cookie').split(';')[0])}const a={Cookie:cookies[0]},b={Cookie:cookies[1]};
 assert.equal((await request('/api/rush/helmet',{muted:true})).status,401);assert.equal((await request('/api/rush/helmet',{muted:true},a)).status,409);
 for(const variant of ['holdem','plo']){const base='/api/rush/'+variant;
  for(const auth of [a,b]){const state=await(await request(base+'/state',undefined,auth)).json();assert.equal((await request(base+'/join',{version:state.version},auth)).status,200)}
  assert.equal((await request(base+'/helmet',undefined,a)).status,405);assert.equal((await request(base+'/helmet',{muted:true},{...a,Origin:'https://foreign.invalid'})).status,403);
  for(const body of [{muted:'true'},{muted:true,id:'RushHelmetB'},{muted:false,handVersion:2}])assert.equal((await request(base+'/helmet',body,a)).status,400);
  assert.equal((await request(base+'/helmet',{muted:true,padding:'x'.repeat(2100)},a)).status,413);
  const r=await request(base+'/helmet',{muted:true,version:0,handVersion:null},a);assert.equal(r.status,200);const state=await r.json();assert.equal(state.helmet,true);assert.equal(state.table,null);assert.equal(state.balance,200);assert.equal((await(await request(base+'/helmet',{muted:true},a)).json()).version,state.version);assert.equal((await(await request(base+'/state',undefined,b)).json()).helmet,false);
 }
 await stop();await boot();for(const variant of ['holdem','plo'])assert.equal((await(await request('/api/rush/'+variant+'/state',undefined,a)).json()).helmet,true);
 assert.equal((await request('/api/rush/holdem/helmet',{muted:false},a)).status,200);assert.equal((await(await request('/api/rush/plo/state',undefined,a)).json()).helmet,true,'Pool session preferences are independent');assert.equal((await request('/local/logout',{},a)).status,200);assert.equal((await request('/api/rush/plo/helmet',{muted:false},a)).status,401);
 console.log('PASS Rush Helmet HTTP:twoformats/cookieauth/registeredguard/POST/origin/body/own-account isolation/standby/idempotence/independent pools/coldrestart/logout');
}finally{await stop();rmSync(dir,{recursive:true,force:true})}
