import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'hosted-clock-')),file=join(dir,'rooms.json');
const tables=['clock-human','clock-bots'].map(id=>({id,name:id,stack:120,blind:4,open:true}));
const id=t=>createHash('sha256').update('river-hosted:'+t.id).digest('hex').slice(0,48);
let child;
try{
 const request=openRooms(file);
 for(let i=0;i<6;i++)request(id(tables[0]),'join',null,{name:'Human '+i},tables[0]);
 let bot=request(id(tables[1]),'join',null,{name:'Host'},tables[1]);request(id(tables[1]),'fill-bots',bot.issued,{version:bot.version},tables[1]);
 const data=JSON.parse(readFileSync(file));data.find(([k])=>k===id(tables[0]))[1].deadline=Date.now()+1000;
 writeFileSync(file,JSON.stringify(data));writeFileSync(join(dir,'tables.json'),JSON.stringify(tables));
 const probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
 const boot=async()=>{child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),POKER_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('Backend failed to start')})])};
 const stop=async()=>{const ended=once(child,'exit');child.kill();await ended;child=null};
 const read=()=>new Map(JSON.parse(readFileSync(file)));
 await boot();let state;
 for(let n=0;n<60;n++){state=read();if(state.get(id(tables[0])).hand.folded[3]&&state.get(id(tables[1])).hand.history.length)break;await new Promise(r=>setTimeout(r,100))}
 assert.equal(state.get(id(tables[0])).hand.folded[3],true);assert.ok(state.get(id(tables[1])).hand.history.length>0);
 await stop();const saved=read();await boot();await new Promise(r=>setTimeout(r,600));assert.equal(read().get(id(tables[0])).hand.folded[3],true);assert.ok(read().get(id(tables[1])).version>=saved.get(id(tables[1])).version);
 await stop();console.log('PASS real hosted server timer: human timeout and computer moves persisted with zero HTTP requests; restart retains timeout state');
}finally{if(child){const end=once(child,'exit');child.kill();await end}rmSync(dir,{recursive:true,force:true})}
