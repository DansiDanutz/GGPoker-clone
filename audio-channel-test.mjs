import assert from 'node:assert/strict';import {audioChannel,readAudioChannel,audioPreviewChoices} from './table-audio.mjs';
const stored=new Map();globalThis.localStorage={getItem:key=>stored.get(key)??null};
for(const cue of ['Fold','DealCard','Board','GatherChips','WinPot','ShowCard','ShowDownCard','SqueezeOpen'])assert.equal(audioChannel(cue),'table');
for(const cue of ['Check','Call','Bet','Raise','AllIn','ShuffleUp','ShuffleCombine','ShuffleOther','AofButton'])assert.equal(audioChannel(cue),'effects');
for(const cue of ['ChessClock','TimeBankTick','NotificationTimeBank'])assert.equal(audioChannel(cue),'critical');assert.equal(audioChannel('Unknown'),null);assert.deepEqual(readAudioChannel('table'),{enabled:true,volume:100});
stored.set('river-audio-table-volume','25');stored.set('river-audio-table-enabled','0');assert.deepEqual(readAudioChannel('table'),{enabled:false,volume:25});assert.deepEqual(readAudioChannel('effects'),{enabled:true,volume:100});
for(const invalid of ['-1','101','NaN','1.5','Infinity','']){stored.set('river-audio-table-volume',invalid);assert.equal(readAudioChannel('table').volume,100)}assert.throws(()=>readAudioChannel('unknown'));
console.log('PASS source audio categories,independent saved levels/toggles,defaults and malformed bounds');

for(const id of ['table','effects','critical']){const choices=audioPreviewChoices(id);assert.ok(choices.length>1);assert.ok(choices.every(c=>audioChannel(c)===id));assert.equal(audioPreviewChoices(id,choices[0]).includes(choices[0]),false)}assert.equal(audioPreviewChoices('effects').includes('ShuffleOther'),false,'Native preview whitelist excludes shuffle');assert.deepEqual(audioPreviewChoices('unknown'),[]);

assert.deepEqual(readAudioChannel('critical'),{enabled:true,volume:100},'New category preserves legacy master-only gain until configured');stored.set('river-audio-critical-volume','37');stored.set('river-audio-critical-enabled','0');assert.deepEqual(readAudioChannel('critical'),{enabled:false,volume:37});assert.deepEqual(readAudioChannel('effects'),{enabled:true,volume:100});for(const invalid of ['-1','101','NaN','1.5','Infinity','']){stored.set('river-audio-critical-volume',invalid);assert.equal(readAudioChannel('critical').volume,100)}stored.set('river-audio-critical-volume','0');assert.equal(readAudioChannel('critical').volume,0);assert.deepEqual(new Set(audioPreviewChoices('critical')),new Set(['ChessClock','TimeBankTick','NotificationTimeBank']));console.log('PASS critical alerts:exact native category/preview set,legacy gain,independent mute/level,zero and invalid bounds');

assert.equal(audioChannel('VoiceCallGreg'),'voice');assert.equal(audioChannel('VoiceUnknownGreg'),null);assert.deepEqual(readAudioChannel('voice'),{enabled:true,volume:50});
assert.deepEqual(audioPreviewChoices('voice',null,'VGreg'),['VoiceAllinGreg','VoiceRaiseGreg','VoiceBetGreg','VoiceCheckGreg','VoiceCallGreg','VoiceFoldGreg','VoiceStraddleGreg']);
assert.equal(audioPreviewChoices('voice','VoiceCallGreg','VGreg').includes('VoiceCallGreg'),false);
for(const invalid of ['-1','101','NaN','1.5','Infinity','']){stored.set('river-audio-voice-volume',invalid);assert.equal(readAudioChannel('voice').volume,50)}stored.set('river-audio-voice-volume','0');stored.set('river-audio-voice-enabled','0');assert.deepEqual(readAudioChannel('voice'),{enabled:false,volume:0});assert.deepEqual(readAudioChannel('effects'),{enabled:true,volume:100});
console.log('PASS independent voice category,native50default,strict symbols,pack-specific nonrepeat preview and independent saved bounds');
