import {isDeepStrictEqual} from 'node:util';
// Explicit local policy: finite inventory, no replacement, equal hunter shares with odd credits in caller-supplied order.
export function battleBounty(items,capital,checkpoint=null){
 if(!Array.isArray(items)||items.length<1||items.length>100||Array.from(items).some(p=>!p||Object.keys(p).sort().join(',')!=='amount,frequency'||!Number.isSafeInteger(p.amount)||p.amount<1||!Number.isSafeInteger(p.frequency)||p.frequency<1||p.frequency>10000)||new Set(items.map(p=>p.amount)).size!==items.length||items.reduce((n,p)=>n+p.frequency,0)>10000||!Number.isSafeInteger(capital)||capital<1||capital>1000000000||items.reduce((n,p)=>n+p.amount*p.frequency,0)!==capital)throw Error('Invalid Battle bounty inventory or capital');
 items=structuredClone(items);const remaining=items.map(p=>p.frequency),awards=[],account=id=>typeof id==='string'&&/^[a-z0-9][a-z0-9_-]{1,19}$/.test(id);
 const count=()=>remaining.reduce((a,b)=>a+b,0);
 function draw(input,ticket){
  if(!input||Object.keys(input).sort().join(',')!=='hand,hunters,pot,victim'||!Number.isSafeInteger(input.hand)||input.hand<1||!Number.isInteger(input.pot)||input.pot<0||input.pot>8||!account(input.victim)||!Array.isArray(input.hunters)||input.hunters.length<1||input.hunters.length>6||Array.from(input.hunters).some(id=>!account(id)||id===input.victim)||new Set(input.hunters).size!==input.hunters.length)throw Error('Invalid Battle bounty award request');
  const prior=awards.find(a=>a.victim===input.victim);
  if(prior){if(prior.hand!==input.hand||prior.pot!==input.pot||prior.ticket!==ticket||!isDeepStrictEqual(prior.hunters.map(p=>p.account),input.hunters))throw Error('Battle bounty victim already awarded');return structuredClone(prior)}
  const available=count();if(!available)throw Error('Battle bounty inventory exhausted');if(!Number.isSafeInteger(ticket)||ticket<0||ticket>=available)throw Error('Invalid Battle bounty ticket');
  let index=0,offset=ticket;while(offset>=remaining[index]){offset-=remaining[index];index++}
  const amount=items[index].amount,receipt={hand:input.hand,pot:input.pot,victim:input.victim,ticket,amount,hunters:input.hunters.map((account,i)=>({account,amount:Math.floor(amount/input.hunters.length)+Number(i<amount%input.hunters.length)}))};
  remaining[index]--;awards.push(receipt);return structuredClone(receipt);
 }
 if(checkpoint!==null){try{
  if(typeof checkpoint!=='string')throw Error();const saved=JSON.parse(checkpoint);if(!saved||Object.keys(saved).sort().join(',')!=='awards,capital,items,version'||saved.version!==1||saved.capital!==capital||!isDeepStrictEqual(saved.items,items)||!Array.isArray(saved.awards)||saved.awards.length>count())throw Error();
  for(const a of saved.awards){if(!a||!Array.isArray(a.hunters))throw Error();const receipt=draw({hand:a.hand,pot:a.pot,victim:a.victim,hunters:a.hunters.map(p=>p.account)},a.ticket);if(!isDeepStrictEqual(receipt,a))throw Error()}
  if(awards.length!==saved.awards.length)throw Error();
 }catch{throw Error('Invalid Battle bounty checkpoint')}}
 function summary(){const balance=remaining.reduce((n,f,i)=>n+f*items[i].amount,0);return {capital,remainingCount:count(),remaining:balance,paid:capital-balance,awards:structuredClone(awards)}}
 const snapshot=()=>JSON.stringify({version:1,items,capital,awards});return {draw,summary,snapshot};
}
