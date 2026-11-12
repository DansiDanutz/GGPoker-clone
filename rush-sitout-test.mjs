import assert from 'node:assert/strict';import {mkdtempSync,readFileSync,rmSync} from 'node:fs';import {join} from 'node:path';import {tmpdir} from 'node:os';import {openRush} from './rush.mjs';import {rushPool} from './engine/rush-pool.mjs';
const variant=process.argv.includes('--plo')?'plo':'holdem';
const dir=mkdtempSync(join(tmpdir(),'rush-pause-')),file=join(dir,'rush.json');
try{
 let rush=openRush(file,variant);for(let i=0;i<12;i++)rush('P'+i,'join',{version:rush('P'+i,'state').version});rush('P0','deal',{version:rush('P0','state').version});
 const initial=rush('P0','state');rush('P0','sit-out',{version:initial.version,paused:true});let s=rush('P0','state');assert.equal(s.paused,true);assert.deepEqual(s.hand,initial.hand,'Reservation cannot fold or bet');assert.throws(()=>rush('P0','sit-out',{version:s.version,paused:'true'}),e=>e.status===400);assert.throws(()=>rush('P0','sit-out',{version:initial.version,paused:false}),e=>e.status===409);
 rush('P0','sit-out',{version:s.version,paused:false});assert.equal(rush('P0','state').paused,false);rush('P0','sit-out',{version:rush('P0','state').version,paused:true});rush=openRush(file,variant);s=rush('P0','state');assert.equal(s.paused,true,'Reservation survives restart');rush('P0','quick-fold',{handVersion:s.handVersion});s=rush('P0','state');assert.equal(s.table,null);assert.equal(s.queued,false);assert.equal(s.paused,true);assert.equal(s.balance,200);
 rush('P6','deal',{version:rush('P6','state').version});assert.ok(!rush('P6','state').names.includes('P0'),'Other matchmaker cannot select paused player');
 let old=rush('P1','state');while(old.table){const actor=old.names[old.hand.turn],v=rush(actor,'state');rush(actor,'act',{handVersion:v.handVersion,action:'fold'});old=rush('P1','state')}
 const saved=JSON.parse(readFileSync(file));assert.equal(rushPool(saved.entries,4,saved.pool,variant).total(),2400);rush('P0','deal',{version:rush('P0','state').version});s=rush('P0','state');assert.equal(s.paused,false);assert.ok(s.table);assert.ok(s.names.includes('P0'));
 console.log('PASS Rush sit-out:reserve/cancel without action,validation/restart,quick-fold skips rematch/queue,other matching excludes paused player,explicit return and2400 chips');
}finally{rmSync(dir,{recursive:true,force:true})}
