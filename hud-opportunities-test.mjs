import assert from 'node:assert/strict';
import {startHand,act,options,quickFold} from './engine/table.mjs';
const play=(g,action,target)=>act(g,action,target);
const finish=g=>{let n=0;while(!g.end&&n++<100)act(g,options(g).due?'call':'check');assert.ok(g.end)};
const game=startHand(Array(6).fill(120));play(game,'fold');
assert.equal(game.historyTrace.actions[0].canRaise,true,'Capture legal raise eligibility before the action');
const {preflopOpportunities}=await import('./engine/table.mjs');
play(game,'fold');play(game,'raise',8);play(game,'call');play(game,'raise',12);finish(game);
assert.deepEqual(preflopOpportunities(game,5),{stealOpportunities:1,stealRaises:1,threeBetOpportunities:0,threeBets:0});
assert.deepEqual(preflopOpportunities(game,0),{stealOpportunities:0,stealRaises:0,threeBetOpportunities:1,threeBets:0});
assert.deepEqual(preflopOpportunities(game,1),{stealOpportunities:0,stealRaises:0,threeBetOpportunities:1,threeBets:1});
assert.equal(preflopOpportunities(game,2).threeBetOpportunities,0,'A fourth bet is not a third-bet opportunity');
const snapshot=JSON.stringify(game);preflopOpportunities(game,0);assert.equal(JSON.stringify(game),snapshot);
const missing=structuredClone(game);delete missing.historyTrace.actions[0].canRaise;assert.equal(preflopOpportunities(missing,0),null,'Unknown old decisions do not become zeros');
const limp=startHand(Array(6).fill(120));play(limp,'call');play(limp,'fold');play(limp,'raise',8);finish(limp);assert.equal(preflopOpportunities(limp,5).stealOpportunities,0,'A limped pot is not unopened');
const short=startHand([120,120,120,120,6,120]);play(short,'call');play(short,'raise',6);for(let i=0;i<4;i++)play(short,'call');assert.equal(short.turn,3);assert.equal(options(short).raise,false);play(short,'call');finish(short);assert.equal(preflopOpportunities(short,3).threeBetOpportunities,0,'A short raise that does not reopen action creates no legal re-raise opportunity');
for(const stacks of [[120,0,120,0,120,0],[120,0,0,0,120,0]]){const sparse=startHand(stacks);assert.equal(sparse.turn,0);play(sparse,'raise',8);finish(sparse);assert.equal(preflopOpportunities(sparse,0).stealRaises,1);assert.equal(preflopOpportunities(sparse,4).stealOpportunities,0,'Big blind is never cutoff');}
const rush=startHand(Array(6).fill(120),4,0,'rush');quickFold(rush,5);assert.equal(rush.historyTrace.actions[0].canRaise,false,'Out-of-turn quick-fold is not a future steal opportunity');finish(rush);assert.equal(preflopOpportunities(rush,5).stealOpportunities,0);
assert.equal(preflopOpportunities({...game,variant:'shortdeck'},0),null);
for(const variant of ['plo','plo5','plo6','rush']){const g=startHand(Array(6).fill(120),4,0,variant,variant==='rush'?0:2);play(g,'fold');play(g,'fold');play(g,'raise',8);play(g,'call');play(g,'raise',12);finish(g);assert.equal(preflopOpportunities(g,5).stealRaises,1);assert.equal(preflopOpportunities(g,1).threeBets,1);assert.equal(g.stacks.reduce((a,b)=>a+b),720)}
console.log('PASS ATS/3bet: unopened CO/BTN/SB, limp exclusion, legal reraise opportunities, short-allin reopening, sparse/heads-up, early Rush fold, legacy uncertainty and immutable reads');
