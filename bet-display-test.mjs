import assert from 'node:assert/strict';
import {bbValue,chipsFromBetInput} from './betting-preferences.mjs';
for(const [chips,blind,want] of [[4,4,1],[6,4,1.5],[9,4,2.3],[14,6,2.3],[1,20,.1],[4000,4,1000]])assert.equal(bbValue(chips,blind),want);
for(const [text,factor,want] of [['9',1,9],['2.25',4,9],['1.5',4,6],['2.3',4,null],['9.5',1,null],['',4,null],['bad',4,null],['1e3',4,null],['-1',4,null],['0.1666666666667',6,1]])assert.equal(chipsFromBetInput(text,factor),want);
console.log('PASS native one-decimal BB rounding and exact whole-chip input conversion; invalid/fractional-chip input rejected');
