// PlayerNoteView.setNote and NoteToolTip.fitNoteText, in native table units.
export function noteTooltipPosition(seat,width,height){
 if(![seat?.x,seat?.y,width,height].every(Number.isFinite)||width<=0||height<=0)throw Error('Invalid tooltip geometry');
 const dx=seat.x-850,dy=seat.y-562,degrees=Math.atan2(dy,dx)/Math.PI*180,a=degrees/180*Math.PI,r=Math.sqrt(dx*dx+dy*dy)-50,x=r*Math.cos(a),y=r*Math.sin(a);
 return {x:850+x-(x>0?width:0),y:562+y-(y>0?height:0)};
}
export function fitNoteTooltipText(text,maxHeight,measure){
 if(measure(text)<=maxHeight)return text;let low=0,high=text.length;
 while(low<high){const mid=(low+high+1)>>1;if(measure(text.slice(0,mid)+'..')<=maxHeight)low=mid;else high=mid-1}
 return text.slice(0,low)+'..';
}
export function installNoteTooltip(context,read,load){
 const node=document.createElement('section');node.id='nativeNoteTooltip';node.className='nativeNoteTooltip';node.setAttribute('role','tooltip');node.hidden=true;document.body.append(node);
 let active=null,timer=null,generation=0,content='',scope='',shown=false;
 const identity=()=>{const c=context();return JSON.stringify([c.room,c.token,c.state?.me,c.state?.noteSubjects])};
 const valid=()=>active?.isConnected&&!document.hidden&&scope===identity()&&!!read(Number(active.dataset.hudSeat));
 function hide(){generation++;clearTimeout(timer);timer=null;active?.removeAttribute('aria-describedby');active=null;node.hidden=true;shown=false;content='';node.replaceChildren()}
 function paint(){
  if(!valid()){hide();return}active.setAttribute('aria-describedby',node.id);const index=Number(active.dataset.hudSeat),data=read(index),felt=document.querySelector('.felt'),seat=active.closest('.seat');if(!felt||!seat){hide();return}
  const rect=felt.getBoundingClientRect(),scale=rect.width/1700;if(!scale){hide();return}node.style.transform='scale('+scale+')';
  const signature=JSON.stringify(data);if(content!==signature){
   content=signature;node.replaceChildren();const add=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls;if(text!==undefined)e.textContent=text;node.append(e);return e};
   add('strong','noteTipName',data.name);add('span','noteTipBalance',data.balance==null?'':String(data.balance));add('span','noteTipHands',data.hands==null?'—':String(data.hands));add('span','noteTipHandsLabel',data.handsLabel||'Hands').dataset.nativeLabel='Profilehands';add('span','noteTipDivider');
   data.metrics.forEach((metric,i)=>{const graph=add('span','noteTipGraph');graph.dataset.stat=metric.name;graph.style.left=(196+i*112)+'px';graph.style.setProperty('--ratio',Math.trunc((metric.value??0)/100*360)+'deg');graph.style.setProperty('--color',metric.color);graph.setAttribute('aria-label',metric.name+': '+(metric.value==null?'unavailable':metric.value+' percent'));const value=document.createElement('span'),label=document.createElement('span');value.className='noteTipValue';value.textContent=metric.value==null?'-':metric.value+'%';label.className='noteTipMetric';label.textContent=metric.name;label.dataset.nativeLabel=({VPIP:'MobilePlayerVPIP',PFR:'HudLabelPfr',ATS:'HudLabelAts','3-bet':'HudLabel3Bet','All-in':'HudLabelAllIn',Fold:'HudLabelFold',FTA:'HudLabelFta'})[metric.name];graph.append(value,label);if(metric.value!==null&&value.scrollWidth>72)value.style.fontSize=(30*72/value.scrollWidth)+'px'});
   const bg=add('span','noteTipTextBg'),text=add('span','noteTipText');const measure=value=>{text.textContent=value;return text.getBoundingClientRect().height/scale};
   // shortcut: browser font line boxes stand in for AIR glyph bounds; compare physical font metrics before claiming pixel parity.
   const min=measure('A\nA'),max=measure('A\nA\nA\nA\nA\nA')+2,fitted=fitNoteTooltipText(data.text||'',max,measure),height=Math.max(min,Math.min(max,measure(fitted)));text.textContent=fitted;text.style.height=height+'px';bg.style.height=(height+26)+'px';node.style.height=(216+height+26+32)+'px';node.dataset.noteHeight=String(height);node.dataset.subject=data.subject;
   if(data.color!==10||data.title){const frame=add('span','noteTipFrame'),tab=add('span','noteTipTab'),title=add('span','noteTipLabel',data.title||'');frame.style.borderImageSource='url("/home-art/native-note-tooltip-frame-'+data.color+'.png")';tab.style.borderImageSource='url("/home-art/native-note-tooltip-tab-'+data.color+'.png")';const rgb=data.hex.slice(1).match(/../g).map(v=>parseInt(v,16));title.style.color=.299*rgb[0]+.587*rgb[1]+.114*rgb[2]>128?'#000':'#fff';tab.style.width=(data.title?Math.min(title.scrollWidth,350)+32:120)+'px'}
  }
  const styles=getComputedStyle(seat),x=Number(styles.getPropertyValue('--seat-x')),y=Number(styles.getPropertyValue('--seat-y'));if(!x||!y){hide();return}const pos=noteTooltipPosition({x,y},636,parseFloat(node.style.height));node.style.left=rect.left+pos.x*scale+'px';node.style.top=rect.top+pos.y*scale+'px';
 }
 function enter(portrait){
  if(active===portrait)return;hide();if(!portrait||!read(Number(portrait.dataset.hudSeat)))return;active=portrait;scope=identity();const ticket=generation;
  timer=setTimeout(async()=>{if(ticket!==generation||!valid())return;node.hidden=false;shown=true;active.setAttribute('aria-describedby',node.id);paint();await load();if(ticket===generation&&shown)paint()},300);
 }
 const portrait=target=>target?.closest?.('.felt .portrait[data-hud-seat]')||target?.closest?.('.felt .seat .plate,.felt .nativePlayerTouchArea')?.closest('.seat').querySelector('.portrait[data-hud-seat]')||null;
 document.addEventListener('pointerover',e=>{const p=portrait(e.target);if(p!==portrait(e.relatedTarget))enter(p)});
 document.addEventListener('pointermove',e=>{if(!active)enter(portrait(e.target))});
 document.addEventListener('pointerout',e=>{if(portrait(e.target)===active&&portrait(e.relatedTarget)!==active)hide()});
 document.addEventListener('focusin',e=>enter(portrait(e.target)));document.addEventListener('focusout',e=>{if(portrait(e.target)===active)hide()});
 document.addEventListener('pointerdown',hide,true);document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});window.addEventListener('blur',hide);document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});window.addEventListener('resize',()=>{if(shown)paint()});window.addEventListener('scroll',()=>{if(shown)paint()},true);
 document.fonts?.addEventListener('loadingdone',()=>{content='';if(shown)paint()});
 return {refresh(){if(active&&!valid())hide();else if(shown)paint()},hide};
}
