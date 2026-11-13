import assert from 'node:assert/strict';import {rabbitCards,startHand,act} from './engine/table.mjs';
for(const [board,expected]of [[[],['8h','9h','Th','Qh','Ah']],[['2c','3c','4c'],['8h','Th']],[['2c','3c','4c','5c'],['8h']]]){
 const g={end:{},board:[...board],deck:['Ah','Kh','Qh','Jh','Th','9h','8h','7h']},before=structuredClone(g);
 assert.deepEqual(rabbitCards(g),expected);assert.deepEqual(g,before);
}
assert.throws(()=>rabbitCards({board:[],deck:[]}),/finished/);assert.throws(()=>rabbitCards({end:{},board:['2c','3c','4c','5c','6c'],deck:[]}),/complete/);assert.throws(()=>rabbitCards({end:{},board:[],deck:['2c']}),/deck/);
const g=startHand([100,100,100]);while(!g.end)act(g,'fold');const before=structuredClone(g);assert.equal(rabbitCards(g).length,5);assert.deepEqual(g,before);assert.equal(g.stacks.reduce((a,b)=>a+b,0),300);
console.log('PASS Rabbit runout: preflop/flop/turn burns and draw order, no deck/board/result mutation, active/full-board/insufficient-deck guards and actual folded hand/300 chips');
