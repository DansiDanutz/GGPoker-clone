import {readFileSync,writeFileSync,renameSync,unlinkSync,openSync,closeSync,fsyncSync} from 'node:fs';
import {battleRush} from './battle-rush.mjs';

// One owning server process; revision checks reject stale handles, not simultaneous writers in other processes.
export function openBattleRush(file,entries,config){
 entries=structuredClone(entries);config=structuredClone(config);
 let raw=null,event,revision=0;
 try{raw=readFileSync(file,'utf8')}catch(error){if(error.code!=='ENOENT')throw error}
 if(raw!==null){const saved=JSON.parse(raw);if(saved?.version!==1||!Number.isSafeInteger(saved.revision)||saved.revision<0||typeof saved.checkpoint!=='string')throw Error('Invalid Battle Rush store checkpoint');revision=saved.revision;event=battleRush(entries,config,saved.checkpoint)}else event=battleRush(entries,config);
 function write(checkpoint,nextRevision){
  const next=JSON.stringify({version:1,revision:nextRevision,checkpoint}),temporary=file+'.tmp';let created=false,fd=null;
  try{fd=openSync(temporary,'wx',0o600);created=true;writeFileSync(fd,next);fsyncSync(fd);closeSync(fd);fd=null;renameSync(temporary,file)}catch(error){if(fd!==null)try{closeSync(fd)}catch{}if(created)try{unlinkSync(temporary)}catch{}throw error}
  raw=next;revision=nextRevision;
 }
 if(raw===null)write(event.snapshot(),0);
 function commit(expected,method,args){
  if(expected!==revision||!Number.isSafeInteger(expected)||revision===Number.MAX_SAFE_INTEGER)throw Error('Stale Battle Rush revision');
  if(readFileSync(file,'utf8')!==raw)throw Error('Stale Battle Rush writer; reopen the event');
  const before=event.snapshot();
  try{const result=event[method](...args),after=event.snapshot();if(after!==before)write(after,revision+1);return result}catch(error){event=battleRush(entries,config,before);throw error}
 }
 return {
  revision:()=>revision,sessions:()=>event.sessions(),phase:()=>event.phase(),total:()=>event.total(),qualification:()=>event.qualification(),
  view:(account,session)=>({...event.view(account,session),revision}),
  deal:(revision,...args)=>commit(revision,'deal',args),move:(revision,...args)=>commit(revision,'move',args),fold:(revision,...args)=>commit(revision,'fold',args),tick:(revision,now)=>commit(revision,'tick',[now])
 };
}
