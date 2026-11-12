import assert from 'node:assert/strict';
import {createClockAudio} from './table-audio.mjs';
const played=[],stopped=[];
const audio=createClockAudio(async names=>{const i=played.length;played.push(names);return ()=>stopped.push(i)});
const h={deadline:10000,clock:{actionId:'a',seat:1,phase:'bank',canDisableLimit:true}};
audio.update(h,0,0,true);assert.equal(played.length,0);
audio.update(h,1,0,true);await Promise.resolve();assert.deepEqual(played,[['ChessClock']]);
audio.update(h,1,999,true);assert.equal(played.length,1);audio.update(h,1,1000,true);await Promise.resolve();assert.equal(played.length,2);
h.clock.canDisableLimit=false;audio.update(h,1,1100,true);assert.deepEqual(stopped,[0,1]);
h.clock={actionId:'b',seat:1,phase:'hot',canDisableLimit:false};h.deadline=9000;
audio.update(h,1,2000,true);assert.equal(played.length,2);audio.update(h,1,4000,true);await Promise.resolve();assert.deepEqual(played.at(-1),['TimeBankTick']);audio.update(h,1,5000,true);assert.equal(played.length,3);
audio.update(h,1,5001,false);assert.deepEqual(stopped,[0,1,2]);audio.update(h,1,9000,true);assert.equal(played.length,3);
let resolve;const delayed=createClockAudio(()=>new Promise(r=>resolve=r));h.deadline=10000;delayed.update(h,1,6000,true);delayed.update(null,1,6001,true);let cancelled=false;resolve(()=>cancelled=true);await Promise.resolve();assert.equal(cancelled,true,'Loaded late sound must stop after turn change');
console.log('PASS own-turn cap ticks at1s, reserve cancellation, hot-time final5s once, expiry/mute stop and asynchronous stale-source cleanup');
const guards=[];const loading=createClockAudio((_names,current)=>{guards.push(current);return Promise.resolve()});h.clock={actionId:'c',seat:1,phase:'bank',canDisableLimit:true};h.deadline=10000;loading.update(h,1,0,true);loading.update(h,1,1000,true);assert.equal(guards[0](),false,'Old pending ticks must not play in a burst when decode finishes');assert.equal(guards[1](),true);loading.update(null,1,1001,true);assert.equal(guards[1](),false);

console.log('PASS pending cap ticks collapse to the current tick rather than replaying a decoded backlog');
