import {voicePacks,voicePack,voiceCarouselLayout} from './voice-packs.mjs';

export function installVoiceCarousel(host,{selected='VDaniel',text=key=>key,onchange=()=>{}}={}){
 const doc=host.ownerDocument,win=doc.defaultView;
 let index=voicePacks.indexOf(voicePack(selected)),animation=0,drag=null,didDrag=false;
 host.classList.add('voiceCarousel');host.setAttribute('role','group');host.setAttribute('aria-label','Action voice');
 const style=doc.createElement('style');style.textContent=`
 .voiceCarousel{position:relative;width:748px;height:162px;overflow:hidden;touch-action:pan-y;user-select:none}
 .voiceCarousel button{position:absolute;padding:0;border:0;cursor:pointer;background:none;color:#fefefe;font-family:Roboto,sans-serif}
 .voiceCarousel button:focus-visible{outline:2px solid #fefefe;outline-offset:2px}
 .voiceCarousel .voicePortrait{position:absolute;border-radius:50%;background:#3a3a3a;overflow:hidden}
 .voiceCarousel img{width:100%;height:100%;display:block;pointer-events:none}
 .voiceCarousel .voiceDim{position:absolute;inset:0;background:#000;pointer-events:none}
 .voiceCarousel .voiceName{position:absolute;white-space:nowrap;transform:translateX(-50%);pointer-events:none}
 .voiceCarousel .voiceArrow{top:48px;width:28px;height:28px;border-radius:50%;background:#0008;z-index:3}
 .voiceCarousel .voiceArrow svg{display:block;width:28px;height:28px;pointer-events:none}
 `;host.append(style);
 const cells=voicePacks.map(pack=>{
  const button=doc.createElement('button');button.type='button';button.dataset.voice=pack.id;button.setAttribute('aria-label',text(pack.labelKey));
  const portrait=doc.createElement('span');portrait.className='voicePortrait';
  const image=doc.createElement('img');image.alt='';image.draggable=false;image.src='/home-art/'+pack.image;
  const dim=doc.createElement('span');dim.className='voiceDim';portrait.append(image,dim);
  const label=doc.createElement('span');label.className='voiceName';button.append(portrait,label);host.append(button);
  button.onclick=event=>{if(!didDrag||event.detail===0){const slot=voiceCarouselLayout(index)[voicePacks.indexOf(pack)].slot;if(slot)move(slot)}};
  return {button,portrait,dim,label,pack};
 });
 function render(phase=0){
  voiceCarouselLayout(index,phase).forEach((position,i)=>{
   const {button,portrait,dim,label,pack}=cells[i],{x,radius,primary}=position;
   Object.assign(button.style,{left:374+x-radius+'px',top:62-radius+'px',zIndex:String(primary?2:1),width:radius*2+'px',height:radius*2+'px'});
   Object.assign(portrait.style,{left:'0px',top:'0px',width:radius*2+'px',height:radius*2+'px'});
   dim.style.opacity=String(position.dim);
   button.tabIndex=Math.abs(x)+radius<=374?0:-1;
   label.textContent=text(primary?pack.labelKey:pack.subLabelKey);
   Object.assign(label.style,{left:radius+'px',top:radius*2+8+'px',fontSize:12+4*(radius-36)/24+'px',fontWeight:primary?'700':'400',color:primary?'#fefefe':'#666666'});
   button.setAttribute('aria-pressed',String(i===index));
  });
 }
 function settle(phase){
  win.cancelAnimationFrame(animation);const start=win.performance.now();
  // shortcut: linear interpolation until the native Tween default easing is established.
  const tick=now=>{const elapsed=Math.min(1,(now-start)/200);render(phase*(1-elapsed));if(elapsed<1)animation=win.requestAnimationFrame(tick)};
  render(phase);animation=win.requestAnimationFrame(tick);
 }
 function move(delta){index=((index+delta)%voicePacks.length+voicePacks.length)%voicePacks.length;settle(Math.max(-2,Math.min(2,delta)));onchange(voicePacks[index].id)}
 for(const [label,delta,path]of [['Previous voice',-1,'M16 9L11 14L16 19'],['Next voice',1,'M12 9L17 14L12 19']]){
  const button=doc.createElement('button');button.type='button';button.className='voiceArrow';button.setAttribute('aria-label',label);button.style.left=(374+delta*65-14)+'px';
  button.innerHTML='<svg viewBox="0 0 28 28" aria-hidden="true"><path d="'+path+'" fill="none" stroke="#fefefe" stroke-width="2"/></svg>';
  button.onclick=event=>{if(!didDrag||event.detail===0)move(delta)};host.append(button);
 }
 function phase(clientX){const value=drag.index-(clientX-drag.x)/drag.scale/110,rounded=Math.round(value);index=((rounded%voicePacks.length)+voicePacks.length)%voicePacks.length;return rounded-value}
 function down(event){if(event.button!==0)return;win.cancelAnimationFrame(animation);didDrag=false;drag={x:event.clientX,index,scale:host.getBoundingClientRect().width/748,id:event.pointerId}}
 function motion(event){if(!drag||event.pointerId!==drag.id)return;if(Math.abs(event.clientX-drag.x)/drag.scale>5)didDrag=true;if(didDrag){event.preventDefault();render(phase(event.clientX))}}
 function up(event){if(!drag||event.pointerId!==drag.id)return;if(didDrag){const before=drag.index;settle(phase(event.clientX));if(index!==before)onchange(voicePacks[index].id)}drag=null}
 host.addEventListener('pointerdown',down);win.addEventListener('pointermove',motion);win.addEventListener('pointerup',up);win.addEventListener('pointercancel',up);
 render();
 return {get value(){return voicePacks[index].id},setSelected(id){win.cancelAnimationFrame(animation);drag=null;didDrag=false;index=voicePacks.indexOf(voicePack(id));render()},destroy(){win.cancelAnimationFrame(animation);host.removeEventListener('pointerdown',down);win.removeEventListener('pointermove',motion);win.removeEventListener('pointerup',up);win.removeEventListener('pointercancel',up);host.replaceChildren();host.classList.remove('voiceCarousel')}};
}
