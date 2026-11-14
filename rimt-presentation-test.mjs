import assert from 'node:assert/strict';
import {showdownPlan,audioChannel,audioCueDuration} from './table-audio.mjs';
const all=['2c','3d','4h','5s','6c'],after={number:7,hand:{board:all,cards:[['Ac','Ad'],['Kc','Kd'],null],folded:[false,false,true],end:{},runoutBoards:[all,all,all]}};
for(const [shared,total,ends]of [[0,7200,[4000,5600,7200]],[3,5700,[3500,4600,5700]],[4,5100,[3300,4200,5100]]]){
 const before={number:7,hand:{board:all.slice(0,shared)}};const p=showdownPlan(before,after);assert.equal(p.complete,total);assert.equal(p.runouts.length,3);assert.deepEqual(p.runouts.map(r=>r.complete),ends);assert.deepEqual(p.runouts.map(r=>r.y),[418,490,562]);
 for(const [i,row]of p.runouts.entries()){assert.equal(row.showAt,i?p.runouts[i-1].complete:2400);assert.equal(row.complete-row.moveAt,400);assert.equal(row.moveAt-row.board.at(-1).at,300);assert.deepEqual(row.board.map(s=>s.index),Array.from({length:5-shared},(_,i)=>shared+i));assert.equal(row.board.filter(s=>s.cue).length,shared===0?3:5-shared)}
 const two=showdownPlan(before,{...after,hand:{...after.hand,runoutBoards:after.hand.runoutBoards.slice(0,2)}});assert.deepEqual(two.runouts.map(r=>r.y),[457,562]);assert.equal(two.complete,ends[1]);
}
assert.equal(showdownPlan({number:6,hand:{board:[]}},after),null);assert.equal(showdownPlan({...after},after),null);
console.log('PASS source-derived RIMT row clock:preflop/sharedflop/sharedturn,2/3rows,ordered streets,300ms river wait,400ms moves andaward barrier');
assert.equal(audioChannel('BoardFlop'),'table');
assert.equal(audioCueDuration('BoardFlop',10),27648/44100);
