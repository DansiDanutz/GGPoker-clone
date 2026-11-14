import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,mkdirSync,rmdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {openRooms,noteSubject} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'battle-player-note-')),file=join(dir,'rooms.json'),config={id:'note-event',name:'Note Event',capacity:6,stack:100,blind:4,finalSeats:3,rushDurationMs:60000,entryCost:0};
try{
 let rooms=openRooms(file,()=>0,true);rooms.createBattleEvent(config);rooms.registerBattleEvent(config.id,'Target');const game=readFileSync(file);
 const read=viewer=>rooms.battlePlayerNote(config.id,'target',viewer),write=(viewer,text,color=6)=>rooms.battlePlayerNote(config.id,'target',viewer,{viewer:viewer.toLowerCase(),text,color});
 assert.throws(()=>read(null),e=>e.status===401);assert.throws(()=>read('Target'),e=>e.status===400);assert.throws(()=>rooms.battlePlayerNote(config.id,'absent','ViewerA'),e=>e.status===404);
 assert.equal(read('ViewerA').note.text,'');assert.equal(read('ViewerB').note.text,'');assert.equal(write('ViewerA','first\r\nline').note.text,'first\nline');assert.equal(read('ViewerB').note.text,'');assert.equal(write('ViewerB','second',2).note.text,'second');assert.equal(read('ViewerA').note.text,'first\nline');
 assert.deepEqual(rooms.notes.get(noteSubject({account:'viewera'}),noteSubject({account:'target'})),{text:'first\nline',color:6});
 const before=readFileSync(file+'.notes.json');assert.throws(()=>rooms.battlePlayerNote(config.id,'target','ViewerB',{viewer:'viewera',text:'wrong',color:1}),e=>e.status===409);assert.deepEqual(readFileSync(file+'.notes.json'),before);
 for(const body of [{viewer:'viewera',text:'x'.repeat(1001),color:6},{viewer:'viewera',text:'x',color:11},{viewer:'viewera',text:'x',color:1,owner:'someone'}])assert.throws(()=>rooms.battlePlayerNote(config.id,'target','ViewerA',body),e=>e.status===400);
 mkdirSync(file+'.notes.json.tmp');assert.throws(()=>write('ViewerA','blocked'));rmdirSync(file+'.notes.json.tmp');assert.equal(read('ViewerA').note.text,'first\nline');assert.deepEqual(readFileSync(file+'.notes.json'),before);assert.deepEqual(readFileSync(file),game);
 rooms=openRooms(file,()=>0,true);assert.equal(read('ViewerA').note.text,'first\nline');assert.equal(read('ViewerB').note.text,'second');assert.equal(write('ViewerA','界'.repeat(1000)).note.text.length,1000);write('ViewerA','',10);assert.deepEqual(read('ViewerA').note,{text:'',color:10});assert.equal(read('ViewerB').note.text,'second');assert.deepEqual(readFileSync(file),game);
 console.log('PASS Battle private notes: canonical owner/target, cross-viewer isolation/shared table store, expected viewer guard,1000Unicode/field validation, atomic failure/restart/delete and unchanged game');
}finally{rmSync(dir,{recursive:true,force:true})}
