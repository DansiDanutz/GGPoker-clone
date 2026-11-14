import {shuffleDeck} from './deck.mjs';
import {best,compare} from '../game.mjs';
import {bestShortDeck} from './hand.mjs';
import {settlePots,settleRunouts} from './pots.mjs';
import {readRimt} from './rimt.mjs';

export function nextDealer(stacks,previous){
  function next(after){for(let j=1;j<=stacks.length;j++){const i=(after+j)%stacks.length;if(stacks[i]>0)return i}}
  if(previous.variant==='shortdeck')return next(previous.button);
  return stacks.filter(Boolean).length===2?next(next(previous.bigBlindSeat)):next(previous.button);
}
export function omahaRank(hole,board){
  let high=null;
  for(let i=0;i<hole.length;i++)for(let j=i+1;j<hole.length;j++)
    for(let a=0;a<board.length-2;a++)for(let b=a+1;b<board.length-1;b++)for(let c=b+1;c<board.length;c++){
      const rank=best([hole[i],hole[j],board[a],board[b],board[c]]);
      if(!high||compare(rank,high)>0)high=rank;
    }
  return high;
}
export function startHand(stacks,blind=4,button=0,variant='holdem',ante=0,sittingOut=[],runoutHand=null){
  if(runoutHand!==null&&(!Number.isSafeInteger(runoutHand)||runoutHand<1))throw Error('Invalid runout hand identity');
  if(!['holdem','plo','plo5','plo6','shortdeck','aof','rush'].includes(variant))throw Error('Unknown game');
  if(!Number.isSafeInteger(ante)||ante<0||ante>0&&!['holdem','plo','plo5','plo6'].includes(variant))throw Error('Invalid ante');
  if(!Array.isArray(stacks)||stacks.length<2||stacks.length>9||![...stacks].every(n=>Number.isSafeInteger(n)&&n>=0)||stacks.filter(n=>n>0).length<2||!Number.isSafeInteger(stacks.reduce((a,b)=>a+b,0))) throw Error('Invalid stacks');
  if(!Array.isArray(sittingOut)||sittingOut.length&&sittingOut.length!==stacks.length||!sittingOut.every(v=>typeof v==='boolean'))throw Error('Invalid sitting-out seats');
  const liveStacks=stacks.map((s,i)=>sittingOut[i]?0:s);
  if(liveStacks.filter(Boolean).length<2)throw Error('At least two active players required');
  if(variant==='aof'&&stacks.length!==4)throw Error('All-In or Fold requires four seats');
  if(variant==='shortdeck'&&stacks.length>6)throw Error('Short Deck supports at most six seats');
  if(!Number.isSafeInteger(blind)||blind<2||blind%2||!Number.isInteger(button)||button<0||button>=stacks.length||!liveStacks[button]) throw Error('Invalid blinds or button');
  const count=({holdem:2,plo:4,plo5:5,plo6:6,shortdeck:2,aof:2,rush:2})[variant];
  if(liveStacks.filter(Boolean).length*count+8>52)throw Error('Too many players for one deck');
  const deck=shuffleDeck(variant==='shortdeck'?'shortdeck':'holdem'), n=stacks.length;
  const g={variant,...(runoutHand===null?{}:{runoutHand}),...(sittingOut.some(Boolean)?{sittingOut:[...sittingOut]}:{}),initialStacks:[...stacks],allIns:stacks.map(()=>false),vpip:stacks.map(()=>false),stacks:[...stacks],blind,button,deck,hands:stacks.map(()=>[]),board:[],folded:liveStacks.map(s=>s===0),committed:stacks.map(()=>0),bets:stacks.map(()=>0),actedAt:stacks.map(()=>null),price:blind,increment:blind,turn:null,end:null,history:[]};
  const live=stacks.map((_,j)=>(button+j+1)%n).filter(i=>liveStacks[i]>0);
  for(let round=0;round<count;round++)for(const i of live)g.hands[i].push(deck.pop());
  if(ante){g.ante=ante;for(const i of live)pay(g,i,ante);g.bets.fill(0)}
  const sb=live.length===2?button:live[0],bb=live.length===2?live[0]:live[1];
  if(variant==='shortdeck'){
    for(const i of live)pay(g,i,blind);
    g.bets.fill(0);pay(g,button,blind);g.bigBlindSeat=button;
  }else{g.bigBlindSeat=bb;pay(g,sb,blind/2);pay(g,bb,blind)}
  g.historyTrace={opening:{bets:[...g.bets],committed:[...g.committed],stacks:[...g.stacks]},actions:[]};
  advance(g,g.bigBlindSeat);
  return g;
}
function recordAction(g,seat,action,paid=0,canRaise=false){if(g.historyTrace)g.historyTrace.actions.push({seat,street:g.board.length,action,paid,canRaise,bet:g.bets[seat],stack:g.stacks[seat],pot:g.committed.reduce((a,b)=>a+b,0),allIn:paid>0&&g.stacks[seat]===0})}
function pay(g,i,n){const v=Math.min(n,g.stacks[i]);g.stacks[i]-=v;g.bets[i]+=v;g.committed[i]+=v}
function street(g){g.deck.pop();const n=g.board.length?1:3;for(let i=0;i<n;i++)g.board.push(g.deck.pop())}
export function rabbitCards(g){
 if(!g?.end)throw Error('Rabbit cards require a finished hand');
 if(!Array.isArray(g.board)||![0,3,4].includes(g.board.length))throw Error('Board is complete or invalid');
 const needed=g.board.length===0?8:g.board.length===3?4:2;
 if(!Array.isArray(g.deck)||g.deck.length<needed)throw Error('Rabbit deck is incomplete');
 const copy={board:[...g.board],deck:[...g.deck]};while(copy.board.length<5)street(copy);return copy.board.slice(g.board.length);
}
function advance(g,last){
  const seats=g.stacks.map((_,i)=>i).filter(i=>!g.folded[i]),active=seats.filter(i=>g.stacks[i]>0);
  if(active.length===1)g.price=Math.max(...seats.map(i=>g.bets[i]));
  if(seats.length>1)for(let j=1;j<=g.stacks.length;j++){
    const i=(last+j)%g.stacks.length;
    if(active.includes(i)&&(g.bets[i]<g.price||(active.length>1&&g.actedAt[i]===null))){g.turn=i;return}
  }
  if(seats.length>1&&active.length>1&&g.board.length<5){
    street(g);g.bets.fill(0);g.actedAt.fill(null);g.price=0;g.increment=g.blind;advance(g,g.button);return;
  }
  if(g.runoutHand!==undefined&&seats.length===2&&active.length<=1&&g.board.length<5){g.runoutPending=true;g.turn=null;return}
  if(seats.length>1)while(g.board.length<5)street(g);
  const ranks=seats.length>1?ranksForBoard(g,g.board):null;
  g.end=settlePots(g.committed,g.folded,g.button,(a,b)=>compare(ranks[a],ranks[b]));
  g.end.payouts.forEach((v,i)=>g.stacks[i]+=v);g.turn=null;
}
function ranksForBoard(g,board){return g.hands.map((h,i)=>g.folded[i]?null:g.variant==='shortdeck'?bestShortDeck([...h,...board]):g.variant?.startsWith('plo')?omahaRank(h,board):best([...h,...board]))}

