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
