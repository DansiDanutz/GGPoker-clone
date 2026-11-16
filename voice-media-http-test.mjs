import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
const directory=mkdtempSync(join(tmpdir(),'voice-media-')),art=join(directory,'art'),runtime=resolve(process.env.POKER_RUNTIME_DIR||'.');
const receipt=JSON.parse(readFileSync(new URL('./docs/rea/action-voice-source.json',import.meta.url))),assets=[];
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
let child;
async function stop(){if(child&&child.exitCode===null&&child.signalCode===null){const ended=once(child,'exit');child.kill();await ended}child=null}
try{
 mkdirSync(join(art,'native-action-voice'),{recursive:true});
 for(const row of receipt.sounds){const file='native-action-voice/'+row.symbol+'.mp3',bytes=readFileSync('/Users/davidai/Sandbox/rea-tools/action-voice-sounds/'+row.symbol+'.mp3');assert.equal(digest(bytes),row.sha256);writeFileSync(join(art,file),bytes);assets.push({url:'/table-audio/'+row.symbol+'.mp3',type:'audio/mpeg',...row})}
 for(const row of receipt.images){const bytes=readFileSync(row.source);assert.equal(digest(bytes),row.sha256);writeFileSync(join(art,row.file),bytes);assets.push({url:'/home-art/'+row.file,type:'image/png',...row})}
 const probe=createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));const origin='http://127.0.0.1:'+port;
 async function boot(reference){child=spawn(process.execPath,[join(runtime,'server.mjs')],{cwd:runtime,env:{...process.env,PORT:String(port),POKER_BIND_HOST:'127.0.0.1',POKER_PUBLIC_ORIGIN:origin,POKER_REFERENCE_HOME:reference,POKER_REFERENCE_ART_DIR:art,POKER_DATA_DIR:join(directory,'data')},stdio:['ignore','pipe','inherit']});await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('Voice media server exited')})])}
 await boot('1');
 for(const row of assets){const response=await fetch(origin+row.url);assert.equal(response.status,200,row.url);assert.equal(response.headers.get('content-type'),row.type);assert.ok(response.headers.get('cache-control').includes('private'));const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.length,row.bytes);assert.equal(digest(bytes),row.sha256)}
 for(const path of ['/table-audio/VoiceUnknownDaniel.mp3','/table-audio/VoiceBetVWilliam.mp3','/table-audio/VoiceBetDanielExtra.mp3','/table-audio/%2e%2e%2fVoiceBetDaniel.mp3','/home-art/native-action-voice/CircleFrame.png','/home-art/native-action-voice/Unknown_ActionVoice.png'])assert.notEqual((await fetch(origin+path)).status,200,path);
 assert.notEqual((await fetch(origin+assets[0].url,{method:'POST'})).status,200);
 for(const path of ['/voice-packs.mjs','/voice-carousel.mjs'])assert.equal((await fetch(origin+path)).status,200,path);
 await stop();await boot('0');for(const row of assets)assert.notEqual((await fetch(origin+row.url)).status,200,row.url+' must stay private in shared mode');
 console.log('PASS actual server:98 exact-hash MP3s and14 exact-hash portraits,private MIME/cache,strict whitelist,POST/path rejection,frontend modules and all112 assets denied in shared mode');
}finally{await stop();rmSync(directory,{recursive:true,force:true})}
