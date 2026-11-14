import {element,avatarSource} from './felt.mjs';
export function installBattleHud(event){
 let dialog=null,target=null,viewer=null,epoch=0,loading=false;
 function close(){epoch++;loading=false;target=viewer=null;if(dialog){const old=dialog;dialog=null;old.close();old.remove()}}
 async function read(path){const response=await fetch(path,{cache:'no-store'}),data=await response.json();if(!response.ok){const error=Error(data.error||'HUD unavailable');error.status=response.status;throw error}return data}
 async function refresh(){
  if(!dialog||loading)return;loading=true;const stamp=epoch,pane=dialog,name=target;pane.querySelector('.battleHudMessage').textContent='';
  try{
   const before=await read('/local/me');if(stamp!==epoch)return;if(viewer&&before.name!==viewer){close();return}viewer=before.name;
   const data=await read('/api/battle/'+encodeURIComponent(event)+'/hud?player='+encodeURIComponent(name)),after=await read('/local/me');
   if(stamp!==epoch)return;if(before.name!==after.name){close();return}if(data.name!==name||data.scope!=='completed-local-events')throw Error('Player HUD changed');
   pane.dataset.mine=String(name===viewer);pane.querySelector('.battleHudAvatar').src=avatarSource(data.avatar);
   const values={totalWinnings:data.totalWinnings,passStage1Rate:data.passStage1Rate===null?'—':data.passStage1Rate+'%',finalRankAverage:data.finalRankAverage===null?'—':data.finalRankAverage.toLocaleString('en-US',{maximumFractionDigits:2})+(data.finalTableSizes.length===1?' / '+data.finalTableSizes[0]:''),totalBounty:data.totalBounty,totalKills:data.totalKills??'—',games:data.games};
   for(const [key,value]of Object.entries(values))pane.querySelector('[data-metric='+key+']').textContent=String(value);
   pane.querySelector('[data-metric=totalWinnings]').classList.toggle('zero',data.totalWinnings===0);
  }catch(error){if(stamp===epoch){if([401,403,404].includes(error.status)){close();return}for(const output of pane.querySelectorAll('[data-metric]'))output.textContent='—';pane.querySelector('.battleHudMessage').textContent=error.message}}
  finally{if(stamp===epoch)loading=false}
 }
 function open(name){
  if(dialog&&target===name){dialog.focus();return}close();target=name;const pane=element('dialog','battleHud');dialog=pane;pane.id='battleHud';pane.setAttribute('aria-label','Battle Royale HUD for '+name);pane.tabIndex=-1;
  const title=element('h2','','Smart HUD'),identity=element('strong','battleHudName',name),avatar=element('img','battleHudAvatar'),scope=element('p','battleHudScope','Completed local events · play credits'),dismiss=element('button','battleHudClose'),card=element('section','battleHudCard'),message=element('p','battleHudMessage');dismiss.type='button';dismiss.setAttribute('aria-label','Close Battle HUD');dismiss.onclick=close;avatar.alt='';message.setAttribute('role','status');
  for(const [key,label]of [['totalWinnings','Total Winnings'],['passStage1Rate','Rush Stage Clear'],['finalRankAverage','Final Avg Finish'],['totalBounty','Total Bounty'],['totalKills','Total Kills'],['games','Games']]){const item=element('div','battleHudMetric '+key),caption=element('span','',label),output=element('output','','—');output.dataset.metric=key;if(key==='totalKills')item.title='Shared-elimination attribution is not established for this local summary';item.append(caption,output);card.append(item)}
  pane.append(title,dismiss,avatar,identity,scope,card,message);pane.oncancel=e=>{e.preventDefault();close()};pane.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();close()}};document.body.append(pane);pane.show();dismiss.focus();void refresh();
 }
 addEventListener('pagehide',close);return {open,close,refresh,retain(names){if(target&&!names.includes(target))close()}};
}
