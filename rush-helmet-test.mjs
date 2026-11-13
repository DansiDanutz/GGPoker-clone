import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync,mkdirSync,rmdirSync} from 'node:fs';
import {join} from 'node:path';import {tmpdir} from 'node:os';
import {openRush} from './rush.mjs';import {rushPool} from './engine/rush-pool.mjs';
for(const variant of ['holdem','plo']){
 const dir=mkdtempSync(join(tmpdir(),'rush-helmet-')),file=join(dir,'rush.json');
 try{
  let rush=openRush(file,variant);assert.throws(()=>rush('Unknown','helmet',{muted:true}),e=>e.status===409);
  rush('P0','join',{version:0});let s=rush('P0','helmet',{muted:true});assert.equal(s.helmet,true);assert.equal(s.me,null);assert.equal(s.balance,200);const version=s.version;assert.equal(rush('P0','helmet',{muted:true}).version,version);
  for(const body of [{},{muted:1},{muted:true,id:'P1'},{muted:false,version:-1}])assert.throws(()=>rush('P0','helmet',body),e=>e.status===400);
  for(let i=1;i<12;i++)rush('P'+i,'join',{version:rush('P'+i,'state').version});rush('P0','deal',{version:rush('P0','state').version});s=rush('P0','state');const hand=structuredClone(s.hand),table=s.table;assert.equal(s.helmets[s.me],true);const peer=s.names.find(n=>n!=='P0'),their=rush(peer,'state');assert.equal(their.helmets[their.names.indexOf('P0')],true);assert.equal(their.helmet,false);
  s=rush('P0','helmet',{muted:false,version:0,handVersion:'old-table'});assert.deepEqual(s.hand,hand);assert.equal(s.table,table);assert.equal(s.helmet,false,'Session metadata does not bind a stale physical table');
  mkdirSync(file+'.tmp');assert.throws(()=>rush('P0','helmet',{muted:true}));rmdirSync(file+'.tmp');assert.equal(rush('P0','state').helmet,false,'Failed write rolls back');
  rush('P0','helmet',{muted:true});s=rush('P0','state');s=rush('P0','quick-fold',{handVersion:s.handVersion});assert.notEqual(s.table,table);assert.equal(s.helmet,true);assert.equal(s.helmets[s.me],true,'Helmet follows the same account into the rematched table');
  const rematched=structuredClone(s.hand);s=rush('P0','helmet',{muted:false,handVersion:table+':0'});assert.equal(s.helmet,false);assert.deepEqual(s.hand,rematched);rush('P0','helmet',{muted:true});
  rush=openRush(file,variant);s=rush('P0','state');assert.equal(s.helmet,true);assert.equal(s.helmets[s.me],true);const saved=JSON.parse(readFileSync(file));assert.equal(rushPool(saved.entries,4,saved.pool,variant).total(),2400);saved.entries.find(p=>p.id==='P0').helmet='yes';writeFileSync(file,JSON.stringify(saved));assert.throws(()=>openRush(file,variant),/helmet/i);
  console.log('PASS Rush '+variant+' Helmet:standby,own/public flags,idempotence,payload guards,no hand change,rollback,quick-fold rematch,restart and2400chips');
 }finally{rmSync(dir,{recursive:true,force:true})}
}
