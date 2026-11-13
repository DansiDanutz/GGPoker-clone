import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'owner-monitor-')),file=join(dir,'rooms.json'),realNow=Date.now;let now=realNow();Date.now=()=>now;
try{
 let req=openRooms(file,()=>0,true);const id='e'.repeat(48),table={id:'monitor',name:'Monitor',mode:'tournament',tournamentSeats:3,entryCost:37,prizeShares:[70,30],stack:100,blind:4,levelSeconds:10,open:true},names=['Alice','Bob','Carol'],tokens=[];
 const monitor=()=>req(id,'owner-seats',null,{},table),state=i=>req(id,'state',tokens[i],{},table,names[i]);
 assert.equal(monitor().monitor.phase,'registration');
 for(const name of names)tokens.push(req(id,'join',null,{name},table,name).issued);
 let m=monitor(),s=state(0);assert.equal(m.monitor.phase,'playing');assert.equal(m.monitor.hand,1);assert.equal(m.monitor.turn,s.hand.turn);assert.equal(m.monitor.prizePool,111);assert.equal(m.monitor.chipTotal,300);assert.equal(m.monitor.pot,6);assert.equal(m.players.reduce((n,p)=>n+p.stack+p.committed,0),300);assert.equal(m.players.filter(p=>p.acting).length,1);assert.ok(m.players.every(p=>p.status==='playing'&&p.place===null&&p.prize===null));
 const disk=readFileSync(file);for(let i=0;i<4;i++)assert.deepEqual(monitor(),m);assert.deepEqual(readFileSync(file),disk,'Monitoring cannot modify saved state');for(const key of ['cards','hands','deck','token','account','issued'])assert.ok(!JSON.stringify(m).includes('"'+key+'"'),'No private '+key);
 req(id,'tournament-control',null,{action:'pause',version:s.version},table);assert.equal(monitor().monitor.pauseRequested,true);s=state(0);
 while(!s.hand.end){const actor=s.hand.turn;s=req(id,'act',tokens[actor],{version:s.version,action:'fold'},table,names[actor])}
 m=monitor();assert.equal(m.monitor.phase,'paused');assert.equal(m.monitor.turn,null);assert.equal(m.monitor.pot,0);assert.equal(m.monitor.chipTotal,300);assert.ok(m.players.every(p=>p.status==='between-hands'));
 req=openRooms(file,()=>0,true);assert.deepEqual(monitor(),m,'Cold restart preserves monitor state');req(id,'tournament-control',null,{action:'resume',version:m.version},table);
 s=state(0);now=s.tournament.nextDealAt;req(id,'tick',null,{},table);s=state(0);
 const packed=JSON.parse(readFileSync(file)),game=packed.find(([key])=>key===id)[1].hand,run=['Tc','2c','3d','7h','Jc','8s','Qc','9c'];game.hands=[['Qh','Qd'],['Ac','Ad'],['Kc','Kd']];const used=new Set([...game.hands.flat(),...run]);game.deck=game.deck.filter(c=>!used.has(c)).concat([...run].reverse());writeFileSync(file,JSON.stringify(packed));req=openRooms(file,()=>0,true);
 let count=0;while(s.tournament.winner===null&&count++<100){if(s.hand.end){now=s.tournament.nextDealAt;req(id,'tick',null,{},table);s=state(0);continue}const actor=s.hand.turn,own=state(actor),o=own.hand.options;s=req(id,'act',tokens[actor],{version:own.version,action:o.raise?'raise':o.due?'call':'check',target:o.max},table,names[actor]);assert.equal(monitor().monitor.chipTotal,300);assert.deepEqual(req(id,'summary',null,{},table).seats.map(p=>p.stack),s.hand.stacks,'Lobby previews must preserve eliminated zero stacks on later hands')}
 assert.notEqual(s.tournament.winner,null);m=monitor();assert.equal(m.monitor.phase,'finished');assert.equal(m.monitor.pot,0);assert.equal(m.players.filter(p=>p.status==='winner').length,1);assert.equal(m.players.filter(p=>p.status==='eliminated').length,2);assert.deepEqual(m.players.map(p=>p.place).sort(),[1,2,3]);assert.equal(m.players.reduce((n,p)=>n+p.prize,0),111);assert.equal(m.canRemove,false);
 for(const p of m.players)assert.equal(req.wallet(names[p.seat]).available,10000-37+p.prize);
 req=openRooms(file,()=>0,true);assert.deepEqual(monitor(),m);assert.equal(monitor().monitor.chipTotal,300);
 console.log('PASS owner monitor: active actor/pot/stack conservation, immutable/private reads, pause and cold restart, complete funded tournament, elimination places and exact111-credit prizes');
}finally{Date.now=realNow;rmSync(dir,{recursive:true,force:true})}
