// Explicit local policy; native server balancing and blind-compensation rules are unobserved.
export function tournamentSeatPlan(input,policy){
 const bad=()=>{throw new Error('Invalid local tournament seating snapshot')},fields=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&Object.keys(value).every(k=>keys.includes(k));
 if(policy!=='local-idle-balance-v1')throw new Error('Choose the explicit local tournament seating policy');
 if(!Array.isArray(input)||input.length>20)bad();
 const tableIds=new Set(),playerIds=new Set();let chips=0n;
 for(const table of Array.from(input)){
  if(!fields(table,['id','playing','seats'])||typeof table.id!=='string'||!(/^[a-z0-9][a-z0-9_-]{0,39}$/).test(table.id)||tableIds.has(table.id)||typeof table.playing!=='boolean'||!Array.isArray(table.seats)||table.seats.length!==6)bad();tableIds.add(table.id);if(table.playing&&table.seats.filter(Boolean).length<2)bad();
  for(const player of Array.from(table.seats)){if(player===null)continue;if(!fields(player,['id','stack'])||typeof player.id!=='string'||!(/^[a-z0-9][a-z0-9_-]{1,19}$/).test(player.id)||playerIds.has(player.id)||!Number.isSafeInteger(player.stack)||player.stack<0||!table.playing&&player.stack===0)bad();playerIds.add(player.id);chips+=BigInt(player.stack)}
 }
 if(chips>BigInt(Number.MAX_SAFE_INTEGER))bad();
 const tables=structuredClone(input),moves=[],closedTables=[],count=table=>table.seats.filter(Boolean).length,needed=Math.ceil(playerIds.size/6),open=()=>tables.filter(t=>!closedTables.includes(t.id));
 function transfer(source,target,seat){const destination=target.seats.indexOf(null),player=source.seats[seat];if(source.playing||target.playing||!player||destination<0)throw new Error('Unsafe tournament transfer');target.seats[destination]=player;source.seats[seat]=null;moves.push({player:player.id,stack:player.stack,fromTable:source.id,fromSeat:seat,toTable:target.id,toSeat:destination})}
 while(open().length>needed){
  const idle=open().filter(t=>!t.playing),source=idle.slice().reverse().sort((a,b)=>count(a)-count(b)).find(t=>idle.filter(other=>other!==t).reduce((n,other)=>n+6-count(other),0)>=count(t));if(!source)break;
  for(let seat=0;seat<6;seat++)if(source.seats[seat]){const target=idle.filter(t=>t!==source&&count(t)<6).sort((a,b)=>count(a)-count(b))[0];transfer(source,target,seat)}closedTables.push(source.id);
 }
 const idle=open().filter(t=>!t.playing);
 while(idle.length>1){const sorted=idle.slice().sort((a,b)=>count(a)-count(b)),target=sorted[0],source=sorted.at(-1);if(count(source)-count(target)<=1)break;transfer(source,target,source.seats.findIndex(Boolean))}
 const remaining=open(),counts=remaining.map(count);return {policy,tables:remaining,moves,closedTables,pending:remaining.length>needed||counts.length>1&&Math.max(...counts)-Math.min(...counts)>1};
}
