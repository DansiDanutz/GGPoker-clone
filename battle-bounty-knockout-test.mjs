import assert from 'node:assert/strict';import {startHand,act,options} from './engine/table.mjs';import {battleBountyKnockouts} from './battle-bounty.mjs';
const accounts=Array.from({length:6},(_,i)=>'player'+i);
for(const fold of [false,true]){
 const g=startHand([20,40,80,120,120,150],4,0),draws=['4s','Qh','Qs','2h','5s','8d','6s','9c'];g.hands=[['2c','3c'],['4d','5d'],['Ac','Ad'],['Ah','As'],['Kc','Kd'],['6c','7d']];const used=new Set([...g.hands.flat(),...draws]);g.deck=[...'23456789TJQKA'].flatMap(r=>[...'cdhs'].map(s=>r+s)).filter(c=>!used.has(c)).concat([...draws].reverse());let steps=0;while(!g.end){const o=options(g);act(g,fold&&g.turn===1?'fold':o.raise?'raise':o.due?'call':'check',o.raise?o.max:undefined);if(++steps>12)throw Error('Hand stalled')}
 assert.equal(g.stacks.reduce((a,b)=>a+b),530);assert.equal(g.end.returns[5],30);assert.equal(g.stacks[5],30);
 const requests=battleBountyKnockouts(g,accounts,7);assert.deepEqual(requests.map(p=>p.victim),fold?['player4','player0']:['player1','player4','player0']);
 const main=requests.find(p=>p.victim==='player0');assert.deepEqual(main,{hand:7,pot:0,victim:'player0',hunters:['player2','player3']});const side=requests.find(p=>p.victim==='player4');assert.deepEqual(side.hunters,['player3']);assert.equal(side.pot,fold?2:3);assert.ok(!requests.some(p=>p.victim==='player5'));if(fold)assert.ok(!requests.some(p=>p.victim==='player1'));
 const bad=structuredClone(g);bad.end.pots[0].payouts[2]++;assert.throws(()=>battleBountyKnockouts(bad,accounts,7));assert.throws(()=>battleBountyKnockouts(g,[...accounts.slice(0,5),'player0'],7));
}
console.log('PASS Battle knockout attribution: real unequal all-ins530chips, shared main-pot hunters, highest eligible side-pot winner, folded player and30uncalled return excluded, clockwise victim/hunter order and tamper guards');
