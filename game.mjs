import {shuffleDeck} from "./engine/deck.mjs";
import {settlePots} from './engine/pots.mjs';
import {rank5} from './engine/hand.mjs';
export function compare(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]??0)-(b[i]??0);if(d)return Math.sign(d)}return 0}
export function best(cards){if(cards.length===5)return rank5(cards);if(cards.length===6)return cards.map((_,i)=>rank5(cards.filter((_,j)=>j!==i))).reduce((a,b)=>compare(a,b)>0?a:b);let high=null;for(let i=0;i<7;i++)for(let j=i+1;j<7;j++){const rank=rank5(cards.filter((_,k)=>k!==i&&k!==j));if(!high||compare(rank,high)>0)high=rank}return high}
export function deal(stack=200,blind=4,button=0){
 if(!Number.isSafeInteger(stack)||!Number.isSafeInteger(blind)||blind<2||blind%2||stack<blind*4||stack>1000000||![0,1].includes(button))throw Error('Invalid table limits');
 const deck=shuffleDeck();
 const bets=[blind,blind];bets[button]=blind/2;
 return {button,blind,deck,hands:[[deck.pop(),deck.pop()],[deck.pop(),deck.pop()]],board:[],stacks:bets.map(x=>stack-x),pot:bets[0]+bets[1],bets,committed:[...bets],turn:button,acted:[false,false],raises:0,log:['Blinds posted'],end:null}
}
export function moves(g){if(g.end)return [];const p=g.turn,q=1-p,due=g.bets[q]-g.bets[p],step=g.blind*(g.board.length>=4?2:1);
 return [...(due?['fold','call']:['check']),...(g.raises<3&&g.stacks[p]>=due+step&&g.stacks[q]>=step?['raise']:[])]}
function finish(g, foldedSeat) {
 const show=foldedSeat===null, folded=g.hands.map((_,i)=>i===foldedSeat);
 const ranks=show?g.hands.map(hand=>best([...hand,...g.board])):[];
 const order=(a,b)=>compare(ranks[a],ranks[b]);
 const {payouts,returns}=settlePots(g.committed,folded,g.button,order);
 const result=show?order(0,1):0;
 const winner=show?(result===0?-1:result>0?0:1):1-foldedSeat;
 payouts.forEach((amount,i)=>{g.stacks[i]+=amount;if(returns[i])g.log.push((i?'Opponent':'You')+': uncalled '+returns[i]+' returned')});
 g.end={winner,pot:g.pot-returns.reduce((a,b)=>a+b,0),show};g.pot=0;
}
function street(g){g.deck.pop();let n=g.board.length?1:3;while(n--)g.board.push(g.deck.pop());g.bets=[0,0];g.acted=[false,false];g.raises=0;g.turn=1-g.button}
export function act(g,action){
 if(!moves(g).includes(action))throw Error('Illegal action');
 const p=g.turn,q=1-p;g.log.push((p?'Opponent':'You')+': '+action);
 if(action==='fold'){finish(g,p);return}
 const amount=g.bets[q]-g.bets[p]+(action==='raise'?g.blind*(g.board.length>=4?2:1):0);
 g.stacks[p]-=amount;g.bets[p]+=amount;g.committed[p]+=amount;g.pot+=amount;g.acted[p]=true;
 if(action==='raise'){g.acted[q]=false;g.raises++}
 g.turn=q;
 if(g.acted.every(Boolean)&&g.bets[0]===g.bets[1]){
  if(g.stacks.includes(0))while(g.board.length<5)street(g);
  if(g.board.length===5)finish(g,null);else street(g)
 }
}
