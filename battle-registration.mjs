import {battleQualification} from './battle-qualification.mjs';
import {battleRush} from './battle-rush.mjs';
export function battleSettings(value){
 if(!value||Object.keys(value).sort().join(',')!=='blind,capacity,entryCost,finalSeats,id,name,rushDurationMs,stack'||typeof value.id!=='string'||!/^[a-z0-9-]{1,40}$/.test(value.id)||typeof value.name!=='string'||!value.name.trim()||value.name.length>60||!Number.isSafeInteger(value.capacity)||value.capacity<6||value.capacity>100||!Number.isSafeInteger(value.blind)||value.blind<2||value.blind%2||!Number.isSafeInteger(value.stack)||value.stack<value.blind*4||value.stack>1000000||!Number.isSafeInteger(value.finalSeats)||value.finalSeats<2||value.finalSeats>6||value.finalSeats>=value.capacity||!Number.isSafeInteger(value.entryCost)||value.entryCost<0||value.entryCost>1000000||!Number.isSafeInteger(value.rushDurationMs)||value.rushDurationMs<1||value.rushDurationMs>86400000)throw Error('Invalid local Battle Royale settings');
 return structuredClone(value);
}
export function battleModel(event){return battleRush(event.registrations.map(id=>({id,stack:event.settings.stack})),{eventId:event.settings.id,blind:event.settings.blind,finalSeats:event.settings.finalSeats,startedAt:event.startedAt,rushEndsAt:event.startedAt+event.settings.rushDurationMs},event.checkpoint)}
export function readBattleEvent(value){
 try{
  if(!value||Object.keys(value).filter(k=>!['qualification','finalRoom'].includes(k)).sort().join(',')!=='checkpoint,registrations,revision,settings,startedAt'||!Number.isSafeInteger(value.revision)||value.revision<0)throw Error();
  const settings=battleSettings(value.settings);
  if(!Array.isArray(value.registrations)||value.registrations.length>settings.capacity||new Set(value.registrations).size!==value.registrations.length||value.registrations.some(a=>typeof a!=='string'||!/^[a-z0-9][a-z0-9_-]{1,19}$/.test(a)))throw Error();
  if(value.checkpoint===null){if(value.startedAt!==null||value.registrations.length>=settings.capacity)throw Error()}
  else{if(typeof value.checkpoint!=='string'||value.registrations.length!==settings.capacity||!Number.isSafeInteger(value.startedAt)||value.startedAt<0||!Number.isSafeInteger(value.startedAt+settings.rushDurationMs))throw Error();battleModel(value)}
  if(value.qualification!==undefined){if(typeof value.qualification!=='string'||value.checkpoint===null)throw Error();battleQualifier(value)}
  if(value.finalRoom!==undefined&&(typeof value.finalRoom!=='string'||!/^[a-f0-9]{48}$/.test(value.finalRoom)||value.qualification===undefined||battleQualifier(value).view().phase!=='final-ready'))throw Error();
  return structuredClone(value);
 }catch{throw Error('Invalid Battle Royale event checkpoint')}
}

export function battleQualifier(event){const rush=battleModel(event);return battleQualification(rush.qualification(),{finalSeats:event.settings.finalSeats,blind:event.settings.blind},event.qualification??null)}
