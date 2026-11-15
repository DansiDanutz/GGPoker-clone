import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,writeFileSync,mkdirSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {openRooms} from './rooms.mjs';
const dir=mkdtempSync(join(tmpdir(),'tourney-player-pause-')),file=join(dir,'rooms.json'),clock=Date.now;let now=100000;Date.now=()=>now;
try{
 let req=openRooms(file,()=>0,true);const id='a'.repeat(48),names=['Alice','Bob','Cara'],table={name:'Player pause',mode:'tournament',tournamentSeats:3,stack:100,blind:4,levelSeconds:10,open:true,...(process.argv.includes('--plo')?{variant:'plo'}:{})},tokens=names.map(name=>req(id,'join',null,{name},table,name).issued);
 const call=(i,op,body={})=>req(id,op,tokens[i],body,table,names[i]),state=(i=0)=>call(i,'state'),tick=()=>req(id,'tick',null,{},table),total=s=>s.hand.stacks.reduce((n,v,i)=>n+v+(s.hand.end?0:s.hand.committed[i]),0);
 let s=state(),hand=structuredClone(s.hand);s=call(0,'sit-out',{paused:true});assert.equal(s.tournamentSitOutSupported,true);assert.equal(s.sitOutNextHand,true);assert.equal(s.sittingOut[0],false);assert.deepEqual(s.hand,hand);assert.equal(s.globalCashPause,undefined);assert.equal(s.returnMinimum,undefined);assert.equal(req.wallet('Alice').available,9975);assert.equal(req(id,'watch',null,{},table).sitOutNextHand,undefined);
 call(0,'sit-out',{paused:false});assert.equal(state().sitOutNextHand,false);call(0,'sit-out',{paused:true});const v=state().version;call(0,'sit-out',{paused:true});assert.equal(state().version,v);
 req=openRooms(file,()=>0,true);assert.equal(state().sitOutNextHand,true);assert.deepEqual(state().hand,hand);
 for(const body of [{},{paused:1},{paused:true,seat:1}])assert.throws(()=>call(0,'sit-out',body),e=>e.status===400);assert.throws(()=>req(id,'sit-out',tokens[0],{paused:false},table,'Bob'),e=>e.status===401);
 mkdirSync(file+'.tmp');assert.throws(()=>call(0,'sit-out',{paused:false}));rmdirSync(file+'.tmp');assert.equal(state().sitOutNextHand,true);
 while(!state().hand.end){s=state();call(s.hand.turn,'act',{version:s.version,action:'fold'})}
 now+=3000;tick();s=state();assert.equal(s.number,2);assert.equal(s.sittingOut[0],true);assert.equal(s.hand.cards[0].length,process.argv.includes('--plo')?4:2);assert.equal(s.hand.committed[0],4,'Paused tournament player must pay big blind');assert.equal(total(s),300);
 for(const i of [1,2]){s=state(i);call(i,'act',{version:s.version,action:s.hand.options.due?'call':'check'})}
 s=state();assert.equal(s.hand.turn,0);assert.equal(s.hand.options,null);assert.equal(s.hand.preAction,undefined);assert.throws(()=>call(0,'time-bank',{}),e=>e.status===409);assert.throws(()=>call(0,'act',{version:s.version,action:'check'}),e=>e.status===409);const committed=s.hand.committed[0];now+=500;tick();s=state();assert.equal(s.hand.board.length,3,'Paused actor checks when nothing is owed');assert.equal(s.hand.committed[0],committed);
 call(0,'sit-out',{paused:false});assert.equal(state().sittingOut[0],true,'Return must not replace a running hand');assert.equal(state().sitOutNextHand,false);req=openRooms(file,()=>0,true);assert.equal(state().sittingOut[0],true);
 while(!state().hand.end){s=state();if(s.hand.turn===0){now+=500;tick()}else{const actor=s.hand.turn,a=state(actor);call(actor,'act',{version:a.version,action:a.hand.options.due?'fold':'check'})}}
 now+=3000;tick();s=state();assert.equal(s.number,3);assert.equal(s.sittingOut[0],false);assert.equal(s.hand.cards[0].length,process.argv.includes('--plo')?4:2);assert.equal(total(s),300);
 const saved=readFileSync(file);for(const mutate of [r=>r.players[0].tourneySitOutNextHand='yes',r=>r.players[0].tourneySittingOut=false]){const bad=JSON.parse(saved);mutate(bad.find(([key])=>key===id)[1]);writeFileSync(file,JSON.stringify(bad));assert.throws(()=>openRooms(file,()=>0,true),/tournament player pause/i)}writeFileSync(file,saved);
 for(let i=0;i<3;i++)call(i,'sit-out',{paused:true});
 for(let n=0;n<10000&&state().tournament.winner===null;n++){s=state();if(s.hand.end)now+=3000;else if(!s.sittingOut[s.hand.turn]){const actor=s.hand.turn,a=state(actor);call(actor,'act',{version:a.version,action:a.hand.options.due?'fold':'check'})}now+=500;tick()}
 s=state();assert.notEqual(s.tournament.winner,null,'All paused tournament players must not deadlock');assert.equal(total(s),300);assert.equal(s.tournament.prizes.reduce((a,b)=>a+b),75);for(let i=0;i<3;i++)assert.equal(req.wallet(names[i]).available,9975+s.tournament.prizes[i]);const balances=names.map(n=>req.wallet(n).available);req=openRooms(file,()=>0,true);tick();assert.deepEqual(names.map(n=>req.wallet(n).available),balances);
 console.log('PASS tournament player pause: desired/applied separation,forced blind/cards,auto-check,return-next-hand,private state/auth/validation,write rollback,restart,all-paused winner and once-only funded payouts');
}finally{Date.now=clock;rmSync(dir,{recursive:true,force:true})}
