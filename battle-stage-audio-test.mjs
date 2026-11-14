import assert from 'node:assert/strict';
import {battleStageAudio} from './battle-table.mjs';
const state=(phase,session='a')=>({battlePhase:phase,battleSession:session,registered:true});
let gate=battleStageAudio();
assert.deepEqual(gate.observe(state('shootout')),[],'Opening an ended stage is catch-up');
assert.deepEqual(gate.observe(state('rush')),[]);
assert.deepEqual(gate.observe(state('shootout')),[],'Already ended session cannot replay after stale Rush');
gate=battleStageAudio();assert.deepEqual(gate.observe(state('rush')),[]);assert.deepEqual(gate.observe(state('draining')),['BnRRoundEnd']);
for(const phase of ['draining','shootout','final-ready','rush','shootout'])assert.deepEqual(gate.observe(state(phase)),[]);
gate=battleStageAudio();gate.observe(state('rush'));gate.interrupt();assert.deepEqual(gate.observe(state('shootout')),[],'First recovery read is silent');
gate=battleStageAudio();gate.observe(state('rush'));assert.deepEqual(gate.observe(state('shootout'),true),[],'Hidden/catch-up read is silent');
gate=battleStageAudio();gate.observe(state('rush'));assert.deepEqual(gate.observe(state('shootout','b')),[],'New identity cannot inherit previous transition');
gate=battleStageAudio();gate.observe(state('registration'));assert.deepEqual(gate.observe(state('shootout')),[],'Skipped Rush is not a witnessed finish');
gate=battleStageAudio();gate.observe(state('rush'));assert.deepEqual(gate.observe({...state('shootout'),registered:false}),[]);
console.log('PASS Battle stage audio gate: one witnessed Rush finish, silent initial/repeated/stale/hidden/interrupted/new-session reads');

gate=battleStageAudio();gate.observe(state('rush'));assert.deepEqual(gate.observe(state('shootout')),['BnRRoundEnd']);gate.observe(state('rush','b'));gate.observe(state('rush','a'));assert.deepEqual(gate.observe(state('shootout','a')),[],'Returning to a consumed identity cannot replay');

gate=battleStageAudio();gate.observe(state('rush'));gate.observe(state('shootout'));const delayed=gate.lease();assert.equal(delayed(),true);gate.interrupt();assert.equal(delayed(),false);
