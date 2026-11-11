// Four separate Chrome storage contexts, real UI actions, ephemeral server and data.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';
import {best,compare} from './game.mjs';
const tournament=process.argv.includes('--tournament');
const directory=mkdtempSync(join(tmpdir(),'network-poker-')), profile=join(directory,'chrome');
const port=20000+Math.floor(Math.random()*20000),origin='http://127.0.0.1:'+port;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<200;i++){const v=await fn();if(v)return v;await delay(50)}throw Error('Timed out: '+fn)}
let server,chrome,ws;
async function boot(){server=spawn(process.execPath,['server.mjs'],{cwd:new URL('.',import.meta.url),env:{...process.env,PORT:String(port),POKER_LEVEL_MS:'10000',POKER_PUBLIC_ORIGIN:origin,POKER_BIND_HOST:'127.0.0.1',POKER_DATA_DIR:directory},stdio:['ignore','pipe','inherit']});await until(async()=>{if(server.exitCode!==null)throw Error('Server failed');return fetch(origin+'/api/tables').then(r=>r.ok,()=>false)})}
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
 const clients=[];let url=origin+'/network.html'+(tournament?'?mode=tournament':'');
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
 async function click(i,re){const c=clients[i],expr='[...document.querySelectorAll("#actions button")].find(b=>'+re+'.test(b.textContent))';await until(()=>c.run('Boolean('+expr+')'));await c.run('('+expr+').click()')}
 if(tournament){
   await playTournament(clients,api,click,url);
 }else{
 const initial=await Promise.all(clients.map(async(c,i)=>{const [status,s]=await api(c);assert.equal(status,200);assert.equal(s.me,i);assert.deepEqual(s.hand.cards.map(Boolean),[0,1,2,3].map(j=>j===i));assert.ok(!('deck' in s.hand));return s}));
 const v=initial[0].version;
 assert.equal((await api(clients[0],'act',{action:'call',version:v}))[0],409);
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
 }
}finally{ws?.close();await stop(chrome);await stop(server);rmSync(directory,{recursive:true,force:true,maxRetries:3,retryDelay:100})}

async function playTournament(clients,api,click,url){
 const state=async(i=0)=>(await api(clients[i]))[1];
 let s=await state(),last=0,stackBefore=[100,100,100,100],sawHeadsUp=false,sawIncrease=false;
 assert.equal(s.tournament.pool,100);assert.deepEqual(s.names,['Player 1','Player 2','Player 3','Player 4']);assert.equal(s.hand.blind,4);
 // Let a scheduled boundary pass without changing the blinds or bets mid-hand.
 await delay(10100);s=await state();assert.equal(s.hand.blind,4);
 const eliminated=new Set();
 for(let actions=0;actions<150;actions++){
   s=await state();const g=s.hand,t=s.tournament;
   if(g.blind>4)sawIncrease=true;
   if(g.end&&s.number!==last){
     const expected=[0,0,0,0];
     for(let unit=1;unit<=Math.max(...g.committed);){
       const payers=[0,1,2,3].filter(i=>g.committed[i]>=unit);
       const high=Math.min(...payers.map(i=>g.committed[i]));
       const amount=(high-unit+1)*payers.length;unit=high+1;
       if(payers.length===1){expected[payers[0]]+=amount;continue}
       const eligible=payers.filter(i=>!g.folded[i]);
       let wins=eligible;
       if(eligible.length>1){
         const ranked=eligible.map(i=>best([...g.cards[i],...g.board]));
         wins=eligible.filter((_,j)=>ranked.every(r=>compare(ranked[j],r)>=0));
       }
       wins.sort((a,b)=>(a-g.button+3)%4-(b-g.button+3)%4);
       wins.forEach((i,k)=>expected[i]+=Math.floor(amount/wins.length)+Number(k<amount%wins.length));
     }
     assert.deepEqual(g.end.payouts,expected);
     assert.deepEqual(g.stacks,expected.map((x,i)=>stackBefore[i]-g.committed[i]+x));
     assert.equal(g.stacks.reduce((a,b)=>a+b,0),400);stackBefore=[...g.stacks];last=s.number;
     for(const i of eliminated)assert.equal(g.committed[i],0);
     for(let i=0;i<4;i++)if(!g.stacks[i]){assert.ok(t.out[i]);eliminated.add(i)}
     console.log('Tournament hand',last,'blinds',g.blind/2,g.blind,'stacks',g.stacks);
   }
   if(t.winner!==null)break;
   if(g.end){await until(async()=>(await state()).number>s.number);continue}
   if(eliminated.size===2)sawHeadsUp=true;
   assert.ok(!eliminated.has(g.turn));
   const i=g.turn,own=await state(i),o=own.hand.options;
   // Get to heads-up by playing two seats against one another at a time.
   const live=stackBefore.map((v,j)=>v?j:-1).filter(j=>j>=0);
   const battle=last===0?[1,2]:live.slice(0,2);
   const re=!battle.includes(i)&&o.due?/^Fold$/:battle.includes(i)&&o.raise?/^All in$/:o.due?/^Call /:/^Check$/;
   await click(i,re);await until(async()=>(await state()).version>s.version);
 }
 s=await state();const w=s.tournament.winner;
 assert.notEqual(w,null);assert.equal(eliminated.size,3);assert.ok(sawIncrease);assert.ok(sawHeadsUp);
 const prizes=[0,0,0,0];prizes[w]=100;
 for(let i=0;i<4;i++){
   const final=await state(i);assert.deepEqual(final.tournament.prizes,prizes);assert.equal(final.hand.stacks[w],400);
   await until(()=>clients[i].run("document.querySelector('#status')?.textContent.includes('Tournament winner:')"));
 }
 assert.equal((await api(clients[w],'ready',{version:s.version}))[0],409);
 await stop(server);await boot();await clients[w].go(url);
 assert.deepEqual((await until(async()=>{try{return (await state(w)).tournament}catch{return false}})).prizes,prizes);
 console.log('PASS four registered browsers; scheduled levels, three eliminations, heads-up, persisted final prize. Winner: Player',w+1,'prizes:',prizes);
}
