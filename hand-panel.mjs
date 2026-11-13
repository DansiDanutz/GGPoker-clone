import {rank5,handDraw} from './engine/hand.mjs';
import {element,cards,gameClockRemaining,historyWinningCards,hudPercent,hudColor,updateElement} from './felt.mjs';
const faces='23456789TJQKA';
const drawLabels={RoyalStraightFlushDraw:'Royal Flush Draw',StraightFlushDraw:'Straight Flush Draw',FlushDrawDoubleGutshotStraightDraw:'Flush & Double Gutshot Draw',FlushDrawGutshotStraightDraw:'Flush & Gutshot Draw',FlushDrawOpenEndedStraightDraw:'Flush & Open Ended Draw',DoubleGutshotStraightDraw:'Double Gutshot Draw',OpenEndedStraightDraw:'Open Ended Draw',GutshotStraightDraw:'Gutshot Draw',FlushDraw:'Flush Draw'};
export function currentHandRank(hole,board,short=false){
 const all=[...(Array.isArray(hole)?hole:[]),...(Array.isArray(board)?board:[])];
 if(typeof short!=='boolean'||!Array.isArray(hole)||![2,4,5,6].includes(hole.length)||!Array.isArray(board)||![0,3,4,5].includes(board.length)||short&&hole.length!==2||new Set(all).size!==all.length||!all.every(c=>typeof c==='string'&&(short?/^[6-9TJQKA][cdhs]$/:/^[2-9TJQKA][cdhs]$/).test(c)))return null;
 if(!board.length){let pair=null,score=-1;for(let a=0;a<hole.length-1;a++)for(let b=a+1;b<hole.length;b++){const x=faces.indexOf(hole[a][0]),y=faces.indexOf(hole[b][0]),value=x===y?1000+x:Math.max(x,y)*13+Math.min(x,y);if(value>score){score=value;pair=[hole[a],hole[b]]}}return {cards:pair.map(card=>({card,hole:true})),drawKey:'',labelKey:pair[0][0]===pair[1][0]?'1P':'HC',labelValues:[pair[0][0]===pair[1][0]?pair[0][0]:faces[Math.max(...pair.map(c=>faces.indexOf(c[0])))]],label:pair[0][0]===pair[1][0]?'a pair of '+pair[0][0]+'s':faces[Math.max(...pair.map(c=>faces.indexOf(c[0]))) ]+' high'};}
 const selected=historyWinningCards(hole,board,short);if(!selected)return null;const r=rank5(selected.map(c=>c.card)),face=n=>faces[n-2];
 // Short Deck A6789 is not a standard-deck straight.
 const wheel=short&&selected.map(c=>c.card[0]).sort().join('')==='6789A',range=wheel?'A to 9':r[0]===4||r[0]===8?(r[1]===5?'A':face(r[1]-4))+' to '+face(r[1]):'';
 const labels=[face(r[1])+' high','a pair of '+face(r[1])+'s','two pair, '+face(r[1])+'s and '+face(r[2])+'s','three of a kind, '+face(r[1])+'s','a straight, '+range,'a flush '+face(r[1])+' high','a full house, '+face(r[1])+'s full of '+face(r[2])+'s','four of a kind, '+face(r[1])+'s',r[1]===14?'a royal flush':'a straight flush, '+range];
 const category=wheel?(selected.every(c=>c.card[1]===selected[0].card[1])?8:4):r[0],labelKey=category===8&&r[1]===14&&!wheel?'RF':['HC','1P','2P','3K','S','F','FH','4K','SF'][category],labelValues=labelKey==='RF'?[]:labelKey==='S'||labelKey==='SF'?(wheel?['A','9']:[r[1]===5?'A':face(r[1]-4),face(r[1])]):[face(r[1]),...(['2P','FH'].includes(labelKey)?[face(r[2])]:[])];
 return {cards:selected,drawKey:handDraw(hole,board),labelKey,labelValues,label:wheel?(selected.every(c=>c.card[1]===selected[0].card[1])?'a straight flush, ':'a straight, ')+range:labels[r[0]]};
}
export function sessionDuration(startedAt,now=Date.now()){
 if(!Number.isSafeInteger(startedAt)||startedAt<0||startedAt>8640000000000000||!Number.isFinite(now))return '-';
 const seconds=Math.floor(Math.max(0,now-startedAt)/1000),minutes=Math.floor(seconds/60),pad=n=>String(n).padStart(2,'0');
 return minutes>=60?pad(Math.floor(minutes/60))+'h '+pad(minutes%60)+'m':pad(minutes)+'m '+pad(seconds%60)+'s';
}
export function bestFiveMotion(previous,next){
 for(const list of [previous,next])if(!Array.isArray(list)||list.length>5||new Set(list.map(c=>c?.card)).size!==list.length||!list.every(c=>typeof c?.hole==='boolean'&&/^[2-9TJQKA][cdhs]$/.test(c.card)))throw new TypeError('Distinct known best-five cards required');
 const positions=new Map(previous.map((c,i)=>[c.card,i]));
 return {out:previous.length?200:0,fadeOut:next.flatMap((c,i)=>positions.has(c.card)?[]:[i]),cards:next.map((c,i)=>({...c,from:(positions.has(c.card)?positions.get(c.card):i)*103,to:i*103,y:c.hole?44:68,delay:positions.has(c.card)?0:500,duration:positions.has(c.card)?500:300,fresh:!positions.has(c.card)}))};
}
export function installHandPanel(context,getHud,onProfile){
 const felt=document.querySelector('.felt'),panel=element('section','nativeBestFive');if(!felt)return {refresh(){},setAuthorized(){}};
 panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Current hand, HUD and session statistics');felt.append(panel);
 let opened=false,tab='Hand Rank',scope='',paintKey='',timer=null,cardTimer=null,cardLayer=null,cardKey='',cardHand='',shown=[],cardEpoch=0,revokedScope='',closing=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function fitHudLabels(){for(const label of panel.querySelectorAll('.bestFiveHud span')){label.style.fontSize='';if(label.clientWidth&&label.scrollWidth>label.clientWidth)label.style.fontSize=parseFloat(getComputedStyle(label).fontSize)*label.clientWidth/label.scrollWidth+'px'}}
 new MutationObserver(fitHudLabels).observe(panel,{subtree:true,childList:true,characterData:true});new ResizeObserver(fitHudLabels).observe(panel);document.fonts.ready.then(fitHudLabels).catch(()=>{});
 const identity=()=>{const c=context();return c.enabled&&c.state?.me!=null?JSON.stringify([c.room,c.token,c.state.me]):''};
 function resetCards(){clearTimeout(cardTimer);cardTimer=null;cardEpoch++;if(cardLayer){for(const node of cardLayer.children)for(const a of node.getAnimations())a.cancel();cardLayer.replaceChildren()}cardLayer=null;cardKey='';shown=[];}
 function paintCards(layer,items,handKey){
  const key=JSON.stringify(items);if(layer===cardLayer&&key===cardKey)return;
  const previous=shown,plan=bestFiveMotion(previous,items);clearTimeout(cardTimer);cardTimer=null;const epoch=++cardEpoch;
  cardLayer=layer;cardKey=key;cardHand=handKey;
  const easing='cubic-bezier(0.3333333333,1,0.6666666667,1)';
  const enter=()=>{if(epoch!==cardEpoch||!opened||scope!==identity()||cardLayer!==layer)return;const nodes=plan.cards.map(item=>{const node=cards([item.card])[0];node.dataset.card=item.card;node.dataset.hole=String(item.hole);node.style.left=item.to/17+'cqw';node.style.top=item.y/17+'cqw';node.style.opacity='1';return node});for(const old of layer.children)for(const a of old.getAnimations())a.cancel();layer.replaceChildren(...nodes);shown=items.map(c=>({...c}));if(!reduced.matches)for(const [i,item]of plan.cards.entries()){const node=nodes[i];if(item.fresh)node.animate([{opacity:0},{opacity:1}],{delay:item.delay,duration:item.duration,easing,fill:'backwards'});else node.animate([{left:item.from/17+'cqw'},{left:item.to/17+'cqw'}],{duration:item.duration,easing})}};
  if(!reduced.matches&&plan.out){for(const i of plan.fadeOut){const node=layer.children[i];if(node){const style=getComputedStyle(node),opacity=node.isConnected?style.opacity:node.style.opacity,left=node.isConnected?parseFloat(style.left)/felt.getBoundingClientRect().width*100+'cqw':node.style.left;for(const a of node.getAnimations())a.cancel();node.style.left=left;node.style.opacity='0';node.animate([{opacity},{opacity:0}],{duration:200,easing,fill:'forwards'})}}cardTimer=setTimeout(enter,plan.out)}else enter();
 }
 function close(){const animation=closing;closing=null;animation?.cancel();panel.inert=false;resetCards();cardHand='';clearInterval(timer);timer=null;opened=false;panel.hidden=true;panel.replaceChildren();paintKey='';scope='';}
 function hide(){
  if(!opened)return;if(reduced.matches){close();return}
  opened=false;clearInterval(timer);timer=null;clearTimeout(cardTimer);cardTimer=null;cardEpoch++;panel.inert=true;
  const opacity=getComputedStyle(panel).opacity;for(const animation of panel.getAnimations())animation.cancel();
  const animation=panel.animate([{opacity},{opacity:0}],{duration:200,easing:'cubic-bezier(0.3333333333,1,0.6666666667,1)',fill:'forwards'});closing=animation;
  animation.finished.then(()=>{if(closing===animation)close()},()=>{});
 }
 function own(){const c=context(),s=c.state,g=s?.hand,hole=g?.cards?.[s.me];return identity()&&identity()!==revokedScope&&g&&hole?.every(Boolean)&&!document.body.classList.contains('squeeze-active')?currentHandRank(hole,g.board,s.settings?.variant==='shortdeck'):null;}
 function paint(){
  const c=context(),s=c.state,g=s?.hand,hand=own();if(!hand||scope!==identity()||closing&&cardHand&&cardHand!==JSON.stringify([scope,s.number])){close();return}if(!opened)return;
  const hud=getHud(),stats=hud?.stats,key=JSON.stringify([tab,s.number,hand,hud,s.sessionStats,tab==='Stats'?sessionDuration(s.sessionStartedAt):null,tab==='Stats'?Math.ceil((gameClockRemaining(g,s.me)??0)/1000):null,g.clock]);if(key===paintKey)return;paintKey=key;
  const handKey=JSON.stringify([scope,s.number]);if(cardHand&&cardHand!==handKey)resetCards();
  const next=panel.cloneNode(false);next.hidden=false;const tabs=element('div','bestFiveTabs');tabs.setAttribute('role','tablist');
  for(const name of ['Hand Rank','HUD','Stats']){const b=element('button','',name==='HUD'?'Smart HUD':name);b.dataset.handTab=name;b.dataset.nativeLabel={'Hand Rank':'HandRank',HUD:'MobileHudSmartHud',Stats:'Stats'}[name];b.id='bestFiveTab'+['Hand Rank','HUD','Stats'].indexOf(name);b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',String(tab===name));b.tabIndex=tab===name?0:-1;b.onclick=()=>{tab=name;paintKey='';paint();panel.querySelector('[aria-selected=true]').focus()};b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const names=['Hand Rank','HUD','Stats'];tab=names[e.key==='Home'?0:e.key==='End'?2:(names.indexOf(tab)+(e.key==='ArrowRight'?1:2))%3];paintKey='';paint();panel.querySelector('[aria-selected=true]').focus()}};tabs.append(b)}next.append(tabs);
  const body=element('div','bestFiveBody');body.setAttribute('role','tabpanel');body.setAttribute('aria-labelledby','bestFiveTab'+['Hand Rank','HUD','Stats'].indexOf(tab));
  if(tab==='Hand Rank'){
   const label=element('output','bestFiveLabel',hand.label),list=cardLayer?(cardLayer.isConnected?cardLayer.cloneNode(true):cardLayer):element('div','bestFiveCards');const draw=element('output','bestFiveDraw',drawLabels[hand.drawKey]||'');label.dataset.nativeLabel=hand.labelKey;label.dataset.nativeValues=JSON.stringify(hand.labelValues);if(hand.drawKey)draw.dataset.nativeLabel=hand.drawKey;draw.dataset.draw=hand.drawKey;body.append(label,draw,list);
  }else if(tab==='HUD'){
   const graphs=element('div','bestFiveHud');for(const [name,value]of Object.entries({...((s.settings?.variant==='aof'?{AllIn:null,ATS:null,Fold:null,FTA:null}:hud?.values)||{VPIP:null,PFR:null,ATS:null,'3-bet':null}),Hands:stats?.hands??null})){const cell=element('div'),label=element('span','',name),valueNode=element('output','',value===null?'-':name==='Hands'?String(value):value+'%');const keys={VPIP:['MobilePlayerVPIP','HudToolTipVPIP','Voluntarily Put Money In the Pot'],PFR:['HudLabelPfr','HudToolTipPFR','Pre Flop Raise'],ATS:['HudLabelAts','HudToolTipATS','Attempt to Steal'],'3-bet':['HudLabel3Bet','HudToolTip3Bet','Raise 3-Bet'],Hands:['HudLabelHands','Hands','Hands'],AllIn:['HudLabelAllIn','MyTurnBetAllInOrFoldAllInText','All-in'],Fold:['HudLabelFold','LabelFold','Fold'],FTA:['HudLabelFta','HudToolTipFoldATS','Fold to ATS']}[name];label.dataset.nativeLabel=keys[0];label.dataset.nativeTitle=keys[1];label.title=keys[2];cell.dataset.stat=name;cell.style.setProperty('--best-hud-color',name==='Hands'?'#999':hudColor(value,name));cell.style.setProperty('--best-hud-ratio',(name==='Hands'||value===null?0:Math.trunc(value/100*360))+'deg');cell.append(label,valueNode);graphs.append(cell)}body.append(graphs);
  }else{
   const list=element('dl','bestFiveStats');const session=s.sessionStats,bank=gameClockRemaining(g,s.me),time=Number.isFinite(bank)?Math.ceil(bank/1000):null,known=Number.isSafeInteger(session?.showdowns)&&session.showdowns>0&&Number.isSafeInteger(session?.showdownWins),rate=known?Math.trunc(session.showdownWins/session.showdowns*100):null;
   // shortcut: sit-out/card-bank counters are not stored locally; keep them unknown until those lifecycle contracts exist.
   for(const [name,value]of [['Session time',sessionDuration(s.sessionStartedAt)],['Hands',session?.hands??'-'],['Pots won at showdown',known?session.showdownWins+' of '+session.showdowns+' ('+rate+'%)':'-'],['Pots won without showdown',session?.nonShowdownWins??'-'],['Time bank',time===null?'-':Math.floor(time/60)+':'+String(time%60).padStart(2,'0')],['Sit-out time','-']]){if(s.settings?.variant==='aof'&&['Pots won without showdown','Time bank'].includes(name))continue;const heading=element('dt','',name);heading.dataset.nativeLabel={'Session time':'MobileRushSessionTime',Hands:'Hands','Pots won at showdown':'PotsWonAtShowdown','Pots won without showdown':'PotsWonWithoutShowdown','Time bank':'MobileTimeBank','Sit-out time':'SitOutTime'}[name];list.append(heading,element('dd','',String(value)))}body.append(list);
  }
  body.title=tab==='Stats'?'Current local seat session; unknown legacy/Rush session counters stay unavailable':'Recorded local table or Rush pool sample; native all-time statistics are not imported';next.append(body);
  const profile=element('button','bestFiveProfile','My Profile'),dismiss=element('button','bestFiveClose','Close');profile.dataset.nativeLabel='MobileMyProfileBTN';dismiss.dataset.nativeLabel='ButtonClose';profile.type=dismiss.type='button';profile.onclick=()=>{close();onProfile()};dismiss.onclick=()=>{hide();felt.querySelector('[data-best-five-open]')?.focus()};next.append(profile,dismiss);updateElement(panel,next);if(tab==='Hand Rank'||cardLayer)paintCards(tab==='Hand Rank'?panel.querySelector('.bestFiveCards'):cardLayer,hand.cards,handKey);
 }
 function open(){if(!own()||closing)return;opened=true;scope=identity();tab='Hand Rank';paintKey='';paint();clearInterval(timer);timer=setInterval(paint,1000);panel.querySelector('[role=tab][aria-selected=true]')?.focus();}
 reduced.addEventListener('change',()=>{if(closing){close();return}if(opened){resetCards();paintKey='';paint()}});
 document.addEventListener('click',e=>{e.bestFiveBlocked=e.target.closest?.('.chipShuffleArt')?.dataset.active==='true'},true);
 document.addEventListener('click',e=>{if(!e.bestFiveBlocked&&e.target.closest?.('[data-best-five-open]')){opened?hide():open()}});
 document.addEventListener('pointerdown',e=>{if(opened&&!panel.contains(e.target)&&!e.target.closest?.('[data-best-five-open]'))hide()});
 document.addEventListener('keydown',e=>{if(opened&&e.key==='Escape'){e.preventDefault();hide();felt.querySelector('[data-best-five-open]')?.focus()}else if(e.target.closest?.('[data-best-five-open]')&&e.target.dataset.active!=='true'&&['Enter',' '].includes(e.key)){e.preventDefault();opened?hide():open()}});
 return {setAuthorized(allowed){revokedScope=allowed?'':identity();if(!allowed)close()},refresh(){if(!own()||scope&&scope!==identity())close();for(const portrait of felt.querySelectorAll('.seat[data-own=true] .portrait,.chipShuffleArt:not(.remoteShuffle)')){const enabled=!!own()&&portrait.dataset.active!=='true';if(enabled){portrait.dataset.bestFiveOpen='';portrait.setAttribute('role','button');portrait.tabIndex=0;portrait.setAttribute('aria-label','Open current hand rank')}else{delete portrait.dataset.bestFiveOpen;portrait.removeAttribute('tabindex');if(portrait.classList.contains('chipShuffleArt')){portrait.setAttribute('role','img');portrait.setAttribute('aria-label','Your chip shuffle')}else{portrait.removeAttribute('role');portrait.setAttribute('aria-label','Avatar for '+context().state?.names?.[context().state.me])}}}paint()}};
}
