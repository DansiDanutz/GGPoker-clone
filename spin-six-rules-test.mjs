import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
import {spinRules} from './spin-rules.mjs';
import {spinPayouts} from './engine/spin.mjs';
const clock={actionSeconds:12,freeTimeChipSecondsPerUnit:15,maxTimeChipsPerAction:1};
const legacy={revision:1,buyIn:5000,clock,reason:'Explicit practice rules',configuration:{mode:'local-practice',outcomes:spinPayouts(5000).map(r=>({multiplier:r.multiplier,startingChips:300,timeBankCards:1,noDealing:false}))}};
const configuration={mode:'local-practice',seats:6,buyIn:5000,smallBlinds:[5,10,20],clock,outcomes:[{multiplier:4,frequency:100000000,prizeShares:[100],startingChips:300,timeBankCards:1,noDealing:false,unit:'hands',interval:10}]};
let rules=spinRules();rules.save(legacy);const old=structuredClone(rules.state);rules.save({...legacy,revision:2,configuration});assert.equal(rules.state.version,2);assert.equal(rules.summary().stakes.length,2);assert.equal(rules.summary(3).stakes.length,1);assert.equal(rules.summary(6).stakes.length,1);assert.deepEqual(rules.summary(3).stakes[0],old.stakes[0]);
const saved=structuredClone(rules.state);assert.deepEqual(rules.save({...legacy,revision:2,configuration}),rules.state.events.at(-1));assert.deepEqual(rules.state,saved);
assert.throws(()=>rules.save({...legacy,revision:3,configuration,clock:{...clock,actionSeconds:13}}),e=>e.status===400);assert.deepEqual(rules.state,saved);
rules=spinRules(JSON.parse(JSON.stringify(saved)));rules.save({...legacy,revision:3});assert.equal(rules.state.version,2);assert.equal(rules.summary(6).stakes[0].revision,2);assert.equal(rules.summary(3).stakes[0].revision,3);
for(const mutate of [s=>s.version=1,s=>s.stakes[1].configuration.buyIn++,s=>s.events[1].configuration.smallBlinds.reverse()]){const s=structuredClone(saved);mutate(s);assert.throws(()=>spinRules(s),/checkpoint/)}
assert.deepEqual(spinRules(old).state,old);console.log('PASS six-seat rules: separate same-stake formats, explicit clocks, audit/idempotence, legacy migration and restart corruption guards');

const dir=mkdtempSync(join(tmpdir(),'spin-six-rules-')),file=join(dir,'rooms.json');
try{let rooms=openRooms(file,()=>0,true);rooms.setSpinRules(legacy);rooms.fundSpinBank({sequence:1,amount:200000000,reason:'Temporary rules isolation fixture'});const entry=rooms.queueSpin('Alice',{operation:'a'.repeat(48),buyIn:5000,revision:1});rooms.setSpinRules({...legacy,revision:2,configuration});assert.equal(rooms.spinRules(3).stakes[0].revision,1);assert.equal(rooms.spinRules(6).stakes[0].revision,2);const before=readFileSync(file);assert.throws(()=>rooms.queueSpin('Bob',{operation:'b'.repeat(48),buyIn:5000,revision:2}),e=>e.status===409);assert.deepEqual(readFileSync(file),before);assert.equal(rooms.queueSpin('Bob',{operation:'b'.repeat(48),buyIn:5000,revision:1}).id,entry.id);rooms=openRooms(file,()=>0,true);assert.equal(rooms.spinRules().stakes.length,2);assert.equal(rooms.spinQueue('Alice')[0].registered,2);assert.throws(()=>rooms.setSpinRules({...legacy,revision:3}),e=>e.status===409);assert.equal(rooms.spinRules().revision,2);console.log('PASS persisted six-seat owner rules cannot enter or alter a pending three-seat queue');}finally{rmSync(dir,{recursive:true,force:true})}
