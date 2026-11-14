import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,mkdirSync,rmdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {openRooms} from './rooms.mjs';import {spinPayouts} from './engine/spin.mjs';
const dir=mkdtempSync(join(tmpdir(),'spin-atomic-')),file=join(dir,'rooms.json'),id='c'.repeat(48);
const configuration={mode:'local-practice',outcomes:spinPayouts(5000).map(r=>({multiplier:r.multiplier,startingChips:300,timeBankCards:1,noDealing:false}))},clock={actionSeconds:12,freeTimeChipSecondsPerUnit:15,maxTimeChipsPerAction:1};
try{let r=openRooms(file,()=>0,true);r.fundSpinBank({sequence:1,amount:200000000,reason:'Atomic fixture'});
r.setSpinRules({revision:1,buyIn:5000,configuration,clock,reason:'Queue fixture'});
const command=account=>({operation:account.toLowerCase().padEnd(48,'a').replace(/[^a-f]/g,'b'),buyIn:5000,revision:1});
const enter=name=>r.queueSpin(name,command(name));
for(const name of ['Alice','Bob']){const v=enter(name);assert.equal(v.registered,name==='Alice'?1:2);assert.equal(v.decidedAt,null)}
const match=r.spinQueue('Alice')[0].id;
assert.throws(()=>r.queueSpin('Dave',{...command('Dave'),revision:2}),e=>e.status===409);
const before=readFileSync(file);mkdirSync(file+'.tmp');assert.throws(()=>enter('Carol'));rmdirSync(file+'.tmp');assert.deepEqual(readFileSync(file),before);assert.equal(r.spinRegistration(match,'Alice').registered,2);assert.equal(r.wallet('Carol').available,10000);
const v=enter('Carol');assert.equal(v.registered,3);assert.ok(v.decidedAt);const saved=readFileSync(file);assert.deepEqual(enter('Carol'),v);assert.deepEqual(readFileSync(file),saved);r=openRooms(file,()=>0,true);assert.deepEqual(enter('Carol'),v);assert.equal(r.wallet('Carol').available,5000);assert.equal(r(match,'join',null,{name:'Alice'},undefined,'Alice').names.includes('Alice'),true);console.log('PASS server-rule queue: three accounts share one table, stale revision, retry, atomic rollback and restart');
}finally{rmSync(dir,{recursive:true,force:true})}
