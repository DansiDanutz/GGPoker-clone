const conflict=()=>{throw Object.assign(Error('Time bank is unavailable for this action'),{status:409})};
const remaining=(clock,now)=>Math.max(0,clock.bankEnd-Math.max(clock.startedAt,now));
export function startClock(room,now){
 const seconds=room.settings?.actionSeconds??90;
 room.deadline=now+seconds*1000;
 delete room.actionClock;
 if(room.settings?.timeChipCount&&room.hand&&!room.hand.end){for(const player of room.players)if(player&&player.freeTimeChipCount===undefined)player.freeTimeChipCount=room.settings.timeChipCount;const seat=room.hand.turn;room.actionClock={id:`${room.number}:${room.hand.history.length}:${seat}`,seat,startedAt:now,bankEnd:room.deadline,phase:'cards',cardsUsed:0};return}
 if(!room.settings?.timeBankSeconds||!room.hand||room.hand.end)return;
 for(const player of room.players)if(player&&player.timeBankMs===undefined)player.timeBankMs=room.settings.timeBankSeconds*1000;
 const seat=room.hand.turn,bank=room.players[seat].timeBankMs;
 const phase=bank>0?'bank':'hot',budget=bank>0?bank:Math.min(seconds,room.settings.hotTimeSeconds??5)*1000;
 room.actionClock={id:`${room.number}:${room.hand.history.length}:${seat}`,seat,startedAt:now,bankEnd:now+budget,phase,limitDisabled:false};
 room.deadline=Math.min(room.deadline,now+budget);
}
export function finishClock(room,now){
 const clock=room.actionClock;
 if(!clock)return;
 if(clock.phase==='bank'){
  const player=room.players[clock.seat];
  player.timeBankMs=Math.max(0,player.timeBankMs-Math.max(0,Math.min(now,room.deadline)-clock.startedAt));
 }
 delete room.actionClock;
}
export function clockView(room,viewer,now){
 const clock=room.actionClock;
 if(!clock||!room.hand||room.hand.end)return null;
 if(clock.phase==='cards')return {actionId:clock.id,seat:clock.seat,phase:'cards',cardsUsed:clock.cardsUsed,canUseTimeCard:viewer===clock.seat&&now<room.deadline&&(clock.cardsUsed>0||room.deadline-now<=5000)&&room.players[clock.seat].freeTimeChipCount>0&&clock.cardsUsed<room.settings.maxTimeChipsPerAction};
 const left=remaining(clock,now),limit=Math.max(0,room.deadline-now);
 return {actionId:clock.id,seat:clock.seat,phase:clock.phase,bankRemainingMs:left,limitDisabled:clock.limitDisabled,canDisableLimit:viewer===clock.seat&&clock.phase==='bank'&&!clock.limitDisabled&&limit>0&&limit<=10000&&clock.bankEnd>room.deadline};
}
export function reserveClock(room,seat,actionId,now,sequence){
 const clock=room.actionClock;
 if(!clock||!room.hand||room.hand.end||room.hand.turn!==seat||clock.seat!==seat||clock.id!==actionId||now>=room.deadline)conflict();
 if(clock.phase==='cards'){if(!Number.isSafeInteger(sequence)||sequence<0)conflict();if(sequence<clock.cardsUsed)return false;if(sequence!==clock.cardsUsed||!clockView(room,seat,now).canUseTimeCard)conflict();room.players[seat].freeTimeChipCount--;clock.cardsUsed++;room.deadline+=room.settings.freeTimeChipSecondsPerUnit*1000;clock.bankEnd=room.deadline;return true}
 if(clock.limitDisabled)return false;
 if(!clockView(room,seat,now).canDisableLimit)conflict();
 clock.limitDisabled=true;room.deadline=clock.bankEnd;return true;
}
