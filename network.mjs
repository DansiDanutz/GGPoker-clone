import {hotkeyActions,readHotkeys,keyCodes,keyCaption,readHotkeyGroups,hotkeyGroup} from './hotkey-bindings.mjs';
import {installPlayerNotes} from './player-note-ui.mjs';
import {bestFiveFocus} from './engine/hand.mjs';
import {playChipLayout,aofBetParts,readChipShuffle,createChipShuffle,paintShuffle,remoteShuffleFrame} from './chip-shuffle.mjs';
import {createSqueezePanel} from './card-squeeze.mjs';
import {bbValue,chipsFromBetInput,betIncrement,snapBetAmount,wheelBetAmount,readBettingPreferences,betShortcuts,reservedChoices,resolveReservedAction} from './betting-preferences.mjs';
import {createClockAudio,tableCues,installAudio,showdownPlan,streetPlan,voluntaryReveals} from './table-audio.mjs';
import {isNativeEmoticon,gameClockText,holeCardLayout,voluntaryCardPose,voluntaryCardFrames,remoteVoluntaryFrames,element,cards,updateElement,avatarSource,tableThemes,tableTheme,feltColours,feltColour,tablePreference,applyTableTheme,cardBacks,cardBack,applyCardBack,cardFronts,cardFront,applyCardFront} from './felt.mjs';
const $=id=>document.getElementById(id);
const chatWindow=document.documentElement.dataset.panel==='chat';
const playCues=chatWindow?()=>{}:installAudio(document.querySelector('#sound'));
const clockAudio=createClockAudio(playCues);
const rushPoolKind=new URLSearchParams(location.search).get('pool')==='plo'?'plo':'holdem';
const rushMode=new URLSearchParams(location.search).get('view')==='rush';
const aofPositions=[{x:850,y:952,scale:1.1,bet:[856,768],dealer:[742,838]},{x:135,y:502,scale:1,bet:[316,568],dealer:[282,664]},{x:850,y:154,scale:1,bet:[856,350],dealer:[776,338]},{x:1565,y:502,scale:1,bet:[1384,568],dealer:[1418,664]}];
const threePositions=[{x:850,y:952,scale:1.1,bet:[856,768],dealer:[742,838]},{x:288,y:290,scale:1,bet:[428,440],dealer:[322,492]},{x:1412,y:290,scale:1,bet:[1272,440],dealer:[1378,492],right:true}];
const sixPositions=[{x:850,y:952,scale:1.1,bet:[856,768],dealer:[742,838]},{x:186,y:768,scale:1,bet:[392,708],dealer:[380,804]},{x:239,y:274,scale:1,bet:[448,408],dealer:[382,406]},{x:850,y:154,scale:1,bet:[856,350],dealer:[776,338]},{x:1461,y:274,scale:1,bet:[1252,408],dealer:[1318,406],right:true},{x:1514,y:768,scale:1,bet:[1308,708],dealer:[1320,804],right:true}];
const nativePotPositions=[[850,663],[692,706],[1008,706],[850,760],[544,776],[1156,776],[700,825],[1000,825],[544,872],[1156,872]];
function nativeChipPosition(node,p,origin=nativePotPositions[0]){const [x,y]=origin,distance=Math.hypot(p.x-x,p.y-y),ratio=1-140*p.scale/distance;for(const [key,value]of Object.entries({'pot-x':x,'pot-y':y,'bet-x':p.bet[0],'bet-y':p.bet[1],'winner-x':p.x,'winner-y':p.y,'stop-x':x+(p.x-x)*ratio,'stop-y':y+(p.y-y)*ratio}))node.style.setProperty('--'+key,value/17+'cqw')}


function chipPile(parts,pot,align){
 const pile=element('div','nativeChipPile');pile.setAttribute('aria-hidden','true');pile.dataset.amount=String(parts.reduce((n,v)=>n+BigInt(v),0n));
 for(const chip of playChipLayout(parts,pot,align)){const img=new Image();img.src='/home-art/native-reserved-play-chip-'+chip.raw+'.png';img.alt='';img.dataset.raw=chip.raw;img.style.left=chip.x/17+'cqw';img.style.top=chip.y/17+'cqw';pile.append(img)}return pile;
}
$('openChat').hidden=rushMode;
const tournamentLink=new URLSearchParams(location.search).get('mode')==='tournament';
if(new URLSearchParams(location.search).get('from')==='home'){
 const query=new URLSearchParams(location.search),back=document.createElement('a');
 const aof=query.get('view')==='aof',short=query.get('view')==='shortdeck',omaha=query.get('view')==='plo',player=query.has('player');
 back.href='/playgg.html'+(omaha?(player?'?player&view=plo':'?view=plo'):player?'?player&view=holdem':'');
 if(aof)back.href='/playgg.html?'+(player?'player&':'')+'view=aof';
 if(short)back.href='/playgg.html?'+(player?'player&':'')+'view=shortdeck';
 if(tournamentLink)back.href='/playgg.html?'+(player?'player&':'')+'view=tournaments';
 if(rushMode)back.href='/playgg.html?player&view=rush';
 back.textContent=rushMode?'Back to Rush & Cash lobby':aof?'Back to All-In or Fold lobby':short?'Back to Short Deck lobby':tournamentLink?'Back to tournaments':omaha?'Back to PLO lobby':'Back to Home';document.querySelector('header a').replaceWith(back)
}
let playerAccount=null;
if((new URLSearchParams(location.search).has('player')||rushMode)){
 const r=await fetch('/local/me');if(!r.ok){location.replace('/launch.html');throw Error('Local sign-in required')}
 playerAccount=(await r.json()).name;$('name').value=playerAccount;$('name').readOnly=true;
}
let room=location.hash.slice(1);
if(!/^[a-f0-9]{48}$/.test(room)){
 room=Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');
 history.replaceState(null,'','#'+room);
}
$('invite').value=location.href;
if(chatWindow)$('chatPanel').prepend($('error'));
$('openChat').onclick=()=>{if(rushMode)return;const url=new URL(location.href);url.searchParams.delete('autojoin');url.searchParams.set('panel','chat');const chat=window.open(url,'playgg-chat-'+room,'popup,width=300,height=736,resizable=yes');if(chat)chat.focus();else $('error').textContent='Allow the local chat window and try again.'};
let gameSettingsWindow;
$('tableGameSettings').onclick=()=>{if(!gameSettingsWindow||gameSettingsWindow.closed)gameSettingsWindow=window.open('/playgg.html?panel=settings','playgg-game-settings','popup,width=1200,height=957,resizable=yes');const settings=gameSettingsWindow;if(settings){tableSettings.open=false;settings.focus()}else $('error').textContent='Allow the local Game Settings window and try again.'};
const tableSettings=$('tableSettings');document.addEventListener('click',e=>{if(tableSettings.open&&!tableSettings.contains(e.target))tableSettings.open=false});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&tableSettings.open){tableSettings.open=false;tableSettings.querySelector('summary').focus()}});
const addChipsButton=element('button','','Add Chips'),pendingAddChips=element('output');addChipsButton.id='addChips';addChipsButton.type='button';pendingAddChips.id='pendingAddChips';pendingAddChips.setAttribute('role','status');addChipsButton.hidden=pendingAddChips.hidden=true;tableSettings.append(addChipsButton,pendingAddChips);addChipsButton.onclick=()=>{tableSettings.open=false;openAddChips()};
const nativeAddChipsButton=element('button','','Add Chips');nativeAddChipsButton.id='tableAddChips';nativeAddChipsButton.type='button';nativeAddChipsButton.className='nativeAddChipsButton';nativeAddChipsButton.hidden=true;nativeAddChipsButton.setAttribute('aria-label','Add Chips');nativeAddChipsButton.title='Add Chips';nativeAddChipsButton.onclick=()=>openAddChips();(document.querySelector('.felt')||tableSettings).append(nativeAddChipsButton);
function updateAddChipsControl(){const seated=!chatWindow&&!rushMode&&!!advertised&&advertised.mode!=='tournament'&&!state?.tournament&&state?.me!=null;addChipsButton.hidden=!seated;addChipsButton.disabled=!seated||!!state.pendingAdd||!!state.ready[state.me];pendingAddChips.hidden=!seated||!state.pendingAdd;pendingAddChips.textContent=seated&&state.pendingAdd?state.pendingAdd.amount+' play chips pending for the next hand.':'';const settings=state?.settings||advertised,shown=!chatWindow&&!rushMode&&!!advertised&&!state?.tournament&&advertised.mode!=='tournament'&&advertised.mode!=='aof'&&settings?.variant!=='aof';nativeAddChipsButton.hidden=!shown;nativeAddChipsButton.disabled=!shown||addChipsButton.disabled;nativeAddChipsButton.dataset.autoTopUp=String(!!(shown&&settings&&savedAddChips(settings)>0))}

