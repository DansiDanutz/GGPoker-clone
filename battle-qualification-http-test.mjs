import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const directory=mkdtempSync(join(tmpdir(),'battle-qualification-http-')),probe=createServer();
await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
const origin='http://127.0.0.1:'+port,runtime=resolve(process.env.POKER_RUNTIME_DIR||'.'),cookies=[],pause=ms=>new Promise(r=>setTimeout(r,ms));let child;
const settings={id:'qualify-http',name:'Qualification HTTP',capacity:12,stack:100,blind:4,finalSeats:3,rushDurationMs:1,entryCost:25};
async function boot(){child=spawn(process.execPath,[join(runtime,'server.mjs')],{cwd:runtime,env:{...process.env,PORT:String(port),POKER_BIND_HOST:'127.0.0.1',POKER_PUBLIC_ORIGIN:origin,POKER_REFERENCE_HOME:'1',POKER_DATA_DIR:directory},stdio:['ignore','ignore','inherit']});for(let i=0;i<200;i++){if(child.exitCode!==null)throw Error('Server exited');try{if((await fetch(origin+'/api/tables')).ok)return}catch{}await pause(25)}throw Error('Server did not start')}
async function stop(){if(child?.exitCode===null&&!child.signalCode){const done=once(child,'exit');child.kill();await done}}
const api=(i,op,body)=>fetch(origin+'/api/battle/'+settings.id+'/'+op,{method:op==='state'?'GET':'POST',headers:{Cookie:cookies[i],Origin:origin,'Content-Type':'application/json'},body:op==='state'?undefined:JSON.stringify(body)});
const state=async i=>{const r=await api(i,'state');assert.equal(r.status,200);return r.json()};
try{
 await boot();const key=readFileSync(join(directory,'owner.key'),'utf8').trim();
 assert.equal((await fetch(origin+'/api/owner-battle',{method:'POST',headers:{Origin:origin,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(settings)})).status,200);
 for(let i=0;i<12;i++){const r=await fetch(origin+'/local/create',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({name:'QualifyPlayer'+i,pin:'123456'})});assert.equal(r.status,200);cookies.push(r.headers.get('set-cookie').split(';')[0]);assert.equal((await api(i,'register',{})).status,200)}
 let view;for(let i=0;i<200;i++){view=await state(0);if(view.phase==='final-ready')break;await pause(50)}
 assert.equal(view.phase,'final-ready');const q=view.qualification;assert.equal(q.qualified.length,3);assert.equal(q.qualified.reduce((n,p)=>n+p.stack,0),1200);assert.ok(q.serial>0);assert.deepEqual(q.direct.map(p=>p.id),['qualifyplayer0','qualifyplayer1']);
 assert.equal(q.lastHand.hand.deck,undefined);assert.equal(q.lastHand.hand.hands,undefined);
 for(let i=0;i<12;i++){const v=await state(i);assert.deepEqual(v.qualification,q);assert.equal((await api(i,'deal',{revision:v.revision,session:v.session})).status,409);assert.equal((await(await fetch(origin+'/local/wallet',{headers:{Cookie:cookies[i]}})).json()).available,9975)}
 assert.equal((await fetch(origin+'/api/battle/'+settings.id+'/state')).status,401);
 const saved=readFileSync(join(directory,'rooms.json'));await stop();await boot();assert.deepEqual(await state(0),view);await pause(1100);assert.deepEqual(readFileSync(join(directory,'rooms.json')),saved);
 console.log('PASS Battle qualification HTTP: twelve cookie-bound players, automatic all-in qualification,1200 chips, unchanged wallets, closed Rush commands, authenticated state and restart idempotence');
}finally{await stop();rmSync(directory,{recursive:true,force:true})}
