export function visibleCards(g, viewer) {
  const seats = g.hands.length;
  const out = new Array(seats).fill(null);
  out[viewer] = g.hands[viewer];
  const liveSeats = g.folded.filter(folded => !folded).length;
  for (let i = 0; i < seats; i++) {
    if (i === viewer) continue;
    if (g.folded[i]) continue;
    if (!g.end) continue;
    if (liveSeats < 2) continue;
    out[i] = g.hands[i];
  }
  return out;
}
