import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,mkdirSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'reaction-history-')),file=join(dir,'rooms.json'),id='c'.repeat(48),table={name:'Reaction history',stack:120,blind:4,open:true},clock=Date.now;let now=100000;Date.now=()=>now;
try{
 let req=openRooms(file);const a=req(id,'join',null,{name:'A'},table).issued,b=req(id,'join',null,{name:'B'},table).issued;let s=req(id,'state',a,{},table);s=req(id,'start',a,{version:s.version},table);
 const before=structuredClone(s.hand);s=req(id,'chat',a,{reaction:3},table);assert.deepEqual(s.hand,before,'Reaction cannot change wagers,turn,deck or clock');
 const stored=()=>JSON.parse(readFileSync(file)).find(([key])=>key===id)[1];const event={type:'reaction',seat:0,street:0,afterAction:0,reaction:3};assert.deepEqual(stored().hand.historyEvents,[event]);
 assert.throws(()=>req(id,'chat',a,{reaction:2},table),e=>e.status===429);assert.deepEqual(stored().hand.historyEvents,[event]);
 now+=1000;mkdirSync(file+'.tmp');assert.throws(()=>req(id,'chat',a,{reaction:1},table));rmdirSync(file+'.tmp');assert.deepEqual(stored().hand.historyEvents,[event],'Failed save cannot append an event');
 assert.deepEqual(stored().hand.historyEvents,[event]);s=req(id,'state',a,{},table);s=req(id,'act',s.hand.turn===0?a:b,{version:s.version,action:'fold'},table);
 const history=()=>req(id,'notes',a,{},table).self.hands[0];assert.deepEqual(history().historyEvents,[event],'Settlement freezes accepted reaction');
 s=req(id,'chat',b,{reaction:1},table);const late={type:'reaction',seat:1,street:s.hand.board.length,afterAction:s.hand.history.length,reaction:1};assert.deepEqual(history().historyEvents,[event,late],'Post-hand reaction appends to its own completed record');
 const read=history();read.historyEvents[0].reaction=2;assert.deepEqual(history().historyEvents,[event,late]);req=openRooms(file);assert.deepEqual(history().historyEvents,[event,late]);
 for(const token of [a,b]){s=req(id,'state',token,{},table);s=req(id,'ready',token,{number:s.number,version:s.version},table)}assert.equal(stored().hand.historyEvents,undefined,'New deal cannot inherit reactions');assert.deepEqual(history().historyEvents,[event,late]);
 console.log('PASS reaction history:accepted chronology,unchanged game,rate rejection,write rollback,settlement,late reaction,immutable reads,cold restart andnewdeal isolation');
}finally{Date.now=clock;rmSync(dir,{recursive:true,force:true})}