$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('copy').textContent='Copied'}catch{$('invite').select()}};
const key='river-seat:'+room;
let token=sessionStorage.getItem(key),state,busy=false,lastCashOut=null,emoticonPicker=null;
let reservedAction;
const helmetModule=await fetch('/helmet-ui.mjs',{signal:AbortSignal.timeout(5000)}).then(r=>r.ok?import('./helmet-ui.mjs'):null,()=>null);
const helmet=helmetModule?helmetModule.installHelmet(()=>({state,room:rushMode?'rush:'+rushPoolKind:room,token,account:state?.observerName||playerAccount,observer:!rushMode&&state?.canObserveChat===true,primary:!chatWindow,enabled:rushMode?!!state?.registered:state?.me!=null&&!!token,unsupported:rushMode&&typeof state?.helmet!=='boolean'}),async muted=>{if(rushMode&&typeof state?.helmet!=='boolean')throw Error('Rush Helmet requires the updated server');const identity=()=>JSON.stringify(rushMode?[rushPoolKind,playerAccount]:[room,token,state?.me,playerAccount]),expected=identity();const until=Date.now()+5000;while(busy){if(Date.now()>=until)throw Error('Table is busy; retry Helmet');await new Promise(resolve=>setTimeout(resolve,25))}if(expected!==identity())throw Error('Player or table changed');if(!await operate('helmet',{muted}))throw Error($('error').textContent||'Helmet update failed')},()=>renderChat()):{refresh(){},muted(){return false},reactionAllowed(){return true}};
const playerNotes=installPlayerNotes($('tableSettings'),()=>({state,room:rushMode?'rush:'+rushPoolKind+':'+state?.noteTable:room,token,enabled:!chatWindow&&(!rushMode||!!state?.noteTable),...(rushMode?{notesPath:'/api/rush/'+rushPoolKind+'/notes',notesTable:state?.noteTable}:{} )}));
const rushSitOut=document.createElement('input'),rushSitOutLabel=element('label');rushSitOut.type='checkbox';rushSitOut.id='rushSitOut';rushSitOutLabel.append(rushSitOut,' Sit out next hand');rushSitOutLabel.hidden=!rushMode;tableSettings.append(rushSitOutLabel);rushSitOut.onchange=async()=>{rushSitOut.disabled=true;await operate('sit-out',{paused:rushSitOut.checked});rushSitOut.checked=!!state?.paused;rushSitOut.disabled=!state?.registered};
const reservedPanel=element('div');reservedPanel.id='reservedActions';reservedPanel.setAttribute('role','group');reservedPanel.setAttribute('aria-label','Actions on your next turn');$('actions').before(reservedPanel);
function fitSeatNames(){for(const label of document.querySelectorAll('.seatName')){label.style.removeProperty('font-size');const size=parseFloat(getComputedStyle(label).fontSize);if(label.clientWidth&&label.scrollWidth>label.clientWidth)label.style.fontSize=size*label.clientWidth/label.scrollWidth+'px'}}
addEventListener('resize',fitSeatNames);
function positionReserved(){if(reservedPanel.hidden)return;for(const button of reservedPanel.children){const label=button.firstElementChild;label.style.removeProperty('font-size');if(!button.hidden&&reservedPanel.dataset.variant!=='aof'){label.style.fontSize='28px';if(label.scrollWidth>156)label.style.fontSize=28*156/label.scrollWidth+'px'}}const r=document.querySelector('.felt').getBoundingClientRect(),scale=r.width/1700;reservedPanel.style.left=r.left+(state?.hand?.preAction?.aof?1084:state?.hand?.preAction?.rush&&state.hand.preAction.due>0?1256:1035)*scale+'px';reservedPanel.style.top=r.top+(state?.hand?.preAction?.aof?1032:1058)*scale+'px';reservedPanel.style.setProperty('--reserve-scale',String(scale))}
function positionQuickFold(){
 const b=$('actions').querySelector('.nativeQuickFold'),main=$('actions').querySelectorAll('.nativeMainAction'),aof=$('actions').querySelectorAll('.nativeAofAction'),sizes=$('actions').querySelector('.nativeRushBetStrip');if(!b&&!sizes&&!main.length&&!aof.length)return;const r=document.querySelector('.felt').getBoundingClientRect(),scale=r.width/1700;
 if(b){b.style.left=r.left+1022*scale+'px';b.style.top=r.top+1050*scale+'px';b.style.setProperty('--quick-fold-scale',String(scale))}
 for(const button of main){for(const label of button.querySelectorAll('span')){label.style.fontSize='34px';if(label.scrollWidth>162)label.style.fontSize=34*162/label.scrollWidth+'px'}button.style.left=r.left+(1022+217*Number(button.dataset.slot))*scale+'px';button.style.top=r.top+1050*scale+'px';button.style.setProperty('--quick-fold-scale',String(scale))}
 for(const button of aof){button.style.left=r.left+(1084+304*Number(button.dataset.slot))*scale+'px';button.style.top=r.top+1032*scale+'px';button.style.setProperty('--aof-scale',String(scale))}
 if(sizes){sizes.style.left=r.left+1022*scale+'px';sizes.style.top=r.top+976*scale+'px';sizes.style.setProperty('--bet-scale',String(scale))}
}
// Refit after the embedded native font replaces the first-paint fallback.
document.fonts.load('700 34px NativeShowRoboto').then(positionQuickFold).catch(()=>{});
document.fonts.load('400 28px NativeActionRoboto').then(()=>{positionReserved();fitSeatNames()}).catch(()=>{});
addEventListener('resize',positionQuickFold);addEventListener('scroll',positionQuickFold,{passive:true});
addEventListener('resize',positionReserved);addEventListener('scroll',positionReserved,{passive:true});
for(const [kind,label]of [['fold','Fold'],['check-fold','Check/Fold'],['check','Check'],['call','Call'],['allin','All-In']]){const b=element('button');b.append(element('span','reserveText',label));b.type='button';b.dataset.reserve=kind;b.onclick=()=>{if(!state?.hand?.preAction||state.hand.turn===state.me)return;reservedAction=reservedAction?.kind===kind?null:{kind,call:state.hand.preAction.call,number:state.number,seat:state.me};if(state.hand.preAction.aof)playCues(['AofButton']);renderReserved()};reservedPanel.append(b)}
function renderReserved(){
 if(closeSqueeze){reservedPanel.hidden=true;return}
 const result=resolveReservedAction(reservedAction,state);reservedAction=result.selection;
 const g=state?.hand,choices=reservedChoices(g?.preAction);reservedPanel.dataset.variant=g?.preAction?.aof?'aof':g?.preAction?.rush?'rush':'normal';reservedPanel.hidden=chatWindow||!g||!!g.end||state.me==null||g.turn===state.me||!choices.length;
 for(const b of reservedPanel.children){b.hidden=!choices.includes(b.dataset.reserve);b.setAttribute('aria-pressed',String(reservedAction?.kind===b.dataset.reserve));const label=b.dataset.reserve==='call'?'Call '+g?.preAction?.call:({fold:'Fold','check-fold':rushMode?'Fold':'Check/Fold',check:'Check',allin:'All-In'})[b.dataset.reserve];if(b.textContent!==label)b.firstElementChild.textContent=label}
 positionReserved();
 if(result.action){const expected=state;queueMicrotask(()=>{if(state===expected)result.action==='quick-fold'?operate('quick-fold'):operate('act',{action:result.action,reserved:true})})}
}
let closeSqueeze,squeezeHand;
const squeezeLabel=element('label'),squeezeEnabled=document.createElement('input');squeezeEnabled.type='checkbox';squeezeEnabled.id='cardSqueezeEnabled';squeezeEnabled.checked=localStorage.getItem('river-card-squeeze')!=='0';squeezeLabel.append(squeezeEnabled,' Card Squeeze');tableSettings.append(squeezeLabel);
function stopSqueeze(){closeSqueeze?.();closeSqueeze=null;document.body.classList.remove('squeeze-active');renderReserved()}
function reconcileSqueeze(previous){
 const g=state?.hand,me=state?.me;
 if(!g||g.end||me==null||g.folded[me]||!squeezeEnabled.checked){stopSqueeze();return}
 const fresh=previous&&(!previous.hand||previous.number!==state.number);
 if(!fresh||squeezeHand===state.number||!g.squeezeActivated||![2,4,5,6].includes(g.cards[me]?.length)||chatWindow||rushMode)return;
 stopSqueeze();squeezeHand=state.number;selfShuffle.stop();document.body.classList.add('squeeze-active');
 closeSqueeze=createSqueezePanel(document.querySelector('.felt'),g.cards[me],error=>{closeSqueeze=null;document.body.classList.remove('squeeze-active');renderReserved();if(error)$('error').textContent='Card Squeeze could not load. Your cards and actions remain available.'},playCues);
}
squeezeEnabled.onchange=()=>{localStorage.setItem('river-card-squeeze',squeezeEnabled.checked?'1':'0');if(!squeezeEnabled.checked)stopSqueeze()};
addEventListener('storage',e=>{if(e.storageArea===localStorage&&(e.key===null||e.key==='river-card-squeeze')){squeezeEnabled.checked=localStorage.getItem('river-card-squeeze')!=='0';if(!squeezeEnabled.checked)stopSqueeze()}});
const selfShuffleArt=element('div','chipShuffleArt');selfShuffleArt.setAttribute('role','img');selfShuffleArt.setAttribute('aria-label','Your chip shuffle');document.querySelector('.felt').append(selfShuffleArt);
const shufflePreferences=()=>readChipShuffle(localStorage.getItem('river-chip-shuffle'));
let shuffleReady=false;const shuffleAtlas=new Image();shuffleAtlas.src='/home-art/native-chip-shuffle.png';shuffleAtlas.decode().then(()=>{shuffleReady=true;renderShuffles()}).catch(()=>{});
const selfShuffle=createChipShuffle(selfShuffleArt,shufflePreferences,active=>{$('shuffleChips').disabled=!shuffleReady||!shufflePreferences().enabled||state?.me==null;$('shuffleChips').setAttribute('aria-pressed',String(active));$('shuffleChips').textContent=active?'Stop shuffling':'Shuffle chips'},playCues);
const shuffleSeen=new Map(),remoteShuffles=new Map();let shuffleInitialized=false;
function positionShuffle(art,seat,other=false){const portrait=document.querySelector('.seat[data-seat="'+seat+'"] .portrait');if(!portrait)return;const p=portrait.getBoundingClientRect(),f=document.querySelector('.felt').getBoundingClientRect(),scale=p.width/192*(other ? 0.6 : 1);Object.assign(art.style,{left:(p.left-f.left+p.width/2-69*scale)+'px',top:(p.top-f.top+p.height/2+15*p.width/192-(other?50:95)*scale)+'px',width:145*scale+'px',height:165*scale+'px'})}
function stopRemote(seat){const entry=remoteShuffles.get(seat);if(entry){entry.stopSound?.();cancelAnimationFrame(entry.raf);entry.art.remove();remoteShuffles.delete(seat)}}
function renderShuffles(){
 const allowed=!chatWindow&&!rushMode&&capacity()===6,p=shufflePreferences();$('chipShuffleEnabled').checked=p.enabled;$('shuffleChips').hidden=!allowed||state?.me==null;$('shuffleChips').disabled=!shuffleReady||!p.enabled||state?.me==null;
 if(!allowed||!p.enabled||state?.me==null)selfShuffle.stop();else positionShuffle(selfShuffleArt,state.me);
 if(!allowed)for(const seat of remoteShuffles.keys())stopRemote(seat);
 if(!state){for(const seat of remoteShuffles.keys())stopRemote(seat);shuffleSeen.clear();shuffleInitialized=false;return}
 for(const [seat,e]of remoteShuffles)if(!state.names[seat]||state.names[seat]!==e.name)stopRemote(seat);
 for(const event of state.shuffles||[]){const fresh=shuffleInitialized&&shuffleSeen.get(event.seat)!==event.at;shuffleSeen.set(event.seat,event.at);if(!fresh||!allowed||event.seat===state.me||!state.names[event.seat])continue;
  stopRemote(event.seat);const art=element('div','chipShuffleArt remoteShuffle');art.dataset.seat=event.seat;art.setAttribute('role','img');art.setAttribute('aria-label','Chip shuffle by '+state.names[event.seat]);art.style.backgroundImage='url(/home-art/native-chip-shuffle.png)';document.querySelector('.felt').append(art);positionShuffle(art,event.seat,true);
  const entry={art,raf:0,name:state.names[event.seat]},start=performance.now();remoteShuffles.set(event.seat,entry);playCues(['ShuffleOther']).then(stop=>{if(remoteShuffles.get(event.seat)===entry)entry.stopSound=stop;else stop?.()});const tick=()=>{const frame=remoteShuffleFrame(performance.now()-start);if(frame===null){stopRemote(event.seat);return}paintShuffle(art,frame);entry.raf=requestAnimationFrame(tick)};tick();
 }
 shuffleInitialized=true;
}
$('chipShuffleEnabled').onchange=()=>{localStorage.setItem('river-chip-shuffle',JSON.stringify({...shufflePreferences(),enabled:$('chipShuffleEnabled').checked}));renderShuffles()};
$('shuffleChips').onclick=async()=>{if(closeSqueeze)return;if(selfShuffleArt.dataset.active==='true'){selfShuffle.stop();return}if(selfShuffle.start()){positionShuffle(selfShuffleArt,state.me);if(!await operate('shuffle'))selfShuffle.stop()}};
addEventListener('resize',()=>{if(state?.me!=null)positionShuffle(selfShuffleArt,state.me);for(const [seat,e]of remoteShuffles)positionShuffle(e.art,seat,true)});
addEventListener('storage',e=>{if(e.storageArea===localStorage&&(e.key===null||e.key==='river-chip-shuffle'))renderShuffles()});
function frame(value){if(!value)return null;const {version,chat,issued,avatars,shuffles,...rest}=value;return JSON.stringify(rest)}
let payoutSoundHand=null,runoutPlan=null;const soundedPots=new Set(),boardSounds=new Set();
document.querySelector('.felt').addEventListener('animationstart',e=>{if(e.animationName==='showRunoutCard'&&e.target.dataset.boardSound==='1'&&runoutPlan&&runoutPlan.number===state?.number&&e.target.isConnected&&!boardSounds.has(e.target.dataset.boardIndex)){boardSounds.add(e.target.dataset.boardIndex);playCues(['Board'])}});
document.querySelector('.felt').addEventListener('animationend',e=>{
 if(runoutPlan?.street&&(e.animationName==='spreadFlop'&&e.target.dataset.boardIndex==='2'||e.animationName==='showRunoutCard'&&Number(e.target.dataset.boardIndex)>=3)){runoutPlan=null;lastFeltFrame=null;render()}
});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{
 if(!state)return;
 if(!event.matches){lastFeltFrame=null;render();return}
 const pending=payoutSoundHand===state.number&&state.hand?.end?(state.hand.end.pots||[{}]).flatMap((_,i)=>soundedPots.has(i)?[]:['WinPot']):[];
 runoutPlan=null;boardSounds.clear();payoutSoundHand=null;soundedPots.clear();lastFeltFrame=null;
 for(const award of [...document.querySelectorAll('.award')]){for(const animation of award.getAnimations())animation.cancel();award.onanimationcancel?.();award.remove()}
 document.querySelectorAll('.nativeTurnGlow').forEach(node=>node.getAnimations().forEach(animation=>animation.cancel()));
 document.querySelectorAll('.sweep,.boardThrow').forEach(node=>node.remove());render();playCues(pending)
});
let pendingHand=null;
function clearPayout(){for(const award of document.querySelectorAll('.award')){award.onanimationend=award.onanimationcancel=null;award.remove()}}
function applyState(data){
 const sameSeats=state&&state.me===data.me&&JSON.stringify(state.names)===JSON.stringify(data.names);
 // Native OnWinners resumes the event processor only after all payout callbacks.
 if(!chatWindow&&!rushMode&&sameSeats&&state.hand?.end&&data.hand&&data.number>state.number&&document.querySelector('.award')){if(!pendingHand||data.version>=pendingHand.version)pendingHand=data;return}
 if(pendingHand&&sameSeats&&data.number===state.number&&data.version<=pendingHand.version)return;
 pendingHand=null;if(state&&!sameSeats)clearPayout();
 pendingVoluntary=voluntaryReveals(state,data);
 const previous=state,chatOnly=state&&frame(state)===frame(data),cues=tableCues(state,data);
 const deferWin=previous&&previous.number===data.number&&previous.hand&&!previous.hand.end&&data.hand?.end&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&data.hand.end.payouts.some((n,i)=>n>data.hand.end.returns[i]);
 const street=matchMedia('(prefers-reduced-motion: reduce)').matches?null:streetPlan(previous,data);
 if(deferWin){payoutSoundHand=data.number;soundedPots.clear();runoutPlan=showdownPlan(previous,data);boardSounds.clear()}else if(street){runoutPlan=street;boardSounds.clear()}else if(previous?.number!==data.number||!data.hand||!data.hand.end&&!runoutPlan?.street){payoutSoundHand=null;soundedPots.clear();runoutPlan=null;boardSounds.clear()}
 state=data;if(chatOnly){renderChat();renderSeatReactions();renderSeatAvatars();renderShuffles();playerNotes.refresh()}else render();reconcileSqueeze(previous);renderReserved();playCues(cues.filter(name=>!(deferWin&&name==='WinPot')&&!((deferWin||street)&&runoutPlan&&name==='Board')))
}

