import assert from 'node:assert/strict';
import {pushSeatState} from './room-push-seat.mjs';
import {pushSeatChoices,pushSeatArrowFrames} from './push-seat-ui.mjs';
const s={me:2,names:['A','B','C',null,null,'F'],reservedSeats:[4],pushSeat:pushSeatState({pushSeat:{until:3,sequence:0}},0)};
assert.deepEqual(pushSeatChoices(s),[0,1,3,5]);
for(const v of [null,{...s,me:null},{...s,pushSeat:{remainingHands:0}},{...s,pushSeat:{remainingHands:3,reservation:{target:0}}}])assert.deepEqual(pushSeatChoices(v),[]);
const f=pushSeatArrowFrames();assert.deepEqual(f.map(x=>x.offset),[0,.25,.5,.75,1]);assert.deepEqual(f.map(x=>x.transform),[82,92,102,92,82].map(y=>'translateY('+(y-82)/17+'cqw)'));
assert.equal(f[0].easing,'cubic-bezier(.3333333333,0,.6666666667,0)');assert.equal(f[1].easing,'cubic-bezier(.3333333333,1,.6666666667,1)');
console.log('PASS Push Seat UI target eligibility and native cubic arrow frames');
