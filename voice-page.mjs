import {installVoiceCarousel} from './voice-carousel.mjs';
import {voiceActions,voicePack,voiceCue,isVoicePackId} from './voice-packs.mjs';

export function installVoicePage(host,{player,audio}){
 const doc=host.ownerDocument;let active=false,saving=false,epoch=0,cooldown=null,preview=0;
 const storedVolume=()=>{const raw=localStorage.getItem('river-audio-voice-volume');return raw!==null&&/^\d+$/.test(raw)&&Number(raw)<=100?Number(raw):50};
 host.classList.add('voicePage');
 const style=doc.createElement('style');style.textContent=`
 .voicePage{padding:0!important;font-family:Roboto,Arial,sans-serif;color:#ccc}
 .voicePage h2{position:absolute;left:36px;top:24px;margin:0;font-size:20px;font-weight:400}
 .voicePage .voiceCarousel{position:absolute;left:36px;top:66px}
 .voicePage .voiceActions{position:absolute;left:134px;top:244px;display:flex;gap:8px}
 .voicePage .voiceActions button{width:72px;height:32px;padding:0 5px;border:0;background: url('/home-art/native-action-voice-button.png') center/100% 100%;font:13px Roboto,Arial,sans-serif;color:#ccc;cursor:pointer}
 .voicePage .voiceActions button[aria-pressed=true]{background-image:url('/home-art/native-action-voice-button-active.png')}
 .voicePage .voiceActions button:disabled{cursor:default}
 .voicePage .voiceVolume{position:absolute;left:242px;top:320px;width:336px;height:28px}
 .voicePage #voiceVolume{position:absolute;left:34px;top:2px;width:302px;height:20px;margin:0;accent-color:#aaa}
 .voicePage #voiceMute{position:absolute;left:0;top:1px;width:24px;height:24px;padding:0;border:0;background:url('/home-art/native-action-voice-speaker.png') center/24px 24px;cursor:pointer}
 .voicePage #voiceMute[data-zero=true]{background-image:url('/home-art/native-action-voice-speaker-muted.png')}
 .voicePage #voiceVolumeValue{position:absolute;left:154px;top:30px;font-size:12px}
 .voicePage #applyVoice{position:absolute;left:50%;bottom:30px;transform:translateX(-50%);width:150px;height:36px;border:0;border-radius:4px;background:#398b30;color:white;font-size:18px;cursor:pointer}
 .voicePage #applyVoice:disabled{opacity:.5;cursor:default}
 .voicePage #voiceStatus{position:absolute;left:36px;top:370px;margin:0;font-size:14px}
 `;
 const title=doc.createElement('h2');title.textContent='Action Voice';title.dataset.nativeLabel='ActionVoice';
 const carouselHost=doc.createElement('div'),actions=doc.createElement('div');actions.className='voiceActions';actions.setAttribute('role','group');actions.setAttribute('aria-label','Preview action');
 const volumeBox=doc.createElement('div');volumeBox.className='voiceVolume';
 volumeBox.innerHTML='<button type="button" id="voiceMute" aria-label="Set voice volume to zero"></button><input id="voiceVolume" type="range" min="0" max="100" step="1" aria-label="Voice volume"><output id="voiceVolumeValue" for="voiceVolume"></output>';
 const volume=volumeBox.querySelector('input'),mute=volumeBox.querySelector('button'),output=volumeBox.querySelector('output');
 const apply=doc.createElement('button');apply.type='button';apply.id='applyVoice';apply.textContent='Apply';apply.dataset.nativeLabel='ButtonApply';
 const status=doc.createElement('p');status.id='voiceStatus';status.setAttribute('role','status');
 host.append(style,title,carouselHost,actions,volumeBox,apply,status);
 const carousel=installVoiceCarousel(carouselHost,{selected:player?.voicePackId,onchange:changed});
 const buttons=voiceActions.map(action=>{const button=doc.createElement('button');button.type='button';button.dataset.action=action.id;button.dataset.nativeLabel=action.labelKey;button.textContent=action.id.replace('_','-');button.setAttribute('aria-pressed','false');actions.append(button);
  button.onclick=async()=>{
   if(!active||saving||cooldown!==null)return;
   for(const item of buttons)item.setAttribute('aria-pressed',String(item===button));
   cooldown=setTimeout(()=>{cooldown=null;for(const item of buttons)item.setAttribute('aria-pressed','false');changed()},1000);changed();
   const request=++preview,current=()=>active&&request===preview;
   const started=await audio.preview(voiceCue(carousel.value,action.id),Number(volume.value),current);
   if(!started&&current()&&Number(volume.value)>0)status.textContent='Sound preview unavailable.';
  };return button});
 function changed(){output.value=volume.value+'%';mute.dataset.zero=String(Number(volume.value)===0);apply.disabled=saving||carousel.value===voicePack(player?.voicePackId).id&&Number(volume.value)===storedVolume();volume.disabled=mute.disabled=saving;carouselHost.inert=saving;for(const button of buttons)button.disabled=saving||cooldown!==null}
 volume.oninput=()=>{audio.updatePreview(Number(volume.value));changed()};mute.onclick=()=>{volume.value='0';volume.oninput()};
 apply.onclick=async()=>{
  if(!active||apply.disabled)return;const id=carousel.value,level=Number(volume.value),request=epoch;saving=true;status.textContent='';changed();
  try{
   const response=await fetch('/local/voice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({voicePackId:id})}),data=await response.json();
   if(!response.ok)throw Error(data.error||'Voice could not be saved.');
   if(data.name!==player?.name||!isVoicePackId(data.voicePackId)||data.voicePackId!==id)throw Error('Signed-in account changed. Reload before saving.');
   player.voicePackId=data.voicePackId;localStorage.setItem('river-audio-voice-volume',String(level));
   if(active&&request===epoch)status.textContent='';
  }catch(error){if(active&&request===epoch)status.textContent=error.message}
  finally{saving=false;changed()}
 };
 function deactivate(){if(!active)return;active=false;epoch++;preview++;audio.stopPreview();clearTimeout(cooldown);cooldown=null;for(const button of buttons)button.setAttribute('aria-pressed','false')}
 return {activate(){deactivate();active=true;epoch++;carousel.setSelected(player?.voicePackId);volume.value=String(storedVolume());status.textContent='';changed()},deactivate,destroy(){deactivate();carousel.destroy();host.replaceChildren();host.classList.remove('voicePage')}};
}
