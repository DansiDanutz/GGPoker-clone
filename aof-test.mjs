import assert from 'node:assert/strict';
import {startHand,act,options} from './engine/table.mjs';
const g=startHand(Array(4).fill(32),4,0,'aof');
assert.equal(g.turn,3);assert.equal(g.hands.flat().length,8);
for(const action of ['check','call','raise'])assert.throws(()=>act(g,action,8),/only/);
act(g,'fold');
while(!g.end)act(g,'allin');
assert.equal(g.end.payouts[3],0);assert.equal(g.stacks[3],32);
assert.equal(g.end.payouts.reduce((a,b)=>a+b),96);
assert.equal(g.stacks.reduce((a,b)=>a+b),128);
const fold=startHand(Array(4).fill(32),4,0,'aof');
while(!fold.end)act(fold,'fold');
assert.equal(fold.board.length,0);assert.equal(fold.stacks.reduce((a,b)=>a+b),128);
assert.throws(()=>startHand(Array(6).fill(32),4,0,'aof'),/four/);
console.log('Four-seat AoF engine: only all-in/fold, folded seat excluded, showdown and fold-award conservation');

// AofMainActionUI uses Call when Raise is unavailable, rather than overbetting unmatched chips.
const matched=startHand([20,32,48,48],4,0,'aof');
act(matched,'fold');act(matched,'allin');act(matched,'allin');
assert.equal(matched.turn,2);assert.equal(options(matched).raise,false);assert.equal(options(matched).call,28);
act(matched,'allin');assert.deepEqual(matched.committed,[20,32,32,0]);assert.deepEqual(matched.end.returns,[0,0,0,0]);
assert.equal(matched.stacks[2]-matched.end.payouts[2],16,'Unmatched chips stay in the stack when only Call is available');
assert.equal(matched.history.at(-1),'Seat 3: call 28');assert.equal(matched.stacks.reduce((a,b)=>a+b),148);
const raised=startHand([48,32,20,48],4,0,'aof');act(raised,'fold');assert.equal(options(raised).raise,true);assert.equal(options(raised).max,48);
act(raised,'allin');assert.equal(raised.history.at(-1),'Seat 1: raise to 48');act(raised,'allin');act(raised,'allin');
assert.deepEqual(raised.end.returns,[16,0,0,0]);assert.equal(raised.stacks.reduce((a,b)=>a+b),148);
console.log('PASS source AoF action contract: maximum legal raise, call-only matching, uncommitted excess and actual uncalled return');
