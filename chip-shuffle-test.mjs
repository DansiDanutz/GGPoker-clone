import assert from 'node:assert/strict';
import {readChipShuffle,nextShuffleFrame,remoteShuffleFrame,createChipShuffle} from './chip-shuffle.mjs';
import {openRooms} from './rooms.mjs';
import {mkdtempSync,rmSync,mkdirSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
assert.deepEqual([0,9,10,20,2450,2460].map(remoteShuffleFrame),[1,1,1,2,245,null],'Native elapsed-time frame clock and completion boundary');
const defaults={enabled:true,direction:0,sensitivity:1};assert.deepEqual(readChipShuffle(null),defaults);
for(const raw of ['bad','[]',JSON.stringify({...defaults,enabled:'true'}),JSON.stringify({...defaults,direction:2}),JSON.stringify({...defaults,sensitivity:3})])assert.deepEqual(readChipShuffle(raw),defaults);
assert.equal(nextShuffleFrame(37,-1,0,defaults),52);assert.equal(nextShuffleFrame(37,1,30,defaults),37);
assert.equal(nextShuffleFrame(37,-1,0,{...defaults,sensitivity:0}),47);assert.equal(nextShuffleFrame(37,1,0,{...defaults,direction:1,sensitivity:2}),62);
assert.equal(nextShuffleFrame(190,-1,30,defaults),47);assert.equal(nextShuffleFrame(37,-1,300,defaults),42);assert.equal(nextShuffleFrame(52,0,30,defaults),52);
const cues=[],art={dataset:{},style:{}},oldNow=Object.getOwnPropertyDescriptor(performance,'now');Object.defineProperty(performance,'now',{value:()=>0,configurable:true});
try{const controller=createChipShuffle(art,()=>defaults,()=>{},names=>cues.push(...names));assert.equal(controller.start(),true);for(let i=0;i<8;i++)art.onwheel({deltaY:-1,preventDefault(){}});assert.equal(cues.filter(n=>n==='ShuffleUp').length,9);assert.equal(cues.filter(n=>n==='ShuffleCombine').length,1);art.onwheel({deltaY:1,preventDefault(){}});assert.equal(cues.filter(n=>n==='ShuffleCombine').length,1);art.onwheel({deltaY:-1,preventDefault(){}});assert.equal(cues.filter(n=>n==='ShuffleCombine').length,1);for(let i=0;i<10;i++)art.onwheel({deltaY:-1,preventDefault(){}});assert.equal(cues.filter(n=>n==='ShuffleCombine').length,2,'Combine must reset only after native frame wrap');controller.stop();assert.ok(cues.every(n=>['ShuffleUp','ShuffleCombine'].includes(n)))}finally{if(oldNow)Object.defineProperty(performance,'now',oldNow);else delete performance.now}
const dir=mkdtempSync(join(tmpdir(),'chip-shuffle-')),file=join(dir,'rooms.json'),id='d'.repeat(48),table={name:'Shuffle test',stack:120,blind:4,open:true};const clock=Date.now;let now=clock();Date.now=()=>now;
try{
 let room=openRooms(file);const a=room(id,'join',null,{name:'A'},table),b=room(id,'join',null,{name:'B'},table);let s=room(id,'state',a.issued,{},table);s=room(id,'start',a.issued,{version:s.version},table);const hand=structuredClone(s.hand);
 assert.throws(()=>room(id,'shuffle','invalid',{},table),e=>e.status===401);
 s=room(id,'shuffle',a.issued,{},table);assert.deepEqual(s.shuffles,[{seat:0,at:now}]);assert.deepEqual(s.hand,hand);assert.deepEqual(room(id,'watch',null,{},table).shuffles,s.shuffles);
 assert.throws(()=>room(id,'shuffle',a.issued,{},table),e=>e.status===429);now+=3000;
 mkdirSync(file+'.tmp');assert.throws(()=>room(id,'shuffle',a.issued,{},table));rmdirSync(file+'.tmp');room=openRooms(file);assert.deepEqual(room(id,'state',a.issued,{},table).shuffles,[],'Expired animation replayed after restart');
 s=room(id,'shuffle',b.issued,{seat:0},table);assert.deepEqual(s.shuffles,[{seat:1,at:now}],'A player spoofed another seat');
 assert.deepEqual(room(id,'state',a.issued,{},table).hand,hand);now+=3000;assert.deepEqual(room(id,'watch',null,{},table).shuffles,[]);
 console.log('PASS Chip Shuffle: native wheel math, strict preferences, authenticated/rate-limited own-seat cosmetic event, watcher/restart/expiry/write rollback and unchanged hand');
}finally{Date.now=clock;rmSync(dir,{recursive:true,force:true})}
