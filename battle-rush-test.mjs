import assert from 'node:assert/strict';
import {battleRush} from './battle-rush.mjs';
import {spawnSync} from 'node:child_process';
const entries=Array.from({length:12},(_,i)=>({id:'player'+i,stack:100}));
const config={eventId:'practice-battle',blind:4,finalSeats:6,startedAt:1000,rushEndsAt:2000};
let event=battleRush(entries,config);const sessions=event.sessions();
assert.equal(event.total(),1200);assert.throws(()=>event.view('player0','wrong'),/session/);
const first=event.deal('player0',sessions.player0,1000).table;
assert.equal(event.view('player0',sessions.player0).hand.cards.filter(Boolean).length,1);
const beforePreview=event.snapshot(),preview=event.preview(String(first));assert.equal(preview.maxPlayers,6);assert.equal(preview.table,String(first));assert.deepEqual(preview.players.map(p=>p.name),event.view('player0',sessions.player0).names);assert.deepEqual(preview.players.map(p=>p.chips),event.view('player0',sessions.player0).hand.stacks);assert.deepEqual(preview.players.map(p=>p.position),['dealer','small-blind','big-blind',null,null,null]);assert.ok(preview.players.every(p=>Object.keys(p).sort().join(',')==='chips,name,position,seat'));preview.players[0].chips=999;assert.notEqual(event.preview(String(first)).players[0].chips,999);assert.equal(event.snapshot(),beforePreview);assert.equal(event.preview('unknown'),null);

assert.equal(event.view('player0',sessions.player0).hand.deck,undefined);const privateCard=event.view('player0',sessions.player0).hand.cards[0][0];event.view('player0',sessions.player0).hand.cards[0][0]='XX';assert.equal(event.view('player0',sessions.player0).hand.cards[0][0],privateCard,'Returned views cannot mutate game state');assert.throws(()=>event.qualification(),/Finish/);
assert.throws(()=>event.move('player0',sessions.player0,undefined,'call',undefined,1100),/table/);
const next=event.fold('player0',sessions.player0,first,1100).table;
assert.notEqual(next,first);assert.equal(event.total(),1200);assert.ok(!event.preview(String(first)).players.some(p=>p.name==='player0'));assert.equal(event.preview(String(next)).players.filter(p=>p.name==='player0').length,1);
assert.throws(()=>event.move('player0',sessions.player0,first,'call',undefined,1100),/table/);
const checkpoint=event.snapshot();event=battleRush(entries,config,checkpoint);
assert.deepEqual(event.sessions(),sessions);assert.equal(event.view('player0',sessions.player0).table,next);
const resumed=spawnSync(process.execPath,['--input-type=module','-e',`
 import {battleRush} from './battle-rush.mjs';let input='';for await(const c of process.stdin)input+=c;
 const {entries,config,checkpoint}=JSON.parse(input),event=battleRush(entries,config,checkpoint),sessions=event.sessions();
 event.tick(2000);
 let turns=0;while(event.phase()!=='qualification'){
  let moved=false;for(const p of entries){const v=event.view(p.id,sessions[p.id]);if(v.hand?.legal){event.move(p.id,sessions[p.id],v.table,v.hand.legal.due?'call':'check',undefined,2000);moved=true;turns++}}
  if(!moved||turns>300)throw Error('Cannot drain active hands');
 }
 process.stdout.write(JSON.stringify({phase:event.phase(),total:event.total(),qualification:event.qualification(),snapshot:event.snapshot()}));
`],{input:JSON.stringify({entries,config,checkpoint}),encoding:'utf8',timeout:10000});
assert.equal(resumed.status,0,resumed.stderr);const result=JSON.parse(resumed.stdout);
assert.equal(result.phase,'qualification');assert.equal(result.total,1200);
assert.equal(result.qualification.reduce((n,p)=>n+p.stack,0),1200);
event=battleRush(entries,config,result.snapshot);assert.equal(event.phase(),'qualification');
assert.throws(()=>event.deal('player0',sessions.player0,1500),/closed/,'Restart cannot reopen the expired stage');
assert.throws(()=>battleRush(entries,{...config,eventId:'other'},checkpoint),/checkpoint/);
assert.throws(()=>battleRush(entries,{...config,finalSeats:12}),/configuration/);
assert.throws(()=>battleRush(entries,{...config,blind:undefined}),/configuration/);const missing=JSON.parse(checkpoint);missing.pool=null;assert.throws(()=>battleRush(entries,config,JSON.stringify(missing)),/checkpoint/);
const broken=JSON.parse(checkpoint);broken.sessions[1][1]=broken.sessions[0][1];assert.throws(()=>battleRush(entries,config,JSON.stringify(broken)),/checkpoint/);
console.log('PASS Battle Rush foundation: event/session and stale-table guards, private cards, real fast-fold rematch,1200chips, process restart, deadline drain and qualification boundary without cash-wallet operations');
