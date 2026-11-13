import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openRooms} from './rooms.mjs';
const realNow=Date.now;let now=realNow();Date.now=()=>now;
const dir=mkdtempSync(join(tmpdir(),'aof-')),file=join(dir,'rooms.json'),id='a'.repeat(48);
try{
 let room=openRooms(file);const table={id:'test',name:'AoF test',mode:'aof',stack:32,blind:4,open:true};
 const req=(op,token,body={})=>room(id,op,token,body,table);
 let s=req('join',null,{name:'Player'});assert.equal(s.names.length,4);const token=s.issued;
 s=req('fill-bots',token,{version:s.version});
 for(let n=0;!s.hand.end&&n<30;n++){now+=500;s=req('state',token);if(s.hand.turn===0)s=req('act',token,{version:s.version,action:'allin'})}
 assert.ok(s.hand.end);assert.equal(s.hand.stacks.reduce((a,b)=>a+b),128);
 room=openRooms(file);assert.deepEqual(req('state',token).hand.stacks,s.hand.stacks);
 assert.equal(req('summary').capacity,4);assert.equal(req('summary').allInPercent,100);
 const saved=JSON.parse(readFileSync(file,'utf8'));delete saved[0][1].results[0].allIn;writeFileSync(file,JSON.stringify(saved));room=openRooms(file);
 assert.equal(req('summary').allInPercent,null);
 const beforeChat=req('state',token);const chatted=req('chat',token,{text:'Hello <script>test</script>'});
 assert.equal(chatted.chat.at(-1).text,'Hello <script>test</script>');
 assert.deepEqual(chatted.hand,beforeChat.hand);assert.equal(req('watch').chat.at(-1).name,'Player');
 assert.throws(()=>req('chat',token,{text:''}),/1–280/);
 room=openRooms(file);assert.equal(req('state',token).chat.length,1);
 const other='b'.repeat(48);
 const join=(body)=>room(other,'join',undefined,body,table);
 assert.throws(()=>join({name:'Invalid',seat:0.5}),/Invalid seat/);
 assert.equal(JSON.parse(readFileSync(file,'utf8')).some(([id])=>id===other),false);

 const chosen=join({name:'Chosen',seat:2});assert.equal(chosen.me,2);
 const second=join({name:'Second',seat:0});
 assert.equal(room(other,'state',chosen.issued,{},table).canFill,true);
 assert.equal(room(other,'state',second.issued,{},table).canFill,false);
 assert.throws(()=>room(other,'fill-bots',second.issued,{version:second.version},table),/first seated player/);
 room=openRooms(file);assert.equal(room(other,'state',chosen.issued,{},table).canFill,true);

 const say=(token,text)=>room(other,'chat',token,{text},table);
 const reacted=room(other,'chat',chosen.issued,{reaction:3},table);assert.equal(reacted.chat.at(-1).reaction,3);assert.equal(reacted.chat.at(-1).text,'Laughing');
 assert.throws(()=>room(other,'chat',second.issued,{reaction:99},table),/Unknown reaction/);
 const reactionVersion=room(other,'state',second.issued,{},table).version;
 for(const reaction of ['3',null,[],{}, {toString:null},1.5])assert.throws(()=>room(other,'chat',second.issued,{reaction},table),/Unknown reaction/);
 assert.equal(room(other,'state',second.issued,{},table).version,reactionVersion);

 say(second.issued,'Two');
 assert.throws(()=>say(chosen.issued,'Three'),/Wait before/);
 assert.throws(()=>say(undefined,'Unauthorized'),e=>e.status===401);
 assert.throws(()=>say(second.issued,'x'.repeat(281)),/1–280/);

 assert.throws(()=>join({name:'Other',seat:2}),/occupied/);
 assert.throws(()=>join({name:'Outside',seat:4}),/Invalid seat/);
 console.log('PASS: selected seat 3, occupied seat rejected, fractional/out-of-range seats rejected');
 console.log('PASS: hosted four-seat AoF, three computers, all-in showdown, 128 chips, persisted recovery');
}finally{Date.now=realNow;rmSync(dir,{recursive:true,force:true})}
