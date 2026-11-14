import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,mkdirSync,rmdirSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'battle-final-')),file=join(dir,'rooms.json'),realNow=Date.now;let now=1000;Date.now=()=>now;
const settings={id:'final-battle',name:'Final Battle',capacity:12,stack:100,blind:4,finalSeats:3,rushDurationMs:1,entryCost:25};
try{
 let rooms=openRooms(file,()=>0,true);rooms.createBattleEvent(settings);for(let i=0;i<12;i++)rooms.registerBattleEvent(settings.id,'Player'+i);
 assert.throws(()=>rooms.startBattleFinal(settings.id),/qualification/i);now++;
 let v;for(let i=0;i<200;i++){rooms.tickBattle();v=rooms.battleEvent(settings.id,'Player0');if(v.phase==='final-ready')break}assert.equal(v.phase,'final-ready');
 const source=readFileSync(file);mkdirSync(file+'.tmp');assert.throws(()=>rooms.startBattleFinal(settings.id));rmdirSync(file+'.tmp');assert.deepEqual(readFileSync(file),source);
 const result=rooms.startBattleFinal(settings.id),qualified=v.qualification.qualified;assert.match(result.room,/^[a-f0-9]{48}$/);
 const saved=readFileSync(file);assert.deepEqual(rooms.startBattleFinal(settings.id),result);assert.deepEqual(readFileSync(file),saved);
 rooms=openRooms(file,()=>0,true);assert.deepEqual(rooms.startBattleFinal(settings.id),result);
 const watchBefore=readFileSync(file);assert.throws(()=>rooms(result.room,'watch'),/Sign in/);const observer=rooms(result.room,'watch',undefined,{},undefined,'localviewer');assert.equal(observer.me,null);assert.ok(observer.hand.cards.every(h=>h===null));assert.equal(observer.issued,undefined);assert.deepEqual(readFileSync(file),watchBefore);
 const tokens=[];let firstVersion;for(const p of qualified){const own=rooms(result.room,'join',undefined,{name:p.id},undefined,p.id);tokens.push(own.issued);firstVersion??=own.version;assert.equal(own.me,tokens.length-1);assert.deepEqual(own.hand.stacks.map((n,i)=>n+own.hand.committed[i]),qualified.map(p=>p.stack))}
 assert.throws(()=>rooms(result.room,'join',undefined,{name:'Player11'},undefined,'outsider'),/qualified/i);
 assert.throws(()=>rooms(result.room,'fill-bots',tokens[0],{},undefined,qualified[0].id),/fixed/i);
 assert.throws(()=>rooms(result.room,'leave',tokens[0],{},undefined,qualified[0].id),/fixed/i);
 let hand=rooms(result.room,'state',tokens[0],{},undefined,qualified[0].id),moves=0;assert.equal(hand.hand.turn,0);const firstOptions=hand.hand.options;rooms(result.room,'act',tokens[0],{action:firstOptions.due?'call':'check',version:firstVersion},undefined,qualified[0].id);assert.throws(()=>rooms(result.room,'act',tokens[0],{action:'check',version:firstVersion},undefined,qualified[0].id));hand=rooms(result.room,'state',tokens[0],{},undefined,qualified[0].id);
 while(!hand.hand.end){const seat=hand.hand.turn,own=rooms(result.room,'state',tokens[seat],{},undefined,qualified[seat].id),o=own.hand.options;rooms(result.room,'act',tokens[seat],{action:o.due?'call':'check',version:own.version},undefined,qualified[seat].id);hand=rooms(result.room,'state',tokens[0],{},undefined,qualified[0].id);if(++moves>50)throw Error('Final hand stalled')}
 assert.equal(hand.hand.stacks.reduce((a,b)=>a+b),1200);for(let i=0;i<12;i++)assert.equal(rooms.wallet('Player'+i).available,9975);
 rooms=openRooms(file,()=>0,true);assert.deepEqual(rooms(result.room,'state',tokens[0],{},undefined,qualified[0].id).hand.end,hand.hand.end);
 const rows=JSON.parse(readFileSync(file)),event=rows.find(([k])=>k==='local-battle-events')[1][settings.id];event.finalRoom='a'.repeat(48);writeFileSync(file,JSON.stringify(rows));assert.throws(()=>openRooms(file,()=>0,true),/Battle final/i);
 console.log('PASS Battle final transfer: atomic rollback, exact unequal starting stacks, fixed accounts, idempotent transfer/restart, real hand,1200 chips and unchanged wallets; orphan link rejected');
}finally{Date.now=realNow;rmSync(dir,{recursive:true,force:true})}
