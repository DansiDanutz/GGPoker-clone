import {spinWheelMotion} from './spin-wheel-motion.mjs';
export const spinWheelCues=Object.freeze({start:'SpinAndGoldSpin',high:'SNGWheelStuckHigh',low:'SNGWheelStuckLow',fireworks:'SngFireworks',out:'SNGWheelOut',bigWin:'SngBigWin'});
// SpinAndGoldWheelData.motionType: normal cash-award 3-Max, not ticket/WSOP or 6-Max rules.
export function spinWheelMotionType(multiplier){if(!Number.isSafeInteger(multiplier)||multiplier<1)throw Error('Invalid Spin multiplier');return multiplier<=5?0:multiplier<=25?1:2}
export function spinWheelPresentation(data,wheelIndex,variant,multiplier){
 const motion=spinWheelMotion(data,wheelIndex,variant),type=spinWheelMotionType(multiplier),hold=[500,4500,9500][type];let phase='spin',time=0,first=true,pose={wheel:0,arrow:0};
 const enter=next=>{phase=next;time=0};
 return {cancel(){enter('cancelled')},tick(elapsedMs){
  if(!Number.isFinite(elapsedMs)||elapsedMs<0||!Number.isSafeInteger(Math.ceil(elapsedMs/33)))throw Error('Invalid wheel presentation elapsed time');
  const cues=[];
  if(phase==='spin'){
   if(first){first=false;cues.push(spinWheelCues.start)}pose=motion.tick(elapsedMs);if(pose.high)cues.push(spinWheelCues.high);if(pose.low)cues.push(spinWheelCues.low);
   if(pose.done){enter('prize');if(type===2)cues.push(spinWheelCues.fireworks)}
  }else if(!['complete','cancelled'].includes(phase)){
   time=Math.min(100000,time+elapsedMs);
   if(phase==='prize'&&time>=hold){enter('exit');cues.push(spinWheelCues.out)}
   else if(phase==='exit'&&time>=700){enter(type===2?'celebration':'complete');if(type===2)cues.push(spinWheelCues.bigWin)}
   else if(phase==='celebration'&&time>=8000)enter('celebrationExit');
   else if(phase==='celebrationExit'&&time>=700)enter('complete');
  }
  const done=['complete','cancelled'].includes(phase),exit=phase==='exit'?Math.min(time/700,1)**3:0,celebrating=['celebration','celebrationExit'].includes(phase),progress=1-(1-Math.min(time/700,1))**3,scale=phase==='celebrationExit'?1-progress:progress;
  return {wheel:pose.wheel,arrow:pose.arrow,phase,type,done,cues,wheelAlpha:done||celebrating?0:1-exit,wheelOffsetY:-300*exit,highlight:type>=1&&['prize','exit'].includes(phase),glow:type===2&&['prize','exit'].includes(phase),congratulation:celebrating?{x:387-283*scale,y:387-283*scale,scale,alpha:scale}:null};
 }};
}