async function request(op,body={}){
 const headers={'Content-Type':'application/json'};if(token)headers.Authorization='Bearer '+token;
 const res=await fetch(rushMode?'/api/rush/'+rushPoolKind+'/'+op:'/api/rooms/'+room+'/'+op,{method:op==='state'?'GET':'POST',headers,body:op==='state'?undefined:JSON.stringify(body),cache:'no-store',...(op==='helmet'||op==='chat'?{signal:AbortSignal.timeout(5000)}:{})});
 let data=await res.json();
 if(!res.ok){if(rushMode&&res.status===409&&op!=='state')await request('state');if(res.status===401||res.status===404){sessionStorage.removeItem(key);token=null;state=null;render()}throw Error(data.error)}
 if(rushMode){
  const table=data.table?data:null,result=data.result,g=table?.hand||result?.hand;
  data={...data,result:undefined,avatars:table?data.avatars:result?.avatars||[],me:table?data.me:result?.me??null,number:data.table||result?.table||0,names:table?data.names:result?.names||Array(6).fill(null),hand:g?{...g,cards:g.hands,options:table?data.legal:null}:null,settings:{name:'Rush & Cash · local '+(data.variant==='plo'?'PLO':'Hold’em')+' pool',variant:data.variant==='plo'?'plo':'rush',stack:200,blind:4},chat:[],results:[]};
 }
 if(data.left){waitingState=null;walletAvailable=null;lastCashOut=data.cashOut??null;sessionStorage.removeItem(key);token=null;state=null;render();return}
 if(data.issued){lastCashOut=null;token=data.issued;sessionStorage.setItem(key,token)}
 if(!rushMode&&data.me!=null){waitingState=null;walletAvailable=null}
 if(state?.me!==data.me||state?.version!==data.version||state?.hand?.clock?.canDisableLimit!==data.hand?.clock?.canDisableLimit||JSON.stringify(state?.avatars)!==JSON.stringify(data.avatars)){applyState(data)}
}
async function operate(op,body){if(op==='ready'&&document.querySelector('.award'))return false;if(chatWindow&&!['state','chat','helmet'].includes(op))return;if(rushMode&&['join','deal','fill-bots','cancel-queue','sit-out'].includes(op)&&!busy){try{await request('state')}catch(error){$('error').textContent=error.message;return false}}if(op==='state'&&busy)return;const version=state?.version,number=state?.number,boundHandVersion=state?.handVersion,actionFrame=op==='act'?JSON.stringify(state?.hand):null;while(busy)await new Promise(resolve=>setTimeout(resolve,25));busy=true;try{await request(op,{...body,version:op==='act'&&number===state?.number&&actionFrame===JSON.stringify(state?.hand)?state.version:version,...(['ready','show-cards'].includes(op)?{number}:{}),...(rushMode?{handVersion:op==='quick-fold'||op==='act'&&!(number===state?.number&&actionFrame===JSON.stringify(state?.hand))?boundHandVersion:state?.handVersion}:{})});$('error').textContent='';return true}catch(e){$('error').textContent=e.message;return false}finally{busy=false}}
function topUpRequest(g,settings){
 if(!settings)return {};const nativeTarget=savedAddChips(settings)*settings.blind;if(nativeTarget){const stack=(g.dealtSeats&&!g.dealtSeats.includes(state.me)?state.buyIns?.[state.me]??settings.stack:g.stacks[state.me])+(state.pendingAdd?.amount||0);return stack<nativeTarget?{topUpTo:nativeTarget}:{}}
 if(localStorage.getItem('river-auto-topup')!=='1'||!settings)return {};
 let threshold=Number(localStorage.getItem('river-topup-threshold')??100),target=Number(localStorage.getItem('river-topup-target')??100);
 if(!Number.isInteger(threshold)||!Number.isInteger(target)||threshold<0||threshold>target||target<20||target>100)threshold=target=100;
 const max=settings.maxBuyIn??settings.stack;
 const stack=(g.dealtSeats&&!g.dealtSeats.includes(state.me)?state.buyIns?.[state.me]??settings.stack:g.stacks[state.me])+(state.pendingAdd?.amount||0);
 return stack*100<max*threshold?{topUpTo:Math.max(settings.minBuyIn??settings.stack,Math.floor(max*target/100))}:{};
}
function hotkeyHint(button){const key=button.dataset.key,role=({F1:'fold',F2:'call',F3:'raise'})[key]||(/^Ctrl\+[1-4]$/.test(key)?'preset'+key.at(-1):null);if(role){const keys=readHotkeys(localStorage.getItem('river-hotkey-bindings'))[role];button.dataset.hotkeyDisplay=readHotkeyGroups(localStorage.getItem('river-hotkey-groups'))[hotkeyGroup(role)]&&keys.length?keyCaption(keys):''}}
function btn(text,fn,key){const b=document.createElement('button');b.textContent=text;b.onclick=fn;if(key){b.dataset.key=key;hotkeyHint(b)}$('actions').append(b);return b}
function list(id,items){const fresh=$(id).cloneNode(false);fresh.append(...items.map(v=>{const li=document.createElement('li');li.textContent=v;return li}));updateElement($(id),fresh)}
let advertised,lastDraw,lastFeltFrame,pendingVoluntary=[];const remoteVoluntary=new Map();
const entryQuery=new URLSearchParams(location.search);let autoJoinRequested=entryQuery.get('autojoin')==='1'&&entryQuery.has('player')&&localStorage.getItem('river-auto-buyin')==='1';if(entryQuery.has('autojoin')){entryQuery.delete('autojoin');history.replaceState(null,'',location.pathname+(entryQuery.size?'?'+entryQuery:'')+location.hash);$('invite').value=location.href}
if(!rushMode)fetch('/api/hosted').then(r=>r.json()).then(rows=>{advertised=rows.find(t=>t.room===room);if(!state)render();else updateAddChipsControl();if(autoJoinRequested){autoJoinRequested=false;if(advertised?.open&&!token&&!tournamentLink&&!rushMode&&$('name').value)$('join').requestSubmit()}}).catch(()=>{});
function capacity(){if(rushMode)return 6;return state?.names.length??advertised?.capacity??4}
const themeLabel=element('label','','Table background '),themeSelect=document.createElement('select');themeSelect.id='tableTheme';themeSelect.add(new Option('Use Game Settings','global'));themeSelect.setAttribute('aria-label','Table background');for(const theme of tableThemes)themeSelect.add(new Option(theme.label,theme.id));themeSelect.value=tableTheme(tablePreference('river-table-theme')).id;themeSelect.onchange=()=>{if(themeSelect.value==='global')localStorage.removeItem('river-table-theme:'+room);else localStorage.setItem('river-table-theme:'+room,themeSelect.value);themeSelect.value=tableTheme(tablePreference('river-table-theme')).id;applyTableTheme()};themeLabel.append(themeSelect);$('chipSwitch').closest('details').append(themeLabel);addEventListener('storage',e=>{if(e.storageArea===localStorage&&(e.key===null||e.key==='river-table-theme'||e.key==='river-table-theme:'+room))themeSelect.value=tableTheme(tablePreference('river-table-theme')).id});
const feltLabel=element('label','','Felt colour '),feltSelect=document.createElement('select');feltSelect.id='feltColour';feltSelect.add(new Option('Use Game Settings','global'));feltSelect.setAttribute('aria-label','Felt colour');for(const colour of feltColours)feltSelect.add(new Option(colour.label,colour.id));feltSelect.value=feltColour(tablePreference('river-felt-colour')).id;feltSelect.onchange=()=>{if(feltSelect.value==='global')localStorage.removeItem('river-felt-colour:'+room);else localStorage.setItem('river-felt-colour:'+room,feltSelect.value);feltSelect.value=feltColour(tablePreference('river-felt-colour')).id;applyTableTheme()};feltLabel.append(feltSelect);$('chipSwitch').closest('details').append(feltLabel);addEventListener('storage',e=>{if(e.storageArea===localStorage&&(e.key===null||e.key==='river-felt-colour'||e.key==='river-felt-colour:'+room))feltSelect.value=feltColour(tablePreference('river-felt-colour')).id});
const backLabel=element('label','','Card back '),backSelect=document.createElement('select');backSelect.id='cardBack';backSelect.setAttribute('aria-label','Card back');for(const back of cardBacks)backSelect.add(new Option(back.label,back.id));backSelect.value=cardBack(localStorage.getItem('river-card-back')).id;backSelect.onchange=()=>{localStorage.setItem('river-card-back',backSelect.value);applyCardBack()};backLabel.append(backSelect);$('chipSwitch').closest('details').append(backLabel);addEventListener('storage',e=>{if(e.storageArea===localStorage&&(e.key===null||e.key==='river-card-back'))backSelect.value=cardBack(localStorage.getItem('river-card-back')).id});
const frontLabel=element('label','','Card front '),frontSelect=document.createElement('select');frontSelect.id='cardFront';frontSelect.setAttribute('aria-label','Card front');for(const front of cardFronts)frontSelect.add(new Option(front.label,front.id));frontSelect.value=cardFront(localStorage.getItem('river-card-front')).id;frontSelect.onchange=()=>{localStorage.setItem('river-card-front',frontSelect.value);applyCardFront()};frontLabel.append(frontSelect);$('chipSwitch').closest('details').append(frontLabel);addEventListener('storage',e=>{if(e.storageArea===localStorage&&(e.key===null||e.key==='river-card-front'))frontSelect.value=cardFront(localStorage.getItem('river-card-front')).id});
const chipSwitch=$('chipSwitch'),openBB=$('openBB');
chipSwitch.checked=localStorage.getItem('river-chip-switch')==='1';openBB.checked=localStorage.getItem('river-open-bb')!=='0';openBB.disabled=!chipSwitch.checked;
let showBB=chipSwitch.checked&&openBB.checked,refreshBetEditor=null;
function amount(node,n,unit=''){
 if(node.dataset.chips!==String(n))node.dataset.chips=n;if(node.dataset.unit!==unit)node.dataset.unit=unit;
 let status=null;
 if(node.dataset.stackSeat!==undefined){const finished=state?.tournament?.finishes?.[Number(node.dataset.stackSeat)]!=null;status=finished?'Finished':n===0?'All-In':null}
 node.classList.toggle('nativeAllIn',status==='All-In');node.classList.toggle('nativeFinished',status==='Finished');
 const text=status||(showBB&&state?.hand?.blind?bbValue(n,state.hand.blind).toLocaleString('en-US')+' BB':n+unit);if(node.textContent!==text)node.textContent=text;
 return node;
}
function repaintUnits(){document.querySelectorAll('[data-chips]').forEach(e=>amount(e,Number(e.dataset.chips),e.dataset.unit));document.querySelectorAll('button[data-stack-switch]').forEach(b=>b.disabled=!chipSwitch.checked);refreshBetEditor?.();for(const b of document.querySelectorAll('.nativeMainAction.hasAmount'))b.setAttribute('aria-label',b.querySelector('.actionLabel').textContent+' '+b.querySelector('.actionAmount').textContent);positionQuickFold()}
chipSwitch.onchange=()=>{localStorage.setItem('river-chip-switch',Number(chipSwitch.checked));openBB.disabled=!chipSwitch.checked;showBB=chipSwitch.checked&&openBB.checked;repaintUnits()};
openBB.onchange=()=>{localStorage.setItem('river-open-bb',Number(openBB.checked));showBB=openBB.checked;repaintUnits()};
function drawTable(g){
 const nextFrame=JSON.stringify([capacity(),state?.number,state?.me,state?.names,state?.settings||advertised,state?.waitingStacks,state?.buyIns,state?.reservedSeats,waitingState?.offer?.seat,g]);
 if(nextFrame===lastFeltFrame){renderSeatReactions();renderSeatAvatars();return}lastFeltFrame=nextFrame;
 const count=capacity();let gathered=false;
 const prev=lastDraw,changed=!!(g&&prev?.hand===state.number&&g!==prev.g),collected=changed&&!prev.g.end&&(g.board.length>prev.g.board.length||!!g.end);
 lastDraw=g?{hand:state.number,g}:null;
 const settling=!!(changed&&!prev.g.end&&g.end&&!matchMedia('(prefers-reduced-motion: reduce)').matches);
 const focusBySeat=new Map(),boardFocus=new Set(),primaryPayouts=g?.end?.pots?.[0]?.payouts;
 if(primaryPayouts&&g.board.length===5)for(const [i,payout]of primaryPayouts.entries())if(payout&&g.cards[i]?.every(Boolean)&&!g.folded[i]){
  const focus=bestFiveFocus(g.cards[i],g.board,state.settings?.variant==='shortdeck');focusBySeat.set(i,focus);for(const index of focus.board)boardFocus.add(index);
 }
 const feltFrame=document.querySelector('.felt');
 feltFrame.classList.toggle('nativeFocusPending',settling&&focusBySeat.size>0);
 if(!runoutPlan)feltFrame.querySelectorAll('.boardThrow').forEach(node=>node.remove());
 if(runoutPlan&&collected&&g.board.length>prev.g.board.length)for(const step of runoutPlan.board.filter(step=>step.cue)){
  const card=cards([g.board[step.index===0?2:step.index]])[0];card.classList.add('boardThrow');card.setAttribute('aria-hidden','true');card.dataset.boardIndex=step.index;
  card.style.setProperty('--throw-x',(492+144*step.index)/17+'cqw');card.style.setProperty('--throw-delay',(step.at-200)/1000+'s');
  card.onanimationend=card.onanimationcancel=()=>card.remove();feltFrame.append(card);
 }
 feltFrame.style.setProperty('--showdown-offset',runoutPlan?runoutPlan.complete/1000+'s':'0s');
 const faces=cards(g?.board||[]);if(focusBySeat.size)for(const [i,card]of faces.entries()){card.dataset.bestFive=boardFocus.has(i)?'1':'0';card.classList.toggle('nativeFocusDim',!boardFocus.has(i))}if((runoutPlan?.board[0]?.index===0||changed&&!prev.g.board.length)&&faces.length>=3&&!matchMedia('(prefers-reduced-motion: reduce)').matches)faces.slice(0,3).forEach((c,i)=>{c.classList.add('nativeFlop');c.style.setProperty('--flop-index',i)});if(runoutPlan)for(const step of runoutPlan.board){const card=faces[step.index];card.classList.add('runoutCard');card.style.setProperty('--board-delay',step.at/1000+'s');card.dataset.boardSound=step.cue?'1':'0';card.dataset.boardIndex=step.index}const board=$('board'),nextBoard=board.cloneNode(false);nextBoard.append(...faces);updateElement(board,nextBoard);const pot=$('pot').cloneNode(false);
 if(g)pot.replaceChildren('Total pot · ',amount(element('span',''),g.committed.reduce((sum,n,i)=>sum+n-(g.end?.returns[i]||0),0)));else pot.textContent=count+' seats · play money';updateElement($('pot'),pot);
 const bank=settling?g.committed.reduce((sum,n,i)=>sum+n-g.end.returns[i],0):g&&!g.end?g.committed.reduce((sum,n,i)=>sum+n-g.bets[i],0):0;
 $('collected').classList.toggle('settlingPot',settling);$('collected').hidden=!bank;amount($('collected').lastElementChild,bank);$('collected').setAttribute('aria-label','Collected pot: '+bank);
 const felt=document.querySelector('.felt');const variant=state?.settings?.variant||'holdem';if(felt.dataset.variant!==variant){felt.dataset.variant=variant;applyTableTheme()}felt.dataset.seats=count;const positions=variant==='aof'?aofPositions:count===3?threePositions:count===6?sixPositions:null;if(variant==='aof'||count===3)updateElement($('collected').firstElementChild,chipPile([bank],true,'center'));else if($('collected').firstElementChild.classList.contains('nativeChipPile')){const image=new Image();image.src='/home-art/bet-stack.png';image.alt='';$('collected').firstElementChild.replaceWith(image)}const wagers=new Map([...felt.querySelectorAll('.wager')].map(e=>[Number(e.dataset.seat),e]));
 const oldPots=new Map([...felt.querySelectorAll(':scope>.nativePot')].map(p=>[Number(p.dataset.pot),p]));
 const shownPots=settling?g.end.pots:g&&!g.end?g.pots:null;
 if(shownPots?.length>1){
  $('collected').hidden=true;
  for(const [index,pot]of shownPots.entries()){
   const pile=element('div','nativePot'+(settling?' settlingPot':'')),[x,y]=nativePotPositions[index];pile.dataset.pot=index;pile.setAttribute('aria-label',(index?'Side pot '+index:'Main pot')+': '+pot.amount);pile.style.left=x/17+'cqw';pile.style.top=y/17+'cqw';pile.append(chipPile([pot.amount],true,'center'),amount(element('span',''),pot.amount));
   pile.onanimationend=e=>{if(e.animationName==='releasePot')pile.remove()};
   if(oldPots.has(index)){updateElement(oldPots.get(index),pile);oldPots.delete(index)}else felt.append(pile)
  }
 }
 for(const pile of oldPots.values())pile.remove();
 for(let i=0;i<count;i++){
  const pos=(i-(state?.me??(variant==='aof'?2:0))+count)%count,n=state?.names[i],seat=element('div','seat s'+pos+(g?.turn===i?' acting':'')+(g?.folded[i]&&(!g.dealtSeats||g.dealtSeats.includes(i))?' folded':'')+(g?.end&&g.end.payouts[i]>g.end.returns[i]?' winner':''));
  if(positions){const {x,y,scale:k}=positions[pos];seat.style.setProperty('--seat-x',String(x));seat.style.setProperty('--seat-y',String(y));seat.style.setProperty('--seat-scale',String(k))}
  seat.dataset.seat=i;const existing=felt.querySelector('.seat[data-seat="'+i+'"]');
  seat.dataset.own=String(state?.me===i);
  const pendingAward=!settling&&prev?.hand===state?.number&&g?.end&&existing&&felt.querySelector('.award[data-seat="'+i+'"]');
  const plate=element('div','plate'),label=n||'Open seat';
  const name=element('span','seatName',n&&n.length>15?n.slice(0,14)+'..':label);name.title=label;name.setAttribute('aria-label',label+(n&&state.me===i?' (you)':''));plate.append(name);
  const stack=element('span','stack');plate.append(stack);
  const value=element('button','stackSwitch');if(g){value.type='button';value.dataset.stackSwitch='';if(n)value.dataset.stackSeat=String(i);value.disabled=!chipSwitch.checked;value.title='Switch chip display';value.onclick=()=>{showBB=!showBB;repaintUnits()};stack.append(amount(value,g.dealtSeats&&!g.dealtSeats.includes(i)&&n?(state.buyIns?.[i]??state.settings.stack):pendingAward?Number(existing.querySelector('.stackSwitch').dataset.chips):g.stacks[i],' chips'))}else if(n&&Number.isSafeInteger(state.waitingStacks?.[i]??state.buyIns?.[i]))amount(stack,state.waitingStacks?.[i]??state.buyIns?.[i],' chips');else stack.textContent=n?'Seated':'Available';
  if(g?.turn===i&&g.deadline){
   const bar=element('span','turnClock'),remaining=Math.max(0,g.deadline-Date.now());bar.setAttribute('aria-hidden','true');bar.dataset.renderKey=String(g.deadline);plate.append(bar);
   bar.animate([{transform:'scaleX('+Math.min(1,remaining/((state.settings?.actionSeconds??90)*1000))+')'},{transform:'scaleX(0)'}],{duration:remaining,fill:'forwards'});
  }
  const chooseSeat=!n&&state?.me==null;
  const portrait=element(chooseSeat?'button':'div','portrait',n&&[3,6].includes(count)?'':n?n.slice(0,1).toUpperCase():'＋');
  if(chooseSeat){portrait.disabled=!!(state?.reservedSeats?.includes(i)||waitingState?.offer?.seat===i);portrait.type='button';portrait.setAttribute('aria-label',(portrait.disabled?'Reserved seat ':'Take seat ')+(i+1));portrait.onclick=()=>{$('seatChoice').value=String(i);$('join').requestSubmit()};if(positions){portrait.classList.add('nativeTakeSeat');portrait.dataset.status=portrait.disabled?'RESERVE_SEAT':'TAKE_SEAT';portrait.replaceChildren(element('span','takeSeatLabel',portrait.disabled?'R':'Take Seat'));plate.hidden=true}}
  if(n&&[3,6].includes(count)){portrait.classList.add('nativeAvatar');portrait.style.backgroundPosition=(i*20)+'% center';portrait.setAttribute('aria-label','Avatar for '+n)}renderPortrait(portrait,i);seat.append(portrait,plate);
  if(g){const c=element('div','cards');if(g.cards[i]){c.append(...cards(g.cards[i]));if(runoutPlan){const step=runoutPlan.reveals.find(r=>r.seat===i);if(step){c.classList.add('showdownTurn');if(prev?.g.cards[i])c.classList.add('ownReveal');c.style.setProperty('--showdown-delay',step.at/1000+'s')}}else if(settling&&!prev.g.cards[i])c.classList.add('showdownTurn')}else if(!g.folded[i])c.append(...Array.from({length:({plo:4,plo5:5,plo6:6})[state.settings?.variant]||2},()=>element('span','back')));if(positions){
    const layout=holeCardLayout(({plo:4,plo5:5,plo6:6})[state.settings?.variant]||2);c.classList.add('nativeHoleCards');
    if(g.cards[i])c.classList.add(g.folded[i]&&!(g.shownIndices?.[i]&&i!==state.me)?'nativeFoldCards':'nativeRaisedCards');
    c.style.setProperty('--hole-lift',String(layout.lift));c.style.setProperty('--hole-fold-lift',String(layout.foldLift));
    for(const [index,card]of [...c.children].entries())for(const [key,value]of Object.entries(layout.cards[index]))card.style.setProperty('--hole-'+key,String(value));
   }
   if(focusBySeat.size&&g.cards[i]&&!g.folded[i])for(const [index,card]of [...c.children].entries()){const selected=!!focusBySeat.get(i)?.hole.includes(index);card.dataset.bestFive=selected?'1':'0';card.classList.toggle('nativeFocusDim',!selected)}
   seat.append(c);
   if(i===g.button&&!positions){const dealer=element('span','dealer');dealer.setAttribute('aria-label','Dealer');seat.append(dealer)}
   if(!g.end&&g.bets?.[i]){
    const w=element('div','wager w'+pos);w.dataset.seat=i;if(count===3)w.style.scale='1.1';let art;
    if(positions){nativeChipPosition(w,positions[pos]);art=chipPile(aofBetParts(g,i,g.bets[i]),false,(variant==='aof'?pos===3:positions[pos].right)?'right':'left')}else{art=new Image();art.src='/home-art/bet-stack.png';art.alt=''}
    w.append(art,amount(element('span',''),g.bets[i]));if(wagers.has(i)){updateElement(wagers.get(i),w);wagers.delete(i)}else felt.append(w);
   }
    if(g.end&&g.end.payouts[i]>g.end.returns[i]){const continuingWin=!settling&&prev?.hand===state.number&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&existing?.querySelector('.showdownWin');if(continuingWin)portrait.append(continuingWin.cloneNode(true));else{const win=element('b','winMark'+(settling?' showdownWin':''),'WIN');if(positions){const image=new Image(),handNumber=state.number;image.className='nativeWin';image.alt='';image.src='/home-art/native-win-final.png';win.append(image);if(settling)win.onanimationstart=e=>{if(e.animationName==='markWinner'&&state?.number===handNumber&&!matchMedia('(prefers-reduced-motion: reduce)').matches)image.src='/home-art/native-win-effect.png?hand='+handNumber+'&seat='+i};portrait.append(win)}else plate.querySelector('.stack').prepend(win)}}
   const sweepAmount=collected?(prev.g.bets?.[i]||0)+g.committed[i]-prev.g.committed[i]-(g.end?.returns[i]||0):0;
   if(sweepAmount>0){gathered=true;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const sweep=element('span','sweep w'+pos);sweep.dataset.seat=i;if(count===3)sweep.style.scale='1.1';sweep.dataset.amount=sweepAmount;sweep.setAttribute('aria-hidden','true');if(positions){nativeChipPosition(sweep,positions[pos]);sweep.classList.add('nativeChipMotion');sweep.append(chipPile(aofBetParts(g,i,sweepAmount),false,(variant==='aof'?pos===3:positions[pos].right)?'right':'left'),amount(element('span',''),sweepAmount))}sweep.onanimationend=()=>sweep.remove();felt.append(sweep)}}
   if(settling&&g.end.payouts[i]>g.end.returns[i]){
    let credited=g.stacks[i]-g.end.payouts[i]+g.end.returns[i];amount(plate.querySelector('.stack').lastChild,credited,' chips');
    const handNumber=state.number,parts=g.end.pots?g.end.pots.map((p,pot)=>({pot,amount:p.payouts[i]})).filter(p=>p.amount):[{pot:0,amount:g.end.payouts[i]-g.end.returns[i]}];
    for(const part of parts){
     const award=element('span','award seatpos'+pos),origin=nativePotPositions[part.pot];award.dataset.pot=part.pot;award.dataset.seat=i;award.dataset.amount=part.amount;award.setAttribute('aria-label',(part.pot?'Side pot '+part.pot:'Main pot')+' payout: '+part.amount);
     award.style.setProperty('--pot-x',origin[0]/17+'cqw');award.style.setProperty('--pot-y',origin[1]/17+'cqw');
     if(positions){nativeChipPosition(award,positions[pos],origin);award.classList.add('nativeChipMotion');award.append(chipPile([part.amount],true,'center'),amount(element('span',''),part.amount))}
     let finished=false;const finish=()=>{if(finished)return;finished=true;credited+=part.amount;if(state?.number===handNumber&&state.hand?.end){const live=felt.querySelector('.seat[data-seat="'+i+'"] .stackSwitch');if(live)amount(live,credited,' chips')}award.remove();if(state?.number===handNumber&&state.hand?.end&&!felt.querySelector('.award')){const next=pendingHand;pendingHand=null;if(next)applyState(next);else render()}};
     award.onanimationstart=e=>{if(e.target===award&&['payout','aofPayout'].includes(e.animationName)&&state?.number===handNumber&&state.hand?.end&&payoutSoundHand===handNumber&&!soundedPots.has(part.pot)){soundedPots.add(part.pot);playCues(['WinPot'])}};
     award.onanimationend=award.onanimationcancel=finish;felt.append(award)
    }
   }
  }
  if(positions){
   const glow=element('span','nativeTurnGlow');glow.setAttribute('aria-hidden','true');glow.hidden=!g||!!g.end||g.turn!==i;glow.dataset.renderKey=glow.hidden?'idle':state.number+':'+g.deadline+':'+(i===state.me);
   const previous=existing?.querySelector('.nativeTurnGlow');if(previous&&previous.dataset.renderKey!==glow.dataset.renderKey)for(const animation of previous.getAnimations())animation.cancel();
   seat.append(glow)
  }
  if(n&&state.settings?.timeBankSeconds){const clock=element('span','nativeGameClock');clock.dataset.clockSeat=String(i);clock.setAttribute('role','img');for(let d=0;d<5;d++){const glyph=element('span','nativeClockDigit');glyph.style.left=([0,21,42,53,74][d]*.88)/17+'cqw';clock.append(glyph)}seat.append(clock)}
  if(g?.clock?.canDisableLimit&&i===state.me&&g.turn===i){const bank=element('button','nativeTimeBank');bank.type='button';bank.setAttribute('aria-label','Use remaining time bank');bank.title='Use the remaining local time bank for this turn';bank.dataset.renderKey=g.clock.actionId;bank.onclick=()=>operate('time-bank',{actionId:g.clock.actionId});seat.append(bank);const progress=element('span','nativeLimitProgress');progress.setAttribute('aria-hidden','true');progress.append(element('span','nativeLimitFill'),element('span','nativeLimitPointer'));seat.append(progress)}
  playerNotes.decorateSeat(seat,i);
  const extensions=[...existing?.querySelectorAll(':scope>.seatReaction,:scope>.seatEmoticonCaption,:scope>.seatChatBubble,:scope>.seatHelmet')||[]];for(const node of extensions)node.remove();
  const mounted=existing?updateElement(existing,seat):felt.appendChild(seat),glow=mounted.querySelector('.nativeTurnGlow');
  mounted.append(...extensions);
  if(glow&&!glow.hidden&&i===state.me&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!glow.getAnimations().some(a=>a.effect.getTiming().duration===400)){
   const art='url("/home-art/native-reserved-turn-glow-urgent.png")';glow.animate([{opacity:0,borderImageSource:art,offset:0,easing:'steps(1,end)'},{opacity:1,borderImageSource:art,offset:.5},{opacity:1,borderImageSource:art,offset:1}],{duration:400,delay:Math.max(0,g.deadline-Date.now()-5000),iterations:Infinity});
  }
 }
 fitSeatNames();
 if(gathered)playCues(['GatherChips']);
 const previousDealer=felt.querySelector(':scope>.aofDealer');
 if(g&&positions){
  const pos=(g.button-(state.me??(variant==='aof'?2:0))+count)%count,[x,y]=positions[pos].dealer,dealer=element('span','dealer aofDealer');dealer.setAttribute('aria-label','Dealer');dealer.style.left=x/17+'%';dealer.style.top=y/17+'cqw';if(count===3)dealer.style.setProperty('--dealer-scale','1.1');
  if(previousDealer)updateElement(previousDealer,dealer);else felt.append(dealer);
 }else previousDealer?.remove();
 for(const wager of wagers.values())wager.remove();
 for(const seat of felt.querySelectorAll('.seat'))if(Number(seat.dataset.seat)>=count)seat.remove();
 renderVoluntaryCards(g);renderSeatReactions();renderSeatAvatars();
}
function renderVoluntaryCards(g){
 const felt=document.querySelector('.felt'),existing=new Map([...felt.querySelectorAll(':scope>.voluntaryShown')].map(e=>[e.dataset.shownCard,e])),me=state?.me,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(g?.end&&me!=null&&!reduced&&felt.querySelector('.seat[data-seat="'+me+'"] .nativeHoleCards'))for(const index of g.shownIndices?.[me]||[]){
  const source=felt.querySelector('.seat[data-seat="'+me+'"] .cards').children[index],tag=state.number+':'+me+':'+index,pose=voluntaryCardPose(g.cards[me].length,index);let card=existing.get(tag);existing.delete(tag);
  if(!card){card=cards([g.cards[me][index]])[0];card.classList.add('voluntaryShown');card.dataset.shownCard=tag;card.dataset.cardIndex=String(index);Object.assign(card.style,{left:pose.x/17+'cqw',top:pose.y/17+'cqw',width:pose.width/17+'cqw',height:pose.height/17+'cqw',transform:'translate(-50%,-50%) rotate('+pose.angle+'deg)'});felt.append(card);
   if(pendingVoluntary.some(e=>e.own&&e.index===index)){
    const r=source.getBoundingClientRect(),f=felt.getBoundingClientRect(),k=f.width/1700,from={x:(r.x+r.width/2-f.x)/k,y:(r.y+r.height/2-f.y)/k,angle:parseFloat(getComputedStyle(source).rotate)||0},number=state.number;
    const animation=card.animate(voluntaryCardFrames(from,pose),{duration:300,delay:index*100,fill:'backwards'});card.dataset.motion='running';animation.finished.then(()=>{if(card.isConnected&&state?.number===number){card.dataset.motion='complete';playCues(['ShowCard'],()=>card.isConnected&&state?.number===number&&!matchMedia('(prefers-reduced-motion: reduce)').matches)}}).catch(()=>{});
   }
  }
  source.style.visibility='hidden';
 }
 for(const card of existing.values()){for(const animation of card.getAnimations())animation.cancel();card.remove()}
 renderRemoteVoluntary(g,reduced);pendingVoluntary=[];
}
function renderRemoteVoluntary(g,reduced){
 for(const [key,e]of remoteVoluntary){
  if(reduced||!g?.end||e.number!==state.number||!e.source.isConnected){e.animation.cancel();e.coverAnimation.cancel();e.lift.cancel();e.cover.remove();remoteVoluntary.delete(key)}
  else if(!e.coverFinished&&!e.cover.isConnected)e.source.append(e.cover);
 }
 if(reduced)return;const lifts=new Map();
 for(const event of pendingVoluntary.filter(e=>!e.own)){
  const source=document.querySelector('.seat[data-seat="'+event.seat+'"] .cards')?.children[event.index],key=state.number+':'+event.seat+':'+event.index,number=state.number;if(!source||remoteVoluntary.has(key))continue;
  const cover=element('span','voluntaryCover');cover.setAttribute('aria-hidden','true');source.append(cover);source.dataset.remoteReveal='running';
  const animation=source.animate(remoteVoluntaryFrames(),{duration:200}),cross=Math.cbrt(.5),coverAnimation=cover.animate([{opacity:1,offset:0},{opacity:1,offset:cross,easing:'steps(1,start)'},{opacity:0,offset:1}],{duration:200});
  const row=source.parentElement;let lift=lifts.get(row);if(!lift){lift=row.animate([{transform:'translateY(0px)'},{transform:getComputedStyle(row).transform}],{duration:400,easing:'cubic-bezier(.3333333333,1,.6666666667,1)'});lifts.set(row,lift)}
  const entry={source,cover,animation,coverAnimation,lift,number,coverFinished:false};remoteVoluntary.set(key,entry);
  playCues(['ShowDownCard'],()=>source.isConnected&&state?.number===number&&!matchMedia('(prefers-reduced-motion: reduce)').matches);
  animation.finished.then(()=>{cover.remove();entry.coverFinished=true;source.dataset.remoteReveal='complete'}).catch(()=>{});Promise.all([animation.finished,lift.finished]).then(()=>{if(remoteVoluntary.get(key)===entry)remoteVoluntary.delete(key)}).catch(()=>{});
 }
}
function renderPortrait(portrait,i){
 const avatar=state?.avatars?.[i]??(state?.settings?.variant==='aof'?i%7:undefined);if(!state?.names?.[i])return;
 const custom=Number.isInteger(avatar)&&avatar>=0&&avatar<=6||typeof avatar==='string'&&avatarSource(avatar)===avatar;
 portrait.classList.toggle('nativeAvatar',!custom&&[3,6].includes(capacity()));portrait.classList.toggle('profileAvatar',custom);
 portrait.style.backgroundImage=custom?'url('+avatarSource(avatar)+')':'';
 portrait.style.backgroundSize=custom?'cover':'';portrait.style.backgroundPosition=custom?'center':(i*20)+'% center';
 if(custom)for(const node of [...portrait.childNodes])if(node.nodeType===Node.TEXT_NODE)node.remove();portrait.setAttribute('aria-label','Avatar for '+state.names[i]);
}
function renderSeatAvatars(){for(const seat of document.querySelectorAll('.felt .seat'))renderPortrait(seat.querySelector('.portrait'),Number(seat.dataset.seat))}
const chatDisplays=new Map();let chatBubblesInitialized=false;
const reactionDisplays=new Map(),reactionReduced=matchMedia('(prefers-reduced-motion: reduce)');
reactionReduced.addEventListener('change',()=>{if(reactionReduced.matches)for(const node of document.querySelectorAll('.seatReaction,.seatChatBubble'))for(const animation of node.getAnimations())animation.cancel()});
// Seat contents are reconciled; keep dismissal on the stable felt parent.
for(const type of ['mousedown','click','keydown'])document.querySelector('.felt').addEventListener(type,event=>{const node=event.target.closest('.seatReaction,.seatEmoticonCaption,.seatChatBubble');if(!node)return;if(type==='mousedown')event.stopImmediatePropagation();else if(type==='click'){event.stopPropagation();const display=!node.classList.contains('seatChatBubble')?reactionDisplays.get(node.dataset.reaction):chatDisplays.get(node.dataset.bubble);if(display)display.dismissed=true;if(node.dataset.reaction)clearSeatReaction(node.parentElement);else node.remove()}else if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();node.click()}});
function renderSeatChat(){
 const aof=state?.settings?.variant==='aof',count=capacity();if(!state||chatWindow||count!==3&&count!==6&&!aof){document.querySelectorAll('.seatChatBubble').forEach(node=>node.remove());if(!state){chatDisplays.clear();chatBubblesInitialized=false}return}
 const keyFor=m=>JSON.stringify([m.at,m.seat,m.name,m.text]);
 if(!chatBubblesInitialized){for(const m of state?.chat||[])if(!m.reaction&&!m.emoticon)chatDisplays.set(keyFor(m),{started:performance.now(),dismissed:true});chatBubblesInitialized=true}
 const offsets=aof?[[46,-204],[78,-159],[90,-98],[-78,-159]]:count===3?[[46,-204],[78,-159],[-78,-159]]:[[46,-204],[78,-159],[84,-112],[90,-98],[-84,-112],[-78,-159]];
 for(const seat of document.querySelectorAll('.felt .seat')){
  const index=Number(seat.dataset.seat),current=seat.querySelector(':scope>.seatChatBubble'),message=state?.chat?.findLast(m=>m.seat===index&&m.name===state.names[index]&&!m.reaction&&!m.emoticon&&typeof m.text==='string'&&!['MODE_EMOJI','MODE_SNAPCAM','MODE_VOICE'].some(marker=>m.text.includes(marker)));
  if(!message){current?.remove();continue}const key=keyFor(message);let display=chatDisplays.get(key);
  if(!display){display={started:performance.now(),dismissed:helmet.muted()};chatDisplays.set(key,display);if(chatDisplays.size>200)chatDisplays.delete(chatDisplays.keys().next().value)}
  if(display.dismissed)continue;const elapsed=performance.now()-display.started;if(elapsed>=5000){current?.remove();continue}
  const position=(index-(state.me??(aof?2:0))+count)%count,right=aof?position===3:count===3?position===2:position>=4,[x,y]=offsets[position];
  if(current?.dataset.bubble===key){current.classList.toggle('right',right);current.style.left=(x-(right?178:0))/17+'cqw';current.style.top=(y+100-display.height)/17+'cqw';continue}current?.remove();
  const node=element('span','seatChatBubble'+(right?' right':'')),label=element('span','seatChatText',message.text);node.dataset.bubble=key;node.tabIndex=0;node.setAttribute('role','button');node.setAttribute('aria-label','Hide message from '+message.name);for(const name of ['seatChatBox','seatChatShadow']){const art=element('span',name);art.setAttribute('aria-hidden','true');node.append(art)}node.append(label);seat.append(node);
  const scale=document.querySelector('.felt').getBoundingClientRect().width/1700;let length=message.text.length-1;while(length>=0&&label.getBoundingClientRect().height/scale>100){label.textContent=message.text.slice(0,length)+'..';length--}const textHeight=label.getBoundingClientRect().height/scale,height=Math.max(100,textHeight+34);display.height=height;node.style.left=(x-(right?178:0))/17+'cqw';node.style.top=(y+100-height)/17+'cqw';node.style.height=height/17+'cqw';label.style.top=Math.floor((height-15-textHeight)/2)/17+'cqw';
  if(!reactionReduced.matches&&elapsed<200){const frames=Array.from({length:61},(_,i)=>({transform:'translateY('+(15*Math.pow(1-i/60,3)/17)+'cqw)'}));node.animate(frames,{duration:200,easing:'linear'}).currentTime=elapsed}
  setTimeout(()=>node.remove(),5000-elapsed);
 }
}
function chatReaction(m){if(isNativeEmoticon(m.emoticon)&&m.reaction===undefined)return {image:'/home-art/native-emoticon-'+m.emoticon+'.png',label:m.text||'Emoticon '+m.emoticon};if(m.emoticon===undefined&&[1,2,3].includes(m.reaction))return {image:'/home-art/reaction-'+m.reaction+'.png',label:m.text};return null}
const reactionKey=m=>JSON.stringify([m.at,m.seat,m.name,m.emoticon===undefined?m.reaction:['emoticon',m.emoticon]]);let nativeReactionsInitialized=false;
function clearSeatReaction(seat){seat.querySelectorAll(':scope>.seatReaction,:scope>.seatEmoticonCaption').forEach(node=>node.remove())}
function renderEmoticonCaption(seat,message,key){
 const aof=state.settings.variant==='aof',count=capacity();if(!isNativeEmoticon(message.emoticon)||!message.text||count!==3&&count!==6&&!aof)return null;
 const position=(message.seat-(state.me??(aof?2:0))+count)%count,right=aof?position===3:count===3?position===2:position>=4,offsets=aof?[[26,-187],[58,-142],[70,-81],[-58,-142]]:count===3?[[26,-187],[58,-142],[-58,-142]]:[[26,-187],[58,-142],[64,-95],[70,-81],[-64,-95],[-58,-142]],[x,y]=offsets[position];let node=seat.querySelector(':scope>.seatEmoticonCaption');
 if(!node){node=element('span','seatEmoticonCaption'),node.dataset.reaction=key;node.tabIndex=0;node.setAttribute('role','button');node.setAttribute('aria-label','Hide '+message.text+' reaction');for(const name of ['seatChatBox','seatChatShadow']){const art=element('span',name);art.setAttribute('aria-hidden','true');node.append(art)}const label=element('span','seatChatText',message.text);node.append(label);seat.append(node);const scale=document.querySelector('.felt').getBoundingClientRect().width/1700*parseFloat(getComputedStyle(seat).getPropertyValue('--seat-scale'));let length=message.text.length-1;while(length>=0&&label.getBoundingClientRect().height/scale>100){label.textContent=message.text.slice(0,length)+'..';length--}const textHeight=label.getBoundingClientRect().height/scale,height=Math.max(100,textHeight+34);node.dataset.height=height;node.style.height=height/17+'cqw';label.style.top=Math.floor((height-15-textHeight)/2)/17+'cqw'}
 node.classList.toggle('right',right);node.style.left='calc('+String(x-(right?178:0))+'*var(--seat-scale)/17*1cqw)';node.style.top='calc('+String(1+y+100-Number(node.dataset.height))+'*var(--seat-scale)/17*1cqw)';return node;
}
function renderSeatReactions(){
 renderSeatChat();
 if(!state)nativeReactionsInitialized=false;else if(!nativeReactionsInitialized){for(const m of state.chat||[])if(isNativeEmoticon(m.emoticon))reactionDisplays.set(reactionKey(m),{started:Date.now(),dismissed:true});nativeReactionsInitialized=true}
 for(const seat of document.querySelectorAll('.felt .seat')){
  const current=seat.querySelector('.seatReaction'),i=Number(seat.dataset.seat);
  const reaction=(state?.chat||[]).findLast(m=>m.seat===i&&m.name===state.names[i]&&chatReaction(m)&&Date.now()-m.at<4000);
  if(helmet.muted()){if(i===state.me)clearSeatReaction(seat);if(reaction)helmet.reactionAllowed(reaction);continue}if(reaction&&!helmet.reactionAllowed(reaction)){clearSeatReaction(seat);continue}
  const animated=reaction&&emoticonPicker?.animation(reaction.emoticon);const key=reaction?reactionKey(reaction):'';if(current?.dataset.reaction===key&&!!current.dataset.animated===!!animated){if(reaction)renderEmoticonCaption(seat,reaction,key);continue}clearSeatReaction(seat);
  if(reaction){
   let display=reactionDisplays.get(key);if(!display){display={started:Date.now(),dismissed:false};reactionDisplays.set(key,display);if(reactionDisplays.size>200)reactionDisplays.delete(reactionDisplays.keys().next().value)}
   const elapsed=Date.now()-display.started;if(display.dismissed||elapsed>=4000)continue;
   const art=chatReaction(reaction),image=animated?element('span'):new Image();if(animated)image.dataset.animated=reaction.emoticon;image.dataset.reaction=key;if(isNativeEmoticon(reaction.emoticon))image.dataset.emoticon=reaction.emoticon;image.src=art.image;image.alt=reaction.name+': '+art.label;image.className='seatReaction';image.tabIndex=0;image.setAttribute('role','button');image.setAttribute('aria-label','Hide '+art.label+' reaction');seat.append(image);const caption=renderEmoticonCaption(seat,reaction,key);
   if(animated)emoticonPicker.animate(image,animated,display,reactionReduced,elapsed);else if(!reactionReduced.matches&&elapsed<200){const frames=Array.from({length:61},(_,i)=>{const t=i/60-1;return {transform:'scale('+(i===0?.5:i===60?1:.5+.5*(t*t*(2.70158*t+1.70158)+1))+')'}});image.animate(frames,{duration:200,easing:'linear'}).currentTime=elapsed}
   setTimeout(()=>{image.remove();caption?.remove()},4000-elapsed);
  }
 }
}
function renderChat(){
 helmet.refresh();$('chatMessages').hidden=helmet.muted();
 const messages=$('chatMessages'),fresh=messages.cloneNode(false);
 for(const m of state?.chat||[]){if(helmet.messageVisible?.(m)===false)continue;const li=element('li','',m.name+': '+m.text);li.dataset.observer=String(m.observer===true);const reaction=chatReaction(m);if(reaction){const img=new Image();img.src=reaction.image;img.alt=reaction.label;img.width=50;img.height=50;li.append(img)}fresh.append(li)}
 updateElement(messages,fresh);
$('chatForm').hidden=!chatWindow&&state?.me==null;
 $('chatStatus').textContent=rushMode?'Chat is unavailable in the local Rush pool.':state?.chatMuted?'Chat muted by table owner':helmet.muted()?'Helmet is on':'';const canChat=state?.me!=null||state?.canObserveChat===true;for(const control of $('chatForm').querySelectorAll('input,button'))control.disabled=rushMode||!canChat||control.id==='chatHelmet'&&state?.me==null||(!control.matches('#chatMore,#chatHelmet,#chatObserver')&&(!!state?.chatMuted||helmet.muted()));emoticonPicker?.refresh(!rushMode&&canChat&&!state?.chatMuted&&!helmet.muted());
}
function renderShowCards(g){
 const own=g.cards[state.me],choices=own.length===2?[[0],[1],[0,1]]:[own.map((_,i)=>i)],felt=document.querySelector('.felt').getBoundingClientRect(),k=felt.width/1700;
 for(const [i,indices]of choices.entries()){
  const b=btn('',()=>operate('show-cards',{indices}));b.className='nativeShowCards';b.dataset.indices=indices.join(',');b.setAttribute('aria-label','Show '+(indices.length===own.length?'all cards':own[indices[0]]));b.disabled=!!document.querySelector('.award');
  const x=own.length===2?1087+i*199:1286-54*(own.length-4)+95;b.style.left=felt.left+x*k+'px';b.style.top=felt.top+1121*k+'px';b.style.setProperty('--show-card-scale',k);b.style.width=Math.max(192,indices.length*54+80)+'px';b.append(element('span','showLabel','Show'));
  const row=element('span','showCardFaces');row.style.left=(indices.length===1?112:71)+'px';for(const index of indices){const card=own[index],face=element('span','showCardFace'),rank=element('img','showRank'),suit=element('img','showSuit');rank.src='/home-art/native-show-rank-'+card[0]+'.png';suit.src='/home-art/native-show-suit-'+card[1]+'.png';rank.alt=suit.alt='';face.append(rank,suit);row.append(face)}b.append(row);
 }
}
function render(){
 updateAddChipsControl();
 if(!state){pendingHand=null;clearPayout();reservedAction=null;reservedPanel.hidden=true;runoutPlan=null;boardSounds.clear();payoutSoundHand=null;soundedPots.clear()}
 if(!state?.hand?.quickFoldAllowed)$('actions').querySelector('.nativeQuickFold')?.remove();
 const oldBet=$('actions').querySelector('input[type=number]'),draft=oldBet?{key:oldBet.dataset.handKey,value:oldBet.dataset.betChips??oldBet.value,focused:document.activeElement===oldBet}:null;
 $('join').hidden=rushMode||state?.me!=null;
 if(typeof waitingState!=='undefined')paintWaiting();
 let seatChoice=$('seatChoice');
 if(!seatChoice){const label=element('label','','Seat ');seatChoice=document.createElement('select');seatChoice.id='seatChoice';label.append(seatChoice);$('join').insertBefore(label,$('join').querySelector('button'))}
 const chosen=seatChoice.value;seatChoice.replaceChildren(new Option('Any open seat',''));
 for(let i=0;i<capacity();i++){const option=new Option('Seat '+(i+1)+(state?.names[i]?' · occupied':''),String(i));option.disabled=!!state?.names[i]||!!(state?.reservedSeats?.includes(i)&&waitingState?.offer?.seat!==i);seatChoice.append(option)}seatChoice.value=chosen||'';
const g=state?.hand,t=state?.tournament,actionKey=g&&!g.end?(state.waitingForHand?'waiting:'+state.me+':'+state.number:state.me+':'+state.number+':'+g.history.length+':'+g.turn):'',keepActions=!!(g&&!g.end&&(g.turn===state.me||state.waitingForHand)&&$('actions').dataset.handKey===actionKey);
if(!keepActions){refreshBetEditor=null;for(const child of [...$('actions').children])if(!child.classList.contains('nativeQuickFold'))child.remove();$('actions').dataset.handKey=actionKey}
 const funding=state?.topUps?.at(-1);$('funding').hidden=!funding&&!state?.pendingAdd;$('funding').textContent=state?.pendingAdd?state.pendingAdd.amount+' play chips pending for the next hand.':funding?'Added '+funding.added+' practice chips for hand '+funding.hand+' · stack '+funding.before+' → '+funding.after:'';
 const tournament=state?!!t:tournamentLink;const settings=state?.settings||advertised;
 if(chatWindow)document.title='Chat '+(settings?.name||'Local table');
 document.querySelector('h1').textContent=tournament?capacity()+'-player '+(settings?.variant==='plo'?'PLO ':'')+'freezeout':state?.settings?.name||advertised?.name||'Private no-limit table';
 $('format').textContent=tournament?(t?.startsAt?'Scheduled start '+new Date(t.startsAt).toLocaleString()+' · minimum '+Math.max(2,(t.prizeShares||[100]).length)+' players.':capacity()+' registrations start the event.')+(playerAccount?(state?.me==null?(advertised?.accountEntryCost===25?' Entry: 25 local play chips.':''):state.tournamentEntryPaid?' Entry paid: 25 local play chips.':' Practice entry: no wallet transfer.'):'')+' Each seat gets '+(settings?.stack||100)+' tournament chips. Each entry adds 25 play credits to a '+capacity()*25+'-credit practice prize pool. Payout: '+(t?.prizeShares||[100]).map((n,i)=>(i+1)+': '+n+'%').join(' · ')+'. No rebuys.':settings?capacity()+' seats · '+settings.stack+' starting chips · blinds '+(settings.variant==='shortdeck'?settings.blind+' ante + '+settings.blind+' button blind (local rules)':settings.blind/2+' / '+settings.blind):'Four human seats · practice chips · blinds 2 / 4.';
 const ranged=!tournament&&Number.isSafeInteger(settings?.minBuyIn)&&settings.minBuyIn<settings.maxBuyIn,buyIn=$('buyIn');$('buyInLabel').hidden=!ranged;buyIn.disabled=!ranged;
 if(ranged){const limits=settings.minBuyIn+':'+settings.maxBuyIn;if(buyIn.dataset.limits!==limits){buyIn.min=settings.minBuyIn;buyIn.max=settings.maxBuyIn;buyIn.value=preferredBuyIn(settings.minBuyIn,settings.maxBuyIn);buyIn.dataset.default=buyIn.value;buyIn.dataset.limits=limits}}
 $('join').querySelector('button').textContent=tournament?'Register':'Take a seat';
 $('level').textContent=t&&g?'Level '+t.level+' · Blinds '+g.blind/2+' / '+g.blind+(g.ante?' · Ante '+g.ante+' per player':'')+(t.winner==null&&t.level<7?' · Next level scheduled '+new Date(t.startedAt+t.level*t.intervalMs).toLocaleTimeString()+' (new hands only)':''):'';

 drawTable(g);renderShuffles();playerNotes.refresh();
 renderChat();
 list('history',g?.history||[]);list('results',(state?.results||[]).map(r=>'Hand '+r.number+' · Board: '+(r.board?.join(' ')||'no board')+' · Final stacks: '+r.stacks.join(', ')+(r.pots||[]).map((p,i)=>' · '+(i?'Side pot '+i:'Main pot')+': '+p.amount+' → '+p.payouts.flatMap((n,seat)=>n?['Seat '+(seat+1)+' '+n]:[]).join(', ')).join('')+' · '+(r.history||[]).join('; ')));
 const net=Array(capacity()).fill(0);for(const r of state?.results||[])r.payouts.forEach((v,i)=>net[i]+=v-r.committed[i]);
 list('standings',(state?.names||[]).map((name,i)=>({name,score:net[i],place:t?.finishes?.[i],prize:t?.prizes?.[i]||0})).filter(x=>x.name).sort((a,b)=>b.score-a.score).map(x=>x.name+': '+(x.score>0?'+':'')+x.score+(x.place?' · place '+x.place:'')+(x.prize?' · prize '+x.prize+' credits':'')));
 if(rushMode){
  rushSitOut.checked=!!state?.paused;rushSitOut.disabled=!state?.registered;
  document.querySelectorAll('details').forEach(d=>{if(d.querySelector('#chatForm,#invite,#standings,#results'))d.hidden=true});
  if(!state){$('status').textContent='Connecting to the local Rush pool…';return}
  if(!state.table){
   $('status').textContent=(state.paused?'Sitting out · ':'')+(state.registered?'Waiting pool · '+state.waiting+' available of '+state.population+' players · Balance '+state.balance+' chips.':'Join the local play-money Rush pool. Six available players start a hand.')+(g?.end?' Last hand settled. '+g.end.payouts.flatMap((n,i)=>n?[state.names[i]+': '+n]:[]).join('; '):'');
   if(state.queued){$('status').textContent+=' Searching automatically…';btn('Cancel waiting queue',()=>operate('cancel-queue'))}else btn(state.registered?(state.paused?"I'm back":'Find next table'):'Join Rush pool',()=>operate(state.registered?'deal':'join'));if(state.registered)btn('Play Rush with computers',()=>operate('fill-bots'));return;
  }
  if(g.quickFoldAllowed){let b=$('actions').querySelector('.nativeQuickFold');if(!b){b=btn('',()=>operate('quick-fold'),'F1');b.className='nativeQuickFold';b.setAttribute('aria-label','Quick fold → next table');b.title='Quick fold → next table';b.append(element('span','','Fold'))}b.title=state.paused?'Quick fold → sit out':'Quick fold → next table';b.setAttribute('aria-label',b.title);positionQuickFold()}else $('actions').querySelector('.nativeQuickFold')?.remove();
 }
 if(state&&state.me==null){$('status').textContent=g?'Watching hand '+state.number+(g.end?' · settled':' · '+state.names[g.turn]+' to act'):'Watching · waiting for players';if(lastCashOut!==null)$('status').textContent+=' · Practice cash-out: '+lastCashOut+' chips';return}
 if(!state){$('status').textContent=lastCashOut===null?'Take a seat to join the room.':'Practice cash-out: '+lastCashOut+' chips. Take a seat to join again.';return}
 if(t?.cancelledAt){$('status').textContent='Event cancelled: insufficient registrations for the payout structure. Entry returned: '+(t.refunds?.[state.me]||0)+' play credits.';return}
 if(!g){$('status').textContent=(t?.startsAt?'Scheduled '+new Date(t.startsAt).toLocaleString()+' · minimum '+Math.max(2,(t.prizeShares||[100]).length)+' players · ':'')+(t?'Prize pool '+t.pool+' credits · Registration open (':'Waiting for '+capacity()+' players (')+state.names.filter(Boolean).length+'/'+capacity()+').';if(state.canStart)btn('Start hand with '+state.names.filter(Boolean).length+' players',()=>operate('start'));if(state.canFill)btn('Fill empty seats with computers',()=>operate('fill-bots'));btn(t?'Withdraw registration':'Leave seat',()=>operate('leave'));return}
 if(g.end&&g.canShowCards)renderShowCards(g);
 if(t?.winner!=null){$('status').textContent='Tournament winner: '+state.names[t.winner]+' · Prize: '+t.prizes[t.winner]+' practice credits.';if((t.prizeShares||[100]).length>1)$('status').textContent+=' Paid: '+t.prizes.flatMap((n,i)=>n?[state.names[i]+' '+n]:[]).join('; ');return}
 if(g.end){$('status').textContent='Hand '+state.number+' settled. '+g.end.payouts.flatMap((p,i)=>p?[state.names[i]+': won '+(p-g.end.returns[i])+(g.end.returns[i]?', returned '+g.end.returns[i]:'')]:[]).join('; ');
 if(t){$('status').textContent+=' Next hand starts automatically.';return}
 btn('Leave table',()=>operate('leave'));
 if(state.soloBots)btn('End practice and release table',()=>operate('end-practice'));
 if(!state.ready[state.me]){const rebuy=g.dealtSeats?.includes(state.me)&&g.stacks[state.me]===0&&!state.pendingAdd,funding=topUpRequest(g,settings);if(rebuy&&funding.topUpTo)btn('Add Chips',openAddChips).disabled=!!document.querySelector('.award');const ready=btn(rebuy&&!funding.topUpTo?(advertised?'Add Chips':'Rebuy '+(settings?.stack??120)+' play chips'): 'Ready for next hand',()=>{const chosen=topUpRequest(g,settings);return rebuy&&!chosen.topUpTo?(advertised?openAddChips():operate('ready',{topUpTo:settings?.stack??120})):operate('ready',chosen)});ready.disabled=!!document.querySelector('.award');if(ready.disabled)ready.title='Waiting for payout to finish'}else $('status').textContent+=' Waiting for other players.';return}
 if(state.waitingForHand){$('status').textContent='Seated · waiting for the next hand.';if(!keepActions)btn('Cancel waiting seat',()=>operate('leave'));return}
 $('status').textContent='Hand '+state.number+' · Pot '+g.committed.reduce((a,b)=>a+b,0)+' · '+(state.me===g.turn?'Your turn':state.names[g.turn]+' to act');
 const o=g.options;if(!o||keepActions)return;
 const act=(action,target)=>operate('act',{action,target});
 if(settings?.variant==='aof'){for(const [slot,label,action,key]of [[0,'Fold','fold','F1'],[1,'All in','allin','F3']]){const b=btn('',()=>{playCues(['AofButton']);act(action)},key);b.className='nativeAofAction';b.dataset.slot=String(slot);b.append(element('span','',label))}positionQuickFold();return}
 const mainButton=(label,chips,fn,key,slot)=>{const b=btn('',fn,key);b.className='nativeMainAction';b.dataset.slot=String(slot);b.replaceChildren(element('span','actionLabel',label));if(chips!=null){b.classList.add('hasAmount');b.append(document.createTextNode(' '),amount(element('span','actionAmount'),chips))}b.setAttribute('aria-label',b.textContent);positionQuickFold();return b};
 mainButton(o.due?'Call':'Check',o.due?o.call:null,()=>act(o.due?'call':'check'),'F2',1);if(!rushMode)mainButton(o.due?'Fold':'Check/Fold',null,()=>{if(o.due){reservedAction=null;act('fold')}else {reservedAction={kind:'check-fold',retain:true,number:state.number,seat:state.me};renderReserved()}},'F1',0);
 if(o.raise){
  const n=document.createElement('input'),slider=document.createElement('input'),sizes=element('div','betStrip');
  Object.assign(n,{type:'number',min:o.min,max:o.max,step:1,value:o.min,required:true});
  Object.assign(slider,{type:'range',step:'any',min:o.min,max:o.max,value:o.min});
  n.dataset.handKey=state.number+':'+g.history.length+':'+g.turn;
  if(draft?.key===n.dataset.handKey&&Number.isSafeInteger(Number(draft.value))&&Number(draft.value)>=o.min&&Number(draft.value)<=o.max)n.value=slider.value=draft.value;
slider.setAttribute('aria-label','Adjust bet total');
  sizes.setAttribute('role','group');sizes.setAttribute('aria-label','Bet amount shortcuts');
  const price=g.bets[state.me]+o.due;
  const presets=betShortcuts(g,o,state.me,readBettingPreferences(localStorage.getItem('river-bet-presets'))).map(p=>[p.label,p.target]);
  const writeEditor=()=>{const factor=showBB?g.blind:1;n.dataset.factor=String(factor);n.min=String(showBB?bbValue(o.min,g.blind):o.min);n.max=String(showBB?bbValue(o.max,g.blind):o.max);n.step='any';n.value=String(showBB?bbValue(Number(slider.value),g.blind):slider.value);n.dataset.editorValue=n.value;n.dataset.betChips=slider.value;n.setAttribute('aria-label','Bet total ('+(showBB?'BB':'chips')+')');n.setCustomValidity('')};
  const readTotal=(edited=false)=>{const total=!edited&&!n.validity.customError&&n.value===n.dataset.editorValue?Number(n.dataset.betChips):chipsFromBetInput(n.value,Number(n.dataset.factor));const valid=total!==null&&Number.isSafeInteger(total)&&total>=o.min&&total<=o.max;n.setCustomValidity(valid?'':'Enter a legal total in whole play-money chips');if(valid){slider.value=String(total);n.dataset.betChips=String(total);n.dataset.editorValue=n.value}return valid?total:null};
  const paintProgress=()=>{const total=Number(slider.value);sizes.style.setProperty('--bet-progress',String(Math.max(0,Math.min(1,(total-o.min)/(o.max-o.min||1)))));const b=$('actions').querySelector('.nativeMainAction[data-key=F3]');if(b){const label=amount(b.querySelector('.actionAmount'),total);b.setAttribute('aria-label',(price?'Raise to ':'Bet ')+label.textContent);positionQuickFold()}};
  const set=v=>{slider.value=String(Math.min(o.max,Math.max(o.min,v)));writeEditor();paintProgress()};
  for(const [index,[text,v]] of presets.entries()){const b=element('button','',text);b.replaceChildren(element('span','',text));b.dataset.key='Ctrl+'+(index+1);hotkeyHint(b);b.dataset.preset=String(index);b.dataset.target=String(v);b.onclick=()=>set(Number(b.dataset.target));sizes.append(b)}
  const increment=()=>betIncrement(g.blind,readBettingPreferences(localStorage.getItem('river-bet-presets')).unit,settings?.variant);
  n.onfocus=()=>n.select();
  n.setAttribute('aria-label','Bet total');slider.oninput=()=>set(snapBetAmount(slider.valueAsNumber,o.min,o.max,increment()));
  slider.onkeydown=e=>{const direction=({ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1})[e.key];if(direction||['Home','End'].includes(e.key)){e.preventDefault();set(e.key==='Home'?o.min:e.key==='End'?o.max:wheelBetAmount(Number(slider.value),direction,o.min,o.max,increment()))}};n.oninput=()=>{readTotal(true);paintProgress()};n.onblur=()=>{if(readTotal()!==null){writeEditor();paintProgress()}};refreshBetEditor=()=>{if(document.activeElement!==n&&readTotal()!==null)writeEditor();paintProgress()};
  sizes.onwheel=e=>{if(!e.deltaY)return;e.preventDefault();set(wheelBetAmount(readTotal()??o.min,-Math.sign(e.deltaY)*(localStorage.getItem('river-wheel-increase')==='0'?-1:1),o.min,o.max,increment()))};
  n.onkeydown=e=>{
   if(e.key!=='Enter'||e.isComposing)return;
   e.preventDefault();const amount=readTotal();if(e.repeat||!n.reportValidity()||amount===null)return;
   if(localStorage.getItem('river-confirm-bet')==='0'){act('raise',amount);return}
   const dialog=document.createElement('dialog'),prompt=element('p','',(price?'Raise to ':'Bet ')+amount+' chips?');
   dialog.setAttribute('aria-label',prompt.textContent);
   const cancel=element('button','','Cancel'),confirm=element('button','','Confirm');
   cancel.onclick=()=>dialog.close();confirm.onclick=()=>{dialog.close();act('raise',amount)};
   dialog.onclose=()=>dialog.remove();dialog.append(prompt,cancel,confirm);sizes.append(dialog);dialog.showModal();cancel.focus();
  };
  sizes.classList.add('nativeRushBetStrip');const amountBox=element('div','nativeRushAmount');amountBox.append(n);sizes.append(amountBox,slider);writeEditor();paintProgress();$('actions').prepend(sizes);positionQuickFold();if(draft?.focused&&draft.key===n.dataset.handKey)n.focus();mainButton(price?'Raise to':'Bet',Number(slider.value),()=>{const total=readTotal();if(n.reportValidity()&&total!==null)act('raise',total)},'F3',2);
 }
}
function displayHotkeys(){for(const b of document.querySelectorAll('#actions button[data-key]'))hotkeyHint(b);document.documentElement.dataset.showHotkeys=localStorage.getItem('river-hotkeys')==='1'&&localStorage.getItem('river-show-hotkeys')==='1'?'1':'0'}
displayHotkeys();
const hotkeys=$('hotkeys');hotkeys.checked=localStorage.getItem('river-hotkeys')==='1';
hotkeys.onchange=()=>{localStorage.setItem('river-hotkeys',hotkeys.checked?'1':'0');displayHotkeys()};
addEventListener('storage',e=>{
 if(e.storageArea!==localStorage)return;
 if(e.key===null||e.key.startsWith('river-add-chips:'))updateAddChipsControl();
 if(state?.hand?.end&&(e.key===null||e.key.startsWith('river-add-chips:')||['river-auto-topup','river-topup-threshold','river-topup-target'].includes(e.key)))render();
 if((e.key===null||e.key==='river-bet-presets')&&state?.hand?.options){const g=state.hand,n=$('actions').querySelector('input[type=number]'),slider=$('actions').querySelector('input[type=range]');if(n&&slider)for(const [i,p]of betShortcuts(g,g.options,state.me,readBettingPreferences(localStorage.getItem('river-bet-presets'))).entries()){const b=$('actions').querySelector('[data-preset="'+i+'"]');if(b){if(b.firstElementChild)b.firstElementChild.textContent=p.label;else b.textContent=p.label;b.dataset.target=String(p.target)}}}
 if(e.key===null||['river-hotkeys','river-show-hotkeys','river-hotkey-bindings','river-hotkey-groups'].includes(e.key))displayHotkeys();
 if(e.key===null||e.key==='river-hotkeys')hotkeys.checked=localStorage.getItem('river-hotkeys')==='1';
 if(e.key===null||['river-chip-switch','river-open-bb'].includes(e.key)){
  chipSwitch.checked=localStorage.getItem('river-chip-switch')==='1';openBB.checked=localStorage.getItem('river-open-bb')!=='0';openBB.disabled=!chipSwitch.checked;
  showBB=chipSwitch.checked&&openBB.checked;repaintUnits();
 }
});
document.addEventListener('keydown',e=>{
 if(chatWindow||closeSqueeze||!hotkeys.checked||!state||e.isComposing||document.querySelector('dialog:modal')||e.target.closest?.('.nativeHud,.tableHandHistory')||e.target.isContentEditable||e.target.closest?.('input,textarea,select'))return;
 const codes=keyCodes(e);if(!codes)return;const bindings=readHotkeys(localStorage.getItem('river-hotkey-bindings')),action=hotkeyActions.find(a=>bindings[a.id].length&&bindings[a.id].join(',')===codes.join(','))?.id;if(!action||!readHotkeyGroups(localStorage.getItem('river-hotkey-groups'))[hotkeyGroup(action)])return;
 // Bound keys must not activate another focused HTML control.
 e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
 const click=button=>{if(button&&!button.disabled){e.preventDefault();button.click();return true}return false};
 if(action==='addChips'){click(nativeAddChipsButton);return}
 if(action==='lastHands'){click(document.querySelector('#tableHandHistory'));return}
 if(action==='timeBank'){click(document.querySelector('.nativeTimeBank'));return}
 if(action==='toggleUnits'){click(document.querySelector('.stackSwitch:not([disabled])'));return}
 if(action==='sitOut'){if(rushMode)click(rushSitOut);return}
 if(action==='newHand'){click([...$('actions').querySelectorAll('button')].find(b=>b.textContent==='Ready for next hand'||state.registered&&!state.table&&['Find next table',"I'm back"].includes(b.textContent)));return}
 if(!state.hand)return;
 if(action.startsWith('show')){const own=state.hand.cards[state.me],indices=action==='showLeft'?'0':action==='showRight'?'1':own?.map((_,i)=>i).join(',');click([...$('actions').querySelectorAll('.nativeShowCards')].find(b=>b.dataset.indices===indices));return}
 if(action==='fold'&&rushMode&&state.hand.quickFoldAllowed){click($('actions').querySelector('[data-key=F1]'));return}
 if(!state.hand.options){const kinds=({fold:['fold','check-fold'],call:['check','call'],raise:['allin']})[action],button=kinds&&[...reservedPanel.children].find(b=>!b.hidden&&kinds.includes(b.dataset.reserve));if(button&&!reservedPanel.hidden)click(button);return}
 if(action==='allIn'){const slider=$('actions').querySelector('input[type=range]');if(slider){slider.value=slider.max;slider.dispatchEvent(new Event('input'));click($('actions').querySelector('[data-key=F3]'))}else if($('actions').querySelector('.nativeAofAction[data-key=F3]'))click($('actions').querySelector('.nativeAofAction[data-key=F3]'));else if(state.hand.options.due>0)click($('actions').querySelector('[data-key=F2]'));return}
 if(/^(preset|bet)[1-4]$/.test(action)){if(click(document.querySelector('.betStrip > button[data-preset="'+(Number(action.at(-1))-1)+'"]'))&&action.startsWith('bet'))click($('actions').querySelector('[data-key=F3]'));return}
 click($('actions').querySelector('[data-key="'+({fold:'F1',call:'F2',raise:'F3'})[action]+'"]'));
},{capture:true});

