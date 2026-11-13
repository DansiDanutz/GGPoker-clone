import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const data=mkdtempSync(join(tmpdir(),'pause-http-')),port=String(20000+Math.floor(Math.random()*16000)),origin='http://127.0.0.1:'+port;
let child;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function boot(){child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port,POKER_DATA_DIR:data},stdio:['ignore','pipe','inherit']});await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('Server failed')})])}
async function stop(){const done=once(child,'exit');child.kill();await done;child=null}
try{
 await boot();const key=readFileSync(join(data,'owner.key'),'utf8').trim(),headers={Authorization:'Bearer '+key,'Content-Type':'application/json',Origin:origin};
 const table={id:'pause',name:'Pause HTTP',mode:'tournament',tournamentSeats:3,stack:100,blind:4,open:true,levelSeconds:60};
 assert.equal((await fetch(origin+'/api/tables',{method:'POST',headers,body:JSON.stringify(table)})).status,200);
 const row=(await(await fetch(origin+'/api/hosted')).json()).find(t=>t.id===table.id),tokens=[];
 const req=async(op,token,body)=>{const r=await fetch(origin+'/api/rooms/'+row.room+'/'+op,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+(token||''),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});assert.equal(r.status,200,await r.clone().text());return r.json()};
 const get=async()=>{const r=await fetch(origin+'/api/owner-tournaments?table=pause',{headers});assert.equal(r.status,200);return r.json()};
 const control=async(action,version,extra={})=>fetch(origin+'/api/owner-tournaments',{method:'POST',headers:{...headers,...extra},body:JSON.stringify({tableId:'pause',action,version})});
 assert.equal((await fetch(origin+'/api/owner-tournaments?table=pause')).status,401);
 assert.equal((await control('pause',0)).status,409);
 for(let i=0;i<3;i++)tokens.push((await req('join',null,{name:'Player '+i})).issued);
 let before=await get();assert.equal((await control('pause',before.version,{Origin:'https://foreign.invalid'})).status,403);
 assert.equal((await control('pause',before.version,{'Content-Type':'text/plain'})).status,415);
 let r=await control('pause',before.version);assert.equal(r.status,200);assert.equal((await r.json()).pauseRequested,true);
 assert.equal((await control('resume',before.version)).status,409);
 let s=await req('state',tokens[0]);while(!s.hand.end){const token=tokens[s.hand.turn],v=await req('state',token);s=await req('act',token,{version:v.version,action:'fold'})}
 assert.equal((await get()).paused,true);const stacks=s.hand.stacks,number=s.number;
 await stop();await boot();await wait(3300);s=await req('state',tokens[0]);assert.equal(s.number,number);assert.deepEqual(s.hand.stacks,stacks);assert.equal((await get()).paused,true);
 r=await control('resume',(await get()).version);assert.equal(r.status,200);assert.equal((await r.json()).paused,false);
 await wait(3200);s=await req('state',tokens[0]);assert.equal(s.number,number+1);assert.equal(s.tournament.level,1);
 for(let i=0;i<200&&s.tournament.winner===null;i++){
  if(s.hand.end){await wait(3100);s=await req('state',tokens[0]);continue}
  const token=tokens[s.hand.turn],v=await req('state',token),o=v.hand.options;s=await req('act',token,{version:v.version,action:o.raise?'raise':o.due?'call':'check',target:o.max});
 }
 assert.notEqual(s.tournament.winner,null);assert.equal(s.hand.stacks.reduce((a,b)=>a+b),300);assert.equal(s.tournament.prizes.reduce((a,b)=>a+b),75);
 assert.equal((await control('pause',(await get()).version)).status,409);
 await stop();await boot();assert.deepEqual((await req('state',tokens[0])).tournament,s.tournament);
 const audit=readFileSync(join(data,'owner-audit.jsonl'),'utf8').trim().split('\n').map(JSON.parse);assert.ok(audit.some(x=>x.action==='pause-tournament'));assert.ok(audit.some(x=>x.action==='resume-tournament'));
 console.log('PASS tournament pause HTTP: owner/origin/JSON/stale guards, queued pause, cold restart/no deal, resume, full three-player winner/300 chips/75 prize and restart/audit');
}finally{if(child)await stop();rmSync(data,{recursive:true,force:true})}
