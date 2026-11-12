import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync,existsSync,statSync,renameSync,mkdirSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';
const data=mkdtempSync(join(tmpdir(),'river-owner-')),port=String(20000+Math.floor(Math.random()*16000)),origin='http://127.0.0.1:'+port;
let child;async function boot(){child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port,POKER_DATA_DIR:data},stdio:['ignore','pipe','inherit']});await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('server failed')})])}
async function stop(){const ended=once(child,'exit');child.kill();await ended}
try{await boot();for(const name of ['ChessClock','TimeBankTick']){assert.equal((await fetch(origin+'/table-audio/'+name+'.mp3')).status,404,'Native clock sounds remain local-only');assert.equal((await fetch(origin+'/home-art/'+name+'.mp3')).status,404)}const t={id:'qa',name:'QA',stack:240,blind:6,open:false,actionSeconds:45};const save=key=>fetch(origin+'/api/tables',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(t)});
assert.equal((await save('wrong')).status,401);assert.equal(existsSync(join(data,'owner-audit.jsonl')),false);assert.equal((await save(readFileSync(join(data,'owner.key'),'utf8').trim())).status,200);assert.equal((await fetch(origin+'/owner.key')).status,404);
await stop();await boot();const rows=await(await fetch(origin+'/api/tables')).json();assert.deepEqual(rows.find(x=>x.id==='qa'),t);const auth=readFileSync(join(data,'owner.key'),'utf8').trim();
const hosted=async()=>(await(await fetch(origin+'/api/hosted')).json()).find(x=>x.id==='qa');
for(const actionSeconds of [null,'30',4,301,30.5]){const r=await fetch(origin+'/api/tables',{method:'POST',headers:{Authorization:'Bearer '+auth,'Content-Type':'application/json'},body:JSON.stringify({...t,id:'bad-clock',actionSeconds})});assert.equal(r.status,400,'Reject invalid action duration')}
for(const timeBankSeconds of [null,'30',-1,3601,1.5]){const r=await fetch(origin+'/api/tables',{method:'POST',headers:{Authorization:'Bearer '+auth,'Content-Type':'application/json'},body:JSON.stringify({...t,id:'bad-bank',timeBankSeconds})});assert.equal(r.status,400)}
for(const hotTimeSeconds of [null,0,46,1.5]){const r=await fetch(origin+'/api/tables',{method:'POST',headers:{Authorization:'Bearer '+auth,'Content-Type':'application/json'},body:JSON.stringify({...t,id:'bad-bank',timeBankSeconds:60,hotTimeSeconds})});assert.equal(r.status,400)}
const {room}=await hosted();
const req=(op,body,token='')=>fetch(origin+'/api/rooms/'+room+'/'+op,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body)});
assert.equal((await req('join',{name:'Player'})).status,409);
t.open=true;assert.equal((await save(auth)).status,200);
if(process.argv.includes('--plo')||process.argv.includes('--shortdeck')){t.mode=process.argv.includes('--shortdeck')?'shortdeck':'plo';assert.equal((await save(auth)).status,200)}
const players=[];for(let i=0;i<6;i++){const r=await req('join',{name:'Seat '+i,mode:'tournament'});assert.equal(r.status,200);players.push(await r.json());if(i===0){const conflict=await req('join',{name:'Conflicting player',seat:0});assert.equal(conflict.status,409);assert.equal((await hosted()).occupied,1)}}
assert.equal(players[5].tournament,null);assert.equal(players[5].hand.blind,6);assert.deepEqual(players[5].hand.stacks.map((s,i)=>s+players[5].hand.committed[i]),Array(6).fill(240));assert.equal((await hosted()).occupied,6);
assert.deepEqual((await hosted()).seats,players[5].hand.stacks.map((stack,i)=>({name:'Seat '+i,stack})));
t.timeBankSeconds=60;assert.equal((await save(auth)).status,409,'Occupied bank settings locked');delete t.timeBankSeconds;t.actionSeconds=30;assert.equal((await save(auth)).status,409,'Occupied action-clock settings are locked');t.actionSeconds=45;t.blind=8;assert.equal((await save(auth)).status,409);t.blind=6;t.open=false;assert.equal((await save(auth)).status,200);
await stop();await boot();assert.equal((await hosted()).open,false);assert.equal((await req('join',{name:'Late'})).status,409);
const restored=await(await req('state',undefined,players[0].issued)).json();assert.equal(restored.hand.cards[0].length,t.mode==='plo'?4:2);assert.deepEqual(restored.hand.cards.slice(1),Array(5).fill(null));if(t.mode==='shortdeck'){assert.equal(restored.settings.variant,'shortdeck');assert.ok(restored.hand.cards[0].every(c=>/^[6-9TJQKA][cdhs]$/.test(c)));assert.deepEqual(restored.hand.committed,[12,6,6,6,6,6]);}
assert.equal(restored.me,0);assert.equal(restored.hand.blind,6);
if(t.mode==='shortdeck'){
 let state=restored;
 while(!state.hand.end){const i=state.hand.turn;state=await(await req('state',undefined,players[i].issued)).json();const result=await req('act',{version:state.version,action:state.hand.options.due?'call':'check'},players[i].issued);assert.equal(result.status,200);state=await result.json()}
 assert.equal(state.hand.end.payouts.reduce((a,b)=>a+b),72);assert.equal(state.hand.stacks.reduce((a,b)=>a+b),1440);
 console.log('PASS: six hosted Short Deck sessions complete a 72-chip hand with 1440 chips retained');
}
for(const variant of ['plo5','holdem',null,3]){const r=await fetch(origin+'/api/tables',{method:'POST',headers:{Authorization:'Bearer '+auth,'Content-Type':'application/json'},body:JSON.stringify({id:'invalid-variant',name:'Invalid',mode:'tournament',stack:100,blind:4,open:true,variant})});assert.equal(r.status,400)}
for(const prizeShares of [[],[50,40],[0,100],['70',30],[50.5,49.5],[25,25,25,25]]){const r=await fetch(origin+'/api/tables',{method:'POST',headers:{Authorization:'Bearer '+auth,'Content-Type':'application/json'},body:JSON.stringify({id:'invalid-prize',name:'Invalid',mode:'tournament',tournamentSeats:3,stack:100,blind:4,open:true,prizeShares})});assert.equal(r.status,400)}
for(const ante of [-1,100,.5,'1',null])assert.equal((await fetch(origin+'/api/tables',{method:'POST',headers:{Authorization:'Bearer '+auth,'Content-Type':'application/json'},body:JSON.stringify({id:'bad-ante',name:'Bad ante',mode:'tournament',stack:100,blind:4,open:true,ante})})).status,400);assert.equal((await fetch(origin+'/api/tables',{method:'POST',headers:{Authorization:'Bearer '+auth,'Content-Type':'application/json'},body:JSON.stringify({id:'bad-ante',name:'Bad ante',stack:100,blind:4,open:true,ante:1})})).status,400);
for(const levelSeconds of [0,3601,1.5,'60',null])assert.equal((await fetch(origin+'/api/tables',{method:'POST',headers:{Authorization:'Bearer '+auth,'Content-Type':'application/json'},body:JSON.stringify({id:'bad-clock',name:'Bad clock',mode:'tournament',stack:100,blind:4,open:true,levelSeconds})})).status,400);
assert.equal((await fetch(origin+'/api/tables',{method:'POST',headers:{Authorization:'Bearer '+auth,'Content-Type':'application/json'},body:JSON.stringify({id:'bad-clock',name:'Bad clock',stack:100,blind:4,open:true,levelSeconds:60})})).status,400);
Object.assign(t,{id:'friday',name:'Friday',mode:'tournament',open:true,stack:100,blind:4,ante:1,levelSeconds:2});if(process.argv.includes('--event-plo'))t.variant='plo';if(process.argv.includes('--custom-prizes'))t.prizeShares=[70,30];assert.equal((await save(auth)).status,200);
const event=(await(await fetch(origin+'/api/hosted')).json()).find(x=>x.id==='friday');let state;
for(let i=0;i<4;i++){const r=await fetch(origin+'/api/rooms/'+event.room+'/join',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Registrant '+i,mode:'cash'})});assert.equal(r.status,200);state=await r.json()}assert.equal(state.tournament.pool,100);assert.equal(state.hand.blind,4);assert.equal(state.hand.ante,1);assert.deepEqual(state.hand.committed,[1,3,5,1]);t.ante=2;assert.equal((await save(auth)).status,409);t.ante=1;assert.equal(state.tournament.intervalMs,2000);t.levelSeconds=3;assert.equal((await save(auth)).status,409);t.levelSeconds=2;await stop();await boot();assert.equal((await(await fetch(origin+'/api/tables')).json()).find(x=>x.id==='friday').levelSeconds,2);assert.equal((await(await fetch(origin+'/api/tables')).json()).find(x=>x.id==='friday').ante,1);assert.equal((await(await fetch(origin+'/api/rooms/'+event.room+'/watch')).json()).hand.ante,1);
if(process.argv.includes('--custom-prizes')){assert.deepEqual(state.tournament.prizeShares,[70,30]);t.prizeShares=[100];assert.equal((await save(auth)).status,409);t.prizeShares=[70,30]}
if(process.argv.includes('--event-plo')){assert.equal(state.settings.variant,'plo');assert.equal(state.hand.cards[3].length,4);delete t.variant;assert.equal((await save(auth)).status,409);t.variant='plo'}
const audit=readFileSync(join(data,'owner-audit.jsonl'),'utf8'),entries=audit.trim().split('\n').map(JSON.parse);
assert.equal(statSync(join(data,'owner-audit.jsonl')).mode&0o777,0o600);
assert.equal(entries[0].action,'create');assert.equal(entries[0].before,null);
assert.equal(entries.find(e=>e.before?.open===true&&e.after.open===false).after.id,'qa');
assert.ok(!audit.includes(auth));assert.equal((await fetch(origin+'/owner-audit.jsonl')).status,404);
const auditPath=join(data,'owner-audit.jsonl');renameSync(auditPath,auditPath+'.saved');mkdirSync(auditPath);
Object.assign(t,{id:'audit-failure',name:'Audit failure test'});delete t.variant;
const failedAudit=await save(auth);assert.equal(failedAudit.status,200);assert.deepEqual(await failedAudit.json(),{saved:true,auditSaved:false});
assert.ok((await(await fetch(origin+'/api/tables')).json()).some(x=>x.id==='audit-failure'));
rmdirSync(auditPath);renameSync(auditPath+'.saved',auditPath);
assert.equal((await save(auth)).status,200);assert.equal(readFileSync(auditPath,'utf8').trim().split('\n').map(JSON.parse).at(-1).after.id,'audit-failure');
console.log('PASS: audit I/O failure reports saved:true/auditSaved:false; table persists and logging recovers');
assert.equal((await fetch(origin+'/api/owner-audit')).status,401);
assert.equal((await fetch(origin+'/api/owner-audit',{headers:{Authorization:'Bearer '+auth,Origin:'https://example.invalid'}})).status,403);
const auditResponse=await fetch(origin+'/api/owner-audit',{headers:{Authorization:'Bearer '+auth}});
assert.equal(auditResponse.status,200);assert.deepEqual(await auditResponse.json(),readFileSync(auditPath,'utf8').trim().split('\n').slice(-100).map(JSON.parse));
console.log('PASS: audit viewer requires owner key and rejects foreign origin');
console.log('PASS: private owner audit records create and close across restart; rejected writes and credentials excluded');
console.log('PASS: owner-created freezeout accepts four registrations and starts with a 100-credit pool');console.log('PASS: hosted table uses owner settings, counts six seats, locks active limits, closes admission, reconnects after restart');console.log('PASS: unauthorized write rejected, owner save persisted across restart, key inaccessible via HTTP');
}finally{if(child&&child.exitCode===null&&!child.signalCode)await stop();rmSync(data,{recursive:true,force:true})}
