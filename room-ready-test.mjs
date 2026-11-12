import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'poker-ready-')),id='a'.repeat(48),table={name:'Ready test',stack:120,blind:4,open:true};
try{
 let room=openRooms(join(dir,'rooms.json'));const tokens=[];
 for(let i=0;i<6;i++)tokens.push(room(id,'join',null,{name:'Player '+i},table).issued);
 const state=i=>room(id,'state',tokens[i],{},table);
 let s=state(0);
 while(!s.hand.end){const i=s.hand.turn;room(id,'act',tokens[i],{action:s.hand.bets[i]<Math.max(...s.hand.bets)?'fold':'check',version:s.version},table);s=state(0)}
 const old={version:s.version,number:s.number};
 room(id,'ready',tokens[0],old,table);
 assert.throws(()=>room(id,'ready',tokens[1],{version:old.version},table),e=>e.status===409);
 room(id,'ready',tokens[1],old,table);
 const v=state(0).version;room(id,'ready',tokens[1],old,table);assert.equal(state(0).version,v);
 room=openRooms(join(dir,'rooms.json'));
 for(let i=2;i<6;i++)room(id,'ready',tokens[i],old,table);
 assert.equal(state(0).number,2);assert.equal(state(0).hand.end,null);
 assert.throws(()=>room(id,'ready',tokens[0],old,table),e=>e.status===409);
 const current=state(0);assert.throws(()=>room(id,'act',tokens[current.hand.turn],{action:'call',version:old.version,number:current.number},table),e=>e.status===409);
 assert.throws(()=>room(id,'ready',tokens[0],{version:current.version,number:1},table),e=>e.status===409);
 console.log('PASS ready: shared stale snapshot, duplicate idempotence, restart midway, exactly one next hand, old-hand and stale-wager rejection');
}finally{rmSync(dir,{recursive:true,force:true})}
