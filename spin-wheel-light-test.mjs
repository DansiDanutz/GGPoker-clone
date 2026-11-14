import assert from 'node:assert/strict';
import {spinWheelFrameLight} from './spin-wheel-light.mjs';
assert.deepEqual(spinWheelFrameLight(0,0,.5),{rotation:337.5,x:-61,y:-239,width:122,height:80,alpha:.5,maskX:-61,maskY:-159,maskWidth:122,maskHeight:159,complete:false});
assert.equal(spinWheelFrameLight(7,500,.5).y,-239);assert.equal(spinWheelFrameLight(7,1500,.5).y,-209.125);assert.equal(spinWheelFrameLight(7,2500,.5).y,0);assert.equal(spinWheelFrameLight(7,2500,.5).complete,true);assert.equal(spinWheelFrameLight(7,0,.8).rotation,22.5);
for(const a of [[-1,0,.5],[8,0,.5],[0,-1,.5],[0,0,.49],[0,0,.81],[0,NaN,.5]])assert.throws(()=>spinWheelFrameLight(...a));
console.log('PASS native masked frame light:122x159 mask,80px sweep,500–800ms delay,2s cubic motion and target rotation');
