import assert from 'node:assert/strict';
import {battleRules} from './battle-rules.mjs';
const event={settings:{id:'rules',name:'Owner rules',capacity:12,stack:100,blind:4,finalSeats:4,rushDurationMs:90000,entryCost:25,prizeShares:[70,30]},count:3,phase:'registration',bounty:{capital:30,remaining:19,paid:11}};
const before=JSON.stringify(event),rules=battleRules(event);
assert.equal(rules.name,'Owner rules');assert.match(rules.rush,/4 players/);assert.match(rules.duration,/90 seconds/);assert.match(rules.prizes,/70%.*30%/);assert.match(rules.bounty,/19.*11/);assert.equal(JSON.stringify(event),before);
const free=battleRules({...event,settings:{...event.settings,rushDurationMs:1,prizeShares:undefined},bounty:null});assert.match(free.duration,/0.001 seconds/);assert.match(free.prizes,/not configured/);assert.match(free.bounty,/not configured/);
assert.match(battleRules({...event,settings:{...event.settings,rushDurationMs:120000}}).duration,/2 minutes/);
for(const bad of [null,{}, {...event,settings:{...event.settings,finalSeats:0}}, {...event,settings:{...event.settings,rushDurationMs:NaN}}, {...event,settings:{...event.settings,prizeShares:[80,30]}}, {...event,bounty:{capital:30,remaining:20,paid:11}}])assert.throws(()=>battleRules(bad));
console.log('PASS configured Battle rules: exact duration/final seats/prize shares/bounty totals, unconfigured policies, immutable reads and invalid data guards');
