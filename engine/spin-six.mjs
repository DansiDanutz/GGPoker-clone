import {prizeAmounts} from './prizes.mjs';
import {spinPracticeClock} from './spin.mjs';

const fields=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&Object.keys(value).every(k=>keys.includes(k));
const bad=()=>{throw Object.assign(Error('Provide complete explicit local-practice six-seat Spin rules'),{status:400})};

// Native six-seat effective odds and blind ladders are not inferred from 3-Max.
export function spinSixConfiguration(value){
 if(!fields(value,['mode','seats','buyIn','smallBlinds','clock','outcomes'])||value.mode!=='local-practice'||value.seats!==6||!Number.isSafeInteger(value.buyIn)||value.buyIn<1||value.buyIn>1000000000)bad();
 if(!fields(value.clock,['actionSeconds','freeTimeChipSecondsPerUnit','maxTimeChipsPerAction']))bad();
 const blinds=value.smallBlinds;
 if(!Array.isArray(blinds)||!blinds.length||blinds.length>64||![...blinds].every((n,i)=>Number.isSafeInteger(n)&&n>=1&&n<=Math.floor(Number.MAX_SAFE_INTEGER/2)&&(!i||n>blinds[i-1])))bad();
 if(!Array.isArray(value.outcomes)||!value.outcomes.length||value.outcomes.length>32)bad();
 const outcomes=[],multipliers=new Set();let frequency=0,clock;
 for(const row of value.outcomes){
  if(!fields(row,['multiplier','frequency','prizeShares','startingChips','timeBankCards','noDealing','unit','interval'])||!Number.isSafeInteger(row.multiplier)||row.multiplier<1||!Number.isSafeInteger(value.buyIn*row.multiplier)||multipliers.has(row.multiplier)||!Number.isSafeInteger(row.frequency)||row.frequency<1||row.frequency>100000000||!Number.isInteger(row.startingChips)||row.startingChips<300||row.startingChips>1000||!Number.isInteger(row.timeBankCards)||row.timeBankCards<1||row.timeBankCards>4||row.noDealing!==false||!['minutes','hands'].includes(row.unit)||!Number.isSafeInteger(row.interval)||row.interval<1||row.interval>60)bad();
  const shares=row.prizeShares;
  if(!Array.isArray(shares)||!shares.length||shares.length>6||![...shares].every(n=>Number.isInteger(n)&&n>0&&n<=100)||shares.reduce((a,b)=>a+b,0)!==100)bad();
  clock=spinPracticeClock(value.clock,row);multipliers.add(row.multiplier);frequency+=row.frequency;outcomes.push({...row,prizeShares:[...shares]});
 }
 if(frequency!==100000000)bad();
 return {mode:'local-practice',seats:6,buyIn:value.buyIn,smallBlinds:[...blinds],clock,outcomes};
}

export function spinSixOutcome(configuration,ticket){
 const c=spinSixConfiguration(configuration);
 if(!Number.isSafeInteger(ticket)||ticket<0||ticket>=100000000)throw new RangeError('Spin ticket must be an integer from0 to99999999');
 for(const row of c.outcomes){
  if(ticket<row.frequency){const prizePool=c.buyIn*row.multiplier,amounts=prizeAmounts(prizePool,row.prizeShares);return {mode:c.mode,seats:6,buyIn:c.buyIn,multiplier:row.multiplier,frequency:row.frequency,startingChips:row.startingChips,timeBankCards:row.timeBankCards,noDealing:false,unit:row.unit,interval:row.interval,prizePool,prizes:Array.from({length:6},(_,i)=>amounts[i]||0)}}
  ticket-=row.frequency;
 }
 throw Error('Invalid six-seat Spin probability total');
}

export function spinSixBlindLevel(configuration,multiplier,{startedAt,now,completedHands}){
 const c=spinSixConfiguration(configuration),row=c.outcomes.find(r=>r.multiplier===multiplier);
 if(!row)throw new RangeError('Unconfigured six-seat Spin multiplier');
 if(![startedAt,now,completedHands].every(n=>Number.isSafeInteger(n)&&n>=0))throw new RangeError('Spin clock and hand count must be nonnegative safe integers');
 const index=Math.min(c.smallBlinds.length-1,row.unit==='hands'?Math.floor(completedHands/row.interval):Math.floor(Math.max(0,now-startedAt)/(row.interval*60000)));
 return {level:index+1,smallBlind:c.smallBlinds[index],bigBlind:c.smallBlinds[index]*2,unit:row.unit,interval:row.interval};
}
