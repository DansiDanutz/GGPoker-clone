import {battleBounty,readBattleBountyArchive} from './battle-bounty.mjs';
import {battleQualification} from './battle-qualification.mjs';
import {battleRush} from './battle-rush.mjs';
export function battleSettings(value){
 if(!value||Object.keys(value).filter(k=>k!=='prizeShares').sort().join(',')!=='blind,capacity,entryCost,finalSeats,id,name,rushDurationMs,stack'||typeof value.id!=='string'||!/^[a-z0-9-]{1,40}$/.test(value.id)||typeof value.name!=='string'||!value.name.trim()||value.name.length>60||!Number.isSafeInteger(value.capacity)||value.capacity<6||value.capacity>100||!Number.isSafeInteger(value.blind)||value.blind<2||value.blind%2||!Number.isSafeInteger(value.stack)||value.stack<value.blind*4||value.stack>1000000||!Number.isSafeInteger(value.finalSeats)||value.finalSeats<2||value.finalSeats>6||value.finalSeats>=value.capacity||!Number.isSafeInteger(value.entryCost)||value.entryCost<0||value.entryCost>1000000||!Number.isSafeInteger(value.rushDurationMs)||value.rushDurationMs<1||value.rushDurationMs>86400000)throw Error('Invalid local Battle Royale settings');
 if(value.prizeShares!==undefined&&(!Array.isArray(value.prizeShares)||value.prizeShares.length<1||value.prizeShares.length>value.finalSeats||Array.from(value.prizeShares).some((n,i)=>!Number.isInteger(n)||n<1||n>100||i>0&&n>value.prizeShares[i-1])||value.prizeShares.reduce((a,b)=>a+b,0)!==100))throw Error('Invalid Battle prize shares');
 return structuredClone(value);
}
export function battleModel(event){return battleRush(event.registrations.map(id=>({id,stack:event.settings.stack})),{eventId:event.settings.id,blind:event.settings.blind,finalSeats:event.settings.finalSeats,startedAt:event.startedAt,rushEndsAt:event.startedAt+event.settings.rushDurationMs},event.checkpoint)}
export function readBattleEvent(value){
 try{
  if(!value||Object.keys(value).filter(k=>!['qualification','finalRoom','payouts','bounty'].includes(k)).sort().join(',')!=='checkpoint,registrations,revision,settings,startedAt'||!Number.isSafeInteger(value.revision)||value.revision<0)throw Error();
  const settings=battleSettings(value.settings);
  if(!Array.isArray(value.registrations)||value.registrations.length>settings.capacity||new Set(value.registrations).size!==value.registrations.length||value.registrations.some(a=>typeof a!=='string'||!/^[a-z0-9][a-z0-9_-]{1,19}$/.test(a)))throw Error();
  if(value.checkpoint===null){if(value.startedAt!==null||value.registrations.length>=settings.capacity)throw Error()}
  else{if(typeof value.checkpoint!=='string'||value.registrations.length!==settings.capacity||!Number.isSafeInteger(value.startedAt)||value.startedAt<0||!Number.isSafeInteger(value.startedAt+settings.rushDurationMs))throw Error();battleModel(value)}
  if(value.qualification!==undefined){if(typeof value.qualification!=='string'||value.checkpoint===null)throw Error();battleQualifier(value)}
  if(value.finalRoom!==undefined&&(typeof value.finalRoom!=='string'||!/^[a-f0-9]{48}$/.test(value.finalRoom)||value.qualification===undefined||battleQualifier(value).view().phase!=='final-ready'))throw Error();
  if(value.payouts!==undefined){
   if(settings.prizeShares===undefined||!Array.isArray(value.payouts)||value.payouts.length<1||value.payouts.some(p=>!p||Object.keys(p).sort().join(',')!=='account,amount,place'||!value.registrations.includes(p.account)||!Number.isSafeInteger(p.amount)||p.amount<0||!Number.isInteger(p.place)||p.place<1))throw Error();
   if(value.finalRoom===undefined){const q=battleQualifier(value).view(),p=value.payouts[0];if(q.phase!=='final-ready'||q.qualified.length!==1||value.payouts.length!==1||p.account!==q.qualified[0].id||p.place!==1||p.amount!==settings.capacity*settings.entryCost)throw Error()}
   else if(value.payouts.length<2)throw Error();
  }
  if(value.bounty!==undefined){
   const b=value.bounty;if(!b||Object.keys(b).filter(k=>k!=='hands').sort().join(',')!=='capital,checkpoint,items,reason'||typeof b.reason!=='string'||!b.reason.trim()||b.reason.length>200||typeof b.checkpoint!=='string')throw Error();const ledger=battleBounty(b.items,b.capital,b.checkpoint).summary();if(b.items.reduce((n,p)=>n+p.frequency,0)<settings.finalSeats-1)throw Error();
   if(b.hands!==undefined)readBattleBountyArchive(b.hands,ledger.awards,ledger.awards.length?battleQualifier(value).view().qualified.map(p=>p.id):[],settings.capacity*settings.stack);
   if(ledger.awards.length){if(value.finalRoom===undefined)throw Error();const accounts=battleQualifier(value).view().qualified.map(p=>p.id);if(ledger.awards.some(a=>!accounts.includes(a.victim)||a.hunters.some(p=>!accounts.includes(p.account))))throw Error()}
  }
  return structuredClone(value);
 }catch{throw Error('Invalid Battle Royale event checkpoint')}
}

export function battleQualifier(event){const rush=battleModel(event);return battleQualification(rush.qualification(),{finalSeats:event.settings.finalSeats,blind:event.settings.blind},event.qualification??null)}
