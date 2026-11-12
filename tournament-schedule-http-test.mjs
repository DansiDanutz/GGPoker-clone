import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const data=mkdtempSync(join(tmpdir(),'scheduled-http-')),port=String(20000+Math.floor(Math.random()*16000)),origin='http://127.0.0.1:'+port;
let child;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function boot(){child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port,POKER_DATA_DIR:data},stdio:['ignore','pipe','inherit']});await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('Server failed')})])}
async function stop(){const done=once(child,'exit');child.kill();await done;child=null}
try{
 await boot();const key=readFileSync(join(data,'owner.key'),'utf8').trim();
 const save=t=>fetch(origin+'/api/tables',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(t)});
 const table={id:'scheduled',name:'Scheduled HTTP',mode:'tournament',tournamentSeats:6,stack:100,blind:4,open:true,startsAt:Date.now()+4000};
 for(const startsAt of [null,1.5,'tomorrow',Date.now()-1000])assert.equal((await save({...table,startsAt})).status,400);
 assert.equal((await save({...table,mode:'cash'})).status,400);assert.equal((await save(table)).status,200);
 const row=(await(await fetch(origin+'/api/hosted')).json()).find(t=>t.id===table.id);
 const req=async(op,token,body)=>{const r=await fetch(origin+'/api/rooms/'+row.room+'/'+op,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+(token||''),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return [r.status,await r.json()]};
 const [,a]=await req('join',null,{name:'First',seat:2}),[,b]=await req('join',null,{name:'Second',seat:5});
 assert.equal(b.hand,null);assert.equal((await save({...table,startsAt:table.startsAt+5000})).status,409);
 await stop();await boot();await wait(Math.max(0,table.startsAt-Date.now())+700);
 // Inspect disk without a request that could itself trigger the start.
 let stored=JSON.parse(readFileSync(join(data,'rooms.json'),'utf8')).find(([id])=>id===row.room)[1];assert.ok(stored.hand);assert.equal(stored.tournament.pool,50);
 const tokens={2:a.issued,5:b.issued};let [,s]=await req('state',a.issued);
 assert.equal((await req('join',null,{name:'Late'}))[0],409);
 for(let i=0;i<100&&s.tournament.winner===null;i++){
  if(s.hand.end){await wait(3100);[,s]=await req('state',a.issued);continue}
  const token=tokens[s.hand.turn],[,v]=await req('state',token),o=v.hand.options;
  [,s]=await req('act',token,{version:v.version,action:o.raise?'raise':o.due?'call':'check',target:o.max});
 }
 assert.notEqual(s.tournament.winner,null);assert.equal(s.hand.stacks.reduce((a,b)=>a+b),200);assert.equal(s.tournament.prizes.reduce((a,b)=>a+b),50);
 await stop();await boot();assert.deepEqual((await req('state',a.issued))[1].tournament,s.tournament);
 console.log('PASS scheduled HTTP: admin validation/lock, real timer after restart with no requests, two-of-six event, winner, 200 chips and persisted 50-credit prize');
}finally{if(child)await stop();rmSync(data,{recursive:true,force:true})}
