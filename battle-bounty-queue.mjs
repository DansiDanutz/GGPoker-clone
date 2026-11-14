export function battleBountyQueue(){
 let identity=null,pending=[],seen=new Map();
 const key=a=>a.hand+':'+a.pot+':'+a.victim;
 function clear(){identity=null;pending=[];seen=new Map()}
 function observe(next,awards){
  if(next===null){clear();return}if(typeof next!=='string'||!next||!Array.isArray(awards)||awards.length>100)throw Error('Invalid bounty presentation identity');
  const rows=awards.map(a=>{if(!a||!Number.isSafeInteger(a.hand)||a.hand<1||!Number.isInteger(a.pot)||a.pot<0||typeof a.victim!=='string'||!a.victim||!Number.isSafeInteger(a.amount)||a.amount<1||!Array.isArray(a.hunters)||a.hunters.length<1||a.hunters.length>6||a.hunters.some(p=>!p||typeof p.account!=='string'||!p.account||!Number.isSafeInteger(p.amount)||p.amount<0)||a.hunters.reduce((n,p)=>n+p.amount,0)!==a.amount)throw Error('Invalid bounty presentation receipt');return structuredClone({hand:a.hand,pot:a.pot,victim:a.victim,amount:a.amount,hunters:a.hunters.map(p=>({account:p.account,amount:p.amount}))})});
  if(new Set(rows.map(key)).size!==rows.length)throw Error('Duplicate bounty presentation receipt');
  if(next!==identity){identity=next;pending=[];seen=new Map(rows.map(a=>[key(a),JSON.stringify(a)]));return}
  for(const a of rows)if(seen.has(key(a))&&seen.get(key(a))!==JSON.stringify(a))throw Error('Bounty presentation receipt changed');
  for(const a of rows.sort((a,b)=>a.hand-b.hand||a.pot-b.pot))if(!seen.has(key(a))){seen.set(key(a),JSON.stringify(a));pending.push(a)}
 }
 return {observe,clear,size:()=>pending.length,peek:()=>pending.length?structuredClone(pending[0]):null,complete(id){if(!pending.length||key(pending[0])!==id)return false;pending.shift();return true}};
}
