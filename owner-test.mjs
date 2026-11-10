import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';
const data=mkdtempSync(join(tmpdir(),'river-owner-')),port=String(20000+Math.floor(Math.random()*16000)),origin='http://127.0.0.1:'+port;
let child;async function boot(){child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port,POKER_DATA_DIR:data},stdio:['ignore','pipe','inherit']});await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('server failed')})])}
async function stop(){const ended=once(child,'exit');child.kill();await ended}
try{await boot();const t={id:'qa',name:'QA',stack:240,blind:6,open:false};const save=key=>fetch(origin+'/api/tables',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(t)});
assert.equal((await save('wrong')).status,401);assert.equal((await save(readFileSync(join(data,'owner.key'),'utf8').trim())).status,200);assert.equal((await fetch(origin+'/owner.key')).status,404);
await stop();await boot();const rows=await(await fetch(origin+'/api/tables')).json();assert.deepEqual(rows.find(x=>x.id==='qa'),t);console.log('PASS: unauthorized write rejected, owner save persisted across restart, key inaccessible via HTTP');
}finally{if(child&&child.exitCode===null&&!child.signalCode)await stop();rmSync(data,{recursive:true,force:true})}
