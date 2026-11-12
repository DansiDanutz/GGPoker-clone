import assert from 'node:assert/strict';
import { startHand, act, nextDealer } from './engine/table.mjs';

const g = startHand([30, 70, 100, 100], 4, 0);
g.hands = [['Ac','Ad'], ['Kc','Kh'], ['Qc','Qd'], ['Jc','Jd']];
g.deck = ['7s','2c','4d','6h','5c','8s','Kd','Tc'].reverse();

act(g,'call');       // Seat 4 puts in 4.
act(g,'raise',30);   // Seat 1: aces, all in.
act(g,'raise',70);   // Seat 2: kings, all in.
act(g,'raise',100);  // Seat 3: queens, short all-in raise.
act(g,'fold');       // Seat 4 folds; its 4 chips stay in the main pot.

// Assertions
if (JSON.stringify(g.committed) !== JSON.stringify([30, 70, 100, 4])) {
  throw new Error('committed mismatch: ' + JSON.stringify(g.committed));
}
if (!g.end) throw new Error('end not set');
if (JSON.stringify(g.end.returns) !== JSON.stringify([0, 0, 30, 0])) {
  throw new Error('returns mismatch: ' + JSON.stringify(g.end.returns));
}
if (JSON.stringify(g.end.payouts) !== JSON.stringify([94, 80, 30, 0])) {
  throw new Error('payouts mismatch: ' + JSON.stringify(g.end.payouts));
}
if (JSON.stringify(g.stacks) !== JSON.stringify([94, 80, 30, 96])) {
  throw new Error('stacks mismatch: ' + JSON.stringify(g.stacks));
}
if (g.board.length !== 5) throw new Error('board length wrong: ' + g.board.length);

console.log('PASS: no-limit integration acceptance');

// When the field drops to heads-up, the next live seat after the old big blind posts it.
assert.equal(nextDealer([0,30,40,50],{button:3,bigBlindSeat:1}),1);
assert.equal(nextDealer([0,30,0,50],{button:0,bigBlindSeat:1}),1);
assert.equal(nextDealer([0,30,0,50],{button:1,bigBlindSeat:3}),3);
