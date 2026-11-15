import {element} from './felt.mjs';
import {autoFoldItems,autoFoldMatrix,autoFoldRateSelection,editAutoFoldSelection,readAutoFoldPreferences,createAutoFold} from './auto-fold.mjs';
export function installAutoFold(root,get,send){
 if(!get().supported)return {refresh(){},interrupt(){}};
 const button=element('button','','Auto Fold'),dialog=element('dialog','autoFoldEditor'),panel=element('div','autoFoldContents'),title=element('h2','','Auto-Fold Hand Chart'),matrix=element('div','autoFoldMatrix'),rate=element('input','autoFoldRate'),rateText=element('output','autoFoldRateText'),error=element('p','autoFoldError');
 button.type='button';button.id='autoFold';button.hidden=true;dialog.setAttribute('aria-label','Auto-Fold Hand Chart');error.setAttribute('role','alert');matrix.setAttribute('role','group');matrix.setAttribute('aria-label','Hands to auto fold');
 let draft=null,paint=null,storageError=false,draftIdentity=null,rateDrag=null,paintPointer=null,opening=null;
 const key=()=> 'river-auto-fold:'+encodeURIComponent(get().identity||'');
 function saved(){try{return readAutoFoldPreferences(localStorage.getItem(key()))}catch{return readAutoFoldPreferences()}}
 // shortcut: local Rush has no Cash Drop mode; wire authoritative drop state when added.
 const snapshot=()=>{const data=get();return {...data,prefs:saved(),context:{supported:data.supported,catchUp:false,cashDropToPot:false}}};
 const controller=createAutoFold(snapshot,send);
 function toggle(label,cls){const b=element('button','autoFoldToggle '+cls),text=element('span');b.type='button';b.setAttribute('role','switch');b.setAttribute('aria-label',label);b.append(text);return b}
 const infoButton=element('button','autoFoldInfo'),info=element('div','autoFoldInfoPanel'),infoClose=element('button','autoFoldInfoClose','×');infoButton.type=infoClose.type='button';infoButton.setAttribute('aria-label','Auto-Fold information');infoButton.setAttribute('aria-expanded','false');infoClose.setAttribute('aria-label','Close Auto-Fold information');info.hidden=true;info.setAttribute('role','note');info.append(element('h3','','Auto-Fold'),...['Auto-Fold when your hole cards fall into your range.','Your Auto-Fold range can be adjusted in settings.','Auto-Fold can be turned on and off depending on your position.','Auto-Fold is disabled when there’s a Cash Drop.'].map(text=>element('p','',text)),infoClose);const hideInfo=()=>{info.hidden=true;infoButton.setAttribute('aria-expanded','false')};infoButton.onclick=()=>{info.hidden=false;infoButton.setAttribute('aria-expanded','true')};info.onclick=()=>{hideInfo();infoButton.focus()};
 const active=toggle('Auto Fold','autoFoldActive'),excludeButton=toggle('Do NOT Auto-Fold on the Dealer Button','autoFoldButtonPosition'),excludeBlinds=toggle('Do NOT Auto-Fold on Small Blinds / Big Blinds','autoFoldBlindPosition');
 const positionButton=element('span','autoFoldPositionLabel','Do NOT Auto-Fold on the Dealer Button'),positionBlinds=element('span','autoFoldPositionLabel blinds','Do NOT Auto-Fold on Small Blinds / Big Blinds');
 const apply=element('button','autoFoldApply','Apply'),cancel=element('button','autoFoldCancel','Cancel'),minus=element('button','autoFoldMinus','−'),plus=element('button','autoFoldPlus','+');
 for(const b of [apply,cancel]){const text=b.textContent;b.replaceChildren(element('span','',text))}
 for(const b of [apply,cancel,minus,plus])b.type='button';minus.setAttribute('aria-label','Decrease Auto Fold percentage');plus.setAttribute('aria-label','Increase Auto Fold percentage');
 Object.assign(rate,{type:'range',min:'1',max:'95',step:'1'});rate.setAttribute('aria-label','Auto Fold percentage');
 const rateNumber=element('span'),percent=element('span','','%'),rateControls=element('div','autoFoldRateControls');rateText.append(rateNumber,percent);rateControls.append(minus,rateText,plus);
 const cells=autoFoldMatrix.map(item=>{const b=element('button','autoFoldCell');b.append(element('span','',item.key));b.type='button';b.dataset.index=String(item.index);b.dataset.hand=item.key;b.setAttribute('aria-label',item.key);b.setAttribute('aria-pressed','false');matrix.append(b);return b});
 function render(){
  if(!draft)return;const selected=new Set(draft.selected);
  for(const cell of cells)cell.setAttribute('aria-pressed',String(selected.has(Number(cell.dataset.index))));
  for(const [control,on]of [[active,draft.active],[excludeButton,!draft.button],[excludeBlinds,!draft.blinds]]){control.setAttribute('aria-checked',String(on));control.firstElementChild.textContent=on?'On':'Off'}
  positionButton.classList.toggle('excluded',!draft.button);positionBlinds.classList.toggle('excluded',!draft.blinds);rate.style.setProperty('--auto-fold-progress',String((draft.rate-1)/94));rate.value=String(draft.rate);rateNumber.textContent=String(Math.floor(draft.rate));apply.disabled=JSON.stringify(draft)===JSON.stringify(saved());
 }
 function cellAt(e){const r=matrix.getBoundingClientRect(),x=(e.clientX-r.x)*620/r.width,y=(e.clientY-r.y)*620/r.height;if(x<0||y<0||x>=620||y>=620)return null;return autoFoldMatrix[Math.floor(y/48)*13+Math.floor(x/48)]}
 function select(item,on){const selected=editAutoFoldSelection(draft.selected,item.index,on);if(selected.includes(item.index)!==draft.selected.includes(item.index))draft.rate=Math.max(1,Math.min(95,draft.rate+(on?1:-1)*item.selectRate));draft.selected=selected;render()}
 function stopPaint(){paint=null;paintPointer=null;document.removeEventListener('pointermove',paintMove);document.removeEventListener('pointerup',stopPaint);document.removeEventListener('pointercancel',stopPaint)}
 function paintMove(e){if(paintPointer!==e.pointerId)return;if(!(e.buttons&1)){stopPaint();return}const item=cellAt(e);if(item)select(item,paint);else stopPaint()}
 matrix.onpointerdown=e=>{if(e.button!==0)return;const item=cellAt(e);if(!item)return;e.preventDefault();stopPaint();cells[autoFoldMatrix.indexOf(item)].focus({preventScroll:true});paint=!draft.selected.includes(item.index);paintPointer=e.pointerId;document.addEventListener('pointermove',paintMove);document.addEventListener('pointerup',stopPaint);document.addEventListener('pointercancel',stopPaint);select(item,paint)};
 for(const cell of cells)cell.onclick=e=>{if(e.detail===0){const item=autoFoldItems[Number(cell.dataset.index)];select(item,!draft.selected.includes(item.index))}};
 active.onclick=()=>{draft.active=!draft.active;render()};excludeButton.onclick=()=>{draft.button=!draft.button;render()};excludeBlinds.onclick=()=>{draft.blinds=!draft.blinds;render()};
 function setRate(value){draft.rate=Math.max(1,Math.min(95,value));draft.selected=autoFoldRateSelection(Math.floor(draft.rate));render()}
 rate.oninput=()=>setRate(Number(rate.value));
 function stopRate(){rateDrag=null;document.removeEventListener('pointermove',rateMove);document.removeEventListener('pointerup',stopRate);document.removeEventListener('pointercancel',stopRate)}
 function ratePoint(e){const r=rate.getBoundingClientRect();setRate(Math.round(1+94*((e.clientX-r.x)*498/r.width-13)/472))}
 function rateMove(e){if(rateDrag!==e.pointerId)return;if(!(e.buttons&1)){stopRate();return}ratePoint(e)}
 rate.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();stopRate();rate.focus();rateDrag=e.pointerId;document.addEventListener('pointermove',rateMove);document.addEventListener('pointerup',stopRate);document.addEventListener('pointercancel',stopRate);ratePoint(e)};rate.onblur=stopRate;
 minus.onclick=()=>setRate(draft.rate-1);plus.onclick=()=>setRate(draft.rate+1);addEventListener('blur',()=>{stopRate();stopPaint()});
 function close(){opening?.cancel();opening=null;hideInfo();stopRate();stopPaint();if(dialog.open)dialog.close()}
 cancel.onclick=close;dialog.onclose=()=>{draft=null;draftIdentity=null;stopPaint();if(!button.hidden)root.querySelector('summary')?.focus()};
 apply.onclick=()=>{if(draftIdentity!==get().identity){close();return}try{localStorage.setItem(key(),JSON.stringify(draft))}catch{storageError=true;error.textContent='Could not save Auto Fold settings. Your saved settings are unchanged; retry or Cancel.';return}storageError=false;controller.preferencesChanged();close();refresh()};
 button.onclick=()=>{root.open=false;draftIdentity=get().identity;draft=saved();error.textContent='';hideInfo();render();dialog.show();fit();opening?.cancel();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)opening=panel.animate([{transform:'translateX(720px)'},{transform:'translateX(0)'}],{duration:200,easing:'cubic-bezier(0.3333333333333333,1,0.6666666666666666,1)'});infoButton.style.left=String(58+title.offsetWidth)+'px';active.focus()};
 function refresh(){const data=get();button.hidden=!data.supported||!data.state?.registered||!data.identity;button.textContent='Auto Fold · '+(saved().active?'On':'Off');if(button.hidden||dialog.open&&draftIdentity!==data.identity)close();if(dialog.open&&draft&&!storageError)render();controller.observe()}
 function interrupt(){controller.interrupt();if(!get().state?.registered){button.hidden=true;close()}}
 function fit(){const r=document.querySelector('.felt').getBoundingClientRect(),scale=Math.min(r.width/1700,(innerWidth-16)/750,(innerHeight-16)/1112);dialog.style.setProperty('--auto-fold-scale',String(scale));dialog.style.left=(r.right-720*scale)+'px';dialog.style.top=(r.bottom-1112*scale)+'px'}
 dialog.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();close()}};
 document.addEventListener('pointerdown',e=>{if(!info.hidden&&!info.contains(e.target)&&!infoButton.contains(e.target))hideInfo();if(dialog.open&&!dialog.contains(e.target)&&!button.contains(e.target))close()});addEventListener('resize',fit);
 const storage=e=>{if(e.key===null||e.key===key()){controller.preferencesChanged();if(!dialog.open)refresh()}};
 addEventListener('storage',storage);addEventListener('offline',interrupt);addEventListener('pagehide',interrupt);
 panel.append(title,infoButton,active,matrix,rateControls,element('span','autoFoldMin','Min'),element('span','autoFoldMax','Max'),rate,positionButton,excludeButton,positionBlinds,excludeBlinds,apply,cancel,error,info);dialog.append(panel);document.body.append(dialog);root.append(button);
 return {refresh,interrupt};
}
