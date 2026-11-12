import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'tournament-seats-')),realNow=Date.now;
try{
 let now=realNow();Date.now=()=>now;
 for(const seats of [3,6]){
  const file=join(dir,seats+'.json'),table={mode:'tournament',tournamentSeats:seats,name:'Event',stack:100,blind:4,open:true},id=String(seats).repeat(48);
  let room=openRooms(file),state;const tokens=[];
  const req=(op,token,body={})=>room(id,op,token,body,table);
  for(let i=0;i<seats;i++){state=req('join',null,{name:'Player'+i});tokens.push(state.issued);assert.equal(state.names.length,seats)}
  assert.equal(state.tournament.pool,seats*25);
  for(let turn=0;state.tournament.winner===null&&turn<500;turn++){
   if(state.hand.end){now+=3100;state=req('state',tokens[0]);continue}
   const seat=state.hand.turn;state=req('state',tokens[seat]);
   const o=state.hand.options;state=req('act',tokens[seat],{version:state.version,action:o.raise?'raise':o.due?'call':'check',target:o.max});
  }
  assert.notEqual(state.tournament.winner,null);assert.equal(state.hand.stacks.reduce((a,b)=>a+b),seats*100);
  assert.deepEqual([...state.tournament.finishes].sort((a,b)=>a-b),Array.from({length:seats},(_,i)=>i+1));
  assert.equal(state.tournament.prizes.reduce((a,b)=>a+b),seats*25);
  room=openRooms(file);assert.deepEqual(req('state',tokens[0]).tournament,state.tournament);
  console.log('PASS',seats,'player tournament: registration, unique places, chips, prize and storage recovery');
 }
}finally{Date.now=realNow;rmSync(dir,{recursive:true,force:true})}
