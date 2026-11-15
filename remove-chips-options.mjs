// Native popup rounds in two stages; the request separately clamps the minimum.
export function removeChipsOptions(settings){
 const {blind}=settings,min=settings.minBuyIn??settings.stack,max=settings.maxBuyIn??settings.stack;
 if(!Number.isSafeInteger(blind)||blind<=0||!Number.isSafeInteger(min)||min<=0||!Number.isSafeInteger(max)||max<min)throw Error('Invalid Remove Chips limits');
 const first=Math.max(10,Math.ceil(Math.floor(min/blind)/10)*10),last=Math.min(200,Math.floor(Math.floor(max/blind)/10)*10),values=[0];
 for(let bb=first;bb<=last;bb+=10)values.push(bb);return values;
}
export function removeChipsTarget(settings,bb){
 removeChipsOptions(settings);if(!Number.isSafeInteger(bb)||bb<0||bb>200||bb%10!==0)throw Error('Invalid Remove Chips target');
 return bb===0?0:Math.max(bb,Math.ceil((settings.minBuyIn??settings.stack)/settings.blind))*settings.blind;
}

export function removeChipsGroup(settings){return ['plo','plo5','plo6'].includes(settings.variant)?'OMAHA':'HOLDEM'}
