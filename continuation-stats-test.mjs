import assert from 'node:assert/strict';
import {startHand,act,options} from './engine/table.mjs';
const {continuationStats}=await import('./engine/table.mjs');
assert.equal(typeof continuationStats,'function');
const finish=g=>{let n=0;while(!g.end&&n++<100)act(g,options(g).due?'call':'check');assert.ok(g.end)};
const open=()=>{const g=startHand([120,120]);act(g,'raise',8);act(g,'call');assert.equal(g.board.length,3);return g};
const g=open();act(g,'check');act(g,'raise',8);act(g,'call');act(g,'check');act(g,'raise',16);act(g,'call');finish(g);
for(const street of ['flop','turn']){assert.equal(continuationStats(g,0)[street+'CbOpportunities'],1);assert.equal(continuationStats(g,0)[street+'CbBets'],1);assert.equal(continuationStats(g,1)[street+'CbResponses'],1);assert.equal(continuationStats(g,1)[street+'CbCalls'],1)}
const folded=open();act(folded,'check');act(folded,'raise',8);act(folded,'fold');assert.equal(continuationStats(folded,1).flopCbFolds,1);
const raised=open();act(raised,'check');act(raised,'raise',8);act(raised,'raise',24);finish(raised);assert.equal(continuationStats(raised,1).flopCbRaises,1);assert.equal(continuationStats(raised,1).turnCbOpportunities,1,'Previous street last aggressor can continue on turn');
const checked=open();act(checked,'check');act(checked,'check');act(checked,'check');act(checked,'raise',8);finish(checked);assert.equal(continuationStats(checked,0).flopCbOpportunities,1);assert.equal(continuationStats(checked,0).flopCbBets,0);assert.equal(continuationStats(checked,0).turnCbOpportunities,0,'Delayed bets are not immediate continuation samples');
const donk=open();act(donk,'raise',8);finish(donk);assert.equal(continuationStats(donk,0).flopCbOpportunities,0,'An earlier lead removes the unopened betting opportunity');
const allin=startHand([20,20]);act(allin,'raise',20);act(allin,'call');assert.ok(allin.end);assert.equal(continuationStats(allin,0).flopCbOpportunities,0,'Automatic all-in runouts create no betting opportunities');
const snapshot=JSON.stringify(g);continuationStats(g,0);assert.equal(JSON.stringify(g),snapshot);
const multi=startHand([120,120,120]);act(multi,'raise',8);act(multi,'call');act(multi,'call');act(multi,'check');act(multi,'check');act(multi,'raise',8);act(multi,'raise',24);act(multi,'call');finish(multi);assert.equal(continuationStats(multi,1).flopCbRaises,1);assert.equal(continuationStats(multi,2).flopCbResponses,0,'A later player faces the re-raise, not the original continuation bet');
const short=startHand([120,11]);act(short,'raise',8);act(short,'call');act(short,'check');act(short,'raise',8);act(short,'call');finish(short);assert.equal(continuationStats(short,1).flopCbCalls,1,'A short all-in call is a call response');assert.equal(short.stacks.reduce((a,b)=>a+b),131);
assert.equal(continuationStats({...g,end:null},0),null);assert.equal(continuationStats({...g,historyTrace:null},0),null);assert.equal(continuationStats({...g,variant:'aof'},0),null);
const bad=structuredClone(g);delete bad.historyTrace.actions[0].canRaise;assert.equal(continuationStats(bad,0),null);
assert.equal(continuationStats({...g,end:{}},0),null);assert.equal(continuationStats({...g,board:[]},99),null);
for(const variant of ['plo','plo5','plo6','rush','shortdeck']){const v=startHand(Array(6).fill(120),4,0,variant,0),aggressor=v.turn;act(v,'raise',8);while(v.board.length===0)act(v,'call');while(v.turn!==aggressor)act(v,'check');act(v,'raise',8);finish(v);assert.equal(continuationStats(v,aggressor).flopCbBets,1);assert.equal(v.stacks.reduce((a,b)=>a+b),720)}
console.log('PASS local continuation stats: flop/turn barrels, check, delayed bet, lead, call/fold/raise responses, all-in runout, legacy exclusions and immutable reads');
