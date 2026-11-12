import assert from 'node:assert/strict';
import {voluntaryReveals} from './table-audio.mjs';
const old={number:7,me:1,hand:{end:{},cards:[null,['As','Kh']],shownIndices:[null,null]}},next=structuredClone(old);next.hand.shownIndices[1]=[1];
assert.deepEqual(voluntaryReveals(null,next),[]);assert.deepEqual(voluntaryReveals({...old,number:6},next),[]);assert.deepEqual(voluntaryReveals({...old,hand:{...old.hand,end:null}},next),[{seat:1,index:1,own:true}],'A poll spanning settlement and explicit reveal must not drop the new event');
assert.deepEqual(voluntaryReveals(old,next),[{seat:1,index:1,own:true}]);assert.deepEqual(voluntaryReveals(next,next),[]);const spectator={...next,me:null};assert.deepEqual(voluntaryReveals(old,spectator),[{seat:1,index:1,own:false}]);
const both=structuredClone(next);both.hand.shownIndices[1]=[0,1];assert.deepEqual(voluntaryReveals(next,both),[{seat:1,index:0,own:true}]);
console.log('PASS voluntary reveal events:own unchanged cards,remote perspective,no initial/catchup/newhand/duplicate replay');

globalThis.Image=class{};globalThis.addEventListener=()=>{};globalThis.document={querySelector:()=>null};globalThis.localStorage={getItem:()=>null};
const {voluntaryCardPose,voluntaryCardFrames}=await import('./felt.mjs');
for(const count of [2,4,5,6]){for(let i=0;i<count;i++){const p=voluntaryCardPose(count,i);assert.ok(p.x>700&&p.x<1100&&p.y>700&&p.y<800);assert.ok(p.width>0&&p.height>p.width)}assert.throws(()=>voluntaryCardPose(count,count));assert.throws(()=>voluntaryCardPose(count,'0'))}
assert.deepEqual(voluntaryCardPose(2,0),{x:827,y:727,angle:-15,width:122*1.1*1.1,height:162*1.1*1.1});
const f=voluntaryCardFrames({x:0,y:0,angle:5},{x:170,y:340,angle:20});assert.equal(f.length,61);assert.equal(f[0].left,'0cqw');assert.ok(Math.abs(parseFloat(f[60].left)-10)<1e-12);assert.ok(Math.abs(parseFloat(f[60].top)-20)<1e-12);assert.equal(f[30].transform,'translate(-50%,-50%) rotate(-30deg)');assert.equal(f[45].transform,'translate(-50%,-50%) rotate(13.75deg)');assert.ok(parseFloat(f[30].left)<0);console.log('PASS source own voluntary2/4/5/6poses,linear+cubic rotation and Back translation samples');

const {remoteVoluntaryFrames}=await import('./felt.mjs');const flip=remoteVoluntaryFrames();assert.equal(flip.length,61);assert.equal(flip[0].scale,'1 1');assert.equal(flip[30].scale,'0.75 1');assert.equal(flip[60].scale,'1 1');assert.ok(parseFloat(flip[48].scale)<.025);console.log('PASS remote voluntary native flip:200ms cubic -1to1 scale samples');
