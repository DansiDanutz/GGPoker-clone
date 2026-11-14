import {randomBytes} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {rushPool} from './engine/rush-pool.mjs';
import {options,canQuickFold} from './engine/table.mjs';
import {visibleCards,collectedPots} from './room-view.mjs';

// Local practice boundary: six-seat Rush only; qualification policy is handled by the event coordinator.
export function battleRush(entries,config,checkpoint=null){
 if(!config||Object.keys(config).sort().join(',')!=='blind,eventId,finalSeats,rushEndsAt,startedAt'||!Number.isSafeInteger(config.blind)||config.blind<2||config.blind%2||typeof config.eventId!=='string'||!/^[a-z0-9-]{1,64}$/.test(config.eventId)||!Number.isSafeInteger(config.finalSeats)||config.finalSeats<2||config.finalSeats>6||!Number.isSafeInteger(config.startedAt)||config.startedAt<0||!Number.isSafeInteger(config.rushEndsAt)||config.rushEndsAt<=config.startedAt)throw Error('Invalid Battle Rush configuration');
 entries=structuredClone(entries);config=structuredClone(config);
 let pool=rushPool(entries,config.blind),sessions=new Map(entries.map(p=>[p.id,randomBytes(24).toString('hex')])),closed=false;
 if(checkpoint!==null){
  try{
   const saved=JSON.parse(checkpoint);
   if(typeof saved?.pool!=='string'||saved?.version!==1||!isDeepStrictEqual(saved.config,config)||!isDeepStrictEqual(saved.entries,entries)||typeof saved.closed!=='boolean'||!Array.isArray(saved.sessions)||saved.sessions.length!==entries.length)throw Error();
   const restored=new Map(saved.sessions);
   if(restored.size!==entries.length||new Set(restored.values()).size!==entries.length||entries.some(p=>!restored.has(p.id)||typeof restored.get(p.id)!=='string'||!/^[a-f0-9]{48}$/.test(restored.get(p.id))))throw Error();
   pool=rushPool(entries,config.blind,saved.pool);sessions=restored;closed=saved.closed;
  }catch{throw Error('Invalid Battle Rush checkpoint')}
 }
 const alive=()=>[...pool.players.values()].filter(p=>p.balance>0||p.table!==null).length;
 const phase=()=>closed?([...pool.tables.values()].some(t=>!t.settled)?'draining':'qualification'):'rush';
 function tick(now){
  if(!Number.isSafeInteger(now)||now<config.startedAt)throw Error('Invalid Battle Rush clock');
  if(now>=config.rushEndsAt||alive()<=config.finalSeats)closed=true;
  return phase();
 }
 function player(account,session,table){
  if(!sessions.has(account)||sessions.get(account)!==session)throw Error('Invalid Battle Rush session');
  const p=pool.players.get(account);if(arguments.length===3&&(p.table!==table||!Number.isSafeInteger(table)))throw Error('Stale Battle Rush table');return p;
 }
 function view(account,session){
  const p=player(account,session),table=pool.tables.get(p.table),seat=table?.ids.indexOf(account),g=table?.game,last=[...pool.tables].findLast(([,t])=>t.settled&&t.ids.includes(account));
  const hand=(game,viewer)=>({...Object.fromEntries(['variant','initialStacks','allIns','stacks','blind','button','board','folded','committed','bets','actedAt','price','increment','turn','end','history','bigBlindSeat'].map(key=>[key,game[key]])),cards:visibleCards(game,viewer),pots:collectedPots(game),quickFoldAllowed:canQuickFold(game,viewer),legal:game.turn===viewer&&!game.end?options(game):null});
  return structuredClone({eventId:config.eventId,phase:phase(),table:p.table,stack:p.balance,...(g?{me:seat,names:table.ids,hand:hand(g,seat)}:{}),...(last?{result:{table:last[0],names:last[1].ids,me:last[1].ids.indexOf(account),hand:hand(last[1].game,last[1].ids.indexOf(account))}}:{})});
 }
 function deal(account,session,now){player(account,session);tick(now);if(closed)throw Error('Battle Rush stage is closed');pool.deal(account);return view(account,session)}
 function move(account,session,table,action,target,now){player(account,session,table);tick(now);pool.move(account,action,target);tick(now);return view(account,session)}
 function fold(account,session,table,now){player(account,session,table);tick(now);pool.fold(account,null,!closed);tick(now);return view(account,session)}
 function qualification(){if(phase()!=='qualification')throw Error('Finish all Battle Rush hands before qualification');return [...pool.players].map(([id,p])=>({id,stack:p.balance}))}
 function snapshot(){return JSON.stringify({version:1,config,entries,closed,sessions:[...sessions],pool:pool.snapshot()})}
 return {view,deal,move,fold,tick,phase,alive,qualification,snapshot,total:pool.total,sessions:()=>Object.fromEntries(sessions)};
}
