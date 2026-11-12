import assert from 'node:assert/strict';
import {showdownPlan,streetPlan} from './table-audio.mjs';
const before={number:1,hand:{board:[],end:null}};
const after={number:1,hand:{board:['2c','3d','4h','5s','6c'],cards:[['As','Ad'],['Ks','Kd'],['Qs','Qd'],null],folded:[false,false,false,true],end:{}}};
const original=JSON.stringify([before,after]),plan=showdownPlan(before,after);
assert.deepEqual(plan.reveals.map(r=>r.seat),[0,1,2]);
assert.equal(plan.reveals.at(-1).at,2400);
assert.deepEqual(plan.board.map(r=>[r.index,r.at,r.cue]),[[0,2600,true],[1,2600,false],[2,2600,false],[3,3100,true],[4,3300,true]]);
assert.equal(plan.complete,3300);assert.equal(JSON.stringify([before,after]),original,'Presentation must not mutate authoritative snapshots');
for(const count of [3,4]){const p=showdownPlan({...before,hand:{board:after.hand.board.slice(0,count)}},after);assert.equal(p.complete,count===3?2800:2600);assert.equal(p.board[0].index,count)}
assert.equal(showdownPlan(before,null),null);assert.equal(showdownPlan(null,after),null);assert.equal(showdownPlan({...before,number:2},after),null);
assert.equal(showdownPlan({...before,hand:{board:after.hand.board}},after),null);
assert.equal(showdownPlan(before,{...after,hand:{...after.hand,folded:[false,true,true,true]}}),null);
assert.equal(showdownPlan({...before,hand:{...before.hand,end:{}}},after),null);
console.log('PASS source showdown stage budgets, received reveal order, board phases, folded exclusion, reconnect and immutable state');

for(const [from,to]of [[0,3],[3,4],[4,5]]){const old={number:1,hand:{board:Array(from)}},next={number:1,hand:{board:Array(to)}};const saved=JSON.stringify([old,next]),p=streetPlan(old,next);assert.equal(p.street,true);assert.equal(p.complete,0);assert.deepEqual(p.reveals,[]);assert.deepEqual(p.board,Array.from({length:to-from},(_,i)=>({index:from+i,at:200,cue:i===0})));assert.equal(JSON.stringify([old,next]),saved)}
for(const [old,next]of [[null,before],[before,{...before,number:2}],[before,before],[before,after],[{number:1,hand:{board:Array(3),end:{}}},{number:1,hand:{board:Array(4)}}],[before,{number:1,hand:{board:Array(4)}}]])assert.equal(streetPlan(old,next),null);
console.log('PASS fresh single-street plans, immutable snapshots, no replay/catchup/new-hand/settlement');
