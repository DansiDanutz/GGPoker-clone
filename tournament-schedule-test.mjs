import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'event-schedule-')),clock=Date.now;let now=clock();Date.now=()=>now;
try{
 const id='c'.repeat(48),file=join(dir,'rooms.json'),table={mode:'tournament',tournamentSeats:6,name:'Scheduled',stack:100,blind:4,open:true,startsAt:now+10000};
 let room=openRooms(file);const req=(op,token,body={})=>room(id,op,token,body,table);
 const a=req('join',null,{name:'First',seat:2}),b=req('join',null,{name:'Second',seat:5});
 assert.equal(b.hand,null);room=openRooms(file);now=table.startsAt-1;req('tick');assert.equal(req('state',a.issued).hand,null);
 now++;req('tick');let s=req('state',a.issued);assert.ok(s.hand);assert.equal(s.tournament.startedAt,now);
 assert.deepEqual(s.hand.stacks.map((n,i)=>n+s.hand.committed[i]),[0,0,100,0,0,100]);
 assert.equal(s.tournament.pool,50);assert.throws(()=>req('join',null,{name:'Late'}),/registration/i);
 assert.equal(req('state',b.issued).me,5);room=openRooms(file);assert.deepEqual(req('state',a.issued).hand.stacks,s.hand.stacks);
 const tokens={2:a.issued,5:b.issued};
 for(let i=0;i<100&&s.tournament.winner===null;i++){
  if(s.hand.end){now+=3100;s=req('state',a.issued);continue}
  const token=tokens[s.hand.turn],v=req('state',token),o=v.hand.options;
  s=req('act',token,{version:v.version,action:o.raise?'raise':o.due?'call':'check',target:o.max});
 }
 assert.notEqual(s.tournament.winner,null);assert.equal(s.hand.stacks.reduce((a,b)=>a+b),200);assert.equal(s.tournament.prizes.reduce((a,b)=>a+b),50);
 assert.deepEqual(s.tournament.finishes.filter(Boolean).sort(),[1,2]);
 const cancelled='d'.repeat(48),table2={...table,startsAt:now+10000};
 const one=room(cancelled,'join',null,{name:'Only'},table2);now=table2.startsAt;room(cancelled,'tick',null,{},table2);
 s=room(cancelled,'state',one.issued,{},table2);assert.equal(s.hand,null);assert.ok(s.tournament.cancelledAt);assert.equal(s.tournament.pool,0);assert.deepEqual(s.tournament.refunds,[25,0,0,0,0,0]);
 assert.throws(()=>room(cancelled,'join',null,{name:'Too late'},table2),/registration/i);
 const empty='e'.repeat(48);room(empty,'tick',null,{},table2);
 assert.equal(room(empty,'summary',null,{},table2).cancelled,true);
 const paid='b'.repeat(48),paidTable={...table,startsAt:now+1000,prizeShares:[50,30,20]};
 room(paid,'join',null,{name:'One'},paidTable);room(paid,'join',null,{name:'Two'},paidTable);now=paidTable.startsAt;room(paid,'tick',null,{},paidTable);
 assert.equal(room(paid,'summary',null,{},paidTable).cancelled,true);
 const future='f'.repeat(48),futureTable={...table,startsAt:now+6*3600000};
 const waiting=room(future,'join',null,{name:'Early'},futureTable);now+=5*3600000;
 assert.equal(room(future,'state',waiting.issued,{},futureTable).tournament.pool,25);
 console.log('PASS scheduled tournament: exact start boundary, two funded seats of six, restart, lockout, one-player cancellation and entry refunds');
}finally{Date.now=clock;rmSync(dir,{recursive:true,force:true})}
