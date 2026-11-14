import assert from 'node:assert/strict';
import {autoFoldItems,autoFoldHandKey,readAutoFoldPreferences,eligibleAutoFold} from './auto-fold.mjs';
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
