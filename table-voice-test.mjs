import assert from 'node:assert/strict';
import {traceVoiceEvents,validVoiceStamps} from './table-voice.mjs';
import {startHand,act,options} from './engine/table.mjs';
const row=(seat,street,action,bet,voicePackId='VGreg',allIn=false)=>({seat,street,action,bet,voicePackId,allIn});
const trace={opening:{bets:[0,2,4]},actions:[row(0,0,'call',4),row(1,0,'raise',8,'VDoyle'),row(2,0,'call',8,'VDaniel',true),row(0,0,'fold',4),row(1,3,'check',0),row(2,3,'raise',12,'VSophia'),row(1,3,'raise',40,'VEmma',true),row(2,3,'fold',12)]};
const expected=['VoiceCallGreg','VoiceRaiseDoyle','VoiceCallDaniel','VoiceCheckGreg','VoiceBetSophia','VoiceAllinEmma','VoiceFoldGreg'];
assert.deepEqual(traceVoiceEvents(trace).map(event=>event.cue),expected);
assert.deepEqual(traceVoiceEvents(trace).map(event=>event.index),[0,1,2,4,5,6,7]);
assert.deepEqual(traceVoiceEvents(trace,5).map(event=>event.cue),expected.slice(4));
assert.equal(traceVoiceEvents(trace,8).length,0);
assert.equal(traceVoiceEvents(trace,0,'aof')[0].cue,'VoiceAllinGreg');
assert.equal(traceVoiceEvents(trace,0,'aof').some(event=>event.index===3),false);
assert.equal(traceVoiceEvents(trace,0,'aof').at(-1).cue,'VoiceFoldGreg');
const saved=structuredClone(trace);traceVoiceEvents(trace);assert.deepEqual(trace,saved);
assert.equal(validVoiceStamps(undefined),true);assert.equal(validVoiceStamps(trace),true);assert.equal(validVoiceStamps({actions:[{seat:0}]}),true);
for(const invalid of [null,{},[],{actions:null},{actions:[null]},{actions:[{voicePackId:'../bad'}]},{actions:[{voicePackId:null}]}])assert.equal(validVoiceStamps(invalid),false);
const changing={opening:{bets:[2,4]},actions:[row(0,0,'raise',12,'VGreg'),row(1,0,'call',12,'VDoyle'),row(0,3,'raise',8,'VEmma'),row(1,3,'raise',20,'VDoyle')]};
assert.deepEqual(traceVoiceEvents(changing).map(event=>event.cue),['VoiceRaiseGreg','VoiceCallDoyle','VoiceBetEmma','VoiceRaiseDoyle'],'Use each action stamp rather than current seat preference');
const legacy=structuredClone(changing);delete legacy.actions[0].voicePackId;
assert.deepEqual(traceVoiceEvents(legacy).map(event=>event.cue),['VoiceCallDoyle','VoiceBetEmma','VoiceRaiseDoyle'],'Never invent voice stamps for historical actions;retain price accounting');
for(const street of [3,4,5])assert.equal(traceVoiceEvents({opening:{bets:[2,4]},actions:[row(0,street,'raise',8)]})[0].cue,'VoiceBetGreg');
for(const bad of [null,{},[],{opening:{bets:[]},actions:[]},{opening:{bets:[NaN,4]},actions:[]}])assert.deepEqual(traceVoiceEvents(bad),[]);
for(const [key,value]of [['seat',-1],['seat',3],['seat',.5],['street',2],['action','unknown'],['bet',-1],['bet',1.5],['allIn',1]]){const invalid=structuredClone(trace);invalid.actions[0][key]=value;assert.deepEqual(traceVoiceEvents(invalid),[],key)}
for(const bad of ['__proto__','VWilliam','../VGreg',{},null]){const invalid=structuredClone(changing);invalid.actions[0].voicePackId=bad;assert.equal(traceVoiceEvents(invalid).some(event=>event.index===0),false)}
for(const from of [-1,.5,NaN,99])assert.deepEqual(traceVoiceEvents(trace,from),[]);
for(const variant of ['roshambo','avatar-race','unknown',null])assert.deepEqual(traceVoiceEvents(trace,0,variant),[]);
const reversed=structuredClone(trace);reversed.actions.push(row(1,0,'call',4));assert.deepEqual(traceVoiceEvents(reversed),[]);
assert.ok(traceVoiceEvents(trace).every(event=>Object.keys(event).sort().join(',')==='cue,index,seat,street,voicePackId'));
const game=startHand([30,70,100,100],4,0),packs=['VGreg','VDoyle','VDaniel','VEmma'];
while(!game.end){const seat=game.turn,o=options(game);act(game,o.raise?'raise':o.due?'call':'check',o.max);game.historyTrace.actions.at(-1).voicePackId=packs[seat]}
const complete=structuredClone(game);
assert.deepEqual(traceVoiceEvents(game.historyTrace).map(event=>event.cue),['VoiceAllinEmma','VoiceCallGreg','VoiceCallDoyle','VoiceCallDaniel']);assert.equal(game.end.payouts.reduce((sum,n)=>sum+n,0),300);assert.deepEqual(game,complete);
console.log('PASS native action voices:per-action actor packs,all-in Call stays Call,non-call all-in,AoF,preflop Fold suppression,street Bet/Raise resets,delta indices,legacy skip,immutable input and malformed trace fail-closed');
console.log('PASS real four-seat engine trace:unequal30/70/100/100 all-ins,actor-specific All-In/Call cues,300-chip payout total and unchanged complete hand');
