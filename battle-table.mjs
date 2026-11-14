// Reuse the existing six-seat Rush renderer; this adapter never changes event or wallet state.
export function battleTableState(data){
 const s=data.stage,active=s?.table!=null,record=active?s:s?.result,g=record?.hand;
 return {version:data.revision,battleSession:data.session,battlePhase:data.phase,battleCount:data.count,battleCapacity:data.settings.capacity,registered:data.registered,table:active?s.table:null,balance:s?.stack??0,me:record?.me??null,number:record?.table??0,names:record?.names||Array(6).fill(null),avatars:[],hand:g?{...g,options:active?g.legal:null}:null,handVersion:g?record.table+':'+g.history.length:null,settings:{name:data.settings.name+' · Battle Royale · Rush',variant:'rush',stack:data.settings.stack,blind:data.settings.blind},chat:[],results:[],ready:Array(6).fill(false)};
}
