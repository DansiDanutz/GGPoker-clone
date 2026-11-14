import assert from 'node:assert/strict';
import {spinWheelSegments} from './spin-wheel-segments.mjs';
const values=[20000,100,50,10,5,4,3,2],slots=[10,5,100,3,50,4,20000,2];
for(const multiplier of values){const p=spinWheelSegments(values,multiplier);assert.deepEqual(p.multipliers,slots);assert.equal(p.wheelIndex,slots.indexOf(multiplier));assert.equal(p.targetIndex,7-p.wheelIndex);assert.equal(p.multipliers[p.wheelIndex],multiplier)}
assert.deepEqual(values,[20000,100,50,10,5,4,3,2]);assert.deepEqual(spinWheelSegments([2,3,4,5,10,50,100,20000],5).multipliers,[5,10,3,100,4,50,2,20000]);
for(const input of [[],values.slice(1),[...values,1],[2,2,4,5,10,50,100,20000],[0,...values.slice(1)],[NaN,...values.slice(1)]])assert.throws(()=>spinWheelSegments(input,2));assert.throws(()=>spinWheelSegments(values,25));
console.log('PASS native segment permutation,all eight winner mappings,unsorted input preservation and invalid-list rejection');
