import assert from 'node:assert/strict';
import {startHand} from './engine/table.mjs';
import {previewTable} from './room-preview.mjs';
const hand=startHand([100,200],4,0),before=JSON.stringify(hand),p=previewTable('actual',['A','B'],hand,[true,true]);
assert.deepEqual(p.players.map(p=>p.position),['dealer','big-blind']);assert.deepEqual(p.players.map(p=>p.chips),hand.stacks);assert.deepEqual(p.players.map(p=>p.seat),[0,1]);assert.equal(JSON.stringify(hand),before);p.players[0].chips=999;assert.notEqual(hand.stacks[0],999);assert.equal(previewTable('actual',['A','B'],hand,[false,true]).players[0].seat,1);assert.deepEqual(Object.keys(p).sort(),['maxPlayers','players','table']);assert.ok(p.players.every(p=>Object.keys(p).sort().join(',')==='chips,name,position,seat'));
console.log('PASS public preview: actual heads-up dealer precedence/BB/stacks, stable occupied seat indices, no private fields or mutations');
