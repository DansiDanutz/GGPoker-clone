// Reuse the existing six-seat Rush renderer; this adapter never changes event or wallet state.
export function battleTableState(data){
 const s=data.stage,active=s?.table!=null,record=active?s:s?.result,g=record?.hand;
 return {version:data.revision,battleSession:data.session,battlePhase:data.phase,battleCount:data.count,battleCapacity:data.settings.capacity,battleFinalSeats:data.settings.finalSeats,battleEntryCost:data.settings.entryCost,registered:data.registered,finalEligible:data.finalEligible===true,finalRoom:data.finalRoom??null,battlePayouts:data.payouts??null,battleBounty:data.bounty??null,battleQualifiedCount:data.qualification?.qualified?.length??0,battlePrizeShares:data.settings.prizeShares??null,table:active?s.table:null,balance:s?.stack??0,me:record?.me??null,number:record?.table??0,names:record?.names||Array(6).fill(null),avatars:[],hand:g?{...g,options:active?g.legal:null}:null,handVersion:g?record.table+':'+g.history.length:null,settings:{name:data.settings.name+' · Battle Royale · Rush',variant:'rush',stack:data.settings.stack,blind:data.settings.blind},chat:[],results:[],ready:Array(6).fill(false)};
}

// Shootout means more than finalSeats survived Rush; the native timeout notice uses finalSeats minus one.
export function battleStageNotice(state){
 if(!state?.registered||state.battlePhase!=='shootout'||state.hand&&!state.hand.end||!Number.isInteger(state.battleFinalSeats)||state.battleFinalSeats<2||state.battleFinalSeats>6)return null;
 return {key:'RushStageEndType22',title:'Rush Stage has ended',body:'Players that fail to make it to top '+(state.battleFinalSeats-1)+' will go for an All-in shootout to decide who goes to Final Table Stage.'};
}

// Transport interruptions clear continuity, while an ended session stays consumed.
export function battleStageAudio(){
 let prior=null,session=null,generation=0;const ended=new Set();
 const closed=new Set(['draining','qualification','shootout','final-ready','final-table','finished']);
 return {interrupt(){prior=null;generation++},lease(){const ticket=generation;return()=>ticket===generation},observe(state,catchUp=false){
  if(!state?.registered||typeof state.battleSession!=='string'||!state.battleSession){prior=null;generation++;return []}
  if(session!==state.battleSession){session=state.battleSession;prior=null;generation++}
  const finished=closed.has(state.battlePhase),play=finished&&!ended.has(session)&&!catchUp&&prior==='rush';
  if(finished)ended.add(session);prior=state.battlePhase;return play?['BnRRoundEnd']:[];
 }};
}
