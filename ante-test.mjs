import assert from 'node:assert/strict';import {startHand,options,act} from './engine/table.mjs';
for(const variant of ['holdem','plo','plo5','plo6']){
 const g=startHand([100,100,100],4,0,variant,1);assert.equal(g.ante,1);assert.deepEqual(g.committed,[1,3,5]);assert.deepEqual(g.bets,[0,2,4]);assert.deepEqual(g.stacks,[99,97,95]);assert.equal(options(g).due,4);if(variant.startsWith('plo'))assert.equal(options(g).max,17);while(!g.end)act(g,options(g).due?'call':'check');assert.equal(g.committed.reduce((a,b)=>a+b),15);assert.equal(g.end.payouts.reduce((a,b)=>a+b),15);assert.equal(g.stacks.reduce((a,b)=>a+b),300);
}
const short=startHand([10000,10000,100],200,0,'plo',25);assert.equal(options(short).max,775,'Full blind sizing includes real antes and short-BB adjustment');act(short,'call');act(short,'call');assert.equal(short.board.length,3);assert.equal(short.committed.reduce((a,b)=>a+b),550);assert.equal(options(short).max,550,'No phantom blind chips after flop');
const main=startHand([100,1,100],4,0,'plo',1);main.hands=[['Ks','Qh','7s','6h'],['As','Ad','Th','Jd'],['Kc','Qd','7h','6s']];main.deck=['2s','2c','3d','4h','3s','8s','4s','9c'].reverse();while(!main.end)act(main,options(main).due?'call':'check');assert.deepEqual(main.end.payouts,[4,3,4]);assert.deepEqual(main.stacks,[99,3,99]);
const all=startHand([1,1,1],4,0,'holdem',1);assert.ok(all.end);assert.equal(all.stacks.reduce((a,b)=>a+b),3);assert.equal(options(all),null);
for(const ante of [-1,.5,'1',null,Infinity])assert.throws(()=>startHand([100,100],4,0,'holdem',ante),/ante/i);assert.throws(()=>startHand([100,100],4,0,'shortdeck',1),/ante/i);
console.log('PASS antes: dead contributions separate from bets/call, PLO caps before/after flop, all-in main/side pots, ante-only runout, all variants and conserved chips');