export function finishRunout(g,decision,allocations){
  const d=readRimt(decision);
  if(!g||!Number.isSafeInteger(g.runoutHand)||d.hand!==g.runoutHand||d.runs===null)throw Error('Runout decision does not match this hand');
  if(g.end){
    if(g.runoutDecision&&Object.keys(d).every(k=>d[k]===g.runoutDecision[k])&&JSON.stringify(allocations)===JSON.stringify(g.end.pots.map(p=>p.runs?.map(r=>r.amount))))return g;
    throw Error('Runout was already settled differently');
  }
  if(g.runoutPending!==true||g.turn!==null||!Array.isArray(g.stacks)||g.stacks.length<2||g.stacks.length>9||!Array.isArray(g.folded)||g.folded.length!==g.stacks.length||!g.folded.every(v=>typeof v==='boolean')||!Array.isArray(g.bets)||g.bets.length!==g.stacks.length||!Array.isArray(g.committed)||g.committed.length!==g.stacks.length||!Array.isArray(g.initialStacks)||g.initialStacks.length!==g.stacks.length||!Array.isArray(g.hands)||g.hands.length!==g.stacks.length||!g.hands.every(Array.isArray)||![...g.stacks,...g.bets,...g.committed,...g.initialStacks,g.price].every(n=>Number.isSafeInteger(n)&&n>=0)||g.bets.some((n,i)=>n>g.committed[i]))throw Error('No valid pending runout');
  const total=g.initialStacks.reduce((a,b)=>a+b,0),holeCount=({holdem:2,plo:4,plo5:5,plo6:6,shortdeck:2,aof:2,rush:2})[g.variant];
  if(!holeCount||g.hands.some((h,i)=>h.length!==holeCount&&(!g.folded[i]||h.length!==0))||!Number.isSafeInteger(total)||g.stacks.reduce((a,b)=>a+b,0)+g.committed.reduce((a,b)=>a+b,0)!==total)throw Error('Invalid pending runout bankroll or hands');
  const seats=g.folded.flatMap((folded,i)=>folded?[]:[i]),active=seats.filter(i=>g.stacks[i]>0);
  if(seats.length!==2||active.length>1||!seats.includes(d.proposer)||!seats.includes(d.decider)||active.some(i=>g.bets[i]<g.price))throw Error('Runout betting or participants changed');
  if(!Array.isArray(g.board)||![0,3,4].includes(g.board.length)||!Array.isArray(g.deck))throw Error('Invalid pending board');
  const cards=[...g.hands.flat(),...g.board,...g.deck],ranks=g.variant==='shortdeck'?'6789TJQKA':'23456789TJQKA';
  if(cards.some(c=>typeof c!=='string'||c.length!==2||!ranks.includes(c[0])||!'cdhs'.includes(c[1]))||new Set(cards).size!==cards.length)throw Error('Invalid runout cards');
  const needed=(g.board.length===0?8:g.board.length===3?4:2)*d.runs;if(g.deck.length<needed)throw Error('Insufficient runout deck');
  // Explicit local dealing policy: reuse street burns, complete each board in sequence; native multi-run burn order remains unverified.
  const deck=[...g.deck],boards=[];
  for(let run=0;run<d.runs;run++){const copy={deck,board:[...g.board]};while(copy.board.length<5)street(copy);boards.push(copy.board)}
  const scores=boards.map(board=>ranksForBoard(g,board)),end=settleRunouts(g.committed,g.folded,g.button,scores.map(ranks=>(a,b)=>compare(ranks[a],ranks[b])),allocations),stacks=g.stacks.map((chips,i)=>chips+end.payouts[i]);
  if(stacks.some(n=>!Number.isSafeInteger(n)||n<0)||stacks.reduce((a,b)=>a+b,0)!==total)throw Error('Invalid runout stack total');
  g.deck=deck;g.board=boards[0];g.runoutBoards=boards;g.runoutDecision=d;g.end=end;g.stacks=stacks;g.turn=null;delete g.runoutPending;return g;
}