for(const [id,label] of [[1,'Angry'],[2,'Listening'],[3,'Laughing']]){const button=document.createElement('button');button.type='button';const icon=new Image();icon.src='/home-art/reaction-'+id+'.png';icon.alt='';icon.width=38;icon.height=38;const text=element('span','reactionLabel',label);button.setAttribute('aria-label',label);button.append(icon,text);button.className='reactionButton';button.onclick=()=>operate('chat',{reaction:id});$('chatForm').append(button)}
const emoticonModule=rushMode?null:await fetch('/emoticon-picker.mjs',{signal:AbortSignal.timeout(5000)}).then(r=>r.ok?import('./emoticon-picker.mjs'):null).catch(()=>null);if(emoticonModule){$('chatForm').querySelectorAll('.reactionButton').forEach(button=>button.remove());emoticonPicker=emoticonModule.installEmoticonPicker($('chatForm'),async id=>{const input=$('chatText'),draft=input.value;input.value='';input.dispatchEvent(new Event('input'));const accepted=await operate('chat',{emoticon:id});if(!accepted&&!input.value)input.value=draft;input.dispatchEvent(new Event('input'));return accepted},playerAccount)}
$('chatForm').onsubmit=async e=>{e.preventDefault();await operate('chat',{text:$('chatText').value});if(!$('error').textContent){$('chatText').value='';$('chatText').dispatchEvent(new Event('input'))}};
$('join').onsubmit=async e=>{e.preventDefault();const useProfile=new URLSearchParams(location.search).has('player'),seat=$('seatChoice').value!==''?{seat:Number($('seatChoice').value)}:{};if(!token&&advertised&&advertised.mode!=='tournament'&&!rushMode){if(waitingBusy)return;await updateWaiting();if(useProfile&&!waitingState?.offer){if(!await updateWaiting('reserve',seat))return}}if(state?.me!=null)return;if(waitingState?.offer){syncSeatBuyIn(true);return}operate('join',{useProfile,name:$('name').value,...(!$('buyIn').disabled?{buyIn:Number($('buyIn').value)}:{}),...seat,mode:tournamentLink?'tournament':'cash'})};
const waitingPanel=element('section','waitingPanel'),waitingStatus=element('output'),waitingButton=element('button'),waitingLabel=element('span','waitingButtonLabel'),waitingCount=element('div','waitingCount'),waitingPosition=element('div','waitingPosition'),waitingCountValue=element('span'),waitingPositionValue=element('span');waitingPanel.hidden=true;waitingPanel.setAttribute('aria-label','Waiting list');waitingStatus.setAttribute('role','status');waitingButton.type='button';waitingButton.append(waitingLabel);waitingCount.append(element('span','','Waiting Player : '),waitingCountValue);waitingPosition.append(element('span','','My Position : '),waitingPositionValue);waitingStatus.append(waitingCount,waitingPosition);waitingPanel.append(waitingStatus,waitingButton);document.querySelector('.felt').append(waitingPanel);let waitingState=null,waitingBusy=false,waitingRequest=0,seatBuyIn=null,walletAvailable=null,autoBuyInAttempt=null,rebuyFunding=null;
function positionWaiting(){if(waitingPanel.hidden)return;const r=document.querySelector('.felt').getBoundingClientRect(),scale=r.width/1700;waitingPanel.style.left=r.left+1344*scale+'px';waitingPanel.style.top=r.top+1085*scale+'px';waitingPanel.style.setProperty('--waiting-scale',String(scale))}
function paintWaiting(){syncSeatBuyIn(true);seatBuyIn?.refreshBalance?.();if(waitingState)$('join').hidden=rushMode||state?.me!=null||waitingState.open===false;waitingPanel.hidden=waitingState?.open===false||!!waitingState?.offer||rushMode||state?.me!=null||!waitingState||waitingState.signIn||!((state?.names?.length&&state.names.every((name,i)=>name||state.reservedSeats?.includes(i))&&waitingState.count<capacity())||waitingState.position>0);if(waitingPanel.hidden)return;const position=waitingState.position;waitingCountValue.textContent=String(waitingState.count);waitingCount.hidden=waitingState.count<=0;waitingPositionValue.textContent=position+(position===1?'st':position===2?'nd':position===3?'rd':'th');waitingPosition.hidden=position<=0;waitingStatus.dataset.position=String(position>0);waitingLabel.textContent=waitingState.offer?'Take offered seat':position?'Cancel Waiting':'Join Waiting';waitingButton.disabled=waitingBusy;waitingButton.dataset.waiting=position?'cancel':'join';waitingPanel.dataset.offer=String(!!waitingState.offer);positionWaiting()}
// Passive reads keep the button active; a newer mutation supersedes an earlier read.
async function updateWaiting(action,details={}){if(waitingBusy||rushMode||token||!advertised||advertised.mode==='tournament')return;const previousSeat=waitingState?.offer?.seat,requestID=++waitingRequest;let fundingCancellation=false;if(action){waitingBusy=true;paintWaiting()}try{const response=await fetch('/api/rooms/'+room+'/waiting',action?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...details})}:{cache:'no-store'}),data=await response.json();if(requestID!==waitingRequest||token||state?.me!=null)return;if(response.status===401)waitingState={count:advertised.waitingCount||0,position:0,offer:null,signIn:true};else if(response.status===409&&(!action||action==='cancel'))waitingState={open:false,count:0,position:0,offer:null};else if(!response.ok)throw Error(data.error);else{let available=null;if(data.offer)try{const balance=await fetch('/local/wallet',{cache:'no-store'});if(balance.ok){const value=await balance.json();if(Number.isSafeInteger(value.available)&&value.available>=0)available=value.available}}catch{}if(requestID!==waitingRequest||token||state?.me!=null)return;walletAvailable=available;seatBuyIn?.refreshBalance?.();if(data.offer&&available!==null&&available<(advertised.minBuyIn??advertised.stack)){fundingCancellation=true;const cancelled=await fetch('/api/rooms/'+room+'/waiting',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'cancel'})}),released=await cancelled.json();if(requestID!==waitingRequest||token||state?.me!=null)return;if(!cancelled.ok)throw Error(released.error);waitingState=released;if(released.seated)return true;$('error').textContent='Not enough local play chips: '+available+' available; '+(advertised.minBuyIn??advertised.stack)+' required. Request an owner grant, then choose a seat again.';return false}waitingState=data;if(action)$('error').textContent=''}return response.ok;}catch(error){if((action||fundingCancellation)&&requestID===waitingRequest)$('error').textContent=error.message}finally{if(requestID===waitingRequest){waitingBusy=false;if(state&&previousSeat!==waitingState?.offer?.seat)render();else paintWaiting()}}}
addEventListener('resize',positionWaiting);addEventListener('scroll',positionWaiting,{passive:true});document.fonts.ready.then(positionWaiting);

