import assert from 'node:assert/strict';
import {computerMove} from './rooms.mjs';
const cards=['7h','2s'], opt={due:0,raise:true,min:4};
assert.deepEqual(computerMove(cards,[],4,0,opt),['check']);
assert.deepEqual(computerMove(cards,['7s','3c','Jh'],4,0,opt),['raise',4]);
assert.deepEqual(computerMove(cards,[],4,20,{...opt,due:20}),['fold']);
assert.deepEqual(computerMove(['Ac','As'],[],4,4,{due:4,raise:false}),['call']);
assert.deepEqual(computerMove(['Ah','Kh'],['2h','4h','8h','3c'],4,40,{due:40,raise:false}),['call']);
