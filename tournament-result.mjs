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

export function installTournamentResult(settings,context,openHistory,avatarSource,play){
 const make=(tag,className,text)=>{const node=document.createElement(tag);node.className=className;if(text!==undefined)node.textContent=text;return node};
 const reopen=make('button','tournamentResultReopen','Tournament result');reopen.type='button';reopen.hidden=true;settings.append(reopen);
 let dialog=null,identity='',dismissed='',paint='',shown='',generation=0,stopSound=null;
 const close=()=>{generation++;stopSound?.();stopSound=null;if(dialog){dialog.close();dialog.remove();dialog=null}paint='';shown=''};
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
   const heading=make('h2','resultHeading','Tournament result'),summary=make('section','resultSummary'),avatar=make('img','resultAvatar'),name=make('p','resultPlayer'),title=make('p','resultTitle'),date=make('p','resultDate'),rank=make('p','resultRank'),message=make('p','resultMessage'),label=make('p','resultPrizeLabel','Total Prize'),prize=make('output','resultPrize'),status=make('p','resultStatus'),actions=make('div','resultActions'),last=make('button','resultLastHand','Last Hand'),done=make('button','resultClose','Close');
   last.type=done.type='button';last.onclick=()=>{close();dismissed=result.key;openHistory()};done.onclick=()=>{dismissed=result.key;close()};dialog.oncancel=event=>{event.preventDefault();dismissed=result.key;close()};
   avatar.alt='';summary.append(avatar,name,title,date,rank);actions.append(last,done);dialog.append(heading,summary,message,label,prize,status,actions);document.body.append(dialog);dialog.showModal();
   const current=++generation;Promise.resolve(play([result.won?'TournamentResultFT':result.prize>0?'TournamentResultITM':'TournamentFallResult'],()=>current===generation&&!!dialog)).then(stop=>{if(!stop)return;if(current!==generation)stop();else stopSound=stop}).catch(()=>{});
  }
  const signature=JSON.stringify(result);if(signature===paint)return;paint=signature;
  const set=(selector,text)=>{dialog.querySelector(selector).textContent=text};
  dialog.dataset.winner=String(result.won);dialog.dataset.place=String(result.place);dialog.dataset.settled=String(result.settled);
  const avatar=dialog.querySelector('.resultAvatar'),src=avatarSource(result.avatar);if(avatar.getAttribute('src')!==src)avatar.setAttribute('src',src);
  set('.resultPlayer',result.name);set('.resultTitle',result.title);set('.resultDate',result.startedAt===null?'Start time unavailable':new Date(result.startedAt).toLocaleString());set('.resultRank',result.place+' / '+result.entries);
  set('.resultMessage',result.won?'Congratulations!\nYou have won the tournament.':result.prize===0?'That was very unfortunate.\nSee you next time!':'Tournament complete for your seat.');
  set('.resultPrize',result.prize+' play credits');set('.resultStatus',result.walletCredited?'Credited to your local wallet.':result.settled?'Practice result; no wallet transfer.':'Award pending tournament completion.');
 }
 reopen.onclick=()=>refresh(true);document.addEventListener('visibilitychange',()=>refresh());
 return {refresh};
}
