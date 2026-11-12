import {ownerBackup,backupFiles} from './owner-backup.mjs';
import {readFileSync,lstatSync,openSync,closeSync,writeFileSync,fsyncSync,renameSync,unlinkSync} from 'node:fs';
import {join} from 'node:path';
const pendingName='.owner-restore.pending.json',scratchName='.owner-restore-write.tmp';
const fail=message=>{throw Object.assign(Error(message),{status:409})};
function regular(file){try{const stat=lstatSync(file);if(!stat.isFile()||stat.isSymbolicLink())fail('Restore paths must be regular files');return stat}catch(e){if(e.code==='ENOENT')return null;throw e}}
function syncDirectory(directory){const fd=openSync(directory,'r');try{fsyncSync(fd)}finally{closeSync(fd)}}
function removeScratch(directory){const path=join(directory,scratchName);if(regular(path)){unlinkSync(path);syncDirectory(directory)}}
function atomic(directory,name,bytes){
 const scratch=join(directory,scratchName);let fd;
 try{fd=openSync(scratch,'wx',0o600);writeFileSync(fd,bytes);fsyncSync(fd);closeSync(fd);fd=undefined;renameSync(scratch,join(directory,name));syncDirectory(directory)}
 catch(error){if(fd!==undefined)closeSync(fd);if(error.code!=='EEXIST')try{unlinkSync(scratch)}catch{}throw error}
}
function journal(directory){
 const file=join(directory,pendingName),stat=regular(file);if(!stat)return null;if(stat.size>4096)fail('Invalid restore journal');let value;
 try{value=JSON.parse(readFileSync(file,'utf8'))}catch{fail('Invalid restore journal')}
 if(value?.version!==1||!['applying','committed'].includes(value.phase)||![value.id,value.rescueId].every(id=>typeof id==='string'&&/^[a-f0-9]{24}$/.test(id))||value.id===value.rescueId||!Array.isArray(value.missingBefore)||value.missingBefore.some(n=>!backupFiles.includes(n))||new Set(value.missingBefore).size!==value.missingBefore.length)fail('Invalid restore journal');return value;
}
function apply(directory,snapshot,missing=[]){
 const files=new Map(snapshot.files.map(f=>[f.name,Buffer.from(f.content,'base64')]));
 for(const name of backupFiles){const file=join(directory,name),exists=regular(file);if(files.has(name)&&!missing.includes(name))atomic(directory,name,files.get(name));else if(exists){unlinkSync(file);syncDirectory(directory)}}
}
function removeJournal(directory){unlinkSync(join(directory,pendingName));syncDirectory(directory)}
export function recoverOwnerRestore(directory){
 const record=journal(directory);removeScratch(directory);if(!record)return {recovered:false};
 if(record.phase==='applying')apply(directory,ownerBackup(directory,'GET',record.rescueId),record.missingBefore);
 removeJournal(directory);return {recovered:true,rolledBack:record.phase==='applying',id:record.id,rescueId:record.rescueId};
}
function requireIdle(directory){
 try{
  const file=join(directory,'rooms.json');if(regular(file)){
   const rooms=JSON.parse(readFileSync(file));if(!Array.isArray(rooms))fail('Current rooms are unreadable');
   for(const entry of rooms){if(!Array.isArray(entry)||entry.length!==2||!entry[1]||typeof entry[1]!=='object')fail('Current rooms are unreadable');const r=entry[1];if(r.hand&&!r.hand.end||r.tournament?.startedAt!=null&&r.tournament.winner==null&&!r.tournament.cancelledAt)fail('Finish active hands and tournaments before restoring')}
  }
  for(const name of ['rush.json','rush-plo.json'])if(regular(join(directory,name))){const saved=JSON.parse(readFileSync(join(directory,name))),pool=saved.pool?JSON.parse(saved.pool):null;if(pool){if(!Array.isArray(pool.tables))fail('Current Rush state is unreadable');if(pool.tables.some(([,table])=>!table.settled))fail('Finish active Rush hands before restoring')}}
 }catch(error){if(error.status)throw error;fail('Current game state cannot be checked safely')}
}
// Call recovery before opening models at startup; publish returned models only after this commits.
export function restoreOwnerBackup(directory,id,tables,loadModels){
 if(typeof loadModels!=='function')throw Error('A synchronous model loader is required');if(journal(directory)||regular(join(directory,scratchName)))fail('Pending restore recovery requires a restart');requireIdle(directory);
 const target=ownerBackup(directory,'GET',id);for(const file of target.files){try{if(file.name==='owner-audit.jsonl'){for(const line of Buffer.from(file.content,'base64').toString().split('\n').filter(Boolean))JSON.parse(line)}else JSON.parse(Buffer.from(file.content,'base64'))}catch{fail('Backup contains invalid game JSON')}}
 const missingBefore=backupFiles.filter(name=>!regular(join(directory,name))),rescue=ownerBackup(directory,'POST',undefined,tables);const fd=openSync(join(directory,'backups',rescue.id+'.json'),'r');try{fsyncSync(fd)}finally{closeSync(fd)}syncDirectory(join(directory,'backups'));
 const record={version:1,phase:'applying',id,rescueId:rescue.id,missingBefore};let loaded;
 try{
  atomic(directory,pendingName,JSON.stringify(record));apply(directory,target);loaded=loadModels({id,rescueId:rescue.id});if(loaded?.then)throw Error('Model loader must be synchronous');
  for(const name of backupFiles){const file=join(directory,name);if(regular(file)){const fd=openSync(file,'r');try{fsyncSync(fd)}finally{closeSync(fd)}}}syncDirectory(directory);
  atomic(directory,pendingName,JSON.stringify({...record,phase:'committed'}));
 }catch(error){try{if(journal(directory)?.phase==='committed')atomic(directory,pendingName,JSON.stringify(record));recoverOwnerRestore(directory)}catch(recovery){throw Object.assign(Error('Restore failed; restart recovery is required'),{status:503,recoveryRequired:true,cause:recovery,rescueId:rescue.id})}throw Object.assign(Error('Restore rejected; previous data recovered'),{status:409,cause:error,rescueId:rescue.id})}
 // A committed journal may safely remain for startup cleanup if unlink fails.
 try{removeJournal(directory)}catch{}
 return {id,rescueId:rescue.id,loaded};
}
