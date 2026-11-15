import assert from 'node:assert/strict';
import {autoFoldItems,autoFoldHandKey,readAutoFoldPreferences,eligibleAutoFold,autoFoldMatrix,autoFoldRateSelection,autoFoldSelectedRate,editAutoFoldSelection,createAutoFold} from './auto-fold.mjs';
import {startHand,act,canQuickFold} from './engine/table.mjs';
const items=new Map(autoFoldItems.map(item=>[item.key,item]));
assert.equal(items.size,169);assert.deepEqual(autoFoldItems.map(i=>i.index),Array.from({length:169},(_,i)=>i));
const deck=[...'23456789TJQKA'].flatMap(rank=>[...'cdhs'].map(suit=>rank+suit)),counts=new Map();
for(let a=0;a<52;a++)for(let b=a+1;b<52;b++){const key=autoFoldHandKey([deck[a],deck[b]]);assert.ok(items.has(key),key);assert.equal(autoFoldHandKey([deck[b],deck[a]]),key);counts.set(key,(counts.get(key)||0)+1)}
assert.equal([...counts.values()].reduce((a,b)=>a+b),1326);
for(const [key,count]of counts)assert.equal(count,key.endsWith('s')?4:key.endsWith('o')?12:6,key);
for(const bad of [null,[],['Ac'],['Ac','Ac'],['1c','Ad'],['Ac','AD'],['Ac','Ad','Ah'],[null,'Ad']])assert.equal(autoFoldHandKey(bad),null);
const defaults=readAutoFoldPreferences();assert.equal(defaults.active,false);assert.equal(defaults.button,true);assert.equal(defaults.blinds,true);assert.equal(defaults.selected.length,59);assert.ok(defaults.selected.includes(items.get('72o').index));assert.ok(!defaults.selected.includes(items.get('AA').index));
const saved={active:true,button:true,blinds:true,selected:[items.get('AKs').index]};assert.deepEqual(readAutoFoldPreferences(JSON.stringify(saved)),saved);
for(const bad of ['{',null,'null',JSON.stringify({...saved,active:'true'}),JSON.stringify({...saved,selected:[169]}),JSON.stringify({...saved,selected:[0,0]}),JSON.stringify({...saved,selected:[0.5]}),JSON.stringify({...saved,blinds:undefined})])assert.equal(readAutoFoldPreferences(bad).active,false);
defaults.selected.length=0;assert.equal(readAutoFoldPreferences().selected.length,59);
const settings={supported:true,catchUp:false,cashDropToPot:false},all={active:true,button:true,blinds:true,selected:autoFoldItems.map(i=>i.index)},game=startHand(Array(6).fill(100),4,0,'rush');
function state(g,me){return {registered:true,me,settings:{variant:'rush'},hand:{end:g.end,board:g.board,button:g.button,bigBlindSeat:g.bigBlindSeat,stacks:g.stacks,folded:g.folded,cards:g.hands.map((h,i)=>i===me?h:null),quickFoldAllowed:canQuickFold(g,me),preAction:{rush:true,acted:g.actedAt[me]!==null}}}}
for(let seat=0;seat<6;seat++){const s=state(game,seat);assert.equal(eligibleAutoFold(s,all,settings),true);assert.equal(eligibleAutoFold(s,{...all,button:false},settings),seat!==0);assert.equal(eligibleAutoFold(s,{...all,blinds:false},settings),![1,2].includes(seat));assert.equal(eligibleAutoFold(s,{...all,selected:[]},settings),false)}
const base=state(game,3);for(const context of [{},{...settings,supported:false},{...settings,catchUp:true},{...settings,cashDropToPot:true}])assert.equal(eligibleAutoFold(base,all,context),false);
for(const patch of [{registered:false},{me:null},{settings:{variant:'plo'}},{battlePhase:'rush'},{battleFinal:{event:'test'}},{tournament:{}}])assert.equal(eligibleAutoFold({...base,...patch},all,settings),false);
for(const patch of [{board:['Ac','Kd','Qh']},{end:{}},{quickFoldAllowed:false},{cards:Array(6).fill(null)},{preAction:{rush:true,acted:true}},{bigBlindSeat:5},{stacks:Array(6).fill(NaN)}])assert.equal(eligibleAutoFold({...base,hand:{...base.hand,...patch}},all,settings),false);
assert.equal(eligibleAutoFold(base,{...all,active:false},settings),false);
act(game,'call');assert.equal(eligibleAutoFold(state(game,3),all,settings),false,'A player who already acted must never auto-fold');
while(!game.end&&!game.board.length){const i=game.turn;act(game,game.price>game.bets[i]?'call':'check')}
assert.ok(game.board.length>0);for(let i=0;i<6;i++)assert.equal(eligibleAutoFold(state(game,i),all,settings),false);
console.log('PASS Auto Fold foundation: all1326 hole pairs/169 native classes, strict disabled recovery, position/format/catch-up/cash-drop/first-action guards; not yet enabled in UI');

