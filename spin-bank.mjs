// Local operator capitalization only; native private administration was not observed.
const limit=1000000000,fail=(status,message)=>{throw Object.assign(Error(message),{status})};
export function spinBank(state={version:1,available:0,funded:0,sequence:0,events:[]}){
 const validAmount=n=>Number.isSafeInteger(n)&&n>=1&&n<=limit;
 if(!state||Object.keys(state).some(k=>!['version','available','funded','sequence','events'].includes(k))||state.version!==1||!Number.isSafeInteger(state.available)||state.available<0||state.available!==state.funded||!Number.isSafeInteger(state.sequence)||state.sequence<0||state.funded<state.sequence||!Array.isArray(state.events)||state.events.length!==Math.min(state.sequence,100))throw Error('Invalid Spin bank checkpoint');
 if(state.events.some(e=>!e||Object.keys(e).some(k=>!['sequence','amount','reason','at','available'].includes(k))||!validAmount(e.amount)||typeof e.reason!=='string'||!e.reason.trim()||e.reason!==e.reason.trim()||e.reason.length>200||!Number.isSafeInteger(e.at)||e.at<0||!Number.isSafeInteger(e.available)))throw Error('Invalid Spin bank audit');
 let balance=state.funded-state.events.reduce((n,e)=>n+e.amount,0),sequence=state.sequence-state.events.length;
 if(balance<sequence||balance>sequence*limit)throw Error('Invalid Spin bank funding total');
 for(const e of state.events){balance+=e.amount;if(e.sequence!==++sequence||e.available!==balance)throw Error('Invalid Spin bank audit')}
 function next(){const n=state.sequence+1;if(!Number.isSafeInteger(n))fail(409,'Spin bank sequence limit reached');return n}
 return {state,summary(){return {...structuredClone(state),nextSequence:state.sequence<Number.MAX_SAFE_INTEGER?state.sequence+1:null}},fund(command){
  if(!command||typeof command!=='object'||Array.isArray(command)||Object.keys(command).some(k=>!['sequence','amount','reason'].includes(k))||!Number.isSafeInteger(command.sequence)||command.sequence<1||!validAmount(command.amount)||typeof command.reason!=='string'||!command.reason.trim()||command.reason.length>200)fail(400,'Choose whole play credits from1 to1000000000 and a reason up to200 characters');
  const reason=command.reason.trim(),last=state.events.at(-1);if(last&&command.sequence===last.sequence&&command.amount===last.amount&&reason===last.reason)return structuredClone(last);
  if(command.sequence!==next())fail(409,'Spin bank sequence changed; reload the bank and inspect funding activity');const available=state.available+command.amount;if(!Number.isSafeInteger(available))fail(409,'Spin bank total limit reached');
  const receipt={sequence:command.sequence,amount:command.amount,reason,at:Date.now(),available};state.available=state.funded=available;state.sequence=command.sequence;state.events.push(receipt);if(state.events.length>100)state.events.shift();return structuredClone(receipt);
 }};
}
