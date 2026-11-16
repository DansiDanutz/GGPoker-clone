import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {voicePacks,voiceActions,voicePack,isVoicePackId,voiceCue,voiceCarouselLayout,voiceCueSamples,isVoiceCue} from './voice-packs.mjs';
const centered=voiceCarouselLayout(0);
assert.equal(centered.length,14);
assert.deepEqual(centered[0],{slot:0,x:0,radius:60,dim:0,primary:true});
assert.deepEqual(centered[1],{slot:1,x:131,radius:36,dim:.15,primary:false});
assert.equal(centered[2].x,216);assert.equal(centered[13].x,-131);
assert.equal(centered[7].slot,-7);assert.equal(centered[7].dim,.6);
assert.equal(voiceCarouselLayout(13)[0].x,131);
assert.deepEqual(voiceCarouselLayout(14),centered);
const midway=voiceCarouselLayout(0,.5);
assert.equal(midway[0].x,65.5);assert.equal(midway[0].radius,48);assert.equal(midway[0].primary,true);
assert.equal(midway[13].x,-65.5);assert.equal(midway[13].radius,48);
assert.deepEqual(voiceCarouselLayout(0,99),voiceCarouselLayout(0,2));
assert.deepEqual(voiceCarouselLayout(0,-99),voiceCarouselLayout(0,-2));
console.log('PASS native cyclic carousel offsets,131/85 spacing,36–60 radii,dim cap and bounded transition phase');
assert.equal(voicePacks.length,14);assert.equal(voiceActions.length,7);
assert.deepEqual(voicePacks.map(p=>p.id),['VDaniel','VDoyle','VGreg','VSophia','VOliver','VNoah','VOlivia','VAva','VWilliams','VAmelia','VJames','VEmma','VKevin','VMichael']);
assert.equal(voicePack(null).id,'VDaniel');for(const bad of [null,undefined,0,{},[],true,'__proto__','constructor','../VDaniel','VoiceBetDaniel','VWilliam']){assert.equal(isVoicePackId(bad),false);assert.equal(voicePack(bad).id,'VDaniel')}
assert.equal(voicePack('Vmale1').id,'VJames');assert.equal(voicePack('Vfemale5').id,'VAva');assert.equal(voicePack('Vmale4').id,'VDaniel','Original singular legacy alias does not match canonical VWilliams;preserve fallback rather than silently invent a mapping');
assert.equal(voiceCue('VDaniel','ALL_IN'),'VoiceAllinDaniel');assert.equal(voiceCue('VWilliams','BET'),'VoiceBetWilliam');assert.equal(voiceCue('VMichael','STRADDLE'),'VoiceStraddleMichael');assert.equal(voiceCue('invalid','CALL'),'VoiceCallDaniel');for(const action of ['raise','Unknown','__proto__',null,{},1])assert.equal(voiceCue('VDaniel',action),null);
const cues=voicePacks.flatMap(pack=>voiceActions.map(action=>voiceCue(pack.id,action.id)));assert.equal(new Set(cues).size,98);assert.ok(cues.every(c=>/^Voice(?:Allin|Raise|Bet|Check|Call|Fold|Straddle)[A-Za-z]+$/.test(c)));
assert.ok(Object.isFrozen(voicePacks)&&Object.isFrozen(voiceActions)&&voicePacks.every(Object.isFrozen)&&voiceActions.every(Object.isFrozen));assert.throws(()=>{voicePacks[0].id='other'},TypeError);assert.equal(voicePack('VDaniel').id,'VDaniel');
console.log('PASS original14-pack order/default/legacy fallback,seven actions,98 distinct safe symbols,William spelling,invalid selectors and immutable catalog');

const original=JSON.parse(readFileSync(new URL('./docs/rea/action-voice-source.json',import.meta.url)));assert.deepEqual(new Set(cues),new Set(original.sounds.map(row=>row.symbol)));assert.deepEqual(new Set(voicePacks.map(p=>p.id)),new Set(original.images.map(row=>row.pack)));assert.ok(original.sounds.every(row=>row.sampleRate===44100&&row.samples>0&&row.bytes>1000));console.log('PASS model catalog agrees with all98 original sound bindings and14 image identities');
assert.equal(Object.keys(voiceCueSamples).length,98);assert.ok(Object.isFrozen(voiceCueSamples));
for(const row of original.sounds){assert.equal(voiceCueSamples[row.symbol],row.samples);assert.equal(isVoiceCue(row.symbol),true)}
for(const bad of [null,undefined,1,{},[],true,'__proto__','constructor','../VoiceBetDaniel','VoiceBetWilliamExtra','VoiceBetVWilliam'])assert.equal(isVoiceCue(bad),false);
console.log('PASS exact98-cue whitelist and original DefineSound sample durations');
