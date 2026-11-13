import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
globalThis.Image=class{};globalThis.document={querySelector:()=>null};globalThis.localStorage={getItem:()=>null};globalThis.addEventListener=()=>{};
const {hudColor}=await import('./felt.mjs');
const dir=mkdtempSync(join(tmpdir(),'continuation-room-')),file=join(dir,'rooms.json'),id='c'.repeat(48),table={name:'Continuation',stack:120,blind:4,open:true};
try{
 let req=openRooms(file);const tokens=Array.from({length:6},(_,i)=>req(id,'join',null,{name:'C'+i},table).issued);
 const state=i=>req(id,'state',tokens[i],{},table);
 let s=state(0);const aggressor=s.hand.turn;
 const act=(action,target)=>{s=req(id,'act',tokens[s.hand.turn],{version:s.version,action,...(target===undefined?{}:{target})},table)};
 act('raise',8);
 while(s.hand.board.length===0)act('call');
 while(s.hand.turn!==aggressor)act('check');
 act('raise',8);
 while(!s.hand.end)act(state(s.hand.turn).hand.options.due?'call':'check');
 const stats=()=>req(id,'notes',tokens[(aggressor+1)%6],{},table).players.find(p=>p.seat===aggressor).stats;
 const before=stats();assert.equal(before.flopCbOpportunities,1);assert.equal(before.flopCbBets,1);assert.equal(before.turnCbOpportunities,1);assert.equal(before.turnCbBets,0);
 const responses=req(id,'notes',tokens[aggressor],{},table).players.filter(p=>p.seat!==aggressor);for(const p of responses){assert.equal(p.stats.flopCbResponses,1);assert.equal(p.stats.flopCbCalls,1)}
 for(let i=0;i<3;i++)assert.deepEqual(stats(),before,'Reading HUD cannot increment samples');req=openRooms(file);assert.deepEqual(stats(),before,'HUD counters survive restart');
 assert.equal(s.hand.stacks.reduce((a,b)=>a+b),720);
 for(const [metric,thresholds]of Object.entries({'flop CB':[31,51,71],'flop FCB':[46,56,66],'flop CCB':[11,21,31],'flop RCB':[6,11,16],'turn CB':[36,46,56],'turn FCB':[26,36,51],'turn CCB':[16,26,36],'turn RCB':[6,11,16]}))for(const [i,color]of ['#ea7500','#e7b300','#12c012'].entries())assert.equal(hudColor(thresholds[i],metric),color);
 console.log('PASS continuation room: six real players, persisted samples, read idempotence, restart, 720-chip conservation and native flop/turn color thresholds');
}finally{rmSync(dir,{recursive:true,force:true})}