export function options(g){
  if(g.end||g.runoutPending)return null;
  const i=g.turn,due=g.price-g.bets[i],stackTotal=g.bets[i]+g.stacks[i];
  const plo=g.variant?.startsWith('plo');let pot=g.committed.reduce((a,b)=>a+b,0);
  if(plo&&!g.board.length){
    const dealt=g.hands.flatMap((cards,j)=>cards.length?[j]:[]),sb=dealt.length===2?g.button:Array.from({length:g.stacks.length},(_,j)=>(g.button+j+1)%g.stacks.length).find(j=>dealt.includes(j));
    // TDA 56-B: preflop pot sizing assumes full blinds, even for short all-ins.
    const blindStack=j=>Math.max(0,(g.initialStacks?.[j]??g.blind+(g.ante||0))-(g.ante||0));
    pot+=Math.max(0,g.blind/2-blindStack(sb))+Math.max(0,g.blind-blindStack(g.bigBlindSeat));
  }
  const max=plo?Math.min(stackTotal,g.price+due+pot):stackTotal;
  const other=g.stacks.some((s,j)=>j!==i&&!g.folded[j]&&s>0);
  const reopened=g.actedAt[i]===null||g.actedAt[i]===0||g.price-g.actedAt[i]>=g.increment;
  return {due,...(plo?{pot}:{}),call:Math.min(g.stacks[i],due),max,min:Math.min(max,g.price+g.increment),raise:other&&reopened&&max>g.price};
}
// Raise targets include chips already committed on this street.
export function act(g,action,target){
  const o=options(g);if(!o)throw Error('Hand is finished');
  const i=g.turn,before=g.stacks[i];
  if(g.variant==='aof'){
    if(action==='allin'){action=o.raise?'raise':'call';target=o.max}
    else if(action!=='fold')throw Error('All-In or Fold only');
  }
  if(action==='raise'&&o.raise&&Number.isSafeInteger(target)&&target>=o.min&&target<=o.max){
    const increase=target-g.price;pay(g,i,target-g.bets[i]);g.increment=Math.max(g.increment,increase);g.price=target;
  }else if(action==='fold'&&(o.due>0||g.variant==='aof'))g.folded[i]=true;
  else if(action==='call'&&o.due>0)pay(g,i,o.call);
  else if(action!=='check'||o.due!==0)throw Error('Illegal action');
  if(g.allIns&&action!=='fold'&&g.stacks[i]===0)g.allIns[i]=true;
  if(g.vpip&&!g.board.length&&(action==='call'||action==='raise'))g.vpip[i]=true;
  g.history.push('Seat '+(i+1)+': '+action+(action==='raise'?' to '+target:action==='call'?' '+o.call:''));
  recordAction(g,i,action,before-g.stacks[i],o.raise);g.actedAt[i]=g.price;advance(g,i);
}


