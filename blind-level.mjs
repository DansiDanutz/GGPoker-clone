const blinds=[4,8,16,32,64,128,256];
export function blindLevel(startMs, nowMs, intervalMs) {
  const elapsed = Math.max(0, nowMs - startMs);
  const index=Math.min(Math.floor(elapsed/intervalMs),blinds.length-1);
  return {level:index+1,bigBlind:blinds[index]};
}
