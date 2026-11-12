import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,mkdirSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRush} from './rush.mjs';
const dir=mkdtempSync(join(tmpdir(),'rush-service-')),file=join(dir,'rush.json');
try{
 let request=openRush(file);
 const send=(id,op,body={})=>request(id,op,{version:request(id,'state').version,handVersion:request(id,'state').handVersion,...body});
 for(let i=0;i<12;i++)send('p'+i,'join');
 let state=send('p0','deal');const old=state.table;
 assert.equal(state.hand.hands.filter(Boolean).length,1);assert.equal(state.hand.deck,undefined);
 assert.throws(()=>request('p0','act',{version:-1,action:'call'}),/Refresh/);
 const oldAction={handVersion:state.handVersion,version:state.version};
 state=send('p0','quick-fold');const next=state.table;
 assert.throws(()=>request('p0','quick-fold',oldAction),/Refresh Rush state/);
 assert.notEqual(next,old);assert.deepEqual(state.names,['p0','p6','p7','p8','p9','p10']);
 request=openRush(file);assert.equal(request('p0','state').table,next);
 for(const participant of ['p1','p0']){
  for(let i=0;i<100;i++){
   state=request(participant,'state');if(!state.hand)break;
   const actor=state.names[state.hand.turn],view=request(actor,'state');
   send(actor,'act',{action:view.legal.due?'call':'check'});
  }
  assert.equal(request(participant,'state').table,null);
 }
 const saved=JSON.parse(readFileSync(file,'utf8')),pool=JSON.parse(saved.pool);
 assert.equal(pool.players.reduce((n,[,p])=>n+p.balance,0),2400);
 assert.equal(request('p0','state').hand,null);
 const version=request('p0','state').version;
 mkdirSync(file+'.tmp');assert.throws(()=>send('p0','deal'));rmdirSync(file+'.tmp');
 assert.equal(request('p0','state').version,version);assert.equal(request('p0','state').table,null);
 assert.ok(send('p0','deal').table);
 console.log('PASS Rush service: 12 players, private cards, immediate new opponents, restart, both payouts, 2400 chips, failed-write rollback');
}finally{rmSync(dir,{recursive:true,force:true})}
