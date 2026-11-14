export function spinWheelWaitMotion(){
 let value=0,start=0,target=360,duration=60000,time=0,mode='linear',count=0,cancelled=false,active=true,pose={wheel:0,arrow:0};
 const linear=()=>{if(value>=360)value-=360;start=value;target=360;duration=(360-value)/6*1000;time=0;mode='linear';count=0};
 return {cancel(){cancelled=true},activate(enabled){if(typeof enabled!=='boolean')throw Error('Invalid waiting activation');if(cancelled||enabled===active)return;active=enabled;start=value;target=value+5;duration=1000;time=0;mode=enabled?'activate':'deactivate';if(!enabled)while(target%45>3&&target%45<8){target++;duration+=200}},tick(delta){
  if(!Number.isFinite(delta)||delta<0)throw Error('Invalid waiting motion clock');if(cancelled)return null;if(mode==='idle')return {...pose};time=Math.min(duration,time+delta);const t=duration?time/duration:1,e=mode==='activate'?t**3:mode==='deactivate'?1-(1-t)**3:t;value=start+(target-start)*e;
  count=1-count;if(count===0){const r=((value%45)+45)%45;let arrow=pose.arrow;if(r>42&&r<45)arrow=-(r-42)/3*41;else if(r>0&&r<8)arrow=-(r/8*24+41);else arrow=arrow<0?arrow+10:0;pose={wheel:value,arrow}}
  if(time===duration){if(mode==='deactivate')mode='idle';else linear()}return {...pose};
 }};
}
