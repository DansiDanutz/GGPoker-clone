import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {blindLevel} from './blind-level.mjs';
import {openRooms} from './rooms.mjs';
import {startHand,act} from './engine/table.mjs';
for(const [now,level,bigBlind] of [[0,1,4],[1999,1,4],[2000,2,8],[80000,7,256]])
  assert.deepEqual(blindLevel(1000,now,1000),{level,bigBlind});
const h=startHand([0,75,0,325],8,1);
assert.deepEqual(h.bets,[0,4,0,8]);assert.equal(h.turn,1);assert.deepEqual(h.hands.map(x=>x.length),[0,2,0,2]);
act(h,'call');act(h,'check');assert.equal(h.turn,3);
const dir=mkdtempSync(join(tmpdir(),'freezeout-'));
try{
 const request=openRooms(join(dir,'rooms.json')),id='b'.repeat(48);
 const joinSeat=(name,token)=>request(id,'join',token,{name,mode:'tournament'});
 let s=joinSeat('A');const a=s.issued;
 assert.equal(joinSeat('A',a).tournament.pool,25);
 const b=joinSeat('B');request(id,'leave',b.issued,{version:b.version});
 assert.equal(request(id,'state',a,{}).tournament.pool,25);
 joinSeat('C');joinSeat('D');s=joinSeat('E');
 assert.equal(s.tournament.pool,100);assert.equal(s.tournament.level,1);
 assert.throws(()=>joinSeat('late'),/full/);assert.throws(()=>request(id,'leave',a,{version:s.version}),/before/);
}finally{rmSync(dir,{recursive:true,force:true})}
console.log('PASS: schedule boundaries and cap, heads-up blinds, registration, withdrawal and lockout');
