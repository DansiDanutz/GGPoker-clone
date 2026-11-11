import assert from 'node:assert/strict';
import {startHand,act,options} from './engine/table.mjs';
const g=startHand([50,14,70,60],4,0);
act(g,'raise',12);act(g,'call');act(g,'raise',14);
act(g,'call');assert.equal(options(g).raise,false);
assert.throws(()=>act(g,'raise',30));act(g,'call');act(g,'call');
assert.equal(g.board.length,3);assert.equal(g.turn,2);
let count=0;
while(!g.end){assert.ok(count++<20);act(g,'check')}
assert.equal(g.board.length,5);assert.equal(g.stacks.reduce((a,b)=>a+b),194);
console.log('PASS: short all-in did not reopen betting, streets and showdown completed');
