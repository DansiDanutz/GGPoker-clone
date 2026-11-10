import assert from 'node:assert/strict';
import {best,compare,deal,act,moves} from './game.mjs';
import {rank5} from './hand.mjs';
const arr=s=>s.split(' ');
const ordered=['As Jd 9c 7h 3h','As Ad 9c 7h 3h','As Ad 9c 9h 3h','As Ad Ac 7h 3h','As 2d 3c 4h 5s','As Js 9s 7s 3s','As Ad Ac 7h 7s','As Ad Ac Ah 3h','As 2s 3s 4s 5s'];
ordered.forEach((s,i)=>{if(i)assert.equal(compare(rank5(arr(s)),rank5(arr(ordered[i-1]))),1)});
assert.equal(compare(rank5(arr('2s 3h 4c 5d 6s')),rank5(arr(ordered[4]))),1);
assert.equal(compare(rank5(arr('As Ah Kc Qh Td')),rank5(arr('Ac Ad Ks Qc 9d'))),1);
assert.throws(()=>rank5(arr('As As Ts Js Qs')));assert.throws(()=>rank5(arr('As Xx Ts Js Qs')));
assert.equal(compare(best(arr('2h 3c As Ks Qs Js Ts')),rank5(arr('As Ks Qs Js Ts'))),0);
for(let i=0;i<180;i++){const g=deal(20,4,i%2);assert.equal(new Set([...g.deck,...g.hands.flat()]).size,52);let n=0;while(!g.end){assert.ok(n++<45);const m=moves(g);act(g,m[(i+n*7)%m.length]);assert.equal(g.pot+g.stacks[0]+g.stacks[1],40);assert.ok(g.stacks.every(x=>x>=0))}}
const g=deal();act(g,'call');assert.deepEqual(g.board,[]);act(g,'check');assert.equal(g.board.length,3);assert.throws(()=>act(g,'call'));console.log('PASS: all hand categories, kicker, wheel, seven-card showdown, deck uniqueness, legal turns, blinds and chip conservation');
