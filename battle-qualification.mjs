import {isDeepStrictEqual}from'node:util';
import {startHand,act,options}from'./engine/table.mjs';
import {settlePots}from'./engine/pots.mjs';
import {best,compare}from'./game.mjs';
// Local practice policy: equal stacks use registration order; six-seat all-in batches carry real stacks forward.
export function battleQualification(players,config,checkpoint=null){
 if(!Array.isArray(players)||players.length<1||players.length>100||new Set(players.map(p=>p?.id)).size!==players.length||players.some(p=>!p||typeof p.id!=='string'||!p.id||!Number.isSafeInteger(p.stack)||p.stack<0)||!Number.isSafeInteger(players.reduce((n,p)=>n+p.stack,0))||!players.some(p=>p.stack>0)||!config||Object.keys(config).sort().join(',')!=='blind,finalSeats'||!Number.isSafeInteger(config.blind)||config.blind<2||config.blind%2||!Number.isInteger(config.finalSeats)||config.finalSeats<2||config.finalSeats>6)throw Error('Invalid Battle qualification configuration');
 players=structuredClone(players);config=structuredClone(config);const total=players.reduce((n,p)=>n+p.stack,0),ranked=players.filter(p=>p.stack>0).sort((a,b)=>b.stack-a.stack),direct=ranked.length<=config.finalSeats?ranked:ranked.slice(0,config.finalSeats-1);
 let state={direct:structuredClone(direct),waiting:ranked.slice(direct.length),advanced:[],serial:0,round:1,last:null};
 if(checkpoint!==null){try{
  const saved=JSON.parse(checkpoint);if(saved?.version!==1||!isDeepStrictEqual(saved.players,players)||!isDeepStrictEqual(saved.config,config))throw Error();const s=saved.state;
  if(!s||!isDeepStrictEqual(s.direct,direct)||!Array.isArray(s.waiting)||!Array.isArray(s.advanced)||!Number.isSafeInteger(s.serial)||s.serial<0||!Number.isSafeInteger(s.round)||s.round<1)throw Error();
  const remaining=[...s.direct,...s.waiting,...s.advanced];if(new Set(remaining.map(p=>p?.id)).size!==remaining.length||remaining.some(p=>!players.some(x=>x.id===p?.id)||!Number.isSafeInteger(p.stack)||p.stack<=0)||remaining.reduce((n,p)=>n+p.stack,0)!==total)throw Error();
  if((s.serial===0)!==(s.last===null)||s.round>s.serial+1)throw Error();
  if(s.last!==null){const {ids,game:g}=s.last;if(!Array.isArray(ids)||ids.length<2||ids.length>6||new Set(ids).size!==ids.length||ids.some(id=>!players.some(p=>p.id===id)||direct.some(p=>p.id===id))||!g?.end||g.board?.length!==5||g.hands?.length!==ids.length||g.hands.some(h=>h.length!==2)||g.stacks?.length!==ids.length||g.initialStacks?.length!==ids.length||!Array.isArray(g.stacks)||!Array.isArray(g.initialStacks)||g.stacks.some(n=>!Number.isSafeInteger(n)||n<0)||g.initialStacks.some(n=>!Number.isSafeInteger(n)||n<=0)||!Number.isSafeInteger(g.stacks.reduce((a,b)=>a+b,0))||g.stacks.reduce((a,b)=>a+b,0)!==g.initialStacks.reduce((a,b)=>a+b,0))throw Error();const cards=[...g.board,...g.hands.flat()];if(new Set(cards).size!==cards.length||cards.some(c=>typeof c!=='string'||! /^[2-9TJQKA][cdhs]$/.test(c)))throw Error();const end=settlePots(g.committed,g.folded,g.button,(a,b)=>compare(best([...g.hands[a],...g.board]),best([...g.hands[b],...g.board])));if(!isDeepStrictEqual(end,g.end)||g.stacks.some((n,i)=>n!==g.initialStacks[i]-g.committed[i]+end.payouts[i]))throw Error()}
  state=structuredClone(s);
 }catch{throw Error('Invalid Battle qualification checkpoint')}}
 const complete=()=>state.waiting.length===0&&state.advanced.length<=1;
 function view(){const result={phase:complete()?'final-ready':'shootout',round:state.round,serial:state.serial,direct:state.direct,contenders:[...state.waiting,...state.advanced],...(complete()?{qualified:[...state.direct,...state.advanced]}:{})};if(state.last){const {ids,game:g}=state.last;result.lastHand={names:ids,hand:{board:g.board,cards:g.hands,initialStacks:g.initialStacks,committed:g.committed,folded:g.folded,button:g.button,stacks:g.stacks,end:g.end}}}return structuredClone(result)}
 function step(){
  if(complete())return view();let waiting=state.waiting,advanced=state.advanced,round=state.round;if(!waiting.length){waiting=advanced;advanced=[];round++}
  const group=waiting.slice(0,6);let survivors=group,last=state.last,serial=state.serial;
  if(group.length>1){const game=startHand(group.map(p=>p.stack),config.blind,serial%group.length);let actions=0;while(!game.end){if(++actions>12)throw Error('Battle all-in hand failed to finish');const o=options(game);act(game,o.raise?'raise':o.due?'call':'check',o.raise?o.max:undefined)}survivors=group.flatMap((p,i)=>game.stacks[i]>0?[{id:p.id,stack:game.stacks[i]}]:[]);const {deck,historyTrace,...settled}=game;last={ids:group.map(p=>p.id),game:settled};serial++}
  state={...state,waiting:waiting.slice(group.length),advanced:[...advanced,...survivors],last,serial,round};return view();
 }
 const snapshot=()=>JSON.stringify({version:1,players,config,state});return {view,step,snapshot};
}
