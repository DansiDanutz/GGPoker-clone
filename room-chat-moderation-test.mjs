import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,mkdirSync,rmdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'chat-owner-')),file=join(dir,'rooms.json'),id='b'.repeat(48),table={name:'Moderation',stack:120,blind:4,open:true};
try{
 let room=openRooms(file);assert.deepEqual(room(id,'moderation',null,{},table),[]);
 const a=room(id,'join',null,{name:'Speaker'},table,'Speaker'),b=room(id,'join',null,{name:'Guest'},table),token=a.issued;
 let s=room(id,'state',token,{},table);s=room(id,'start',token,{version:s.version},table);const hand=JSON.parse(JSON.stringify(s.hand));
 let roster=room(id,'moderation',null,{},table);assert.equal(roster[0].accountBound,true);assert.equal(roster[1].accountBound,false);assert.deepEqual(Object.keys(roster[0]).sort(),['accountBound','muted','name','seat','subject']);
 for(const body of [{seat:0,muted:'true'},{seat:0.5,muted:true}])assert.throws(()=>room(id,'moderate-chat',null,body,table),e=>e.status===400);
 const command={seat:0,subject:roster[0].subject,muted:true};assert.throws(()=>room(id,'moderate-chat',null,{...command,subject:'stale'},table),e=>e.status===409);
 assert.equal(room(id,'moderate-chat',null,command,table).changed,true);assert.equal(room(id,'moderate-chat',null,command,table).changed,false);
 for(const body of [{text:'blocked'},{reaction:1},{text:'bypass',muted:false}])assert.throws(()=>room(id,'chat',token,body,table),e=>e.status===403);
 assert.deepEqual(room(id,'state',token,{},table).hand,hand);room(id,'chat',b.issued,{text:'Other player can chat'},table);
 room=openRooms(file);assert.equal(room(id,'state',token,{},table).chatMuted,true);
 mkdirSync(file+'.tmp');assert.throws(()=>room(id,'moderate-chat',null,{...command,muted:false},table));rmdirSync(file+'.tmp');assert.equal(room(id,'state',token,{},table).chatMuted,true);
 s=room(id,'state',token,{},table);s=room(id,'act',token,{version:s.version,action:'fold'},table);assert.ok(s.hand.end);room(id,'leave',token,{version:s.version},table);
 const returned=room(id,'join',null,{name:'Speaker',seat:0},table,'Speaker');assert.equal(returned.chatMuted,true);assert.throws(()=>room(id,'chat',returned.issued,{text:'still blocked'},table),e=>e.status===403);
 roster=room(id,'moderation',null,{},table);room(id,'moderate-chat',null,{seat:0,subject:roster[0].subject,muted:false},table);assert.equal(room(id,'chat',returned.issued,{text:'Allowed again'},table).chat.at(-1).text,'Allowed again');
 s=room(id,'state',b.issued,{},table);const guestSubject=room(id,'moderation',null,{},table).find(p=>p.seat===1).subject;room(id,'leave',b.issued,{version:s.version},table);const replacement=room(id,'join',null,{name:'Replacement',seat:1},table);assert.throws(()=>room(id,'moderate-chat',null,{seat:1,subject:guestSubject,muted:true},table),e=>e.status===409);assert.equal(!!replacement.chatMuted,false);
 assert.ok(!readFileSync(file,'utf8').includes(token));console.log('PASS chat moderation: precise occupant guard, text/reaction enforcement, no hand effects, idempotence, restart/write rollback, account mute across rejoin, unmute and no raw seat token');
}finally{rmSync(dir,{recursive:true,force:true})}
