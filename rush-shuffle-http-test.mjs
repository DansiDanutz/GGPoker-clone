import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {once} from 'node:events';import {mkdtempSync,rmSync,readFileSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createServer} from 'node:net';
const dir=mkdtempSync(join(tmpdir(),'rush-shuffle-http-')),probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));const origin='http://127.0.0.1:'+port;let server;
const request=(path,body,headers={})=>fetch(origin+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',Origin:origin,...headers},body:body===undefined?undefined:JSON.stringify(body)});
async function boot(){server=spawn(process.execPath,['server.mjs'],{cwd:new URL('.',import.meta.url),env:{...process.env,PORT:String(port),POKER_PUBLIC_ORIGIN:origin,POKER_BIND_HOST:'127.0.0.1',POKER_REFERENCE_HOME:'1',POKER_DATA_DIR:dir},stdio:['ignore','ignore','inherit']});for(let n=0;;n++){if(n>100||server.exitCode!==null)throw Error('Server not ready');try{if((await request('/api/tables')).ok)break}catch{}await new Promise(r=>setTimeout(r,30))}}
async function stop(){if(server?.exitCode===null&&!server.signalCode){const done=once(server,'exit');server.kill();await done}}
try{
 await boot();const auth=[];for(let i=0;i<6;i++){const r=await request('/local/create',{name:'Shuffle'+i,pin:'123456'});assert.equal(r.status,200);auth.push({Cookie:r.headers.get('set-cookie').split(';')[0]})}
 for(const variant of ['holdem','plo']){
  const base='/api/rush/'+variant,state=async i=>(await request(base+'/state',undefined,auth[i])).json();
  assert.equal((await request(base+'/shuffle',{table:1})).status,401);assert.equal((await request(base+'/shuffle',{table:1},auth[0])).status,409);
  for(let i=0;i<6;i++)assert.equal((await request(base+'/join',{version:(await state(i)).version},auth[i])).status,200);
  assert.equal((await request(base+'/deal',{version:(await state(0)).version},auth[0])).status,200);const before=await state(0),bytes=readFileSync(join(dir,'rooms.json'));
  assert.equal((await request(base+'/shuffle',undefined,auth[0])).status,405);assert.equal((await request(base+'/shuffle',{table:before.table},{...auth[0],Origin:'https://foreign.invalid'})).status,403);
  assert.equal((await request(base+'/shuffle',{table:before.table,account:'Shuffle1'},auth[0])).status,401);assert.equal((await request(base+'/shuffle',{table:before.table,extra:true},auth[0])).status,400);assert.equal((await request(base+'/shuffle',{table:before.table+100},auth[0])).status,409);
  const response=await request(base+'/shuffle',{table:before.table},auth[0]);assert.equal(response.status,200);const after=await response.json();assert.deepEqual(after.hand,before.hand);assert.equal(after.shuffles.length,1);assert.equal(after.version,before.version);assert.deepEqual(readFileSync(join(dir,'rooms.json')),bytes);assert.deepEqual((await state(1)).shuffles,after.shuffles);assert.equal((await request(base+'/shuffle',{table:before.table},auth[0])).status,429);
 }
 await stop();await boot();for(const variant of ['holdem','plo'])assert.deepEqual((await(await request('/api/rush/'+variant+'/state',undefined,auth[0])).json()).shuffles,[]);
 console.log('PASS Rush shuffle HTTP:Holdem/PLO cookie auth,POST/origin/account/payload/table/rate guards,peer event,unchanged game/disk/version and restart without replay');
}finally{await stop();rmSync(dir,{recursive:true,force:true})}
