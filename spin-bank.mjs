import {spinPayouts,spinOutcome} from './engine/spin.mjs';
// Local operator capitalization only; native private administration was not observed.
const limit=1000000000,fail=(status,message)=>{throw Object.assign(Error(message),{status})};
export function spinBank(state={version:1,available:0,funded:0,sequence:0,events:[]}){
 const validAmount=n=>Number.isSafeInteger(n)&&n>=1&&n<=limit;
 const validId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(id);
 const exposure=buyIn=>Math.max(...spinPayouts(buyIn).map(row=>row.prizePool))-3*buyIn;
 const reservations=[2,3].includes(state?.version)?state.reservations:[];
 if(!Array.isArray(reservations)||reservations.length>10000||new Set(reservations.map(r=>r?.id)).size!==reservations.length||reservations.some(r=>!r||Object.keys(r).some(k=>!(state.version===3?['id','buyIn','amount','cancelled','ticket','settledAtSequence']:['id','buyIn','amount','cancelled']).includes(k))||!validId(r.id)||![5000,10000].includes(r.buyIn)||r.amount!==exposure(r.buyIn)||typeof r.cancelled!=='boolean'||(r.ticket===undefined)!==(r.settledAtSequence===undefined)||r.ticket!==undefined&&(r.cancelled||!Number.isSafeInteger(r.ticket)||r.ticket<0||r.ticket>=100000000||!Number.isSafeInteger(r.settledAtSequence)||r.settledAtSequence<1||r.settledAtSequence>state.sequence)))throw Error('Invalid Spin reservations');
 const net=(before=Infinity)=>reservations.reduce((n,r)=>n+(r.ticket!==undefined&&r.settledAtSequence<before?3*r.buyIn-spinOutcome(r.buyIn,r.ticket).prizePool:0),0);
 const held=()=>reservations.reduce((n,r)=>n+(r.cancelled||r.ticket!==undefined?0:r.amount),0);
 if(!state||Object.keys(state).some(k=>!([2,3].includes(state.version)?['version','available','funded','sequence','events','reservations']:['version','available','funded','sequence','events']).includes(k))||![1,2,3].includes(state.version)||!Number.isSafeInteger(state.available)||state.available<0||!Number.isSafeInteger(state.funded)||!Number.isSafeInteger(state.funded+net())||state.available+held()!==state.funded+net()||!Number.isSafeInteger(state.sequence)||state.sequence<0||state.funded<state.sequence||!Array.isArray(state.events)||state.events.length!==Math.min(state.sequence,100))throw Error('Invalid Spin bank checkpoint');
 if(state.events.some(e=>!e||Object.keys(e).some(k=>!['sequence','amount','reason','at','available','reserved'].includes(k))||!validAmount(e.amount)||typeof e.reason!=='string'||!e.reason.trim()||e.reason!==e.reason.trim()||e.reason.length>200||!Number.isSafeInteger(e.at)||e.at<0||!Number.isSafeInteger(e.available)||e.available<0||!Number.isSafeInteger(e.reserved===undefined?0:e.reserved)||(e.reserved===undefined?0:e.reserved)<0))throw Error('Invalid Spin bank audit');
 let balance=state.funded-state.events.reduce((n,e)=>n+e.amount,0),sequence=state.sequence-state.events.length;
 if(balance<sequence||balance>sequence*limit)throw Error('Invalid Spin bank funding total');
 for(const e of state.events){balance+=e.amount;if(e.sequence!==++sequence||!Number.isSafeInteger(balance+net(e.sequence))||e.available+(e.reserved===undefined?0:e.reserved)!==balance+net(e.sequence))throw Error('Invalid Spin bank audit')}
 function next(){const n=state.sequence+1;if(!Number.isSafeInteger(n))fail(409,'Spin bank sequence limit reached');return n}
 return {state,summary(){return {...structuredClone(state),reserved:held(),net:net(),nextSequence:state.sequence<Number.MAX_SAFE_INTEGER?state.sequence+1:null}},fund(command){
  if(!command||typeof command!=='object'||Array.isArray(command)||Object.keys(command).some(k=>!['sequence','amount','reason'].includes(k))||!Number.isSafeInteger(command.sequence)||command.sequence<1||!validAmount(command.amount)||typeof command.reason!=='string'||!command.reason.trim()||command.reason.length>200)fail(400,'Choose whole play credits from1 to1000000000 and a reason up to200 characters');
  const reason=command.reason.trim(),last=state.events.at(-1);if(last&&command.sequence===last.sequence&&command.amount===last.amount&&reason===last.reason)return structuredClone(last);
  if(command.sequence!==next())fail(409,'Spin bank sequence changed; reload the bank and inspect funding activity');const available=state.available+command.amount;if(!Number.isSafeInteger(available)||!Number.isSafeInteger(state.funded+command.amount)||!Number.isSafeInteger(state.funded+net()+command.amount))fail(409,'Spin bank total limit reached');
  const receipt={sequence:command.sequence,amount:command.amount,reason,at:Date.now(),available,...(held()?{reserved:held()}: {})};state.available=available;state.funded+=command.amount;state.sequence=command.sequence;state.events.push(receipt);if(state.events.length>100)state.events.shift();return structuredClone(receipt);
 },reserve(id,buyIn){
  if(!validId(id)||![5000,10000].includes(buyIn))fail(400,'Invalid Spin match identity or stake');
  const prior=reservations.find(r=>r.id===id);if(prior){if(prior.buyIn!==buyIn||prior.cancelled||prior.ticket!==undefined)fail(409,'Spin reservation identity was already used');return structuredClone(prior)}
  const amount=exposure(buyIn);if(state.available<amount)fail(409,'Spin bank cannot cover the full jackpot');if(reservations.length>=10000)fail(409,'Spin reservation history limit reached');
  const receipt={id,buyIn,amount,cancelled:false};state.version=Math.max(state.version,2);state.reservations=reservations;state.available-=amount;reservations.push(receipt);return structuredClone(receipt);
 },cancel(id){
  if(!validId(id))fail(400,'Invalid Spin match identity');const receipt=reservations.find(r=>r.id===id);if(!receipt)fail(404,'Spin reservation not found');if(receipt.ticket!==undefined)fail(409,'Spin prize is already settled');if(!receipt.cancelled){state.available+=receipt.amount;receipt.cancelled=true}return structuredClone(receipt);
 },settle(id,ticket){
  if(!validId(id)||!Number.isSafeInteger(ticket)||ticket<0||ticket>=100000000)fail(400,'Invalid Spin settlement');const receipt=reservations.find(r=>r.id===id);if(!receipt)fail(404,'Spin reservation not found');if(receipt.cancelled)fail(409,'Spin reservation was cancelled');if(receipt.ticket!==undefined){if(receipt.ticket!==ticket)fail(409,'Spin prize was already settled');return structuredClone(receipt)}
  const delta=3*receipt.buyIn-spinOutcome(receipt.buyIn,ticket).prizePool,available=state.available+receipt.amount+delta;if(!Number.isSafeInteger(available)||available<0||!Number.isSafeInteger(state.funded+net()+delta))fail(409,'Spin bank total limit reached');receipt.ticket=ticket;receipt.settledAtSequence=state.sequence;state.version=3;state.available=available;return structuredClone(receipt);
 }};
}