export function canQuickFold(g,seat){
 // Native Rush permits the unacted preflop big blind; other free actions use Check/Fold.
 return !!g&&!g.runoutPending&&(g.variant==='rush'||g.rush===true)&&!g.end&&Number.isInteger(seat)&&seat>=0&&seat<g.stacks.length&&!g.folded[seat]&&g.stacks[seat]>0&&(g.price>g.bets[seat]||!g.board.length&&seat===g.bigBlindSeat&&g.actedAt[seat]===null);
}
export function quickFold(g,seat){
 if(!canQuickFold(g,seat))throw Error('Cannot quick fold');
 const canRaise=g.turn===seat&&options(g)?.raise===true;
 g.folded[seat]=true;
 g.history.push('Seat '+(seat+1)+': fold');recordAction(g,seat,'fold',0,canRaise);
 advance(g,(g.turn+g.stacks.length-1)%g.stacks.length);
}

export function preflopRaised(game,seat){
 const actions=game?.historyTrace?.actions;
 if(!Number.isInteger(seat)||!Array.isArray(game?.hands)||!game.hands.every(Array.isArray)||!game.hands[seat]?.length||!Array.isArray(actions)||!Array.isArray(game.history)||actions.length!==game.history.length||!actions.every(a=>a&&Number.isInteger(a.seat)&&a.seat>=0&&a.seat<game.hands.length&&[0,3,4,5].includes(a.street)&&['fold','check','call','raise'].includes(a.action)))return null;
 return actions.some(a=>a.seat===seat&&a.street===0&&a.action==='raise');
}

