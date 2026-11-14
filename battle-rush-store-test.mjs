import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,rmdirSync,readFileSync,existsSync,statSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {openBattleRush} from './battle-rush-store.mjs';
const dir=mkdtempSync(join(tmpdir(),'battle-rush-store-')),file=join(dir,'event.json'),entries=Array.from({length:12},(_,i)=>({id:'p'+i,stack:100})),config={eventId:'durable-battle',blind:4,finalSeats:6,startedAt:1000,rushEndsAt:2000};
try{
 mkdirSync(file+'.tmp');assert.throws(()=>openBattleRush(file,entries,config));assert.equal(existsSync(file),false);rmdirSync(file+'.tmp');
 let event=openBattleRush(file,entries,config),sessions=event.sessions(),raw=readFileSync(file);assert.equal(statSync(file).mode&0o777,0o600);assert.equal(event.revision(),0);
 mkdirSync(file+'.tmp');assert.throws(()=>event.deal(0,'p0',sessions.p0,1000));rmdirSync(file+'.tmp');assert.deepEqual(readFileSync(file),raw);assert.equal(event.view('p0',sessions.p0).table,null);assert.equal(event.revision(),0);
 const stale=openBattleRush(file,entries,config),first=event.deal(0,'p0',sessions.p0,1000).table;assert.equal(event.revision(),1);raw=readFileSync(file);
 assert.throws(()=>event.fold(0,'p0',sessions.p0,first,1100),/revision/);assert.throws(()=>stale.tick(0,2000),/writer/);assert.deepEqual(readFileSync(file),raw);
 event=openBattleRush(file,entries,config);assert.deepEqual(event.sessions(),sessions);assert.equal(event.view('p0',sessions.p0).table,first);
 mkdirSync(file+'.tmp');assert.throws(()=>event.fold(1,'p0',sessions.p0,first,1100));rmdirSync(file+'.tmp');assert.deepEqual(readFileSync(file),raw);assert.equal(event.view('p0',sessions.p0).table,first);assert.equal(event.total(),1200);
 const next=event.fold(1,'p0',sessions.p0,first,1100).table;assert.notEqual(next,first);assert.equal(event.revision(),2);
 raw=readFileSync(file);mkdirSync(file+'.tmp');assert.throws(()=>event.tick(2,2000));rmdirSync(file+'.tmp');assert.equal(event.phase(),'rush');assert.equal(event.revision(),2);assert.deepEqual(readFileSync(file),raw);
 event.tick(2,2000);assert.equal(event.phase(),'draining');const revision=event.revision();raw=readFileSync(file);event.tick(revision,2000);assert.equal(event.revision(),revision);assert.deepEqual(readFileSync(file),raw);
 event=openBattleRush(file,entries,config);assert.equal(event.phase(),'draining');assert.equal(event.total(),1200);assert.equal(event.view('p0',sessions.p0).table,next);
 const restarted=spawnSync(process.execPath,['--input-type=module','-e',`import {openBattleRush} from './battle-rush-store.mjs';let text='';for await(const c of process.stdin)text+=c;const {file,entries,config}=JSON.parse(text),e=openBattleRush(file,entries,config);process.stdout.write(JSON.stringify({revision:e.revision(),phase:e.phase(),total:e.total(),sessions:e.sessions()}))`],{input:JSON.stringify({file,entries,config}),encoding:'utf8',timeout:5000});assert.equal(restarted.status,0,restarted.stderr);assert.deepEqual(JSON.parse(restarted.stdout),{revision:event.revision(),phase:'draining',total:1200,sessions});
 assert.throws(()=>openBattleRush(file,entries,{...config,eventId:'wrong'}),/checkpoint/);assert.equal(existsSync(file+'.tmp'),false);
 console.log('PASS private atomic Battle Rush store: initial/later write rollback, session/hand restart, stale revision and writer rejection, idempotent clock,1200chips and no cash-wallet writes');
}finally{rmSync(dir,{recursive:true,force:true})}
