import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'show-cards-'));
try{for(const [variant,count]of [['cash',2],['plo',4],['plo5',5],['plo6',6]]){
 const file=join(dir,variant+'.json'),id='e'.repeat(48),table={name:'Show',stack:120,blind:4,mode:variant,open:true};let req=openRooms(file);const account=i=>variant==='cash'?'Account'+i:undefined;const tokens=Array.from({length:6},(_,i)=>req(id,'join',null,{name:'P'+i},table,account(i)).issued),state=i=>req(id,'state',tokens[i],{},table),watch=()=>req(id,'watch',null,{},table);let s=state(0);
 const show=(i,indices,extra={})=>req(id,'show-cards',tokens[i],{number:s.number,version:s.version,indices,...extra},table,account(i));
 assert.throws(()=>show(0,[0]),e=>e.status===409,'Cannot show during active hand');
 while(!s.hand.end){const i=s.hand.turn,o=state(i).hand.options;s=req(id,'act',tokens[i],{version:s.version,action:i===1&&o.due?'fold':o.due?'call':'check'},table)}
 if(account(1)){for(const cookie of [undefined,account(0)])assert.throws(()=>req(id,'show-cards',tokens[1],{number:s.number,version:s.version,indices:[0]},table,cookie),e=>e.status===401)}
 const own=state(1).hand.cards[1],before=structuredClone(s.hand),version=s.version;assert.equal(own.length,count);assert.equal(watch().hand.cards[1],null);
 for(const indices of [null,[],Array(1),[0,0],[-1],[count],[.5],['0']])assert.throws(()=>show(1,indices),e=>e.status===400);
 assert.throws(()=>req(id,'show-cards',null,{number:s.number,version:s.version,indices:[0]},table),e=>e.status===401);
 assert.throws(()=>show(1,[0],{number:s.number-1}),e=>e.status===409);
 assert.equal(state(0).version,version,'Rejected reveals never change version');
 s=show(1,[0]);const partial=Array(count).fill(null);partial[0]=own[0];assert.deepEqual(watch().hand.cards[1],partial);assert.deepEqual(state(1).hand.cards[1],own);assert.deepEqual(s.hand.end,before.end);assert.deepEqual(s.hand.stacks,before.stacks);assert.deepEqual(s.hand.committed,before.committed);assert.equal(s.version,version+1);
 assert.deepEqual(req(id,'notes',tokens[0],{},table,account(0)).players.find(p=>p.seat===1).hands[0].cards[1],partial,'Public history shows only selected original index');
 assert.equal(show(1,[0]).version,s.version,'Same selection retry is idempotent');assert.throws(()=>show(1,[1]),e=>e.status===409,'Cannot replace selection');
 req=openRooms(file);assert.deepEqual(watch().hand.cards[1],partial,'Partial reveal survives cold room reopen');assert.deepEqual(state(1).hand.cards[1],own);assert.equal(JSON.stringify(watch()).includes('publicCards'),false);
 for(let i=0;i<6;i++)s=req(id,'ready',tokens[i],{number:s.number,version:s.version},table);
 assert.equal(watch().hand.cards[1],null,'Selection never carries into a new hand');
 while(!s.hand.end){const i=s.hand.turn,o=state(i).hand.options;s=req(id,'act',tokens[i],{version:s.version,action:i!==0?'fold':o.raise?'raise':o.due?'call':'check',target:o.min},table)}
 assert.equal(watch().hand.cards[0],null);const end=structuredClone(s.hand.end),whole=state(0).hand.cards[0];s=show(0,Array.from({length:count},(_,i)=>i));assert.deepEqual(watch().hand.cards[0],whole);assert.deepEqual(s.hand.end,end);assert.equal(watch().hand.cards[1],null);

 }
 console.log('PASS voluntary show cards:four variants,private originals,partial public selection,history,restart,invalid/stale/auth guards,idempotency and unchanged payouts');
}finally{rmSync(dir,{recursive:true,force:true})}
