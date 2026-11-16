import assert from 'node:assert/strict';import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';import {join} from 'node:path';import {tmpdir} from 'node:os';
import {openRush} from './rush.mjs';
const directory=mkdtempSync(join(tmpdir(),'rush-voice-')),realNow=Date.now;Date.now=()=>1800000000000;
try{for(const variant of ['holdem','plo']){
 const selected=new Map([['A','VGreg'],['B','VDoyle'],['C','VDaniel'],['D','VKevin'],['E','VMichael'],['F','VEmma']]),file=join(directory,variant+'.json'),voice=id=>selected.get(id);let request=openRush(file,variant,()=>0,null,null,voice);
 const state=id=>request(id,'state'),send=(id,op,body={})=>{const current=state(id);return request(id,op,{version:current.version,handVersion:current.handVersion,...body})};
 for(const id of selected.keys())send(id,'join');send('A','deal');let current=state('A');assert.deepEqual(current.hand.voiceEvents,[]);
 const actor=current.names[current.hand.turn],prior=selected.get(actor);send(actor,'act',{action:'raise',target:8});selected.set(actor,'VSophia');current=state('A');assert.equal(current.hand.voiceEvents[0].voicePackId,prior);
 request=openRush(file,variant,()=>0,null,null,voice);assert.equal(state('A').hand.voiceEvents[0].voicePackId,prior);
 let steps=0;while((current=state('A')).hand){assert.ok(steps++<40);const id=current.names[current.hand.turn],own=state(id);send(id,'act',{action:own.legal.due?'call':'check'})}
 const result=state('A').result.hand;assert.ok(result.end);assert.equal(result.stacks.reduce((sum,n)=>sum+n,0),1200);assert.ok(result.voiceEvents.some(event=>event.voicePackId==='VSophia'));assert.equal(result.voiceEvents[0].voicePackId,prior);assert.equal(result.voiceActionCount,result.historyTrace.actions.length);
 const raw=readFileSync(file),saved=JSON.parse(raw),pool=JSON.parse(saved.pool);pool.tables[0][1].game.historyTrace.actions[0].voicePackId='../invalid';saved.pool=JSON.stringify(pool);writeFileSync(file,JSON.stringify(saved));assert.throws(()=>openRush(file,variant,()=>0,null,null,voice),/Invalid Rush action voice/);writeFileSync(file,raw);
 const quickFile=join(directory,variant+'-quick.json');request=openRush(quickFile,variant,()=>0,null,null,voice);for(const id of selected.keys())send(id,'join');send('A','deal');send('A','quick-fold');const quick=JSON.parse(JSON.parse(readFileSync(quickFile)).pool).tables[0][1].game.historyTrace.actions.at(-1);assert.equal(quick.action,'fold');assert.equal(quick.voicePackId,'VGreg');
 }
 console.log('PASS Rush Holdem/PLO event-time voice stamps:profile changes,mid-hand restart,complete1200chip hands,settled event transport,invalid checkpoint rejection and out-of-turn quick fold attribution');
}finally{Date.now=realNow;rmSync(directory,{recursive:true,force:true})}
