import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const variant=process.argv.includes('--plo')?'plo':'holdem';
const data=mkdtempSync(join(tmpdir(),'rush-http-')),port=String(20000+Math.floor(Math.random()*16000)),origin='http://127.0.0.1:'+port;
let child;
async function boot(){child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port,POKER_DATA_DIR:data,POKER_REFERENCE_HOME:'1'},stdio:['ignore','pipe','inherit']});await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('Server failed')})])}
async function stop(){const done=once(child,'exit');child.kill();await done;child=null}
const cookies=[];
async function login(i,create=false){const r=await fetch(origin+'/local/'+(create?'create':'login'),{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({name:'Rush'+i,pin:'123456'})});assert.equal(r.status,200);cookies[i]=r.headers.get('set-cookie').split(';')[0]}
const req=(i,op,body)=>fetch(origin+'/api/rush/'+variant+'/'+op,{method:body?'POST':'GET',headers:{Cookie:cookies[i]||'',Origin:origin,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
const state=async i=>{const r=await req(i,'state');assert.equal(r.status,200);return r.json()};
async function send(i,op,body={}){const s=await state(i),r=await req(i,op,{version:s.version,handVersion:s.handVersion,...body});assert.equal(r.status,200,await r.clone().text());return r.json()}
try{
 await boot();assert.equal((await req(0,'state')).status,401);
 for(let i=0;i<12;i++){await login(i,true);await send(i,'join')}
 const forged=await fetch(origin+'/api/rush/deal',{method:'POST',headers:{Cookie:cookies[0],Origin:'https://foreign.invalid','Content-Type':'application/json'},body:'{}'});assert.equal(forged.status,403);
 const other=await fetch(origin+'/api/rush/'+(variant==='plo'?'holdem':'plo')+'/state',{headers:{Cookie:cookies[0]}});assert.equal((await other.json()).registered,false);
 const first=await send(0,'deal');assert.equal(first.hand.hands[first.me].length,variant==='plo'?4:2);assert.equal(first.hand.deck,undefined);assert.equal(first.hand.hands.filter(Boolean).length,1);
 const next=await send(0,'quick-fold');assert.notEqual(next.table,first.table);assert.deepEqual(next.names,['Rush0','Rush6','Rush7','Rush8','Rush9','Rush10']);
 await stop();await boot();assert.equal((await req(0,'state')).status,200);
 assert.equal((await state(0)).table,next.table);
 for(const player of [1,0]){
  for(let count=0;count<100;count++){
   const s=await state(player);if(!s.hand)break;
   const actor=Number(s.names[s.hand.turn].slice(4)),v=await state(actor);await send(actor,'act',{action:v.legal.due?'call':'check'});
  }
  const s=await state(player);assert.equal(s.table,null);assert.ok(s.result);assert.equal(s.result.hand.end.payouts.reduce((a,b)=>a+b),s.result.hand.committed.reduce((a,b)=>a+b));
 }
 let total=0;for(let i=0;i<12;i++)total+=(await state(i)).balance;assert.equal(total,2400);
 console.log('PASS Rush HTTP '+variant+': local authentication/origin, 12 accounts, private cards, quick-fold rematch, restart with existing cookies, payouts and 2400 conserved chips');
}finally{if(child)await stop();rmSync(data,{recursive:true,force:true})}
