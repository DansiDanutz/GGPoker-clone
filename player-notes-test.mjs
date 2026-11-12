import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,mkdirSync,statSync,writeFileSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {openNotes} from './player-notes.mjs';
const dir=mkdtempSync(join(tmpdir(),'poker-notes-')),file=join(dir,'notes.json'),a='a'.repeat(64),b='b'.repeat(64),target='c'.repeat(64);
try{let notes=openNotes(file);assert.deepEqual(notes.get(a,target),{text:'',color:10});assert.equal(notes.set(a,target,{text:'Raises\r\noften\rfrom button',color:1}),true);assert.deepEqual(notes.get(a,target),{text:'Raises\noften\nfrom button',color:1});assert.deepEqual(notes.get(b,target),{text:'',color:10});assert.equal(statSync(file).mode&0o777,0o600);notes=openNotes(file);assert.equal(notes.get(a,target).color,1);assert.equal(notes.set(a,target,{text:'Raises\noften\nfrom button',color:1}),false);
 for(const value of [{text:'x'.repeat(1001),color:1},{text:'x',color:11},{text:'x',color:'1'},{text:null,color:1}])assert.throws(()=>notes.set(a,target,value),e=>e.status===400);
 const literal='<script>{window.bad=true}</script>'+String.fromCharCode(92);assert.equal(notes.set(a,target,{text:literal,color:1}),true);assert.equal(openNotes(file).get(a,target).text,literal);
 mkdirSync(file+'.tmp');assert.throws(()=>notes.set(a,target,{text:'Must not persist',color:2}));assert.equal(notes.get(a,target).color,1);rmSync(file+'.tmp',{recursive:true});assert.equal(notes.set(a,target,{text:'',color:10}),true);assert.deepEqual(openNotes(file).get(a,target),{text:'',color:10});
 const bad=join(dir,'bad.json');writeFileSync(bad,'invalid');assert.throws(()=>openNotes(bad));assert.equal(readFileSync(bad,'utf8'),'invalid');const copy=notes.get(a,target);copy.text='external mutation';assert.equal(notes.get(a,target).text,'');
 console.log('PASS private1000-char notes: normalized newlines, plain literal text/palette, account isolation, restart, idempotence/delete and I/O rollback');
}finally{rmSync(dir,{recursive:true,force:true})}
