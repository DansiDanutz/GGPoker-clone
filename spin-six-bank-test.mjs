import assert from 'node:assert/strict';
import {spinBank} from './spin-bank.mjs';
import {spinSixOutcome} from './engine/spin-six.mjs';
const config={mode:'local-practice',seats:6,buyIn:101,smallBlinds:[5,10,20],clock:{actionSeconds:12,freeTimeChipSecondsPerUnit:15,maxTimeChipsPerAction:1},outcomes:[
 {multiplier:12,frequency:25000000,prizeShares:[50,30,20],startingChips:300,timeBankCards:2,noDealing:false,unit:'hands',interval:10},
 {multiplier:4,frequency:75000000,prizeShares:[100],startingChips:300,timeBankCards:1,noDealing:false,unit:'minutes',interval:1}
]};
const reload=b=>spinBank(JSON.parse(JSON.stringify(b.state))),fund=(amount=1000)=>{const b=spinBank();b.fund({sequence:1,amount,reason:'Explicit six-seat fixture'});return b};
for(const ticket of [0,25000000]){
 let b=fund();const wallets=Array(6).fill(1000),original=structuredClone(config),r=b.reserve('six',101,config);
 assert.equal(r.amount,606);assert.equal(b.state.version,5);assert.equal(b.summary().available,394);assert.equal(b.summary().reserved,606);assert.deepEqual(config,original);
 const unchanged=structuredClone(b.state);assert.deepEqual(b.reserve('six',101,structuredClone(config)),r);assert.deepEqual(b.state,unchanged);
 const reordered={...config,outcomes:config.outcomes.map(row=>Object.fromEntries(Object.entries(row).reverse()))};assert.deepEqual(b.reserve('six',101,reordered),r);
 const changed=structuredClone(config);changed.outcomes[0].frequency--;changed.outcomes[1].frequency++;assert.throws(()=>b.reserve('six',101,changed),e=>e.status===409);assert.deepEqual(b.state,unchanged);
 r.configuration.smallBlinds[0]=99;assert.equal(b.summary().reservations[0].configuration.smallBlinds[0],5);
 for(let i=0;i<6;i++){b.insure('six','p'+i,{premium:10,payout:40});wallets[i]-=111}
 const insured=structuredClone(b.state);assert.throws(()=>b.insure('six','seventh',{premium:10,payout:40}),e=>e.status===409);assert.deepEqual(b.state,insured);b=reload(b);assert.equal(b.state.version,5);assert.equal(b.summary().reserved,846);
 const awards=b.settleInsurance('six',ticket),trigger=ticket===25000000;assert.equal(awards.length,6);assert.ok(awards.every(a=>a.amount===(trigger?40:0)));for(let i=0;i<6;i++)wallets[i]+=awards[i].amount;assert.equal(b.state.version,5);const decided=structuredClone(b.state);assert.deepEqual(b.settleInsurance('six',ticket),awards);assert.deepEqual(b.state,decided);
 const prizes=spinSixOutcome(config,ticket).prizes;prizes.forEach((n,i)=>wallets[i]+=n);const settled=b.settle('six',ticket);assert.equal(b.summary().reserved,0);assert.equal(b.summary().available,ticket===0?454:1022);assert.equal(b.summary().available+wallets.reduce((a,b)=>a+b),7000);b=reload(b);assert.deepEqual(b.settle('six',ticket),settled);assert.throws(()=>b.settle('six',ticket===0?25000000:0),e=>e.status===409);assert.throws(()=>b.cancel('six'),e=>e.status===409);
}
let b=fund(605),before=structuredClone(b.state);assert.throws(()=>b.reserve('short',101,config),e=>e.status===409);assert.deepEqual(b.state,before);
b=fund();b.reserve('cancel',101,config);b.insure('cancel','p0',{premium:10,payout:40});assert.throws(()=>b.cancel('cancel'),e=>e.status===409);b.cancelInsurance('cancel','p0');b.cancel('cancel');assert.equal(b.summary().available,1000);assert.equal(b.summary().reserved,0);b=reload(b);
const low=structuredClone(config);low.outcomes=[{...low.outcomes[1],frequency:100000000}];b=spinBank();assert.equal(b.reserve('low',101,low).amount,0);b.settle('low',0);assert.equal(b.summary().available,202);b=reload(b);
b=spinBank();b.reserve('self-covered',101,low);b.insure('self-covered','p0',{premium:40,payout:40});b=reload(b);assert.equal(b.state.sequence,0);assert.deepEqual(b.settleInsurance('self-covered',0),[{account:'p0',amount:40}]);b.settle('self-covered',0);b=reload(b);assert.equal(b.summary().available,202);
let legacy=fund(200000000);legacy.reserve('old',5000);legacy.insure('old','p0',{premium:10,payout:20});assert.equal(legacy.state.version,4);legacy=reload(legacy);legacy.reserve('new',101,config);assert.equal(legacy.state.version,5);legacy.insure('new','p1',{premium:10,payout:40});legacy.settleInsurance('old',99999999);assert.equal(legacy.state.version,5);legacy.settle('old',99999999);legacy.settleInsurance('new',25000000);legacy.settle('new',25000000);legacy=reload(legacy);assert.equal(legacy.summary().reserved,0);assert.equal(legacy.summary().available,200005162);
for(const corrupt of [s=>s.reservations.find(r=>r.id==='new').amount++,s=>s.reservations.find(r=>r.id==='new').configuration.buyIn++,s=>s.version=4,s=>s.insurance.find(p=>p.id==='new').payout++]){const state=structuredClone(legacy.state);corrupt(state);assert.throws(()=>spinBank(state));}
// A compact checkpoint tests large offsetting totals without millions of funding calls.
const maximum=Number.MAX_SAFE_INTEGER,sequence=10000000;
const largeReservation=(id,buyIn,multiplier)=>{const configuration=structuredClone(low);configuration.buyIn=buyIn;configuration.outcomes[0].multiplier=multiplier;return {id,buyIn,amount:Math.max(0,buyIn*multiplier-6*buyIn),cancelled:false,ticket:0,settledAtSequence:sequence,configuration}};
const large={version:5,available:4000000012,funded:maximum,sequence,events:Array.from({length:100},(_,i)=>({sequence:sequence-99+i,amount:1000000000,reason:'Large-total fixture',at:1,available:maximum-(99-i)*1000000000})),reservations:[largeReservation('large-a',1,maximum),largeReservation('large-b',1,6000000000),largeReservation('profit-a',1000000000,1),largeReservation('profit-b',1000000000,1)],insurance:[]};
assert.equal(spinBank(large).summary().net,Number(4000000012n-BigInt(maximum)));assert.equal(reload(spinBank(large)).summary().available,4000000012);
console.log('PASS six-seat Spin bank:full exposure,zero hold floor,six X4 policies,exact conservation/refunds/idempotence,isolated rules,version4→5 mixed migration/restart and corruption guards; registration/UI remain gated');
