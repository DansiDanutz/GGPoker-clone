import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync,readdirSync,symlinkSync,unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {ownerBackup} from './owner-backup.mjs';
const dir=mkdtempSync(join(tmpdir(),'poker-retention-'));
try{
 writeFileSync(join(dir,'owner.key'),'private-key');writeFileSync(join(dir,'tables.json'),'[]');
 const backups=Array.from({length:10},()=>ownerBackup(dir,'POST',null,[]));
 assert.throws(()=>ownerBackup(dir,'POST',null,[]),e=>e.status===409);
 const target=backups[3].id,file=join(dir,'backups',target+'.json');
 writeFileSync(file,'damaged'); // An unusable archive must still be removable.
 assert.deepEqual(ownerBackup(dir,'DELETE',target,[]),{deleted:true,id:target});
 assert.equal(ownerBackup(dir,'GET').length,9);assert.equal(ownerBackup(dir,'POST',null,[]).id.length,24);
 assert.throws(()=>ownerBackup(dir,'DELETE',target,[]),e=>e.status===404);
 assert.throws(()=>ownerBackup(dir,'DELETE','../owner.key',[]),e=>e.status===400);
 const next=backups[0].id,nextFile=join(dir,'backups',next+'.json'),original=readFileSync(nextFile);
 writeFileSync(join(dir,'.owner-restore.pending.json'),'invalid journal');
 assert.throws(()=>ownerBackup(dir,'DELETE',next,[]),e=>e.status===409);assert.deepEqual(readFileSync(nextFile),original);unlinkSync(join(dir,'.owner-restore.pending.json'));
 unlinkSync(nextFile);symlinkSync(join(dir,'owner.key'),nextFile);
 assert.throws(()=>ownerBackup(dir,'DELETE',next,[]),e=>e.status===409);assert.equal(readFileSync(join(dir,'owner.key'),'utf8'),'private-key');unlinkSync(nextFile);writeFileSync(nextFile,original);
 assert.throws(()=>ownerBackup(dir,'DELETE',null,[]),e=>e.status===405);assert.throws(()=>ownerBackup(dir,'PATCH',next,[]),e=>e.status===405);
 assert.equal(readFileSync(join(dir,'tables.json'),'utf8'),'[]');assert.equal(readdirSync(join(dir,'backups')).length,10);
 console.log('PASS backup retention: removes only selected regular archive including damaged JSON, frees one slot, protects recovery/symlinks/key/game files, rejects invalid IDs/methods');
}finally{rmSync(dir,{recursive:true,force:true})}
