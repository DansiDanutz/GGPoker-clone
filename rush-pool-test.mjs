import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {rushPool} from './engine/rush-pool.mjs';
import {options} from './engine/table.mjs';
const entries=Array.from({length:12},(_,i)=>({id:'p'+i,stack:100}));let pool=rushPool(entries);
const first=pool.deal('p0'),old=pool.tables.get(first),next=pool.fold('p0');
assert.notEqual(next,first);assert.equal(pool.tables.get(next).game.button,1);assert.equal(old.game.end,null);assert.equal(old.game.folded[0],true);
assert.deepEqual(pool.tables.get(next).ids,['p0','p6','p7','p8','p9','p10']);
assert.equal(pool.total(),1200);
const checkpoint=pool.snapshot();pool=rushPool(entries,4,checkpoint);
assert.equal(pool.players.get('p0').table,next);assert.equal(pool.tables.get(first).game.end,null);
const restarted=spawnSync(process.execPath,['--input-type=module','-e',`
 import {rushPool} from './engine/rush-pool.mjs';
 import {options} from './engine/table.mjs';
 let input='';for await(const chunk of process.stdin)input+=chunk;
 const {entries,checkpoint}=JSON.parse(input),pool=rushPool(entries,4,checkpoint);
 for(const [id,table] of pool.tables)while(!table.game.end){const o=options(table.game);pool.move(table.ids[table.game.turn],o.due?'call':'check')}
 process.stdout.write(JSON.stringify({total:pool.total(),waiting:[...pool.players.values()].every(p=>p.table===null)}));
`],{input:JSON.stringify({entries,checkpoint}),encoding:'utf8',timeout:5000});
assert.equal(restarted.status,0,restarted.stderr);assert.deepEqual(JSON.parse(restarted.stdout),{total:1200,waiting:true});
const damaged=JSON.parse(checkpoint);damaged.players[11][1].balance++;
assert.throws(()=>rushPool(entries,4,JSON.stringify(damaged)),/chip total/);

for(const corrupt of [saved=>saved.players[1][1].table=null,saved=>saved.tables[0][1].detached.push(1),saved=>saved.tables[0][1].settled='yes']){
 const saved=JSON.parse(checkpoint);corrupt(saved);assert.throws(()=>rushPool(entries,4,JSON.stringify(saved)),/Invalid Rush/);
}

function finish(id){const table=pool.tables.get(id);while(!table.game.end){const seat=table.game.turn,o=options(table.game);pool.move(table.ids[seat],o.due?'call':'check');assert.equal(pool.total(),1200)}}
finish(first);assert.equal(pool.players.get('p0').table,next);
finish(next);assert.equal(pool.players.get('p0').table,null);assert.equal(pool.total(),1200);
assert.throws(()=>pool.move('unknown','check'));
assert.throws(()=>rushPool([{id:'a',stack:100}]));
console.log('PASS Rush pool: new opponents before old hand ends, old hand settles independently, 1200 chips retained');

const settled=pool.snapshot();pool=rushPool(entries,4,settled);assert.equal(pool.total(),1200);
console.log('PASS Rush checkpoint: active old/new hands and settled balances restore; fresh-process continuation and invalid assignments/chip totals rejected');
