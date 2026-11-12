import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'hud-room-')),file=join(dir,'rooms.json'),id='d'.repeat(48),table={name:'HUD',stack:120,blind:4,open:true};
try{
 let req=openRooms(file);const tokens=[];for(let i=0;i<6;i++)tokens.push(req(id,'join',null,{name:'P'+i},table).issued);
 const state=i=>req(id,'state',tokens[i],{},table),notes=()=>req(id,'notes',tokens[0],{},table),stats=()=>notes().players.find(p=>p.seat===1).stats;
 assert.deepEqual(stats(),{hands:0,wins:0,voluntary:0});
 const play=()=>{let s=state(0);while(!s.hand.end){const i=s.hand.turn;s=req(id,'act',tokens[i],{version:s.version,action:s.hand.options?.due?'call':state(i).hand.options.due?'call':'check'},table)}return s};
 let s=play();assert.equal(stats().hands,1);assert.equal(stats().voluntary,1);const saved=stats(),version=state(0).version;for(let i=0;i<4;i++)assert.deepEqual(stats(),saved);assert.equal(state(0).version,version,'Reads never increment counters or change table version');req=openRooms(file);assert.deepEqual(stats(),saved);
 for(let n=0;n<21;n++){s=state(0);for(let i=0;i<6;i++)s=req(id,'ready',tokens[i],{number:s.number,version:s.version},table);s=play()}
 assert.equal(s.results.length,20);assert.equal(stats().hands,22,'Counts survive truncated hand history');assert.equal(notes().players.find(p=>p.seat===1).hands.length,22,'Private history is independent of20 retained public results');
 req(id,'leave',tokens[1],{version:s.version},table);tokens[1]=req(id,'join',null,{name:'P1'},table).issued;assert.deepEqual(stats(),{hands:0,wins:0,voluntary:0},'Same-name replacement never inherits old statistics');
 req=openRooms(file);assert.equal(stats().hands,0);const watch=req(id,'watch',null,{},table);assert.equal('hud' in watch,false);assert.equal('hudSubjects' in watch.hand,false);assert.equal('hudRecorded' in watch.hand,false);assert.equal('hud' in watch.hand,false);
 assert.ok(JSON.parse(readFileSync(file)).find(([key])=>key===id)[1].hud,'Counts persisted in the same room checkpoint');
 const accountId='a'.repeat(48),accountTokens=[];for(let i=0;i<6;i++)accountTokens.push(req(accountId,'join',null,{name:'A'+i},table,'A'+i).issued);
 let a=req(accountId,'state',accountTokens[0],{},table);while(!a.hand.end){const actor=a.hand.turn,own=req(accountId,'state',accountTokens[actor],{},table);a=req(accountId,'act',accountTokens[actor],{version:a.version,action:own.hand.options.due?'fold':'check'},table)}
 const accountStats=()=>req(accountId,'notes',accountTokens[0],{},table,'A0').players.find(p=>p.seat===1).stats;
 const beforeRotation=accountStats();assert.equal(beforeRotation.hands,1);accountTokens[1]=req(accountId,'join',null,{name:'A1'},table,'A1').issued;assert.deepEqual(accountStats(),beforeRotation,'Account token rotation retains identity');req=openRooms(file);assert.deepEqual(accountStats(),beforeRotation);
 assert.throws(()=>req(accountId,'notes',accountTokens[0],{},table,'A1'),e=>e.status===401);
 console.log('PASS identity-bound HUD counts:22 hands, history truncation, restart, same-name replacement and private ledger');
}finally{rmSync(dir,{recursive:true,force:true})}
