// VoicePack.list / MyActionVoicePage: normal local catalog; operator account restrictions are not inferred.
export const voicePacks=Object.freeze([
 ['VDaniel','PCDaniel','Daniel','DanielNegreanu',false],
 ['VDoyle','PCDoyle','Doyle','DoyleBronson',false],
 ['VGreg','PCGreg','Greg','GregGoesAllin',false],
 ['VSophia','VSophia','Sophia','Sophia',true],
 ['VOliver','VOliver','Oliver','Oliver',true],
 ['VNoah','VNoah','Noah','Noah',true],
 ['VOlivia','VOlivia','Olivia','Olivia',true],
 ['VAva','VAva','Ava','Ava',true],
 ['VWilliams','VWilliams','William','William',true],
 ['VAmelia','VAmelia','Amelia','Amelia',true],
 ['VJames','VJames','James','James',true],
 ['VEmma','VEmma','Emma','Emma',true],
 ['VKevin','PCKevin','Kevin','KevinMartin',false],
 ['VMichael','PCMichael','Michael','MichaelMizrachi',false]
].map(([id,subLabelKey,soundSuffix,image,isAi])=>Object.freeze({id,labelKey:id,subLabelKey,soundSuffix,image:'native-action-voice/'+image+'_ActionVoice.png',isAi})));
export const voiceActions=Object.freeze([
 ['ALL_IN','HandSummaryAllIn','Allin'],['RAISE','MobileRaise','Raise'],['BET','HandSummaryBet','Bet'],['CHECK','HandSummaryCheck','Check'],['CALL','HandSummaryCall','Call'],['FOLD','HandSummaryFold','Fold'],['STRADDLE','MobileStraddleTitle','Straddle']
].map(([id,labelKey,soundPart])=>Object.freeze({id,labelKey,soundPart})));
const legacy={Vmale1:'VJames',Vmale2:'VOliver',Vmale3:'VNoah',Vmale4:'VWilliam',Vfemale1:'VOlivia',Vfemale2:'VEmma',Vfemale3:'VSophia',Vfemale4:'VAmelia',Vfemale5:'VAva'};
export function isVoicePackId(id){return voicePacks.some(pack=>pack.id===id)}
export function voicePack(id){const key=typeof id==='string'&&Object.hasOwn(legacy,id)?legacy[id]:id;return voicePacks.find(pack=>pack.id===key)||voicePacks[0]}
export function voiceCue(packId,action){const selected=voiceActions.find(item=>item.id===action);return selected?'Voice'+selected.soundPart+voicePack(packId).soundSuffix:null}
// MyActionVoicePage.VoiceCarousel.layout/posX and VoiceCarouselCell.render.
export function voiceCarouselLayout(index,phase=0){
 const count=voicePacks.length,half=count>>1,offset=Math.max(-2,Math.min(2,phase));
 return voicePacks.map((_,i)=>{
  const slot=((i-index+half)%count+count)%count-half,distance=slot+offset,absolute=Math.abs(distance),selection=Math.max(0,1-absolute);
  return {slot,x:Math.sign(distance)*(absolute<=1?absolute*131:131+(absolute-1)*85),radius:36+24*selection,dim:Math.min(1,absolute/4)*.6,primary:selection>=.5};
 });
}

// Original DefineSound sample counts, VoicePack.list / voiceActions order,44.1kHz.
export const voiceCueSamples=Object.freeze(Object.fromEntries([
 [35712,35712,18432,27648,35712,28800,43776],
 [38016,38016,13824,23040,29952,31104,35712],
 [33408,38016,13824,26496,29952,31104,28800],
 [29952,29952,23040,24192,29952,24192,31104],
 [28800,29952,14976,28800,25344,26496,29952],
 [34560,24192,19584,28800,31104,34560,27648],
 [33408,26496,20736,24192,25344,20736,28800],
 [38016,29952,20736,23040,26496,24192,35712],
 [36864,39168,28800,24192,29952,28800,28800],
 [36864,35712,12672,23040,26496,46080,38016],
 [32256,34560,19584,28800,29952,32256,38016],
 [31104,29952,16128,23040,24192,27648,26496],
 [41472,34560,24192,25344,26496,24192,27648],
 [26496,35712,19584,23040,29952,29952,46080]
].flatMap((samples,i)=>samples.map((count,j)=>[voiceCue(voicePacks[i].id,voiceActions[j].id),count]))));
export function isVoiceCue(name){return typeof name==='string'&&Object.hasOwn(voiceCueSamples,name)}
