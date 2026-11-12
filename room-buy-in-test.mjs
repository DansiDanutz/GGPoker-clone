import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'buy-in-')),file=join(dir,'rooms.json'),id='c'.repeat(48),table={name:'Range',stack:120,blind:4,open:true,minBuyIn:80,maxBuyIn:240};
try{
 let room=openRooms(file);
 for(const buyIn of [0,79,241,100.5,'100',null])assert.throws(()=>room(id,'join',null,{name:'Invalid',buyIn},table),e=>e.status===400);
 assert.equal(room(id,'summary',null,{},table).occupied,0);
 const a=room(id,'join',null,{name:'Small',seat:2,buyIn:80},table),b=room(id,'join',null,{name:'Large',seat:5,buyIn:240},table);
 assert.equal(room(id,'summary',null,{},table).seats[2].stack,80);assert.equal(room(id,'summary',null,{},table).seats[5].stack,240);
 let s=room(id,'start',a.issued,{version:b.version},table);assert.deepEqual(s.hand.stacks.map((n,i)=>n+s.hand.committed[i]),[0,0,80,0,0,240]);const hand=JSON.parse(JSON.stringify(s.hand));
 const late=room(id,'join',null,{name:'Waiting',seat:0,buyIn:100},table);assert.deepEqual(room(id,'state',a.issued,{},table).hand,hand);assert.equal(late.waitingForHand,true);
 room=openRooms(file);assert.equal(room(id,'state',late.issued,{},table).buyIns[0],100);
 s=room(id,'state',a.issued,{},table);s=room(id,'act',a.issued,{version:s.version,action:'fold'},table);assert.equal(s.hand.stacks.reduce((a,b)=>a+b),320);
 for(const token of [a.issued,b.issued,late.issued]){s=room(id,'state',token,{},table);s=room(id,'ready',token,{version:s.version,number:s.number},table)}
 assert.equal(s.number,2);assert.equal(s.hand.stacks.reduce((n,v,i)=>n+v+s.hand.committed[i],0),420);assert.equal(s.hand.stacks[0]+s.hand.committed[0],100);
 const topped='f'.repeat(48),joinA=room(topped,'join',null,{name:'Top up',seat:0,buyIn:80},table),joinB=room(topped,'join',null,{name:'Other',seat:1,buyIn:80},table);
 let top=room(topped,'start',joinA.issued,{version:joinB.version},table);
 assert.throws(()=>room(topped,'ready',joinA.issued,{version:top.version,number:top.number,topUpTo:240},table),e=>e.status===409);
 top=room(topped,'act',joinA.issued,{version:top.version,action:'fold'},table);const finished=structuredClone(top.hand),ready={version:top.version,number:top.number};
 for(const topUpTo of [79,241,1.5,'240',null])assert.throws(()=>room(topped,'ready',joinA.issued,{...ready,topUpTo},table),e=>e.status===400);
 room(topped,'ready',joinA.issued,{...ready,topUpTo:240},table);assert.deepEqual(room(topped,'state',joinA.issued,{},table).hand,finished);
 room(topped,'ready',joinA.issued,{...ready,topUpTo:80},table);room=openRooms(file);
 top=room(topped,'ready',joinB.issued,{...ready,topUpTo:80},table);assert.equal(top.number,2);assert.deepEqual(top.topUps,[]);top=room(topped,'state',joinA.issued,{},table);assert.equal(top.hand.stacks[0]+top.hand.committed[0],240);assert.equal(top.hand.stacks[1]+top.hand.committed[1],82);assert.equal(top.topUps.at(-1).added,162);assert.equal(top.topUps.at(-1).before,78);assert.equal(top.topUps.at(-1).after,240);
 assert.equal(top.hand.stacks.reduce((n,v,i)=>n+v+top.hand.committed[i],0),322);assert.deepEqual(top.results.at(-1).stacks,finished.stacks);
 room=openRooms(file);assert.equal(room(topped,'state',joinA.issued,{},table).topUps.at(-1).added,162);
 const resetId='b'.repeat(48),resetA=room(resetId,'join',null,{name:'Ready then reset',buyIn:80},table),resetB=room(resetId,'join',null,{name:'Leaving',buyIn:80},table);let reset=room(resetId,'start',resetA.issued,{version:resetB.version},table);reset=room(resetId,'act',resetA.issued,{version:reset.version,action:'fold'},table);reset=room(resetId,'ready',resetA.issued,{version:reset.version,number:reset.number,topUpTo:240},table);room(resetId,'leave',resetB.issued,{version:reset.version},table);const replacement=room(resetId,'join',null,{name:'Replacement',buyIn:80},table);reset=room(resetId,'start',resetA.issued,{version:replacement.version},table);assert.equal(reset.hand.stacks[0]+reset.hand.committed[0],78,'Cancelled readiness must cancel pending top-up');
 const fixed='d'.repeat(48),fixedTable={name:'Fixed',stack:120,blind:4,open:true};assert.throws(()=>room(fixed,'join',null,{name:'Invalid',buyIn:240},fixedTable),e=>e.status===400);assert.equal(room(fixed,'join',null,{name:'Default'},fixedTable).settings.stack,120);
 for(const [n,mode]of ['plo','plo5','plo6'].entries()){const variantId=('e'+n).repeat(24),variantTable={...table,mode};const first=room(variantId,'join',null,{name:'Small',buyIn:80},variantTable),second=room(variantId,'join',null,{name:'Large',buyIn:240},variantTable);const started=room(variantId,'start',first.issued,{version:second.version},variantTable);assert.equal(started.hand.cards[0].length,4+n);assert.equal(started.hand.stacks.reduce((sum,v,i)=>sum+v+started.hand.committed[i],0),320)}
 console.log('PASS buy-ins: limits/types, no invalid reservation, selected unequal stacks, pending seat preserves hand, restart, next-deal funding, chip conservation and fixed-table compatibility');
}finally{rmSync(dir,{recursive:true,force:true})}
