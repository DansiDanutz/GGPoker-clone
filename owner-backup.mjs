import {readFileSync,writeFileSync,readdirSync,lstatSync,mkdirSync,renameSync,unlinkSync,openSync,fsyncSync,closeSync} from 'node:fs';
import {join} from 'node:path';
import {randomBytes,createHash} from 'node:crypto';
export const backupFiles=Object.freeze(['tables.json','rooms.json','rooms.json.notes.json','local-players.json','rush.json','rush-plo.json','owner-audit.jsonl']);
const limit=20*1024*1024;
const fail=(status,message)=>{throw Object.assign(Error(message),{status})};
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
export function ownerBackup(directory,method,id,tables){
 if(!['GET','POST','DELETE'].includes(method)||method==='DELETE'&&!id)fail(405,'Unsupported backup operation');
 const folder=join(directory,'backups');
 let present=true;try{const s=lstatSync(folder);if(!s.isDirectory()||s.isSymbolicLink())fail(409,'Backup directory must be a regular directory')}catch(e){if(e.code==='ENOENT')present=false;else throw e}
 const list=()=>present?readdirSync(folder).filter(name=>/^[a-f0-9]{24}\.json$/.test(name)).map(name=>{const s=lstatSync(join(folder,name));if(!s.isFile()||s.isSymbolicLink())fail(409,'Backup must be a regular file');return {id:name.slice(0,-5),bytes:s.size,createdAt:s.mtime.toISOString()}}).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)):[];
 if(!id&&method==='GET')return list();
 if(id){
  if(!/^[a-f0-9]{24}$/.test(id))fail(400,'Invalid backup ID');
  const metadata=list().find(item=>item.id===id);if(!metadata)fail(404,'Backup not found');if(method==='DELETE'){
   for(const name of ['.owner-restore.pending.json','.owner-restore-write.tmp'])try{lstatSync(join(directory,name));fail(409,'Finish backup recovery before deleting archives')}catch(error){if(error.code!=='ENOENT')throw error}
   unlinkSync(join(folder,id+'.json'));const fd=openSync(folder,'r');try{fsyncSync(fd)}finally{closeSync(fd)}return {deleted:true,id};
  }
  if(metadata.bytes>limit)fail(413,'Backup exceeds verification limit');
  let data;try{data=JSON.parse(readFileSync(join(folder,id+'.json'),'utf8'))}catch{fail(409,'Backup JSON is damaged')}
  if(!data||typeof data!=='object'||Array.isArray(data)||data.version!==1||data.id!==id||typeof data.createdAt!=='string'||!Number.isFinite(Date.parse(data.createdAt))||!Array.isArray(data.files)||!data.files.length||data.files.length>backupFiles.length)fail(409,'Invalid backup manifest');
  const seen=new Set();
  for(const file of data.files){
   if(!file||!backupFiles.includes(file.name)||seen.has(file.name)||typeof file.content!=='string'||!Number.isSafeInteger(file.bytes)||file.bytes<0)fail(409,'Invalid backup file record');
   seen.add(file.name);const bytes=Buffer.from(file.content,'base64');
   if(bytes.toString('base64')!==file.content||bytes.length!==file.bytes||digest(bytes)!==file.sha256)fail(409,'Backup integrity check failed');
  }
  if(!seen.has('tables.json'))fail(409,'Backup table definitions missing');
  return method==='GET'?data:{...metadata,verified:true,files:[...seen]};
 }
 if(list().length>=10)fail(409,'Ten backups already exist; retain or remove older local backups before creating another');
 const files=[];let total=0;
 // All checkpoint reads are synchronous in the server event loop.
 for(const name of backupFiles){
  let bytes;
  try{const source=join(directory,name),s=lstatSync(source);if(!s.isFile()||s.isSymbolicLink())fail(409,'Game data must be regular files');if(s.size>limit)fail(413,'Game data exceeds backup limit');bytes=readFileSync(source)}catch(e){if(e.code!=='ENOENT')throw e;if(name==='tables.json')bytes=Buffer.from(JSON.stringify(tables));else continue}
  total+=bytes.length;if(total>limit)fail(413,'Game data exceeds backup limit');files.push({name,bytes:bytes.length,sha256:digest(bytes),content:bytes.toString('base64')});
 }
 const backupId=randomBytes(12).toString('hex'),data=Buffer.from(JSON.stringify({version:1,id:backupId,createdAt:new Date().toISOString(),files}));if(data.length>limit)fail(413,'Encoded backup exceeds 20 MiB limit');
 if(!present){mkdirSync(folder,{mode:0o700});present=true}
 const temporary=join(folder,backupId+'.tmp'),destination=join(folder,backupId+'.json');
 try{writeFileSync(temporary,data,{mode:0o600,flag:'wx'});renameSync(temporary,destination)}catch(e){if(e.code!=='EEXIST')try{unlinkSync(temporary)}catch{}throw e}
 return {id:backupId,bytes:data.length,createdAt:new Date().toISOString(),files:files.map(file=>file.name)};
}
