import assert from 'node:assert/strict';
import {holdemRank7,holdemEquity} from './engine/rimt-equity.mjs';
import {best} from './game.mjs';
import {startHand,act} from './engine/table.mjs';
import {prepareRoomRimt} from './room-rimt.mjs';
const pack=rank=>rank.slice(1).reduce((n,v,i)=>n|(v<<(16-i*4)),rank[0]<<20),deck=[...'23456789TJQKA'].flatMap(r=>[...'cdhs'].map(s=>r+s));
for(const cards of [['Ac','Kc','Qc','Jc','Tc','2d','3h'],['Ac','Ad','Ah','As','Kd','2c','3h'],['Ac','Ad','Ah','Kc','Kd','Kh','2s'],['Ac','Jc','9c','7c','5c','3c','2c'],['Ac','2d','3h','4s','5c','Kd','Qh'],['Ac','Ad','Kh','Kd','Qs','Qh','2c'],['Ac','Ad','Ah','Kc','Qd','3s','2h'],['Ac','Ad','Kh','Qs','Jc','3d','2s'],['Ac','Kd','Jh','9s','7c','4d','2h']])assert.equal(holdemRank7(cards),pack(best(cards)));
let seed=7;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32};
for(let n=0;n<10000;n++){const pool=[...deck],cards=[];for(let i=0;i<7;i++)cards.push(pool.splice(Math.floor(random()*pool.length),1)[0]);assert.equal(holdemRank7(cards),pack(best(cards)),cards.join(' '))}
assert.deepEqual(holdemEquity(['Ac','Ad'],['Kc','Kd'],['2c','3d','7h','9s']),{wins:[42,2],ties:0,total:44});
const a=['Ac','Ad'],b=['Kc','Kd'],board=['2c','3d','7h'],known=new Set([...a,...b,...board]),pool=deck.filter(c=>!known.has(c)),expected={wins:[0,0],ties:0,total:0};
for(let i=0;i<pool.length;i++)for(let j=i+1;j<pool.length;j++){const x=best([...a,...board,pool[i],pool[j]]),y=best([...b,...board,pool[i],pool[j]]);let d=0;for(let k=0;k<Math.max(x.length,y.length);k++)if((x[k]??0)!==(y[k]??0)){d=Math.sign((x[k]??0)-(y[k]??0));break}expected.total++;if(!d)expected.ties++;else expected.wins[d>0?0:1]++}
assert.deepEqual(holdemEquity(a,b,board),expected);assert.deepEqual(holdemEquity(b,a,board),{...expected,wins:[...expected.wins].reverse()});
assert.deepEqual(holdemEquity(['2c','3d'],['4c','5d'],['Tc','Jd','Qh','Ks','Ac']),{wins:[0,0],ties:1,total:1});
for(const bad of [[],['Ac','Ad','Ah','As','Ac','2c','3d'],['Ac','Ad','Ah','As','Kc','2c','xx']])assert.throws(()=>holdemRank7(bad));
for(const args of [[['Ac','Ac'],b,[]],[a,b,['2c']],[a,b,['Ac','3d','7h']],[[...a,'Ah'],b,[]]])assert.throws(()=>holdemEquity(...args));
console.log('PASS exact local RIMT equity:all rank categories,10000 independent rank comparisons,turn/flop exhaustive oracle,hand symmetry,tied board andinvalid cards');
if(process.argv.includes('--preflop')){const start=performance.now(),p=holdemEquity(['Ac','Ad'],['Kc','Kd'],[]);assert.equal(p.total,1712304);assert.equal(p.wins[0]+p.wins[1]+p.ties,p.total);assert.ok(p.wins[0]>p.wins[1]);console.log('PASS exhaustive preflop',JSON.stringify({...p,ms:Math.round(performance.now()-start)}))}

const tied=startHand([50,50],4,0,'holdem',0,[],1);act(tied,'raise',50);act(tied,'call');tied.hands=[['Ac','Ad'],['Ah','As']];tied.deck=deck.filter(c=>!tied.hands.flat().includes(c));const room={number:1,version:1,hand:tied,deadline:null,settings:{rimt:true},players:[{account:'A'},{account:'B'}]};prepareRoomRimt(room,1000);assert.equal(room.rimt.decision.proposer,1);assert.equal(room.rimt.decision.decider,0);assert.equal(room.rimt.decision.suggestUntil,16000);assert.equal(room.rimt.decision.decisionMs,15000);assert.deepEqual(room.rimt.allocations[2],[[34,33,33]]);
assert.deepEqual(holdemEquity(Object.freeze(['Ac','Ad']),Object.freeze(['Kc','Kd']),Object.freeze(['2c','3d','7h','9s'])),{wins:[42,2],ties:0,total:44});
console.log('PASS local tied-equity role policy:clockwise after dealer,explicit15second deadlines,first-run remainder andfrozen inputs');
