import assert from 'node:assert/strict';
import {handDraw} from './engine/hand.mjs';
const examples=[
 [['Ah','Kh'],['Qh','Jh','2c'],'RoyalStraightFlushDraw'],
 [['8h','9h'],['Th','Jh','2c'],'StraightFlushDraw'],
 [['8h','9h'],['Tc','Js','2h','3h'],'FlushDrawOpenEndedStraightDraw'],
 [['8h','9h'],['Js','2h','3h','Qc'],'FlushDrawGutshotStraightDraw'],
 [['Ah','3h'],['4c','5d','7h','Kh'],'FlushDrawDoubleGutshotStraightDraw'],
 [['Ac','3d'],['4h','5s','7c'],'DoubleGutshotStraightDraw'],
 [['8c','9d'],['Th','Js','2c'],'OpenEndedStraightDraw'],
 [['Ac','2d'],['3h','4s','9c'],'GutshotStraightDraw'],
 [['Ah','8h'],['2h','4h','Qc'],'FlushDraw'],
 [['8c','9d'],['Th','Js','Qc'],''],
 [['Ah','Kh'],['2h','4h','8h'],''],
 [['Ah','Kh'],['Qh','Jh','Tc','2d'],'FlushDraw'],
 [['8h','9h'],['Th','Jh','2h','3c'],'StraightFlushDraw'],
 [['Ah','Kh'],['Qh','Jh','2h','3h'],'GutshotStraightDraw'],
 [['Ah','6d'],['7s','8c','Kd'],'']
];
for(const [hole,board,key]of examples){const before=JSON.stringify([hole,board]);assert.equal(handDraw(hole,board),key,JSON.stringify([hole,board]));assert.equal(JSON.stringify([hole,board]),before)}
for(const [hole,board]of [[['Ah','Kh'],[]],[['Ah','Kh'],['Qh','Jh','2c','3c','4c']],[['Ah','Kh','2d','3d'],['Qh','Jh','2c']],[[null,'Kh'],['Qh','Jh','2c']],[['Ah','Kh'],['Ah','Jh','2c']],[['Xh','Kh'],['Qh','Jh','2c']]])assert.equal(handDraw(hole,board),'');
const sourceEquality=new Set();for(let n=0;n<16384;n++){const text=Array.from({length:14},(_,i)=>(n>>i)&1).join('');sourceEquality.add(Number.parseInt(text,10)|0)}assert.equal(sourceEquality.size,16384,'Native decimal-vector comparison is injective for all14bit masks');
console.log('PASS native draw branches:all9labels,made-hand priority,exact-suit-count quirk,ShortDeck raw-mask limitation,scope/privacy/immutability and16384mask comparison equivalence');
