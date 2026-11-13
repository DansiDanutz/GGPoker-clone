import assert from 'node:assert/strict';
import {advanceEmoticon} from './emoticon-animation.mjs';
for(const total of [1,30,45])for(const initial of [1,1.5,29.5,30,45])for(const ticks of [0,1,2,57,58,59,60,120,240]){
 let current=initial;for(let i=0;i<ticks;i++){current+=.5;if(current>total)current=1}
 const expected={current,frame:ticks?Math.max(1,Math.round(current%total)):1};
 assert.deepEqual(advanceEmoticon(initial,total,ticks),expected);
}
for(const args of [[0,30,1],[1,0,1],[1,30,-1],[1,30,.5],[NaN,30,1]])assert.throws(()=>advanceEmoticon(...args),RangeError);
console.log('PASS animated emoticon clock:source half-frame advance/wrap,30/45frames,carried phase,zero-tick first frame,invalid inputs;AIR frame0 boundary remains a documented local clamp');
