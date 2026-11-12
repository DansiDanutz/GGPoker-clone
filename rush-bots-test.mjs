import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRush} from './rush.mjs';
const variant=process.argv.includes('--plo')?'plo':'holdem';
const dir=mkdtempSync(join(tmpdir(),'rush-bots-')),file=join(dir,'rush.json'),clock=Date.now;
let now=clock();Date.now=()=>now;
try{
 let request=openRush(file,variant);
 const state=()=>request('Solo','state');
 const send=(op,body={})=>{const s=state();return request('Solo',op,{version:s.version,handVersion:s.handVersion,...body})};
 assert.throws(()=>send('fill-bots'),/Join/);send('join');let s=send('fill-bots');
 assert.equal(s.population,12);assert.equal(s.hand.hands[s.me].length,variant==='plo'?4:2);
 if(variant==='plo')assert.throws(()=>openRush(file),/checkpoint/);assert.equal(s.names.filter(n=>n.startsWith('Computer')).length,5);
 const first=s.table,opponents=s.names.slice(1);
 s=send('quick-fold');assert.notEqual(s.table,first);assert.ok(s.names.slice(1).every(n=>!opponents.includes(n)));
 const second=s.table;request=openRush(file,variant);assert.equal(state().table,second);
 for(let i=0;i<300;i++){
  now+=1000;s=state();
  if(s.legal)send('act',{action:s.legal.due?'call':'check'});
  const saved=JSON.parse(JSON.parse(readFileSync(file,'utf8')).pool);
  if(saved.tables.every(([,t])=>t.settled))break;
 }
 const saved=JSON.parse(JSON.parse(readFileSync(file,'utf8')).pool);
 assert.equal(saved.tables.length,2);assert.ok(saved.tables.every(([,t])=>t.settled));
 assert.equal(saved.players.reduce((n,[,p])=>n+p.balance,0),2400);
 assert.ok(state().result.hand.end);request=openRush(file,variant);assert.equal(state().table,null);
 console.log('PASS solo Rush '+variant+': 11 persisted computers, quick-fold to new opponents, old/new hands complete, visible payout, recovery and 2400 chips');
}finally{Date.now=clock;rmSync(dir,{recursive:true,force:true})}
