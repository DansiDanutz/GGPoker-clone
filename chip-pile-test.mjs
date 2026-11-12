import assert from 'node:assert/strict';
import {playChipLayout,aofBetParts} from './chip-shuffle.mjs';
import {startHand,act} from './engine/table.mjs';
assert.deepEqual(playChipLayout([32]),[
 {raw:'1000',x:-18,y:-18},{raw:'1000',x:-18,y:-23},{raw:'5000',x:-18,y:-28},{raw:'25000',x:-18,y:-33}
]);
assert.deepEqual(playChipLayout([2,30]).map(c=>[c.raw,c.x]),[['1000',-18],['1000',-18],['5000',23],['25000',23]]);
assert.deepEqual(playChipLayout([2,30],false,'right').map(c=>c.x),[-18,-18,-59,-59]);
assert.deepEqual(playChipLayout([32],true,'center').map(c=>[c.raw,c.x]),[['25000',-59],['5000',-18],['1000',23],['1000',23]]);
assert.equal(playChipLayout([24]).length,7,'Native bet stack clips at seven visible chips');
assert.equal(playChipLayout([24],true,'center').length,8,'Native pot groups by denomination');
assert.equal(playChipLayout([Number.MAX_SAFE_INTEGER]).length,7,'Safe integer boundary stays bounded');
for(const bad of [[-1],[1.2],[NaN],['2'],[Number.MAX_SAFE_INTEGER+1]])assert.throws(()=>playChipLayout(bad),RangeError);
assert.deepEqual(playChipLayout([]),[]);assert.deepEqual(playChipLayout([0]),[]);
for(const stacks of [[32,32,32,32],[32,32,3,32],[32,0,32,0]]){
 const g=startHand(stacks,4,0,'aof');
 for(let n=0;n<8&&!g.end;n++){
  for(let i=0;i<4;i++)assert.equal(aofBetParts(g,i,g.bets[i]).reduce((a,b)=>a+b,0),g.bets[i]);
  act(g,g.turn===1?'fold':'allin');
 }
 assert.ok(g.end);for(let i=0;i<4;i++)assert.equal(aofBetParts(g,i,g.committed[i]).reduce((a,b)=>a+b,0),g.committed[i]);
}
const g=startHand([32,32,32,32],4,0,'aof');act(g,'allin');act(g,'allin');act(g,'allin');
assert.deepEqual(aofBetParts(g,1,g.committed[1]),[2,30]);
assert.deepEqual(aofBetParts({...g,history:[]},1,32),[32],'Incomplete history uses the known total');

for(const [stacks,want]of [[[20,32,20,20],[2,18]],[[1,32,1,1],[1]]]){const h=startHand(stacks,4,0,'aof');for(let n=0;n<8&&!h.end;n++)act(h,'allin');assert.ok(h.end);assert.deepEqual(aofBetParts(h,1,h.committed[1]-h.end.returns[1]),want,'Uncalled removal must trim the newest native increment first')}

console.log('PASS native play-chip denominations, increment groups, mirrored piles, caps, safe integer bounds and AoF blind/history replay');