assert.equal(autoFoldMatrix.length,169);assert.deepEqual(autoFoldMatrix.slice(0,13).map(i=>i.key),['AA','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s']);assert.equal(autoFoldMatrix[13].key,'AKo');assert.equal(autoFoldMatrix[168].key,'22');
for(let rate=1;rate<=95;rate++){const selected=autoFoldRateSelection(rate);assert.ok(selected.length>0);assert.deepEqual(selected,autoFoldMatrix.filter(i=>i.gageRate<=rate).map(i=>i.index))}
for(const rate of [0,96,50.5,NaN])assert.throws(()=>autoFoldRateSelection(rate));
const one=[items.get('72o').index];assert.deepEqual(editAutoFoldSelection(one,one[0],false),one);const two=editAutoFoldSelection(one,0,true);assert.equal(two.length,2);assert.equal(one.length,1);assert.deepEqual(editAutoFoldSelection(two,0,true),two);assert.deepEqual(editAutoFoldSelection(two,0,false),one);
let selected=[];for(const item of autoFoldMatrix){const before=selected;selected=editAutoFoldSelection(selected,item.index,true);if(Math.floor(autoFoldSelectedRate(before))>=96)assert.deepEqual(selected,before)}assert.ok(Math.floor(autoFoldSelectedRate(selected))>=96);assert.ok(selected.length<169);
const callbacks=new Map();let serial=0,sends=0,delay;
const schedule=(callback,ms)=>{delay=ms;callbacks.set(++serial,callback);return serial},cancel=id=>callbacks.delete(id),flush=async()=>{const pending=[...callbacks.values()];callbacks.clear();for(const fn of pending)await fn()};
const fresh=startHand(Array(6).fill(100),4,0,'rush');let current={identity:'account:holdem',state:{...state(fresh,3),number:1,handVersion:'1:0'},prefs:all,context:settings,busy:false};
const controller=createAutoFold(()=>current,async()=>{sends++;return true},schedule,cancel);
controller.observe();assert.equal(controller.pending,false,'First read is catch-up');current={...current,state:{...current.state,handVersion:'1:1'}};controller.observe();assert.equal(delay,1000);assert.equal(controller.pending,true);controller.observe();assert.equal(callbacks.size,1,'Polling must not reset or duplicate timer');await flush();assert.equal(sends,1);controller.observe();assert.equal(callbacks.size,0,'Same frame is consumed');
for(const change of [c=>({...c,prefs:{...all,active:false}}),c=>({...c,identity:'other:holdem'}),c=>({...c,state:{...c.state,number:2,handVersion:'2:0'}}),c=>({...c,busy:true}),c=>({...c,context:{...settings,catchUp:true}})]){current={identity:'account:holdem',state:{...state(fresh,3),number:1,handVersion:'1:'+serial},prefs:all,context:settings,busy:false};controller.observe();current={...current,state:{...current.state,handVersion:current.state.handVersion+'a'}};controller.observe();assert.equal(controller.pending,true);current=change(current);await flush();assert.equal(sends,1,'Stale timer must not fold')}
controller.interrupt();assert.equal(controller.pending,false);controller.observe();assert.equal(controller.pending,false,'Recovery consumes current snapshot');current={...current,busy:false,state:{...current.state,handVersion:'new'}};controller.observe();controller.preferencesChanged();assert.equal(controller.pending,false);await flush();assert.equal(sends,1,'Preference edits cancel queued folds');


controller.interrupt();current={identity:'account:holdem',state:{...state(fresh,3),number:1,handVersion:'queued0'},prefs:all,context:settings,busy:false};controller.observe();current={...current,state:{...current.state,handVersion:'queued1'}};controller.observe();const late=[...callbacks.values()][0];assert.equal(typeof late,'function');controller.interrupt();await late();assert.equal(sends,1,'An already-queued callback must be invalid after interruption');

console.log('PASS native matrix/rate/drag constraints and1s Auto Fold leases: no replay, no duplicate polling timer, identity/hand/preferences/busy/catch-up and queued-callback cancellation');
