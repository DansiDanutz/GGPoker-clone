import {splitPots} from './engine/pots.mjs';

export function collectedPots(g) {
  if (g.end?.pots) return g.end.pots;
  return splitPots(g.committed.map((n,i)=>n-(g.end?0:g.bets[i])),g.folded).pots;
}

export function visibleCards(g, viewer) {
  const seats = g.hands.length;
  const out = new Array(seats).fill(null);
  if(viewer!=null)out[viewer] = g.hands[viewer];
  const liveSeats = g.folded.filter(folded => !folded).length;
  for (let i = 0; i < seats; i++) {
    if (i === viewer) continue;
    if(g.end&&g.shownIndices?.[i]){out[i]=g.hands[i].map((card,index)=>g.shownIndices[i].includes(index)?card:null);continue;}
    if (g.folded[i]) continue;
    if (!g.end) continue;
    if (liveSeats < 2) continue;
    out[i] = g.hands[i];
  }
  return out;
}