function addChipsKey(settings){const variant=settings.variant||'holdem';return 'river-add-chips:'+variant+(variant==='holdem'?'_'+capacity():'')}
function addChipsOptions(settings){const values=[0],min=Math.floor((settings.minBuyIn??settings.stack)/settings.blind),max=Math.floor((settings.maxBuyIn??settings.stack)/settings.blind),last=Math.floor(max/10)*10;let step=10;for(let value=Math.ceil(min/10)*10;value<=last;value+=step){if(value>=200)step=100;values.push(value);if(value>last-step&&value!==last)values.push(last)}return values}
function savedAddChips(settings){const saved=Number(localStorage.getItem(addChipsKey(settings)));if(!Number.isFinite(saved)||saved<=0)return 0;const values=addChipsOptions(settings).slice(1);return values.filter(n=>n<=saved).at(-1)??values[0]??0}

function preferredBuyIn(min,max){const rate=Number(localStorage.getItem('river-default-buy-in'));return Math.max(min,Math.floor(max*(Number.isInteger(rate)&&rate>=0&&rate<=100?rate:0)/100))}

async function refreshRebuyFunding(draft=rebuyFunding){
 if(!draft||draft.loading)return;draft.loading=true;
 try{const response=await fetch('/local/wallet',{cache:'no-store'});if(rebuyFunding!==draft)return;if(response.ok){const data=await response.json();if(rebuyFunding!==draft)return;if(data.account?.toLowerCase()!==state?.names?.[draft.seat]?.toLowerCase())throw Error('Sign in with the seated account to add chips');if(!Number.isSafeInteger(data.available)||data.available<0)throw Error('Local balance is unavailable');draft.available=data.available}else if(response.status===401)draft.available=null;else throw Error('Local balance is unavailable');draft.error=''}catch(e){if(rebuyFunding===draft){draft.available=null;draft.error=e.message}}finally{draft.loading=false;draft.pending=false;if(rebuyFunding===draft){syncSeatBuyIn(true);seatBuyIn?.refreshBalance?.()}}
}
function cashBalance(){const me=state?.me,g=state?.hand;return g&&(g.dealtSeats?.includes(me)||g.cards?.[me]?.length)?g.stacks[me]:state?.waitingStacks?.[me]??state?.buyIns?.[me]??state?.settings?.stack??0}
function openAddChips(){if(rebuyFunding||!advertised||rushMode||advertised.mode==='tournament'||state?.tournament||state?.me==null||state.ready[state.me]||state.pendingAdd)return;rebuyFunding={number:state.number,seat:state.me,balance:cashBalance(),available:null,pending:true};refreshRebuyFunding()}

