import assert from 'node:assert/strict';
import {startHand,act,options,nextDealer} from './engine/table.mjs';
for(const variant of ['holdem','plo','plo5','plo6','shortdeck','aof']){
 const stacks=variant==='aof'?[30,70,100,100]:[30,70,100,100,90,50],out=stacks.map((_,i)=>i===1||i===3),button=0;
 const g=startHand(stacks,4,button,variant,0,out),initial=stacks.reduce((a,b)=>a+b,0);
 assert.deepEqual(g.sittingOut,out);assert.deepEqual(stacks,g.initialStacks,'Caller bankrolls must not be mutated');
 for(let i=0;i<stacks.length;i++)if(out[i]){assert.deepEqual(g.hands[i],[]);assert.equal(g.folded[i],true);assert.equal(g.committed[i],0);assert.equal(g.stacks[i],stacks[i])}
 assert.equal(g.bigBlindSeat,variant==='shortdeck'?0:variant==='aof'?2:4,'Inactive seats cannot post blinds');
 for(let n=0;!g.end&&n<100;n++){assert.equal(out[g.turn],false);const o=options(g);act(g,variant==='aof'?'allin':o.raise?'raise':o.due?'call':'check',o.max)}
 assert.ok(g.end,variant+' must finish');assert.equal(g.stacks.reduce((a,b)=>a+b,0),initial);
 for(let i=0;i<stacks.length;i++)if(out[i]){assert.equal(g.stacks[i],stacks[i]);assert.equal(g.end.payouts[i],0);assert.equal(g.end.returns[i],0)}
 const eligible=g.stacks.map((s,i)=>out[i]?0:s);if(eligible.filter(Boolean).length>=2)assert.equal(out[nextDealer(eligible,g)],false);
}
const heads=startHand([100,100,100,100],4,0,'holdem',0,[false,true,false,true]);assert.deepEqual(heads.committed,[2,0,4,0]);assert.equal(heads.turn,0);
for(const out of [[false],null,[false,'true',false,false],[true,true,true,false]])assert.throws(()=>startHand([100,100,100,100],4,0,'holdem',0,out));
assert.throws(()=>startHand([100,100,100,100],4,1,'holdem',0,[false,true,false,false]),/button/i);
assert.equal('sittingOut' in startHand([100,100,100,100]),false,'Legacy shape is preserved');
console.log('PASS occupied inactive seats: no cards/blinds/actions/payouts, bankroll retained, heads-up/dealer,6 variants and legacy validation');
act(heads,'fold');assert.deepEqual(heads.stacks,[98,100,102,100]);
const ante=startHand([100,100,100,100,100,100],4,0,'holdem',2,[false,true,false,true,false,false]);assert.deepEqual(ante.committed,[2,0,4,0,6,2]);assert.equal(ante.stacks.reduce((a,b)=>a+b)+ante.committed.reduce((a,b)=>a+b),600);
const nine=startHand(Array(9).fill(100),4,0,'plo6',0,[false,true,false,true,false,true,false,true,false]);assert.equal(nine.hands.flat().length,30);assert.equal(new Set(nine.hands.flat()).size,30);
console.log('PASS inactive heads-up fold payout, ante exclusion and active-only deck-capacity validation');
