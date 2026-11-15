import {pushSeatPlan,pushSeatInterval} from './engine/push-seat.mjs';
const fail=(status,message)=>{throw Object.assign(Error(message),{status})},fields=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===keys.length&&Object.keys(x).every(k=>keys.includes(k)),seat=n=>Number.isInteger(n)&&n>=0&&n<6,identity=p=>p.account?'account:'+p.account.toLowerCase():p.bot?'bot:'+p.noteId:'seat:'+p.digest;
export function reservedPushSeats(r){return (r?.players||[]).flatMap((p,i)=>p?.pushSeat?.reservation?pushSeatInterval(i,p.pushSeat.reservation.target):[])}
export function pushSeatState(p,number){const x=p?.pushSeat;if(!x)return null;return {remainingHands:x.reservation||x.last?.status==='applied'?0:Math.max(0,x.until-number),...(x.reservation?{reservation:{...x.reservation}}:{}),...(x.last?{last:{...x.last}}:{})}}
export function grantPushSeat(r,p){if(!r.settings?.pushSeatHands||!p.walletFunded||!p.account||p.bot)return;const until=r.number+r.settings.pushSeatHands;if(!Number.isSafeInteger(until))fail(409,'Push Seat hand limit reached');p.pushSeat={until,sequence:0}}
export function validatePushSeatRoom(r,balances){
 const bad=()=>{throw Error('Invalid Push Seat checkpoint')},enabled=r.settings?.pushSeatHands;
 if(enabled===undefined){if(r.pushSeatAppliedHand!==undefined||r.pushSeatNotice!==undefined||r.players.some(p=>p?.pushSeat!==undefined||p?.pushSeatMove!==undefined))bad();return null}
 if(enabled!==undefined&&(!Number.isSafeInteger(enabled)||enabled<1||enabled>1000||r.tournament||r.players.length!==6||![undefined,'holdem','plo','plo5','plo6'].includes(r.settings.variant)))bad();
 if(r.pushSeatAppliedHand!==undefined&&(!Number.isSafeInteger(r.pushSeatAppliedHand)||r.pushSeatAppliedHand<0||r.pushSeatAppliedHand>r.number||r.pushSeatAppliedHand===r.number&&(r.hand||!Array.isArray(r.waitingStacks))))bad();
 if(r.pushSeatNotice!==undefined&&(!fields(r.pushSeatNotice,['number','at','by'])||r.pushSeatNotice.number!==r.pushSeatAppliedHand||!Number.isSafeInteger(r.pushSeatNotice.at)||r.pushSeatNotice.at<0||typeof r.pushSeatNotice.by!=='string'||!r.pushSeatNotice.by.trim()||r.pushSeatNotice.by.length>24))bad();
 if(r.pushSeatAppliedHand!==undefined&&!r.pushSeatNotice)bad();
 const reservations=[];for(const [i,p]of r.players.entries()){if(!p)continue;if(p.pushSeatMove!==undefined){const m=p.pushSeatMove;if(!fields(m,['number','from','to','at','requested','by'])||!Number.isSafeInteger(m.number)||m.number<0||m.number>r.number||r.pushSeatAppliedHand===undefined||m.number>r.pushSeatAppliedHand||!seat(m.from)||m.to!==i||m.from===m.to||!Number.isSafeInteger(m.at)||m.at<0||typeof m.requested!=='boolean'||typeof m.by!=='string'||!m.by.trim()||m.by.length>24||m.number===r.pushSeatAppliedHand&&m.by!==r.pushSeatNotice?.by)bad()}const x=p.pushSeat;if(x===undefined){if(enabled&&p.walletFunded&&p.account&&!p.bot)bad();continue}
  if(!enabled||p.bot||!p.walletFunded||!p.account||!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).some(k=>!['until','sequence','reservation','last'].includes(k))||!Number.isSafeInteger(x.until)||x.until<1||x.until>r.number+enabled||!Number.isSafeInteger(x.sequence)||x.sequence<0)bad();
  if(x.sequence===0){if(x.last!==undefined||x.reservation!==undefined)bad();continue}
  const last=x.last;if(!fields(last,['sequence','number','target','status'])||last.sequence!==x.sequence||!Number.isSafeInteger(last.number)||last.number<0||last.number>r.number||last.number>=x.until||!seat(last.target)||!['reserved','cancelled','applied'].includes(last.status))bad();
  if(last.status==='applied'&&!p.pushSeatMove)bad();
  if(x.reservation){if(!fields(x.reservation,['sequence','number','target'])||last.status!=='reserved'||x.reservation.sequence!==last.sequence||x.reservation.number!==last.number||x.reservation.target!==last.target||last.target===i)bad();reservations.push({player:identity(p),target:last.target})}else if(last.status==='reserved')bad();
 }
 if(reservations.length>1)bad();
 try{return pushSeatPlan({seats:r.players.map((p,i)=>p?{id:identity(p),stack:balances[i]}:null),playing:true,reservations,blocked:[...(r.reservations||[]).map(p=>p.seat),...(r.waiting||[]).flatMap(p=>p.offer?[p.offer.seat]:[])]},'local-idle-seat-rotation-v1')}catch{bad()}
}
export function reservePushSeat(r,me,op,body,account,balances){
 const p=r.players[me],x=p?.pushSeat;if(!r.settings?.pushSeatHands||!x||p.bot||!p.walletFunded||!p.account)fail(409,'Push Seat requires an enabled funded local seat');if(account!==p.account)fail(401,'Sign in locally to reserve your seat');
 if(!fields(body,op==='push-seat'?['version','number','sequence','target']:['version','number','sequence'])||!Number.isSafeInteger(body.version)||body.version<0||!Number.isSafeInteger(body.number)||body.number<0||!Number.isSafeInteger(body.sequence)||body.sequence<1||op==='push-seat'&&!seat(body.target))fail(400,'Provide the current hand/version and Push Seat sequence');
 if(op==='push-seat'&&x.last?.sequence===body.sequence&&x.last.number===body.number&&x.last.target===body.target)return;
 if(op==='push-seat-cancel'&&x.last?.sequence===body.sequence&&x.last.number===body.number&&x.last.status==='cancelled')return;
 if(body.version!==r.version||body.number!==r.number)fail(409,'Table changed; refresh Push Seat');
 if(op==='push-seat-cancel'){if(!x.reservation||x.reservation.sequence!==body.sequence)fail(409,'Push Seat reservation changed');x.last={...x.reservation,status:'cancelled'};delete x.reservation;r.version++;return}
 if(r.pushSeatAppliedHand===r.number||r.players.some(q=>q?.pushSeat?.reservation))fail(409,'Another player has already used Push Seat. You may use it next hand.');
 if(x.reservation||x.last?.status==='applied'||x.until<=r.number||body.sequence!==x.sequence+1||body.target===me||r.ready[me]||p.leaveNextHand)fail(409,'Push Seat is unavailable or changed');
 if(pushSeatInterval(me,body.target).some(i=>r.reservations?.some(q=>q.seat===i)||r.waiting?.some(q=>q.offer?.seat===i)))fail(409,'Push Seat path includes a reserved seat');
 x.sequence=body.sequence;x.reservation={sequence:body.sequence,number:body.number,target:body.target};x.last={...x.reservation,status:'reserved'};validatePushSeatRoom(r,balances);r.version++;
}

