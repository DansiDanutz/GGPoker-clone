import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'cash-short-')),id='e'.repeat(48),table={name:'Short handed',stack:120,blind:4,open:true};
try{
 let req=openRooms(join(dir,'rooms.json'));const a=req(id,'join',null,{name:'A',seat:2},table),ta=a.issued;
 assert.equal(a.canStart,false);assert.throws(()=>req(id,'start',ta,{version:a.version},table),e=>e.status===409);
 const b=req(id,'join',null,{name:'B',seat:5},table),tb=b.issued;let s=req(id,'state',ta,{},table);assert.equal(s.canStart,true);
 assert.throws(()=>req(id,'start',tb,{version:s.version},table),e=>e.status===409);
 s=req(id,'start',ta,{version:s.version},table);assert.equal(s.hand.button,2);assert.equal(s.hand.turn,2);assert.deepEqual(s.hand.committed,[0,0,2,0,0,4]);
 assert.deepEqual(s.hand.cards.map(h=>h?.length||0),[0,0,2,0,0,0]);
 const before=JSON.parse(JSON.stringify(s.hand));let c=req(id,'join',null,{name:'C',seat:0},table),tc=c.issued;
 assert.deepEqual(c.hand.dealtSeats,[2,5]);assert.deepEqual(req(id,'watch',null,{},table).hand.dealtSeats,[2,5]);assert.equal(c.waitingForHand,true);assert.equal(c.number,1);assert.deepEqual(c.hand.stacks,before.stacks);assert.deepEqual(c.hand.history,before.history);assert.deepEqual(c.hand.cards[0],[]);
 const stillPlaying=JSON.parse(JSON.stringify(req(id,'state',ta,{},table).hand));
 assert.deepEqual(req(id,'leave',tc,{version:c.version},table),{left:true});
 assert.deepEqual(req(id,'state',ta,{},table).hand,stillPlaying);assert.equal(req(id,'summary',null,{},table).occupied,2);
 assert.throws(()=>req(id,'state',tc,{},table),e=>e.status===401);req=openRooms(join(dir,'rooms.json'));
 c=req(id,'join',null,{name:'C',seat:0},table);tc=c.issued;assert.equal(c.waitingForHand,true);

 s=req(id,'state',ta,{},table);s=req(id,'act',ta,{version:s.version,action:'fold'},table);assert.ok(s.hand.end);assert.equal(s.hand.stacks.reduce((a,b)=>a+b),240);
 const settled={number:s.number,version:s.version};for(const token of [ta,tb,tc])req(id,'ready',token,settled,table);
 s=req(id,'state',ta,{},table);assert.equal(s.number,2);assert.equal(s.hand.button,5);assert.deepEqual(s.hand.stacks.map((v,i)=>v+s.hand.committed[i]),[120,0,118,0,0,122]);
 assert.equal(s.hand.stacks.reduce((a,b,i)=>a+b+s.hand.committed[i],0),360);
 req=openRooms(join(dir,'rooms.json'));assert.equal(!!req(id,'state',tc,{},table).waitingForHand,false);
 for(const [index,mode] of ['plo','plo5','plo6','shortdeck','aof'].entries()){
  const key=String(index+1).repeat(48),t={...table,mode},last=mode==='aof'?3:5;
  const first=req(key,'join',null,{name:'First',seat:1},t),other=req(key,'join',null,{name:'Other',seat:last},t),tokens={1:first.issued,[last]:other.issued};
  let game=req(key,'state',first.issued,{},t);game=req(key,'start',first.issued,{version:game.version},t);
  assert.equal(game.hand.button,1);assert.equal(game.hand.cards[1].length,({plo:4,plo5:5,plo6:6})[mode]||2);
  if(mode==='plo6'){const before=[...game.hand.stacks];for(const seat of [0,2,3,4])req(key,'join',null,{name:'Reserved '+seat,seat},t);game=req(key,'state',first.issued,{},t);assert.equal(game.number,1);assert.deepEqual(game.hand.stacks,before);assert.equal(game.names.filter(Boolean).length,6)}
  for(let n=0;n<30&&!game.hand.end;n++){const seat=game.hand.turn,own=req(key,'state',tokens[seat],{},t),o=own.hand.options;req(key,'act',tokens[seat],{version:own.version,action:mode==='aof'?'allin':o.raise?'raise':o.due?'call':'check',target:o.max},t);game=req(key,'state',first.issued,{},t)}
  assert.ok(game.hand.end);assert.equal(game.hand.stacks.reduce((a,b)=>a+b),240);for(let i=0;i<game.names.length;i++)if(!game.names[i])assert.equal(game.hand.committed[i],0);
 }
 console.log('PASS sparse cash: host-only minimum-two start, correct heads-up blinds, empty-seat privacy, late-join reservation, funded next hand, button rotation and restart');
}finally{rmSync(dir,{recursive:true,force:true})}
