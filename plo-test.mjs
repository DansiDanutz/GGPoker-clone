import assert from 'node:assert/strict';
import {startHand,options,act,omahaRank} from './engine/table.mjs';
const board=['Ah','Kh','Qh','Jh','Th'];
assert.equal(omahaRank(['2c','3d','4s','5c'],board)[0],0);
assert.equal(omahaRank(['9h','8h','4s','5c'],board)[0],8);
const g=startHand(Array(6).fill(120),4,0,'plo');
assert.deepEqual(g.hands.map(h=>h.length),Array(6).fill(4));
assert.equal(options(g).max,14);
assert.throws(()=>act(g,'raise',15),/Illegal/);
act(g,'raise',14);
assert.equal(options(g).max,48);
while(!g.end)act(g,options(g).due?'call':'check');
assert.equal(g.board.length,5);
assert.equal(g.end.payouts.reduce((a,b)=>a+b),84);
assert.equal(g.stacks.reduce((a,b)=>a+b),720);
console.log('Six-seat PLO: deal, pot caps, showdown and chip conservation passed');
for(const count of [5,6]){
 const h=startHand(Array(6).fill(120),4,0,'plo'+count);
 assert.equal(new Set(h.hands.flat()).size,6*count);
 assert.equal(options(h).max,14);
 while(!h.end)act(h,options(h).due?'call':'check');
 assert.equal(h.stacks.reduce((a,b)=>a+b),720);
 const hole=['2c','3d','4s','9h',...(count===6?['6d']:[]),'8h'];
 assert.equal(omahaRank(hole,board)[0],8);
 assert.notEqual(omahaRank(hole.slice(0,-1),board)[0],8);
}
assert.throws(()=>startHand(Array(8).fill(120),4,0,'plo6'),/deck/);
console.log('PLO-5 and PLO-6: extra winning card, pot cap, unique deal and chip conservation passed');
// TDA 56-B: short all-in blinds count as full blinds for preflop pot sizing.
for(const variant of ['plo','plo5','plo6']){
 const short=startHand([10000,10000,100],200,0,variant);assert.equal(options(short).max,700,'Short BB must retain 3.5-BB opening cap');assert.throws(()=>act(short,'raise',701),/Illegal/);act(short,'raise',700);assert.equal(options(short).max,2300,'Re-pot keeps nominal blind adjustment');act(short,'call');assert.equal(short.board.length,3);assert.equal(short.committed.reduce((a,b)=>a+b),1500);assert.equal(options(short).max,1500,'Postflop uses actual funded pot only');while(!short.end)act(short,options(short).due?'call':'check');assert.equal(short.end.payouts.reduce((a,b)=>a+b),1500);assert.equal(short.stacks.reduce((a,b)=>a+b),20100);
 const small=startHand([10000,50,10000],200,0,variant);assert.equal(options(small).max,700,'Short SB must retain full-blind cap');
 const both=startHand([10000,50,100,10000],200,0,variant);assert.equal(options(both).max,700,'Both short blinds retain full-blind cap');
}
console.log('PLO variants: short blind opening/re-pot caps, actual postflop pot, overbet rejection and conserved payouts passed');
