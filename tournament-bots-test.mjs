import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
const customPrizes=process.argv.includes('--custom-prizes');
const variant=process.argv.includes('--plo')?'plo':null;
const dir=mkdtempSync(join(tmpdir(),'event-bots-')),realNow=Date.now;let now=realNow();Date.now=()=>now;
try{
 for(const capacity of [3,6]){
  const expected=capacity===3?[53,22]:[75,45,30],shares=capacity===3?[70,30]:[50,30,20];
  const table={mode:'tournament',...(customPrizes?{prizeShares:shares}:{}),...(variant?{variant}:{}),tournamentSeats:capacity,name:'Solo event',stack:100,blind:4,open:true},id=String(capacity).repeat(48),file=join(dir,capacity+'.json');
  let room=openRooms(file);const req=(op,token,body={})=>room(id,op,token,body,table);
  let s=req('join',undefined,{name:'Player'});const token=s.issued;assert.equal(s.canFill,true);
  s=req('fill-bots',token,{version:s.version});assert.equal(s.tournament.pool,capacity*25);assert.equal(s.names.filter(n=>n.startsWith('Computer')).length,capacity-1);
  if(variant)assert.equal(s.hand.cards[0].length,4);
  for(let i=0;s.tournament.winner===null&&i<2000;i++){
   if(s.hand.end)now+=65000;
   now+=500;s=req('state',token);
   if(!s.hand.end&&s.hand.turn===s.me){const o=s.hand.options;if(variant){const g=JSON.parse(readFileSync(file))[0][1].hand,live=Array.from({length:capacity},(_,j)=>(g.button+j+1)%capacity).filter(j=>g.initialStacks[j]>0),sb=live.length===2?g.button:live[0],bb=live.length===2?live[0]:live[1],extra=g.board.length?0:Math.max(0,g.blind/2-g.initialStacks[sb])+Math.max(0,g.blind-g.initialStacks[bb]),pot=g.committed.reduce((a,b)=>a+b,0)+extra;assert.equal(o.max,Math.min(s.hand.stacks[s.me]+s.hand.bets[s.me],s.hand.bets[s.me]+2*o.due+pot))}s=req('act',token,{version:s.version,action:o.raise?'raise':o.due?'call':'check',target:o.max})}
  }
  assert.notEqual(s.tournament.winner,null);assert.equal(s.hand.stacks.reduce((a,b)=>a+b),capacity*100);
  assert.equal(s.tournament.prizes.reduce((a,b)=>a+b),capacity*25);
  if(customPrizes)assert.deepEqual(s.tournament.prizes,s.tournament.finishes.map(place=>expected[place-1]||0));
  room=openRooms(file);assert.deepEqual(req('state',token).tournament,s.tournament);
  console.log('PASS solo',variant||'holdem',capacity,'player event:',capacity-1,'computers, winner, chips, prize and restart');
 }
 const editable={mode:'tournament',tournamentSeats:3,name:'Editable',stack:100,blind:4,open:true},editId='a'.repeat(48),editRoom=openRooms(join(dir,'editable.json'));
 let edit=editRoom(editId,'join',undefined,{name:'Before'},editable);editRoom(editId,'leave',edit.issued,{version:edit.version},editable);
 editable.variant='plo';editable.tournamentSeats=6;
 edit=editRoom(editId,'join',undefined,{name:'After'},editable);assert.equal(edit.settings.variant,'plo');assert.equal(edit.names.length,6);
 edit=editRoom(editId,'fill-bots',edit.issued,{version:edit.version},editable);assert.equal(edit.hand.cards[edit.me].length,4);
 console.log('PASS empty-event edit: refreshed Omaha format and six-seat capacity before registration');
}finally{Date.now=realNow;rmSync(dir,{recursive:true,force:true})}
