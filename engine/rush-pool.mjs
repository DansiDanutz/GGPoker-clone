import {startHand,act,quickFold} from './table.mjs';

export function rushPool(entries,blind=4,checkpoint=null,variant='holdem'){
 if(!['holdem','plo'].includes(variant))throw Error('Invalid Rush format');
 if(!Array.isArray(entries)||entries.length<6||entries.length>100||new Set(entries.map(p=>p.id)).size!==entries.length||!entries.every(p=>typeof p.id==='string'&&p.id.length>0&&Number.isSafeInteger(p.stack)&&p.stack>=blind*4)||!Number.isSafeInteger(entries.reduce((n,p)=>n+p.stack,0)))throw Error('Invalid Rush players');
 if(!Number.isSafeInteger(blind)||blind<2||blind%2)throw Error('Invalid blind');
 const players=new Map(entries.map(p=>[p.id,{balance:p.stack,table:null}])),tables=new Map();let serial=0;
 const available=id=>players.get(id)?.table===null&&players.get(id).balance>0;
 function deal(id,waitingIds=null){
  if(!available(id))throw Error('Player is not waiting');
  const ids=[id,...[...players.keys()].filter(other=>other!==id&&available(other)&&(!waitingIds||waitingIds.includes(other))).slice(0,5)];
  if(ids.length<6)return null;
  const tableId=++serial,game=startHand(ids.map(key=>players.get(key).balance),blind,(tableId-1)%6,variant==='plo'?'plo':'rush');game.rush=true;
  tables.set(tableId,{ids,game,startedAt:Date.now(),detached:[],settled:false});
  for(const key of ids){players.get(key).balance=0;players.get(key).table=tableId}
  settle(tableId);return tableId;
 }
 function settle(tableId){
  const table=tables.get(tableId);if(!table.game.end||table.settled)return;
  table.settled=true;table.settledAt=Date.now();
  table.ids.forEach((id,i)=>{const player=players.get(id);player.balance+=table.detached.includes(i)?table.game.end.payouts[i]:table.game.stacks[i];if(player.table===tableId)player.table=null});
 }
 function move(id,action,target){
  const player=players.get(id),table=tables.get(player?.table);if(!table)throw Error('Player is not seated');
  const seat=table.ids.indexOf(id);if(table.game.turn!==seat)throw Error('Not your turn');
  act(table.game,action,target);settle(player.table);
 }
 function fold(id,waitingIds=null,rematch=true){
  const player=players.get(id),old=player?.table,table=tables.get(old);if(!table)throw Error('Player is not seated');
  const seat=table.ids.indexOf(id);quickFold(table.game,seat);
  player.balance+=table.game.stacks[seat];player.table=null;table.detached.push(seat);
  settle(old);return rematch?deal(id,waitingIds):null;
 }
 function total(){
  let chips=[...players.values()].reduce((sum,p)=>sum+p.balance,0);
  for(const table of tables.values())if(!table.settled)chips+=table.game.committed.reduce((a,b)=>a+b,0)+table.game.stacks.reduce((sum,n,i)=>sum+(table.detached.includes(i)?0:n),0);
  return chips;
 }
 function add(id,stack){
  if(players.size>=100||players.has(id)||typeof id!=='string'||!id||!Number.isSafeInteger(stack)||stack<blind*4||!Number.isSafeInteger(total()+stack))throw Error('Invalid Rush player');
  players.set(id,{balance:stack,table:null});
 }
 function snapshot(){return JSON.stringify({blind,variant,serial,players:[...players],tables:[...tables]})}
 if(checkpoint!==null){
  const saved=JSON.parse(checkpoint),known=new Set(entries.map(p=>p.id));
  if((saved.variant||'holdem')!==variant||saved.blind!==blind||!Number.isSafeInteger(saved.serial)||saved.serial<0||!Array.isArray(saved.players)||saved.players.length!==players.size||!Array.isArray(saved.tables))throw Error('Invalid Rush checkpoint');
  const restoredPlayers=new Map(saved.players),restoredTables=new Map(saved.tables);
  if(restoredPlayers.size!==players.size||restoredTables.size!==saved.tables.length)throw Error('Invalid Rush checkpoint');
  for(const [id,player] of restoredPlayers)if(!known.has(id)||!Number.isSafeInteger(player.balance)||player.balance<0||(player.table!==null&&!restoredTables.has(player.table)))throw Error('Invalid Rush checkpoint');
  for(const [id,table] of restoredTables)if(!Number.isSafeInteger(id)||id<1||id>saved.serial||!Array.isArray(table.ids)||table.ids.length!==6||new Set(table.ids).size!==6||!table.ids.every(id=>known.has(id))||!Array.isArray(table.detached)||!table.detached.every(i=>Number.isInteger(i)&&i>=0&&i<6)||table.game?.variant!==(variant==='plo'?'plo':'rush')||!Array.isArray(table.game?.stacks)||table.game.stacks.length!==6||!Array.isArray(table.game.committed)||table.game.committed.length!==6||![...table.game.stacks,...table.game.committed].every(n=>Number.isSafeInteger(n)&&n>=0))throw Error('Invalid Rush checkpoint');
  for(const [tableId,table] of restoredTables){
   if(table.startedAt!==undefined&&(!Number.isSafeInteger(table.startedAt)||table.startedAt<0||table.startedAt>8640000000000000)||typeof table.settled!=='boolean'||new Set(table.detached).size!==table.detached.length||table.detached.some(seat=>table.game.folded?.[seat]!==true)||table.settled&&!table.game.end)throw Error('Invalid Rush checkpoint');
   if(!table.settled)table.ids.forEach((id,seat)=>{if(!table.detached.includes(seat)&&restoredPlayers.get(id).table!==tableId)throw Error('Invalid Rush assignment')});
  }
  players.clear();for(const [id,player] of restoredPlayers)players.set(id,player);
  for(const [id,table] of restoredTables)tables.set(id,table);serial=saved.serial;
  for(const [id,player] of players)if(player.table!==null){const table=tables.get(player.table),seat=table.ids.indexOf(id);if(seat<0||table.settled||table.detached.includes(seat))throw Error('Invalid Rush assignment')}
  if(total()!==entries.reduce((n,p)=>n+p.stack,0))throw Error('Rush checkpoint chip total mismatch');
 }
 return {players,tables,deal,move,fold,total,snapshot,add};
}
