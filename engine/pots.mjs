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
export function settlePots(chips, folded, button, compareSeats) {
  const {pots, returns} = splitPots(chips, folded);
  if (!Number.isInteger(button) || button < 0 || button >= chips.length) throw new RangeError('Invalid button');
  const payouts = [...returns];
  for (const pot of pots) {
    const {amount,eligible} = pot;
    let winners = [eligible[0]];
    for (const seat of eligible.slice(1)) {
      const order = compareSeats(seat,winners[0]);
      if (order > 0) winners = [seat];
      else if (order === 0) winners.push(seat);
    }
    // Give odd chips clockwise starting at the first winning seat after the button.
    const distance = seat => (seat-button-1+chips.length)%chips.length;
    winners.sort((a,b)=>distance(a)-distance(b));
    pot.payouts = chips.map(()=>0);
    winners.forEach((seat,i)=>{const share=Math.floor(amount/winners.length)+Number(i<amount%winners.length);pot.payouts[seat]=share;payouts[seat]+=share});
  }
  return {payouts, returns, pots};
}
