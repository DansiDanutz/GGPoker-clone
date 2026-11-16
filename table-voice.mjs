import {isVoicePackId,voiceCue} from './voice-packs.mjs';

export function validVoiceStamps(trace){return trace===undefined||!!trace&&Array.isArray(trace.actions)&&trace.actions.every(action=>!!action&&typeof action==='object'&&(!Object.hasOwn(action,'voicePackId')||isVoicePackId(action.voicePackId)))}

// TableMediator.onAction: the voice uses the actor's event-time pack,not the listener's preference.
export function traceVoiceEvents(trace,from=0,variant='holdem'){
 if(!['holdem','rush','plo','plo5','plo6','shortdeck','aof'].includes(variant)||!Array.isArray(trace?.opening?.bets)||!trace.opening.bets.length||!trace.opening.bets.every(value=>Number.isSafeInteger(value)&&value>=0)||!Array.isArray(trace.actions)||!Number.isSafeInteger(from)||from<0||from>trace.actions.length)return [];
 const events=[];let street=0,price=Math.max(...trace.opening.bets);
 for(const [index,action]of trace.actions.entries()){
  if(!action||!Number.isInteger(action.seat)||action.seat<0||action.seat>=trace.opening.bets.length||![0,3,4,5].includes(action.street)||action.street<street||!['fold','check','call','raise'].includes(action.action)||!Number.isSafeInteger(action.bet)||action.bet<0||typeof action.allIn!=='boolean')return [];
  if(action.street!==street){street=action.street;price=0}
  let name;
  if(action.action==='fold')name=street===0?null:'FOLD';
  else if(variant==='aof'||action.allIn&&action.action!=='call')name='ALL_IN';
  else name=action.action==='raise'?(price===0?'BET':'RAISE'):action.action.toUpperCase();
  price=Math.max(price,action.bet);
  // Historical actions without a canonical stamp stay silent;never backfill from current profiles.
  if(index>=from&&name&&isVoicePackId(action.voicePackId))events.push({index,seat:action.seat,street,voicePackId:action.voicePackId,cue:voiceCue(action.voicePackId,name)});
 }
 return events;
}
