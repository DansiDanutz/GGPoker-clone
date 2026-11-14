export function spinWheelSparkles(random=Math.random){
 let particles=[],next=0,cancelled=false;
 const unit=()=>{const n=random();if(!Number.isFinite(n)||n<0||n>=1)throw Error('Invalid native sparkle randomness');return n};
 function spawn(){next=500+unit()*1000;const angle=unit()*360,radius=300+unit()*200;particles.push({x:387+Math.cos(angle)*radius,y:387+Math.sin(angle)*radius,duration:500+unit()*300,target:.5+unit()*2,color:Math.floor(unit()*16777215),age:0})}
 spawn();return {cancel(){cancelled=true;particles=[]},tick(delta,spawning=true){if(!Number.isFinite(delta)||delta<0||typeof spawning!=='boolean')throw Error('Invalid native sparkle clock');if(cancelled)return [];for(const p of particles)p.age+=delta;particles=particles.filter(p=>p.age<p.duration*3);next-=delta;if(spawning&&next<=0)spawn();return particles.map(p=>{const t=Math.min(1,p.age/p.duration),scale=.1+(p.target-.1)*t**3,alpha=p.age<=p.duration?t**3:(1-(p.age-p.duration)/(2*p.duration))**3;return {x:p.x,y:p.y,scale,alpha,color:p.color}})}};
}
