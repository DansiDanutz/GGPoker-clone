import {prizeAmounts} from './engine/prizes.mjs';
const timestamp=value=>Number.isSafeInteger(value)&&value>=0&&value<=8640000000000000?value:null;
export function tournamentResult(state,room){
 const t=state?.tournament,me=state?.me,names=state?.names;
 if(!t||typeof room!=='string'||!room||!Number.isInteger(me)||!Array.isArray(names)||!names[me]||timestamp(t.startedAt)===null||t.out?.[me]==null&&t.winner!==me)return null;
 const place=t.finishes?.[me],entries=names.filter(Boolean).length;
 if(!Number.isInteger(place)||place<1||place>entries||place===1&&t.winner!==me||!Number.isSafeInteger(t.pool)||t.pool<0)return null;
 let amounts;try{amounts=prizeAmounts(t.pool,t.prizeShares||[100])}catch{return null}
 const settled=Array.isArray(t.prizes);
 if(t.prizes!=null&&(!settled||t.prizes.length!==names.length||!t.prizes.every(n=>Number.isSafeInteger(n)&&n>=0)||t.prizes.reduce((n,v)=>n+v,0)!==t.pool))return null;
 if(settled&&t.prizes.some((prize,i)=>prize!==(amounts[t.finishes?.[i]-1]||0)))return null;
 const prize=settled?t.prizes[me]:amounts[place-1]||0,startedAt=timestamp(t.actualStartedAt),completedAt=timestamp(place===1?t.finishedAt:t.eliminatedAt?.[me]);
 return {key:JSON.stringify([room,t.actualStartedAt??'legacy',me,names[me],t.out?.[me]??'winner']),name:names[me],title:state.settings?.name||'Tournament',avatar:state.avatars?.[me]??0,place,entries,won:place===1,prize,settled,walletCredited:settled&&state.tournamentEntryPaid===true&&t.walletSettled===true,startedAt,completedAt,elapsedSeconds:startedAt!==null&&completedAt!==null&&completedAt>=startedAt?Math.floor((completedAt-startedAt)/1000):null,lastHand:t.out?.[me]??state.number};
}

export function installTournamentResult(settings,context,openHistory,avatarSource,play,exportPng){
 const make=(tag,className='',text)=>{const node=document.createElement(tag);node.className=className;if(text!==undefined)node.textContent=text;return node};
 const reopen=make('button','tournamentResultReopen','Tournament result');reopen.type='button';reopen.hidden=true;settings.append(reopen);
 let dialog=null,identity='',dismissed='',paint='',shown='',generation=0,stopSound=null,exportFrame=null,font=null;
 const close=()=>{generation++;exportFrame?.remove();exportFrame=null;stopSound?.();stopSound=null;if(dialog){dialog.close();dialog.remove();dialog=null}paint='';shown=''};
 function refresh(manual=false){
  const c=context(),result=tournamentResult(c.state,c.room),scope=JSON.stringify([c.room,c.token,c.state?.me]);
  if(scope!==identity){close();identity=scope;dismissed=''}
  reopen.hidden=!result;
  if(!result){close();return}
  if(dialog&&shown!==result.key)close();
  if(c.animating){close();return}
  if(document.visibilityState==='hidden')return;
  if(!dialog&&!manual&&dismissed===result.key)return;
  if(!dialog){
   shown=result.key;dialog=make('dialog','tournamentResult');dialog.setAttribute('aria-label','Tournament result');
   const heading=make('h2','resultHeading','Tournament result'),summary=make('section','resultSummary'),avatar=make('img','resultAvatar'),name=make('p','resultPlayer'),title=make('p','resultTitle'),date=make('p','resultDate'),rank=make('p','resultRank'),message=make('p','resultMessage'),label=make('p','resultPrizeLabel','Total Prize'),prize=make('output','resultPrize'),status=make('p','resultStatus'),actions=make('div','resultActions'),last=make('button','resultLastHand','Last Hand'),save=make('button','resultSave','Save'),done=make('button','resultClose','Close');
   status.setAttribute('role','status');last.type=save.type=done.type='button';last.onclick=()=>{close();dismissed=result.key;openHistory()};done.onclick=()=>{dismissed=result.key;close()};dialog.oncancel=event=>{event.preventDefault();dismissed=result.key;close()};
   avatar.alt='';summary.append(make('span','resultInfo'),make('span','resultRibbon'),avatar,name,title,date,rank);actions.append(save,done);dialog.append(heading,summary,message,label,prize,status,last,actions);
   save.onclick=async()=>{
    if(save.disabled)return;save.disabled=true;const expected=generation,view=dialog,frame=make('section','resultExport'),copy=view.cloneNode(true);frame.setAttribute('aria-hidden','true');exportFrame=frame;copy.style.cssText='position:absolute;display:block;left:-2px;top:-30px;margin:0;max-width:none;max-height:none;content-visibility:visible';copy.querySelector('.resultActions').remove();copy.querySelector('.resultLastHand').remove();frame.append(copy);document.body.append(frame);
    try{const raw=await exportPng(frame);if(expected!==generation||dialog!==view)return;const image=await createImageBitmap(raw),canvas=document.createElement('canvas');canvas.width=356;canvas.height=535;try{canvas.getContext('2d').drawImage(image,0,0)}finally{image.close()}const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('PNG encoding failed')),'image/png'));if(expected!==generation||dialog!==view)return;const url=URL.createObjectURL(blob),link=make('a');link.href=url;link.download=resultFileName(result);try{document.body.append(link);link.click()}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}}catch(error){if(expected===generation&&dialog===view)status.textContent='Could not save result: '+error.message}finally{frame.remove();if(exportFrame===frame)exportFrame=null;save.disabled=false}
   };document.body.append(dialog);dialog.showModal();
   const current=++generation;Promise.resolve(play([result.won?'TournamentResultFT':result.prize>0?'TournamentResultITM':'TournamentFallResult'],()=>current===generation&&!!dialog)).then(stop=>{if(!stop)return;if(current!==generation)stop();else stopSound=stop}).catch(()=>{});
  }
  const signature=JSON.stringify(result);if(signature===paint)return;paint=signature;
  const set=(selector,text)=>{dialog.querySelector(selector).textContent=text};
  dialog.dataset.winner=String(result.won);dialog.dataset.place=String(result.place);dialog.dataset.settled=String(result.settled);
  const avatar=dialog.querySelector('.resultAvatar'),src=avatarSource(result.avatar);if(avatar.getAttribute('src')!==src)avatar.setAttribute('src',src);
  set('.resultPlayer',result.name);set('.resultTitle',result.title);set('.resultDate',result.startedAt===null?'Start time unavailable':new Date(result.startedAt).toLocaleString());set('.resultRank',result.place+' / '+result.entries);
  set('.resultMessage',result.won?'Congratulations!\nYou have won the tournament.':result.prize===0?'That was very unfortunate.\nSee you next time!':'Tournament complete for your seat.');
  const prize=dialog.querySelector('.resultPrize'),layout=resultGlyphLayout(result.prize,font);
  if(layout){const digits=make('span','nativeResultDigits');digits.style.width=layout.width+'px';digits.style.height=layout.height+'px';for(const g of layout.glyphs){const node=make('span','nativeResultGlyph',g.digit);Object.assign(node.style,{left:g.left+'px',top:g.top+'px',width:g.width+'px',height:g.height+'px',backgroundPosition:-g.x+'px '+-g.y+'px',backgroundSize:layout.atlasWidth+'px '+layout.atlasHeight+'px'});digits.append(node)}prize.replaceChildren(digits,make('span','resultCreditUnit',' play credits'))}else prize.textContent=result.prize+' play credits';set('.resultStatus',result.walletCredited?'Credited to your local wallet.':result.settled?'Practice result; no wallet transfer.':'Award pending tournament completion.');
 }
 fetch('/home-art/native-result-font.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(async data=>{if(!resultGlyphLayout(0,data))throw Error();const image=new Image();image.src='/home-art/native-result-font.png';await image.decode();if(image.naturalWidth!==data.atlasSize[0]||image.naturalHeight!==data.atlasSize[1])throw Error();font=data;paint='';refresh()}).catch(()=>{});
 reopen.onclick=()=>refresh(true);document.addEventListener('visibilitychange',()=>refresh());
 return {refresh};
}

