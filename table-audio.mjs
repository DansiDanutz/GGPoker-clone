import {spinWheelCues} from './spin-wheel-presentation.mjs';
export const audioChannels=[{id:'table',label:'Table Sound'},{id:'effects',label:'Sound Effect'}];
export function audioChannel(cue){if(Object.values(spinWheelCues).includes(cue))return 'effects';return ['RabbitCard','RabbitCardDouble','Fold','DealCard','Board','GatherChips','WinPot','ShowCard','ShowDownCard','SqueezeOpen'].includes(cue)?'table':['Check','Call','Bet','Raise','AllIn','ShuffleUp','ShuffleCombine','ShuffleOther','AofButton','TournamentResultFT','TournamentResultITM','TournamentFallResult'].includes(cue)?'effects':null}
export function audioPreviewChoices(id,previous){
 const choices=id==='table'?['Board','DealCard','ShowCard','GatherChips','WinPot','Fold','ShowDownCard','SqueezeOpen']:id==='effects'?['Bet','Call','Raise','Check','AllIn','AofButton']:[];
 return choices.filter(c=>c!==previous);
}
export function readAudioChannel(id){
 if(!audioChannels.some(c=>c.id===id))throw new RangeError('Unknown audio channel');
 const raw=localStorage.getItem('river-audio-'+id+'-volume'),value=raw!==null&&/^\d+$/.test(raw)?Number(raw):NaN;
 return {enabled:localStorage.getItem('river-audio-'+id+'-enabled')!=='0',volume:Number.isInteger(value)&&value>=0&&value<=100?value:100};
}
export function voluntaryReveals(before,after){
 if(!before?.hand||!after?.hand?.end||before.number!==after.number)return [];
 return (after.hand.shownIndices||[]).flatMap((indices,seat)=>(indices||[]).filter(index=>!before.hand.shownIndices?.[seat]?.includes(index)).map(index=>({seat,index,own:seat===after.me})));
}
// DefineSound sample counts; wheel fireworks use22.05kHz, other listed cues44.1kHz.
const cueSamples={SngWheelBaseLight:208512,SngWheelFrameLight:66816,SngWheelFrameEffect:82944,SpinAndGoldSpin:192384,SNGWheelStuckHigh:11520,SNGWheelStuckLow:6912,SngFireworks:46656,SNGWheelOut:126720,SngBigWin:472320,TournamentFallResult:443520,TournamentResultFT:488448,TournamentResultITM:510336,RabbitCard:13824,RabbitCardDouble:27648,ShowDownCard:12672,ShuffleUp:9216,ShuffleCombine:11520,ShuffleOther:116352,ChessClock:9216,TimeBankTick:220500};
export function audioCueDuration(name,decodedSeconds){return cueSamples[name]?Math.min(decodedSeconds,cueSamples[name]/(name==='SngFireworks'?22050:44100)):decodedSeconds}
// Native default clock: sweep .4s, selected-card notifications span 2s, throw .2s, flop spread .3s.
export function showdownPlan(before,after){
 const old=before?.hand,h=after?.hand;
 if(!old||old.end||before.number!==after?.number||!h?.end||old.board.length>=5||h.board.length!==5)return null;
 const seats=(h.cards||[]).flatMap((cards,seat)=>cards&&!h.folded[seat]?[seat]:[]);
 if(seats.length<2)return null;
 const reveals=seats.map((seat,i)=>({seat,at:400+2000/seats.length*(i+1)})),board=[];
 let complete=2400;
 for(let index=old.board.length;index<5;){
  const count=index===0?3:1;complete+=200;
  for(let n=0;n<count;n++)board.push({index:index+n,at:complete,cue:n===0});
  if(index===0)complete+=300;
  index+=count;
 }
 return {number:after.number,reveals,board,complete};
}
export function streetPlan(before,after){
 const old=before?.hand,h=after?.hand;if(!old||!h||old.end||h.end||before.number!==after.number)return null;
 const from=old.board.length,to=h.board.length;if(!(from===0&&to===3||from>=3&&from<5&&to===from+1))return null;
 return {number:after.number,street:true,reveals:[],complete:0,board:Array.from({length:to-from},(_,i)=>({index:from+i,at:200,cue:i===0}))};
}
export function tableCues(before,after){
 const h=after.hand;
 if(!before||!h)return [];
 if(!before.hand||before.number!==after.number)return ['DealCard'];
 const old=before.hand;if(old.end)return [];
 const cues=[],lastPayment=new Map();
 for(const entry of h.history.slice(old.history.length)){
  const [,seat,action]=/^Seat (\d+): (check|call|raise|fold)/.exec(entry)||[];
  if(!action)continue;
  const i=Number(seat)-1;
  if(action==='call'||action==='raise')lastPayment.set(i,cues.length);
  if(action==='raise')cues.push(Math.max(...old.bets)===0?'Bet':'Raise');
  else cues.push(action[0].toUpperCase()+action.slice(1));
 }
 for(const [i,index] of lastPayment)if(old.stacks[i]>0&&h.committed[i]-old.committed[i]===old.stacks[i])cues[index]='AllIn';
 if(h.board.length>old.board.length)cues.push('Board');
 if(h.end)cues.push('WinPot');
 return cues;
}
export function installAudio(button){
 let ctx,gain,resuming,ready=false, enabled=localStorage.getItem('river-muted')!=='1';
 const volume=()=>{const raw=localStorage.getItem('river-volume');const n=raw===null?100:Number(raw);return Number.isInteger(n)&&n>=0&&n<=100?n/100:1};
 const buffers=new Map(),channelGains=new Map();
 function channelTarget(id){if(!id)return gain;if(!channelGains.has(id)){const node=ctx.createGain();node.connect(gain);channelGains.set(id,node)}const value=readAudioChannel(id);channelGains.get(id).gain.value=value.enabled?value.volume/100:0;return channelGains.get(id)}
 const load=name=>{
  if(!buffers.has(name))buffers.set(name,fetch('/table-audio/'+name+'.mp3').then(r=>{if(!r.ok)throw Error();return r.arrayBuffer()}).then(b=>ctx.decodeAudioData(b)).catch(()=>null));
  return buffers.get(name);
 };
 function label(){if(button){const text=enabled?'Sound on':'Sound off';if(button.textContent!==text)button.textContent=text;button.setAttribute('aria-pressed',String(enabled))}}
 fetch('/table-audio/Check.mp3').then(r=>{if(r.ok&&r.headers.get('content-type')==='audio/mpeg'&&window.AudioContext){ready=true;if(button)button.hidden=false;label()}}).catch(()=>{});
 function sync(){const next=localStorage.getItem('river-muted')!=='1';if(next!==enabled&&ctx){if(next)resuming=ctx.resume().catch(()=>{});else ctx.suspend().catch(()=>{})}enabled=next;if(gain)gain.gain.value=enabled?volume():0;for(const [id,node]of channelGains){const value=readAudioChannel(id);node.gain.value=value.enabled?value.volume/100:0}label()}
 function unlock(){if(!ready)return;sync();if(!enabled)return;if(!ctx){ctx=new AudioContext();gain=ctx.createGain();gain.gain.value=volume();gain.connect(ctx.destination)}resuming=ctx.resume().catch(()=>{});}
 document.addEventListener('click',unlock,true);document.addEventListener('click',sync);
 if(button)button.onclick=()=>{enabled=!enabled;localStorage.setItem('river-muted',enabled?'0':'1');if(!enabled&&ctx)ctx.suspend().catch(()=>{});else if(enabled)unlock();label()};
 addEventListener('storage',e=>{if(e.storageArea===localStorage&&(e.key===null||['river-volume','river-muted'].includes(e.key)||audioChannels.some(c=>['river-audio-'+c.id+'-volume','river-audio-'+c.id+'-enabled'].includes(e.key))))sync()});
 const play=async (names,isCurrent=()=>true)=>{
  sync();if(!enabled||!ctx)return;await resuming;sync();if(!enabled||ctx.state!=='running'||!isCurrent())return;
  const clips=await Promise.all(names.map(load));sync();if(!enabled||ctx.state!=='running'||!isCurrent())return;
  const sources=[];let t=ctx.currentTime;for(const [i,clip]of clips.entries()){if(!clip)continue;const source=ctx.createBufferSource();source.buffer=clip;source.connect(channelTarget(audioChannel(names[i])));if(cueSamples[names[i]])source.start(t,0,audioCueDuration(names[i],clip.duration));else source.start(t);sources.push(source);t+=Math.min(.18,clip.duration)}
  return ()=>{for(const source of sources)try{source.stop()}catch{}};
 };
 play.preloadSpinWheel=async()=>ctx?(await Promise.all(Object.values(spinWheelCues).map(load))).every(Boolean):false;
 let previewGeneration=0,previewSource=null,previewGain=null,previewLevel=0,fadeTimer=null,stopTimer=null;
 play.stopPreview=()=>{
  previewGeneration++;clearTimeout(fadeTimer);clearTimeout(stopTimer);fadeTimer=stopTimer=null;
  if(previewSource){try{previewSource.stop()}catch{}previewSource=null}if(previewGain){previewGain.disconnect();previewGain=null}
  sync();if(ctx&&!enabled)ctx.suspend().catch(()=>{});
 };
 play.updatePreview=level=>{if(!Number.isInteger(level)||level<0||level>100)return;previewLevel=level;clearTimeout(fadeTimer);if(previewGain){previewGain.gain.cancelScheduledValues(ctx.currentTime);previewGain.gain.value=volume()*level/100}};
 play.preview=async(name,level,isCurrent=()=>true)=>{
  if(!ready||!Number.isInteger(level)||level<=0||level>100||!audioPreviewChoices(audioChannel(name)).includes(name)||!isCurrent())return false;
  play.stopPreview();const generation=previewGeneration;previewLevel=level;
  if(!ctx){ctx=new AudioContext();gain=ctx.createGain();gain.gain.value=enabled?volume():0;gain.connect(ctx.destination)}
  await ctx.resume().catch(()=>{});const clip=await load(name);
  if(generation!==previewGeneration)return false;if(!clip||!isCurrent()||ctx.state!=='running'){play.stopPreview();return false}
  const node=ctx.createGain(),source=ctx.createBufferSource();previewGain=node;previewSource=source;node.gain.value=volume()*previewLevel/100;node.connect(ctx.destination);source.buffer=clip;source.connect(node);
  const duration=audioCueDuration(name,clip.duration);source.onended=()=>{if(generation===previewGeneration)play.stopPreview()};source.start(ctx.currentTime,0,duration);
  if(duration>=3.5)fadeTimer=setTimeout(()=>{if(generation===previewGeneration&&previewGain){previewGain.gain.setValueAtTime(previewGain.gain.value,ctx.currentTime);previewGain.gain.linearRampToValueAtTime(0,ctx.currentTime+.5)}},3500);
  stopTimer=setTimeout(()=>{if(generation===previewGeneration)play.stopPreview()},4000);return true;
 };
 return play;
}

export function createClockAudio(play){
 let key='',lastAt=-Infinity,generation=0,stops=[];
 return {update(hand,me,now,enabled){
  const clock=hand?.clock,left=(hand?.deadline??0)-now;
  const mode=enabled&&!hand?.end&&clock?.seat===me&&left>0?(clock.phase==='hot'&&left<=5000?'hot':clock.canDisableLimit?'cap':''):'';
  const next=mode?clock.actionId+':'+mode:'';
  if(key!==next){generation++;for(const stop of stops)stop();stops=[];key=next;lastAt=-Infinity}
  if(!mode||mode==='hot'&&lastAt!==-Infinity||mode==='cap'&&now-lastAt<1000)return;
  lastAt=now;const current=generation;
  Promise.resolve(play([mode==='hot'?'TimeBankTick':'ChessClock'],()=>current===generation&&lastAt===now)).then(stop=>{if(!stop)return;if(current!==generation)stop();else stops.push(stop)}).catch(()=>{});
 }};
}
