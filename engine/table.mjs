import {shuffleDeck} from './deck.mjs';
import {best,compare} from '../game.mjs';
import {settlePots} from './pots.mjs';

export function startHand(stacks,blind=4,button=0){
  if(!Array.isArray(stacks)||stacks.length<2||stacks.length>9||![...stacks].every(n=>Number.isSafeInteger(n)&&n>=0)||stacks.filter(n=>n>0).length<2||!Number.isSafeInteger(stacks.reduce((a,b)=>a+b,0))) throw Error('Invalid stacks');
  if(!Number.isSafeInteger(blind)||blind<2||blind%2||!Number.isInteger(button)||button<0||button>=stacks.length||!stacks[button]) throw Error('Invalid blinds or button');
  const deck=shuffleDeck(), n=stacks.length;
  const g={stacks:[...stacks],blind,button,deck,hands:stacks.map(()=>[]),board:[],folded:stacks.map(s=>s===0),committed:stacks.map(()=>0),bets:stacks.map(()=>0),actedAt:stacks.map(()=>null),price:blind,increment:blind,turn:null,end:null,history:[]};
  const live=stacks.map((_,j)=>(button+j+1)%n).filter(i=>stacks[i]>0);
  for(let round=0;round<2;round++)for(const i of live)g.hands[i].push(deck.pop());
  const sb=live.length===2?button:live[0],bb=live.length===2?live[0]:live[1];
  g.bigBlindSeat=bb;pay(g,sb,blind/2);pay(g,bb,blind);
  advance(g,bb);return g;
}
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
  const ranks=g.hands.map((h,i)=>seats.length>1&&!g.folded[i]?best([...h,...g.board]):null);
  g.end=settlePots(g.committed,g.folded,g.button,(a,b)=>compare(ranks[a],ranks[b]));
  g.end.payouts.forEach((v,i)=>g.stacks[i]+=v);g.turn=null;
}
export function options(g){
  if(g.end)return null;
  const i=g.turn,max=g.bets[i]+g.stacks[i],due=g.price-g.bets[i];
  const other=g.stacks.some((s,j)=>j!==i&&!g.folded[j]&&s>0);
  const reopened=g.actedAt[i]===null||g.actedAt[i]===0||g.price-g.actedAt[i]>=g.increment;
  return {due,call:Math.min(g.stacks[i],due),max,min:Math.min(max,g.price+g.increment),raise:other&&reopened&&max>g.price};
}
// Raise targets include chips already committed on this street.
export function act(g,action,target){
  const o=options(g);if(!o)throw Error('Hand is finished');
  const i=g.turn;
  if(action==='raise'&&o.raise&&Number.isSafeInteger(target)&&target>=o.min&&target<=o.max){
    const increase=target-g.price;pay(g,i,target-g.bets[i]);g.increment=Math.max(g.increment,increase);g.price=target;
  }else if(action==='fold'&&o.due>0)g.folded[i]=true;
  else if(action==='call'&&o.due>0)pay(g,i,o.call);
  else if(action!=='check'||o.due!==0)throw Error('Illegal action');
  g.history.push('Seat '+(i+1)+': '+action+(action==='raise'?' to '+target:action==='call'?' '+o.call:''));
  g.actedAt[i]=g.price;advance(g,i);
}
