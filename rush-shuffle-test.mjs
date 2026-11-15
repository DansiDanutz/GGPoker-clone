import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRush} from './rush.mjs';
for(const variant of ['holdem','plo']){
 const dir=mkdtempSync(join(tmpdir(),'rush-shuffle-')),file=join(dir,'rush.json'),realNow=Date.now;let now=realNow();Date.now=()=>now;
 try{
  let rush=openRush(file,variant);
  assert.throws(()=>rush('Unknown','shuffle',{table:1}),e=>e.status===409);
  for(let i=0;i<12;i++)rush('P'+i,'join',{version:rush('P'+i,'state').version});
  rush('P0','deal',{version:rush('P0','state').version});
  const initial=rush('P0','state'),table=initial.table,hand=structuredClone(initial.hand),bytes=readFileSync(file),peer=initial.names.find(n=>n!=='P0');
  for(const body of [{},{table:7.5},{table,version:-1},{table,extra:true}]){
   assert.throws(()=>rush('P0','shuffle',body),e=>e.status===400);
  }
  assert.throws(()=>rush('P0','shuffle',{table:table+1000}),e=>e.status===409);
  let s=rush('P0','shuffle',{table,version:initial.version,handVersion:initial.handVersion});
  assert.deepEqual(s.hand,hand);assert.deepEqual(s.shuffles,[{seat:initial.me,at:now}]);assert.deepEqual(readFileSync(file),bytes,'Cosmetic event must not write game or wallet data');
  assert.deepEqual(rush(peer,'state').shuffles,s.shuffles);assert.equal(JSON.stringify(s.shuffles).includes('P0'),false);
  assert.throws(()=>rush('P0','shuffle',{table}),e=>e.status===429);
  now+=2450;assert.deepEqual(rush(peer,'state').shuffles,[]);
  now+=550;s=rush('P0','shuffle',{table});assert.equal(s.shuffles[0].at,now);
  rush=openRush(file,variant);assert.deepEqual(rush(peer,'state').shuffles,[],'Restart must not replay cosmetic events');
  s=rush('P0','quick-fold',{handVersion:rush('P0','state').handVersion});
  assert.notEqual(s.table,table);assert.deepEqual(s.shuffles,[]);
  assert.throws(()=>rush('P0','shuffle',{table}),e=>e.status===409,'Queued command must not follow the player to another table');
  console.log('PASS Rush '+variant+' shuffle:strict payload/table lease/rate/expiry,peer event without identity leak,unchanged hand/disk,restart no replay and rematch isolation');
 }finally{Date.now=realNow;rmSync(dir,{recursive:true,force:true})}
}
