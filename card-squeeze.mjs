export function cardOrdinal(card){if(typeof card!=='string'||! /^[2-9TJQKA][cdhs]$/.test(card))throw Error('Invalid squeeze card');return '23456789TJQKA'.indexOf(card[0])*4+'cdhs'.indexOf(card[1])}
export function squeezeWheelFrame(frame,deltaY){return Math.max(0,Math.min(60,frame+Math.sign(deltaY)*6))}
export function squeezeDragFrame(previous,dx,dy,hover=false){const distance=hover?Math.abs(dy):Math.hypot(dx,Math.min(0,dy));return Math.max(previous,1,Math.min(60,Math.trunc((1-(1-Math.min(1,distance/400))**3)*60)))}
export function createSqueezeMotion(paint,complete){
 let frame=0,raf=0,generation=0,closed=false,opening=false,wheelTarget=null;
 const stop=()=>{generation++;cancelAnimationFrame(raf);raf=0};
 const set=value=>{frame=Math.trunc(Math.max(0,Math.min(60,value)));paint(frame)};
 function tween(target,duration,hold=0,done){
  stop();const version=generation,start=performance.now(),from=frame;
  const tick=now=>{if(closed||version!==generation)return;const progress=duration?Math.min(1,(now-start)/duration):1;set(from+(target-from)*progress);
   if(progress<1||now-start<duration+hold){raf=requestAnimationFrame(tick);return}
   raf=0;if(target===60){closed=true;complete()}else done?.();
  };raf=requestAnimationFrame(tick);
 }
 return {get frame(){return Math.trunc(frame)},get closed(){return closed},
  wheel(delta){if(!closed&&!opening&&delta){wheelTarget=squeezeWheelFrame(wheelTarget??Math.trunc(frame),delta);tween(wheelTarget,100)}},
  hover(done){if(!closed&&!opening){wheelTarget=null;tween(15,100,0,done)}},
  press(done){if(closed||opening)return;wheelTarget=null;if(frame<15)tween(15,100,0,done);else{stop();done?.()}},
  drag(dx,dy,hover=false){if(closed||opening)return;wheelTarget=null;stop();set(squeezeDragFrame(frame,dx,dy,hover));if(frame===60){closed=true;complete()}},
  release(inside=false){if(!closed&&!opening){wheelTarget=null;tween(frame<=46?(inside?15:0):60,frame<=46?200:(60-frame)*10)}},
  open(){if(closed||opening)return;opening=true;tween(60,(60-frame)*10,500)},
  dispose(){stop();closed=true}
 };
}
export function drawSqueeze(ctx,data,images,cards,frame){
 if(!Number.isInteger(frame)||frame<0||frame>60||![2,4,5,6].includes(cards.length)||cards.length!==data.slots.length||new Set(cards).size!==cards.length)throw Error('Invalid squeeze frame or cards');const ordinals=cards.map(cardOrdinal);
 ctx.clearRect(0,0,652,484);ctx.save();ctx.translate(...data.container);ctx.scale(data.scale,data.scale);ctx.drawImage(images.frames[frame],0,0);
 for(let i=0;i<cards.length;i++){const t=data.slots[i].transforms[frame],mask=data.slots[i].masks[frame];if(!t.visible)continue;const r=data.glyphs[ordinals[i]],sx=t.scaleX/100,x=t.skewX*Math.PI/180,y=t.skewY*Math.PI/180;
  ctx.save();ctx.beginPath();mask.array.forEach((p,j)=>j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.clip();
  // SqueezeUtil.skew uses scaleX on both axes; preserve the original matrix.
  ctx.transform(sx*Math.cos(y),sx*Math.sin(y),-sx*Math.sin(x),sx*Math.cos(x),t.x,t.y);ctx.drawImage(images.inner,r.x,r.y,r.w,r.h,0,0,r.w,r.h);ctx.restore();
 }
 ctx.restore();
}
const assets=new Map();
export function loadSqueeze(count=2){
 const format=({2:'holdem',4:'plo',5:'plo5',6:'plo6'})[count];if(!format)throw Error('Unsupported squeeze card count');
 if(!assets.has(count))assets.set(count,(async()=>{const r=await fetch('/home-art/native-squeeze-'+format+'.json');if(!r.ok)throw Error('Squeeze data unavailable');const data=await r.json();const load=async src=>{const image=new Image();image.src=src;await image.decode();return image};const [frames,inner]=await Promise.all([Promise.all(data.frames.map(load)),load(data.inner)]);return {data,images:{frames,inner}}})().catch(error=>{assets.delete(count);throw error}));
 return assets.get(count);
}
export function createSqueezePanel(parent,cards,onClose,playCues=()=>{}){
 const panel=document.createElement('section'),canvas=document.createElement('canvas'),felt=new Image(),button=document.createElement('button');
 panel.className='cardSqueeze';panel.setAttribute('aria-label','Card Squeeze');panel.setAttribute('aria-busy','true');canvas.width=652;canvas.height=484;canvas.setAttribute('aria-label','Squeeze your face-down hole cards');canvas.tabIndex=0;felt.src='/home-art/native-squeeze-felt.png';felt.alt='';button.type='button';button.textContent='Open';button.disabled=true;button.className='squeezeOpen';panel.append(felt,canvas,button);parent.append(panel);
 let disposed=false,motion,timer,start,current,pressed=false,hovering=false;
 const dispose=()=>{disposed=true;clearTimeout(timer);motion?.dispose();panel.remove()};
 function finish(){if(disposed)return;panel.classList.add('squeezeClosing');button.disabled=true;timer=setTimeout(()=>{dispose();onClose()},300)}
 loadSqueeze(cards.length).then(({data,images})=>{
  if(disposed)return;const ctx=canvas.getContext('2d');const paint=frame=>{drawSqueeze(ctx,data,images,cards,frame);panel.dataset.frame=String(frame)};
  motion=createSqueezeMotion(paint,finish);paint(0);panel.setAttribute('aria-busy','false');button.disabled=false;
  button.onclick=()=>{button.hidden=true;playCues(['SqueezeOpen']);playCues(['AofButton']);motion.open()};
  const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*652/r.width,y:(e.clientY-r.top)*484/r.height}};
  const anchor=()=>{start={x:current.x,y:current.y+400*(1-(1-motion.frame/60)**(1/3))}};
  const hoverArea=p=>p.x>160&&p.x<590&&p.y>292&&p.y<392;
  canvas.onwheel=e=>{e.preventDefault();start=null;hovering=false;motion.wheel(e.deltaY)};
  canvas.onpointerenter=e=>{if(e.pointerType!=='mouse'||pressed)return;current=point(e);hovering=hoverArea(current);motion.hover(()=>{if(!disposed)anchor()})};
  canvas.onpointerleave=()=>{if(!pressed){start=null;hovering=false;motion.release(false)}};
  canvas.onpointerdown=e=>{e.preventDefault();pressed=true;hovering=false;start=null;current=point(e);canvas.setPointerCapture(e.pointerId);motion.press(()=>{if(pressed&&!disposed)anchor()})};
  canvas.onpointermove=e=>{current=point(e);if(!pressed&&!hovering&&hoverArea(current)){hovering=true;anchor()}if(!start||!pressed&&!hovering)return;start.y=Math.max(start.y,current.y);motion.drag(current.x-start.x,current.y-start.y,!pressed)};
  canvas.onpointerup=canvas.onpointercancel=e=>{if(!pressed)return;pressed=false;hovering=false;start=null;current=point(e);if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);motion.release(e.type==='pointerup'&&current.x>=0&&current.x<=652&&current.y>=0&&current.y<=484)};
  canvas.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();button.click()}};
 }).catch(error=>{if(!disposed){dispose();onClose(error)}});
 return dispose;
}
