import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'poker-bank-')),file=join(dir,'rooms.json'),clock=Date.now;
let now=100000;Date.now=()=>now;
const table={name:'Finite bank',open:true,stack:120,blind:4,actionSeconds:5,timeBankSeconds:20,hotTimeSeconds:2},id='d'.repeat(48);
try{
 let req=openRooms(file);const tokens=[];for(let i=0;i<6;i++)tokens.push(req(id,'join',null,{name:'P'+i},table).issued);
 const watch=()=>req(id,'watch',null,{},table),own=i=>req(id,'state',tokens[i],{},table);
 let s=watch(),actor=s.hand.turn,actionId=s.hand.clock.actionId;const originalDeadline=s.hand.deadline,version=s.version;
 assert.equal(s.hand.clock.canDisableLimit,false);assert.equal(own(actor).hand.clock.canDisableLimit,true);
 assert.throws(()=>req(id,'time-bank','wrong',{actionId},table),e=>e.status===401);
 assert.throws(()=>req(id,'time-bank',tokens[(actor+1)%6],{actionId},table),e=>e.status===409);
 assert.throws(()=>req(id,'time-bank',tokens[actor],{actionId,isPaidAction:true},table),e=>e.status===400);
 now+=2000;s=req(id,'time-bank',tokens[actor],{actionId},table);assert.equal(s.version,version+1);assert.equal(s.hand.deadline,originalDeadline+15000);assert.equal(s.hand.history.length,0);
 const reserveVersion=s.version;now+=1000;s=req(id,'time-bank',tokens[actor],{actionId},table);assert.equal(s.version,reserveVersion);assert.equal(s.hand.clock.bankEndsAt-now,17000);
 req=openRooms(file);assert.equal(watch().hand.deadline,originalDeadline+15000);
 assert.throws(()=>req(id,'act',tokens[actor],{action:'check',version:reserveVersion},table),e=>e.status===400);
 now+=1000;s=req(id,'act',tokens[actor],{action:'call',version:reserveVersion},table);
 let stored=JSON.parse(readFileSync(file)).find(([key])=>key===id)[1];assert.equal(stored.players[actor].timeBankMs,16000,'Failed action cannot consume or reset bank');assert.equal(s.hand.timeBanks[actor],16000,'Inactive displayed pool equals persisted elapsed spending');
 assert.throws(()=>req(id,'time-bank',tokens[s.hand.turn],{actionId},table),e=>e.status===409);
 const nextActor=s.hand.turn;now=s.hand.deadline;req(id,'tick',null,{},table);stored=JSON.parse(readFileSync(file)).find(([key])=>key===id)[1];assert.equal(stored.players[nextActor].timeBankMs,15000);assert.equal(stored.hand.folded[nextActor],true);
 const total=watch().hand.stacks.reduce((a,b)=>a+b)+watch().hand.committed.reduce((a,b)=>a+b);assert.equal(total,720);
 console.log('PASS authenticated/action-bound finite bank, rejected paid/foreign/stale requests, idempotence, invalid-action safety, persisted restart, expiry and720-chip conservation');
}finally{Date.now=clock;rmSync(dir,{recursive:true,force:true})}
