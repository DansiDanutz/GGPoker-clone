import {battleBountyQueue} from './battle-bounty-queue.mjs';
import {loadBattleBox,battleBoxPose} from './battle-box-render.mjs';
import {resultTextGlyphLayout} from './tournament-result.mjs';
const positions=[[[0,0]],[[-205,0],[205,0]],[[-205,0],[205,0],[0,122]],[[-205,0],[205,0],[-205,122],[205,122]]];
async function image(url){const value=new Image();value.src=url;await value.decode();return value}
let resourcePromise;
async function resources(){
 const current=resourcePromise??=Promise.all([loadBattleBox(),image('/home-art/native-battle-box-winner.png'),image('/home-art/native-battle-box-remaining.png'),fetch('/home-art/native-result-font.json',{signal:AbortSignal.timeout(10000)}).then(r=>{if(!r.ok)throw Error('Bounty amount font unavailable');return r.json()}),image('/home-art/native-result-font.png')]).then(([box,winner,remaining,font,glyphs])=>{if(winner.naturalWidth!==297||winner.naturalHeight!==77||remaining.naturalWidth!==181||remaining.naturalHeight!==121||!resultTextGlyphLayout('0',font,80)||glyphs.naturalWidth!==font.atlasSize[0]||glyphs.naturalHeight!==font.atlasSize[1])throw Error('Bounty artwork dimensions changed');return {box,winner,remaining,font,glyphs}});
 try{return await current}catch(error){if(resourcePromise===current)resourcePromise=null;throw error}
}
// Local receipts lack native quality/effect metadata: show explicit low-tier type1, never infer a grade from the amount.
export function installBattleBountyScene(parent,context,completed,avatarSource,onError){
 const queue=battleBountyQueue();let scope=null,active=null,generation=0,raf=null,dialog=null;
 function stop(){generation++;if(raf!==null)cancelAnimationFrame(raf);raf=null;active=null;if(dialog){if(dialog.open)dialog.close();dialog.remove();dialog=null}}
 function clear(){stop();scope=null;queue.clear()}
 function position(){if(!dialog)return;const r=parent.getBoundingClientRect();Object.assign(dialog.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'})}
 const observer=new ResizeObserver(position);observer.observe(parent);addEventListener('resize',position);
 function observe(data,identity){
  if(!data?.battleFinal||!data.battleBounty||data.me==null||!identity){clear();return}
  try{if(identity!==scope||document.visibilityState==='hidden'){stop();queue.clear();scope=identity}queue.observe(identity,data.battleBounty.awards)}catch(error){clear();onError(error)}
 }
 function finish(error){const item=active;if(!item)return;stop();queue.complete(item.key);if(error)onError(error);completed();refresh()}
 async function start(award){
  const lease=++generation,item={hand:award.hand,key:award.hand+':'+award.pot+':'+award.victim};active=item;
  try{
   const [assets,avatars]=await Promise.all([resources(),Promise.all(award.hunters.map(p=>{const s=context().state,index=s.names.indexOf(p.account);return image(avatarSource(s.avatars?.[index])).catch(()=>image(avatarSource(0)))}))]);
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,initial=reduced?168:0;let frame=await assets.box.frame(initial,1),decoded=initial,decoding=false;if(lease!==generation||active!==item)return;
   const layout=resultTextGlyphLayout(String(award.amount),assets.font,80);if(!layout)throw Error('Unsupported bounty amount glyph');
   dialog=document.createElement('dialog');dialog.className='nativeBattleBounty';dialog.setAttribute('aria-label','Bounty '+award.amount+' play credits · '+award.hunters.map(p=>p.account+': '+p.amount).join(', '));dialog.oncancel=e=>e.preventDefault();Object.assign(dialog.style,{position:'fixed',margin:'0',padding:'0',border:'0',background:'transparent',maxWidth:'none',maxHeight:'none',overflow:'hidden'});
   const canvas=document.createElement('canvas');canvas.width=1700;canvas.height=1200;canvas.style.cssText='display:block;width:100%;height:100%';dialog.append(canvas);document.body.append(dialog);position();dialog.showModal();const ctx=canvas.getContext('2d'),started=performance.now();
   function draw(pose,elapsed){
    ctx.clearRect(0,0,1700,1200);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,30,1700,1200);ctx.drawImage(frame.image,850-frame.origin[0],630-frame.origin[1],frame.width,frame.height);
    const spots=positions[award.hunters.length-1]||positions[0];ctx.save();ctx.globalAlpha=pose.winnersAlpha;
    award.hunters.forEach((p,i)=>{const [x,y]=spots[Math.min(i,spots.length-1)];ctx.save();ctx.translate(850+x-169,810+y);ctx.drawImage(assets.winner,41,0);ctx.save();ctx.beginPath();ctx.arc(33,33,33,0,Math.PI*2);ctx.clip();ctx.drawImage(avatars[i],0,0,66,66);ctx.restore();
     // shortcut: source Segoe UI default with local Arial fallback; calibrate Flash font substitution/metrics against native captures.
     ctx.font='bold 46px "Segoe UI",Arial,sans-serif';const size=46*Math.min(1,217/ctx.measureText(p.account).width);ctx.font='bold '+size+'px "Segoe UI",Arial,sans-serif';ctx.fillStyle='#ffcc00';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.account,199.5,38.5);ctx.restore()});ctx.restore();
    if(pose.amountVisible){const t=reduced?1:Math.max(0,Math.min(1,(elapsed-3993)/500)),u=t-1,e=t===0?0:u*u*(2.70158*u+1.70158)+1,scale=.1+.9*e,k=80/56;ctx.save();ctx.translate(850,400);ctx.scale(scale,scale);ctx.globalAlpha=t;for(const g of layout.glyphs)ctx.drawImage(assets.glyphs,Math.round(g.x/k),Math.round(g.y/k),Math.round(g.width/k),Math.round(g.height/k),g.left-layout.width/2,g.top-layout.height/2,g.width,g.height);ctx.restore()}
    const remaining=queue.size()-1;if(remaining>0){ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,1000,1700,200);for(let i=0;i<remaining;i++)ctx.drawImage(assets.remaining,50+i*230,1040)}dialog.dataset.frame=String(decoded+1);dialog.dataset.amountVisible=String(pose.amountVisible);dialog.dataset.remaining=String(remaining);
   }
   // A RAF timestamp can precede asynchronous scene setup within the same frame.
   function tick(now){
    if(lease!==generation||active!==item)return;const elapsed=Math.max(0,now-started),pose=battleBoxPose(reduced?5577:elapsed,1);if(reduced?elapsed>=1000:pose.complete){finish();return}
    if(!reduced&&decoded!==pose.frame&&!decoding){decoding=true;assets.box.frame(pose.frame,1).then(next=>{if(lease===generation&&active===item){frame=next;decoded=pose.frame}}).catch(error=>{if(lease===generation)finish(error)}).finally(()=>{decoding=false})}
    draw(pose,elapsed);raf=requestAnimationFrame(tick);
   }
   draw(battleBoxPose(reduced?5577:0,1),0);raf=requestAnimationFrame(tick);
  }catch(error){if(lease===generation&&active===item)finish(error)}
 }
 function refresh(){
  const s=context().state;if(!s?.battleFinal||s.me==null){clear();return}if(active||document.visibilityState==='hidden')return;while(queue.peek()?.hand<s.number)queue.complete(queue.peek().hand+':'+queue.peek().pot+':'+queue.peek().victim);const award=queue.peek();if(award?.hand===s.number&&s.hand?.end&&!parent.querySelector('.award'))void start(award);
 }
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){clear();completed()}});addEventListener('pagehide',clear);
 return {observe,refresh,clear,blocking:number=>Number.isSafeInteger(number)&&(active?.hand===number||queue.peek()?.hand===number),pending:()=>queue.size()};
}
