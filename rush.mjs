import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import {rushPool} from './engine/rush-pool.mjs';
import {visibleCards,collectedPots} from './room-view.mjs';
import {options,canQuickFold,preflopRaised,preflopOpportunities,continuationStats,showdownStats} from './engine/table.mjs';
import {computerMove,noteSubject} from './rooms.mjs';
import {noteColors,saveNoteLabels,reportTypes,saveHandReport} from './player-notes.mjs';

const fail=(status,message)=>{throw Object.assign(Error(message),{status})};
export function openRush(file,variant='holdem',avatarFor=()=>0,notes,walletStore=null){
 if(!['holdem','plo'].includes(variant))throw Error('Invalid Rush format');
 let entries=[],pool=null,version=0,knownTables=new Set();
 function restore(saved){entries=saved.entries;if(!Array.isArray(entries)||entries.some(p=>p?.helmet!==undefined&&typeof p.helmet!=='boolean'||p?.left!==undefined&&p.left!==true||p?.walletFunded!==undefined&&(p.walletFunded!==true||p.bot||p.left||!walletStore)))throw Error('Invalid Rush helmet state');version=saved.version;pool=saved.pool?rushPool(entries,4,saved.pool,variant):null;knownTables=new Set(pool?.tables.keys()||[])}
 try{restore(walletStore?.read(variant)??JSON.parse(readFileSync(file,'utf8')))}catch(e){if(e.code!=='ENOENT')throw e}
 const avatars=ids=>ids.map(id=>entries.some(p=>p.id===id&&p.bot)?null:avatarFor(id));
 const subject=id=>noteSubject(entries.find(p=>p.id===id)?.bot?{bot:true,noteId:'rush:'+variant+':'+id}:{account:id});
 const snapshot=()=>({entries,version,pool:pool?.snapshot()||null});
 function register(id,bot=false,transfers=[]){
  const entry=entries.find(p=>p.id===id),player=pool?.players.get(id);
  if(entry){
   if(!entry.left&&(!player||player.table!==null||player.balance>0))return;
   if(pool)pool.adjustBalance(id,200);
   delete entry.left;entry.paused=false;entry.queued=false;
   if(walletStore&&!entry.bot){entry.walletFunded=true;transfers.push({account:id,delta:-200})}return;
  }
  if(entries.length>=100)fail(409,'Pool full');
  if(pool)pool.add(id,200);
  entries=[...entries,{id,stack:200,...(bot?{bot:true}:walletStore?{walletFunded:true}:{})}];
  if(walletStore&&!bot)transfers.push({account:id,delta:-200});
  if(!pool&&entries.length===6){pool=rushPool(entries,4,null,variant);for(const old of entries)if(old.left)pool.adjustBalance(old.id,-pool.players.get(old.id).balance)}
 }
 const eligible=()=>entries.filter(p=>!p.paused&&!p.left).map(p=>p.id);
 function advanceTables(){
  let changed=false;const now=Date.now();
  for(const table of pool?.tables.values()||[]){
   const g=table.game,id=table.ids[g.turn];
   if(table.settled)continue;
   const bot=entries.some(p=>p.id===id&&p.bot),key=g.turn+':'+g.history.length;
   if(table.deadlineKey!==key){table.deadlineKey=key;table.deadline=now+(bot?500:90000);changed=true;continue}
   if(now<table.deadline)continue;
   const o=options(g),move=bot?computerMove(g.hands[g.turn],g.board,g.blind,g.price,o,'rush'):[o.due?'fold':'check'];
   if(!bot){const entry=entries.find(p=>p.id===id);entry.paused=true;entry.queued=false}
   pool.move(id,...move);changed=true;
  }
  for(const entry of entries)if(entry.queued&&pool?.players.get(entry.id)?.table!=null){entry.queued=false;changed=true}
  for(const entry of entries)if(entry.queued&&pool?.players.get(entry.id)?.table===null&&pool.players.get(entry.id).balance>0){
   if(pool.deal(entry.id,eligible())!==null){entry.queued=false;changed=true}
  }
  return changed;
 }
 function save(transfers=[]){for(const [id,table]of pool?.tables||[])if(!knownTables.has(id))table.hudAvatars=avatars(table.ids);version++;if(walletStore)walletStore.write(variant,snapshot(),transfers);else{writeFileSync(file+'.tmp',JSON.stringify(snapshot()),{mode:0o600});renameSync(file+'.tmp',file);}knownTables=new Set(pool?.tables.keys()||[])}
 function view(id){
  const player=pool?.players.get(id),table=pool?.tables.get(player?.table);
  const me=table?table.ids.indexOf(id):null;
  let hand=null;
  if(table){const g=table.game,{deck,hands,reservedChecks,...publicHand}=g;hand={...publicHand,pots:collectedPots(g),quickFoldAllowed:canQuickFold(g,me),...(!g.end&&!g.folded[me]&&g.stacks[me]>0?{preAction:{rush:true,bigBlindOption:!g.board.length&&me===g.bigBlindSeat&&g.actedAt[me]===null,due:Math.max(0,g.price-g.bets[me]),call:Math.min(g.stacks[me],Math.max(0,g.price-g.bets[me])),acted:g.actedAt[me]!==null,reservedCheck:reservedChecks?.[me]===g.board.length,foldEnabled:g.stacks.some((stack,i)=>i!==me&&!g.folded[i]&&g.bets[i]+stack>g.bets[me])}}:{}),deadline:table.deadline,hands:visibleCards(g,me)}}
  const previous=pool?[...pool.tables].findLast(([,t])=>t.settled&&t.ids.includes(id)):null;
  let result=null;
  if(previous){const [tableId,t]=previous,seat=t.ids.indexOf(id),{deck,hands,reservedChecks,...game}=t.game;result={table:tableId,me:seat,names:t.ids,avatars:avatars(t.ids),hand:{...game,hands:visibleCards(t.game,seat)}}}
  const noteTable=table||previous?.[1],noteTableID=table?player.table:previous?.[0],noteSeat=noteTable?.ids.indexOf(id);
  return {variant,version,walletSupported:!!walletStore,...(walletStore&&!entries.some(p=>p.id===id&&p.bot)?{walletAvailable:walletStore.summary(id).available}:{}),walletFunded:entries.some(p=>p.id===id&&p.walletFunded===true&&!p.left),buyIn:200,canLeave:entries.some(p=>p.id===id&&!p.left)&&!table&&![...(pool?.tables.values()||[])].some(t=>!t.settled&&t.ids.includes(id)),helmet:entries.some(p=>p.id===id&&p.helmet===true),helmets:(table?.ids||previous?.[1].ids||[]).map(name=>entries.some(p=>p.id===name&&p.helmet===true)),paused:entries.some(p=>p.id===id&&p.paused===true),noteTable:noteTableID??null,hudVersion:pool?[...pool.tables.values()].filter(t=>t.settled).length:0,...(noteTable?{noteSubjects:noteTable.ids.map((id,i)=>i===noteSeat?null:subject(id))}:{}),avatars:table?avatars(table.ids):[],queued:entries.some(p=>p.id===id&&p.queued),handVersion:table?player.table+':'+table.game.history.length:null,registered:entries.some(p=>p.id===id&&!p.left),population:entries.filter(p=>!p.left).length,waiting:pool?[...pool.players].filter(([id,p])=>p.table===null&&p.balance>0&&eligible().includes(id)).length:entries.length,table:player?.table||null,balance:player?.balance??(entries.some(p=>p.id===id&&!p.left)?200:0),me,names:table?.ids||[],hand,result,legal:table?.game.turn===me&&!table.game.end?options(table.game):null};
 }
 function hud(id,viewer){
  const records=[...(pool?.tables||[])].filter(([,t])=>t.settled&&t.ids.includes(id)),stats={hands:records.length,wins:0,pfrHands:0,preflopRaises:0,stealOpportunities:0,stealRaises:0,threeBetOpportunities:0,threeBets:0,flopsSeen:0,showdowns:0,showdownWins:0,voluntary:records.every(([,t])=>typeof t.game.vpip?.[t.ids.indexOf(id)]==='boolean')?0:null};
  for(const [,t]of records){const i=t.ids.indexOf(id);if(t.game.end.payouts[i]>t.game.end.returns[i])stats.wins++;if(stats.voluntary!==null&&t.game.vpip[i])stats.voluntary++;const raised=preflopRaised(t.game,i);if(raised!==null){stats.pfrHands++;stats.preflopRaises+=Number(raised)}const opportunities=preflopOpportunities(t.game,i);if(opportunities)for(const [key,count]of Object.entries(opportunities))stats[key]+=count;const continuation=continuationStats(t.game,i);if(continuation)for(const [key,count]of Object.entries(continuation))stats[key]=(stats[key]??0)+count;const showdown=showdownStats(t.game,i);if(showdown)for(const [key,count]of Object.entries(showdown))stats[key]+=count}
  const hands=records.filter(([,t])=>t.ids.includes(viewer)).slice(-30).map(([number,t])=>{const g=t.game,seat=t.ids.indexOf(id),own=t.ids.indexOf(viewer);return {number,mode:'rush',...(Number.isSafeInteger(t.startedAt)&&t.startedAt>=0?{startedAt:t.startedAt}:{}),canReport:own>=0&&Number.isSafeInteger(t.startedAt)&&t.startedAt>=0&&Date.now()>=t.startedAt&&Date.now()-t.startedAt<30*3600000,...(Array.isArray(t.hudAvatars)&&t.hudAvatars.length===6?{avatars:t.hudAvatars}:{}),...(g.historyTrace?{historyTrace:g.historyTrace}:{}),dealtSeats:g.hands.map(cards=>cards.length>0),variant:g.variant,button:g.button,folded:g.folded,...(g.initialStacks?{initialStacks:g.initialStacks}:{}),blind:g.blind,at:Number.isSafeInteger(t.settledAt)&&t.settledAt>=0&&t.settledAt<=8640000000000000?t.settledAt:null,names:t.ids,cards:visibleCards(g,own),seat,viewerSeat:own,net:g.end.payouts[seat]-g.committed[seat],board:g.board,history:g.history,committed:g.committed,payouts:g.end.payouts,returns:g.end.returns,stacks:g.stacks}});
  return structuredClone({stats,hands});
 }
 function tick(){const before=JSON.stringify(snapshot());try{if(advanceTables())save()}catch(e){restore(JSON.parse(before));throw e}}
 function request(id,op,body={}){
  if(typeof id!=='string'||!id)fail(401,'Sign in locally');
  if(op==='notes'){
   if(!notes)fail(503,'Private notes unavailable');const player=pool?.players.get(id),tableID=player?.table||[...(pool?.tables||[])].findLast(([,t])=>t.settled&&t.ids.includes(id))?.[0],table=pool?.tables.get(tableID);if(!table)fail(409,'Join a Rush table to use player notes');const me=table.ids.indexOf(id),owner=subject(id);
   if(Object.keys(body).length&&body.table!==tableID)fail(409,'Table changed; reopen player notes');
   let reportReceipt;if(body.report!==undefined){if(Object.keys(body).some(k=>!['report','table'].includes(k)))fail(400,'Save reports separately from player notes');const room=createHash('sha256').update('river-rush:'+variant).digest('hex').slice(0,48);reportReceipt=saveHandReport(notes,owner,room,hud(id,id).hands.find(h=>h.number===body.report?.number),body.report,Date.now())}
   saveNoteLabels(notes,owner,body);
   if(body.seat!==undefined){if(!Number.isInteger(body.seat)||body.seat<0||body.seat>=table.ids.length||body.seat===me)fail(400,'Choose another seated player');const target=subject(table.ids[body.seat]);if(body.subject!==target)fail(409,'Seat changed; reopen player notes');notes.set(owner,target,{text:body.text,color:body.color})}
   return {...(reportReceipt?{reportReceipt}:{}),reportTypes,self:{seat:me,name:id,subject:owner,...hud(id,id)},colors:noteColors,labels:notes.getLabels(owner),statsScope:'rush-pool',players:table.ids.flatMap((name,seat)=>seat===me?[]:[{seat,name,subject:subject(name),...hud(name,id),...notes.get(owner,subject(name))}])};
  }
  if(op==='helmet'){
   const entry=entries.find(p=>p.id===id);if(!entry||entry.bot)fail(409,'Join the Rush pool first');
   if(Object.keys(body).some(k=>!['muted','version','handVersion'].includes(k))||typeof body.muted!=='boolean'||body.version!==undefined&&(!Number.isSafeInteger(body.version)||body.version<0)||body.handVersion!=null&&(typeof body.handVersion!=='string'||body.handVersion.length>128))fail(400,'Choose a helmet state');
   if(!!entry.helmet===body.muted)return view(id);const before=JSON.stringify(snapshot());
   try{entry.helmet=body.muted;save();return view(id)}catch(error){restore(JSON.parse(before));throw error}
  }
  if(op==='state'){
   tick();return view(id);
  }
  if(!['join','deal','act','quick-fold','fill-bots','cancel-queue','sit-out','leave'].includes(op))fail(404,'Unknown Rush action');
  const current=view(id);
  if(op==='leave'||op==='join'){if(Object.keys(body).some(k=>!['version','handVersion'].includes(k)))fail(400,'Invalid Rush departure');if(op==='leave'&&entries.some(p=>p.id===id&&p.left))return current;}
  const stale=op==='quick-fold'?typeof body.handVersion!=='string'||!current.table||!body.handVersion.startsWith(current.table+':'):op==='act'?body.handVersion!==current.handVersion||!current.handVersion:body.version!==version;
  if(stale)fail(409,'Refresh Rush state');
  const before=JSON.stringify(snapshot()),transfers=[];
  try{
   if(op==='join'){
    register(id,false,transfers);
   }else if(op==='leave'){
    if(!current.canLeave)fail(409,'Finish all Rush hands before leaving');const entry=entries.find(p=>p.id===id),balance=current.balance;if(pool)pool.adjustBalance(id,-balance);if(entry.walletFunded)transfers.push({account:id,delta:balance});entry.left=true;entry.paused=true;entry.queued=false;delete entry.walletFunded;
   }else if(op==='fill-bots'){
    if(!current.registered||current.table)fail(409,'Join the pool and wait before adding computers');
    for(let i=1;i<=11;i++)register('Computer '+i,true);
    const entry=entries.find(p=>p.id===id);entry.paused=false;entry.queued=false;pool.deal(id,eligible());
   }else{
    if(!current.registered||!pool?.players.has(id))fail(409,'Join the pool; six players are needed');
    const entry=entries.find(p=>p.id===id);
    if(op==='sit-out'){if(typeof body.paused!=='boolean')fail(400,'Choose a sit-out state');entry.paused=body.paused;entry.queued=false}
    if(op==='cancel-queue'){if(current.table)fail(409,'Finish the current hand first');entry.queued=false;entry.paused=true}
    if(op==='deal'){entry.paused=false;entry.queued=pool.deal(id,eligible())===null}
    if(op==='act'){
     if(body.reserved!==undefined&&typeof body.reserved!=='boolean')fail(400,'Invalid reserved action flag');
     const table=pool.tables.get(current.table),g=table.game,seat=table.ids.indexOf(id),board=g.board.length;pool.move(id,body.action,body.target);
     if(body.reserved===true&&body.action==='check'){g.reservedChecks??=Array(6).fill(null);g.reservedChecks[seat]=board}else if(g.reservedChecks)g.reservedChecks[seat]=null;
    }
    if(op==='quick-fold'){const next=pool.fold(id,eligible(),!entry.paused);entry.queued=!entry.paused&&next===null}
   }
   save(transfers);
   return view(id);
  }catch(e){restore(JSON.parse(before));if(e.status)throw e;if(e.code)throw e;fail(400,e.message)}
 }
 request.hasActivePlay=()=>!!pool&&[...pool.tables.values()].some(t=>!t.settled);request.tick=tick;return request;
}
