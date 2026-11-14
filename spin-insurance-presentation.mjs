import {spinInsuranceMotion} from './spin-insurance-motion.mjs';
export const spinInsuranceCues={text:'SngInsuranceText',coin:'SngPrizeCheers',amount:'SngPrizeDaller'};
export function spinInsurancePresentation(coinStartRotation,coinEndRotation){
 spinInsuranceMotion(0,coinStartRotation,coinEndRotation);let elapsed=0,previous=-1,cancelled=false;
 return {cancel(){cancelled=true},tick(deltaMs){
  if(!Number.isFinite(deltaMs)||deltaMs<0||!Number.isFinite(elapsed+deltaMs))throw Error('Invalid insurance presentation delta');
  if(cancelled)return {done:true,cues:[]};elapsed=Math.min(5200,elapsed+deltaMs);
  const cues=[[0,spinInsuranceCues.text],[2000,spinInsuranceCues.coin],[3200,spinInsuranceCues.amount]].filter(([at])=>at>previous&&at<=elapsed).map(([,cue])=>cue);previous=elapsed;
  return {...spinInsuranceMotion(elapsed,coinStartRotation,coinEndRotation),elapsedMs:elapsed,cues};
 }};
}
