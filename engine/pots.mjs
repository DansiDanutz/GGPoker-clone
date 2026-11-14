// Seat indices are stable across pots, including for folded or absent contributors.
export function splitPots(chips, folded) {
  if (!Array.isArray(chips) || !Array.isArray(folded) || chips.length !== folded.length)
    throw new TypeError('Expected parallel contribution and fold arrays');
  let total = 0;
  for (let i = 0; i < chips.length; i++) {
    if (!Number.isSafeInteger(chips[i]) || chips[i] < 0 || typeof folded[i] !== 'boolean')
      throw new TypeError('Invalid contribution or fold at seat ' + i);
    total += chips[i];
    if (!Number.isSafeInteger(total)) throw new RangeError('Unsafe pot total');
  }
  const returns = chips.map(() => 0), pots = [];
  let previous = 0;
  for (const level of [...new Set(chips)].filter(n => n > 0).sort((a,b) => a-b)) {
    const payers = chips.flatMap((n,i) => n >= level ? [i] : []);
    const amount = (level - previous) * payers.length;
    previous = level;
    if (payers.length === 1) { returns[payers[0]] = amount; continue; }
    const eligible = payers.filter(i => !folded[i]);
    if (!eligible.length) throw new RangeError('No eligible seat for a contested pot');
    // Folded contribution boundaries do not create another pot or another odd-chip award.
    const last = pots.at(-1);
    if (last && last.eligible.length === eligible.length && eligible.every((seat,i)=>last.eligible[i]===seat)) last.amount += amount;
    else pots.push({amount, eligible});
  }
  return {pots, returns};
}

// compareSeats(a,b) is positive when seat a has the better hand.
function awardPot(amount,eligible,count,button,compareSeats){
  const payouts=Array(count).fill(0);if(amount===0)return payouts;
  let winners=[eligible[0]];
  for(const seat of eligible.slice(1)){
    const order=compareSeats(seat,winners[0]);
    if(order>0)winners=[seat];else if(order===0)winners.push(seat);
  }
  // Give odd chips clockwise starting at the first winning seat after the button.
  const distance=seat=>(seat-button-1+count)%count;
  winners.sort((a,b)=>distance(a)-distance(b));
  winners.forEach((seat,i)=>{payouts[seat]=Math.floor(amount/winners.length)+Number(i<amount%winners.length)});
  return payouts;
}
export function settlePots(chips, folded, button, compareSeats) {
  const {pots, returns} = splitPots(chips, folded);
  if (!Number.isInteger(button) || button < 0 || button >= chips.length) throw new RangeError('Invalid button');
  const payouts=[...returns];
  for(const pot of pots){pot.payouts=awardPot(pot.amount,pot.eligible,chips.length,button,compareSeats);pot.payouts.forEach((amount,seat)=>payouts[seat]+=amount)}
  return {payouts,returns,pots};
}

// Run allocations are explicit: the native inter-board odd-chip policy is not yet established.
export function settleRunouts(chips,folded,button,compareRuns,allocations){
  const {pots,returns}=splitPots(chips,folded);
  if(!Number.isInteger(button)||button<0||button>=chips.length)throw new RangeError('Invalid button');
  if(!Array.isArray(compareRuns)||compareRuns.length<1||compareRuns.length>3||Array.from(compareRuns).some(compare=>typeof compare!=='function'))throw new TypeError('Expected one to three board comparators');
  if(!Array.isArray(allocations)||allocations.length!==pots.length||Array.from(allocations).some((row,i)=>!Array.isArray(row)||row.length!==compareRuns.length||Array.from(row).some(n=>!Number.isSafeInteger(n)||n<0)||!Number.isSafeInteger(row.reduce((a,b)=>a+b,0))||row.reduce((a,b)=>a+b,0)!==pots[i].amount))throw new RangeError('Run allocations must exactly cover each contested pot');
  const payouts=[...returns];
  for(const [i,pot]of pots.entries()){
    pot.payouts=chips.map(()=>0);
    pot.runs=allocations[i].map((amount,run)=>{
      const shares=awardPot(amount,pot.eligible,chips.length,button,(a,b)=>{const order=compareRuns[run](a,b);if(!Number.isFinite(order))throw new TypeError('Invalid board comparison');return order});
      shares.forEach((value,seat)=>{pot.payouts[seat]+=value;payouts[seat]+=value});return {amount,payouts:shares};
    });
  }
  return {payouts,returns,pots};
}
