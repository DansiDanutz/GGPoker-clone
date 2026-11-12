const playChipValues=[500000000000n,100000000000n,25000000000n,5000000000n,1000000000n,500000000n,100000000n,25000000n,5000000n,1000000n,500000n,100000n,25000n,5000n,1000n,250n,50n,10n];
// Native GPD uses 1000 raw units; pile caps change artwork, never the amount label.
export function playChipLayout(amounts,pot=false,align='left'){
 if(!Array.isArray(amounts)||amounts.some(n=>!Number.isSafeInteger(n)||n<0)||!['left','right','center'].includes(align))throw new RangeError('Invalid chip pile');
 let parts=amounts.filter(Boolean).map(n=>BigInt(n)*1000n);
 if(pot){let remaining=parts.reduce((a,b)=>a+b,0n);parts=[];for(const value of playChipValues){const count=remaining/value;if(count){parts.push(count*value);remaining%=value}}}
 if(!parts.length)return [];
 const groups=Array(pot?parts.length:Math.min(parts.length,4)).fill(0n);
 parts.forEach((value,i)=>groups[i%groups.length]+=value);
 const columns=groups.map((_,i)=>align==='right'?parts.length-1-i:i),min=Math.min(...columns)*41,max=Math.max(...columns)*41+36;
 const pivot=align==='left'?min:align==='right'?max:(min+max)/2,offset=align==='left'?-18:align==='right'?18:0,result=[];
 for(const [group,amount]of groups.entries()){
  let remaining=amount;const chips=[],cap=pot?9:7;
  for(const value of playChipValues){while(remaining>=value&&chips.length<cap){chips.push(value);remaining-=value}if(chips.length===cap)break}
  const height=35+5*(chips.length-1);
  for(let i=chips.length-1;i>=0;i--)result.push({raw:String(chips[i]),x:columns[group]*41-pivot+offset,y:17-height+5*i});
 }
 return result;
}
export function aofBetParts(g,seat,total){
 if(!Number.isSafeInteger(total)||total<0)throw new RangeError('Invalid wager total');
 if(!total)return [];
 const initial=g.stacks.map((n,i)=>n+g.committed[i]-(g.end?.payouts[i]||0));
 const live=initial.map((_,i)=>(g.button+i+1)%initial.length).filter(i=>initial[i]>0),sb=live.length===2?g.button:live[0],bb=live.length===2?live[0]:live[1];
 let paid=Math.min(initial[seat],seat===sb?g.blind/2:seat===bb?g.blind:0);const parts=paid?[paid]:[];
 for(const line of g.history){const m=/^Seat (\d+): (?:raise to (\d+)|call (\d+))$/.exec(line);if(!m||Number(m[1])-1!==seat)continue;const added=m[2]?Number(m[2])-paid:Number(m[3]);if(!Number.isSafeInteger(added)||added<=0)return [total];parts.push(added);paid+=added}
 // Pot3D.removeAmount removes the newest bet increments before the earlier ones.
 if(paid===g.committed[seat]&&paid-total===(g.end?.returns?.[seat]||0)&&paid>total){let remaining=paid-total;while(remaining&&parts.length){const last=parts.pop();if(last>remaining){parts.push(last-remaining);remaining=0}else remaining-=last}return parts}
 // shortcut: old snapshots without complete action history render one truthful total pile.
 return paid===total?parts:[total];
}
export function readChipShuffle(raw){
 try{const p=JSON.parse(raw);if(p&&typeof p.enabled==='boolean'&&[0,1].includes(p.direction)&&[0,1,2].includes(p.sensitivity))return {enabled:p.enabled,direction:p.direction,sensitivity:p.sensitivity}}catch{}
 return {enabled:true,direction:0,sensitivity:1};
}
function rawShuffleFrame(frame,deltaY,elapsed,p){
 if(!deltaY)return frame;
 const cap=[10,15,25][p.sensitivity],delta=Math.trunc(1500/Math.max(elapsed,30)*-Math.sign(deltaY)*(p.direction===0?1:-1));return frame+Math.max(-cap,Math.min(cap,delta));
}
function normalizeFrame(frame){return frame>=195?37+frame-195:Math.max(37,frame)}
export function nextShuffleFrame(frame,deltaY,elapsed,p){return normalizeFrame(rawShuffleFrame(frame,deltaY,elapsed,p))}
export function remoteShuffleFrame(elapsed){const frame=Math.max(1,Math.floor(elapsed/10));return frame>245?null:frame}
export function paintShuffle(art,frame){const index=frame-1;art.dataset.frame=frame;art.style.backgroundSize='1600% 1600%';art.style.backgroundPosition=(index%16*100/15)+'% '+(Math.floor(index/16)*100/15)+'%'}
export function createChipShuffle(art,read,onActive=()=>{},play=()=>{}){
 let timer,time=0,previousSoundFrame=0,combined=false;
 const stop=()=>{if(art.dataset.active==='false')return;clearTimeout(timer);art.style.backgroundImage='none';art.dataset.active='false';previousSoundFrame=0;combined=false;paintShuffle(art,37);onActive(false)};
 const idle=()=>{clearTimeout(timer);timer=setTimeout(stop,3000)};
 const start=()=>{if(!read().enabled||art.dataset.active==='true')return false;art.style.backgroundImage='url(/home-art/native-chip-shuffle.png)';time=performance.now();paintShuffle(art,37);art.dataset.active='true';onActive(true);play(['ShuffleUp']);idle();return true};
 art.onwheel=e=>{if(!e.deltaY||!read().enabled||art.dataset.active!=='true')return;e.preventDefault();const now=performance.now();const frame=rawShuffleFrame(Number(art.dataset.frame),e.deltaY,now-time,read());if(Math.abs(frame-previousSoundFrame)>11){previousSoundFrame=frame;if(frame>=37&&frame<=195)play(['ShuffleUp'])}if(frame>=143&&!combined){combined=true;play(['ShuffleCombine'])}paintShuffle(art,normalizeFrame(frame));if(frame>=195){previousSoundFrame=0;combined=false}time=now;idle()};
 art.onclick=stop;return {start,stop};
}