function syncSeatBuyIn(open=false){
 if(rebuyFunding&&(rebuyFunding.number!==state?.number||rebuyFunding.seat!==state?.me||state.ready[state.me]||state.pendingAdd||rebuyFunding.balance!==cashBalance()))rebuyFunding=null;
 const funding=rebuyFunding,offer=funding?{seat:funding.seat}:waitingState?.offer,key=funding?'add-chips:'+funding.number+':'+funding.seat:offer?offer.seat+':'+offer.expiresAt:null;
 if(seatBuyIn&&(seatBuyIn.dataset.offer!==key||!funding&&(state?.me!=null||token))){seatBuyIn.close();seatBuyIn=null}
 if(!open||!offer||seatBuyIn||funding?.pending||!funding&&(state?.me!=null||token||autoBuyInAttempt?.pending))return;
 const settings={...(state?.settings||advertised),variant:state?.settings?.variant||(['plo','plo5','plo6','shortdeck','aof'].includes(advertised?.mode)?advertised.mode:'holdem')},tableMin=settings.minBuyIn??settings.stack,tableMax=settings.maxBuyIn??settings.stack,max=funding?Math.max(0,tableMax-funding.balance):tableMax,baseMin=funding?Math.max(0,tableMin-funding.balance):tableMin,available=()=>funding?funding.available:walletAvailable;let min=baseMin;const cap=()=>funding?Math.max(0,Math.min(max,available()??max)):Math.max(min,Math.min(max,available()??max));if(funding)min=Math.min(baseMin,cap());const initial=funding?(settings.variant==='aof'?Math.max(min,Math.min(cap(),(state.buyIns?.[funding.seat]??settings.stack)-funding.balance)):min):Math.max(min,Math.min(cap(),$('buyIn').value===$('buyIn').dataset.default?preferredBuyIn(min,cap()):Number($('buyIn').value)||settings.stack));
 if(!funding&&localStorage.getItem('river-auto-buyin')==='1'&&walletAvailable!==null&&walletAvailable>=min&&autoBuyInAttempt?.key!==key){const attempt={key,pending:true};autoBuyInAttempt=attempt;operate('join',{useProfile:true,name:$('name').value,seat:offer.seat,buyIn:initial,reservation:offer.expiresAt}).then(()=>{attempt.pending=false;syncSeatBuyIn(true)});return}
 const dialog=element('dialog','seatBuyIn'),form=element('form'),title=element('h2','',(({aof:"All-In or Fold Hold'em",plo:'PLO',plo5:'PLO-5',plo6:'PLO-6',shortdeck:'Short Deck'})[settings.variant]||"Hold'em")+' '+(settings.variant==='shortdeck'?settings.blind:settings.blind/2+' / '+settings.blind)+(settings.ante?' ('+settings.ante+')':'')),label=element('label','seatBuyInField',funding?'Amount to add':'Buy-in Amount'),amount=element('input','seatBuyInAmount'),range=element('input','seatBuyInRange'),low=element('button','seatBuyInMin',String(min)),high=element('button','seatBuyInMax',String(max)),timer=element('output','seatBuyInTimer'),result=element('p','seatBuyInResult'),error=element('output','seatBuyInError'),ok=element('button','seatBuyInOk','OK'),cancel=element('button','seatBuyInCancel','Cancel'),close=element('button','seatBuyInClose','×');
 dialog.dataset.offer=key;dialog.dataset.mode=funding?'add-chips':'buy-in';dialog.setAttribute('aria-label',funding?'Add Chips':'Buy-in');form.noValidate=false;amount.type='number';amount.required=true;amount.min=range.min=String(min);amount.max=range.max=String(cap());amount.step=range.step='1';amount.value=String(initial);amount.disabled=min===max;amount.setAttribute('aria-label','Buy-in chips');range.type='range';range.value=amount.value;range.disabled=min===max;range.setAttribute('aria-label','Buy-in amount');low.type=high.type=cancel.type=close.type='button';ok.type='submit';ok.replaceChildren(element('span','','OK'));cancel.replaceChildren(element('span','','Cancel'));timer.setAttribute('role','timer');error.setAttribute('role','alert');if(autoBuyInAttempt?.key===key)error.textContent=$('error').textContent;
 const balanceRow=element('p','seatBuyInBalance'),balanceLabel=element('span','','Play Money Balance'),balanceValue=element('output','seatBuyInBalanceValue',available()===null?'Unavailable':String(available()));balanceRow.append(balanceLabel,balanceValue);const resultTitle=element('span','seatBuyInResultTitle',funding?'Add Chips:':'Buy-in:'),resultTotal=element('span','seatBuyInTotal');result.append(resultTitle,resultTotal);result.setAttribute('aria-live','polite');const track=element('span','seatBuyInTrack'),fill=element('span','seatBuyInFill');track.append(fill);low.replaceChildren(element('span','',String(min)));high.replaceChildren(element('span','',String(max)));const titleGroup=element('div','seatBuyInTitle');titleGroup.append(title);const paint=(clamp=false)=>{const ceiling=cap(),previousMin=Number(amount.min);if(funding)min=Math.min(baseMin,ceiling);amount.min=range.min=String(min);low.lastElementChild.textContent=String(min);balanceValue.textContent=available()===null?'Unavailable':String(available());if(funding?.error){error.textContent=funding.error;error.dataset.funding='true'}else if(error.dataset.funding){error.textContent='';delete error.dataset.funding}amount.max=range.max=String(ceiling);high.lastElementChild.textContent=String(ceiling);if(clamp&&(Number(amount.value)>ceiling||min>previousMin&&Number(amount.value)<min))amount.value=String(Math.max(min,Math.min(ceiling,Number(amount.value)||0)));range.value=amount.value;const ratio=ceiling>min?Math.max(0,Math.min(1,(Number(amount.value)-min)/(ceiling-min))):0;fill.hidden=ratio<=0;fill.style.width=ratio*204+'px';resultTotal.textContent=amount.value;if(dialog.dataset.busy!=='true'){amount.disabled=range.disabled=min===ceiling;low.disabled=Number(amount.value)===min;high.disabled=Number(amount.value)===ceiling;ok.disabled=!!funding?.error||available()!==null&&available()<min}};dialog.refreshBalance=()=>paint(true);amount.oninput=()=>paint();range.oninput=()=>{amount.value=String(snapBetAmount(Number(range.value),min,cap(),betIncrement(settings.blind,readBettingPreferences(localStorage.getItem('river-bet-presets')).unit,settings.variant)));paint()};low.onclick=()=>{amount.value=String(min);paint()};high.onclick=()=>{amount.value=String(cap());paint()};paint();label.append(amount);form.append(titleGroup,label,low,track,range,high,balanceRow,result,timer,error,ok,cancel,close);dialog.append(form);
 let addChipsChoice=0,addChipsMenu=null;
 if(funding){
  const row=element('div','addChipsAuto'),heading=element('span','addChipsAutoTitle','Always auto top up'),info=element('button','addChipsInfo'),help=element('div','addChipsHelp'),menu=document.createElement('details'),summary=document.createElement('summary'),list=element('div','addChipsOptions');row.append(heading,info,menu,help);menu.className='addChipsChoice';addChipsMenu=menu;menu.append(summary,list);list.setAttribute('role','listbox');list.setAttribute('aria-label','Always auto top up');summary.setAttribute('aria-label','Always auto top up');addChipsChoice=savedAddChips(settings);const caption=value=>value?value+' BB':'Off';summary.textContent=caption(addChipsChoice);
  const buttons=addChipsOptions(settings).map(value=>{const button=element('button','',caption(value));button.type='button';button.dataset.bb=String(value);button.setAttribute('role','option');button.setAttribute('aria-selected',String(value===addChipsChoice));button.onclick=()=>{addChipsChoice=value;summary.textContent=caption(value);for(const b of buttons)b.setAttribute('aria-selected',String(b===button));menu.open=false;summary.focus()};list.append(button);return button});
  menu.onkeydown=e=>{if(['ArrowUp','ArrowDown','Home','End'].includes(e.key)){e.preventDefault();menu.open=true;const current=buttons.indexOf(document.activeElement),index=e.key==='Home'?0:e.key==='End'?buttons.length-1:current<0?Math.max(0,buttons.findIndex(b=>Number(b.dataset.bb)===addChipsChoice)):Math.max(0,Math.min(buttons.length-1,current+(e.key==='ArrowDown'?1:-1)));buttons[index].focus()}};menu.ontoggle=()=>{summary.setAttribute('aria-expanded',String(menu.open));if(menu.open)list.querySelector('[aria-selected=true]')?.scrollIntoView({block:'nearest'})};
  info.type='button';info.setAttribute('aria-label','Always auto top up information');info.setAttribute('aria-expanded','false');help.hidden=true;help.setAttribute('role','note');const type=settings.variant&&settings.variant!=='holdem'?({plo:'PLO',plo5:'PLO-5',plo6:'PLO-6',shortdeck:'Short Deck',aof:'All-In or Fold'})[settings.variant]:"Hold'em "+capacity()+' Max';help.textContent='Once your stack falls below your set amount, it will be automatically topped up to match it. This setting will be applied to all '+type+' tables.';info.onclick=()=>{help.hidden=!help.hidden;info.setAttribute('aria-expanded',String(!help.hidden))};form.addEventListener('click',e=>{if(!menu.contains(e.target))menu.open=false;if(!info.contains(e.target)&&!help.contains(e.target)){help.hidden=true;info.setAttribute('aria-expanded','false')}});form.append(row);
 }
 const freeze=value=>{dialog.dataset.busy=String(value);for(const node of form.querySelectorAll('button,input'))node.disabled=value||min===cap()&&node instanceof HTMLInputElement||node===ok&&(!!funding?.error||available()!==null&&available()<min);if(addChipsMenu)addChipsMenu.inert=value;if(!value)paint()};
 const cancelOffer=async()=>{if(dialog.dataset.busy==='true')return;if(funding){rebuyFunding=null;dialog.close();return}freeze(true);await updateWaiting('cancel');if(dialog.isConnected){freeze(false);error.textContent=$('error').textContent||'Could not release seat; retry Cancel'}};
 cancel.onclick=close.onclick=cancelOffer;dialog.oncancel=e=>{e.preventDefault();if(addChipsMenu?.open){addChipsMenu.open=false;addChipsMenu.querySelector('summary').focus();return}cancelOffer()};
 const fundingChanged=()=>funding&&(rebuyFunding!==funding||funding.number!==state?.number||funding.seat!==state?.me||state.ready[state.me]||state.pendingAdd||funding.balance!==cashBalance());
 form.onsubmit=async e=>{e.preventDefault();if(dialog.dataset.busy==='true')return;const buyIn=Number(amount.value);if(!Number.isSafeInteger(buyIn)||buyIn<min||buyIn>cap()){error.textContent='Choose whole play chips within the table limits';return}if(fundingChanged()){syncSeatBuyIn(true);return}if(funding)try{localStorage.setItem(addChipsKey(settings),String(addChipsChoice))}catch{error.textContent='Could not save auto top-up preference; retry';return}freeze(true);if(funding&&!await operate('state')){if(dialog.isConnected){freeze(false);error.textContent=$('error').textContent}return}if(fundingChanged()){syncSeatBuyIn(true);if(dialog.isConnected)freeze(false);return}const accepted=funding?await operate('add-chips',{amount:buyIn,number:funding.number}):await operate('join',{useProfile:true,name:$('name').value,seat:offer.seat,buyIn,reservation:offer.expiresAt});if(accepted){if(funding&&rebuyFunding===funding)rebuyFunding=null;dialog.close();if(funding&&buyIn===0)render();else paintWaiting()}else if(dialog.isConnected){freeze(false);error.textContent=$('error').textContent}};
 const start=performance.now(),expires=funding?Infinity:start+Math.max(0,offer.expiresAt-Date.now()),deadline=Math.min(expires,start+10000),tick=()=>{if(!dialog.isConnected||funding)return;const now=performance.now(),left=Math.max(0,Math.ceil((deadline-now)/1000));const text=left+' second(s) left.';if(timer.textContent!==text)timer.textContent=text;if(now>=Math.min(deadline+1000,expires)){clearInterval(clock);cancelOffer()}},clock=funding?null:setInterval(tick,100);dialog.onclose=()=>{clearInterval(clock);dialog.remove();if(seatBuyIn===dialog)seatBuyIn=null};timer.hidden=!!funding;seatBuyIn=dialog;document.body.append(dialog);dialog.showModal();const layout=()=>{if(!dialog.isConnected)return;const contentTop=48+titleGroup.getBoundingClientRect().height+32,selectorTop=contentTop+(funding?38+20:0);if(funding){const row=form.querySelector('.addChipsAuto');row.style.top=contentTop+'px';row.querySelector('.addChipsInfo').style.left=row.querySelector('.addChipsAutoTitle').getBoundingClientRect().width+3+'px'}label.style.top=selectorTop+'px';low.style.top=high.style.top=selectorTop+56+'px';range.style.top=selectorTop+56+'px';track.style.top=selectorTop+70+'px';balanceRow.style.top=selectorTop+90+20+'px';const bottom=balanceRow.offsetTop+balanceRow.offsetHeight,block=result.offsetHeight+(funding?0:20+timer.offsetHeight),resultTop=Math.max(bottom+20,bottom+(624-114-bottom-block)/2);result.style.top=resultTop+'px';timer.style.top=resultTop+result.offsetHeight+20+'px'};layout();document.fonts.ready.then(layout);tick();(min===cap()?ok:amount).focus();
}
waitingButton.onclick=()=>updateWaiting(waitingState?.position?'cancel':'join');
function syncChatSeat(){
 if(!chatWindow||rushMode||busy)return;
 try{const parent=globalThis.opener;if(!parent||parent.closed||parent.location.origin!==location.origin||parent.location.hash!==location.hash||parent.document.documentElement.dataset.panel==='chat')return;const next=parent.sessionStorage.getItem(key);if(next===token||next!==null&&!/^[a-f0-9]{64}$/.test(next))return;if(next===null)sessionStorage.removeItem(key);else sessionStorage.setItem(key,next);token=next;state=null;render()}catch{}
}
render();async function poll(){syncChatSeat();if((token||rushMode)&&!busy)await operate('state');else if(advertised&&!busy){try{const r=await fetch('/api/rooms/'+room+'/watch',{cache:'no-store'});if(r.ok){const data=await r.json();if(!token&&!busy&&(state?.version!==data.version||!state||state.canObserveChat!==data.canObserveChat||state.observerName!==data.observerName||JSON.stringify(state?.avatars)!==JSON.stringify(data.avatars))){applyState(data)}}}catch{}}await updateWaiting();if(rebuyFunding&&!busy)await refreshRebuyFunding();setTimeout(poll,token?400:1000)}poll();

