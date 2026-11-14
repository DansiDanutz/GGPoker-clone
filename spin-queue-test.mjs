import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,mkdirSync,rmdirSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {openRooms} from './rooms.mjs';import {spinPayouts} from './engine/spin.mjs';
const dir=mkdtempSync(join(tmpdir(),'spin-atomic-')),file=join(dir,'rooms.json'),id='c'.repeat(48);
const configuration={mode:'local-practice',outcomes:spinPayouts(5000).map(r=>({multiplier:r.multiplier,startingChips:300,timeBankCards:1,noDealing:false}))},clock={actionSeconds:12,freeTimeChipSecondsPerUnit:15,maxTimeChipsPerAction:1};
try{let r=openRooms(file,()=>0,true);r.fundSpinBank({sequence:1,amount:200000000,reason:'Atomic fixture'});
r.setSpinRules({revision:1,buyIn:5000,configuration,clock,insurance:{premium:5000,payout:10000},reason:'Queue fixture'});
const command=account=>({operation:account.toLowerCase().padEnd(48,'a').replace(/[^a-f]/g,'b'),buyIn:5000,revision:1});
const enter=name=>r.queueSpin(name,command(name));
for(const name of ['Alice','Bob']){const v=enter(name);assert.equal(v.registered,name==='Alice'?1:2);assert.equal(v.decidedAt,null);assert.deepEqual(v.insuranceTerms,{premium:5000,payout:10000})}
const match=r.spinQueue('Alice')[0].id;const originalTerms=r.spinRegistration(match,'Alice');originalTerms.insuranceTerms.payout=1;assert.equal(r.spinRegistration(match,'Alice').insuranceTerms.payout,10000);assert.throws(()=>r.setSpinRules({revision:2,buyIn:5000,configuration,clock,insurance:{premium:6000,payout:12000},reason:'Cannot alter pending terms'}),e=>e.status===409);
assert.throws(()=>r.queueSpin('Dave',{...command('Dave'),revision:2}),e=>e.status===409);
const before=readFileSync(file);mkdirSync(file+'.tmp');assert.throws(()=>enter('Carol'));rmdirSync(file+'.tmp');assert.deepEqual(readFileSync(file),before);assert.equal(r.spinRegistration(match,'Alice').registered,2);assert.equal(r.wallet('Carol').available,10000);
const v=enter('Carol');assert.equal(v.registered,3);assert.ok(v.decidedAt);const saved=readFileSync(file);assert.deepEqual(enter('Carol'),v);assert.deepEqual(readFileSync(file),saved);r=openRooms(file,()=>0,true);assert.deepEqual(enter('Carol'),v);assert.equal(r.wallet('Carol').available,5000);assert.equal(r(match,'join',null,{name:'Alice'},undefined,'Alice').names.includes('Alice'),true);assert.throws(()=>r.queueSpin('Dave',command('Alice')),e=>e.status===409);
assert.throws(()=>r.queueSpin('Alice',{...command('Alice'),buyIn:10000}),e=>e.status===409);
r.setSpinRules({revision:2,buyIn:10000,configuration:{...configuration,outcomes:spinPayouts(10000).map(row=>({multiplier:row.multiplier,startingChips:300,timeBankCards:1,noDealing:false}))},clock,reason:'Other stake does not stale current stake'});
const pending=r.queueSpin('Dave',command('Dave'));assert.deepEqual(pending.insuranceTerms,{premium:5000,payout:10000});assert.equal(pending.revision,1);assert.equal(pending.registered,1);r.cancelSpinRegistration(pending.id,'Dave');assert.equal(r.queueSpin('Dave',command('Dave')).entry.cancelled,true);assert.equal(r.wallet('Dave').available,10000);
r.setSpinRules({revision:3,buyIn:5000,configuration,clock,insurance:{premium:6000,payout:12000},reason:'Future insurance terms'});assert.deepEqual(r.spinRegistration(match,'Alice').insuranceTerms,{premium:5000,payout:10000});r=openRooms(file,()=>0,true);assert.deepEqual(r.spinRegistration(match,'Alice').insuranceTerms,{premium:5000,payout:10000});
const corrupt=new Map(JSON.parse(readFileSync(file)));corrupt.get('local-spin-entries')[0].queueInsurance.payout=12000;const bad=join(dir,'bad.json');writeFileSync(bad,JSON.stringify([...corrupt]));assert.throws(()=>openRooms(bad,()=>0,true),/Spin queue rules differ from audit/);
console.log('PASS server-rule queue: three accounts share one table, stale revision, retry, atomic rollback and restart');
}finally{rmSync(dir,{recursive:true,force:true})}