export function applyPushSeats(r,balances,now){
 if(!r.players.some(p=>p?.pushSeat?.reservation)||r.hand&&(!r.hand.end||now<(r.hand.settledAt??now)+3000))return false;
 validatePushSeatRoom(r,balances);
 const original=r.players,ready=r.ready,host=original[r.host],by=original.find(p=>p?.pushSeat?.reservation).name,positions=new Map(original.flatMap((p,i)=>p?[[identity(p),i]]:[])),plan=pushSeatPlan({seats:original.map((p,i)=>p?{id:identity(p),stack:balances[i]}:null),playing:false,reservations:original.flatMap(p=>p?.pushSeat?.reservation?[{player:identity(p),target:p.pushSeat.reservation.target}]:[]),blocked:[...(r.reservations||[]).map(p=>p.seat),...(r.waiting||[]).flatMap(p=>p.offer?[p.offer.seat]:[])]},'local-idle-seat-rotation-v1');
 if(r.hand)r.previousHand={button:r.hand.button,bigBlindSeat:r.hand.bigBlindSeat,variant:r.hand.variant};
 r.players=plan.seats.map(p=>p?original[positions.get(p.id)]:null);r.waitingStacks=plan.seats.map(p=>p?.stack??null);r.ready=plan.seats.map(p=>p?ready[positions.get(p.id)]:false);r.host=host?r.players.indexOf(host):r.players.findIndex(p=>p&&!p.bot);
 for(const move of plan.moves)r.players[move.to].pushSeatMove={number:r.number,from:move.from,to:move.to,at:now,requested:move.requested,by};
 for(const p of r.players)if(p?.pushSeat?.reservation){p.pushSeat.last={...p.pushSeat.reservation,status:'applied'};delete p.pushSeat.reservation}
 r.hand=null;r.deadline=null;delete r.actionClock;delete r.rimt;r.pushSeatAppliedHand=r.number;r.pushSeatNotice={number:r.number,at:now,by};r.version++;
 validatePushSeatRoom(r,r.waitingStacks.map(n=>n??0));return true;
}
