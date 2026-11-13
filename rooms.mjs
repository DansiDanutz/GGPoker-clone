import {rushPool} from './engine/rush-pool.mjs';
import {emoticonById} from './emoticons.mjs';
import {cashWallet} from './cash-wallet.mjs';
import {prizeAmounts} from './engine/prizes.mjs';
import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import {createHash,randomBytes} from 'node:crypto';
import {startHand,act,options,nextDealer,omahaRank,preflopRaised,preflopOpportunities,showdownStats,rabbitCards} from './engine/table.mjs';
import {bestShortDeck} from './engine/hand.mjs';
import {eliminationPlaces} from './engine/eliminations.mjs';
import {best} from './game.mjs';
import {blindLevel} from './blind-level.mjs';
import {startClock,finishClock,reserveClock,clockView,autoTimeCard} from './game-clock.mjs';
import {visibleCards,collectedPots} from './room-view.mjs';
import {openNotes,noteColors,saveNoteLabels,reportTypes,saveHandReport} from './player-notes.mjs';
const buyIns=[30,70,100,100], hour=3600000;
const turnMs=room=>(room.settings?.actionSeconds??90)*1000;
const fail=(status,message)=>{throw Object.assign(Error(message),{status})};
const entry=25, initialStack=100;
const intervalMs=Number(process.env.POKER_LEVEL_MS||60000);
if(!Number.isSafeInteger(intervalMs)||intervalMs<1000)throw Error('POKER_LEVEL_MS must be at least 1000');
function tournamentHand(r,now,avatarFor){
  if(r.tournament.pausedAt!=null)return;
  const t=r.tournament,stacks=r.hand?.stacks||r.players.map(p=>p?(r.settings?.stack||initialStack):0);
  const button=r.hand?nextDealer(stacks,r.hand):r.players.findIndex(Boolean);
  const level=blindLevel(t.startedAt,now,t.intervalMs,r.settings?.blind||4);
  t.level=level.level;t.nextDealAt=null;r.number++;r.hand=startHand(stacks,level.bigBlind,button,r.settings?.variant,(r.settings?.ante||0)*(level.bigBlind/(r.settings?.blind||4)));
  r.hand.hudStartedAt=now;r.hand.hudSubjects=r.players.map(p=>p?noteSubject(p):null);r.hand.hudNames=r.players.map(p=>p?.name??null);r.hand.hudAvatars=r.players.map(p=>p?.account?avatarFor(p.account):p?0:null);
  startClock(r,now);r.version++;
  if(r.hand.end)record(r);
}
function record(room){
  const g=room.hand;if(!g.end)return;if(cashSitOut(room)){g.settledAt=Date.now();if(room.players.some(p=>p?.leaveNextHand))room.cashLeaveAt=g.settledAt+3000;}
  const result={number:room.number,board:[...g.board],history:[...g.history],committed:[...g.committed],payouts:[...g.end.payouts],returns:[...g.end.returns],stacks:[...g.stacks],...(g.end.pots?{pots:g.end.pots}:{})};
  if(g.variant==='aof')result.allIn=g.allIns.filter(Boolean).length;
  if(g.vpip){result.voluntary=g.vpip.filter(Boolean).length;result.dealt=g.hands.filter(h=>h.length).length}
  if(g.hudSubjects&&!g.hudRecorded){
    room.hud??={};
    g.hudSubjects.forEach((subject,i)=>{if(!subject||!g.hands[i].length)return;const stats=room.hud[subject]??={hands:0,wins:0,voluntary:0};stats.hands++;if(g.end.payouts[i]>g.end.returns[i])stats.wins++;if(g.vpip?.[i])stats.voluntary++;const raised=preflopRaised(g,i);if(raised!==null){stats.pfrHands=(stats.pfrHands??0)+1;stats.preflopRaises=(stats.preflopRaises??0)+Number(raised)}const opportunities=preflopOpportunities(g,i);if(opportunities)for(const [key,count]of Object.entries(opportunities))stats[key]=(stats[key]??0)+count;const showdown=showdownStats(g,i);if(showdown)for(const [key,count]of Object.entries(showdown))stats[key]=(stats[key]??0)+count;const player=room.players[i],session=player&&noteSubject(player)===subject?player.sessionStats:null;if(session){session.hands++;const remaining=g.folded.filter(f=>!f).length;if(!g.folded[i]&&remaining>1){session.showdowns++;if(g.end.payouts[i]>g.end.returns[i])session.showdownWins++}else if(!g.folded[i]&&remaining===1&&g.end.payouts[i]>g.end.returns[i])session.nonShowdownWins++}});
    room.hudHistory??=[];for(const h of room.hudHistory)if(!h.result){const prior=room.results.find(r=>r.number===h.number);if(prior)h.result=structuredClone(prior)}room.hudHistory.push({result:structuredClone(result),historyEvents:structuredClone(g.historyEvents||[]),...(Number.isSafeInteger(g.hudStartedAt)&&g.hudStartedAt>=0?{startedAt:g.hudStartedAt}:{}),...(g.historyTrace?{historyTrace:structuredClone(g.historyTrace)}:{}),blind:g.blind,variant:g.variant,button:g.button,folded:[...g.folded],...(g.initialStacks?{initialStacks:[...g.initialStacks]}:{}),...(g.hudAvatars?{avatars:[...g.hudAvatars]}:{}),number:room.number,at:Date.now(),subjects:g.hudSubjects.map((subject,i)=>g.hands[i].length?subject:null),names:[...(g.hudNames||room.players.map(p=>p?.name??null))],cards:visibleCards(g,null).map(hand=>hand?[...hand]:null),privateCards:g.hands.map(hand=>[...hand])});if(room.hudHistory.length>30)room.hudHistory.shift();
    g.hudRecorded=true;
  }
  room.results.push(result);if(room.results.length>20)room.results.shift();
  room.ready=room.players.map((p,i)=>!!p?.bot||!!(p&&cashSitOut(room)&&g.sittingOut?.[i]&&hasHandBalance(room,i)&&!p.sitOutNextHand));
  const t=room.tournament;if(!t)return;
  t.finishes??=Array(g.stacks.length).fill(null);
  if(g.initialStacks)for(const {seat,place} of eliminationPlaces(g.initialStacks,g.stacks,g.button))t.finishes[seat]=place;
  for(let i=0;i<g.stacks.length;i++)if(room.players[i]&&!g.stacks[i]&&!t.out[i])t.out[i]=room.number;
  const remaining=g.stacks.flatMap((s,i)=>s?[i]:[]);
  if(remaining.length===1){
    t.winner=remaining[0];t.finishes[t.winner]=1;const amounts=prizeAmounts(t.pool,t.prizeShares||[100]);t.prizes=t.finishes.map(place=>amounts[place-1]||0);
    t.nextDealAt=null;delete t.pauseRequested;delete t.pausedAt;delete t.pauseDelayMs;
  }else if(t.pauseRequested){t.pausedAt=Date.now();t.pauseDelayMs=3000;t.nextDealAt=null;delete t.pauseRequested}
  else t.nextDealAt=Date.now()+3000;
}
function settleTournamentWallet(r,wallet,id){
 const t=r?.tournament;if(!wallet||!t||t.walletSettled||!r.players.some(p=>p?.entryFunded))return;
 const amounts=t.cancelledAt?t.refunds:t.winner!==null?t.prizes:null;if(!amounts)return;
 for(const [seat,p]of r.players.entries())if(p?.entryFunded)wallet.move(p.account,amounts[seat],t.cancelledAt?'tournament-refund':'tournament-prize',id);
 t.walletSettled=true;r.version++;return true;
}
export function computerMove(cards,board,blind,price,o,variant='holdem'){
  if(variant==='aof')return ['allin'];
  const made=cards.length>=4?(board.length>=3?omahaRank(cards,board)[0]>=1:new Set(cards.map(c=>c[0])).size<cards.length):cards[0][0]===cards[1][0]||cards.some(c=>board.some(b=>b[0]===c[0]))||(board.length>=3&&(variant==='shortdeck'?bestShortDeck([...cards,...board]):best([...cards,...board]))[0]>=2);
  if(made&&o.raise&&price<=(board.length?0:blind))return ['raise',o.min];
  if(!made&&o.due>2*blind)return ['fold'];
  return [o.due?'call':'check'];
}
function step(room,action,target){
  const actor=room.hand?.turn,paidBefore=room.hand?.committed?.[actor];
  try{act(room.hand,action,target)}catch{fail(400,'Illegal action')}
  // VPIP is preflop-only; this rule also covers later voluntary bets.
  if(room.settings?.timeChipCount&&room.hand.committed[actor]>paidBefore){room.hand.timeCardVoluntary??=Array(room.players.length).fill(false);room.hand.timeCardVoluntary[actor]=true}
  const now=Date.now();finishClock(room,now);startClock(room,now);room.version++;record(room);
}
function timeCardEvent(room,automatic=false){return {type:'time-card-used',seat:room.hand.turn,street:room.hand.board.length,afterAction:room.hand.history.length,sequence:room.actionClock.cardsUsed-1,seconds:room.settings.freeTimeChipSecondsPerUnit,...(automatic?{automatic:true}:{})}}
function expireClock(room,now){while(autoTimeCard(room,now)){room.hand.historyEvents??=[];room.hand.historyEvents.push(timeCardEvent(room,true));room.version++}if(now>=room.deadline)step(room,room.hand.variant==='aof'||options(room.hand).due?'fold':'check')}
function cashSitOut(r){return !!r?.settings&&!r.tournament&&[undefined,'holdem','plo','plo5','plo6'].includes(r.settings.variant)}
function rabbitEligible(r,me){const g=r?.hand,p=r?.players[me];return !!(cashSitOut(r)&&p&&g?.end&&[0,3,4].includes(g.board.length)&&g.hands[me]?.length&&g.hudSubjects?.[me]===noteSubject(p))}
function hasHandBalance(r,i){return !!(r.hand&&r.players[i]&&(r.hand.hands[i].length||r.hand.sittingOut?.[i]&&r.hand.hudSubjects?.[i]===noteSubject(r.players[i])))}
function cashBalance(r,i){return !r.players[i]?0:hasHandBalance(r,i)?r.hand.stacks[i]:r.waitingStacks?.[i]??r.players[i].buyIn??r.settings?.stack??buyIns[i]??0}
function cashReady(r){return !r.tournament&&r.hand?.end&&r.players.every((p,i)=>!p||p.sitOutNextHand||r.ready[i])}
function returnMinimum(r){return (r.settings?.blind||4)*2}
function returnNeedsChips(r,i){return !!(r.hand?.sittingOut?.[i]&&hasHandBalance(r,i)&&Math.max(cashBalance(r,i)+(r.players[i].addChips?.amount||0),r.players[i].topUpTo||0)<returnMinimum(r))}
function setCashPause(r,me,paused){
 const p=r.players[me];if(!paused&&returnNeedsChips(r,me))fail(409,'Add chips before returning to this table');if(!!p.sitOutNextHand===paused)return false;
 if(paused)p.sitOutNextHand=true;else delete p.sitOutNextHand;r.version++;
 if(!paused&&(r.hand?.end||r.hand?.sittingOut?.[me]&&hasHandBalance(r,me))&&Math.max(cashBalance(r,me)+(p.addChips?.amount||0),p.topUpTo||0)>0)r.ready[me]=true;
 return true;
}
function cashHand(r,now,avatarFor){
 if(r.hand?.end&&r.players.some(p=>p?.leaveNextHand))return false;
 const stacks=r.players.map((p,i)=>{if(!p)return 0;let amount=cashBalance(r,i)+(p.addChips?.amount||0);if(p.bot&&amount===0)amount=p.buyIn??r.settings?.stack??buyIns[i];return Math.max(amount,p.topUpTo||0)}),sittingOut=r.players.map(p=>!!p?.sitOutNextHand),active=stacks.map((n,i)=>sittingOut[i]?0:n),previous=r.hand||r.previousHand;
 if(active.filter(Boolean).length<2)return false;
 for(let i=0;i<r.players.length;i++){
  const p=r.players[i];if(!p)continue;if(!sittingOut[i])delete p.sitOutState;const before=cashBalance(r,i),after=stacks[i];delete p.addChips;delete p.topUpTo;delete p.walletTopUp;
  if(after>before){r.topUps??=[];r.topUps.push({subject:p.account||p.digest,seat:i,name:p.name,hand:r.number+1,before,after,added:after-before,at:now});if(r.topUps.length>100)r.topUps.shift()}
 }
 const button=previous?nextDealer(active,previous):active.findIndex(Boolean);
 r.number++;r.hand=startHand(stacks,r.settings?.blind||4,button,r.settings?.variant,0,sittingOut);r.hand.hudStartedAt=now;r.hand.hudSubjects=r.players.map(p=>p?noteSubject(p):null);r.hand.hudNames=r.players.map(p=>p?.name??null);r.hand.hudAvatars=r.players.map(p=>p?.account?avatarFor(p.account):p?0:null);startClock(r,now);r.ready.fill(false);delete r.waitingStacks;delete r.previousHand;return true;
}
function newRoom(table,body,capacity,now){
 if(table?.entryCost!==undefined&&(table.mode!=='tournament'||!Number.isSafeInteger(table.entryCost)||table.entryCost<0||table.entryCost>1000000))fail(400,'Invalid tournament entry cost');
 return {settings:table?{name:table.name,stack:table.stack,blind:table.blind,...(table.entryCost!==undefined?{entryCost:table.entryCost}:{}),...(table.actionSeconds!==undefined?{actionSeconds:table.actionSeconds}:{}),...(table.timeBankSeconds?{timeBankSeconds:table.timeBankSeconds,hotTimeSeconds:table.hotTimeSeconds??5}:{}),...(table.timeChipCount?{timeChipCount:table.timeChipCount,freeTimeChipSecondsPerUnit:table.freeTimeChipSecondsPerUnit,maxTimeChipsPerAction:table.maxTimeChipsPerAction}:{}),...(table.cardSqueeze===true&&['cash','plo','plo5','plo6','tournament'].includes(table.mode||'cash')?{cardSqueeze:true}:{}),...(table.ante!==undefined?{ante:table.ante}:{}),...(table.minBuyIn!==undefined?{minBuyIn:table.minBuyIn,maxBuyIn:table.maxBuyIn}:{}),...(table.variant==='plo'?{variant:'plo'}:{}),...((table.mode?.startsWith('plo')||['shortdeck','aof'].includes(table.mode))?{variant:table.mode}:{})}:null,tournament:(table?table.mode:body.mode)==='tournament'?{entry:table?.entryCost??entry,pool:0,intervalMs:table?.levelSeconds===undefined?intervalMs:table.levelSeconds*1000,startsAt:table?.startsAt||null,prizeShares:[...(table?.prizeShares||[100])],startedAt:null,level:1,out:Array(capacity).fill(null),winner:null,prizes:null,nextDealAt:null}:null,players:Array(capacity).fill(null),ready:Array(capacity).fill(false),number:0,version:0,hand:null,results:[],touched:now};
}
function scheduledStart(r,now,avatarFor){
 const t=r?.tournament;
 if(!t?.startsAt||t.startedAt!==null||t.cancelledAt||now<t.startsAt)return;
 if(r.players.filter(Boolean).length<Math.max(2,(t.prizeShares||[100]).length)){t.cancelledAt=now;t.refunds=r.players.map(p=>p?t.entry:0);t.pool=0;r.version++;return}
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
function chatRoster(r){if(!r)return [];const seated=r.players.flatMap((p,seat)=>p&&!p.bot?[{seat,name:p.name,muted:chatMuted(r,p),accountBound:!!p.account,subject:digest(p.account?'account:'+p.account:'seat:'+p.digest).slice(0,24)}]:[]),accounts=new Set([...(r.chat||[]).filter(m=>m.observer===true).map(m=>m.name),...(r.mutedAccounts||[])]);return [...seated,...[...accounts].filter(account=>typeof account==='string'&&account.trim()&&account.length<=24&&!r.players.some(p=>p?.account===account)).map(account=>({seat:null,name:account,muted:chatMuted(r,{account}),accountBound:true,subject:digest('account:'+account).slice(0,24)}))]}
function chatContent(body,strict=false){
 const native=body.emoticon!==undefined,item=native?emoticonById(body.emoticon):null,kind=native?'emoticon':body.reaction!==undefined?'reaction':'text';
 if((strict||native)&&(Object.keys(body).some(k=>![kind,'version'].includes(k))||body.version!==undefined&&(!Number.isSafeInteger(body.version)||body.version<0)))fail(400,'Invalid chat message');
 if(native&&!item)fail(400,'Unknown native emoticon');const reactions={1:'Angry',2:'Listening',3:'Laughing'};if(body.reaction!==undefined&&(!Number.isInteger(body.reaction)||!Object.hasOwn(reactions,body.reaction)))fail(400,'Unknown reaction');
 const text=native?item.label:body.reaction!==undefined?reactions[body.reaction]:typeof body.text==='string'?body.text.trim():'';if(!native&&!text||text.length>280)fail(400,'Message must contain 1–280 characters');return {text,...(native?{emoticon:item.id}:body.reaction!==undefined?{reaction:body.reaction}:{})};
}
function recordChat(r,seat,player,body,now,observer=false){
 if(chatMuted(r,player))fail(403,'Chat muted by table owner');if(player.helmet)fail(403,'Take off your helmet to chat');const content=chatContent(body,observer),sender=noteSubject(player);r.chat??=[];
 const last=r.chat.findLast(m=>m.sender===sender||m.sender===undefined&&m.seat===seat&&m.name===player.name);if(last&&now-last.at<1000)fail(429,'Wait before sending another message');
 r.chat.push({seat,name:player.name,...content,at:now,...(observer?{observer:true}:{}),sender});if(r.chat.length>50)r.chat.shift();r.version++;
 const g=r.hand;if(!observer&&(content.emoticon!==undefined||content.reaction!==undefined)&&g?.hands[seat]?.length&&g.hudSubjects?.[seat]===noteSubject(player)){const event={type:'reaction',seat,street:g.board.length,afterAction:g.history.length,...(content.emoticon!==undefined?{emoticon:content.emoticon}:{reaction:content.reaction})};g.historyEvents??=[];g.historyEvents.push(event);const history=g.end&&r.hudHistory?.find(h=>h.number===r.number);if(history){history.historyEvents??=[];history.historyEvents.push({...event})}}
}

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
function adoptCashSeat(r,me,wallet,id){
 if(wallet&&r.settings&&r.players[me].account&&!r.tournament&&!r.players[me].walletFunded){const p=r.players[me],stake=cashBalance(r,me);const pending=p.topUpTo?Math.max(0,p.topUpTo-stake-(p.addChips?.amount||0)):0;wallet.adopt(p.account,stake+pending+(p.addChips?.amount||0)+(!r.hand?.end?(r.hand?.committed[me]||0):0),id);p.walletFunded=true;if(pending)p.walletTopUp=pending}
}
function leaveSeat(r,me,wallet,id,now,host){
      const reservation=!r.tournament&&r.hand&&!r.hand.hands[me].length&&r.hand.committed[me]===0;
      if((r.hand&&!r.hand.end&&!reservation)||(r.tournament&&(r.hand||r.tournament.cancelledAt)))fail(409,'Leave between cash hands or before tournament registration closes');
      const funded=(!reservation||hasHandBalance(r,me))&&!r.tournament&&!!(r.hand||r.waitingStacks),cashOut=r.hand?.stacks[me]??r.waitingStacks?.[me]??0;
      if(wallet&&r.players[me].entryFunded)wallet.move(r.players[me].account,r.tournament.entry,'tournament-refund',id);
      if(wallet&&r.players[me].walletFunded){const p=r.players[me],held=reservation||!r.hand&&!r.waitingStacks?cashBalance(r,me):cashOut;wallet.move(p.account,held,'cash-out',id);if(p.addChips)wallet.move(p.account,p.addChips.amount,'refund',id);if((reservation||!r.hand)&&p.walletTopUp){wallet.move(p.account,p.walletTopUp,'refund',id);delete p.walletTopUp}}
      if(wallet&&r.hand&&!reservation)for(const p of r.players)if(p?.walletTopUp){wallet.move(p.account,p.walletTopUp,'refund',id);delete p.walletTopUp}
      if(r.hand&&!reservation){r.previousHand={button:r.hand.button,bigBlindSeat:r.hand.bigBlindSeat,variant:r.hand.variant};r.waitingStacks=[...r.hand.stacks];r.hand=null;r.deadline=null;r.ready.fill(false);for(const p of r.players)if(p)delete p.topUpTo}
      if(funded){
        r.cashOuts??=[];r.cashOuts.push({name:r.players[me].name,chips:cashOut,hand:r.number,at:now});if(r.cashOuts.length>100)r.cashOuts.shift();if(r.waitingStacks)r.waitingStacks[me]=null;
      }
      r.players[me]=null;if(me===host)r.host=r.players.findIndex(p=>p&&!p.bot);if(r.tournament)r.tournament.pool-=r.tournament.entry;r.version++;return {left:true,...(funded?{cashOut}:{})};
}
function flushCashLeaves(r,wallet,id,now,onlyAccount){
 if(!cashSitOut(r))return 0;let left=0;
 for(let i=0;i<r.players.length;i++){
  const p=r.players[i];if(!p?.leaveNextHand||onlyAccount&&p.account!==onlyAccount)continue;
  const reserved=r.hand&&!r.hand.hands[i].length&&r.hand.committed[i]===0;
  if(r.hand&&!r.hand.end&&!reserved||r.hand?.end&&now<(r.cashLeaveAt??Infinity))continue;
  if(p.walletFunded&&!wallet)fail(503,'Cash wallet mode is required for funded rooms');
  adoptCashSeat(r,i,wallet,id);const balance=cashBalance(r,i),receipt=leaveSeat(r,i,wallet,id,now,r.host??r.players.findIndex(p=>p&&!p.bot));
  r.cashDepartures??=[];r.cashDepartures.push({digest:p.digest,account:p.account,cashOut:receipt.cashOut??balance,at:now});if(r.cashDepartures.length>100)r.cashDepartures.shift();left++;
 }
 if(!r.players.some(p=>p?.leaveNextHand))delete r.cashLeaveAt;return left;
}
function canRemoveSeat(table,r,now){return !!(table&&r&&(r.tournament?r.tournament.startedAt===null&&!r.tournament.cancelledAt&&!r.hand&&(!r.tournament.startsAt||now<r.tournament.startsAt):!r.hand||r.hand.end))}
function seatRoster(r){return r?r.players.flatMap((p,seat)=>p?[{seat,name:p.name,bot:!!p.bot,accountBound:!!p.account,subject:digest('owner:'+noteSubject(p)).slice(0,24)}]:[]):[]}
function handle(rooms,id,op,token,body,table,account,avatarFor,notes,wallet){
  if(!/^[a-f0-9]{48}$/.test(id))fail(404,'Unknown room');
  const now=Date.now(),enteredVersion=rooms.get(id)?.version,enteredClockId=rooms.get(id)?.actionClock?.id;
  for(const [k,r] of rooms)if(!r.settings&&now-r.touched>4*hour)rooms.delete(k);
  let r=rooms.get(id);
  flushCashLeaves(r,wallet,id,now);
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
  if(op==='owner-tournament'||op==='tournament-control'){
    const t=r?.tournament;
    const status=()=>({version:r?.version??0,canControl:!!(t&&t.startedAt!==null&&t.winner===null&&!t.cancelledAt),paused:t?.pausedAt!=null,pauseRequested:!!t?.pauseRequested});
    if(op==='owner-tournament')return status();
    if(!table||!status().canControl)fail(409,'Choose a running tournament');
    if(Object.keys(body).some(k=>!['tableId','action','version'].includes(k))||!['pause','resume'].includes(body.action)||!Number.isSafeInteger(body.version))fail(400,'Choose pause or resume with a current version');
    const wantsPause=body.action==='pause',isPaused=t.pausedAt!=null||!!t.pauseRequested;
    if(wantsPause===isPaused)return {...status(),changed:false};
    if(body.version!==r.version)fail(409,'Tournament changed; reload controls');
    if(wantsPause){
      if(r.hand&&!r.hand.end)t.pauseRequested=true;
      else{t.pausedAt=now;t.pauseDelayMs=Math.max(0,(t.nextDealAt??now)-now);t.nextDealAt=null}
    }else{
      if(t.pausedAt!=null){t.startedAt+=Math.max(0,now-t.pausedAt);t.nextDealAt=now+(t.pauseDelayMs??3000)}
      delete t.pauseRequested;delete t.pausedAt;delete t.pauseDelayMs;
    }
    r.version++;return {...status(),changed:true};
  }
  if(op==='owner-seats')return {version:r?.version??0,canRemove:canRemoveSeat(table,r,now),...(table?.mode==='tournament'?{tournament:true}:{}),players:seatRoster(r)};
  if(op==='remove-seat'){
    if(!canRemoveSeat(table,r,now))fail(409,'Remove a cash seat between hands or a tournament registration before start');
    if(Object.keys(body).some(k=>!['tableId','seat','subject','version'].includes(k))||!Number.isInteger(body.seat)||body.seat<0||body.seat>=r.players.length||typeof body.subject!=='string'||!Number.isSafeInteger(body.version))fail(400,'Choose a current seat');
    const player=seatRoster(r).find(p=>p.seat===body.seat&&p.subject===body.subject);if(!player||body.version!==r.version)fail(409,'Seat changed; reload players');
    if(r.tournament){const entryRefund=r.players[body.seat].entryFunded?r.tournament.entry:0;leaveSeat(r,body.seat,wallet,id,now,r.host??r.players.findIndex(p=>p&&!p.bot));return {removed:{seat:player.seat,name:player.name,entryRefund},version:r.version,players:seatRoster(r)}}
    adoptCashSeat(r,body.seat,wallet,id);const p=r.players[body.seat],cashReturned=cashBalance(r,body.seat),pendingRefund=p.walletFunded?(p.addChips?.amount||0)+(p.walletTopUp||0):0;const receipt=leaveSeat(r,body.seat,wallet,id,now,r.host??r.players.findIndex(p=>p&&!p.bot));
    return {removed:{seat:player.seat,name:player.name,...(pendingRefund?{pendingRefund}:{}),cashOut:receipt.cashOut??cashReturned},version:r.version,players:seatRoster(r)};
  }
  if(op==='moderation')return chatRoster(r);
  if(op==='moderate-chat'){
    if(body.seat!==null&&!Number.isInteger(body.seat)||typeof body.muted!=='boolean')fail(400,'Choose a player and mute state');
    const player=chatRoster(r).find(p=>p.seat===body.seat&&p.subject===body.subject);
    if(!player||player.subject!==body.subject)fail(409,'Seat changed; reload players');
    if(player.muted===body.muted)return {changed:false,players:chatRoster(r)};
    const p=body.seat===null?{account:player.name}:r.players[body.seat];if(body.seat!==null)p.chatMuted=body.muted;
    if(p.account){const accounts=new Set(r.mutedAccounts||[]);if(body.muted)accounts.add(p.account);else accounts.delete(p.account);r.mutedAccounts=[...accounts]}
    r.version++;return {changed:true,players:chatRoster(r),moderated:{...player,muted:body.muted}};
  }
  scheduledStart(r,now,avatarFor);
  if(op==='tick'){
    if(!r)return null;
    if(r.tournament?.nextDealAt!=null&&now>=r.tournament.nextDealAt)tournamentHand(r,now,avatarFor);
    if(cashSitOut(r)&&cashReady(r)&&(!r.players.some(p=>p?.walletFunded)||wallet)&&cashHand(r,now,avatarFor))r.version++;
    if(r.hand&&!r.hand.end){
      if(now>=r.deadline)expireClock(r,now);
      else if(r.players[r.hand.turn]?.bot&&now>=(r.actionClock?.startedAt??r.deadline-turnMs(r))+500){const g=r.hand;step(r,...computerMove(g.hands[g.turn],g.board,g.blind,g.price,options(g),g.variant))}
    }
    return view(r,null,avatarFor);
  }
  advanceWaiting(r,table,now);
  if(op==='watch'){
    if(!table)fail(404,'Unknown hosted table');
    if(!r)return {me:null,version:0,names:Array(capacity).fill(null),settings:table,hand:null,results:[],...(account?{canObserveChat:!!table.open,observerName:account}:{})};
    return view(r,null,avatarFor,account);
  }
  if(op==='summary'){
    const results=r?.results||[],dealt=results.reduce((n,h)=>n+(h.dealt||0),0);
    const avgPot=results.length?Math.round(results.reduce((n,h)=>n+h.committed.reduce((a,v,i)=>a+v-h.returns[i],0),0)/results.length):null;
    const trackedAllIns=results.filter(h=>Number.isInteger(h.allIn)&&h.dealt>0),trackedSeats=trackedAllIns.reduce((n,h)=>n+h.dealt,0);
    const vpip=dealt?Math.round(100*results.reduce((n,h)=>n+(h.voluntary||0),0)/dealt):null;
    const g=r?.hand,dealtSeats=g?.hands.flatMap((cards,i)=>cards.length?[i]:[]),smallBlind=g&&(dealtSeats.length===2?g.button:Array.from({length:capacity},(_,i)=>(g.button+i+1)%capacity).find(i=>dealtSeats.includes(i)));
    return {avgPot,vpip,capacity,...(table?.mode==='tournament'&&wallet?{accountEntryCost:r?.tournament?.entry??table.entryCost??entry}:{}),waitingCount:r?.waiting?.length||0,reservedSeats:reservedSeats(r),...(g&&g.variant!=='shortdeck'?{positions:{dealer:g.button,smallBlind,bigBlind:g.bigBlindSeat}}:{}),...(table?.mode==='aof'?{allInPercent:trackedSeats?Math.round(100*trackedAllIns.reduce((n,h)=>n+h.allIn,0)/trackedSeats):null}:{}),...(r?.tournament?{prizePool:r.tournament.pool,currentBlind:r.hand?.blind||table?.blind||4,...(r.settings?.ante?{currentAnte:r.hand?.ante||r.settings.ante}:{}),level:r.tournament.level,...(r.tournament.cancelledAt?{cancelled:true}:{})}:{}),occupied:r?.players.filter(Boolean).length||0,hand:r?.number||0,seats:Array.from({length:capacity},(_,i)=>r?.players[i]?{name:r.players[i].name,stack:cashBalance(r,i),...(r.players[i].account?{avatar:avatarFor(r.players[i].account)}:{})}:null)};
  }
  if(op==='waiting'){
   if(typeof account!=='string'||!account.trim()||account.length>24)fail(401,'Sign in locally');if(!table||table.mode==='tournament')fail(409,'Waiting list requires a hosted cash table');
   if(Object.keys(body).some(k=>k!=='action'&&!(body.action==='reserve'&&k==='seat'))||body.action!==undefined&&!['join','cancel','reserve'].includes(body.action))fail(400,'Choose join or cancel waiting');
   if(body.action==='reserve'){
    if(!table.open)fail(409,'Owner closed registration');if(body.seat!==undefined&&(!Number.isInteger(body.seat)||body.seat<0||body.seat>=capacity))fail(400,'Invalid seat');
    if(r?.players.some(p=>p?.account===account))return {open:true,count:r.waiting?.length||0,position:0,offer:null,seated:true};
    const existing=r?.reservations?.find(p=>p.account===account)||r?.waiting?.find(p=>p.account===account)?.offer;
    if(!existing&&wallet){const available=wallet.summary(account).available,minimum=table.minBuyIn??table.stack;if(available<minimum)fail(409,'Not enough local play chips: '+available+' available; '+minimum+' required')}
    if(!r){if(rooms.size>=100)fail(503,'Room limit reached');r=newRoom(table,{},capacity,now);rooms.set(id,r)}
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
   const index=r?.waiting?.findIndex(p=>p.account===account)??-1;return {open:!!table.open,count:r?.waiting?.length||0,position:index+1,...(r?.players.some(p=>p?.account===account)?{seated:true}:{}),offer:(()=>{const own=r?.reservations?.find(p=>p.account===account);return own?{seat:own.seat,expiresAt:own.expiresAt}:index===0?r.waiting[0].offer||null:null})()};
  }
  if(op==='join'&&body.seat!==undefined&&(!Number.isInteger(body.seat)||body.seat<0||body.seat>=capacity))fail(400,'Invalid seat');
  if(op==='join'&&(typeof body.name!=='string'||!body.name.trim()||body.name.trim().length>24))fail(400,'Enter a name (1–24 characters)');
  const observingChat=op==='chat'&&!token&&!!table&&typeof account==='string'&&!!account.trim()&&account.length<=24;
  if(op==='chat'&&!token&&table&&!observingChat)fail(401,'Sign in locally to chat as an observer');
  if(!r){
    if(op!=='join'&&!observingChat)fail(404,'Room not found');if(observingChat)chatContent(body,true);
    if(table&&!table.open)fail(409,'Owner closed registration');
    if(rooms.size>=100)fail(503,'Room limit reached');
    r=newRoom(table,op==='join'?body:{},capacity,now);rooms.set(id,r);
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
    const walletFunded=!!(wallet&&account&&table&&!r.tournament);if(walletFunded)wallet.move(account,-selectedBuyIn,'buy-in',id);const entryFunded=!!(wallet&&account&&table&&r.tournament);if(entryFunded)wallet.move(account,-r.tournament.entry,'tournament-entry',id);
    issued=randomBytes(32).toString('hex');if(r.host==null||r.host<0){const existing=r.players.findIndex(p=>p&&!p.bot);r.host=existing>=0?existing:me}r.players[me]={name,account:account||null,digest:digest(issued),sessionStartedAt:now,sessionStats:{hands:0,showdowns:0,showdownWins:0,nonShowdownWins:0},...(walletFunded?{walletFunded:true}:{}),...(entryFunded?{entryFunded:true}:{}),...(table?.minBuyIn!==undefined?{buyIn:selectedBuyIn}:{})};if(r.tournament)r.tournament.pool+=r.tournament.entry;r.version++;
    if(!r.players.includes(null)&&r.tournament){if(!r.tournament.startsAt){r.tournament.startedAt=now;tournamentHand(r,now,avatarFor)}else scheduledStart(r,now,avatarFor)}
    else if(!r.players.includes(null)&&!r.hand)cashHand(r,now,avatarFor);
  }
  if(observingChat){if(r.players.some(p=>p?.account===account))fail(409,'Recover your seated session to chat');recordChat(r,null,{name:account,account},body,now,true);r.touched=now;return view(r,null,avatarFor,account)}
  if(me<0&&op==='state'&&typeof token==='string'&&/^[a-f0-9]{64}$/.test(token)){const receipt=r.cashDepartures?.find(p=>p.digest===digest(token));if(receipt){if(receipt.account&&account!==receipt.account)fail(401,'Sign in locally to recover cash-out');return {left:true,cashOut:receipt.cashOut}}}
  if(me<0)fail(401,'Join this room first');
  if(['join','ready','leave','end-practice','add-chips','sit-out'].includes(op))adoptCashSeat(r,me,wallet,id);
  r.touched=now;
  if(op==='add-chips'){
    const p=r.players[me];if(!table||r.tournament||p.bot)fail(400,'Add chips requires a seated hosted cash player');if(p.account&&account!==p.account)fail(401,'Sign in locally to add chips');
    if(Object.keys(body).some(k=>!['number','version','amount'].includes(k))||!Number.isSafeInteger(body.amount)||body.amount<0)fail(400,'Choose whole play chips');
    if(body.number!==r.number)fail(409,'Hand changed; refresh and try again');
    if(p.addChips){if(p.addChips.number===body.number&&p.addChips.amount===body.amount)return view(r,me,avatarFor);fail(409,'Chips are already pending for the next hand')}
    if(body.version!==r.version)fail(409,'Table changed; refresh and try again');if(r.ready[me])fail(409,'Already ready for the next hand');
    const balance=cashBalance(r,me),available=wallet&&p.walletFunded?wallet.summary(p.account).available:Infinity,max=Math.max(0,Math.min((table.maxBuyIn??table.stack)-balance,available)),min=Math.min(Math.max(0,(table.minBuyIn??table.stack)-balance),max);
    if(body.amount<min||body.amount>max)fail(400,'Additional chips are outside table limits');
    if(body.amount){if(wallet&&p.walletFunded)wallet.move(p.account,-body.amount,'rebuy',id);p.addChips={number:r.number,amount:body.amount};r.version++}
    return view(r,me,avatarFor);
  }
  if(op==='rabbit'){
    if(!rabbitEligible(r,me))fail(409,'Rabbit requires your completed cash hand with an incomplete board');
    if(r.players[me].account&&account!==r.players[me].account)fail(401,'Sign in locally to reveal Rabbit cards');
    if(Object.keys(body).some(k=>!['number','version'].includes(k))||!Number.isSafeInteger(body.number)||body.version!==undefined&&(!Number.isSafeInteger(body.version)||body.version<0))fail(400,'Choose a completed hand');
    if(body.number!==r.number)fail(409,'Hand changed; refresh the table');
    if(!r.hand.rabbitShown?.[me]){rabbitCards(r.hand);r.hand.rabbitShown??=r.players.map(()=>false);r.hand.rabbitShown[me]=true;r.version++}
    return view(r,me,avatarFor);
  }
  if(op==='sit-out-state'){
    const p=r.players[me];if(!cashSitOut(r)||!table||!r.hand?.sittingOut?.[me]||!hasHandBalance(r,me))fail(409,'Choose a status while sitting out');
    if(p.account&&account!==p.account)fail(401,'Sign in locally to change sit-out status');
    if(Object.keys(body).some(k=>!['state','version'].includes(k))||![0,1,2,4,8].includes(body.state)||body.version!==undefined&&(!Number.isSafeInteger(body.version)||body.version<0))fail(400,'Choose a supported sit-out status');
    if((p.sitOutState||0)!==body.state){if(body.state)p.sitOutState=body.state;else delete p.sitOutState;r.version++}return view(r,me,avatarFor);
  }
  if(op==='sit-out'){
    if(!cashSitOut(r)||!table)fail(409,'Sit out requires an ordinary hosted cash table');
    const p=r.players[me];if(p.account&&account!==p.account)fail(401,'Sign in locally to change sit out');
    if(Object.keys(body).some(k=>!['paused','version'].includes(k))||typeof body.paused!=='boolean'||body.version!==undefined&&(!Number.isSafeInteger(body.version)||body.version<0))fail(400,'Choose a sit-out state');
    setCashPause(r,me,body.paused);
    if(cashReady(r))cashHand(r,now,avatarFor);else if(!r.hand&&!r.players.includes(null))cashHand(r,now,avatarFor);
    return view(r,me,avatarFor);
  }
  if(op==='helmet'){
    const player=r.players[me];if(player.account&&account!==player.account)fail(401,'Sign in locally to change helmet');
    if(Object.keys(body).some(k=>!['muted','version'].includes(k))||typeof body.muted!=='boolean'||body.version!==undefined&&(!Number.isSafeInteger(body.version)||body.version<0))fail(400,'Choose a helmet state');
    if(!!player.helmet!==body.muted){player.helmet=body.muted;r.version++}
    return view(r,me,avatarFor);
  }
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
  if(op==='chat')recordChat(r,me,r.players[me],body,now);

  const host=r.host??r.players.findIndex(p=>p&&!p.bot),canFill=!!(table?.open&&!r.hand&&!r.tournament?.cancelledAt&&me===host&&r.players.includes(null));
  const canStart=!!(canFill&&!r.tournament&&r.players.filter(p=>p&&!p.sitOutNextHand).length>=2);
  if(op==='start'){if(!canStart||body.version!==r.version)fail(409,'Only the host can start with at least two seated players');if(!cashHand(r,now,avatarFor))fail(409,'At least two active funded players required');r.version++}
  if(op==='fill-bots'){
    if(r.waiting?.length||r.reservations?.length)fail(409,'Waiting players have priority over computers');
    if(!canFill||body.version!==r.version)fail(409,'Only the first seated player can fill empty seats before a hand');
    r.players=r.players.map((p,i)=>p||{bot:true,name:'Computer '+(i+1),noteId:randomBytes(16).toString('hex')});
    if(r.tournament){r.tournament.pool=capacity*r.tournament.entry;if(!r.tournament.startsAt){r.tournament.startedAt=now;tournamentHand(r,now,avatarFor)}else{r.version++;scheduledStart(r,now,avatarFor)}}
    else{cashHand(r,now,avatarFor);r.version++}
  }
  if(op==='end-practice'){
    if(!r.hand?.end||me!==host||!r.players.every((p,i)=>i===me||p?.bot)||body.version!==r.version)fail(409,'Finish the solo hand first');
    if(wallet&&r.players[me].walletFunded)wallet.move(r.players[me].account,r.hand.stacks[me]+(r.players[me].walletTopUp||0)+(r.players[me].addChips?.amount||0),'cash-out',id);rooms.delete(id);return {left:true}
  }
  if(r.tournament?.nextDealAt!=null&&now>=r.tournament.nextDealAt)tournamentHand(r,now,avatarFor);
  if(r.hand&&!r.hand.end&&now>=r.deadline)expireClock(r,now);
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
  if(op==='time-card-option'){if(!r.settings?.timeChipCount)fail(409,'Free time cards are unavailable');if(Object.keys(body).some(k=>!['option','version'].includes(k))||!Number.isInteger(body.option)||body.option<0||body.option>3)fail(400,'Choose a time-card option from 0 through 3');if((r.players[me].timeCardOption??3)!==body.option){r.players[me].timeCardOption=body.option;r.version++}}
  if(op==='time-bank'){
    if(body.isPaidAction!==undefined&&body.isPaidAction!==false||body.isTimeChipToggle!==undefined&&body.isTimeChipToggle!==false)fail(400,'Paid time chips are unavailable');
    if(reserveClock(r,me,body.actionId,now,body.cardSequence)){r.hand.historyEvents??=[];r.hand.historyEvents.push(r.actionClock.phase==='cards'?timeCardEvent(r):{type:'clock-limit-disabled',seat:me,street:r.hand.board.length,afterAction:r.hand.history.length});r.version++}
  }
  if(['act','ready','leave'].includes(op)){
    const metadataStale=op==='act'&&(r.version===enteredVersion||typeof enteredClockId==='string'&&r.actionClock?.phase==='cards'&&r.actionClock.id===enteredClockId)&&Number.isSafeInteger(body.version)&&body.version>=(r.actionVersion??r.version)&&body.version<=r.version;
    if(body.version!==r.version&&!metadataStale&&!(op==='ready'&&body.number===r.number&&r.hand?.end))fail(409,'Table changed; refresh and try again');
    if(op==='act'){
      if(!r.hand||r.hand.end||r.hand.turn!==me)fail(409,'Not your turn');
      if(body.reserved!==undefined&&typeof body.reserved!=='boolean')fail(400,'Invalid reserved action flag');
      const board=r.hand.board.length;
      step(r,body.action,body.target);
      if(body.reserved===true&&body.action==='check'){r.hand.reservedChecks??=Array(r.players.length).fill(null);r.hand.reservedChecks[me]=board}else if(r.hand.reservedChecks)r.hand.reservedChecks[me]=null;
    }else if(op==='ready'){
      if(r.tournament)fail(409,'No rebuys or ready actions in tournaments');
      if(r.players[me].sitOutNextHand)fail(409,'Resume before preparing the next hand');
      if(body.number!==undefined&&body.number!==r.number)fail(409,'Hand changed; refresh and try again');
      if(!r.hand?.end)fail(409,'Hand is not finished');
      if(body.topUpTo!==undefined&&(!Number.isSafeInteger(body.topUpTo)||body.topUpTo<(table?.minBuyIn??table?.stack??1)||body.topUpTo>(table?.maxBuyIn??table?.stack??1000000)))fail(400,'Top-up is outside table limits');
      if(hasHandBalance(r,me)&&r.hand.stacks[me]===0&&!r.players[me].addChips&&body.topUpTo===undefined)fail(409,'Choose a buy-in to rebuy before the next hand');
      if(!r.ready[me]){if(body.topUpTo!==undefined){const p=r.players[me];if(wallet&&p.walletFunded){if(account!==p.account)fail(401,'Sign in locally to fund a rebuy');const before=cashBalance(r,me)+(p.addChips?.amount||0),added=Math.max(0,body.topUpTo-before);wallet.move(p.account,-added,'rebuy',id);if(added)p.walletTopUp=added;else delete p.walletTopUp}p.topUpTo=body.topUpTo}r.ready[me]=true;r.version++}
      if(cashReady(r)){
        cashHand(r,now,avatarFor);
      }
    }else{
      return leaveSeat(r,me,wallet,id,now,host);
    }
  }
  if(op==='state'&&r.hand&&!r.hand.end&&r.players[r.hand.turn]?.bot&&now>=(r.actionClock?.startedAt??r.deadline-turnMs(r))+500){const g=r.hand;step(r,...computerMove(g.hands[g.turn],g.board,g.blind,g.price,options(g),g.variant))}
  return {...view(r,me,avatarFor),issued,canStart:canStart&&!r.hand,canFill:canFill&&!r.hand,soloBots:r.players.some(p=>p?.bot)&&r.players.every((p,i)=>i===me||p?.bot)};
}
function view(r,me,avatarFor,account){
  const g=r.hand,clock=clockView(r,me,Date.now());
  if(clock){delete clock.bankRemainingMs;clock.bankEndsAt=r.actionClock.bankEnd}
  return {me,...(me!=null&&r.settings?.timeChipCount?{timeCardCount:r.players[me]?.freeTimeChipCount??r.settings.timeChipCount,timeCardOption:r.players[me]?.timeCardOption??3,timeCardOptionsSupported:true}:{}),...(cashSitOut(r)?{sitOutSupported:true,sitOutStateSupported:true,globalCashLeave:true,...(me!=null?{leaveNextHand:!!r.players[me]?.leaveNextHand}:{}),sitOutStates:r.players.map((p,i)=>p&&r.hand?.sittingOut?.[i]&&hasHandBalance(r,i)?p.sitOutState||0:0),globalCashReturn:true,globalCashPause:true,returnMinimum:returnMinimum(r),...(me!=null?{returnFundingRequired:returnNeedsChips(r,me)}:{}),...(me!=null?{sitOutNextHand:!!r.players[me]?.sitOutNextHand}:{}),sittingOut:r.players.map((p,i)=>!!p&&(g?!!g.sittingOut?.[i]&&hasHandBalance(r,i):!!p.sitOutNextHand)),seatBalances:r.players.map((p,i)=>p?cashBalance(r,i):null)}:{}),...(me!=null&&r.tournament?{tournamentEntryPaid:!!r.players[me]?.entryFunded}:{}),...(me==null&&account?{canObserveChat:!r.players.some(p=>p?.account===account),observerName:account,...(chatMuted(r,{account})?{chatMuted:true}:{})}:{}),helmets:r.players.map(p=>!!p?.helmet),...(me!=null&&r.players[me]?.sessionStats?{sessionStats:{...r.players[me].sessionStats}}:{}),...(me!=null&&Number.isSafeInteger(r.players[me]?.sessionStartedAt)?{sessionStartedAt:r.players[me].sessionStartedAt}:{}),...(me!=null&&r.players[me]?.addChips?{pendingAdd:{...r.players[me].addChips}}:{}),reservedSeats:reservedSeats(r),...(me!=null?{noteSubjects:r.players.map((p,i)=>p&&i!==me?noteSubject(p):null)}:{}),...(me!=null&&r.topUps?{topUps:r.topUps.filter(t=>t.subject===(r.players[me]?.account||r.players[me]?.digest)).map(({subject,...t})=>t)}:{}),...(r.players.some(p=>p?.buyIn!==undefined)?{buyIns:r.players.map(p=>p?p.buyIn??r.settings.stack:0)}:{}),...(me!=null&&chatMuted(r,r.players[me])?{chatMuted:true}:{}),...(g&&me!=null&&!g.hands[me].length?{waitingForHand:true}:{}),...(r.waitingStacks?{waitingStacks:r.waitingStacks}:{}),...(r.shuffles?{shuffles:r.shuffles.filter(e=>e.subject===r.players[e.seat]?.digest&&Date.now()-e.at<2450).map(({seat,at})=>({seat,at}))}:{}),avatars:r.players.map(p=>p?.account?avatarFor(p.account):null),chat:(r.chat||[]).map(({sender,...message})=>message),settings:r.settings,tournament:r.tournament,version:r.version,number:r.number,names:r.players.map(p=>p?.name??null),ready:r.ready,results:r.results,
    hand:g&&{...(rabbitEligible(r,me)?{canRabbit:!g.rabbitShown?.[me],...(g.rabbitShown?.[me]?{rabbitCards:rabbitCards(g)}:{})}:{}),dealtSeats:g.hands.flatMap((cards,i)=>cards.length?[i]:[]),...(g.end&&g.shownIndices?{shownIndices:g.shownIndices.map(indices=>indices?[...indices]:null)}:{}),...(me!=null&&g.end&&g.hands[me].length&&!g.shownIndices?.[me]&&(g.folded[me]||g.folded.filter(f=>!f).length<2)?{canShowCards:true}:{}),...(r.settings?.timeBankSeconds?{timeBanks:r.players.map(p=>p?p.timeBankMs??r.settings.timeBankSeconds*1000:null)}:{}),...(clock?{clock}:{}),...(r.settings?.cardSqueeze?{squeezeActivated:true}:{}),blind:g.blind,...(g.ante?{ante:g.ante}:{}),button:g.button,turn:g.turn,deadline:g.end?null:r.deadline,stacks:g.stacks,bets:g.bets,committed:g.committed,folded:g.folded,board:g.board,pots:collectedPots(g),
      ...(me!=null&&!g.end&&!g.folded[me]&&g.stacks[me]>0&&g.hands[me].length?{preAction:{...(g.variant==='aof'?{aof:true}:{}),due:Math.max(0,g.price-g.bets[me]),call:Math.min(g.stacks[me],Math.max(0,g.price-g.bets[me])),acted:g.actedAt[me]!==null,reservedCheck:g.reservedChecks?.[me]===g.board.length,foldEnabled:g.stacks.some((stack,i)=>i!==me&&!g.folded[i]&&g.bets[i]+stack>g.bets[me])}}:{}),cards:visibleCards(g,me),history:g.history,end:g.end,options:g.turn===me?options(g):null}};
}

const digest=token=>createHash('sha256').update(token).digest('hex');
export const noteSubject=p=>digest(p.account?'account:'+p.account.toLowerCase():p.bot?'bot:'+p.noteId:'seat:'+p.digest);
export function openRooms(file,avatarFor=()=>0,walletsEnabled=false){
  let rooms=new Map(),wallet=cashWallet(),rushStates={};
  function validateRush(variant,saved){
    if(!['holdem','plo'].includes(variant)||!saved||!Array.isArray(saved.entries)||saved.entries.length>100||new Set(saved.entries.map(p=>p?.id)).size!==saved.entries.length||saved.entries.some(p=>!p||typeof p.id!=='string'||!p.id||!Number.isSafeInteger(p.stack)||p.stack<16||p.walletFunded!==undefined&&(p.walletFunded!==true||p.bot||p.left||!Object.hasOwn(wallet.state.accounts,p.id.toLowerCase())))||!Number.isSafeInteger(saved.version)||saved.version<0||saved.pool!==null&&typeof saved.pool!=='string')throw Error('Invalid Rush wallet checkpoint');
    if(saved.pool!==null){const pool=rushPool(saved.entries,4,saved.pool,variant);if(saved.entries.some(p=>p.left&&(pool.players.get(p.id).balance!==0||pool.players.get(p.id).table!==null||[...pool.tables.values()].some(t=>!t.settled&&t.ids.includes(p.id)))))throw Error('Invalid departed Rush balance');}
  }
  function unpack(data){
    if(!Array.isArray(data)||['local-cash-wallets','local-rush-pools'].some(key=>data.filter(entry=>entry?.[0]===key).length>1))throw Error('Invalid cash wallet checkpoint');
    rooms=new Map(data);wallet=cashWallet(rooms.get('local-cash-wallets'));rooms.delete('local-cash-wallets');rushStates=rooms.get('local-rush-pools')??{};rooms.delete('local-rush-pools');
    if(!rushStates||typeof rushStates!=='object'||Array.isArray(rushStates))throw Error('Invalid Rush wallet checkpoint');
    if(Object.keys(rushStates).length&&!walletsEnabled)throw Error('Rush wallet mode is required for funded pools');
    for(const [variant,saved]of Object.entries(rushStates))validateRush(variant,saved);
  }
  const packed=()=>[...rooms,...(Object.keys(wallet.state.accounts).length?[['local-cash-wallets',wallet.state]]:[]),...(Object.keys(rushStates).length?[['local-rush-pools',rushStates]]:[])];
  try{unpack(JSON.parse(readFileSync(file,'utf8')))}catch(e){if(e.code!=='ENOENT')throw e}
  for(const r of rooms.values())if(r.reservations!==undefined&&(!Array.isArray(r.reservations)||r.reservations.length>r.players.length||new Set(r.reservations.map(p=>p?.seat)).size!==r.reservations.length||new Set(r.reservations.map(p=>p?.account)).size!==r.reservations.length||r.reservations.some(p=>!p||!Number.isInteger(p.seat)||p.seat<0||p.seat>=r.players.length||r.players[p.seat]||typeof p.account!=='string'||!p.account.trim()||p.account.length>24||!Number.isSafeInteger(p.expiresAt)||p.expiresAt<0||p.expiresAt>8640000000000000)))throw Error('Invalid cash reservations');
  for(const r of rooms.values())for(const [i,p]of r.players.entries())if(p&&(p.walletFunded!==undefined&&(p.walletFunded!==true||!r.settings||r.tournament||p.bot||typeof p.account!=='string'||!Object.hasOwn(wallet.state.accounts,p.account.toLowerCase()))||p.walletTopUp!==undefined&&(!p.walletFunded||!Number.isSafeInteger(p.walletTopUp)||p.walletTopUp<=0||!Number.isSafeInteger(p.topUpTo)||p.walletTopUp>p.topUpTo||!r.ready[i])))throw Error('Invalid funded cash seat');
  for(const r of rooms.values())for(const p of r.players)if(p&&p.addChips!==undefined&&(!p.addChips||typeof p.addChips!=='object'||Array.isArray(p.addChips)||!r.settings||r.tournament||p.bot||!Number.isSafeInteger(p.addChips.amount)||p.addChips.amount<=0||p.addChips.amount>1000000||!Number.isSafeInteger(p.addChips.number)||p.addChips.number!==r.number||Object.keys(p.addChips).some(k=>!['amount','number'].includes(k))))throw Error('Invalid pending cash chips');
  for(const r of rooms.values())for(const p of r.players)if(p?.sessionStartedAt!==undefined&&(!Number.isSafeInteger(p.sessionStartedAt)||p.sessionStartedAt<0||p.sessionStartedAt>8640000000000000))throw Error('Invalid player session start');
  for(const r of rooms.values())for(const p of r.players)if(p?.sessionStats!==undefined){const v=p.sessionStats;if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==4||!['hands','showdowns','showdownWins','nonShowdownWins'].every(k=>Number.isSafeInteger(v[k])&&v[k]>=0)||!Number.isSafeInteger(p.sessionStartedAt)||v.showdownWins>v.showdowns||v.showdowns>v.hands||v.showdowns+v.nonShowdownWins>v.hands)throw Error('Invalid player session statistics')}
  for(const r of rooms.values()){
   if(r.cashLeaveAt!==undefined&&(!cashSitOut(r)||!Number.isSafeInteger(r.cashLeaveAt)||r.cashLeaveAt<0))throw Error('Invalid cash departure time');
   if(r.cashDepartures!==undefined&&(!cashSitOut(r)||!Array.isArray(r.cashDepartures)||r.cashDepartures.length>100||r.cashDepartures.some(p=>!p||typeof p.digest!=='string'||!/^[a-f0-9]{64}$/.test(p.digest)||typeof p.account!=='string'||!p.account||p.account.length>24||!Number.isSafeInteger(p.cashOut)||p.cashOut<0||!Number.isSafeInteger(p.at)||p.at<0)))throw Error('Invalid cash departure receipt');
   for(const p of r.players)if(p?.leaveNextHand!==undefined&&(!cashSitOut(r)||p.bot||typeof p.account!=='string'||p.leaveNextHand!==true))throw Error('Invalid scheduled cash departure');
  }
  for(const r of rooms.values())for(const p of r.players)if(p?.helmet!==undefined&&typeof p.helmet!=='boolean')throw Error('Invalid player helmet state');
  for(const r of rooms.values())for(const p of r.players)if(p?.sitOutState!==undefined&&(!cashSitOut(r)||p.bot||![0,1,2,4,8].includes(p.sitOutState)))throw Error('Invalid cash sit-out status');
  for(const r of rooms.values())for(const p of r.players)if(p?.sitOutNextHand!==undefined&&(!cashSitOut(r)||p.bot||typeof p.sitOutNextHand!=='boolean'))throw Error('Invalid cash sit-out state');
  for(const r of rooms.values()){
   const t=r.tournament;
   if(t&&(!Number.isSafeInteger(t.entry)||t.entry<0||t.entry>1000000||r.settings?.entryCost!==undefined&&t.entry!==r.settings.entryCost))throw Error('Invalid tournament entry cost');
   if(t&&(t.pauseRequested!==undefined&&t.pauseRequested!==true||t.pausedAt!==undefined&&(!Number.isSafeInteger(t.pausedAt)||t.pausedAt<0||!r.hand?.end||t.nextDealAt!==null||!Number.isSafeInteger(t.pauseDelayMs)||t.pauseDelayMs<0||t.pauseDelayMs>3000)||t.pauseDelayMs!==undefined&&t.pausedAt===undefined||(t.pauseRequested||t.pausedAt!==undefined)&&(t.startedAt===null||t.winner!==null||t.cancelledAt)||t.pauseRequested&&t.pausedAt!==undefined))throw Error('Invalid tournament pause');
   for(const p of r.players)if(p?.entryFunded!==undefined&&(p.entryFunded!==true||!r.settings||!t||p.bot||typeof p.account!=='string'||!Object.hasOwn(wallet.state.accounts,p.account.toLowerCase())))throw Error('Invalid funded tournament seat');
   if(r.players.some(p=>p?.entryFunded)){
    if(!Number.isSafeInteger(t.pool)||t.pool!==(t.cancelledAt?0:r.players.filter(Boolean).length*t.entry))throw Error('Invalid funded tournament pool');
    if(t.cancelledAt){if(!Array.isArray(t.refunds)||JSON.stringify(t.refunds)!==JSON.stringify(r.players.map(p=>p?t.entry:0)))throw Error('Invalid funded tournament refunds')}
    else if(t.winner!==null){const amounts=prizeAmounts(t.pool,t.prizeShares||[100]);if(!Number.isInteger(t.winner)||!r.players[t.winner]||!Array.isArray(t.finishes)||t.finishes.length!==r.players.length||t.finishes[t.winner]!==1||t.finishes.some((place,i)=>r.players[i]? !Number.isInteger(place)||place<1||place>r.players.length:place!==null)||!Array.isArray(t.prizes)||JSON.stringify(t.prizes)!==JSON.stringify(t.finishes.map(place=>amounts[place-1]||0))||t.prizes.reduce((sum,n)=>sum+n,0)!==t.pool)throw Error('Invalid funded tournament prizes')}
   }
   if(t?.walletSettled!==undefined&&(t.walletSettled!==true||!r.players.some(p=>p?.entryFunded)||!(t.cancelledAt||t.winner!==null&&Array.isArray(t.prizes))))throw Error('Invalid tournament wallet settlement');
  }
  for(const r of rooms.values())if(r.hand?.rabbitShown!==undefined&&(!cashSitOut(r)||!r.hand.end||![0,3,4].includes(r.hand.board.length)||!Array.isArray(r.hand.rabbitShown)||r.hand.rabbitShown.length!==r.players.length||r.hand.rabbitShown.some((v,i)=>typeof v!=='boolean'||v&&!r.hand.hands[i]?.length)))throw Error('Invalid Rabbit reveal state');
  const notes=openNotes(file+'.notes.json');
  for(const r of rooms.values())if(r.actionVersion!==undefined&&(!Number.isSafeInteger(r.version)||!Number.isSafeInteger(r.actionVersion)||r.actionVersion<0||r.actionVersion>r.version))throw Error('Invalid action version');
  let migrated=false;for(const r of rooms.values())for(const p of r.players)if(p?.bot&&!p.noteId){p.noteId=randomBytes(16).toString('hex');migrated=true}
  if(migrated){writeFileSync(file+'.tmp',JSON.stringify(packed()),{mode:0o600});renameSync(file+'.tmp',file)}
  const request=(id,op,token,body,table,account)=>{
    const old=rooms.get(id),version=old?.version,oldClock=old?.actionClock,clockId=oldClock?.id,cardUses=oldClock?.cardsUsed,walletBefore=JSON.stringify(wallet.state),snapshot=walletsEnabled&&(['join','ready','leave','end-practice','add-chips','sit-out','remove-seat'].includes(op)||old?.tournament&&!old.tournament.walletSettled&&old.players.some(p=>p?.entryFunded))?JSON.stringify(packed()):null;let failed=false;
    if(!walletsEnabled&&Object.keys(wallet.state.accounts).length&&['join','ready','leave','end-practice','add-chips','sit-out','remove-seat'].includes(op))fail(503,'Cash wallet mode is required for funded rooms');
    if(!walletsEnabled&&old?.tournament&&!old.tournament.walletSettled&&old.players.some(p=>p?.entryFunded))fail(503,'Wallet mode is required for funded tournaments');
    try{const result=handle(rooms,id,op,token,body,table,account,avatarFor,notes,walletsEnabled?wallet:null);if(settleTournamentWallet(rooms.get(id),walletsEnabled?wallet:null,id)&&result?.version!==undefined)result.version=rooms.get(id).version;return result}catch(error){if(snapshot){unpack(JSON.parse(snapshot));failed=true}throw error}finally{
    if(!failed){
    advanceWaiting(rooms.get(id),table,Date.now());
    if(rooms.get(id)?.version!==version||JSON.stringify(wallet.state)!==walletBefore){
      // Clock-only card updates preserve queued bets while the same action remains active.
      const changed=rooms.get(id),cardMetadata=typeof clockId==='string'&&oldClock?.phase==='cards'&&changed?.actionClock?.id===clockId&&(op==='time-card-option'||changed.actionClock.cardsUsed>cardUses);if(changed&&changed.version!==version){if(op==='chat'&&changed.version===(version??0)+1||cardMetadata)changed.actionVersion??=version??0;else changed.actionVersion=changed.version}
      try{
        writeFileSync(file+'.tmp',JSON.stringify(packed()),{mode:0o600});
        renameSync(file+'.tmp',file);
      }catch(e){
        // Discard the unacknowledged update; reload the last committed snapshot.
        try{unpack(JSON.parse(readFileSync(file,'utf8')))}catch(err){if(err.code!=='ENOENT')throw err;rooms=new Map();wallet=cashWallet();rushStates={}}
        throw e;
      }
    }
    }
    }
  };
  request.nextGrantSequence=()=>wallet.nextSequence();
  request.lastGrant=()=>wallet.lastGrant();
  request.grant=(name,command)=>{if(!walletsEnabled)fail(503,'Local cash wallets are disabled');const before=JSON.stringify(packed());try{const receipt=wallet.grant(name,command),after=JSON.stringify(packed());if(after!==before){writeFileSync(file+'.tmp',after,{mode:0o600});renameSync(file+'.tmp',file)}return receipt}catch(error){unpack(JSON.parse(before));throw error}};
  const accountCashPause=(account,paused)=>{
    if(!walletsEnabled&&Object.keys(wallet.state.accounts).length)fail(503,'Cash wallet mode is required for funded rooms');
    if(typeof account!=='string'||!account.trim())fail(401,'Sign in locally');
    const before=JSON.stringify(packed());let changed=0;const fundingRequired=[];
    try{for(const [id,r]of rooms)if(cashSitOut(r))for(const [i,p]of r.players.entries())if(p&&!p.bot&&p.account===account){if(!paused&&returnNeedsChips(r,i)){fundingRequired.push({room:id,minimum:returnMinimum(r),balance:cashBalance(r,i)});continue}if(setCashPause(r,i,paused)){r.actionVersion=r.version;r.touched=Date.now();changed++}}
      if(changed){writeFileSync(file+'.tmp',JSON.stringify(packed()),{mode:0o600});renameSync(file+'.tmp',file)}return {changed,...(fundingRequired.length?{fundingRequired}:{})};
    }catch(error){unpack(JSON.parse(before));throw error}
  };
  request.leaveCash=(account,leaving)=>{
   if(typeof account!=='string'||!account.trim())fail(401,'Sign in locally');if(typeof leaving!=='boolean')fail(400,'Choose a leave state');
   if(!walletsEnabled&&Object.keys(wallet.state.accounts).length)fail(503,'Cash wallet mode is required for funded rooms');
   const before=JSON.stringify(packed());let changed=0,left=0;
   try{for(const [id,r]of rooms)if(cashSitOut(r)){
    for(const p of r.players)if(p&&!p.bot&&p.account===account&&!!p.leaveNextHand!==leaving){if(leaving)p.leaveNextHand=true;else delete p.leaveNextHand;r.version++;r.actionVersion=r.version;changed++}
    if(leaving&&r.hand?.end&&r.players.some(p=>p?.leaveNextHand))r.cashLeaveAt??=(Number.isSafeInteger(r.hand.settledAt)&&r.hand.settledAt>=0?r.hand.settledAt:Date.now())+3000;
    left+=flushCashLeaves(r,walletsEnabled?wallet:null,id,Date.now(),account);
   }
   if(JSON.stringify(packed())!==before){writeFileSync(file+'.tmp',JSON.stringify(packed()),{mode:0o600});renameSync(file+'.tmp',file)}return {changed,left};
   }catch(error){unpack(JSON.parse(before));throw error}
  };
  request.resumeCash=account=>accountCashPause(account,false);
  request.pauseCash=account=>accountCashPause(account,true);
  request.rushStore=walletsEnabled?{
    summary(name){return wallet.summary(name)},
    read(variant){if(!['holdem','plo'].includes(variant))fail(400,'Invalid Rush format');return rushStates[variant]?structuredClone(rushStates[variant]):null},
    write(variant,saved,transfers=[]){
      if(!['holdem','plo'].includes(variant)||!saved||!Number.isSafeInteger(saved.version)||saved.version<1||rushStates[variant]&&saved.version!==rushStates[variant].version+1||!Array.isArray(transfers)||transfers.length>1)fail(409,'Refresh Rush wallet state');
      const before=JSON.stringify(packed());
      try{
        for(const move of transfers){if(!move||Object.keys(move).some(k=>!['account','delta'].includes(k))||!Number.isSafeInteger(move.delta))fail(400,'Invalid Rush chip transfer');wallet.move(move.account,move.delta,move.delta<0?'rush-buy-in':'rush-cash-out',createHash('sha256').update('river-rush:'+variant).digest('hex').slice(0,48))}
        validateRush(variant,saved);rushStates[variant]=structuredClone(saved);writeFileSync(file+'.tmp',JSON.stringify(packed()),{mode:0o600});renameSync(file+'.tmp',file);
      }catch(error){unpack(JSON.parse(before));throw error}
    }
  }:null;
  request.wallet=name=>wallet.summary(name);
  request.notes=notes;
  request.hasActivePlay=()=>[...rooms.values()].some(r=>r.hand&&!r.hand.end||r.tournament?.startedAt!=null&&r.tournament.winner==null&&!r.tournament.cancelledAt)||Object.values(rushStates).some(saved=>saved.pool&&JSON.parse(saved.pool).tables.some(([,t])=>!t.settled));
  return request;
}
