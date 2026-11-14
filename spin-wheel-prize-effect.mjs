export function spinWheelPrizeEffect(targetIndex,elapsedMs){
 if(!Number.isInteger(targetIndex)||targetIndex<0||targetIndex>7||!Number.isFinite(elapsedMs)||elapsedMs<0)throw Error('Invalid wheel prize effect');
 let scale,alpha=1;
 if(elapsedMs<350){const t=1-(1-elapsedMs/350)**3;scale=.95+.08*t;alpha=t}
 else{const half=Math.floor((elapsedMs-350)/350),t=((elapsedMs-350)%350)/350;scale=half%2===0?1.03-.06*t**3:.97+.06*(1-(1-t)**3)}
 return {rotation:360-45*(targetIndex+1)+22.5,scale,alpha};
}
