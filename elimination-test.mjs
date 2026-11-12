import assert from 'node:assert/strict';
import {eliminationPlaces} from './engine/eliminations.mjs';
assert.deepEqual(eliminationPlaces([100,200,50,100],[450,0,0,0],0),[{seat:1,place:2},{seat:3,place:3},{seat:2,place:4}]);
assert.deepEqual(eliminationPlaces([100,100,100,100],[400,0,0,0],2),[{seat:3,place:2},{seat:1,place:3},{seat:2,place:4}]);
assert.deepEqual(eliminationPlaces([100,0,100,100],[300,0,0,0],0),[{seat:2,place:2},{seat:3,place:3}]);
assert.deepEqual(eliminationPlaces([100,100],[120,80],0),[]);
assert.throws(()=>eliminationPlaces([100],[100],0));
console.log('PASS: simultaneous eliminations by starting chips, clockwise tie-break, previous eliminations excluded');
