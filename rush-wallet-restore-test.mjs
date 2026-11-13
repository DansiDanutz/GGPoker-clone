import assert from 'node:assert/strict';import{mkdtempSync,rmSync,readFileSync}from'node:fs';import{tmpdir}from'node:os';import{join}from'node:path';import{openRooms}from'./rooms.mjs';import{rushPool}from'./engine/rush-pool.mjs';import{ownerBackup}from'./owner-backup.mjs';import{restoreOwnerBackup}from'./owner-restore.mjs';
const dir=mkdtempSync(join(tmpdir(),'rush-wallet-restore-')),file=join(dir,'rooms.json');
try{
 const rooms=openRooms(file,()=>0,true);rooms.rushStore.write('holdem',{entries:[],version:1,pool:null});const target=ownerBackup(dir,'POST',undefined,[]),entries=Array.from({length:6},(_,i)=>({id:i?'Computer'+i:'Alice',stack:200,...(i?{bot:true}:{walletFunded:true})})),pool=rushPool(entries);pool.deal('Alice');rooms.rushStore.write('holdem',{entries,version:2,pool:pool.snapshot()},[{account:'Alice',delta:-200}]);const before=readFileSync(file);
 assert.throws(()=>restoreOwnerBackup(dir,target.id,[],()=>openRooms(file,()=>0,true)),error=>error.status===409&&/Rush/.test(error.message),'Embedded funded Rush hands must block restore even without legacy rush.json');assert.deepEqual(readFileSync(file),before);assert.equal(rooms.wallet('Alice').available,9800);
 console.log('PASS embedded Rush backup protection: active funded hand rejects restore, snapshot and wallet unchanged');
}finally{rmSync(dir,{recursive:true,force:true})}
