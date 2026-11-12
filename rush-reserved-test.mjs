import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {openRush} from './rush.mjs';
import {reservedChoices,resolveReservedAction} from './betting-preferences.mjs';
for(const variant of ['holdem','plo']){
 const dir=mkdtempSync(join(tmpdir(),'rush-reserved-')),file=join(dir,'pool.json');
 try{
  let request=openRush(file,variant);const state=id=>request(id,'state'),send=(id,op,body={})=>{const s=state(id);return request(id,op,{version:s.version,handVersion:s.handVersion,...body})};
  for(let i=0;i<12;i++)send('p'+i,'join');send('p0','deal');
  const bb=state('p2');assert.equal(bb.hand.quickFoldAllowed,true);assert.equal(bb.hand.preAction.bigBlindOption,true);assert.deepEqual(reservedChoices(bb.hand.preAction),[]);
  while(!state('p0').hand.board.length){const s=state('p0'),id=s.names[s.hand.turn],v=state(id);send(id,'act',{action:v.legal.due?'call':'check'})}
  const free=state('p4');assert.equal(free.hand.quickFoldAllowed,false);assert.equal(free.hand.preAction.rush,true);assert.deepEqual(reservedChoices(free.hand.preAction),['check-fold','check']);assert.throws(()=>send('p4','quick-fold'),/Cannot quick fold/);assert.equal(state('p4').table,free.table);
  send('p1','act',{action:'check',reserved:true});assert.equal(state('p1').hand.preAction.reservedCheck,true);assert.deepEqual(reservedChoices(state('p1').hand.preAction),['check-fold']);assert.equal('reservedChecks' in state('p1').hand,false);assert.equal(state('p2').hand.preAction.reservedCheck,false);
  assert.throws(()=>send('p2','act',{action:'check',reserved:'yes'}),/Invalid reserved/);send('p2','act',{action:'raise',target:4});const facing=state('p4');assert.equal(facing.hand.turn,3);assert.equal(facing.hand.quickFoldAllowed,true);
  const resolved=resolveReservedAction({kind:'check-fold',call:0,number:free.table,seat:free.me},{...facing,number:facing.table});assert.equal(resolved.action,'quick-fold');
  const moved=send('p4',resolved.action);assert.notEqual(moved.table,free.table);assert.deepEqual(moved.names,['p4','p6','p7','p8','p9','p10']);assert.equal(moved.hand.hands.filter(Boolean).length,1);assert.equal(moved.hand.hands[moved.me].length,variant==='plo'?4:2);assert.equal(state('p1').hand.turn,3);assert.equal(state('p1').hand.folded[4],true);
  const settledView=state('p4');request=openRush(file,variant);assert.deepEqual(state('p4').hand,settledView.hand);
  for(const id of ['p1','p4']){for(let n=0;n<100&&state(id).hand;n++){const s=state(id),actor=s.names[s.hand.turn],v=state(actor);send(actor,'act',{action:v.legal.due?'call':'check'})}assert.equal(state(id).table,null);assert.equal('reservedChecks' in state(id).result.hand,false)}
  assert.equal(state('p1').result.hand.end.payouts[4],0);const saved=JSON.parse(readFileSync(file));assert.equal(JSON.parse(saved.pool).players.reduce((sum,[,p])=>sum+p.balance,0),2400);
  console.log('PASS Rush '+variant+' reservations:free blind/Check/Fold rules,private provenance,early transfer,new opponents,restart,payout exclusion and2400 chips');
 }finally{rmSync(dir,{recursive:true,force:true})}
}
