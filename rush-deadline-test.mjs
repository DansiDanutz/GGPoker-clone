import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRush} from './rush.mjs';
const dir=mkdtempSync(join(tmpdir(),'rush-clock-')),clock=Date.now;let now=clock();Date.now=()=>now;
try{
 let request=openRush(join(dir,'timeout.json'));
 const send=(id,op,body={})=>{const s=request(id,'state');return request(id,op,{version:s.version,handVersion:s.handVersion,...body})};
 for(let i=0;i<6;i++)send('p'+i,'join');let s=send('p0','deal');
 request.tick();s=request('p0','state');const actor=s.names[s.hand.turn],deadline=s.hand.deadline,history=s.hand.history.length;
 now=deadline-1;request.tick();assert.equal(request('p0','state').hand.history.length,history);
 request=openRush(join(dir,'timeout.json'));assert.equal(request('p0','state').hand.deadline,deadline);
 now=deadline;request.tick();s=request('p0','state');assert.ok(s.hand.history.at(-1).includes('fold'));assert.ok(s.hand.folded[s.names.indexOf(actor)]);
 while(s.hand.turn!==2){const id=s.names[s.hand.turn],v=request(id,'state');send(id,'act',{action:v.legal.due?'call':'check'});s=request('p0','state')}
 request.tick();const checkDeadline=request('p0','state').hand.deadline;now=checkDeadline;request.tick();s=request('p0','state');
 assert.equal(s.hand.folded[2],false);assert.ok(s.hand.history.at(-1).includes('check'));
 // A quick-folded player keeps their queue position through recovery.
 request=openRush(join(dir,'queue.json'));
 for(let i=0;i<6;i++)send('q'+i,'join');send('q0','deal');s=send('q0','quick-fold');assert.equal(s.table,null);assert.equal(s.queued,true);
 request=openRush(join(dir,'queue.json'));
 for(let i=6;i<11;i++)send('q'+i,'join');request.tick();s=request('q0','state');assert.ok(s.table);assert.equal(s.queued,false);
 assert.deepEqual(s.names,['q0','q6','q7','q8','q9','q10']);
 // A cancelled queue must not pull the player into somebody else's match.
 request=openRush(join(dir,'cancel.json'));
 for(let i=0;i<6;i++)send('c'+i,'join');send('c0','deal');send('c0','quick-fold');send('c0','cancel-queue');
 request=openRush(join(dir,'cancel.json'));
 for(let i=6;i<12;i++)send('c'+i,'join');s=send('c6','deal');assert.ok(s.table);assert.ok(!s.names.includes('c0'));assert.equal(request('c0','state').table,null);
 const saved=JSON.parse(JSON.parse(readFileSync(join(dir,'cancel.json'),'utf8')).pool);
 assert.equal(saved.players.length,12);
 console.log('PASS Rush clock/queue: persisted 90s deadline, fold when facing bet, check when free, recovered auto-match, cancelled player excluded');
}finally{Date.now=clock;rmSync(dir,{recursive:true,force:true})}
