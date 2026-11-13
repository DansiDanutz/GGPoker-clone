import assert from 'node:assert/strict';
import {rushPool} from './engine/rush-pool.mjs';
const entries=Array.from({length:6},(_,i)=>({id:'Fund'+i,stack:100}));let pool=rushPool(entries);
assert.equal(pool.adjustBalance('Fund0',-100),0);assert.equal(pool.total(),500);
pool=rushPool(entries,4,pool.snapshot());assert.equal(pool.players.get('Fund0').balance,0);assert.equal(pool.total(),500);
assert.equal(pool.adjustBalance('Fund0',200),200);assert.equal(pool.total(),700);const funded=pool.snapshot();pool=rushPool(entries,4,funded);assert.equal(pool.total(),700);
const before=pool.snapshot();for(const [id,amount]of [['missing',20],['Fund0',-201],['Fund0',1.5],['Fund0',NaN],['Fund0',Number.MAX_SAFE_INTEGER]])assert.throws(()=>pool.adjustBalance(id,amount));assert.equal(pool.snapshot(),before,'Rejected transfers preserve all state');
const bad=JSON.parse(funded);bad.funding++;assert.throws(()=>rushPool(entries,4,JSON.stringify(bad)),/chip total/);
for(const invalid of [1.5,null,'1',Number.MAX_SAFE_INTEGER]){const bad=JSON.parse(funded);bad.funding=invalid;assert.throws(()=>rushPool(entries,4,JSON.stringify(bad)),/funding|chip total/)}
const table=pool.deal('Fund0');assert.throws(()=>pool.adjustBalance('Fund0',20),/Finish/);assert.equal(pool.total(),700);
pool.fold('Fund0',null,false);assert.equal(pool.players.get('Fund0').table,null);assert.throws(()=>pool.adjustBalance('Fund0',20),/Finish/,'Detached players still owe settlement on their old hand');assert.equal(pool.total(),700);
while(!pool.tables.get(table).settled){const t=pool.tables.get(table),g=t.game;pool.move(t.ids[g.turn],g.price>g.bets[g.turn]?'call':'check')}
const balance=pool.players.get('Fund0').balance;if(balance)assert.equal(pool.adjustBalance('Fund0',-balance),0);const final=pool.total();pool=rushPool(entries,4,pool.snapshot());assert.equal(pool.total(),final);
console.log('PASS Rush funding primitive: waiting-only debit/credit, no active or detached unsettled transfer, exact conservation, restart and malformed/overflow rollback');