function paintGameClocks(){if(chatWindow)return;const g=state?.hand,clock=g?.clock;clockAudio.update(g,state?.me,Date.now(),localStorage.getItem('river-muted')!=='1');for(const progress of document.querySelectorAll('.nativeLimitProgress')){const ratio=Math.min(1,Math.max(0,((g?.deadline??0)-Date.now())/10000));progress.style.setProperty('--limit-ratio',ratio);progress.lastElementChild.hidden=ratio>=1}for(const node of document.querySelectorAll('.nativeGameClock')){const seat=Number(node.dataset.clockSeat),active=clock?.seat===seat&&!g.end,left=active?clock.bankEndsAt-Math.min(Date.now(),g.deadline):g?.timeBanks?.[seat]??state.settings.timeBankSeconds*1000,text=gameClockText(left);node.dataset.phase=active?clock.phase:'idle';if(node.dataset.time===text)continue;node.dataset.time=text;node.setAttribute('aria-label','Time bank '+text);for(const [i,char] of [...text].entries()){const glyph=node.children[i];glyph.style.setProperty('--clock-glyph','url("/home-art/native-reserved-clock-digit-'+(char===':'?10:char)+'.png")');glyph.style.setProperty('--clock-hot-glyph','url("/home-art/native-reserved-clock-digit-'+(char===':'?10:char)+'-hot.png")');glyph.style.width=(char===':'?4.4:13.2)/17+'cqw'}}}
setInterval(paintGameClocks,100);

window.addEventListener('resize',()=>{if(state?.hand?.end&&state.hand.canShowCards)render()});
