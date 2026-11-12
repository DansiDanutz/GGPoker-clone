import assert from 'node:assert/strict';import {spinPayouts,spinOutcome,spinBlindLevel,spinSmallBlinds} from './engine/spin.mjs';
const expected=[
 [20000,5,[50000000,30000000,20000000],'hands',20],
 [100,4000,[300000,150000,50000],'hands',15],
 [50,8000,[150000,75000,25000],'hands',15],
 [10,2450000,[40000,10000,0],'hands',10],
 [5,2800000,[25000,0,0],'minutes',3],
 [4,3000000,[20000,0,0],'minutes',2],
 [3,44124010,[15000,0,0],'minutes',2],
 [2,47613985,[10000,0,0],'minutes',1]
];
for(const buyIn of [5000,10000]){
 const rows=spinPayouts(buyIn);assert.equal(rows.reduce((n,r)=>n+r.frequency,0),100000000);assert.equal(rows.reduce((n,r)=>n+BigInt(r.frequency)*BigInt(r.multiplier),0n),279000000n);let start=0;
 for(const [i,[multiplier,frequency,prizes,unit,interval]]of expected.entries()){assert.deepEqual(rows[i],{multiplier,frequency,prizePool:buyIn*multiplier,prizes:prizes.map(n=>n*buyIn/5000),unit,interval});for(const ticket of [start,start+frequency-1]){const outcome=spinOutcome(buyIn,ticket);assert.equal(outcome.multiplier,multiplier);assert.equal(outcome.prizes.reduce((a,b)=>a+b),outcome.prizePool);assert.equal(outcome.startingChips,null);assert.equal(outcome.timeBankCards,null)}start+=frequency}
}
for(const ticket of [-1,100000000,1.5,'5',null])assert.throws(()=>spinOutcome(5000,ticket),RangeError);for(const stake of [25,0,5001,'5000'])assert.throws(()=>spinPayouts(stake),RangeError);
assert.equal(spinBlindLevel(2,{startedAt:1000,now:60999,completedHands:100}).level,1);assert.equal(spinBlindLevel(2,{startedAt:1000,now:61000,completedHands:0}).level,2);assert.equal(spinBlindLevel(3,{startedAt:0,now:119999,completedHands:999}).level,1);assert.equal(spinBlindLevel(3,{startedAt:0,now:120000,completedHands:0}).level,2);assert.equal(spinBlindLevel(5,{startedAt:0,now:180000,completedHands:0}).level,2);
for(const [multiplier,hands]of [[10,10],[50,15],[100,15],[20000,20]]){assert.equal(spinBlindLevel(multiplier,{startedAt:0,now:99999999,completedHands:hands-1}).level,1);assert.equal(spinBlindLevel(multiplier,{startedAt:0,now:0,completedHands:hands}).level,2)}
for(let i=0;i<26;i++){const level=spinBlindLevel(2,{startedAt:0,now:i*60000,completedHands:0});assert.deepEqual([level.level,level.smallBlind,level.bigBlind],[i+1,spinSmallBlinds[i],spinSmallBlinds[i]*2])}assert.equal(spinBlindLevel(20000,{startedAt:0,now:0,completedHands:99999}).bigBlind,3000);assert.equal(spinBlindLevel(2,{startedAt:1000,now:0,completedHands:0}).level,1);assert.throws(()=>spinBlindLevel(40,{startedAt:0,now:0,completedHands:0}),RangeError);assert.throws(()=>spinBlindLevel(2,{startedAt:0,now:0,completedHands:.5}),RangeError);
console.log('PASS native play-money Spin model: both stakes, exact 100M weighted outcomes/payouts and every boundary, 26 blind levels, minute/hand transitions, cap and invalid-input guards; unresolved stack/time-bank values stay unset');
