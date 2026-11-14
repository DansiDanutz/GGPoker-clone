import {loadSpinInsuranceArt,drawSpinInsurance} from './spin-insurance-render.mjs';
import {loadSpinInsuranceGlow,drawSpinInsuranceGlow,spinInsuranceGlowFrameIndex} from './spin-insurance-glow.mjs';
import {spinInsurancePresentation} from './spin-insurance-presentation.mjs';
import {spinWheelFlares} from './spin-wheel-flares.mjs';
import {spinWheelWaitMotion} from './spin-wheel-wait-motion.mjs';
import {spinWheelWaitLights} from './spin-wheel-wait.mjs';
import {loadSpinWheelArt,drawSpinWheel} from './spin-wheel-render.mjs';
import {spinWheelPresentation,spinWheelMotionType,spinWheelCues} from './spin-wheel-presentation.mjs';
import {loadSpinCongratulations,drawSpinCongratulations,spinCongratulationFrameIndex} from './spin-congratulations.mjs';
export function installSpinWheelScene(host,getState,acknowledge,play,insurancePosition,presentationId){
 let active=null,windowActive=true;
 const activation=enabled=>{windowActive=enabled;active?.wait?.activate(enabled);active?.waitMotion?.activate(enabled)};
 addEventListener('blur',()=>activation(false));addEventListener('focus',()=>activation(true));
 const dispose=()=>{const e=active;if(!e)return;active=null;cancelAnimationFrame(e.raf);e.player?.cancel();e.insurance?.cancel();e.insuranceImage&&(e.insuranceImage.src='');for(const a of Object.values(e.insuranceArt||{}))a?.close?.();e.wait?.cancel();e.waitMotion?.cancel();e.flares?.cancel();for(const stop of e.stops)stop?.();for(const value of Object.values(e.art||{}))value?.close?.();e.prize?.image?.close?.();e.node.remove()};
 const alive=e=>active===e;
 function fail(e,error){if(!alive(e))return;cancelAnimationFrame(e.raf);for(const stop of e.stops)stop?.();e.status.hidden=false;e.status.textContent=e.finished?'Spin completion could not be confirmed. Retry to recover your table.':'Spin could not load. Retry to continue.';e.retry.hidden=false;e.retry.onclick=()=>{e.retry.hidden=true;if(e.finished)finish(e);else{dispose();update()}};console.error('Spin presentation:',error.message)}
 async function finish(e){if(!alive(e))return;e.finished=true;e.canvas.hidden=true;e.status.hidden=false;e.status.textContent='Waiting for the other players…';try{if(await acknowledge()===false)throw Error('Completion was not saved')}catch(error){fail(e,error)}}
 async function insuranceThenFinish(e){
  const awards=getState()?.spin?.insuranceAwards||[];if(!awards.length){finish(e);return}
  try{
   e.node.dataset.phase='insurance-loading';e.status.hidden=false;e.status.textContent='Loading insurance award…';
   e.insuranceArt=await loadSpinInsuranceArt();if(!alive(e)){for(const a of Object.values(e.insuranceArt))a?.close?.();return}const light=await loadSpinInsuranceGlow();await play.preloadSpinInsurance?.();if(!alive(e))return;
   for(const a of awards)if(!Number.isInteger(a.seat)||a.seat<0||a.seat>2||!Number.isSafeInteger(a.amount)||a.amount<=0)throw Error('Invalid committed insurance award');
   if(typeof presentationId!=='string'||!/^[a-f0-9]{48}$/.test(presentationId))throw Error('Invalid insurance presentation identity');const soundKey='river-spin-insurance-seen:'+presentationId+':'+getState().me,playSound=sessionStorage.getItem(soundKey)!=='1';sessionStorage.setItem(soundKey,'1');e.node.dataset.insuranceSound=playSound?'1':'0';e.insurance=spinInsurancePresentation((-90+Math.random()*180)*Math.PI/180,(-90+Math.random()*180)*Math.PI/180,playSound);e.status.hidden=true;let previous=performance.now(),index=-1;
   async function tick(){if(!alive(e))return;try{const now=performance.now(),pose=e.insurance.tick(now-previous);previous=now;e.ctx.clearRect(0,0,1700,1200);e.node.dataset.phase='insurance';e.node.dataset.insuranceAwards=String(awards.length);
    if(!pose.done){const next=spinInsuranceGlowFrameIndex(pose.elapsedMs);if(next!==null&&next!==index){const image=await light.frame(next);if(!alive(e)){image.src='';return}if(e.insuranceImage)e.insuranceImage.src='';e.insuranceImage=image;index=next}for(const a of awards){const position=insurancePosition(a.seat);if(!position||!['x','y','scale'].every(k=>Number.isFinite(position[k]))||position.scale<=0)throw Error('Invalid insurance seat position');e.ctx.save();try{e.ctx.translate(position.x,position.y);e.ctx.scale(position.scale,position.scale);if(next!==null)drawSpinInsuranceGlow(e.ctx,e.insuranceImage,0,0,pose.elapsedMs);drawSpinInsurance(e.ctx,e.insuranceArt,String(a.amount),pose,0,0)}finally{e.ctx.restore()}}}
    for(const cue of pose.cues)Promise.resolve(play([cue],()=>alive(e))).then(stop=>{if(alive(e))e.stops.push(stop);else stop?.()}).catch(error=>fail(e,error));
    if(pose.done){finish(e);return}e.raf=requestAnimationFrame(tick);
   }catch(error){fail(e,error)}}e.raf=requestAnimationFrame(tick);
  }catch(error){fail(e,error)}
 }
 async function start(e,s){try{
  const response=await fetch('/home-art/native-spin-wheel-motion.json',{signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('Native wheel motion unavailable');const data=await response.json();
  e.art=await loadSpinWheelArt();if(!alive(e)){for(const a of Object.values(e.art))a?.close?.();return}
  const labels=s.spin.wheel.multipliers.map(m=>String(m*s.spin.buyIn));
  if(spinWheelMotionType(s.spin.multiplier)===2){e.congrats=await loadSpinCongratulations();e.prize=await e.congrats.prize(String(s.tournament.pool),s.spin.prizes.filter(Boolean).map(String))}
  await play.preloadSpinWheel?.();if(!alive(e)){e.prize?.image?.close?.();return}
  e.flares=spinWheelFlares();e.wait=spinWheelWaitLights();e.waitMotion=spinWheelWaitMotion();e.wait.activate(windowActive);e.waitMotion.activate(windowActive);e.status.hidden=true;let previous=Math.floor(performance.now()),frameIndex=-1,frame;
  async function tick(){if(!alive(e))return;try{const now=Math.floor(performance.now()),delta=now-previous;previous=now;let pose;
   if(!getState()?.names.every(Boolean)){const lights=e.wait.tick(delta);pose={...e.waitMotion.tick(delta),phase:'waiting',waitLights:lights,cues:lights.baseSound?[spinWheelCues.waitBase]:[]}}
   else{if(!e.player){e.wait.cancel();e.waitMotion.cancel();e.player=spinWheelPresentation(data,s.spin.wheel.wheelIndex,Math.floor(Math.random()*4)+1,s.spin.multiplier)}pose=e.player.tick(delta)}
   pose.flares=e.flares.tick(delta,pose.phase==='waiting');
   for(const cue of pose.cues)Promise.resolve(play([cue],()=>alive(e))).then(stop=>{if(alive(e))e.stops.push(stop);else stop?.()}).catch(error=>fail(e,error));
   if(pose.congratulation){const index=spinCongratulationFrameIndex(pose.congratulation.elapsedMs);if(index!==frameIndex){frame=await e.congrats.frame(index);frameIndex=index}if(!alive(e))return}
   e.node.dataset.phase=pose.phase;e.node.dataset.rotation=String(pose.wheel);drawSpinWheel(e.ctx,e.art,labels,pose);if(pose.congratulation)drawSpinCongratulations(e.ctx,frame,pose.congratulation,e.prize);
   if(pose.done){insuranceThenFinish(e);return}e.raf=requestAnimationFrame(tick);
  }catch(error){fail(e,error)}}
  e.raf=requestAnimationFrame(tick);
 }catch(error){fail(e,error)}}
 function update(){const s=getState(),p=s?.spin?.presentation,eligible=s?.me!=null&&p?.pending&&!p.complete;
  if(!eligible){dispose();return}if(active&&active.seat!==s.me)dispose();if(active)return;
  const node=document.createElement('div');node.className='nativeSpinScene';node.style.cssText='position:absolute;inset:0;z-index:90;display:grid;place-items:center;pointer-events:auto';node.setAttribute('role','status');
  const canvas=document.createElement('canvas');canvas.width=1700;canvas.height=1200;canvas.style.cssText='position:absolute;width:100%;height:100%;inset:0;pointer-events:none';
  const status=document.createElement('span');status.textContent='Loading Spin…';status.style.cssText='position:relative;color:white;background:#161616;padding:8px';const retry=document.createElement('button');retry.type='button';retry.textContent='Retry';retry.hidden=true;retry.style.position='relative';node.append(canvas,status,retry);host.append(node);
  const e=active={seat:s.me,node,canvas,ctx:canvas.getContext('2d'),status,retry,raf:0,stops:[]};start(e,s);
 }
 addEventListener('pagehide',dispose);return {update,dispose};
}
