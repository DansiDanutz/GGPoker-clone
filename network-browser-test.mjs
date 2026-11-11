// Four separate Chrome storage contexts, real UI actions, ephemeral server and data.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';
import {best,compare} from './game.mjs';
const directory=mkdtempSync(join(tmpdir(),'network-poker-')), profile=join(directory,'chrome');
const port=20000+Math.floor(Math.random()*20000),origin='http://127.0.0.1:'+port;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<200;i++){const v=await fn();if(v)return v;await delay(50)}throw Error('Timed out: '+fn)}
let server,chrome,ws;
async function boot(){server=spawn(process.execPath,['server.mjs'],{cwd:new URL('.',import.meta.url),env:{...process.env,PORT:String(port),POKER_PUBLIC_ORIGIN:origin,POKER_BIND_HOST:'127.0.0.1',POKER_DATA_DIR:directory},stdio:['ignore','pipe','inherit']});await until(async()=>{if(server.exitCode!==null)throw Error('Server failed');return fetch(origin+'/api/tables').then(r=>r.ok,()=>false)})}
async function stop(p){if(!p||p.exitCode!==null||p.signalCode)return;const done=once(p,'exit');p.kill();await done}
try{
 await boot();
 chrome=spawn(process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless','--disable-extensions','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
 const addr=await until(()=>{try{return readFileSync(join(profile,'DevToolsActivePort'),'utf8').trim().split('\n')}catch{return false}});
 ws=new WebSocket('ws://127.0.0.1:'+addr[0]+addr[1]);await once(ws,'open');
 let seq=0;const pending=new Map();
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(!m.id)return;const cb=pending.get(m.id);pending.delete(m.id);if(m.error)cb.reject(Error(m.error.message));else cb.resolve(m.result)};
 function cmd(method,params={},sessionId){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params,sessionId}))})}
 async function browser(){
   const {browserContextId}=await cmd('Target.createBrowserContext');
   const {targetId}=await cmd('Target.createTarget',{url:'about:blank',browserContextId});
   const {sessionId}=await cmd('Target.attachToTarget',{targetId,flatten:true});
   return {go:url=>cmd('Page.navigate',{url},sessionId),run:async expression=>{const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},sessionId);if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}};
 }
 const clients=[];let url=origin+'/network.html';
 for(let i=0;i<4;i++){
   const c=await browser();clients.push(c);await c.go(url);
   await until(()=>c.run("document.querySelector('#invite')?.value"));url=await c.run('location.href');
   await c.run("document.querySelector('#name').value='Player "+(i+1)+"';document.querySelector('#join button').click()");
   await until(()=>c.run("document.querySelector('#join')?.hidden"));
 }
 async function send(op,body){
   const id=location.hash.slice(1),r=await fetch('/api/rooms/'+id+'/'+op,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+sessionStorage.getItem('river-seat:'+id),'Content-Type':'application/json'},body:JSON.stringify(body)});
   return [r.status,await r.json()];
 }
 const api=(c,op='state',body)=>c.run('('+send.toString()+')('+JSON.stringify(op)+','+(JSON.stringify(body)||'undefined')+')');
 const initial=await Promise.all(clients.map(async(c,i)=>{const [status,s]=await api(c);assert.equal(status,200);assert.equal(s.me,i);assert.deepEqual(s.hand.cards.map(Boolean),[0,1,2,3].map(j=>j===i));assert.ok(!('deck' in s.hand));return s}));
 const v=initial[0].version;
 assert.equal((await api(clients[0],'act',{action:'call',version:v}))[0],409);
 async function click(i,re){const c=clients[i],expr='[...document.querySelectorAll("#actions button")].find(b=>'+re+'.test(b.textContent))';await until(()=>c.run('Boolean('+expr+')'));await c.run('('+expr+').click()')}
 await click(3,/^Call/);await until(async()=> (await api(clients[0]))[1].hand.turn===0);
 assert.equal((await api(clients[0],'act',{action:'raise',target:30,version:v}))[0],409);
 await stop(server);await boot();await clients[0].go(url);await until(()=>clients[0].run("document.querySelector('#join')?.hidden"));
 await click(0,/^All in$/);await click(1,/^All in$/);await click(2,/^All in$/);await click(3,/^Fold$/);
 const results=await Promise.all(clients.map(c=>until(async()=>{const [,s]=await api(c);return s.hand.end&&s})));
 const g=results[0].hand;assert.deepEqual(g.committed,[30,70,100,4]);assert.equal(g.board.length,5);assert.equal(g.cards[3],null);assert.equal(new Set([...g.board,...initial.flatMap((s,i)=>s.hand.cards[i])]).size,13);
 const ranks=initial.map((s,i)=>best([...s.hand.cards[i],...g.board]));
 const expected=[0,0,30,0];
 // Known contribution layers: 94 goes to the best of 0/1/2, 80 to the best of 1/2.
 for(const [amount,seats] of [[94,[0,1,2]],[80,[1,2]]]){
   const winners=seats.filter(i=>seats.every(j=>compare(ranks[i],ranks[j])>=0)).sort((a,b)=>(a+3)%4-(b+3)%4);
   winners.forEach((i,k)=>expected[i]+=Math.floor(amount/winners.length)+Number(k<amount%winners.length));
 }
 for(const s of results){assert.deepEqual(s.hand.end.payouts,expected);assert.deepEqual(s.hand.end.returns,[0,0,30,0]);assert.deepEqual(s.hand.stacks,expected.map((p,i)=>p+(i===3?96:0)))}
 assert.equal(g.stacks.reduce((a,b)=>a+b,0),300);
 for(const s of results){assert.equal(s.results[0].history.length,5);assert.deepEqual(s.results[0].board,g.board)}
 for(const c of clients)await until(()=>c.run("document.querySelector('#status')?.textContent.includes('settled')"));
 for(let i=0;i<4;i++){await click(i,/^Ready/);await until(async()=>{const [,s]=await api(clients[i]);return s.ready[i]||s.number===2});await delay(450)}
 console.log('PASS four isolated browsers, private cards, turn/version guards, reconnect after server restart, showdown, next hand. Board:',g.board.join(' '),'payouts:',expected,'stacks:',g.stacks);
}finally{ws?.close();await stop(chrome);await stop(server);rmSync(directory,{recursive:true,force:true,maxRetries:3,retryDelay:100})}
