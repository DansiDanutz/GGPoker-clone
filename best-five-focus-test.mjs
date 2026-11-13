import assert from 'node:assert/strict';
import {bestFiveFocus} from './engine/hand.mjs';
assert.deepEqual(bestFiveFocus(['As','Ad'],['Ah','Kh','Qh','Jh','Th']),{hole:[],board:[0,1,2,3,4]});
assert.deepEqual(bestFiveFocus(['Ah','Ad'],['Ac','Kh','Qd','Js','Tc']),{hole:[1],board:[1,2,3,4]},'Native equal-rank ordinal sum prefers diamonds over hearts');
for(const count of [4,5,6])assert.deepEqual(bestFiveFocus(['9h','8h','2c','3c','3d','7d'].slice(0,count),['Ah','Kh','Qh','Jh','Th']),{hole:[0,1],board:[2,3,4]},'Omaha must use exactly two hole cards');
assert.deepEqual(bestFiveFocus(['Ah','Kh'],['6c','7d','8s','9h','Qd'],true),{hole:[0],board:[0,1,2,3]});
assert.deepEqual(bestFiveFocus(['Ah','Kh'],['Qh','Jh','9h','As','Ad'],true),{hole:[0,1],board:[0,1,2]});
assert.deepEqual(bestFiveFocus(['Ah','Ad'],['Ac','As','Ks','Kd','6s']),{hole:[0,1],board:[0,1,2]},'Both hole cards and highest-suit kicker');
assert.deepEqual(bestFiveFocus(['As','Ad'],['Ah','Kh','Qh']),{hole:[0,1],board:[0,1,2]},'Flop uses exactly the five known cards');
assert.deepEqual(bestFiveFocus(['Ah','Ad'],['Ac','Kh','Qd','Js']),{hole:[0,1],board:[0,1,2]},'Turn excludes the weakest known kicker');
for(const count of [4,5,6])for(const board of [['Ah','Kh','Qh'],['Ah','Kh','Qh','Jh']]){const own=['9h','8h','2c','3c','3d','7d'].slice(0,count);assert.deepEqual(bestFiveFocus(own,board),{hole:[0,1],board:[0,1,2]},'Omaha flop/turn use exactly two own cards and three known board cards')}
assert.deepEqual(bestFiveFocus(['Ah','Kh'],['6c','7d','8s','9h'],true),{hole:[0],board:[0,1,2,3]},'Short Deck turn ace-low straight uses known cards only');
const h=['As','Ad'],b=['Ah','Kh','Qh','Jh','Th'],saved=JSON.stringify([h,b]);bestFiveFocus(h,b);assert.equal(JSON.stringify([h,b]),saved);
for(const [hole,board,short]of [[[],b,false],[['As'],b,false],[['As','Ad','Ac'],b,false],[h,b.slice(0,2),false],[h,['As',...b.slice(1)],false],[h,['2c',...b.slice(1)],true],[h,b,'true']])assert.throws(()=>bestFiveFocus(hole,board,short));
console.log('PASS native flop/turn/river best-five indices, board-only Holdem, diamond/heart tie rule, exact-two Omaha4/5/6, short deck and input guards');
