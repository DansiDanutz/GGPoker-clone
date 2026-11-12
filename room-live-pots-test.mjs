import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'playgg-live-pots-')),file=join(dir,'rooms.json'),id='a'.repeat(48);
try{
 let req=openRooms(file);const tokens=[];
 for(let i=0;i<4;i++)tokens.push(req(id,'join',null,{name:'Player'+i}).issued);
 const read=()=>req(id,'state',tokens[0],{});
 const move=(action,target)=>{const s=read(),i=s.hand.turn;if(action==='allin'){action='raise';target=s.hand.bets[i]+s.hand.stacks[i]}return req(id,'act',tokens[i],{action,target,version:s.version})};
 assert.deepEqual(read().hand.pots,[],'Posted blinds are outstanding, not collected pots');
 move('call');move('allin');move('call');move('call');move('call');
 assert.equal(read().hand.board.length,3);assert.deepEqual(read().hand.pots,[{amount:120,eligible:[0,1,2,3]}]);
 move('allin');move('call');move('call');
 const turn=read();assert.equal(turn.hand.board.length,4);assert.equal(turn.hand.end,null);
 assert.deepEqual(turn.hand.pots,[{amount:120,eligible:[0,1,2,3]},{amount:120,eligible:[1,2,3]}]);
 assert.deepEqual(turn.hand.cards.slice(1),[null,null,null],'Pot visibility must not reveal hole cards');
 req=openRooms(file);assert.deepEqual(read().hand.pots,turn.hand.pots,'Live pot grouping must survive restart');
 move('raise',10);const betting=read();assert.equal(betting.hand.committed.reduce((a,b)=>a+b),250);
 assert.deepEqual(betting.hand.pots,turn.hand.pots,'Uncollected turn bet must not inflate the stored piles');
 move('call');const river=read();assert.equal(river.hand.board.length,5);
 assert.deepEqual(river.hand.pots.map(p=>p.amount),[120,120,20]);
 while(!read().hand.end)move('check');
 const done=read();assert.deepEqual(done.hand.pots,done.hand.end.pots);
 assert.equal(done.hand.pots.reduce((sum,p)=>sum+p.amount,0),260);
 assert.equal(done.hand.stacks.reduce((sum,n)=>sum+n,0),300);
 console.log('PASS live main/side pots, outstanding-bet exclusion, three streets, opponent privacy and restart');
}finally{rmSync(dir,{recursive:true,force:true})}
