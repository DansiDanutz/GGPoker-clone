import {prizeAmounts} from './engine/prizes.mjs';
import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import {createHash,randomBytes} from 'node:crypto';
import {startHand,act,options,nextDealer,omahaRank} from './engine/table.mjs';
import {bestShortDeck} from './engine/hand.mjs';
import {eliminationPlaces} from './engine/eliminations.mjs';
import {best} from './game.mjs';
import {blindLevel} from './blind-level.mjs';
import {startClock,finishClock,reserveClock,clockView} from './game-clock.mjs';
import {visibleCards,collectedPots} from './room-view.mjs';
import {openNotes,noteColors,saveNoteLabels,reportTypes,saveHandReport} from './player-notes.mjs';
const buyIns=[30,70,100,100], hour=3600000;
const turnMs=room=>(room.settings?.actionSeconds??90)*1000;
const fail=(status,message)=>{throw Object.assign(Error(message),{status})};
const entry=25, initialStack=100;
const intervalMs=Number(process.env.POKER_LEVEL_MS||60000);
if(!Number.isSafeInteger(intervalMs)||intervalMs<1000)throw Error('POKER_LEVEL_MS must be at least 1000');
function tournamentHand(r,now,avatarFor){
  const t=r.tournament,stacks=r.hand?.stacks||r.players.map(p=>p?(r.settings?.stack||initialStack):0);
  const button=r.hand?nextDealer(stacks,r.hand):r.players.findIndex(Boolean);
  const level=blindLevel(t.startedAt,now,t.intervalMs,r.settings?.blind||4);
  t.level=level.level;t.nextDealAt=null;r.number++;r.hand=startHand(stacks,level.bigBlind,button,r.settings?.variant,(r.settings?.ante||0)*(level.bigBlind/(r.settings?.blind||4)));
  r.hand.hudStartedAt=now;r.hand.hudSubjects=r.players.map(p=>p?noteSubject(p):null);r.hand.hudNames=r.players.map(p=>p?.name??null);r.hand.hudAvatars=r.players.map(p=>p?.account?avatarFor(p.account):p?0:null);
  startClock(r,now);r.version++;
  if(r.hand.end)record(r);
}
function record(room){
  const g=room.hand;if(!g.end)return;
  const result={number:room.number,board:[...g.board],history:[...g.history],committed:[...g.committed],payouts:[...g.end.payouts],returns:[...g.end.returns],stacks:[...g.stacks],...(g.end.pots?{pots:g.end.pots}:{})};
  if(g.variant==='aof')result.allIn=g.allIns.filter(Boolean).length;
  if(g.vpip){result.voluntary=g.vpip.filter(Boolean).length;result.dealt=g.hands.filter(h=>h.length).length}
  if(g.hudSubjects&&!g.hudRecorded){
    room.hud??={};
    g.hudSubjects.forEach((subject,i)=>{if(!subject||!g.hands[i].length)return;const stats=room.hud[subject]??={hands:0,wins:0,voluntary:0};stats.hands++;if(g.end.payouts[i]>g.end.returns[i])stats.wins++;if(g.vpip?.[i])stats.voluntary++});
    room.hudHistory??=[];for(const h of room.hudHistory)if(!h.result){const prior=room.results.find(r=>r.number===h.number);if(prior)h.result=structuredClone(prior)}room.hudHistory.push({result:structuredClone(result),historyEvents:structuredClone(g.historyEvents||[]),...(Number.isSafeInteger(g.hudStartedAt)&&g.hudStartedAt>=0?{startedAt:g.hudStartedAt}:{}),...(g.historyTrace?{historyTrace:structuredClone(g.historyTrace)}:{}),blind:g.blind,variant:g.variant,button:g.button,folded:[...g.folded],...(g.initialStacks?{initialStacks:[...g.initialStacks]}:{}),...(g.hudAvatars?{avatars:[...g.hudAvatars]}:{}),number:room.number,at:Date.now(),subjects:g.hudSubjects.map((subject,i)=>g.hands[i].length?subject:null),names:[...(g.hudNames||room.players.map(p=>p?.name??null))],cards:visibleCards(g,null).map(hand=>hand?[...hand]:null),privateCards:g.hands.map(hand=>[...hand])});if(room.hudHistory.length>30)room.hudHistory.shift();
    g.hudRecorded=true;
  }
  room.results.push(result);if(room.results.length>20)room.results.shift();
  room.ready=room.players.map(p=>!!p?.bot);
  const t=room.tournament;if(!t)return;
  t.finishes??=Array(g.stacks.length).fill(null);
  if(g.initialStacks)for(const {seat,place} of eliminationPlaces(g.initialStacks,g.stacks,g.button))t.finishes[seat]=place;
  for(let i=0;i<g.stacks.length;i++)if(room.players[i]&&!g.stacks[i]&&!t.out[i])t.out[i]=room.number;
  const remaining=g.stacks.flatMap((s,i)=>s?[i]:[]);
  if(remaining.length===1){
    t.winner=remaining[0];t.finishes[t.winner]=1;const amounts=prizeAmounts(t.pool,t.prizeShares||[100]);t.prizes=t.finishes.map(place=>amounts[place-1]||0);
    t.nextDealAt=null;
  }else t.nextDealAt=Date.now()+3000;
}
export function computerMove(cards,board,blind,price,o,variant='holdem'){
  if(variant==='aof')return ['allin'];
  const made=cards.length>=4?(board.length>=3?omahaRank(cards,board)[0]>=1:new Set(cards.map(c=>c[0])).size<cards.length):cards[0][0]===cards[1][0]||cards.some(c=>board.some(b=>b[0]===c[0]))||(board.length>=3&&(variant==='shortdeck'?bestShortDeck([...cards,...board]):best([...cards,...board]))[0]>=2);
  if(made&&o.raise&&price<=(board.length?0:blind))return ['raise',o.min];
  if(!made&&o.due>2*blind)return ['fold'];
  return [o.due?'call':'check'];
}
function step(room,action,target){
  try{act(room.hand,action,target)}catch{fail(400,'Illegal action')}
  const now=Date.now();finishClock(room,now);startClock(room,now);room.version++;record(room);
}
function cashHand(r,now,avatarFor){
 const base=r.waitingStacks||r.hand?.stacks,stacks=r.players.map((p,i)=>p?(r.hand&&!r.hand.hands[i].length||base?.[i]==null?p.buyIn??r.settings?.stack??buyIns[i]:base[i]):0),previous=r.hand||r.previousHand;
 for(let i=0;i<r.players.length;i++){
  const p=r.players[i];if(p?.bot&&stacks[i]===0)p.topUpTo=p.buyIn??r.settings?.stack??buyIns[i];if(!p?.topUpTo)continue;
  const before=stacks[i],after=Math.max(before,p.topUpTo);stacks[i]=after;delete p.topUpTo;
  if(after>before){r.topUps??=[];r.topUps.push({subject:p.account||p.digest,seat:i,name:p.name,hand:r.number+1,before,after,added:after-before,at:now});if(r.topUps.length>100)r.topUps.shift()}
 }
 const button=previous?nextDealer(stacks,previous):stacks.findIndex(Boolean);
 r.number++;r.hand=startHand(stacks,r.settings?.blind||4,button,r.settings?.variant);r.hand.hudStartedAt=now;r.hand.hudSubjects=r.players.map(p=>p?noteSubject(p):null);r.hand.hudNames=r.players.map(p=>p?.name??null);r.hand.hudAvatars=r.players.map(p=>p?.account?avatarFor(p.account):p?0:null);startClock(r,now);r.ready.fill(false);delete r.waitingStacks;delete r.previousHand;
}
function newRoom(table,body,capacity,now){
 return {settings:table?{name:table.name,stack:table.stack,blind:table.blind,...(table.actionSeconds!==undefined?{actionSeconds:table.actionSeconds}:{}),...(table.timeBankSeconds?{timeBankSeconds:table.timeBankSeconds,hotTimeSeconds:table.hotTimeSeconds??5}:{}),...(table.cardSqueeze===true&&['cash','plo','plo5','plo6','tournament'].includes(table.mode||'cash')?{cardSqueeze:true}:{}),...(table.ante!==undefined?{ante:table.ante}:{}),...(table.minBuyIn!==undefined?{minBuyIn:table.minBuyIn,maxBuyIn:table.maxBuyIn}:{}),...(table.variant==='plo'?{variant:'plo'}:{}),...((table.mode?.startsWith('plo')||['shortdeck','aof'].includes(table.mode))?{variant:table.mode}:{})}:null,tournament:(table?table.mode:body.mode)==='tournament'?{entry,pool:0,intervalMs:table?.levelSeconds===undefined?intervalMs:table.levelSeconds*1000,startsAt:table?.startsAt||null,prizeShares:[...(table?.prizeShares||[100])],startedAt:null,level:1,out:Array(capacity).fill(null),winner:null,prizes:null,nextDealAt:null}:null,players:Array(capacity).fill(null),ready:Array(capacity).fill(false),number:0,version:0,hand:null,results:[],touched:now};
}
function scheduledStart(r,now,avatarFor){
 const t=r?.tournament;
 if(!t?.startsAt||t.startedAt!==null||t.cancelledAt||now<t.startsAt)return;
 if(r.players.filter(Boolean).length<Math.max(2,(t.prizeShares||[100]).length)){t.cancelledAt=now;t.refunds=r.players.map(p=>p?entry:0);t.pool=0;r.version++;return}
 t.startedAt=now;tournamentHand(r,now,avatarFor);
}
// Mode changes replace the room and its retained history.
function hudHands(room,subject,viewer){
 return (room.hudHistory||[]).flatMap(h=>{
  const seat=h.subjects.indexOf(subject),own=h.subjects.indexOf(viewer),result=h.result||room.results.find(r=>r.number===h.number);if(seat<0||!result)return [];
  const cards=h.cards.map((hand,i)=>i===own&&h.privateCards?.[i]?.length?h.privateCards[i]:hand);
  return [structuredClone({...result,mode:room.tournament?'tournament':'cash',...(Number.isSafeInteger(h.startedAt)&&h.startedAt>=0?{startedAt:h.startedAt}:{}),canReport:own>=0&&Number.isSafeInteger(h.startedAt)&&h.startedAt>=0&&Date.now()>=h.startedAt&&Date.now()-h.startedAt<30*hour,dealtSeats:h.subjects.map(Boolean),...(h.historyTrace?{historyTrace:h.historyTrace}:{}),...(h.historyEvents?{historyEvents:h.historyEvents}:{}),...(h.variant?{variant:h.variant,button:h.button,folded:h.folded,...(h.initialStacks?{initialStacks:h.initialStacks}:{}),...(h.avatars?{avatars:h.avatars}:{})}:{}),...(Number.isSafeInteger(h.blind)&&h.blind>0?{blind:h.blind}:{}),at:h.at,names:h.names,cards,seat,viewerSeat:own,net:result.payouts[seat]-result.committed[seat]})];
 });
}
function chatMuted(r,p){return !!(p?.chatMuted||p?.account&&r.mutedAccounts?.includes(p.account))}
function chatRoster(r){return r?r.players.flatMap((p,seat)=>p&&!p.bot?[{seat,name:p.name,muted:chatMuted(r,p),accountBound:!!p.account,subject:digest(p.account?'account:'+p.account:'seat:'+p.digest).slice(0,24)}]:[]):[]}
const reservedSeats=r=>[...(r?.reservations||[]).map(p=>p.seat),...(r?.waiting||[]).flatMap(p=>p.offer?[p.offer.seat]:[])];
// shortcut: local FIFO offers last30s; replace only with observed operator arbitration rules.
function advanceWaiting(r,table,now){
 if(r?.reservations?.length){const before=JSON.stringify(r.reservations);r.reservations=r.reservations.filter(p=>table?.open&&!r.tournament&&!r.players[p.seat]&&p.expiresAt>now);if(JSON.stringify(r.reservations)!==before)r.version++}
 if(!r?.waiting?.length)return;
 const before=JSON.stringify(r.waiting);
 if(!table?.open||r.tournament)r.waiting=[];
 else{
  r.waiting=r.waiting.filter(p=>!r.players.some(seat=>seat?.account===p.account));
  if(r.waiting[0]?.offer?.expiresAt<=now)r.waiting.shift();
  const first=r.waiting[0],seat=r.players.findIndex((p,i)=>!p&&!r.reservations?.some(r=>r.seat===i));
  if(first){if(first.offer&&(r.players[first.offer.seat]||r.reservations?.some(r=>r.seat===first.offer.seat)))delete first.offer;if(seat>=0&&!first.offer)first.offer={seat,expiresAt:now+30000}}
 }
 if(JSON.stringify(r.waiting)!==before)r.version++;
}
function handle(rooms,id,op,token,body,table,account,avatarFor,notes){
  if(!/^[a-f0-9]{48}$/.test(id))fail(404,'Unknown room');
  const now=Date.now();
  for(const [k,r] of rooms)if(!r.settings&&now-r.touched>4*hour)rooms.delete(k);
  let r=rooms.get(id);
  if(r&&table&&!r.hand&&!r.players.some(Boolean)){
    const size=table.mode==='tournament'?(table.tournamentSeats||4):table.mode==='aof'?4:6;
    const fresh=newRoom(table,{},size,now);
    if(JSON.stringify(r.settings)!==JSON.stringify(fresh.settings)||r.players.length!==size||!!r.tournament!==!!fresh.tournament||r.tournament?.intervalMs!==fresh.tournament?.intervalMs||(r.tournament?.startsAt||null)!==(fresh.tournament?.startsAt||null)||JSON.stringify(r.tournament?.prizeShares||[100])!==JSON.stringify(fresh.tournament?.prizeShares||[100])){
      fresh.version=r.version+1;if(r.hud)fresh.hud=r.hud;fresh.chat=r.chat||[];if(r.mutedAccounts)fresh.mutedAccounts=r.mutedAccounts;if(r.cashOuts)fresh.cashOuts=r.cashOuts;r=fresh;rooms.set(id,r);
    }
  }
  const capacity=r?.players.length??(table?.mode==='tournament'?(table.tournamentSeats||4):table&&table.mode!=='aof'?6:4);
  if(op==='tick'&&!r&&table?.mode==='tournament'&&table.startsAt&&now>=table.startsAt){
    if(rooms.size>=100)fail(503,'Room limit reached');r=newRoom(table,{},capacity,now);rooms.set(id,r);
  }
  if(op==='moderation')return chatRoster(r);
  if(op==='moderate-chat'){
    if(!Number.isInteger(body.seat)||typeof body.muted!=='boolean')fail(400,'Choose a player and mute state');
    const player=chatRoster(r).find(p=>p.seat===body.seat);
    if(!player||player.subject!==body.subject)fail(409,'Seat changed; reload players');
    if(player.muted===body.muted)return {changed:false,players:chatRoster(r)};
    const p=r.players[body.seat];p.chatMuted=body.muted;
    if(p.account){const accounts=new Set(r.mutedAccounts||[]);if(body.muted)accounts.add(p.account);else accounts.delete(p.account);r.mutedAccounts=[...accounts]}
    r.version++;return {changed:true,players:chatRoster(r)};
  }
  scheduledStart(r,now,avatarFor);
  if(op==='tick'){
    if(!r)return null;
    if(r.tournament?.nextDealAt!=null&&now>=r.tournament.nextDealAt)tournamentHand(r,now,avatarFor);
    if(r.hand&&!r.hand.end){
      if(now>=r.deadline)step(r,r.hand.variant==='aof'||options(r.hand).due?'fold':'check');
      else if(r.players[r.hand.turn]?.bot&&now>=(r.actionClock?.startedAt??r.deadline-turnMs(r))+500){const g=r.hand;step(r,...computerMove(g.hands[g.turn],g.board,g.blind,g.price,options(g),g.variant))}
    }
    return view(r,null,avatarFor);
  }
  advanceWaiting(r,table,now);
  if(op==='watch'){
    if(!table)fail(404,'Unknown hosted table');
    if(!r)return {me:null,version:0,names:Array(capacity).fill(null),settings:table,hand:null,results:[]};
    return view(r,null,avatarFor);
  }
  if(op==='summary'){
    const results=r?.results||[],dealt=results.reduce((n,h)=>n+(h.dealt||0),0);
    const avgPot=results.length?Math.round(results.reduce((n,h)=>n+h.committed.reduce((a,v,i)=>a+v-h.returns[i],0),0)/results.length):null;
    const trackedAllIns=results.filter(h=>Number.isInteger(h.allIn)&&h.dealt>0),trackedSeats=trackedAllIns.reduce((n,h)=>n+h.dealt,0);
    const vpip=dealt?Math.round(100*results.reduce((n,h)=>n+(h.voluntary||0),0)/dealt):null;
    const g=r?.hand,dealtSeats=g?.hands.flatMap((cards,i)=>cards.length?[i]:[]),smallBlind=g&&(dealtSeats.length===2?g.button:Array.from({length:capacity},(_,i)=>(g.button+i+1)%capacity).find(i=>dealtSeats.includes(i)));
    return {avgPot,vpip,capacity,waitingCount:r?.waiting?.length||0,reservedSeats:reservedSeats(r),...(g&&g.variant!=='shortdeck'?{positions:{dealer:g.button,smallBlind,bigBlind:g.bigBlindSeat}}:{}),...(table?.mode==='aof'?{allInPercent:trackedSeats?Math.round(100*trackedAllIns.reduce((n,h)=>n+h.allIn,0)/trackedSeats):null}:{}),...(r?.tournament?{currentBlind:r.hand?.blind||table?.blind||4,...(r.settings?.ante?{currentAnte:r.hand?.ante||r.settings.ante}:{}),level:r.tournament.level,...(r.tournament.cancelledAt?{cancelled:true}:{})}:{}),occupied:r?.players.filter(Boolean).length||0,hand:r?.number||0,seats:Array.from({length:capacity},(_,i)=>r?.players[i]?{name:r.players[i].name,stack:r.hand?.stacks[i]??r.waitingStacks?.[i]??r.players[i].buyIn??table?.stack??null,...(r.players[i].account?{avatar:avatarFor(r.players[i].account)}:{})}:null)};
  }
  if(op==='waiting'){
   if(typeof account!=='string'||!account.trim()||account.length>24)fail(401,'Sign in locally');if(!table||table.mode==='tournament')fail(409,'Waiting list requires a hosted cash table');
   if(Object.keys(body).some(k=>k!=='action'&&!(body.action==='reserve'&&k==='seat'))||body.action!==undefined&&!['join','cancel','reserve'].includes(body.action))fail(400,'Choose join or cancel waiting');
   if(body.action==='reserve'){
    if(!table.open)fail(409,'Owner closed registration');if(body.seat!==undefined&&(!Number.isInteger(body.seat)||body.seat<0||body.seat>=capacity))fail(400,'Invalid seat');
    if(!r){if(rooms.size>=100)fail(503,'Room limit reached');r=newRoom(table,{},capacity,now);rooms.set(id,r)}
    if(r.players.some(p=>p?.account===account))return {open:true,count:r.waiting?.length||0,position:0,offer:null,seated:true};
    const existing=r.reservations?.find(p=>p.account===account)||r.waiting?.find(p=>p.account===account)?.offer;
    if(existing){if(body.seat!==undefined&&body.seat!==existing.seat)fail(409,'Cancel your previous reservation first')}
    else{
     if(r.waiting?.length)fail(409,'Waiting players have priority');const seat=body.seat??r.players.findIndex((p,i)=>!p&&!reservedSeats(r).includes(i));
     if(seat<0||r.players[seat]||reservedSeats(r).includes(seat))fail(409,'Seat is occupied or reserved');(r.reservations??=[]).push({account,seat,expiresAt:now+30000});r.version++;
    }
   }
   if(body.action==='join'){
    if(!table.open)fail(409,'Owner closed registration');if(r?.players.some(p=>p?.account===account))fail(409,'Already seated at this table');
    if(!r||r.players.some((p,i)=>!p&&!reservedSeats(r).includes(i))&&!r.waiting?.some(p=>p.account===account))fail(409,'Take an available seat');
    if(!r.waiting?.some(p=>p.account===account)){if((r.waiting?.length||0)>=100)fail(409,'Waiting list is full');(r.waiting??=[]).push({account});r.version++}
   }else if(body.action==='cancel'&&r?.waiting?.some(p=>p.account===account)){r.waiting=r.waiting.filter(p=>p.account!==account);r.version++;advanceWaiting(r,table,now)}
   if(body.action==='cancel'&&r?.reservations?.some(p=>p.account===account)){r.reservations=r.reservations.filter(p=>p.account!==account);r.version++;advanceWaiting(r,table,now)}
   const index=r?.waiting?.findIndex(p=>p.account===account)??-1;return {open:!!table.open,count:r?.waiting?.length||0,position:index+1,offer:(()=>{const own=r?.reservations?.find(p=>p.account===account);return own?{seat:own.seat,expiresAt:own.expiresAt}:index===0?r.waiting[0].offer||null:null})()};
  }
  if(op==='join'&&body.seat!==undefined&&(!Number.isInteger(body.seat)||body.seat<0||body.seat>=capacity))fail(400,'Invalid seat');
  if(op==='join'&&(typeof body.name!=='string'||!body.name.trim()||body.name.trim().length>24))fail(400,'Enter a name (1–24 characters)');
  if(!r){
    if(op!=='join')fail(404,'Room not found');
    if(table&&!table.open)fail(409,'Owner closed registration');
    if(rooms.size>=100)fail(503,'Room limit reached');
    r=newRoom(table,body,capacity,now);rooms.set(id,r);
  }
  scheduledStart(r,now,avatarFor);
  let me=token?r.players.findIndex(p=>p&&p.digest===digest(token)):-1,issued;
  if(op==='join'&&account&&me<0){
    me=r.players.findIndex(p=>p?.account===account);
    if(me>=0){issued=randomBytes(32).toString('hex');r.players[me].digest=digest(issued);r.version++}
  }
  if(op==='join'&&me<0&&r.tournament&&(r.tournament.startedAt!==null||r.tournament.cancelledAt))fail(409,'Tournament registration is closed'+(r.players.includes(null)?'':' (room full)'));
  if(op==='join'&&me<0&&table&&!table.open)fail(409,'Owner closed registration');
  if(op==='join'&&me<0){
    if(r.waiting?.length&&r.players.includes(null)){const first=r.waiting[0];if(first.account!==account||!first.offer)fail(409,'Seat reserved for waiting player');if(body.seat!==undefined&&body.seat!==first.offer.seat)fail(409,'Take your offered seat');body.seat=first.offer.seat}
    const ownReservation=r.reservations?.find(p=>p.account===account);if(ownReservation){if(body.seat!==undefined&&body.seat!==ownReservation.seat)fail(409,'Take your reserved seat');body.seat=ownReservation.seat}
    if(body.reservation!==undefined){if(!Number.isSafeInteger(body.reservation))fail(400,'Invalid reservation');const held=ownReservation||r.waiting?.find(p=>p.account===account)?.offer;if(!held||held.expiresAt!==body.reservation||held.expiresAt<=now)fail(409,'Seat reservation expired')}
    const selectedBuyIn=body.buyIn===undefined?table?.stack:body.buyIn;
    if(body.buyIn!==undefined&&(!table||r.tournament))fail(400,'Custom buy-in requires a hosted cash table');
    if(table&&!r.tournament&&(!Number.isSafeInteger(selectedBuyIn)||selectedBuyIn<(table.minBuyIn??table.stack)||selectedBuyIn>(table.maxBuyIn??table.stack)))fail(400,'Buy-in is outside table limits');
    const name=body.name?.trim?.();if(!name||name.length>24)fail(400,'Enter a name (1–24 characters)');
    me=body.seat??r.players.findIndex((p,i)=>!p&&!r.reservations?.some(r=>r.seat===i));if(me<0)fail(409,'Room is full');
    if(r.players[me]||r.reservations?.some(p=>p.seat===me&&p.account!==account))fail(409,'Seat is occupied or reserved');
    if(ownReservation)r.reservations=r.reservations.filter(p=>p!==ownReservation);
    if(r.waiting?.some(p=>p.account===account))r.waiting=r.waiting.filter(p=>p.account!==account);
    issued=randomBytes(32).toString('hex');if(r.host==null||r.host<0){const existing=r.players.findIndex(p=>p&&!p.bot);r.host=existing>=0?existing:me}r.players[me]={name,account:account||null,digest:digest(issued),...(table?.minBuyIn!==undefined?{buyIn:selectedBuyIn}:{})};if(r.tournament)r.tournament.pool+=entry;r.version++;
    if(!r.players.includes(null)&&r.tournament){if(!r.tournament.startsAt){r.tournament.startedAt=now;tournamentHand(r,now,avatarFor)}else scheduledStart(r,now,avatarFor)}
    else if(!r.players.includes(null)&&!r.hand)cashHand(r,now,avatarFor);
  }
  if(me<0)fail(401,'Join this room first');
  r.touched=now;
  if(op==='notes'){
    const viewer=r.players[me];if(viewer.account&&account!==viewer.account)fail(401,'Sign in locally to access private notes');
    const owner=noteSubject(viewer);let reportReceipt;
    if(body.report!==undefined){
      if(Object.keys(body).length!==1)fail(400,'Save reports separately from player notes');
      reportReceipt=saveHandReport(notes,owner,id,hudHands(r,owner,owner).find(h=>h.number===body.report?.number),body.report,now);
    }
    saveNoteLabels(notes,owner,body);
    if(body.seat!==undefined){
      if(!Number.isInteger(body.seat)||body.seat<0||body.seat>=r.players.length||body.seat===me)fail(400,'Choose another seated player');
      const target=r.players[body.seat];if(!target)fail(404,'Player has left');
      const subject=noteSubject(target);if(body.subject!==subject)fail(409,'Seat changed; reopen player notes');
      notes.set(owner,subject,{text:body.text,color:body.color});
    }
    return {...(reportReceipt?{reportReceipt}:{}),reportTypes,self:{seat:me,name:viewer.name,subject:owner,stats:{...(r.hud?.[owner]||{hands:0,wins:0,voluntary:0})},hands:hudHands(r,owner,owner)},colors:noteColors,labels:notes.getLabels(owner),statsScope:'table-session',players:r.players.flatMap((p,seat)=>p&&seat!==me?[{seat,name:p.name,subject:noteSubject(p),hands:hudHands(r,noteSubject(p),owner),stats:{...(r.hud?.[noteSubject(p)]||{hands:0,wins:0,voluntary:0})},...notes.get(owner,noteSubject(p))}]:[])};
  }
  if(op==='shuffle'){
    r.shuffles??=[];const last=r.shuffles.find(e=>e.subject===r.players[me].digest);
    if(last&&now-last.at<3000)fail(429,'Wait before shuffling again');
    r.shuffles=r.shuffles.filter(e=>e.seat!==me);r.shuffles.push({seat:me,subject:r.players[me].digest,at:now});r.version++;
  }
  if(op==='chat'){
    if(chatMuted(r,r.players[me]))fail(403,'Chat muted by table owner');
    const reactions={1:'Angry',2:'Listening',3:'Laughing'};
    if(body.reaction!==undefined&&(!Number.isInteger(body.reaction)||!Object.hasOwn(reactions,body.reaction)))fail(400,'Unknown reaction');
    const text=body.reaction!==undefined?reactions[body.reaction]:typeof body.text==='string'?body.text.trim():'';
    if(!text||text.length>280)fail(400,'Message must contain 1–280 characters');
    r.chat??=[];const lastMessage=r.chat.findLast(message=>message.seat===me);if(lastMessage&&now-lastMessage.at<1000)fail(429,'Wait before sending another message');
    r.chat.push({seat:me,name:r.players[me].name,text,at:now,...(body.reaction!==undefined?{reaction:Number(body.reaction)}:{})});if(r.chat.length>50)r.chat.shift();r.version++;
    const g=r.hand;if(body.reaction!==undefined&&g?.hands[me]?.length&&g.hudSubjects?.[me]===noteSubject(r.players[me])){
      const event={type:'reaction',seat:me,street:g.board.length,afterAction:g.history.length,reaction:body.reaction};g.historyEvents??=[];g.historyEvents.push(event);
      const history=g.end&&r.hudHistory?.find(h=>h.number===r.number);if(history){history.historyEvents??=[];history.historyEvents.push({...event})}
    }
  }

  const host=r.host??r.players.findIndex(p=>p&&!p.bot),canFill=!!(table?.open&&!r.hand&&!r.tournament?.cancelledAt&&me===host&&r.players.includes(null));
  const canStart=!!(canFill&&!r.tournament&&r.players.filter(Boolean).length>=2);
  if(op==='start'){if(!canStart||body.version!==r.version)fail(409,'Only the host can start with at least two seated players');cashHand(r,now,avatarFor);r.version++}
  if(op==='fill-bots'){
    if(r.waiting?.length||r.reservations?.length)fail(409,'Waiting players have priority over computers');
    if(!canFill||body.version!==r.version)fail(409,'Only the first seated player can fill empty seats before a hand');
    r.players=r.players.map((p,i)=>p||{bot:true,name:'Computer '+(i+1),noteId:randomBytes(16).toString('hex')});
    if(r.tournament){r.tournament.pool=capacity*entry;if(!r.tournament.startsAt){r.tournament.startedAt=now;tournamentHand(r,now,avatarFor)}else{r.version++;scheduledStart(r,now,avatarFor)}}
    else{cashHand(r,now,avatarFor);r.version++}
  }
  if(op==='end-practice'){
    if(!r.hand?.end||me!==host||!r.players.every((p,i)=>i===me||p?.bot)||body.version!==r.version)fail(409,'Finish the solo hand first');
    rooms.delete(id);return {left:true}
  }
  if(r.tournament?.nextDealAt!=null&&now>=r.tournament.nextDealAt)tournamentHand(r,now,avatarFor);
  if(r.hand&&!r.hand.end&&now>=r.deadline)step(r,r.hand.variant==='aof'||options(r.hand).due?'fold':'check');
  if(op==='show-cards'){
    const g=r.hand,indices=body.indices;
    if(r.players[me].account&&r.players[me].account!==account)fail(401,'Log in as the seated player');
    if(!g?.end||body.number!==r.number)fail(409,'Show cards only after the current hand ends');
    if(!Array.isArray(indices)||!indices.length||indices.length>g.hands[me].length||Array.from(indices).some(i=>!Number.isInteger(i)||i<0||i>=g.hands[me].length)||new Set(indices).size!==indices.length||body.seat!==undefined)fail(400,'Choose your original card indices');
    const selected=[...indices].sort((a,b)=>a-b),previous=g.shownIndices?.[me];
    if(previous){if(JSON.stringify(previous)!==JSON.stringify(selected))fail(409,'Cards already selected');}
    else{
      if(body.version!==r.version)fail(409,'Table changed; refresh and try again');
      const live=g.folded.filter(f=>!f).length;if(!g.folded[me]&&live>=2)fail(409,'Showdown cards are already public');
      g.shownIndices??=Array(g.hands.length).fill(null);g.shownIndices[me]=selected;r.version++;
      const history=r.hudHistory?.find(h=>h.number===r.number);if(history){history.cards=visibleCards(g,null).map(hand=>hand?[...hand]:null);history.historyEvents??=[];history.historyEvents.push({type:'show-cards',seat:me,street:g.board.length,afterAction:g.history.length,indices:[...selected]})}
    }
  }
  if(op==='time-bank'){
    if(body.isPaidAction!==undefined&&body.isPaidAction!==false||body.isTimeChipToggle!==undefined&&body.isTimeChipToggle!==false)fail(400,'Paid time chips are unavailable');
    if(reserveClock(r,me,body.actionId,now)){r.hand.historyEvents??=[];r.hand.historyEvents.push({type:'clock-limit-disabled',seat:me,street:r.hand.board.length,afterAction:r.hand.history.length});r.version++}
  }
  if(['act','ready','leave'].includes(op)){
    if(body.version!==r.version&&!(op==='ready'&&body.number===r.number&&r.hand?.end))fail(409,'Table changed; refresh and try again');
    if(op==='act'){
      if(!r.hand||r.hand.end||r.hand.turn!==me)fail(409,'Not your turn');
      if(body.reserved!==undefined&&typeof body.reserved!=='boolean')fail(400,'Invalid reserved action flag');
      const board=r.hand.board.length;
      step(r,body.action,body.target);
      if(body.reserved===true&&body.action==='check'){r.hand.reservedChecks??=Array(r.players.length).fill(null);r.hand.reservedChecks[me]=board}else if(r.hand.reservedChecks)r.hand.reservedChecks[me]=null;
    }else if(op==='ready'){
      if(r.tournament)fail(409,'No rebuys or ready actions in tournaments');
      if(body.number!==undefined&&body.number!==r.number)fail(409,'Hand changed; refresh and try again');
      if(!r.hand?.end)fail(409,'Hand is not finished');
      if(body.topUpTo!==undefined&&(!Number.isSafeInteger(body.topUpTo)||body.topUpTo<(table?.minBuyIn??table?.stack??1)||body.topUpTo>(table?.maxBuyIn??table?.stack??1000000)))fail(400,'Top-up is outside table limits');
      if(r.hand.hands[me].length&&r.hand.stacks[me]===0&&body.topUpTo===undefined)fail(409,'Choose a buy-in to rebuy before the next hand');
      if(!r.ready[me]){if(body.topUpTo!==undefined)r.players[me].topUpTo=body.topUpTo;r.ready[me]=true;r.version++}
      if(r.players.every((p,i)=>!p||r.ready[i])){
        cashHand(r,now,avatarFor);
      }
    }else{
      const reservation=!r.tournament&&r.hand&&!r.hand.hands[me].length&&r.hand.committed[me]===0;
      if((r.hand&&!r.hand.end&&!reservation)||(r.tournament&&(r.hand||r.tournament.cancelledAt)))fail(409,'Leave between cash hands or before tournament registration closes');
      const funded=!reservation&&!r.tournament&&!!(r.hand||r.waitingStacks),cashOut=r.hand?.stacks[me]??r.waitingStacks?.[me]??0;
      if(r.hand&&!reservation){r.previousHand={button:r.hand.button,bigBlindSeat:r.hand.bigBlindSeat,variant:r.hand.variant};r.waitingStacks=[...r.hand.stacks];r.hand=null;r.deadline=null;r.ready.fill(false);for(const p of r.players)if(p)delete p.topUpTo}
      if(funded){
        r.cashOuts??=[];r.cashOuts.push({name:r.players[me].name,chips:cashOut,hand:r.number,at:now});if(r.cashOuts.length>100)r.cashOuts.shift();r.waitingStacks[me]=null;
      }
      r.players[me]=null;if(me===host)r.host=r.players.findIndex(p=>p&&!p.bot);if(r.tournament)r.tournament.pool-=entry;r.version++;return {left:true,...(funded?{cashOut}:{})};
    }
  }
  if(op==='state'&&r.hand&&!r.hand.end&&r.players[r.hand.turn]?.bot&&now>=(r.actionClock?.startedAt??r.deadline-turnMs(r))+500){const g=r.hand;step(r,...computerMove(g.hands[g.turn],g.board,g.blind,g.price,options(g),g.variant))}
  return {...view(r,me,avatarFor),issued,canStart:canStart&&!r.hand,canFill:canFill&&!r.hand,soloBots:r.players.some(p=>p?.bot)&&r.players.every((p,i)=>i===me||p?.bot)};
}
function view(r,me,avatarFor){
  const g=r.hand,clock=clockView(r,me,Date.now());
  if(clock){delete clock.bankRemainingMs;clock.bankEndsAt=r.actionClock.bankEnd}
  return {me,reservedSeats:reservedSeats(r),...(me!=null?{noteSubjects:r.players.map((p,i)=>p&&i!==me?noteSubject(p):null)}:{}),...(me!=null&&r.topUps?{topUps:r.topUps.filter(t=>t.subject===(r.players[me]?.account||r.players[me]?.digest)).map(({subject,...t})=>t)}:{}),...(r.players.some(p=>p?.buyIn!==undefined)?{buyIns:r.players.map(p=>p?p.buyIn??r.settings.stack:0)}:{}),...(me!=null&&chatMuted(r,r.players[me])?{chatMuted:true}:{}),...(g&&me!=null&&!g.hands[me].length?{waitingForHand:true}:{}),...(r.waitingStacks?{waitingStacks:r.waitingStacks}:{}),...(r.shuffles?{shuffles:r.shuffles.filter(e=>e.subject===r.players[e.seat]?.digest&&Date.now()-e.at<2450).map(({seat,at})=>({seat,at}))}:{}),avatars:r.players.map(p=>p?.account?avatarFor(p.account):null),chat:r.chat||[],settings:r.settings,tournament:r.tournament,version:r.version,number:r.number,names:r.players.map(p=>p?.name??null),ready:r.ready,results:r.results,
    hand:g&&{dealtSeats:g.hands.flatMap((cards,i)=>cards.length?[i]:[]),...(g.end&&g.shownIndices?{shownIndices:g.shownIndices.map(indices=>indices?[...indices]:null)}:{}),...(me!=null&&g.end&&g.hands[me].length&&!g.shownIndices?.[me]&&(g.folded[me]||g.folded.filter(f=>!f).length<2)?{canShowCards:true}:{}),...(r.settings?.timeBankSeconds?{timeBanks:r.players.map(p=>p?p.timeBankMs??r.settings.timeBankSeconds*1000:null)}:{}),...(clock?{clock}:{}),...(r.settings?.cardSqueeze?{squeezeActivated:true}:{}),blind:g.blind,...(g.ante?{ante:g.ante}:{}),button:g.button,turn:g.turn,deadline:g.end?null:r.deadline,stacks:g.stacks,bets:g.bets,committed:g.committed,folded:g.folded,board:g.board,pots:collectedPots(g),
      ...(me!=null&&!g.end&&!g.folded[me]&&g.stacks[me]>0&&g.hands[me].length?{preAction:{...(g.variant==='aof'?{aof:true}:{}),due:Math.max(0,g.price-g.bets[me]),call:Math.min(g.stacks[me],Math.max(0,g.price-g.bets[me])),acted:g.actedAt[me]!==null,reservedCheck:g.reservedChecks?.[me]===g.board.length,foldEnabled:g.stacks.some((stack,i)=>i!==me&&!g.folded[i]&&g.bets[i]+stack>g.bets[me])}}:{}),cards:visibleCards(g,me),history:g.history,end:g.end,options:g.turn===me?options(g):null}};
}

