import {tournamentSeatPlan} from './tournament-seating.mjs';
import {eliminationPlaces} from './eliminations.mjs';
import {tournamentPrizeAmounts} from './prizes.mjs';

// Finish receipts are internal authoritative room output, never player-supplied results.
export function multiTableTournament(input){
 const bad=()=>{throw new Error('Invalid local multi-table tournament state')},fields=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&Object.keys(value).every(k=>keys.includes(k));
 if(!fields(input,['version','entries','configuration','events'])||input.version!==1||!Array.isArray(input.entries)||input.entries.length<7||input.entries.length>120||!Array.isArray(input.events)||input.events.length>100000)bad();
 const configuration=input.configuration;
 if(!fields(configuration,['seatingPolicy','rankingPolicy','entryCost','prizeShares'])||configuration.seatingPolicy!=='local-idle-balance-v1'||configuration.rankingPolicy!=='local-settlement-order-v1'||!Number.isSafeInteger(configuration.entryCost)||configuration.entryCost<0||configuration.entryCost>1000000||!Array.isArray(configuration.prizeShares)||configuration.prizeShares.length>input.entries.length||Array.from(configuration.prizeShares).some(n=>!Number.isInteger(n)||n<=0))bad();
 const pool=input.entries.length*configuration.entryCost,amounts=tournamentPrizeAmounts(pool,configuration.prizeShares),players=new Map();
 for(const entry of Array.from(input.entries)){if(!fields(entry,['id','stack'])||typeof entry.id!=='string'||!(/^[a-z0-9][a-z0-9_-]{1,19}$/).test(entry.id)||players.has(entry.id)||!Number.isSafeInteger(entry.stack)||entry.stack<1||entry.stack>1000000)bad();players.set(entry.id,{...entry,place:null})}
 const entries=structuredClone(input.entries),rules=structuredClone(configuration),events=[],tables=Array.from({length:Math.ceil(entries.length/6)},(_,i)=>({id:'table-'+(i+1),number:0,playing:false,closed:false,seats:Array(6).fill(null),hand:null}));
 entries.forEach((p,i)=>{tables[i%tables.length].seats[Math.floor(i/tables.length)]={...p}});
 let winner=null,prizes=[],pendingTransfers=false,waitingTable=null;
 function rebalance(){const plan=tournamentSeatPlan(tables.filter(t=>!t.closed).map(({id,playing,seats})=>({id,playing,seats})),rules.seatingPolicy);for(const t of tables){if(plan.closedTables.includes(t.id)){t.closed=true;t.seats.fill(null)}else{const next=plan.tables.find(other=>other.id===t.id);if(next)t.seats=next.seats}}return plan}
 function apply(command){
  if(!command||!['begin','finish'].includes(command.op)||!fields(command,command.op==='begin'?['op','tableId','number']:['op','tableId','number','after','button'])||typeof command.tableId!=='string'||!Number.isSafeInteger(command.number)||command.number<1)bad();
  const table=tables.find(t=>t.id===command.tableId);if(!table)bad();
  if(command.op==='begin'){
   if(table.hand?.number===command.number)return {receipt:structuredClone(table.hand.begin),record:false};
   if(winner||table.closed||table.playing||table.id===waitingTable||command.number!==table.number+1||table.seats.filter(Boolean).length<2)bad();
   if(events.length>=100000)bad();const receipt={tableId:table.id,number:command.number,ids:table.seats.map(p=>p?.id??null),stacks:table.seats.map(p=>p?.stack??0)};table.number=command.number;table.playing=true;table.hand={number:command.number,begin:receipt,finish:null,receipt:null};return {receipt:structuredClone(receipt),record:true};
  }
  const hand=table.hand;if(!hand||hand.number!==command.number||!Array.isArray(command.after)||command.after.length!==6||Array.from(command.after).some(n=>!Number.isSafeInteger(n)||n<0)||!Number.isInteger(command.button)||command.button<0||command.button>=6||!hand.begin.stacks[command.button])bad();
  if(hand.finish){if(hand.finish.button!==command.button||hand.finish.after.some((n,i)=>n!==command.after[i]))bad();return {receipt:structuredClone(hand.receipt),record:false}}
  if(table.closed||!table.playing||events.length>=100000||command.after.some((n,i)=>n&&!hand.begin.ids[i])||command.after.reduce((n,p)=>n+BigInt(p),0n)!==BigInt(hand.begin.stacks.reduce((a,b)=>a+b,0)))bad();
  const other=Array.from(players.values()).filter(p=>p.stack>0&&!hand.begin.ids.includes(p.id)).length,places=eliminationPlaces(hand.begin.stacks,command.after,command.button).map(({seat,place})=>({id:hand.begin.ids[seat],place:place+other}));
  for(const p of places)players.get(p.id).place=p.place;
  table.seats=hand.begin.ids.map((id,i)=>{if(!id)return null;players.get(id).stack=command.after[i];return command.after[i]?{id,stack:command.after[i]}:null});table.playing=false;
  const remaining=Array.from(players.values()).filter(p=>p.stack>0);if(remaining.length===1){winner=remaining[0].id;remaining[0].place=1;prizes=Array.from(players.values()).map(p=>({id:p.id,place:p.place,amount:amounts[p.place-1]??0}))}
  const plan=rebalance();pendingTransfers=plan.pending;waitingTable=plan.pending?tables.filter(t=>!t.closed&&!t.playing).sort((a,b)=>a.seats.filter(Boolean).length-b.seats.filter(Boolean).length)[0]?.id??null:null;const receipt={tableId:table.id,number:command.number,places,transfers:plan.moves,closedTables:plan.closedTables,waitingTable,winner,prizes:structuredClone(prizes)};hand.finish=structuredClone(command);hand.receipt=receipt;return {receipt:structuredClone(receipt),record:true};
 }
 function operate(command){const copy=structuredClone(command),result=apply(copy);if(result.record)events.push(copy);return result.receipt}
 for(const event of Array.from(input.events)){const result=apply(structuredClone(event));if(!result.record)bad();events.push(structuredClone(event))}
 return {hand(tableId){const table=tables.find(t=>t.id===tableId);if(!table)bad();return structuredClone(table.hand)},begin(tableId,number){return operate({op:'begin',tableId,number})},finish(tableId,number,after,button){return operate({op:'finish',tableId,number,after,button})},snapshot(){return {version:1,entries:structuredClone(entries),configuration:structuredClone(rules),events:structuredClone(events)}},summary(){return {policy:rules.seatingPolicy,rankingPolicy:rules.rankingPolicy,pool,totalChips:Array.from(players.values()).reduce((n,p)=>n+p.stack,0),remaining:Array.from(players.values()).filter(p=>p.stack>0).length,winner,pendingTransfers,waitingTable,players:Array.from(players.values()).map(({id,stack,place})=>({id,lastSettledStack:stack,place})),tables:structuredClone(tables.filter(t=>!t.closed).map(({hand,closed,...table})=>({...table,canBegin:!winner&&!table.playing&&table.id!==waitingTable&&table.seats.filter(Boolean).length>=2}))),prizes:structuredClone(prizes)}}};
}
