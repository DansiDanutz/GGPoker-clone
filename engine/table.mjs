import {shuffleDeck} from './deck.mjs';
import {best,compare} from '../game.mjs';
import {bestShortDeck} from './hand.mjs';
import {settlePots} from './pots.mjs';

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
export function startHand(stacks,blind=4,button=0,variant='holdem',ante=0,sittingOut=[]){
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
  const g={variant,...(sittingOut.some(Boolean)?{sittingOut:[...sittingOut]}:{}),initialStacks:[...stacks],allIns:stacks.map(()=>false),vpip:stacks.map(()=>false),stacks:[...stacks],blind,button,deck,hands:stacks.map(()=>[]),board:[],folded:liveStacks.map(s=>s===0),committed:stacks.map(()=>0),bets:stacks.map(()=>0),actedAt:stacks.map(()=>null),price:blind,increment:blind,turn:null,end:null,history:[]};
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
function recordAction(g,seat,action,paid=0){if(g.historyTrace)g.historyTrace.actions.push({seat,street:g.board.length,action,paid,bet:g.bets[seat],stack:g.stacks[seat],pot:g.committed.reduce((a,b)=>a+b,0),allIn:paid>0&&g.stacks[seat]===0})}
function pay(g,i,n){const v=Math.min(n,g.stacks[i]);g.stacks[i]-=v;g.bets[i]+=v;g.committed[i]+=v}
function street(g){g.deck.pop();const n=g.board.length?1:3;for(let i=0;i<n;i++)g.board.push(g.deck.pop())}
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
  if(seats.length>1)while(g.board.length<5)street(g);
  const ranks=g.hands.map((h,i)=>seats.length>1&&!g.folded[i]?(g.variant==='shortdeck'?bestShortDeck([...h,...g.board]):g.variant?.startsWith('plo')?omahaRank(h,g.board):best([...h,...g.board])):null);
  g.end=settlePots(g.committed,g.folded,g.button,(a,b)=>compare(ranks[a],ranks[b]));
  g.end.payouts.forEach((v,i)=>g.stacks[i]+=v);g.turn=null;
}
export function options(g){
  if(g.end)return null;
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
  recordAction(g,i,action,before-g.stacks[i]);g.actedAt[i]=g.price;advance(g,i);
}


export function canQuickFold(g,seat){
 // Native Rush permits the unacted preflop big blind; other free actions use Check/Fold.
 return !!g&&(g.variant==='rush'||g.rush===true)&&!g.end&&Number.isInteger(seat)&&seat>=0&&seat<g.stacks.length&&!g.folded[seat]&&g.stacks[seat]>0&&(g.price>g.bets[seat]||!g.board.length&&seat===g.bigBlindSeat&&g.actedAt[seat]===null);
}
export function quickFold(g,seat){
 if(!canQuickFold(g,seat))throw Error('Cannot quick fold');
 g.folded[seat]=true;
 g.history.push('Seat '+(seat+1)+': fold');recordAction(g,seat,'fold');
 advance(g,(g.turn+g.stacks.length-1)%g.stacks.length);
}
