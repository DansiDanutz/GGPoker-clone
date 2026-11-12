import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync,mkdirSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'cash-leave-')),file=join(dir,'rooms.json'),id='f'.repeat(48),table={name:'Leave test',stack:120,blind:4,open:true};
try{
 let req=openRooms(file);const tokens=[];for(let i=0;i<6;i++)tokens.push(req(id,'join',null,{name:'Player '+i},table).issued);
 const read=()=>req(id,'state',tokens[1],{},table);
 let s=read();assert.throws(()=>req(id,'leave',tokens[0],{version:s.version},table),e=>e.status===409);
 for(let n=0;n<6&&!s.hand.end;n++){req(id,'act',tokens[s.hand.turn],{version:s.version,action:'fold'},table);s=read()}
 assert.ok(s.hand.end);const balances=[...s.hand.stacks],number=s.number;
 mkdirSync(file+'.tmp');assert.throws(()=>req(id,'leave',tokens[0],{version:s.version},table));rmdirSync(file+'.tmp');assert.ok(read().hand.end);assert.equal(JSON.parse(readFileSync(file))[0][1].cashOuts,undefined);
 const left=req(id,'leave',tokens[0],{version:s.version},table);assert.equal(left.left,true);assert.equal(left.cashOut,balances[0]);
 assert.equal(read().hand,null);assert.deepEqual(read().waitingStacks,balances.map((v,i)=>i===0?null:v));assert.equal(req(id,'summary',null,{},table).occupied,5);
 const summary=req(id,'summary',null,{},table);for(let i=1;i<6;i++)assert.equal(summary.seats[i].stack,balances[i]);
 const saved=JSON.parse(readFileSync(file))[0][1];assert.equal(saved.cashOuts.at(-1).chips,balances[0]);assert.equal(saved.waitingStacks.filter(v=>v!==null).reduce((a,b)=>a+b,0)+left.cashOut,720);
 req=openRooms(file);assert.throws(()=>req(id,'state',tokens[0],{},table),e=>e.status===401);
 const replacement=req(id,'join',null,{name:'Replacement',seat:0},table);assert.equal(replacement.number,number+1);assert.equal(replacement.hand.button,1);
 assert.deepEqual(replacement.hand.stacks.map((v,i)=>v+replacement.hand.committed[i]),balances.map((v,i)=>i===0?120:v||120));
 assert.deepEqual(replacement.hand.cards.map(Boolean),[true,false,false,false,false,false]);assert.equal(replacement.results.length,1);
 assert.throws(()=>req(id,'leave',tokens[0],{version:replacement.version},table),e=>e.status===401);
 console.log('PASS cash leave: active-hand rejection, exact cash-out ledger, other stacks conserved, persisted vacancy/token revocation, replacement, dealer/hand progression and private new cards');
}finally{rmSync(dir,{recursive:true,force:true})}
