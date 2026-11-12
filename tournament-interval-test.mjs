import assert from 'node:assert/strict';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'event-clock-')),file=join(dir,'rooms.json'),originalNow=Date.now;let now=100000;Date.now=()=>now;
try{
 let room=openRooms(file);const events=[];
 for(const [index,levelSeconds]of [1,60].entries()){const id=('a'+index).repeat(24),table={name:'Clock '+levelSeconds,mode:'tournament',tournamentSeats:3,stack:100,blind:4,open:true,levelSeconds},players=[];for(let i=0;i<3;i++)players.push(room(id,'join',null,{name:'Player '+i},table));assert.equal(players[2].tournament.intervalMs,levelSeconds*1000);let state=players[2];while(!state.hand.end){const token=players[state.hand.turn].issued;state=room(id,'state',token,{},table);state=room(id,'act',token,{version:state.version,action:'fold'},table)}events.push({id,table,players})}
 now+=3100;for(const [i,e]of events.entries()){room(e.id,'tick',null,{},e.table);const state=room(e.id,'state',e.players[0].issued,{},e.table);assert.equal(state.tournament.level,i===0?4:1);assert.equal(state.hand.blind,i===0?32:4);assert.equal(state.hand.stacks.reduce((n,v,j)=>n+v+state.hand.committed[j],0),300)}
 room=openRooms(file);for(const e of events)assert.equal(room(e.id,'state',e.players[0].issued,{},e.table).tournament.intervalMs,e.table.levelSeconds*1000);
 console.log('PASS independent tournament clocks: configured one/sixty-second levels, concurrent level/hand-blind changes, new-hands-only, 300 chips and restart persistence');
}finally{Date.now=originalNow;rmSync(dir,{recursive:true,force:true})}
