import {prizeAmounts} from './prizes.mjs';
// Native PLAYGG.RO 3-Max play-money dialogs, captured in observed-spin-playmoney-*.png.
const outcomes=[
 [20000,5,[50,30,20],'hands',20],
 [100,4000,[60,30,10],'hands',15],
 [50,8000,[60,30,10],'hands',15],
 [10,2450000,[80,20],'hands',10],
 [5,2800000,[100],'minutes',3],
 [4,3000000,[100],'minutes',2],
 [3,44124010,[100],'minutes',2],
 [2,47613985,[100],'minutes',1]
];
export const spinSmallBlinds=Object.freeze([10,15,20,30,40,50,60,75,90,100,125,150,175,200,225,250,300,350,400,500,600,750,900,1000,1250,1500]);
export function spinPayouts(buyIn){
 if(![5000,10000].includes(buyIn))throw new RangeError('Only observed 5000/10000 play-money stakes are configured');
 return outcomes.map(([multiplier,frequency,shares,unit,interval])=>{const amounts=prizeAmounts(buyIn*multiplier,shares);return {multiplier,frequency,prizePool:buyIn*multiplier,prizes:Array.from({length:3},(_,i)=>amounts[i]||0),unit,interval}});
}
export function spinOutcome(buyIn,ticket){
 if(!Number.isSafeInteger(ticket)||ticket<0||ticket>=100000000)throw new RangeError('Spin ticket must be an integer from 0 to 99999999');
 for(const row of spinPayouts(buyIn)){if(ticket<row.frequency)return {...row,buyIn,seats:3,startingChips:null,timeBankCards:null};ticket-=row.frequency}
 throw Error('Invalid probability total');
}
export function spinBlindLevel(multiplier,{startedAt,now,completedHands}){
 const row=outcomes.find(row=>row[0]===multiplier);if(!row)throw new RangeError('Unobserved spin multiplier');
 if(![startedAt,now,completedHands].every(n=>Number.isSafeInteger(n)&&n>=0))throw new RangeError('Spin clock and hand count must be nonnegative safe integers');
 const index=Math.min(spinSmallBlinds.length-1,row[3]==='hands'?Math.floor(completedHands/row[4]):Math.floor(Math.max(0,now-startedAt)/(row[4]*60000)));
 return {level:index+1,smallBlind:spinSmallBlinds[index],bigBlind:spinSmallBlinds[index]*2,unit:row[3],interval:row[4]};
}

// Explicit owner practice rules only; native per-outcome configuration remains unresolved.
export function spinPracticeConfiguration(configuration,buyIn){
 const rows=spinPayouts(buyIn),bad=()=>{throw Object.assign(Error('Provide complete explicit local-practice Spin rules'),{status:400})};
 if(!configuration||Object.keys(configuration).some(k=>!['mode','outcomes'].includes(k))||configuration.mode!=='local-practice'||!Array.isArray(configuration.outcomes)||configuration.outcomes.length!==rows.length)bad();
 const outcomes=rows.map(row=>{const matches=configuration.outcomes.filter(c=>c?.multiplier===row.multiplier);if(matches.length!==1)bad();const c=matches[0];if(Object.keys(c).some(k=>!['multiplier','startingChips','timeBankCards','noDealing'].includes(k))||!Number.isInteger(c.startingChips)||c.startingChips<300||c.startingChips>1000||!Number.isInteger(c.timeBankCards)||c.timeBankCards<1||c.timeBankCards>4||typeof c.noDealing!=='boolean')bad();return {multiplier:c.multiplier,startingChips:c.startingChips,timeBankCards:c.timeBankCards,noDealing:c.noDealing}});
 return {mode:'local-practice',outcomes};
}

export function spinPracticeClock(rules,outcome){if(!rules||Object.keys(rules).some(k=>!['actionSeconds','freeTimeChipSecondsPerUnit','maxTimeChipsPerAction'].includes(k))||!Number.isInteger(rules.actionSeconds)||rules.actionSeconds<1||rules.actionSeconds>120||!Number.isInteger(rules.freeTimeChipSecondsPerUnit)||rules.freeTimeChipSecondsPerUnit<1||rules.freeTimeChipSecondsPerUnit>60||!Number.isInteger(rules.maxTimeChipsPerAction)||rules.maxTimeChipsPerAction<1||rules.maxTimeChipsPerAction>outcome.timeBankCards){throw Object.assign(Error('Provide complete explicit practice clock rules'),{status:400})};return {actionSeconds:rules.actionSeconds,freeTimeChipSecondsPerUnit:rules.freeTimeChipSecondsPerUnit,maxTimeChipsPerAction:rules.maxTimeChipsPerAction}}
