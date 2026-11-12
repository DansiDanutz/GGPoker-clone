import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,writeFileSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
import {ownerBackup} from './owner-backup.mjs';
const dir=mkdtempSync(join(tmpdir(),'room-notes-')),file=join(dir,'rooms.json'),id='f'.repeat(48),table={name:'Notes',stack:120,blind:4,open:true};
try{
 let req=openRooms(file),tokens=[];for(let i=0;i<6;i++)tokens.push(req(id,'join',null,{name:'P'+i},table).issued);
 const read=i=>req(id,'state',tokens[i],{},table),notes=i=>req(id,'notes',tokens[i],{},table);
 let before=read(0),target=notes(0).players.find(p=>p.seat===1);assert.throws(()=>req(id,'notes','bad',{},table),e=>e.status===401);
 const result=req(id,'notes',tokens[0],{seat:1,subject:target.subject,text:'Only mine',color:6},table);assert.equal(result.players.find(p=>p.seat===1).text,'Only mine');assert.equal(notes(2).players.find(p=>p.seat===1).text,'');assert.equal('noteSubjects' in req(id,'watch',null,{},table),false);assert.ok(!JSON.stringify(req(id,'watch',null,{},table)).includes('Only mine'));assert.equal(read(0).version,before.version);assert.deepEqual(read(0).hand,before.hand);
 req=openRooms(file);assert.equal(notes(0).players.find(p=>p.seat===1).text,'Only mine');assert.throws(()=>req(id,'notes',tokens[0],{seat:0,text:'self',color:1},table),e=>e.status===400);
 let s=read(0);while(!s.hand.end){const i=s.hand.turn,own=read(i);s=req(id,'act',tokens[i],{version:own.version,action:own.hand.options.due?'fold':'check'},table)}
 req(id,'leave',tokens[1],{version:s.version},table);tokens[1]=req(id,'join',null,{name:'P1'},table).issued;assert.equal(notes(0).players.find(p=>p.seat===1).text,'');assert.throws(()=>req(id,'notes',tokens[0],{seat:1,subject:target.subject,text:'stale',color:1},table),e=>e.status===409);
 const botID='b'.repeat(48);let host=req(botID,'join',null,{name:'Host'},table),token=host.issued;host=req(botID,'fill-bots',token,{version:host.version},table);const bot=req(botID,'notes',token,{},table).players[0];req(botID,'notes',token,{seat:bot.seat,subject:bot.subject,text:'Computer note',color:3},table);req=openRooms(file);assert.equal(req(botID,'notes',token,{},table).players[0].text,'Computer note');
 const stored=JSON.parse(readFileSync(file));for(const [,r]of stored)for(const p of r.players)if(p?.bot)delete p.noteId;writeFileSync(file,JSON.stringify(stored));const oldVersion=host.version;req=openRooms(file);assert.equal(req(botID,'state',token,{},table).version,oldVersion,'Legacy bot identity migration preserves game version');
 const accountID='a'.repeat(48),secondID='c'.repeat(48);
 let owner=req(accountID,'join',null,{name:'Owner'},table,'Owner'),opponent=req(accountID,'join',null,{name:'Opponent'},table,'Opponent');
 assert.throws(()=>req(accountID,'notes',owner.issued,{},table),e=>e.status===401);
 const accountTarget=req(accountID,'notes',owner.issued,{},table,'Owner').players[0];req(accountID,'notes',owner.issued,{seat:1,subject:accountTarget.subject,text:'Across rooms',color:2},table,'Owner');
 let newOwner=req(secondID,'join',null,{name:'Owner'},table,'Owner');req(secondID,'join',null,{name:'Opponent'},table,'Opponent');assert.equal(req(secondID,'notes',newOwner.issued,{},table,'Owner').players[0].text,'Across rooms');assert.throws(()=>req(secondID,'notes',newOwner.issued,{},table,'Opponent'),e=>e.status===401);
 const backup=ownerBackup(dir,'POST',null,[]);assert.ok(backup.files.includes('rooms.json.notes.json'));assert.ok(ownerBackup(dir,'GET',backup.id,[]).files.some(f=>f.name==='rooms.json.notes.json'));const snapshot=JSON.parse(readFileSync(join(dir,'backups',backup.id+'.json')));assert.equal(Buffer.from(snapshot.files.find(f=>f.name==='rooms.json.notes.json').content,'base64').toString(),readFileSync(file+'.notes.json','utf8'));
 console.log('PASS note seat auth/privacy, unchanged wager/version, restart, same-name replacement/stale-subject rejection, bot IDs and metadata-only legacy migration');
}finally{rmSync(dir,{recursive:true,force:true})}
