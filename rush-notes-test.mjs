import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {join} from 'node:path';import {tmpdir} from 'node:os';
import {openRush} from './rush.mjs';import {openNotes} from './player-notes.mjs';
import {noteSubject} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'rush-notes-'));const file=join(dir,'rush.json'),notesFile=join(dir,'rooms.json.notes.json');
try{
 const store=openNotes(notesFile);let rush=openRush(file,'holdem',()=>0,store);
 for(let i=0;i<12;i++)rush('Player'+i,'join',{version:rush('Player'+i,'state').version});
 for(let i=0;i<12;i++){const s=rush('Player'+i,'state');if(!s.table)rush('Player'+i,'deal',{version:s.version})}
 const state=rush('Player0','state'),before=readFileSync(file),view=rush('Player0','notes'),target=view.players[0];
 assert.equal(target.subject,noteSubject({account:target.name}));assert.equal(state.noteSubjects[target.seat],target.subject);assert.equal(view.self.name,'Player0');assert.equal(view.statsScope,'rush-pool');assert.deepEqual(target.stats,{hands:0,wins:0,voluntary:0});
 const body={table:state.table,seat:target.seat,subject:target.subject,text:'Private Rush note\n♠',color:2};
 assert.equal(rush('Player0','notes',body).players.find(p=>p.subject===target.subject).text,body.text);assert.deepEqual(readFileSync(file),before,'Notes do not mutate game snapshot/version');
 assert.deepEqual(store.get(noteSubject({account:'player0'}),target.subject),{text:body.text,color:2});assert.equal(rush(target.name,'notes').players.find(p=>p.name==='Player0').text,'','Other account cannot read my notes');
 assert.throws(()=>rush('Player0','notes',{...body,table:'old-table'}),e=>e.status===409);assert.throws(()=>rush('Player0','notes',{...body,subject:'0'.repeat(64)}),e=>e.status===409);assert.throws(()=>rush('Player0','notes',{...body,seat:state.me}),e=>e.status===400);
 assert.throws(()=>rush('Unknown','notes'),e=>e.status===409);assert.throws(()=>rush('Player0','notes',{...body,text:'x'.repeat(1001)}),e=>e.status===400);
 rush('Player0','notes',{table:state.table,labelChanges:[{color:2,title:'Rush regular'}]});assert.equal(store.getLabels(noteSubject({account:'Player0'}))[2],'Rush regular');
 rush=openRush(file,'holdem',()=>0,openNotes(notesFile));assert.equal(rush('Player0','notes').players.find(p=>p.subject===target.subject).text,body.text);
 const {mkdirSync}=await import('node:fs');mkdirSync(notesFile+'.tmp');assert.throws(()=>rush('Player0','notes',{...body,text:'not saved'}));assert.equal(rush('Player0','notes').players.find(p=>p.subject===target.subject).text,body.text);
 rmSync(notesFile+'.tmp',{recursive:true});const fresh=rush('Player0','state');assert.ok(!JSON.stringify(fresh).includes(body.text),'Game payload excludes private text');rush('Player0','quick-fold',{handVersion:fresh.handVersion});assert.throws(()=>rush('Player0','notes',body),e=>e.status===409,'Old-table edits fail after quick-fold');
 const plo=openRush(join(dir,'plo.json'),'plo',()=>0,openNotes(notesFile));for(let i=0;i<6;i++)plo('Player'+i,'join',{version:plo('Player'+i,'state').version});plo('Player0','deal',{version:plo('Player0','state').version});assert.equal(plo('Player0','notes').players.find(p=>p.name===target.name).text,body.text,'Human account notes follow between Holdem and PLO pools');
 console.log('PASS Rush private notes:stable shared account subjects,seat/table guards,privacy,labels,no game mutation,restart andfailed-write rollback');
}finally{rmSync(dir,{recursive:true,force:true})}
