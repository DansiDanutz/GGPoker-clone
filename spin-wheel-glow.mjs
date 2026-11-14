export function spinWheelGlow(elapsedMs){
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw Error('Invalid native glow time');
 const t=Math.min(1,elapsedMs/700)-1,back=elapsedMs===0?0:t*t*(2.70158*t+1.70158)+1;
 const entry=1-(1-Math.min(1,elapsedMs/300))**3;
 const alpha=elapsedMs<=1300?entry:elapsedMs<2000?(1-(elapsedMs-1300)/700)**3:0;
 return {rotation:(elapsedMs%30000)/30000*360,glow:{x:1-451*back,y:1-451*back,size:2+898*back,alpha:Math.min(1,Math.max(0,back))},glitter:{x:386-420*entry,y:386-420*entry,size:2+838*entry,alpha,visible:elapsedMs<2000}};
}
