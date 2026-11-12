import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {rankShortDeck5,bestShortDeck} from './engine/hand.mjs';
import {compare} from './game.mjs';
const text=readFileSync(homedir()+'/Library/Application Support/com.nsuslab.ncf.launcher.live.ggpcom/Game/assets/xml/hand_rank_shortdeck.txt','utf8');
assert.match(text,/NINE,EIGHT,SEVEN,SIX,ACE,SF,Nine-High Straight Flush/);
const categories=[...new Set(text.trim().split(/\r?\n/).map(line=>line.replace(/^\uFEFF/,'').split(',')[5]))];
assert.ok(categories.indexOf('FL')<categories.indexOf('FH'),JSON.stringify(categories));
assert.ok(compare(rankShortDeck5(['Ah','Kh','Qh','8h','6h']),rankShortDeck5(['As','Ad','Ac','Ks','Kd']))>0);
assert.deepEqual(rankShortDeck5(['Ac','6h','7s','8d','9c']),[4,9]);
assert.deepEqual(rankShortDeck5(['Ah','6h','7h','8h','9h']),[8,9]);
assert.throws(()=>rankShortDeck5(['2c','6h','7s','8d','9c']));
console.log('Short-deck ranking matches shipped flush/full-house order and ace-low straight');
const faces={ACE:'A',KING:'K',QUEEN:'Q',JACK:'J',TEN:'T',NINE:'9',EIGHT:'8',SEVEN:'7',SIX:'6'};
let previous=null,checked=0;
for(const line of text.replace(/^\uFEFF/,'').trim().split(/\r?\n/)){
 const fields=line.split(','),flush=fields[7]==='true',used=new Map();
 const cards=fields.slice(0,5).map((name,i)=>{const rank=faces[name],n=used.get(rank)||0;used.set(rank,n+1);return rank+(flush?'h':'cdhs'[(n+i)%4])});
 // Assign different suits to repeated ranks without making singleton hands flush.
 const ranks=fields.slice(0,5);const counts=new Map();
 for(let i=0;i<5;i++){const rank=ranks[i],n=counts.get(rank)||0;counts.set(rank,n+1);cards[i]=faces[rank]+(flush?'h':'cdhs'[n]);}
 if(!flush&&new Set(cards.map(c=>c[1])).size===1)cards[4]=cards[4][0]+'d';
 const score=rankShortDeck5(cards);
 if(previous)assert.ok(compare(previous,score)>0,'Shipped ordering mismatch: '+line);
 previous=score;checked++;
}
assert.equal(checked,1404);
console.log('All',checked,'shipped short-deck rank classes match strict evaluator order');

assert.deepEqual(bestShortDeck(['Ah','Kh','Qh','8h','6h','Ac','Ad']),[6,14,13,12,8,6]);
assert.deepEqual(bestShortDeck(['Ac','6h','7s','8d','9c','Kh','Qd']),[4,9]);
assert.throws(()=>bestShortDeck(['Ac','Ac','7s','8d','9c']));
console.log('Seven-card selection preserves short-deck ranking and rejects duplicate cards');

