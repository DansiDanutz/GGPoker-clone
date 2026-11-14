import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,mkdirSync,rmdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {openRooms} from './rooms.mjs';import {spinPayouts} from './engine/spin.mjs';
const dir=mkdtempSync(join(tmpdir(),'spin-atomic-')),file=join(dir,'rooms.json'),id='c'.repeat(48);
const configuration={mode:'local-practice',outcomes:spinPayouts(5000).map(r=>({multiplier:r.multiplier,startingChips:300,timeBankCards:1,noDealing:false}))},clock={actionSeconds:12,freeTimeChipSecondsPerUnit:15,maxTimeChipsPerAction:1};
try{let r=openRooms(file,()=>0,true);r.fundSpinBank({sequence:1,amount:200000000,reason:'Atomic fixture'});
const command=account=>({id,buyIn:5000,account,configuration});
for(const name of ['Alice','Bob']){const v=r.enterSpinTable(command(name),clock);assert.equal(v.registered,name==='Alice'?1:2);assert.equal(v.decidedAt,null)}
const before=readFileSync(file);mkdirSync(file+'.tmp');assert.throws(()=>r.enterSpinTable(command('Carol'),clock));rmdirSync(file+'.tmp');assert.deepEqual(readFileSync(file),before);assert.equal(r.spinRegistration(id,'Alice').registered,2);assert.equal(r.wallet('Carol').available,10000);
const v=r.enterSpinTable(command('Carol'),clock);assert.equal(v.registered,3);assert.ok(v.decidedAt);const saved=readFileSync(file);assert.deepEqual(r.enterSpinTable(command('Carol'),clock),v);assert.deepEqual(readFileSync(file),saved);r=openRooms(file,()=>0,true);assert.deepEqual(r.enterSpinTable(command('Carol'),clock),v);assert.equal(r.wallet('Carol').available,5000);assert.equal(r(id,'join',null,{name:'Alice'},undefined,'Alice').names.includes('Alice'),true);console.log('PASS atomic third entry/draw/table, retry, rollback and restart');
}finally{rmSync(dir,{recursive:true,force:true})}
