import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync,mkdirSync,rmdirSync} from 'node:fs';
import {join} from 'node:path';import {tmpdir} from 'node:os';
import {openRooms} from './rooms.mjs';
const directory=mkdtempSync(join(tmpdir(),'voice-stamp-')),file=join(directory,'rooms.json'),id='a'.repeat(48),selected=new Map([['A','VGreg'],['B','VDoyle'],['C','VDaniel'],['D','VKevin']]);
const realNow=Date.now;let now=1800000000000;Date.now=()=>now;
const voice=account=>selected.get(account);
try{
 let request=openRooms(file,()=>0,false,voice);const tokens=[];
 for(const account of ['A','B','C','D'])tokens.push(request(id,'join',null,{name:'Alias'+account},undefined,account).issued);
 const read=()=>request(id,'state',tokens[0],{}),move=(action,target)=>{const state=read();return request(id,'act',tokens[state.hand.turn],{version:state.version,action,target})};
 assert.deepEqual(read().hand.voiceEvents,[]);move('raise',100);
 assert.equal(read().hand.voiceEvents[0].voicePackId,'VKevin');assert.equal(read().hand.voiceEvents[0].cue,'VoiceAllinKevin');
 const bytes=readFileSync(file);selected.set('D','VSophia');assert.equal(read().voicePacks[3],'VSophia');assert.equal(read().hand.voiceEvents[0].voicePackId,'VKevin');assert.deepEqual(readFileSync(file),bytes);
 request=openRooms(file,()=>0,false,voice);assert.equal(read().hand.voiceEvents[0].voicePackId,'VKevin');selected.set('A','VEmma');move('call');move('call');move('call');
 const state=read();assert.ok(state.hand.end);assert.deepEqual(state.hand.voiceEvents.map(event=>event.cue),['VoiceAllinKevin','VoiceCallEmma','VoiceCallDoyle','VoiceCallDaniel']);assert.equal(state.hand.voiceActionCount,4);assert.equal(state.hand.stacks.reduce((sum,n)=>sum+n,0),300);assert.deepEqual(request(id,'state',tokens[1],{}).hand.voiceEvents,state.hand.voiceEvents);
 assert.ok(state.hand.voiceEvents.every(event=>Object.keys(event).sort().join(',')==='cue,index,seat,street,voicePackId'));assert.equal('historyTrace'in state.hand,false);
 const raw=readFileSync(file),saved=JSON.parse(raw),room=saved.find(([key])=>key===id)[1];assert.deepEqual(room.hand.historyTrace.actions.map(action=>action.voicePackId),['VKevin','VEmma','VDoyle','VDaniel']);
 room.hand.historyTrace.actions[0].voicePackId='../bad';writeFileSync(file,JSON.stringify(saved));assert.throws(()=>openRooms(file,()=>0,false,voice),/Invalid action voice/);writeFileSync(file,raw);request=openRooms(file,()=>0,false,voice);assert.deepEqual(read().hand.voiceEvents,state.hand.voiceEvents);
 const botId='b'.repeat(48),table={name:'Voice bots',stack:120,blind:4,open:true},host=request(botId,'join',null,{name:'Host'},table,'A').issued;let bots=request(botId,'state',host,{},table);request(botId,'fill-bots',host,{version:bots.version},table);now+=600;bots=request(botId,'tick',null,{},table);assert.ok(bots.hand.voiceActionCount>0);const botSaved=JSON.parse(readFileSync(file)).find(([key])=>key===botId)[1];assert.ok(botSaved.hand.historyTrace.actions.every(action=>action.voicePackId==='VDaniel'));assert.deepEqual(request(botId,'watch',null,{},table).hand.voiceEvents,bots.hand.voiceEvents);
 const timedId='c'.repeat(48),timedTokens=[];for(const account of ['A','B'])timedTokens.push(request(timedId,'join',null,{name:account},table,account).issued);
 let timed=request(timedId,'state',timedTokens[0],{},table);timed=request(timedId,'start',timedTokens[0],{version:timed.version},table);const actor=timed.hand.turn,beforeFailed=readFileSync(file);
 mkdirSync(file+'.tmp');try{assert.throws(()=>request(timedId,'act',timedTokens[actor],{version:timed.version,action:'call'},table))}finally{rmdirSync(file+'.tmp')}
 assert.deepEqual(readFileSync(file),beforeFailed);assert.equal(request(timedId,'state',timedTokens[0],{},table).hand.voiceActionCount,0,'Failed persistence must roll back unacknowledged voice stamps');
 now=JSON.parse(readFileSync(file)).find(([key])=>key===timedId)[1].deadline+1;timed=request(timedId,'tick',null,{},table);
 const expired=JSON.parse(readFileSync(file)).find(([key])=>key===timedId)[1];assert.equal(expired.hand.historyTrace.actions[0].voicePackId,selected.get(['A','B'][actor]));assert.equal(timed.hand.voiceActionCount,1);assert.deepEqual(timed.hand.voiceEvents,[],'Clock fold before flop stays silent but retains the action cursor');
 console.log('PASS actual room event-time voice stamps:profile changes cannot rewrite prior cues,mid-hand restart,all-in Call/actor identity,300chips,minimal observer parity,invalid restored stamp rejection,bot default,clock expiry and failed-write rollback');
}finally{Date.now=realNow;rmSync(directory,{recursive:true,force:true})}