const {shuffleDeck}=await import('./engine/deck.mjs');
for(let i=0;i<30;i++){const deck=shuffleDeck('shortdeck');assert.equal(deck.length,36);assert.equal(new Set(deck).size,36);assert.ok(deck.every(c=>/^[6-9TJQKA][cdhs]$/.test(c)));}
assert.equal(shuffleDeck().length,52);assert.throws(()=>shuffleDeck('invalid'));
console.log('Short-deck shuffle: 36 unique six-through-ace cards; standard deck stays 52');
const {startHand,options,act}=await import('./engine/table.mjs');
const g=startHand(Array(6).fill(120),4,0,'shortdeck');
assert.deepEqual(g.committed,[8,4,4,4,4,4]);
assert.deepEqual(g.bets,[4,0,0,0,0,0]);assert.equal(g.turn,1);
assert.equal(options(g).due,4);
assert.ok([...g.deck,...g.hands.flat()].every(c=>/^[6-9TJQKA][cdhs]$/.test(c)));
while(!g.end)act(g,options(g).due?'call':'check');
assert.equal(g.committed.reduce((a,b)=>a+b),48);
assert.equal(g.stacks.reduce((a,b)=>a+b),720);
assert.equal(g.end.payouts.reduce((a,b)=>a+b),48);
console.log('Six-seat short-deck engine: antes, live button blind, turn order and 48-chip showdown passed');
for(const stacks of [[1,2,3,4,5,6],[1,120,120,120,120,120],[120,1,120,120,120,120],[120,120,120,120,120,1]]){
 for(let button=0;button<6;button++){
  const hand=startHand(stacks,4,button,'shortdeck'),total=stacks.reduce((a,b)=>a+b);
  let actions=0;
  while(!hand.end){
   assert.ok(++actions<200);
   const o=options(hand),seat=hand.turn;
   assert.ok(o.call<=hand.stacks[seat]);assert.ok(o.due>=0);
   if(o.raise&&actions%3===0)act(hand,'raise',o.max);
   else act(hand,o.due?'call':'check');
   assert.equal(hand.stacks.reduce((a,b)=>a+b)+(!hand.end?hand.committed.reduce((a,b)=>a+b):0),total);
  }
  assert.ok(hand.stacks.every(n=>Number.isSafeInteger(n)&&n>=0));
  assert.equal(hand.end.payouts.reduce((a,b)=>a+b),hand.committed.reduce((a,b)=>a+b));
  assert.equal(new Set([...hand.hands.flat(),...hand.board,...hand.deck]).size,hand.hands.flat().length+hand.board.length+hand.deck.length);
 }
}
console.log('24 unequal-stack Short Deck hands: partial antes, all-ins, side-pot totals and chip conservation passed');
const side=startHand([20,40,80,120,120,120],4,0,'shortdeck');
side.hands=[['Ah','Kh'],['As','Qc'],['9h','Th'],['Kc','Kd'],['6c','6d'],['Jc','Tc']];
// Pop order: burn, flop, burn, turn, burn, river.
side.deck=['7c','Qh','8h','6h','7d','Ac','7s','Ad'].reverse();
while(!side.end){const o=options(side);act(side,o.raise?'raise':o.due?'call':'check',o.max)}
assert.deepEqual(side.board,['Qh','8h','6h','Ac','Ad']);
assert.deepEqual(side.committed,[20,40,80,120,120,120]);
assert.deepEqual(side.end.payouts,[120,0,260,0,120,0]);
assert.equal(side.stacks.reduce((a,b)=>a+b),500);
console.log('Exact Short Deck side pots: ace-high flush wins 120, ten-high flush 260, sixes full 120');

assert.throws(()=>startHand(Array(7).fill(120),4,0,'shortdeck'),/six seats/);
const folded=startHand([20,40,80,120,120,120],4,0,'shortdeck');
folded.hands=[['Ah','Kh'],['As','Qc'],['9h','Th'],['Kc','Kd'],['6c','6d'],['Jc','Tc']];
folded.deck=['7c','Qh','8h','6h','7d','Ac','7s','Ad'].reverse();
while(!folded.end){const o=options(folded);act(folded,folded.turn===0&&o.due?'fold':o.raise?'raise':o.due?'call':'check',o.max)}
assert.equal(folded.folded[0],true);
assert.deepEqual(folded.committed,[8,40,80,120,120,120]);
assert.deepEqual(folded.end.payouts,[0,0,368,0,120,0]);
assert.equal(folded.stacks[0],12);
assert.equal(folded.stacks.reduce((a,b)=>a+b),500);
console.log('Folded ace-high flush excluded; its 8 chips stay in pots: payouts 368 and 120, total 500 retained');
const {nextDealer}=await import('./engine/table.mjs');
assert.equal(nextDealer([120,120],{variant:'shortdeck',button:0,bigBlindSeat:0}),1);
assert.equal(nextDealer([120,0,120,0],{variant:'shortdeck',button:2,bigBlindSeat:2}),0);
