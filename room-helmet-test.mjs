import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,mkdirSync,rmdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'helmet-')),file=join(dir,'rooms.json'),id='d'.repeat(48),table={name:'Helmet',stack:120,blind:4,open:true};
try{
 let room=openRooms(file);const a=room(id,'join',null,{name:'Alice'},table,'Alice'),b=room(id,'join',null,{name:'Bob'},table);
 let s=room(id,'state',a.issued,{},table);s=room(id,'start',a.issued,{version:s.version},table);const hand=structuredClone(s.hand);
 s=room(id,'helmet',a.issued,{muted:true},table,'Alice');assert.deepEqual(s.helmets,[true,false,false,false,false,false]);assert.deepEqual(s.hand,hand);
 const version=s.version;assert.equal(room(id,'helmet',a.issued,{muted:true},table,'Alice').version,version,'Explicit desired state is idempotent');
 assert.deepEqual(room(id,'watch',null,{},table).helmets,s.helmets,'Other viewers see the same public helmet flags');
 assert.equal(room(id,'state',b.issued,{},table).helmets[0],true);
 for(const body of [{},{muted:1},{muted:'true'},{muted:true,seat:1}])assert.throws(()=>room(id,'helmet',a.issued,body,table,'Alice'),e=>e.status===400);
 for(const token of [null,'stale'])assert.throws(()=>room(id,'helmet',token,{muted:false},table,'Alice'),e=>e.status===401);
 for(const account of [undefined,'Other'])assert.throws(()=>room(id,'helmet',a.issued,{muted:false},table,account),e=>e.status===401);
 for(const body of [{text:'Blocked'},{reaction:2}])assert.throws(()=>room(id,'chat',a.issued,body,table),e=>e.status===403);
 assert.equal(room(id,'chat',b.issued,{text:'Other players still chat'},table).chat.at(-1).text,'Other players still chat');
 room=openRooms(file);assert.equal(room(id,'state',a.issued,{},table).helmets[0],true);assert.deepEqual(room(id,'state',a.issued,{},table).hand,hand);
 mkdirSync(file+'.tmp');assert.throws(()=>room(id,'helmet',a.issued,{muted:false},table,'Alice'));rmdirSync(file+'.tmp');assert.equal(room(id,'state',a.issued,{},table).helmets[0],true,'Failed writes roll back acknowledged social state');
 const roster=room(id,'moderation',null,{},table);room(id,'moderate-chat',null,{seat:0,subject:roster[0].subject,muted:true},table);
 s=room(id,'helmet',a.issued,{muted:false},table,'Alice');assert.equal(s.helmets[0],false);assert.equal(s.chatMuted,true,'Taking helmet off cannot bypass owner moderation');assert.throws(()=>room(id,'chat',a.issued,{text:'Still blocked'},table),e=>e.status===403);
 room(id,'moderate-chat',null,{seat:0,subject:roster[0].subject,muted:false},table);room(id,'helmet',a.issued,{muted:true},table,'Alice');s=room(id,'state',a.issued,{},table);s=room(id,'act',a.issued,{version:s.version,action:'fold'},table);assert.ok(s.hand.end);assert.equal(s.hand.stacks.reduce((a,b)=>a+b),240);
 room(id,'leave',a.issued,{version:s.version},table);const replacement=room(id,'join',null,{name:'Replacement',seat:0},table);assert.equal(replacement.helmets[0],false);assert.throws(()=>room(id,'helmet',a.issued,{muted:true},table,'Alice'),e=>e.status===401);
 assert.ok(!readFileSync(file,'utf8').includes(a.issued));const saved=JSON.parse(readFileSync(file));saved.find(([key])=>key===id)[1].players[0].helmet='yes';writeFileSync(file,JSON.stringify(saved));assert.throws(()=>openRooms(file),/helmet/i);
 console.log('PASS helmet seat/account authorization,public flags,idempotence,strict payload,chat/reaction block,owner-mute separation,unchanged hand,rollback,restart,replacement and240chip payout');
}finally{rmSync(dir,{recursive:true,force:true})}