export function resultFileName(result,now=new Date()){
 if(!Number.isFinite(now.getTime())||!Number.isInteger(result.place)||result.place<1)throw Error('Invalid result export');
 const pad=n=>String(n).padStart(2,'0'),hour=now.getUTCHours(),title=String(result.title||'Tournament').replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').slice(0,120);
 return now.getUTCFullYear()+'-'+pad(now.getUTCMonth()+1)+'-'+pad(now.getUTCDate())+'_ '+pad(hour%12||12)+'-'+pad(now.getUTCMinutes())+'_'+(hour>=12?'PM':'AM')+'_'+title+'_'+result.place+'.png';
}

export function resultGlyphLayout(value,font){
 if(!Number.isSafeInteger(value)||value<0)return null;return resultTextGlyphLayout(String(value),font,32);
}
export function resultTextGlyphLayout(text,font,size){
 if(typeof text!=='string'||!text||text.length>64||![32,40,90].includes(size)||font?.size!==56||!Array.isArray(font.glyphs)||font.glyphs.length>128||!Array.isArray(font.atlasSize)||font.atlasSize.length!==2||!font.atlasSize.every(n=>Number.isInteger(n)&&n>0&&n<=4096))return null;
 const r=font.region;if(!r||!['x','y','width','height'].every(k=>Number.isInteger(r[k])&&r[k]>=0)||r.x+r.width>font.atlasSize[0]||r.y+r.height>font.atlasSize[1])return null;
 if(!font.glyphs.every(g=>g&&Number.isInteger(g.id)&&g.id>=0&&g.id<=1114111)||new Set(font.glyphs.map(g=>g.id)).size!==font.glyphs.length)return null;
 const scale=size/56,byId=new Map(font.glyphs.map(g=>[g.id,g])),glyphs=[];let width=0,height=0;
 for(const digit of text){
  const g=byId.get(digit.charCodeAt(0));if(!g||!['x','y','width','height','xoffset','yoffset','xadvance'].every(k=>Number.isInteger(g[k])&&g[k]>=0&&g[k]<=4096)||!g.width||!g.height||!g.xadvance||g.x+g.width>r.width||g.y+g.height>r.height)return null;
  glyphs.push({digit,left:(width+g.xoffset)*scale,top:g.yoffset*scale,width:g.width*scale,height:g.height*scale,x:(r.x+g.x)*scale,y:(r.y+g.y)*scale});width+=g.xadvance;height=Math.max(height,g.yoffset+g.height);
 }
 return {width:width*scale,height:height*scale,atlasWidth:font.atlasSize[0]*scale,atlasHeight:font.atlasSize[1]*scale,glyphs};
}
