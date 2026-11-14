import {holdemEquity} from './engine/rimt-equity.mjs';
import {splitPots} from './engine/pots.mjs';
import {createRimt,readRimt,applyRimt} from './engine/rimt.mjs';
import {finishRunout} from './engine/table.mjs';
const fail=(status,message)=>{throw Object.assign(Error(message),{status})};
export function rimtParticipant(player){return !!player&&(player.bot===true?typeof player.noteId==='string'&&/^[a-f0-9]{32}$/.test(player.noteId):!player.bot&&typeof player.account==='string'&&player.account.length>0)}
const financialKeys=['hands','board','deck','end','stacks','folded','committed','initialStacks','bets','price','variant','blind','button','runoutBoards','runoutDecision','runoutHand','runoutPending'];
function selected(s,runs){let d=createRimt({hand:s.hand,proposer:s.proposer,decider:s.decider,suggestUntil:s.suggestUntil,decisionMs:s.decisionMs},s.createdAt);d=applyRimt(d,{hand:d.hand,action:'suggest',seat:d.proposer,runs},s.createdAt);return runs===1?d:applyRimt(d,{hand:d.hand,action:'decide',seat:d.decider,agreed:true},s.createdAt)}
export function validateRoomRimt(room){
 if(room.rimt===undefined){if(room.hand?.runoutPending)throw Error('Missing RIMT negotiation');return}
 try{
  const v=room.rimt,g=room.hand;if(room.tournament||!g||g.variant!=='holdem'||!v||Object.keys(v).sort().join(',')!=='allocations,base,decision'||!Array.isArray(v.allocations)||v.allocations.length!==3)throw Error();
  const d=readRimt(v.decision);if(d.hand!==room.number||v.base?.runoutHand!==room.number||v.base?.runoutPending!==true)throw Error();
  for(let count=1;count<=3;count++)finishRunout(structuredClone(v.base),selected(d,count),v.allocations[count-1]);
  const expected=structuredClone(v.base);if(d.runs!==null)finishRunout(expected,d,v.allocations[d.runs-1]);
  for(const key of financialKeys)if(JSON.stringify(g[key])!==JSON.stringify(expected[key]))throw Error();
  if(d.runs===null&&(room.actionClock!==undefined||room.deadline!==null||![d.proposer,d.decider].every(i=>rimtParticipant(room.players[i]))))throw Error();
 }catch{throw Error('Invalid room RIMT checkpoint')}
}
export function beginRoomRimt(room,input,now){
 if(room.rimt!==undefined||!room.hand?.runoutPending||!input||Object.keys(input).sort().join(',')!=='allocations,decider,decisionMs,proposer,suggestUntil')fail(409,'Choose a pending armed hand and explicit RIMT plan');
 const {allocations,...roles}=input,decision=createRimt({hand:room.number,...roles},now),rimt={decision,allocations:structuredClone(allocations),base:structuredClone(room.hand)},trial={...room,rimt,deadline:null};delete trial.actionClock;validateRoomRimt(trial);
 room.rimt=rimt;room.deadline=null;delete room.actionClock;room.version++;
}
export function applyRoomRimt(room,me,operation,body,now){
 if(!['rimt-suggest','rimt-decide','expire'].includes(operation))fail(400,'Invalid RIMT operation');if(!room.rimt)fail(409,'No RIMT negotiation');validateRoomRimt(room);
 const action=operation==='rimt-suggest'?'suggest':operation==='rimt-decide'?'decide':'expire',allowed=action==='suggest'?['number','runs','version']:action==='decide'?['number','agreed','version']:[];
 if(action!=='expire'&&(!body||Object.keys(body).some(k=>!allowed.includes(k))||body.version!==undefined&&(!Number.isSafeInteger(body.version)||body.version<0)))fail(400,'Invalid RIMT choice');
 const old=room.rimt.decision,command=action==='expire'?{hand:room.number,action}:{hand:body.number,action,seat:me,...(action==='suggest'?{runs:body.runs}:{agreed:body.agreed})},next=applyRimt(old,command,now);
 if(JSON.stringify(old)===JSON.stringify(next))return false;
 if(next.runs!==null)finishRunout(room.hand,next,room.rimt.allocations[next.runs-1]);room.rimt.decision=next;room.version++;return true;
}
export function roomRimtView(room,me){
 if(!room.rimt)return undefined;const d=readRimt(room.rimt.decision),pending=d.runs===null;
 return {hand:d.hand,sharedCount:room.rimt.base.board.length,proposer:d.proposer,decider:d.decider,proposal:d.proposal,runs:d.runs,reason:d.reason,startedAt:pending?(d.proposal===null?d.createdAt:d.proposedAt):null,phase:pending?(d.proposal===null?'suggest':'decide'):'complete',deadline:pending?(d.proposal===null?d.suggestUntil:d.proposedAt+d.decisionMs):null,canSuggest:pending&&d.proposal===null&&me===d.proposer,canDecide:pending&&d.proposal!==null&&me===d.decider};
}

// Local practice policy: exact visible-card equity, clockwise ties,15s choices and first-run odd chips.
export function prepareRoomRimt(room,now){
 if(!room.hand?.runoutPending)return;if(room.settings?.rimt!==true)fail(409,'RIMT practice policy is not enabled');
 const g=room.hand,seats=g.folded.flatMap((folded,seat)=>folded?[]:[seat]),equity=holdemEquity(g.hands[seats[0]],g.hands[seats[1]],g.board);
 const proposer=equity.wins[0]===equity.wins[1]?[...seats].sort((a,b)=>(a-g.button-1+g.hands.length)%g.hands.length-(b-g.button-1+g.hands.length)%g.hands.length)[0]:seats[equity.wins[0]<equity.wins[1]?0:1],decider=seats.find(seat=>seat!==proposer),pots=splitPots(g.committed,g.folded).pots;
 const allocations=[1,2,3].map(count=>pots.map(p=>Array.from({length:count},(_,run)=>Math.floor(p.amount/count)+(run===0?p.amount%count:0))));
 beginRoomRimt(room,{proposer,decider,suggestUntil:now+15000,decisionMs:15000,allocations},now);
}

// Local computer policy: suggest two runs and accept a proposal after500ms; expiry wins at the deadline.
export function advanceRoomRimtBots(room,now){
 if(!room.rimt||!room.hand?.runoutPending)return false;const d=readRimt(room.rimt.decision),deadline=d.proposal===null?d.suggestUntil:d.proposedAt+d.decisionMs;if(now>=deadline)return false;
 if(d.proposal===null&&room.players[d.proposer]?.bot===true&&now>=d.createdAt+500)return applyRoomRimt(room,d.proposer,'rimt-suggest',{number:d.hand,runs:2},now);
 if(d.proposal!==null&&room.players[d.decider]?.bot===true&&now>=d.proposedAt+500)return applyRoomRimt(room,d.decider,'rimt-decide',{number:d.hand,agreed:true},now);
 return false;
}