const digest=token=>createHash('sha256').update(token).digest('hex');
export const noteSubject=p=>digest(p.account?'account:'+p.account.toLowerCase():p.bot?'bot:'+p.noteId:'seat:'+p.digest);
export function openRooms(file,avatarFor=()=>0){
  let rooms=new Map();
  try{rooms=new Map(JSON.parse(readFileSync(file,'utf8')))}catch(e){if(e.code!=='ENOENT')throw e}
  for(const r of rooms.values())if(r.reservations!==undefined&&(!Array.isArray(r.reservations)||r.reservations.length>r.players.length||new Set(r.reservations.map(p=>p?.seat)).size!==r.reservations.length||new Set(r.reservations.map(p=>p?.account)).size!==r.reservations.length||r.reservations.some(p=>!p||!Number.isInteger(p.seat)||p.seat<0||p.seat>=r.players.length||r.players[p.seat]||typeof p.account!=='string'||!p.account.trim()||p.account.length>24||!Number.isSafeInteger(p.expiresAt)||p.expiresAt<0||p.expiresAt>8640000000000000)))throw Error('Invalid cash reservations');
  const notes=openNotes(file+'.notes.json');
  let migrated=false;for(const r of rooms.values())for(const p of r.players)if(p?.bot&&!p.noteId){p.noteId=randomBytes(16).toString('hex');migrated=true}
  if(migrated){writeFileSync(file+'.tmp',JSON.stringify([...rooms]),{mode:0o600});renameSync(file+'.tmp',file)}
  const request=(id,op,token,body,table,account)=>{
    const old=rooms.get(id),version=old?.version;
    try{return handle(rooms,id,op,token,body,table,account,avatarFor,notes)}finally{
    advanceWaiting(rooms.get(id),table,Date.now());
    if(rooms.get(id)?.version!==version){
      try{
        writeFileSync(file+'.tmp',JSON.stringify([...rooms]),{mode:0o600});
        renameSync(file+'.tmp',file);
      }catch(e){
        // Discard the unacknowledged update; reload the last committed snapshot.
        try{rooms=new Map(JSON.parse(readFileSync(file,'utf8')))}catch(err){if(err.code!=='ENOENT')throw err;rooms=new Map()}
        throw e;
      }
    }
    }
  };
  request.notes=notes;
  request.hasActivePlay=()=>[...rooms.values()].some(r=>r.hand&&!r.hand.end||r.tournament?.startedAt!=null&&r.tournament.winner==null&&!r.tournament.cancelledAt);
  return request;
}
