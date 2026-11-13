import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,mkdirSync,rmdirSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'cash-return-')),file=join(dir,'rooms.json'),table={name:'Return',stack:120,blind:4,open:true};
try{
 let req=openRooms(file,()=>0,true);const ids=['d'.repeat(48),'e'.repeat(48)],seats=[];
 for(const id of ids){const tokens=['Alice','Bob','Carol'].map((name,seat)=>req(id,'join',null,{name,seat},table,name).issued);let s=req(id,'state',tokens[0],{},table,'Alice');req(id,'start',tokens[0],{version:s.version},table,'Alice');req(id,'sit-out',tokens[0],{paused:true},table,'Alice');req(id,'sit-out',tokens[1],{paused:true},table,'Bob');seats.push(tokens)}
 const state=(i,seat=0)=>req(ids[i],'state',seats[i][seat],{},table,['Alice','Bob','Carol'][seat]);const before=ids.map((_,i)=>structuredClone(state(i).hand)),money=req.wallet('Alice');
 assert.deepEqual(req.resumeCash('Alice'),{changed:2});assert.deepEqual(req.wallet('Alice'),money);for(let i=0;i<2;i++){assert.equal(state(i).sitOutNextHand,false);assert.equal(state(i,1).sitOutNextHand,true);assert.deepEqual(state(i).hand,before[i])}assert.deepEqual(req.resumeCash('Alice'),{changed:0});
 req=openRooms(file,()=>0,true);for(let i=0;i<2;i++)assert.equal(state(i).sitOutNextHand,false);
 for(let i=0;i<2;i++)req(ids[i],'sit-out',seats[i][0],{paused:true},table,'Alice');const saved=readFileSync(file);mkdirSync(file+'.tmp');assert.throws(()=>req.resumeCash('Alice'));rmdirSync(file+'.tmp');assert.deepEqual(readFileSync(file),saved);for(let i=0;i<2;i++)assert.equal(state(i).sitOutNextHand,true);assert.deepEqual(req.resumeCash('Alice'),{changed:2});
 assert.throws(()=>req.resumeCash(null),e=>e.status===401);assert.deepEqual(req.resumeCash('Nobody'),{changed:0});console.log('PASS atomic cash global return: two account-bound tables, other players untouched, active hands/wallet unchanged, idempotence, cold restart and failed-write rollback');
}finally{rmSync(dir,{recursive:true,force:true})}
