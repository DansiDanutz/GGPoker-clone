import assert from 'node:assert/strict';
import {startHand,quickFold,act,options,canQuickFold} from './engine/table.mjs';
const g=startHand(Array(6).fill(100),4,0,'rush');
const turn=g.turn,committed=[...g.committed],stacks=[...g.stacks];
assert.notEqual(turn,0);quickFold(g,0);
assert.equal(g.turn,turn);assert.equal(g.folded[0],true);
assert.deepEqual(g.committed,committed);assert.deepEqual(g.stacks,stacks);
assert.throws(()=>quickFold(g,0),/Cannot/);
while(!g.end)act(g,options(g).due?'call':'check');
assert.equal(g.end.payouts[0],0);assert.equal(g.stacks.reduce((a,b)=>a+b),600);
const fold=startHand(Array(6).fill(100),4,0,'rush');
for(const i of [0,1,3,4,5])quickFold(fold,i);
assert.ok(fold.end);assert.equal(fold.stacks.reduce((a,b)=>a+b),600);
assert.throws(()=>quickFold(startHand([100,100]),0),/Cannot/);
assert.throws(()=>quickFold(startHand(Array(6).fill(100),4,0,'plo'),0),/Cannot/);
console.log('PASS Rush engine: out-of-turn fold, unchanged contributions, folded payout exclusion and last-player award');
for(const variant of ['rush','plo']){
 const native=startHand(Array(6).fill(100),4,0,variant);native.rush=true;const blind=native.bigBlindSeat;
 assert.equal(canQuickFold(native,blind),true,'Unacted preflop big blind may quick fold for no additional chips');const paid=native.committed[blind],balance=native.stacks[blind];quickFold(native,blind);assert.equal(native.committed[blind],paid);assert.equal(native.stacks[blind],balance);assert.equal(native.folded[blind],true);while(!native.end)act(native,options(native).due?'call':'check');assert.equal(native.end.payouts[blind],0);assert.equal(native.stacks.reduce((a,b)=>a+b,0),600);
 const free=startHand(Array(6).fill(100),4,0,variant);free.rush=true;while(!free.board.length)act(free,options(free).due?'call':'check');const seat=(free.turn+2)%6;
 assert.equal(canQuickFold(free,seat),false,'Free postflop action requires reservation rather than immediate transfer');assert.throws(()=>quickFold(free,seat),/Cannot/);act(free,'raise',4);assert.equal(canQuickFold(free,seat),true,'A later bet enables quick fold');quickFold(free,seat);while(!free.end)act(free,options(free).due?'call':'check');assert.equal(free.stacks.reduce((a,b)=>a+b,0),600);
}
console.log('PASS native Rush fold eligibility: Holdem/PLO free big blind, posted-chip retention, free flop rejection, later bet and payouts');
