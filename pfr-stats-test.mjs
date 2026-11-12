import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
const directory=mkdtempSync(join(tmpdir(),'pfr-stats-')),file=join(directory,'rooms.json'),id='f'.repeat(48),table={name:'PFR',stack:120,blind:4,open:true};
try{
 let request=openRooms(file);const tokens=[];for(let i=0;i<6;i++)tokens.push(request(id,'join',null,{name:'P'+i},table).issued);
 const state=i=>request(id,'state',tokens[i],{},table),stats=i=>request(id,'notes',tokens[i],{},table).self.stats;
 const act=(action,target)=>{const g=state(0);return request(id,'act',tokens[g.hand.turn],{version:g.version,action,target},table)};
 assert.equal(state(0).hand.turn,3);act('raise',8);act('raise',12);act('fold');for(let i=0;i<3;i++)act('call');assert.equal(state(0).hand.turn,3);act('raise',16);
 while(!state(0).hand.end){const g=state(state(0).hand.turn);act(g.hand.options.due?'call':'check')}
 for(let i=0;i<6;i++){assert.equal(stats(i).pfrHands,1,'One known PFR hand per dealt player');assert.equal(stats(i).preflopRaises,[3,4].includes(i)?1:0,'Count a raiser once, including repeated raises')}
 const saved=stats(3);request=openRooms(file);assert.deepEqual(stats(3),saved);assert.deepEqual(stats(3),saved,'Reads cannot increment PFR');
 const legacy=JSON.parse(readFileSync(file)),room=legacy[0][1];for(const row of Object.values(room.hud)){delete row.pfrHands;delete row.preflopRaises}writeFileSync(file,JSON.stringify(legacy));request=openRooms(file);
 let g=state(0);for(let i=0;i<6;i++)g=request(id,'ready',tokens[i],{version:g.version,number:g.number},table);
 while(!state(0).hand.end){const own=state(state(0).hand.turn);act(own.hand.options.due?'call':'check')}
 assert.equal(stats(3).hands,2);assert.equal(stats(3).pfrHands,1,'Legacy hands are not counted as known no-raise hands');assert.equal(stats(3).preflopRaises,0);
 const {preflopRaised}=await import('./engine/table.mjs');globalThis.Image=class{};globalThis.document={querySelector:()=>null};globalThis.localStorage={getItem:()=>null};globalThis.addEventListener=()=>{};const {hudPercent,hudColor}=await import('./felt.mjs');
 const hand={hands:[['Ac','Kd'],['Qh','Qs']],history:['raise','raise','raise'],historyTrace:{actions:[{seat:0,street:0,action:'raise'},{seat:0,street:0,action:'raise'},{seat:1,street:3,action:'raise'}]}};
 assert.equal(preflopRaised(null,0),null);assert.equal(preflopRaised({...hand,historyTrace:{actions:hand.historyTrace.actions.map((a,i)=>i?{...a,street:2}:a)}},0),null);assert.equal(preflopRaised(hand,0),true);assert.equal(preflopRaised(hand,1),false);assert.equal(preflopRaised({...hand,historyTrace:null},0),null);assert.equal(preflopRaised({...hand,history:[]},0),null);
 assert.equal(hudPercent(1,3),33);assert.equal(hudColor(30,'PFR'),'#e7b300');assert.equal(hudColor(31,'PFR'),'#12c012');assert.equal(hudColor(35),'#e7b300');assert.equal(hudColor(36),'#12c012');for(const pair of [[0,0],[null,1],[2,1],[-1,2],[1,1.5]])assert.equal(hudPercent(...pair),null);
 console.log('PASS PFR: open/re-raise counted once, postflop raises excluded, all dealt seats, reads/restart, explicit legacy sample and invalid/unknown data');
}finally{rmSync(directory,{recursive:true,force:true})}
