import assert from 'node:assert/strict';import {spinInsurancePresentation,spinInsuranceCues} from './spin-insurance-presentation.mjs';import {audioChannel,audioCueDuration} from './table-audio.mjs';
const p=spinInsurancePresentation(0,1);assert.deepEqual(p.tick(0).cues,[spinInsuranceCues.text]);assert.deepEqual(p.tick(1999).cues,[]);assert.deepEqual(p.tick(1).cues,[spinInsuranceCues.coin]);assert.deepEqual(p.tick(1200).cues,[spinInsuranceCues.amount]);assert.equal(p.tick(2000).done,true);assert.deepEqual(p.tick(100).cues,[]);
const skipped=spinInsurancePresentation(0,0);assert.deepEqual(skipped.tick(5200).cues,Object.values(spinInsuranceCues));assert.deepEqual(skipped.tick(0).cues,[]);
const cancelled=spinInsurancePresentation(0,0);cancelled.cancel();assert.deepEqual(cancelled.tick(500),{done:true,cues:[]});for(const n of [-1,NaN,Infinity])assert.throws(()=>p.tick(n));assert.throws(()=>spinInsurancePresentation(NaN,0));console.log('PASS insurance presentation:source sound thresholds,once-only cues,skipped ticks,cancellation anddelta guards');

for(const [name,samples]of [['SngInsuranceText',155520],['SngPrizeCheers',73728],['SngPrizeDaller',129024]]){assert.equal(audioChannel(name),'effects');assert.equal(audioCueDuration(name,20),samples/44100);assert.equal(audioCueDuration(name,.1),.1)}

const catchUp=spinInsurancePresentation(0,0,false);assert.deepEqual(catchUp.tick(0).cues,[]);assert.deepEqual(catchUp.tick(2000).cues,[]);assert.deepEqual(catchUp.tick(1200).cues,[]);assert.equal(catchUp.tick(2000).done,true);assert.throws(()=>spinInsurancePresentation(0,0,'false'));
