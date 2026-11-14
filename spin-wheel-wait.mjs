export function spinWheelWaitLights(random=Math.random){
 const sample=()=>{const n=random();if(!Number.isFinite(n)||n<0||n>=1)throw Error('Invalid native wait-light randomness');return n};
 const make=kind=>({kind,remaining:(kind==='base'?3000:1000)+sample()*(kind==='base'?1000:500),elapsed:0,running:false,sounded:false,pose:{x:180,y:-74,alpha:kind==='base'?.2:.4}});
 const base=make('base'),ring=make('ring');let cancelled=false;
 function step(c,delta){if(!c.running){c.remaining-=delta;if(c.remaining<=0){c.running=true;c.elapsed=0;c.sounded=false;c.pose={x:180,y:-74,alpha:c.pose.alpha}}return false}
  c.elapsed=Math.min(6000,c.elapsed+delta);const t=(c.elapsed/6000)**3;c.pose={x:180+(c.kind==='base'?397:360)*t,y:-74+(c.kind==='base'?396:361)*t,alpha:c.pose.alpha};const sound=c.kind==='base'&&!c.sounded&&c.elapsed>=2000;if(sound)c.sounded=true;if(c.elapsed===6000){c.running=false;c.remaining=(c.kind==='base'?3000:1000)+sample()*(c.kind==='base'?1000:500)}return sound;
 }
 return {cancel(){cancelled=true},tick(delta){if(!Number.isFinite(delta)||delta<0)throw Error('Invalid native wait-light clock');if(cancelled)return null;const baseSound=step(base,delta);step(ring,delta);return {base:{...base.pose},ring:{...ring.pose},baseSound}}};
}
