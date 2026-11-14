const fail=(status,message)=>{throw Object.assign(Error(message),{status})};
const time=n=>Number.isSafeInteger(n)&&n>=0,seat=n=>Number.isInteger(n)&&n>=0&&n<9;
const keys=(value,names)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).sort().join(',')===names.split(',').sort().join(',');
export function createRimt(input,now){
 if(!keys(input,'hand,proposer,decider,suggestUntil,decisionMs')||!time(now))fail(400,'Provide explicit RIMT roles and deadlines');
 try{return readRimt({version:1,...input,createdAt:now,proposal:null,proposedAt:null,agreed:null,runs:null,decidedAt:null,reason:null})}catch{fail(400,'Invalid RIMT roles or deadlines')}
}
export function readRimt(value){
 try{
  if(!keys(value,'version,hand,proposer,decider,createdAt,suggestUntil,decisionMs,proposal,proposedAt,agreed,runs,decidedAt,reason')||value.version!==1||!Number.isSafeInteger(value.hand)||value.hand<1||!seat(value.proposer)||!seat(value.decider)||value.proposer===value.decider||!time(value.createdAt)||!time(value.suggestUntil)||value.suggestUntil<=value.createdAt||!Number.isSafeInteger(value.decisionMs)||value.decisionMs<1||!time(value.suggestUntil+value.decisionMs))throw Error();
  const s=value;
  if(s.proposal===null){if(s.proposedAt!==null)throw Error()}
  else if(![1,2,3].includes(s.proposal)||!time(s.proposedAt)||s.proposedAt<s.createdAt||s.proposedAt>=s.suggestUntil)throw Error();
  if(s.runs===null){if(s.proposal===1||s.agreed!==null||s.decidedAt!==null||s.reason!==null)throw Error()}
  else{
   if(![1,2,3].includes(s.runs)||!time(s.decidedAt)||s.decidedAt<s.createdAt)throw Error();
   if(s.reason==='once'){if(s.proposal!==1||s.runs!==1||s.agreed!==null||s.decidedAt!==s.proposedAt)throw Error()}
   else if(s.reason==='agreed'||s.reason==='declined'){
    if(![2,3].includes(s.proposal)||s.agreed!==(s.reason==='agreed')||s.runs!==(s.agreed?s.proposal:1)||s.decidedAt<s.proposedAt||s.decidedAt>=s.proposedAt+s.decisionMs)throw Error();
   }else if(s.reason==='timeout'){
    if(s.proposal===1||s.runs!==1||s.agreed!==null||s.decidedAt<(s.proposal===null?s.suggestUntil:s.proposedAt+s.decisionMs))throw Error();
   }else throw Error();
  }
  return structuredClone(s);
 }catch{throw Error('Invalid RIMT checkpoint')}
}
export function applyRimt(value,command,now){
 const s=readRimt(value),action=command?.action;
 const expected=action==='suggest'?'hand,action,seat,runs':action==='decide'?'hand,action,seat,agreed':action==='expire'?'hand,action':null;
 if(!expected||!keys(command,expected)||!Number.isSafeInteger(command.hand)||command.hand<1||!time(now)||now<s.createdAt||action!=='expire'&&!seat(command.seat)||action==='suggest'&&![1,2,3].includes(command.runs)||action==='decide'&&typeof command.agreed!=='boolean')fail(400,'Invalid RIMT command');
 if(command.hand!==s.hand)fail(409,'RIMT hand changed');
 if(action==='suggest'&&command.seat!==s.proposer||action==='decide'&&command.seat!==s.decider)fail(409,'This seat cannot make that RIMT choice');
 if(action==='suggest'&&s.proposal!==null){if(command.runs===s.proposal)return s;fail(409,'RIMT proposal already recorded')}
 if(action==='decide'&&s.agreed!==null){if(command.agreed===s.agreed)return s;fail(409,'RIMT decision already recorded')}
 const deadline=s.proposal===null?s.suggestUntil:s.proposedAt+s.decisionMs;
 if(action==='expire'){
  if(s.runs!==null||now<deadline)return s;
  // Explicit local fallback: absent agreement never authorizes extra runs; native timeout policy is unverified.
  s.runs=1;s.reason='timeout';s.decidedAt=now;return readRimt(s);
 }
 if(s.runs!==null||now>=deadline)fail(409,'RIMT choice is closed');
 if(action==='suggest'){
  s.proposal=command.runs;s.proposedAt=now;
  if(command.runs===1){s.runs=1;s.reason='once';s.decidedAt=now}
 }else{
  if(s.proposal===null)fail(409,'Wait for a RIMT proposal');if(now<s.proposedAt)fail(400,'RIMT clock moved before the proposal');
  s.agreed=command.agreed;s.runs=command.agreed?s.proposal:1;s.reason=command.agreed?'agreed':'declined';s.decidedAt=now;
 }
 return readRimt(s);
}
