import assert from 'node:assert/strict';import {battleBoxType,battleBoxPose} from './battle-box-render.mjs';
assert.equal(battleBoxType(1,0),4);assert.equal(battleBoxType(0,3),3);assert.equal(battleBoxType(0,2),2);assert.equal(battleBoxType(0,1),1);
for(const type of [1,2,3,4]){
 const amount=type===4?205:121,end=type===4?285:169;
 assert.equal(battleBoxPose(0,type).frame,0);assert.equal(battleBoxPose(527,type).layers.normal,false);const open=battleBoxPose(528,type);assert.equal(open.layers.first,type===4);assert.equal(open.layers.normal,type!==4);assert.equal(open.layers.normal_fireworks,type===3);assert.equal(open.lightAlpha,type===1?.3:1);
 assert.equal(battleBoxPose(amount*33-1,type).amountVisible,false);assert.equal(battleBoxPose(amount*33,type).amountVisible,true);assert.equal(battleBoxPose(end*33,type).frame,end-1);assert.equal(battleBoxPose(end*33+999,type).complete,false);assert.equal(battleBoxPose(end*33+1000,type).complete,true);assert.equal(battleBoxPose(end*33+9000,type).frame,end-1);
}
for(const value of [-1,NaN,Infinity,'0'])assert.throws(()=>battleBoxPose(value,1));for(const type of [0,5,1.5,null])assert.throws(()=>battleBoxPose(0,type));
console.log('PASS native bounty clock:33ms frame interval, frame16 layers,121/205 amount reveal,169/285 terminal frames +1s hold, four source quality/effect branches and input bounds');
