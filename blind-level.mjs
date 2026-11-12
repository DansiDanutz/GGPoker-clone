const blinds=[4,8,16,32,64,128,256];
export function blindLevel(startMs, nowMs, intervalMs,baseBlind=4) {
  if (!Number.isSafeInteger(intervalMs) || intervalMs <= 0) throw new RangeError("intervalMs must be a positive safe integer");
  if(!Number.isSafeInteger(baseBlind)||baseBlind<2||baseBlind%2||baseBlind>Math.floor(Number.MAX_SAFE_INTEGER/64))throw new RangeError("baseBlind must be an even safe integer with room for seven levels");
  const elapsed = Math.max(0, nowMs - startMs);
  const index=Math.min(Math.floor(elapsed/intervalMs),blinds.length-1);
  return {level:index+1,bigBlind:baseBlind*(blinds[index]/4)};
}
