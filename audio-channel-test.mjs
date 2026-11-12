import assert from 'node:assert/strict';import {audioChannel,readAudioChannel,audioPreviewChoices} from './table-audio.mjs';
const stored=new Map();globalThis.localStorage={getItem:key=>stored.get(key)??null};
for(const cue of ['Fold','DealCard','Board','GatherChips','WinPot','ShowCard','ShowDownCard','SqueezeOpen'])assert.equal(audioChannel(cue),'table');
for(const cue of ['Check','Call','Bet','Raise','AllIn','ShuffleUp','ShuffleCombine','ShuffleOther','AofButton'])assert.equal(audioChannel(cue),'effects');
assert.equal(audioChannel('ChessClock'),null);assert.equal(audioChannel('Unknown'),null);assert.deepEqual(readAudioChannel('table'),{enabled:true,volume:100});
stored.set('river-audio-table-volume','25');stored.set('river-audio-table-enabled','0');assert.deepEqual(readAudioChannel('table'),{enabled:false,volume:25});assert.deepEqual(readAudioChannel('effects'),{enabled:true,volume:100});
for(const invalid of ['-1','101','NaN','1.5','Infinity','']){stored.set('river-audio-table-volume',invalid);assert.equal(readAudioChannel('table').volume,100)}assert.throws(()=>readAudioChannel('unknown'));
console.log('PASS source audio categories,independent saved levels/toggles,defaults and malformed bounds');

for(const id of ['table','effects']){const choices=audioPreviewChoices(id);assert.ok(choices.length>1);assert.ok(choices.every(c=>audioChannel(c)===id));assert.equal(audioPreviewChoices(id,choices[0]).includes(choices[0]),false)}assert.equal(audioPreviewChoices('effects').includes('ShuffleOther'),false,'Native preview whitelist excludes shuffle');assert.deepEqual(audioPreviewChoices('unknown'),[]);