export function preflopOpportunities(game,seat){
 if(!['holdem','plo','plo5','plo6','rush','shortdeck'].includes(game?.variant)||preflopRaised(game,seat)===null)return null;
 const actions=game.historyTrace.actions.filter(a=>a.street===0);if(!actions.every(a=>typeof a.canRaise==='boolean'))return null;
 const seats=game.hands.flatMap((cards,i)=>cards.length?[i]:[]),button=seats.indexOf(game.button);if(button<0)return null;
 const late=new Set([game.button,seats.length===2?game.button:seats[(button+1)%seats.length]]);if(seats.length>=4)late.add(seats[(button+seats.length-1)%seats.length]);
 const stats={stealOpportunities:0,stealRaises:0,threeBetOpportunities:0,threeBets:0};let raises=0,unopened=true;
 for(const a of actions){
  if(a.seat===seat&&a.canRaise){if(game.variant!=='shortdeck'&&unopened&&late.has(seat)){stats.stealOpportunities++;if(a.action==='raise')stats.stealRaises++}if(raises===1){stats.threeBetOpportunities++;if(a.action==='raise')stats.threeBets++}}
  if(a.action==='raise')raises++;if(a.action==='raise'||a.action==='call')unopened=false;
 }
 return stats;
}

export function continuationStats(game,seat){
 if(showdownStats(game,seat)===null)return null;
 const actions=game.historyTrace.actions;
 if(!actions.every((a,i)=>typeof a.canRaise==='boolean'&&['paid','bet','stack'].every(key=>Number.isSafeInteger(a[key])&&a[key]>=0)&&(!i||a.street>=actions[i-1].street)))return null;
 const stats={};
 // shortcut: local recorded opportunities, not the unavailable operator-wide HUD denominator.
 for(const [street,previous,prefix]of [[3,0,'flop'],[4,3,'turn']]){
  for(const key of ['Opportunities','Bets','Responses','Folds','Calls','Raises'])stats[prefix+'Cb'+key]=0;
  const aggressor=actions.findLast(a=>a.street===previous&&a.action==='raise')?.seat;
  if(aggressor===undefined)continue;
  let opened=false,decided=false,continuation=false;const responded=new Set();
  for(const a of actions.filter(a=>a.street===street)){
   if(a.seat===aggressor&&!decided){
    decided=true;
    if(!opened&&a.canRaise){if(seat===aggressor){stats[prefix+'CbOpportunities']++;if(a.action==='raise')stats[prefix+'CbBets']++}continuation=a.action==='raise'}
   }else if(continuation&&a.seat!==aggressor&&!responded.has(a.seat)&&['fold','call','raise'].includes(a.action)){
    responded.add(a.seat);
    if(a.seat===seat){stats[prefix+'CbResponses']++;stats[prefix+'Cb'+({fold:'Folds',call:'Calls',raise:'Raises'})[a.action]]++}
    if(a.action==='raise')continuation=false;
   }
   if(a.action==='raise')opened=true;
  }
 }
 return stats;
}

export function showdownStats(game,seat){
 if(!['holdem','plo','plo5','plo6','rush','shortdeck'].includes(game?.variant)||preflopRaised(game,seat)===null||!Array.isArray(game.board)||![0,3,4,5].includes(game.board.length)||!Array.isArray(game.folded)||game.folded.length!==game.hands.length||!game.folded.every(v=>typeof v==='boolean')||!game.end||!['payouts','returns'].every(key=>Array.isArray(game.end[key])&&game.end[key].length===game.hands.length&&game.end[key].every(n=>Number.isSafeInteger(n)&&n>=0)))return null;
 const sawFlop=game.board.length>=3&&!game.historyTrace.actions.some(a=>a.seat===seat&&a.street===0&&a.action==='fold'),showdown=sawFlop&&game.board.length===5&&!game.folded[seat]&&game.folded.filter(v=>!v).length>=2;
 return {flopsSeen:Number(sawFlop),showdowns:Number(showdown),showdownWins:Number(showdown&&game.end.payouts[seat]>game.end.returns[seat])};
}
