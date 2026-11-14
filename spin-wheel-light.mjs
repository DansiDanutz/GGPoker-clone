export function spinWheelFrameLight(targetIndex,elapsedMs,delaySeconds){
 if(!Number.isInteger(targetIndex)||targetIndex<0||targetIndex>7||!Number.isFinite(elapsedMs)||elapsedMs<0||!Number.isFinite(delaySeconds)||delaySeconds<.5||delaySeconds>.8)throw Error('Invalid native frame light');
 const progress=Math.min(1,Math.max(0,(elapsedMs-delaySeconds*1000)/2000));
 return {rotation:360-45*(targetIndex+1)+22.5,x:-61,y:progress===1?0:-239*(1-progress**3),width:122,height:80,alpha:.5,maskX:-61,maskY:-159,maskWidth:122,maskHeight:159,complete:progress===1};
}

export function spinWheelFrameLightLoop(random=Math.random){
 const nextDelay=()=>{const n=random();if(!Number.isFinite(n)||n<0||n>=1)throw Error('Invalid native light randomness');return .5+n*.3};
 let delaySeconds=nextDelay(),elapsedMs=0,started=false,cancelled=false;
 return {cancel(){cancelled=true},tick(delta){if(!Number.isFinite(delta)||delta<0)throw Error('Invalid native light delta');if(cancelled)return null;elapsedMs+=delta;const start=!started&&elapsedMs>=delaySeconds*1000;started ||= start;if(elapsedMs>=delaySeconds*1000+2000){delaySeconds=nextDelay();elapsedMs=0;started=false}return {elapsedMs,delaySeconds,start}}};
}
