import assert from 'node:assert/strict';
import {spinWheelGlow} from './spin-wheel-glow.mjs';
let p=spinWheelGlow(0);assert.equal(p.glow.size,2);assert.equal(p.glow.alpha,0);assert.equal(p.glitter.size,2);
p=spinWheelGlow(300);assert.equal(p.glitter.size,840);assert.equal(p.glitter.alpha,1);assert.ok(p.glow.size>2);
p=spinWheelGlow(700);assert.equal(p.glow.size,900);assert.equal(p.glow.x,-450);assert.equal(p.glow.alpha,1);
assert.equal(spinWheelGlow(1300).glitter.alpha,1);assert.equal(spinWheelGlow(2000).glitter.visible,false);assert.equal(spinWheelGlow(15000).rotation,180);assert.equal(spinWheelGlow(30000).rotation,0);
assert.ok(spinWheelGlow(490).glow.size>900);for(const bad of [-1,NaN,Infinity])assert.throws(()=>spinWheelGlow(bad));
console.log('PASS native glow:700ms back-eased overshoot,30s rotation,300ms glitter entry/1s hold/700ms fade');
