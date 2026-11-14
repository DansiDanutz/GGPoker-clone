// SpinAndGoldMultiplierSetInfo.setMultiplierSet; ordinary 3-Max cash awards, not WSOP/2Ace.
export function spinWheelSegments(multipliers,winner){
 if(!Array.isArray(multipliers)||multipliers.length!==8||multipliers.some(n=>!Number.isSafeInteger(n)||n<1)||new Set(multipliers).size!==8||!multipliers.includes(winner))throw Error('Provide eight unique explicit Spin multipliers and their winner');
 const slots=Array(8);for(const [i,slot]of [6,2,4,0,1,5,3,7].entries())slots[slot]=multipliers[i];
 const wheelIndex=slots.indexOf(winner);return {multipliers:slots,wheelIndex,targetIndex:7-wheelIndex};
}
