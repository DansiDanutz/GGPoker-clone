import assert from 'node:assert/strict';
import {startHand,act,options} from './engine/table.mjs';
import {tournamentSeatPlan} from './engine/tournament-seating.mjs';
const policy='local-idle-balance-v1',player=i=>({id:'player'+i,stack:100+i}),table=(id,start,count,playing=false)=>({id,playing,seats:Array.from({length:6},(_,i)=>i<count?player(start+i):null)});
const snapshot=tables=>structuredClone(tables),members=tables=>tables.flatMap(t=>t.seats.filter(Boolean)).sort((a,b)=>a.id.localeCompare(b.id));
for(const [counts,expected]of [[[6,1],[4,3]],[[3,3],[6]],[[4,1,1],[6]],[[6,6],[6,6]],[[0,1],[1]],[[0,0],[]]]){const input=counts.map((n,i)=>table('table'+i,i*6,n)),before=snapshot(input),plan=tournamentSeatPlan(input,policy);assert.deepEqual(input,before);assert.deepEqual(plan.tables.map(t=>t.seats.filter(Boolean).length).sort(),expected.sort());assert.deepEqual(members(plan.tables),members(input));assert.equal(plan.pending,false);const repeat=tournamentSeatPlan(plan.tables,policy);assert.deepEqual(repeat.moves,[]);assert.deepEqual(repeat.closedTables,[]);assert.deepEqual(repeat.tables,plan.tables)}
const active=[table('a',0,6,true),table('b',6,1)];active[0].seats[0].stack=0;let plan=tournamentSeatPlan(active,policy);assert.deepEqual(plan.moves,[]);assert.equal(plan.pending,true);assert.deepEqual(plan.tables,active);
plan=tournamentSeatPlan([table('a',0,4,true),table('b',6,1),table('c',12,1)],policy);assert.deepEqual(plan.tables.find(t=>t.id==='a'),table('a',0,4,true));assert.equal(plan.pending,true);assert.ok(plan.moves.every(m=>m.fromTable!=='a'&&m.toTable!=='a'));
const duplicate=[table('a',0,2),table('b',0,2)];for(const input of [duplicate,[table('a',0,2),table('a',6,2)],Array(2),[{...table('a',0,2),extra:true}],[{...table('a',0,2),playing:1}],[{...table('a',0,2),seats:Array(6)}]])assert.throws(()=>tournamentSeatPlan(input,policy));assert.throws(()=>tournamentSeatPlan([table('a',0,2)]));
const zero=table('a',0,2);zero.seats[0].stack=0;assert.throws(()=>tournamentSeatPlan([zero],policy));const huge=table('a',0,2);huge.seats[0].stack=Number.MAX_SAFE_INTEGER;assert.throws(()=>tournamentSeatPlan([huge],policy));
console.log('PASS explicit local tournament seating:idle-only6-seat rebalance/consolidation,active-hand isolation,membership/chip preservation,deterministic idempotence and strict snapshots; not wired to tournament hosting yet');
assert.deepEqual(tournamentSeatPlan([],policy),{policy,tables:[],moves:[],closedTables:[],pending:false});

let cases=0;
for(let a=0;a<=6;a++)for(let b=0;b<=6;b++)for(let c=0;c<=6;c++)for(let mask=0;mask<8;mask++){
 const counts=[a,b,c];if(counts.some((n,i)=>(mask&(1<<i))&&n<2))continue;
 const input=counts.map((n,i)=>table('table'+i,i*6,n,!!(mask&(1<<i)))),before=snapshot(input),result=tournamentSeatPlan(input,policy);assert.deepEqual(input,before);assert.deepEqual(members(result.tables),members(input));assert.equal(new Set(result.tables.flatMap(t=>t.seats.filter(Boolean).map(p=>p.id))).size,members(input).length);
 for(const t of input.filter(t=>t.playing)){assert.deepEqual(result.tables.find(other=>other.id===t.id),t);assert.ok(result.moves.every(m=>m.fromTable!==t.id&&m.toTable!==t.id))}
 assert.deepEqual([...result.tables.map(t=>t.id),...result.closedTables].sort(),input.map(t=>t.id).sort());const repeat=tournamentSeatPlan(result.tables,policy);assert.deepEqual(repeat.moves,[]);assert.deepEqual(repeat.closedTables,[]);assert.equal(repeat.pending,result.pending);cases++;
}
assert.throws(()=>tournamentSeatPlan([table('bad',0,1,true)],policy));
console.log('PASS '+cases+' occupancy/live-hand snapshots:preserved assignments/chips,exact table partition and stable deferred plans');

const games=Array.from({length:3},()=>startHand(Array(6).fill(300),10,0));
const fromGames=()=>games.map((game,t)=>({id:'table'+t,playing:!game.end,seats:game.stacks.map((stack,seat)=>game.end&&!stack?null:{id:'human'+(t*6+seat),stack})}));
for(let tableIndex=0;tableIndex<3;tableIndex++){const game=games[tableIndex];for(let actions=0;!game.end&&actions<100;actions++){const o=options(game);act(game,o.raise?'raise':o.due?'call':'check',o.max)}assert.ok(game.end);assert.equal(game.stacks.reduce((a,b)=>a+b,0),1800);const snapshots=fromGames(),plan=tournamentSeatPlan(snapshots,policy);for(const t of snapshots.filter(t=>t.playing))assert.deepEqual(plan.tables.find(other=>other.id===t.id),t);assert.deepEqual(members(plan.tables),members(snapshots));if(tableIndex===2){assert.equal(plan.pending,false);assert.equal(plan.tables.length,Math.ceil(members(snapshots).length/6));assert.equal(members(plan.tables).reduce((n,p)=>n+p.stack,0),5400)}}
console.log('PASS actual3-table/18-player Holdem hand snapshots:between-hand planning,active peer isolation and5400chips retained after all hands settle');
