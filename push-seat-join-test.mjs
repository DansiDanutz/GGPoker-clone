import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'push-join-')),file=join(dir,'rooms.json'),id='e'.repeat(48),table={name:'Push Seat automatic admission',stack:120,minBuyIn:60,maxBuyIn:240,blind:4,open:true,pushSeatHands:10};
try{
 let rooms=openRooms(file,()=>0,true);const a=rooms(id,'join',null,{name:'Alice',seat:0,buyIn:120},table,'Alice').issued;rooms(id,'join',null,{name:'Bob',seat:1,buyIn:120},table,'Bob');
 const own=(op='state',body={})=>rooms(id,op,a,body,table,'Alice');let s=own();s=own('start',{version:s.version});own('push-seat',{version:s.version,number:s.number,sequence:1,target:3});
 assert.throws(()=>rooms(id,'join',null,{name:'Blocked',seat:2,buyIn:120},table,'Blocked'),e=>e.status===409);assert.equal(rooms.wallet('Blocked').available,10000);
 rooms=openRooms(file,()=>0,true);
 const c=rooms(id,'join',null,{name:'Cara',buyIn:120},table,'Cara');assert.equal(c.me,4,'Automatic seating skips the entire pending rotation interval');assert.equal(rooms.wallet('Cara').available,9880);
 const d=rooms(id,'join',null,{name:'Dan',buyIn:120},table,'Dan');assert.equal(d.me,5);assert.equal(rooms.wallet('Dan').available,9880);assert.equal(d.seatBalances.reduce((n,v)=>n+(v||0),0)+d.hand.committed.reduce((n,v)=>n+v,0),480);
 assert.throws(()=>rooms(id,'join',null,{name:'Full',buyIn:120},table,'Full'),e=>e.status===409);assert.equal(rooms.wallet('Full').available,10000);
 s=own();own('push-seat-cancel',{version:s.version,number:s.number,sequence:1});const e=rooms(id,'join',null,{name:'Eve',buyIn:120},table,'Eve');assert.equal(e.me,2,'Cancellation restores the first newly available seat');
 rooms=openRooms(file,()=>0,true);for(const [name,token]of [['Cara',c.issued],['Dan',d.issued],['Eve',e.issued]]){const state=rooms(id,'state',token,{},table,name);rooms(id,'leave',token,{version:state.version},table,name);assert.equal(rooms.wallet(name).available,10000)}
 console.log('PASS automatic cash seating:pending rotation interval skipped,explicit blocked seat rejected,restart,capacity exhaustion,cancel releases seats,no rejected debit and once-only waiting-seat cashout');
}finally{rmSync(dir,{recursive:true,force:true})}
