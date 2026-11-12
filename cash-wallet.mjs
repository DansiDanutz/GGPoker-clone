// shortcut: fixed local practice grant; use owner-configured grants when funding controls exist.
const grant=10000;
const fail=(status,message)=>{throw Object.assign(Error(message),{status})};
const key=name=>{if(typeof name!=='string'||! /^[a-z0-9][a-z0-9_-]{1,19}$/i.test(name))fail(400,'Invalid local wallet account');return name.toLowerCase()};
export function cashWallet(state={version:1,accounts:{}}){
 if(!state||state.version!==1||!state.accounts||typeof state.accounts!=='object'||Array.isArray(state.accounts))throw Error('Invalid cash wallet checkpoint');
 for(const [name,a]of Object.entries(state.accounts)){
  if(key(name)!==name||!a||['available','granted','spent','returned'].some(k=>!Number.isSafeInteger(a[k])||a[k]<0)||a.available!==a.granted-a.spent+a.returned||!Array.isArray(a.events)||a.events.length>100||a.events.some(e=>!e||!['buy-in','rebuy','refund','cash-out','legacy-seat'].includes(e.kind)||!Number.isSafeInteger(e.amount)||e.amount<0||typeof e.room!=='string'||! /^[a-f0-9]{48}$/.test(e.room)||!Number.isSafeInteger(e.at)||e.at<0))throw Error('Invalid cash wallet account');
 }
 const get=name=>Object.hasOwn(state.accounts,key(name))?state.accounts[key(name)]:null;
 function account(name){const k=key(name);return get(name)||(state.accounts[k]={available:grant,granted:grant,spent:0,returned:0,events:[]})}
 function event(a,kind,amount,room){a.events.push({kind,amount,room,at:Date.now()});if(a.events.length>100)a.events.shift()}
 return {state,
  summary(name){const a=get(name);return structuredClone(a||{available:grant,granted:grant,spent:0,returned:0,events:[]})},
  move(name,delta,kind,room){if(!Number.isSafeInteger(delta))fail(400,'Invalid chip transfer');const a=account(name),next=a.available+delta;if(!Number.isSafeInteger(next)||next<0)fail(409,'Not enough local play chips');const total=delta<0?a.spent-delta:a.returned+delta;if(!Number.isSafeInteger(total))fail(409,'Local chip total limit reached');a.available=next;if(delta<0)a.spent=total;else a.returned=total;if(delta)event(a,kind,Math.abs(delta),room)},
  adopt(name,amount,room){const a=account(name);if(!Number.isSafeInteger(amount)||amount<0||!Number.isSafeInteger(a.granted+amount)||!Number.isSafeInteger(a.spent+amount))fail(409,'Invalid legacy stake');a.granted+=amount;a.spent+=amount;event(a,'legacy-seat',amount,room)}
 };
}
