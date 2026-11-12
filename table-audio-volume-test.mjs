import assert from 'node:assert/strict';
import {installAudio} from './table-audio.mjs';
const stored=new Map([['river-volume','35']]),events={},clicks={};
globalThis.localStorage={getItem:k=>stored.get(k)??null,setItem:(k,v)=>stored.set(k,v)};
globalThis.addEventListener=(k,f)=>events[k]=f;
globalThis.document={addEventListener:(k,f)=>{const old=clicks[k];clicks[k]=()=>{old?.();f()}}};
let context,played=0,stopped=0;const starts=[];
class AudioContext {
 constructor(){context=this;this.state='running';this.currentTime=0;this.destination={}}
 resume(){this.state='running';return Promise.resolve()}
 suspend(){this.state='suspended';return Promise.resolve()}
 createGain(){const node={gain:{value:1},connect:destination=>{assert.ok(destination===this.destination||destination===this.gain);node.output=destination}};this.gain??=node;return node}
 decodeAudioData(){return Promise.resolve({duration:.1})}
 createBufferSource(){return {connect:target=>{assert.ok(target===this.gain||target.output===this.gain);this.lastTarget=target},start:(...args)=>{played++;starts.push(args)},stop:()=>stopped++}}
}
globalThis.AudioContext=AudioContext;globalThis.window={AudioContext};
globalThis.fetch=async()=>({ok:true,headers:{get:()=> 'audio/mpeg'},arrayBuffer:async()=>new ArrayBuffer(0)});
const button={hidden:true,setAttribute(){}};const play=installAudio(button);
await new Promise(r=>setImmediate(r));clicks.click();await play(['Check']);
assert.equal(context.gain?.gain.value,.35);assert.equal(played,1);


button.onclick();assert.equal(context.state,'suspended');button.onclick();await Promise.resolve();assert.equal(context.state,'running','Unmute button must resume during its own authorized click');
const change=(key,value)=>{stored.set(key,value);events.storage({storageArea:localStorage,key})};
change('river-volume','80');assert.equal(context.gain.gain.value,.8);
change('river-volume','invalid');assert.equal(context.gain.gain.value,1);
change('river-volume','0');assert.equal(context.gain.gain.value,0);
change('river-volume','101');assert.equal(context.gain.gain.value,1);
change('river-muted','1');await play(['WinPot']);assert.equal(played,1);assert.equal(context.state,'suspended');assert.equal(context.gain.gain.value,0,'Mute must also zero the signal gain');
change('river-muted','0');await play(['WinPot']);assert.equal(played,2);
console.log('PASS audio gain: saved volume, live gain change, zero/invalid bounds, same audio context, mute/unmute and actual source routing');
// The first deal can arrive while an authorized click is still resuming audio.
let finishResume;
AudioContext.prototype.resume=function(){this.state='suspended';return new Promise(resolve=>{finishResume=()=>{this.state='running';resolve()}})};
const delayedButton={hidden:true,setAttribute(){}};const delayedPlay=installAudio(delayedButton);
await new Promise(r=>setImmediate(r));clicks.click();
const deal=delayedPlay(['DealCard']);finishResume();await deal;
assert.equal(played,3,'First deal was dropped while AudioContext.resume was pending');
console.log('PASS first-deal audio waits for the pending authorized resume');
clicks.click();const mutedDeal=delayedPlay(['DealCard']);delayedButton.onclick();finishResume();await mutedDeal;
assert.equal(played,3,'Mute must cancel a cue waiting on resume');
console.log('PASS muting cancels pending first-deal audio');

AudioContext.prototype.resume=function(){this.state='running';return Promise.resolve()};
AudioContext.prototype.decodeAudioData=()=>Promise.resolve({duration:3});stored.set('river-muted','0');const previewPlay=installAudio();await new Promise(r=>setImmediate(r));clicks.click();const cancel=await previewPlay(['ShuffleOther']);assert.equal(starts.at(-1)[2],116352/44100,'Native DefineSound sample-count duration');assert.equal(typeof cancel,'function','Cosmetic audio must return its own stop handle');cancel();assert.equal(stopped,1);
stored.set('river-muted','1');clicks.click();const beforePreview=played;await previewPlay(['ShuffleUp']);assert.equal(played,beforePreview,'Same-page saved mute must prevent preview');assert.equal(context.state,'suspended');
stored.set('river-muted','0');stored.set('river-volume','15');clicks.click();await previewPlay(['ShuffleUp']);assert.equal(played,beforePreview+1);assert.equal(context.gain.gain.value,.15);
console.log('PASS headless preview audio: independent cancel handle, same-page mute/volume and shared engine');
const beforeStale=played;await previewPlay(['ChessClock'],()=>false);assert.equal(played,beforeStale,'An obsolete clock cue must never start its source');

let finishDecode,active=true;AudioContext.prototype.decodeAudioData=()=>new Promise(resolve=>finishDecode=()=>resolve({duration:5}));const lateClock=previewPlay(['TimeBankTick'],()=>active);await new Promise(r=>setImmediate(r));assert.equal(typeof finishDecode,'function');active=false;finishDecode();await lateClock;assert.equal(played,beforeStale,'A turn ending during decode must prevent source.start');console.log('PASS stale clock cues never start, including a turn ending during asynchronous decode');
AudioContext.prototype.decodeAudioData=()=>Promise.resolve({duration:3});await previewPlay(['ShowDownCard']);assert.equal(starts.at(-1)[2],12672/44100,'Embedded ShowDownCard must respect native sample count');console.log('PASS original remote-reveal cue uses native12672-sample playback cap');

const channelPlay=installAudio();await new Promise(r=>setImmediate(r));clicks.click();await channelPlay(['Check']);const effectsGain=context.lastTarget,master=context.gain;assert.notEqual(effectsGain,master);assert.equal(effectsGain.gain.value,1);stored.set('river-audio-effects-volume','25');events.storage({storageArea:localStorage,key:'river-audio-effects-volume'});assert.equal(effectsGain.gain.value,.25);await channelPlay(['WinPot']);const tableGain=context.lastTarget;assert.notEqual(tableGain,effectsGain);assert.equal(tableGain.gain.value,1);assert.equal(master.gain.value,.15);stored.set('river-audio-effects-enabled','0');events.storage({storageArea:localStorage,key:'river-audio-effects-enabled'});assert.equal(effectsGain.gain.value,0);assert.equal(tableGain.gain.value,1);stored.set('river-audio-effects-enabled','1');events.storage({storageArea:localStorage,key:'river-audio-effects-enabled'});assert.equal(effectsGain.gain.value,.25);console.log('PASS source channel graph:independent table/effects gains,master composition and live off/on');
