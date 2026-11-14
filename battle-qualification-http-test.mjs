import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const directory=mkdtempSync(join(tmpdir(),'battle-qualification-http-')),probe=createServer();
await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
const origin='http://127.0.0.1:'+port,runtime=resolve(process.env.POKER_RUNTIME_DIR||'.'),cookies=[],pause=ms=>new Promise(r=>setTimeout(r,ms));let child;
const settings={id:'qualify-http',name:'Qualification HTTP',capacity:12,stack:100,blind:4,finalSeats:3,rushDurationMs:1,entryCost:25};
async function boot(){child=spawn(process.execPath,[join(runtime,'server.mjs')],{cwd:runtime,env:{...process.env,PORT:String(port),POKER_BIND_HOST:'127.0.0.1',POKER_PUBLIC_ORIGIN:origin,POKER_REFERENCE_HOME:'1',POKER_DATA_DIR:directory},stdio:['ignore','ignore','inherit']});for(let i=0;i<200;i++){if(child.exitCode!==null)throw Error('Server exited');try{if((await fetch(origin+'/api/tables')).ok)return}catch{}await pause(25)}throw Error('Server did not start')}
async function stop(){if(child?.exitCode===null&&!child.signalCode){const done=once(child,'exit');child.kill();await done}}
const api=(i,op,body)=>fetch(origin+'/api/battle/'+settings.id+'/'+op,{method:op==='state'?'GET':'POST',headers:{Cookie:cookies[i],Origin:origin,'Content-Type':'application/json'},body:op==='state'?undefined:JSON.stringify(body)});
const state=async i=>{const r=await api(i,'state');assert.equal(r.status,200);return r.json()};
try{
 await boot();const key=readFileSync(join(directory,'owner.key'),'utf8').trim();
 assert.equal((await fetch(origin+'/api/owner-battle',{method:'POST',headers:{Origin:origin,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(settings)})).status,200);
 for(let i=0;i<12;i++){const r=await fetch(origin+'/local/create',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({name:'QualifyPlayer'+i,pin:'123456'})});assert.equal(r.status,200);cookies.push(r.headers.get('set-cookie').split(';')[0]);assert.equal((await api(i,'register',{})).status,200)}
 let view;for(let i=0;i<200;i++){view=await state(0);if(view.phase==='final-ready')break;await pause(50)}
 assert.equal(view.phase,'final-ready');const q=view.qualification;assert.equal(q.qualified.length,3);assert.equal(q.qualified.reduce((n,p)=>n+p.stack,0),1200);assert.ok(q.serial>0);assert.deepEqual(q.direct.map(p=>p.id),['qualifyplayer0','qualifyplayer1']);
 assert.equal(q.lastHand.hand.deck,undefined);assert.equal(q.lastHand.hand.hands,undefined);
 for(let i=0;i<12;i++){const v=await state(i);assert.deepEqual(v.qualification,q);assert.equal((await api(i,'deal',{revision:v.revision,session:v.session})).status,409);assert.equal((await(await fetch(origin+'/local/wallet',{headers:{Cookie:cookies[i]}})).json()).available,9975)}
 assert.equal((await fetch(origin+'/api/battle/'+settings.id+'/state')).status,401);
 const saved=readFileSync(join(directory,'rooms.json'));await stop();await boot();assert.deepEqual(await state(0),view);await pause(1100);assert.deepEqual(readFileSync(join(directory,'rooms.json')),saved);
 const finalBody={revision:view.revision,session:view.session};
 assert.equal((await api(0,'final-room',{...finalBody,session:'wrong'})).status,401);
 assert.equal((await api(0,'final-room',{...finalBody,revision:view.revision-1})).status,409);
 const loser=cookies.findIndex((_,i)=>!q.qualified.some(p=>p.id==='qualifyplayer'+i)),loserView=await state(loser);
 assert.equal((await api(loser,'final-room',{revision:loserView.revision,session:loserView.session})).status,403);
 const entrants=[];let room;
 for(const p of q.qualified){const i=Number(p.id.replace('qualifyplayer','')),v=await state(i),r=await api(i,'final-room',{revision:v.revision,session:v.session});assert.equal(r.status,200,await r.clone().text());const entry=await r.json();room??=entry.room;assert.equal(entry.room,room);assert.match(entry.issued,/^[a-f0-9]{64}$/);entrants.push({i,token:entry.issued})}
 const roomApi=(seat,op,body)=>fetch(origin+'/api/rooms/'+room+'/'+op,{method:op==='state'?'GET':'POST',headers:{Cookie:cookies[entrants[seat].i],Origin:origin,Authorization:'Bearer '+entrants[seat].token,'Content-Type':'application/json'},body:op==='state'?undefined:JSON.stringify(body)});
 let hand=await(await roomApi(0,'state')).json(),moves=0;assert.deepEqual(hand.hand.stacks.map((n,i)=>n+hand.hand.committed[i]),q.qualified.map(p=>p.stack));
 while(!hand.hand.end){const seat=hand.hand.turn,own=await(await roomApi(seat,'state')).json(),o=own.hand.options;assert.equal((await roomApi(seat,'act',{version:own.version,action:o.due?'call':'check'})).status,200);hand=await(await roomApi(0,'state')).json();if(++moves>50)throw Error('Final hand stalled')}
 assert.equal(hand.hand.stacks.reduce((a,b)=>a+b),1200);await stop();await boot();assert.deepEqual((await(await roomApi(0,'state')).json()).hand.end,hand.hand.end);
 let savedNumber;for(let i=0;i<100;i++){savedNumber=new Map(JSON.parse(readFileSync(join(directory,'rooms.json')))).get(room).number;if(savedNumber>hand.number)break;await pause(50)}assert.equal(savedNumber,hand.number+1);const next=await(await roomApi(0,'state')).json();assert.equal(next.number,hand.number+1);assert.equal(next.hand.stacks.reduce((a,b)=>a+b)+next.hand.committed.reduce((a,b)=>a+b),1200);assert.deepEqual(next.results.find(r=>r.number===hand.number).payouts,hand.hand.end.payouts);
 for(let i=0;i<12;i++)assert.equal((await(await fetch(origin+'/local/wallet',{headers:{Cookie:cookies[i]}})).json()).available,9975);
 console.log('PASS Battle qualification/final HTTP: twelve accounts, automatic all-in qualification, session/revision/qualified entry guards, fixed private final seats, full hand1200chips, unchanged wallets and both-stage restart');
}finally{await stop();rmSync(directory,{recursive:true,force:true})}
