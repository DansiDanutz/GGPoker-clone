import {image,png} from './avatar-image-test.mjs';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdtempSync,readFileSync,writeFileSync,readdirSync,statSync,rmSync,renameSync,unlinkSync,symlinkSync,truncateSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createServer} from 'node:net';
const dir=mkdtempSync(join(tmpdir(),'poker-backup-')),probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));const origin='http://127.0.0.1:'+port;
let child;const boot=async(dataDirectory=dir)=>{child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),POKER_REFERENCE_HOME:'1',POKER_DATA_DIR:dataDirectory},stdio:['ignore','pipe','inherit']});await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('Backend exited')})])};
const stop=async()=>{const done=once(child,'exit');child.kill();await done;child=null};
try{
 await boot();const key=readFileSync(join(dir,'owner.key'),'utf8').trim();const request=(method,path,auth=key,site=origin)=>fetch(origin+path,{method,headers:{Authorization:'Bearer '+auth,Origin:site}});
 assert.equal((await request('GET','/api/owner-backups','wrong')).status,401);assert.equal((await request('POST','/api/owner-backups',key,'https://foreign.invalid')).status,403);
 assert.deepEqual(await(await request('GET','/api/owner-backups')).json(),[]);
 const profile=await fetch(origin+'/local/create',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({name:'BackupPlayer',pin:'654321'})});assert.equal(profile.status,200);const rawCookie=profile.headers.get('set-cookie').split(';')[0].split('=')[1];

 const upload=await fetch(origin+'/local/avatar',{method:'POST',headers:{Cookie:'localplayer='+rawCookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({image})});assert.equal(upload.status,200);const customAvatar=(await upload.json()).avatar;assert.match(customAvatar,/^\/local\/avatar-images\/[a-f0-9]{64}\.png$/);

 const savedTable=await fetch(origin+'/api/tables',{method:'POST',headers:{Authorization:'Bearer '+key,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({id:'practice',name:'Backup fixture',stack:200,blind:4,open:true})});assert.equal(savedTable.status,200);
 const room=(await(await fetch(origin+'/api/hosted')).json())[0].room;
 const seat=async(name)=>{const r=await fetch(origin+'/api/rooms/'+room+'/join',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({name})});assert.equal(r.status,200);return r.json()};
 const first=await seat('First');await seat('Second');const current=await(await fetch(origin+'/api/rooms/'+room+'/state',{headers:{Authorization:'Bearer '+first.issued}})).json();
 assert.equal((await fetch(origin+'/api/rooms/'+room+'/start',{method:'POST',headers:{Origin:origin,Authorization:'Bearer '+first.issued,'Content-Type':'application/json'},body:JSON.stringify({version:current.version})})).status,200);
 for(const kind of ['holdem','plo'])assert.equal((await fetch(origin+'/api/rush/'+kind+'/join',{method:'POST',headers:{Origin:origin,Cookie:'localplayer='+rawCookie,'Content-Type':'application/json'},body:JSON.stringify({version:0})})).status,200);
 const liveHand=await(await fetch(origin+'/api/rooms/'+room+'/state',{headers:{Authorization:'Bearer '+first.issued}})).json();
 const savedPools=new Map(JSON.parse(readFileSync(join(dir,'rooms.json'),'utf8'))).get('local-rush-pools');assert.ok(savedPools.holdem);assert.ok(savedPools.plo);
 const liveFiles=Object.fromEntries(['tables.json','rooms.json','local-players.json','owner-audit.jsonl'].map(name=>[name,readFileSync(join(dir,name))]));
 const players=readFileSync(join(dir,'local-players.json'));const created=await request('POST','/api/owner-backups');assert.equal(created.status,200);const backup=await created.json();assert.match(backup.id,/^[a-f0-9]{24}$/);
 const file=join(dir,'backups',backup.id+'.json'),archive=JSON.parse(readFileSync(file));assert.equal(statSync(file).mode&0o777,0o600);assert.equal(archive.version,1);assert.ok(!archive.files.some(f=>f.name==='owner.key'));assert.equal(Buffer.from(archive.files.find(f=>f.name==='local-players.json').content,'base64').toString(),players.toString());assert.ok(!readFileSync(file,'utf8').includes(rawCookie));
 for(const [name,bytes] of Object.entries(liveFiles))assert.deepEqual(Buffer.from(archive.files.find(f=>f.name===name).content,'base64'),bytes);

 const exported=await request('GET','/api/owner-backups/'+backup.id);assert.equal(exported.status,200);assert.equal(exported.headers.get('content-type'),'application/json');assert.equal(exported.headers.get('cache-control'),'no-store');assert.equal(exported.headers.get('content-disposition'),'attachment; filename="playgg-backup-'+backup.id+'.json"');assert.deepEqual(Buffer.from(await exported.arrayBuffer()),readFileSync(file));assert.equal((await request('GET','/api/owner-backups/'+backup.id,'wrong')).status,401);assert.equal((await request('GET','/api/owner-backups/'+backup.id,key,'https://foreign.invalid')).status,403);
 assert.equal((await(await request('POST','/api/owner-backups/'+backup.id)).json()).verified,true);assert.deepEqual(readFileSync(join(dir,'local-players.json')),players);assert.equal((await request('GET','/backups/'+backup.id+'.json')).status,404);

 const restored=join(dir,'restore-proof');mkdirSync(restored,{mode:0o700});for(const f of archive.files)writeFileSync(join(restored,f.name),Buffer.from(f.content,'base64'),{mode:0o600});
 await stop();await boot(restored);
 assert.deepEqual(await(await fetch(origin+'/api/rooms/'+room+'/state',{headers:{Authorization:'Bearer '+first.issued}})).json(),liveHand);
 assert.equal((await fetch(origin+'/local/me',{headers:{Cookie:'localplayer='+rawCookie}})).status,200);assert.equal((await(await fetch(origin+'/local/me',{headers:{Cookie:'localplayer='+rawCookie}})).json()).avatar,customAvatar);const restoredImage=await fetch(origin+customAvatar);assert.equal(restoredImage.status,200);assert.deepEqual(Buffer.from(await restoredImage.arrayBuffer()),png);
 for(const kind of ['holdem','plo'])assert.equal((await(await fetch(origin+'/api/rush/'+kind+'/state',{headers:{Cookie:'localplayer='+rawCookie}})).json()).registered,true);
 await stop();await boot();assert.equal((await(await request('GET','/api/owner-backups')).json()).length,1);assert.equal((await(await request('POST','/api/owner-backups/'+backup.id)).json()).verified,true);
 const damaged=Buffer.from(archive.files[0].content,'base64');damaged[0]^=1;archive.files[0].content=damaged.toString('base64');writeFileSync(file,JSON.stringify(archive));assert.equal((await request('POST','/api/owner-backups/'+backup.id)).status,409);assert.equal((await request('GET','/api/owner-backups/'+backup.id)).status,409,'Never export corrupt content');
 assert.equal((await request('POST','/api/owner-backups/'+'0'.repeat(24))).status,404);
 writeFileSync(file,'null');assert.equal((await request('POST','/api/owner-backups/'+backup.id)).status,409);
 truncateSync(file,20*1024*1024+1);assert.equal((await request('POST','/api/owner-backups/'+backup.id)).status,413);writeFileSync(file,'null');
 truncateSync(join(dir,'owner-audit.jsonl'),20*1024*1024+1);assert.equal((await request('POST','/api/owner-backups')).status,413);writeFileSync(join(dir,'owner-audit.jsonl'),liveFiles['owner-audit.jsonl']);
 renameSync(join(dir,'backups'),join(dir,'saved-backups'));writeFileSync(join(dir,'backups'),'blocked');assert.equal((await request('POST','/api/owner-backups')).status,409);unlinkSync(join(dir,'backups'));renameSync(join(dir,'saved-backups'),join(dir,'backups'));
 renameSync(join(dir,'local-players.json'),join(dir,'saved-players.json'));symlinkSync(join(dir,'owner.key'),join(dir,'local-players.json'));assert.equal((await request('POST','/api/owner-backups')).status,409);unlinkSync(join(dir,'local-players.json'));renameSync(join(dir,'saved-players.json'),join(dir,'local-players.json'));
 for(const [name,bytes] of Object.entries(liveFiles))assert.deepEqual(readFileSync(join(dir,name)),bytes);

 for(let i=1;i<10;i++)assert.equal((await request('POST','/api/owner-backups')).status,200);assert.equal((await request('POST','/api/owner-backups')).status,409);assert.equal(readdirSync(join(dir,'backups')).filter(f=>f.endsWith('.json')).length,10);
 const deleteArchive=(id,confirm,auth=key,site=origin)=>fetch(origin+'/api/owner-backups/'+id,{method:'DELETE',headers:{Authorization:'Bearer '+auth,Origin:site,'Content-Type':'application/json'},body:JSON.stringify({confirm})});
 const archiveBytes=readFileSync(file);assert.equal((await deleteArchive(backup.id,backup.id,'wrong')).status,401);assert.equal((await deleteArchive(backup.id,backup.id,key,'https://foreign.invalid')).status,403);assert.equal((await deleteArchive(backup.id,'wrong')).status,400);assert.deepEqual(readFileSync(file),archiveBytes);
 writeFileSync(join(dir,'.owner-restore.pending.json'),'blocked');assert.equal((await deleteArchive(backup.id,backup.id)).status,409);assert.deepEqual(readFileSync(file),archiveBytes);unlinkSync(join(dir,'.owner-restore.pending.json'));
 assert.equal((await deleteArchive(backup.id,backup.id)).status,200);assert.equal((await request('GET','/api/owner-backups/'+backup.id)).status,404);assert.equal(readdirSync(join(dir,'backups')).filter(f=>f.endsWith('.json')).length,9);assert.equal((await request('POST','/api/owner-backups')).status,200);
 for(const [name,bytes] of Object.entries(liveFiles))assert.deepEqual(readFileSync(join(dir,name)),bytes);
 console.log('PASS backup deletion HTTP:owner/origin/exact ID guards,pending recovery protected,damaged archive removed,new slot available,game files unchanged');
 console.log('PASS private backups: owner/origin guards, exact profile bytes, private permissions, no owner key/raw cookies/public path, integrity/corruption, real cold restore of hand/login/both pools and ten-snapshot limit without deleting data');
}finally{if(child)await stop();rmSync(dir,{recursive:true,force:true})}
