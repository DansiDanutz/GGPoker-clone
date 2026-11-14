import assert from 'node:assert/strict';
import {spinWheelSparkles} from './spin-wheel-sparkles.mjs';
const s=spinWheelSparkles(()=>0);let p=s.tick(0);assert.equal(p.length,1);assert.deepEqual(p[0],{x:687,y:387,scale:.1,alpha:0,color:0});p=s.tick(250);assert.ok(Math.abs(p[0].scale-.15)<1e-12);assert.equal(p[0].alpha,.125);p=s.tick(250);assert.equal(p.length,2);assert.equal(p[0].scale,.5);assert.equal(p[0].alpha,1);p=s.tick(1000,false);assert.equal(p.length,1);assert.equal(p[0].alpha,.125);assert.deepEqual(s.tick(500,false),[]);s.cancel();assert.deepEqual(s.tick(10000),[]);assert.throws(()=>spinWheelSparkles(()=>1));assert.throws(()=>s.tick(-1));
const values=[0,.25,.5,0,0,0];let i=0;const r=spinWheelSparkles(()=>values[i++%values.length]);p=r.tick(0);assert.ok(Math.abs(p[0].x-(387+Math.cos(90)*400))<1e-10);assert.ok(Math.abs(p[0].y-(387+Math.sin(90)*400))<1e-10);
console.log('PASS native sparkles:immediate spawn,radian source angle,cubic grow/fade,color,spawn suppression andcancel');
