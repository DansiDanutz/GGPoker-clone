import {rank5} from './engine/hand.mjs';
import {element,cards,historyWinningCards,hudPercent,hudColor,updateElement} from './felt.mjs';
const faces='23456789TJQKA';
export function currentHandRank(hole,board,short=false){
 const all=[...(Array.isArray(hole)?hole:[]),...(Array.isArray(board)?board:[])];
 if(typeof short!=='boolean'||!Array.isArray(hole)||![2,4,5,6].includes(hole.length)||!Array.isArray(board)||![0,3,4,5].includes(board.length)||short&&hole.length!==2||new Set(all).size!==all.length||!all.every(c=>typeof c==='string'&&(short?/^[6-9TJQKA][cdhs]$/:/^[2-9TJQKA][cdhs]$/).test(c)))return null;
 if(!board.length){let pair=null,score=-1;for(let a=0;a<hole.length-1;a++)for(let b=a+1;b<hole.length;b++){const x=faces.indexOf(hole[a][0]),y=faces.indexOf(hole[b][0]),value=x===y?1000+x:Math.max(x,y)*13+Math.min(x,y);if(value>score){score=value;pair=[hole[a],hole[b]]}}return {cards:pair.map(card=>({card,hole:true})),label:pair[0][0]===pair[1][0]?'a pair of '+pair[0][0]+'s':faces[Math.max(...pair.map(c=>faces.indexOf(c[0]))) ]+' high'};}
 const selected=historyWinningCards(hole,board,short);if(!selected)return null;const r=rank5(selected.map(c=>c.card)),face=n=>faces[n-2];
 const labels=[face(r[1])+' high','a pair of '+face(r[1])+'s','two pair, '+face(r[1])+'s and '+face(r[2])+'s','three of a kind, '+face(r[1])+'s','a straight','a flush','a full house, '+face(r[1])+'s full of '+face(r[2])+'s','four of a kind, '+face(r[1])+'s',r[1]===14?'a royal flush':'a straight flush'];
 // Short Deck A6789 is not a standard-deck straight.
 const wheel=short&&selected.map(c=>c.card[0]).sort().join('')==='6789A';
 return {cards:selected,label:wheel?(selected.every(c=>c.card[1]===selected[0].card[1])?'a straight flush':'a straight'):labels[r[0]]};
}
export function sessionDuration(startedAt,now=Date.now()){
 if(!Number.isSafeInteger(startedAt)||startedAt<0||startedAt>8640000000000000||!Number.isFinite(now))return '-';
 const seconds=Math.floor(Math.max(0,now-startedAt)/1000),minutes=Math.floor(seconds/60),pad=n=>String(n).padStart(2,'0');
 return minutes>=60?pad(Math.floor(minutes/60))+'h '+pad(minutes%60)+'m':pad(minutes)+'m '+pad(seconds%60)+'s';
}
export function installHandPanel(context,getHud,onProfile){
 const felt=document.querySelector('.felt'),panel=element('section','nativeBestFive');if(!felt)return {refresh(){}};
 panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Current hand, HUD and session statistics');felt.append(panel);
 let opened=false,tab='Hand Rank',scope='',paintKey='',timer=null;
 const identity=()=>{const c=context();return c.enabled&&c.state?.me!=null?JSON.stringify([c.room,c.token,c.state.me]):''};
 function close(){clearInterval(timer);timer=null;opened=false;panel.hidden=true;panel.replaceChildren();paintKey='';scope='';}
 function own(){const c=context(),s=c.state,g=s?.hand,hole=g?.cards?.[s.me];return identity()&&getHud()?.stats&&g&&hole?.every(Boolean)&&!document.body.classList.contains('squeeze-active')?currentHandRank(hole,g.board,s.settings?.variant==='shortdeck'):null;}
 function paint(){
  const c=context(),s=c.state,g=s?.hand,hand=own();if(!hand||scope!==identity()){close();return}if(!opened)return;
  const hud=getHud(),stats=hud?.stats,key=JSON.stringify([tab,s.number,hand,hud,s.sessionStats,tab==='Stats'?sessionDuration(s.sessionStartedAt):null,g.timeBanks?.[s.me],g.clock]);if(key===paintKey)return;paintKey=key;
  const next=panel.cloneNode(false);next.hidden=false;const tabs=element('div','bestFiveTabs');tabs.setAttribute('role','tablist');
  for(const name of ['Hand Rank','HUD','Stats']){const b=element('button','',name);b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',String(tab===name));b.tabIndex=tab===name?0:-1;b.onclick=()=>{tab=name;paintKey='';paint();panel.querySelector('[aria-selected=true]').focus()};b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const names=['Hand Rank','HUD','Stats'];tab=names[e.key==='Home'?0:e.key==='End'?2:(names.indexOf(tab)+(e.key==='ArrowRight'?1:2))%3];paintKey='';paint();panel.querySelector('[aria-selected=true]').focus()}};tabs.append(b)}next.append(tabs);
  const body=element('div','bestFiveBody');body.setAttribute('role','tabpanel');body.setAttribute('aria-label',tab);
  if(tab==='Hand Rank'){
   const label=element('output','bestFiveLabel',hand.label),list=element('div','bestFiveCards');for(const [i,item]of hand.cards.entries()){const card=cards([item.card])[0];card.dataset.hole=String(item.hole);card.dataset.card=item.card;card.style.left=(i*103)/17+'cqw';card.style.top=(item.hole?44:68)/17+'cqw';list.append(card)}body.append(label,list);
  }else if(tab==='HUD'){
   const graphs=element('div','bestFiveHud');for(const [name,value]of Object.entries({...((s.settings?.variant==='aof'?{AllIn:null,ATS:null,Fold:null,FTA:null}:hud?.values)||{VPIP:null,PFR:null,ATS:null,'3-bet':null}),Hands:stats?.hands??null})){const cell=element('div'),label=element('span','',name),valueNode=element('output','',value===null?'-':name==='Hands'?String(value):value+'%');cell.dataset.stat=name;cell.style.setProperty('--best-hud-color',name==='Hands'?'#999':hudColor(value,name));cell.style.setProperty('--best-hud-ratio',(name==='Hands'||value===null?0:Math.trunc(value/100*360))+'deg');cell.append(label,valueNode);graphs.append(cell)}body.append(graphs);
  }else{
   const list=element('dl','bestFiveStats');const session=s.sessionStats,bank=g.timeBanks?.[s.me],time=Number.isFinite(bank)?Math.ceil(bank/1000):null,known=Number.isSafeInteger(session?.showdowns)&&session.showdowns>0&&Number.isSafeInteger(session?.showdownWins),rate=known?Math.trunc(session.showdownWins/session.showdowns*100):null;
   // shortcut: sit-out/card-bank counters are not stored locally; keep them unknown until those lifecycle contracts exist.
   for(const [name,value]of [['Session time',sessionDuration(s.sessionStartedAt)],['Hands',session?.hands??'-'],['Pots won at showdown',known?session.showdownWins+' of '+session.showdowns+' ('+rate+'%)':'-'],['Pots won without showdown',session?.nonShowdownWins??'-'],['Time bank',time===null?'-':Math.floor(time/60)+':'+String(time%60).padStart(2,'0')],['Sit-out time','-']]){if(s.settings?.variant==='aof'&&['Pots won without showdown','Time bank'].includes(name))continue;list.append(element('dt','',name),element('dd','',String(value)))}body.append(list);
  }
  body.title=tab==='Stats'?'Current local seat session; unknown legacy/Rush session counters stay unavailable':'Recorded local table or Rush pool sample; native all-time statistics are not imported';next.append(body);
  const profile=element('button','bestFiveProfile','My Profile'),dismiss=element('button','bestFiveClose','Close');profile.type=dismiss.type='button';profile.onclick=()=>{close();onProfile()};dismiss.onclick=()=>{close();felt.querySelector('[data-best-five-open]')?.focus()};next.append(profile,dismiss);updateElement(panel,next);
 }
 function open(){if(!own())return;opened=true;scope=identity();tab='Hand Rank';paintKey='';paint();clearInterval(timer);timer=setInterval(paint,1000);panel.querySelector('[role=tab][aria-selected=true]')?.focus();}
 document.addEventListener('click',e=>{e.bestFiveBlocked=e.target.closest?.('.chipShuffleArt')?.dataset.active==='true'},true);
 document.addEventListener('click',e=>{if(!e.bestFiveBlocked&&e.target.closest?.('[data-best-five-open]')){opened?close():open()}});
 document.addEventListener('pointerdown',e=>{if(opened&&!panel.contains(e.target)&&!e.target.closest?.('[data-best-five-open]'))close()});
 document.addEventListener('keydown',e=>{if(opened&&e.key==='Escape'){e.preventDefault();close();felt.querySelector('[data-best-five-open]')?.focus()}else if(e.target.closest?.('[data-best-five-open]')&&e.target.dataset.active!=='true'&&['Enter',' '].includes(e.key)){e.preventDefault();opened?close():open()}});
 return {refresh(){if(!own()||scope&&scope!==identity())close();for(const portrait of felt.querySelectorAll('.seat[data-own=true] .portrait,.chipShuffleArt:not(.remoteShuffle)')){const enabled=!!own()&&portrait.dataset.active!=='true';if(enabled){portrait.dataset.bestFiveOpen='';portrait.setAttribute('role','button');portrait.tabIndex=0;portrait.setAttribute('aria-label','Open current hand rank')}else{delete portrait.dataset.bestFiveOpen;portrait.removeAttribute('tabindex');if(portrait.classList.contains('chipShuffleArt')){portrait.setAttribute('role','img');portrait.setAttribute('aria-label','Your chip shuffle')}else{portrait.removeAttribute('role');portrait.setAttribute('aria-label','Avatar for '+context().state?.names?.[context().state.me])}}}paint()}};
}
