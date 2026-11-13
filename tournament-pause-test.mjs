import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'tournament-pause-')),file=join(dir,'rooms.json'),realNow=Date.now;let now=100000;Date.now=()=>now;
try{
 let room=openRooms(file);const id='c'.repeat(48),table={id:'paused',name:'Pause test',mode:'tournament',tournamentSeats:3,stack:100,blind:4,open:true,levelSeconds:10},players=[];
 const state=()=>room(id,'state',players[0].issued,{},table),control=action=>room(id,'tournament-control',null,{tableId:table.id,action,version:state().version},table);
 for(let i=0;i<3;i++)players.push(room(id,'join',null,{name:'Player '+i},table));
 const initial=state();assert.equal(initial.tournament.startedAt,now);
 mkdirSync(file+'.tmp');assert.throws(()=>control('pause'));rmSync(file+'.tmp',{recursive:true});assert.equal(state().tournament.pauseRequested,undefined);
 let result=control('pause');assert.equal(result.pauseRequested,true);assert.equal(result.paused,false);
 assert.deepEqual(state().hand,initial.hand);assert.equal(control('pause').changed,false);
 assert.throws(()=>room(id,'tournament-control',null,{action:'resume',version:initial.version},table),/changed/);
 control('resume');assert.equal(state().tournament.pauseRequested,undefined);control('pause');
 while(!state().hand.end){let s=state(),token=players[s.hand.turn].issued;s=room(id,'state',token,{},table);room(id,'act',token,{version:s.version,action:'fold'},table)}
 let paused=state();assert.equal(paused.tournament.pausedAt,now);assert.equal(paused.tournament.nextDealAt,null);assert.equal(paused.number,1);
 const stacks=paused.hand.stacks;now+=60000;room(id,'tick',null,{},table);assert.equal(state().number,1);assert.deepEqual(state().hand.stacks,stacks);
 room=openRooms(file);assert.equal(state().tournament.pausedAt,100000);control('resume');assert.equal(state().tournament.startedAt,160000);assert.equal(state().tournament.nextDealAt,163000);assert.equal(control('resume').changed,false);
 now+=3000;room(id,'tick',null,{},table);assert.equal(state().number,2);assert.equal(state().tournament.level,1);
 while(!state().hand.end){let s=state(),token=players[s.hand.turn].issued;s=room(id,'state',token,{},table);room(id,'act',token,{version:s.version,action:'fold'},table)}
 now+=1000;control('pause');const delay=state().tournament.pauseDelayMs;assert.equal(delay,2000);now+=30000;control('resume');assert.equal(state().tournament.nextDealAt,now+delay);
 assert.throws(()=>room(id,'tournament-control',null,{action:'bad',version:state().version},table),/pause or resume/);
 assert.equal(state().hand.stacks.reduce((a,b)=>a+b,0),300);
 const saved=readFileSync(file,'utf8'),packed=JSON.parse(saved);packed.find(([key])=>key===id)[1].tournament.pausedAt=-1;writeFileSync(file,JSON.stringify(packed));assert.throws(()=>openRooms(file),/Invalid tournament pause/);writeFileSync(file,saved);
 now=state().tournament.nextDealAt;room(id,'tick',null,{},table);control('pause');
 let terminal=state();for(let n=0;n<200&&terminal.tournament.winner===null;n++){
  if(terminal.hand.end){control('resume');now=state().tournament.nextDealAt;room(id,'tick',null,{},table);terminal=state();if(terminal.tournament.winner===null)control('pause');terminal=state();continue}
  const token=players[terminal.hand.turn].issued,v=room(id,'state',token,{},table),o=v.hand.options;terminal=room(id,'act',token,{version:v.version,action:o.raise?'raise':o.due?'call':'check',target:o.max},table);
 }
 assert.notEqual(terminal.tournament.winner,null);assert.equal(terminal.tournament.pausedAt,undefined);assert.equal(terminal.tournament.pauseRequested,undefined);assert.equal(terminal.tournament.prizes.reduce((a,b)=>a+b),75);assert.throws(()=>control('pause'),/running tournament/);

 console.log('PASS tournament pause: queued/cancel/idempotence/stale guard, hand preservation, frozen blind clock, persisted pause/restart, remaining deal delay and 300 chips');
}finally{Date.now=realNow;rmSync(dir,{recursive:true,force:true})}
