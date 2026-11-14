export function spinWheelGlow(elapsedMs,exitMs=null){
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw Error('Invalid native glow time');
 if(exitMs!==null&&(!Number.isFinite(exitMs)||exitMs<0))throw Error('Invalid native glow exit');
 const t=Math.min(1,elapsedMs/700)-1,back=elapsedMs===0?0:t*t*(2.70158*t+1.70158)+1;
 const entry=1-(1-Math.min(1,elapsedMs/300))**3;
 const alpha=elapsedMs<=1300?entry:elapsedMs<2000?(1-(elapsedMs-1300)/700)**3:0;
 const exit=exitMs===null?null:Math.min(1,exitMs/700),e=exit===null?0:exit===0?0:(exit-1)**2*(2.70158*(exit-1)+1.70158)+1;
 return {y:exit===null?406:406-706*exit**3,rotation:(elapsedMs%30000)/30000*360,glow:{x:exit===null?1-451*back:-450+449*e,y:exit===null?1-451*back:-450+449*e,size:exit===null?2+898*back:900-898*e,alpha:Math.min(1,Math.max(0,exit===null?back:1-e))},glitter:{x:386-420*entry,y:386-420*entry,size:2+838*entry,alpha,visible:elapsedMs<2000}};
}
