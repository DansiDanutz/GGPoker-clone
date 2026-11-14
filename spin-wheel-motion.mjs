// Source: SpinAndGoldWheel.onEnterFrameHandler; elapsed steps are per tick, not wall-clock interpolation.
export function spinWheelMotion(data,wheelIndex,variant){
 if(!Number.isInteger(wheelIndex)||wheelIndex<0||wheelIndex>7||!Number.isInteger(variant)||variant<1||variant>4)throw Error('Invalid wheel segment or motion variant');
 const tracks=['constantVelocityMotion',...Array.from({length:4},(_,i)=>'reductionMotion0'+(i+1))].map(key=>{
  const rows=data?.[key];if(!rows||typeof rows!=='object'||Object.keys(rows).length<1||Object.keys(rows).length>10000)throw Error('Invalid wheel motion track');
  return Array.from({length:Object.keys(rows).length},(_,i)=>{const row=rows[i];if(!row||!Number.isFinite(row.wd)||Math.abs(row.wd)>360||!Number.isFinite(row.ad)||Math.abs(row.ad)>360||![0,1].includes(row.ss))throw Error('Invalid wheel motion frame');return {...row}});
 });
 const target=(7-wheelIndex)*45;let phase=0,index=0,previous=0,last={wheel:0,arrow:0,high:false,low:false,done:false};
 return {tick(elapsedMs){
  if(!Number.isFinite(elapsedMs)||elapsedMs<0||!Number.isSafeInteger(Math.ceil(elapsedMs/33)))throw Error('Invalid wheel frame elapsed time');
  if(last.done)return {...last,high:false,low:false};
  const track=tracks[phase?variant:0],row=track[index];let wheelDeg=0;
  last={...last,high:false,low:false};
  if(row){wheelDeg=row.wd;last.wheel=wheelDeg+(phase?target:0);last.arrow=row.ad;last.high=!!row.ss;
   const crossing=wheelDeg<=0&&previous>0||wheelDeg>0&&previous<=0;
   if(crossing?Math.abs(previous)+Math.abs(wheelDeg)>10:Math.abs(previous-wheelDeg)>10){last.low=true;previous=wheelDeg}
  }
  if(!phase){if(wheelDeg>0&&wheelDeg>=target||wheelDeg<0&&wheelDeg+360>=target||index>=track.length-1){phase=1;index=0}}
  else if(index>=track.length-1)last.done=true;
  index=Math.min(10000,index+Math.ceil(elapsedMs/33));return {...last};
 }};
}
