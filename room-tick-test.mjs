import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'poker-tick-')),clock=Date.now;let now=clock();Date.now=()=>now;
const table={name:'Clock',stack:120,blind:4,open:true},id='b'.repeat(48),file=join(dir,'rooms.json');
try{
 let req=openRooms(file);const tokens=[];for(let i=0;i<6;i++)tokens.push(req(id,'join',null,{name:'P'+i},table).issued);
 const watch=()=>req(id,'watch',null,{},table),tick=()=>req(id,'tick',null,{},table);
 let s=watch();assert.equal(s.hand.deadline-now,90000);const actor=s.hand.turn,version=s.version;now=s.hand.deadline-1;tick();assert.equal(watch().version,version);
 now++;tick();s=watch();assert.equal(s.hand.folded[actor],true);assert.equal(s.hand.history.length,1);
 req=openRooms(file);assert.equal(watch().hand.folded[actor],true);
 const freeID='e'.repeat(48),freeTokens=[];for(let i=0;i<6;i++)freeTokens.push(req(freeID,'join',null,{name:'Free'+i},table).issued);
 let free=req(freeID,'watch',null,{},table);
 for(let n=0;n<6&&free.hand.turn!==2;n++){const i=free.hand.turn;req(freeID,'act',freeTokens[i],{action:'call',version:free.version},table);free=req(freeID,'watch',null,{},table)}
 assert.equal(free.hand.turn,2);now=free.hand.deadline;req(freeID,'tick',null,{},table);free=req(freeID,'watch',null,{},table);assert.equal(free.hand.history.at(-1),'Seat 3: check');assert.equal(free.hand.folded[2],false);
 const botID='c'.repeat(48);let b=req(botID,'join',null,{name:'Host'},table);const botToken=b.issued;b=req(botID,'fill-bots',botToken,{version:b.version},table);
 const before=req(botID,'watch',null,{},table).hand.history.length;
 for(let n=0;n<100;n++)req(botID,'state',botToken,{},table);
 assert.equal(req(botID,'watch',null,{},table).hand.history.length,before,'Polling must not accelerate computers');
 now+=499;req(botID,'tick',null,{},table);assert.equal(req(botID,'watch',null,{},table).hand.history.length,before);
 req=openRooms(file);now++;req(botID,'tick',null,{},table);const after=req(botID,'watch',null,{},table);assert.equal(after.hand.history.length,before+1);
 assert.equal(req(botID,'tick',null,{},table).me,null);
 assert.equal(req('d'.repeat(48),'tick',null,{},table),null);
 const customID='f'.repeat(48),custom={...table,actionSeconds:5};for(let i=0;i<6;i++)req(customID,'join',null,{name:'Timed'+i},custom);
 let timed=req(customID,'watch',null,{},custom);assert.equal(timed.settings.actionSeconds,5);assert.equal(timed.hand.deadline-now,5000);const savedDeadline=timed.hand.deadline;req=openRooms(file);assert.equal(req(customID,'watch',null,{},custom).hand.deadline,savedDeadline);now=savedDeadline-1;req(customID,'tick',null,{},custom);assert.equal(req(customID,'watch',null,{},custom).hand.history.length,0);now++;req(customID,'tick',null,{},custom);timed=req(customID,'watch',null,{},custom);assert.equal(timed.hand.history.length,1);assert.equal(timed.hand.deadline-now,5000);
 const shortBotID='a'.repeat(48);let shortBot=req(shortBotID,'join',null,{name:'Timed host'},custom);shortBot=req(shortBotID,'fill-bots',shortBot.issued,{version:shortBot.version},custom);const botHistory=shortBot.hand.history.length;now+=499;req(shortBotID,'tick',null,{},custom);assert.equal(req(shortBotID,'watch',null,{},custom).hand.history.length,botHistory);now++;req(shortBotID,'tick',null,{},custom);assert.equal(req(shortBotID,'watch',null,{},custom).hand.history.length,botHistory+1);
 console.log('PASS configured5-second turn, exact expiry/restart/next turn and unchanged500ms computer pacing');
 console.log('PASS hosted ticks: exact deadline, fold/check policy, persisted recovery, computer progression with no player requests, private timer view and no empty cash-room creation');
}finally{Date.now=clock;rmSync(dir,{recursive:true,force:true})}
