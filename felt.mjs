import {bestFiveFocus} from './engine/hand.mjs';
import {cardOrdinal} from './card-squeeze.mjs';
export function gameClockText(ms){const seconds=Math.max(0,Math.ceil(ms/1000));return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}
export function element(tag,cls,text){const e=document.createElement(tag);e.className=cls;if(text!==undefined)e.textContent=text;return e}
export function cards(list){return list.map(c=>{if(c===null){const back=element('span','back');back.setAttribute('role','img');back.setAttribute('aria-label','Hidden card');return back}const rank=c[0]==='T'?'10':c[0],suit=({h:'♥',s:'♠',c:'♣',d:'♦'})[c[1]],e=element('span','card'+('dh'.includes(c[1])?' red':''),rank);e.append(element('i','',suit));e.style.setProperty('--face-x',('23456789TJQKA'.indexOf(c[0])*100/12)+'%');e.style.setProperty('--face-y',('cdhs'.indexOf(c[1])*100/3)+'%');e.setAttribute('role','img');e.setAttribute('aria-label',rank+' of '+({h:'hearts',s:'spades',c:'clubs',d:'diamonds'})[c[1]]);return e})}

const probe=new Image();
probe.onload=()=>document.documentElement.classList.add('localDeck');
probe.src='/home-art/local-card-faces.png';

// Preserve mounted artwork and focus while applying freshly rendered state.
export function updateElement(current,fresh){
 if(current.nodeType!==fresh.nodeType||current.nodeName!==fresh.nodeName||current.nodeType===1&&current.dataset.renderKey!==fresh.dataset.renderKey){current.replaceWith(fresh);return fresh}
 if(current.nodeType===3){if(current.data!==fresh.data)current.data=fresh.data;return current}
 if(current.nodeType!==1)return current;
 for(const attr of [...current.attributes])if(!fresh.hasAttribute(attr.name))current.removeAttribute(attr.name);
 for(const attr of fresh.attributes)if(current.getAttribute(attr.name)!==attr.value)current.setAttribute(attr.name,attr.value);
 current.onclick=fresh.onclick;
 const children=[...fresh.childNodes];
 children.forEach((child,i)=>{if(current.childNodes[i])updateElement(current.childNodes[i],child);else current.append(child)});
 while(current.childNodes.length>children.length)current.lastChild.remove();
 for(const animation of fresh.getAnimations())animation.cancel();
 return current;
}

export function avatarSource(value){return typeof value==='string'&&/^\/local\/avatar-images\/[a-f0-9]{64}\.png$/.test(value)?value:'/home-art/avatar-'+(Number.isInteger(value)&&value>=0&&value<=6?value:0)+'.png'}

export const tableThemes=[{"id":"default","label":"Current green table","image":"/home-art/green-felt.png"},{"id":"coloredbg-black","label":"Black background","image":"/home-art/native-theme-coloredbg-black.png"},{"id":"coloredbg-brown","label":"Brown background","image":"/home-art/native-theme-coloredbg-brown.png"},{"id":"coloredbg-chocobrown","label":"Choco Brown background","image":"/home-art/native-theme-coloredbg-chocobrown.png"},{"id":"coloredbg-cobalt","label":"Cobalt background","image":"/home-art/native-theme-coloredbg-cobalt.png"},{"id":"coloredbg-cooper","label":"Cooper background","image":"/home-art/native-theme-coloredbg-cooper.png"},{"id":"coloredbg-gray","label":"Gray background","image":"/home-art/native-theme-coloredbg-gray.png"},{"id":"coloredbg-green","label":"Green background","image":"/home-art/native-theme-coloredbg-green.png"},{"id":"coloredbg-navy","label":"Navy background","image":"/home-art/native-theme-coloredbg-navy.png"},{"id":"coloredbg-purple","label":"Purple background","image":"/home-art/native-theme-coloredbg-purple.png"},{"id":"coloredbg-red","label":"Red background","image":"/home-art/native-theme-coloredbg-red.png"},{"id":"theme-amazon","label":"Amazon","image":"/home-art/native-theme-theme-amazon.png"},{"id":"theme-coralreef","label":"Coral Reef","image":"/home-art/native-theme-theme-coralreef.png"},{"id":"theme-desert","label":"Desert","image":"/home-art/native-theme-theme-desert.png"},{"id":"theme-frozen","label":"Frozen","image":"/home-art/native-theme-theme-frozen.png"},{"id":"theme-himalayancliff","label":"Himalayan Cliff","image":"/home-art/native-theme-theme-himalayancliff.png"},{"id":"theme-neotokyo","label":"Neo Tokyo","image":"/home-art/native-theme-theme-neotokyo.png"},{"id":"theme-ocean","label":"Ocean","image":"/home-art/native-theme-theme-ocean.png"},{"id":"theme-springblossom","label":"Spring Blossom","image":"/home-art/native-theme-theme-springblossom.png"},{"id":"theme-summerbay","label":"Summer Bay","image":"/home-art/native-theme-theme-summerbay.png"},{"id":"theme-western","label":"Western","image":"/home-art/native-theme-theme-western.png"}];
export function tableTheme(id){return tableThemes.find(t=>t.id===id)||tableThemes[0]}
export const feltColours=[['default','Default',null],['green','Green',1146647],['cobalt-blue','Cobalt blue',2372480],['cyan','Cyan',29055],['aqua-blue','Aqua blue',3847167],['gray','Grey',5395287],['black','Black',3421236],['red','Red',9966353],['purple','Purple',6828656],['brown','Brown',9722923]].map(([id,label,value])=>({id,label,value}));
export function feltColour(id){return feltColours.find(c=>c.id===id)||feltColours[0]}
// Native normal-table compositor: 1410×668 colour layer centered in its 1700×1200 viewport.
export function tableSurface(themeId,colourId,variant='holdem'){const theme=tableTheme(themeId),colour=feltColour(colourId),image=theme.id==='default'&&(colour.value!==null||variant==='plo')?tableTheme('coloredbg-black').image:theme.image,value='#'+(colour.value??(variant==='plo'?2060483:1146647)).toString(16).padStart(6,'0');return {theme,colour,image,underlay:'linear-gradient('+value+','+value+') center/82.941176% 55.666667% no-repeat #17171b'}}
export function tablePreference(key){const room=location.hash.slice(1);return (/^[a-f0-9]{48}$/.test(room)?localStorage.getItem(key+':'+room):null)??localStorage.getItem(key)}
let themeRequest=0;
export async function applyTableTheme(){
 const felt=document.querySelector('.felt');if(!felt)return;
 const request=++themeRequest,surface=tableSurface(tablePreference('river-table-theme'),tablePreference('river-felt-colour'),felt.dataset.variant),image=new Image();image.src=surface.image;
 try{await image.decode();if(request===themeRequest){felt.style.background='url("'+image.src+'") center/100% 100% no-repeat,'+surface.underlay;felt.dataset.theme=surface.theme.id;felt.dataset.feltColour=surface.colour.id;return true}}catch{}return false;
}
applyTableTheme();addEventListener('storage',e=>{if(e.storageArea===localStorage&&(e.key===null||['river-table-theme','river-felt-colour'].some(key=>e.key===key||e.key===key+':'+location.hash.slice(1))))applyTableTheme()});

export const cardBacks=[{"id":"red-pattern","label":"Red pattern","image":"/home-art/native-card-back-red-pattern.png"},{"id":"red-plain","label":"Plain red","image":"/home-art/native-card-back-red-plain.png"},{"id":"gg-gray","label":"GG grey","image":"/home-art/native-card-back-gg-gray.png"},{"id":"black-pattern","label":"Black pattern","image":"/home-art/native-card-back-black-pattern.png"},{"id":"gray-pattern","label":"Grey pattern","image":"/home-art/native-card-back-gray-pattern.png"},{"id":"blue-pattern","label":"Blue pattern","image":"/home-art/native-card-back-blue-pattern.png"},{"id":"pink-pattern","label":"Pink pattern","image":"/home-art/native-card-back-pink-pattern.png"},{"id":"orange-pattern","label":"Orange pattern","image":"/home-art/native-card-back-orange-pattern.png"},{"id":"green-pattern","label":"Green pattern","image":"/home-art/native-card-back-green-pattern.png"}];
export function cardBack(id){return cardBacks.find(c=>c.id===id)||cardBacks[0]}
let cardBackRequest=0;
export async function applyCardBack(){const request=++cardBackRequest,back=cardBack(localStorage.getItem('river-card-back')),image=new Image();image.src=back.image;try{await image.decode();if(request===cardBackRequest){document.documentElement.style.setProperty('--card-back-image','url("'+image.src+'")');document.documentElement.dataset.cardBack=back.id;return true}}catch{}return false}
applyCardBack();addEventListener('storage',e=>{if(e.storageArea===localStorage&&(e.key===null||e.key==='river-card-back'))applyCardBack()});

export const cardFronts=[['classic','Classic'],['classic-four-colour','Classic four colours'],['two-colour','Two colours'],['four-colour','Four colours'],['filled','Filled'],['gold','Gold']].map(([id,label])=>({id,label,image:'/home-art/native-card-faces-'+id+'.png'}));
export function cardFront(id){return cardFronts.find(c=>c.id===id)||cardFronts.find(c=>c.id==='two-colour')}
let cardFrontRequest=0;
export async function applyCardFront(){const request=++cardFrontRequest,front=cardFront(localStorage.getItem('river-card-front')),image=new Image();image.src=front.image;try{await image.decode();if(request===cardFrontRequest){document.documentElement.style.setProperty('--card-front-image','url("'+image.src+'")');document.documentElement.dataset.cardFront=front.id;document.documentElement.classList.add('localDeck');return true}}catch{}return false}
applyCardFront();addEventListener('storage',e=>{if(e.storageArea===localStorage&&(e.key===null||e.key==='river-card-front'))applyCardFront()});

// HoleCard3D refreshCardPosition and PlayerCell3D's1.1 card scale, in native table units.
export function holeCardLayout(count){
 if(![2,4,5,6].includes(count))throw new RangeError('Unsupported hole-card count');
 const radius=count>=5?250:400,step=(count>=5?17:10)/(count/2),scale=1.1*(count>2?.84:1),width=122*scale,height=162*scale;
 return {lift:count===2?60.5:33,foldLift:count===2?38.5:11,cards:Array.from({length:count},(_,i)=>{const angle=step*(i-(count-1)/2),a=angle*Math.PI/180;return {x:1.1*radius*Math.sin(a)-width/2,y:30+1.1*radius*(1-Math.cos(a))+(count===2?27.5:0)-height/2,width,height,angle,focusX:30*scale*Math.sin(a),focusY:-30*scale*Math.cos(a)}})};
}

export function historyCardLayout(input){
 if(input==null)return {cards:[]};if(!Array.isArray(input)||![2,4,5,6].includes(input.length)||new Set(input.filter(c=>c!==null)).size!==input.filter(c=>c!==null).length)throw Error('Invalid history card count');
 const count=input.length,gap=count===5?16:count===6?14:22;for(const card of input)if(card!==null)cardOrdinal(card);
 return {x:count===2?21:count===5?2:1,width:46*.64*.7,height:66*.64*.7,cards:input.flatMap((card,i)=>card===null?[]:[{card,x:i*gap}])};
}

export function hudCardLayout(input){
 if(!Array.isArray(input)||![2,4,5,6].includes(input.length)||new Set(input.filter(c=>c!==null)).size!==input.filter(c=>c!==null).length)throw Error('Invalid HUD card count');
 const sorted=input.map(card=>({card,ordinal:card===null?-1:cardOrdinal(card)})).sort((a,b)=>Math.floor(b.ordinal/4)-Math.floor(a.ordinal/4)||'sdhc'.indexOf(a.card?.[1])-'sdhc'.indexOf(b.card?.[1])),count=sorted.length,width=46*.64,height=66*.64;
 const [gap,scale,angles,offsets]=count===2?[18,.65,[-4,4],[0,0]]:count===4?[14,.62,[-8,-4,4,8],[2,0,0,2]]:count===5?[13,.58,[-8,-4,0,4,8],[2.5,1,0,1,2.5]]:[11,.54,[-8,-4,0,0,4,8],[3,1,0,0,1,3]];
 const poses=sorted.map(({card},i)=>{const width=(card===null?49:46)*.64,a=angles[i]*Math.PI/180,boundWidth=scale*(width*Math.cos(a)+height*Math.abs(Math.sin(a))),center=i*gap+width*scale/2;return {card,width,x:i*gap+(scale-1)*width/2,y:offsets[i]+(scale-1)*height/2,angle:angles[i],scale,minX:center-boundWidth/2,maxX:center+boundWidth/2}}),span=Math.max(...poses.map(c=>c.maxX))-Math.min(...poses.map(c=>c.minX));
 return {width,height,span,containerX:42-span,containerY:6,cards:poses};
}

export function voluntaryCardPose(count,index){
 const base=holeCardLayout(count).cards[index];if(!Number.isInteger(index)||!base)throw new RangeError('Invalid shown card index');
 const offsets=count===2?[[-94,-18,-15],[-5,19,14]]:count===4?[[-94,-18,-15],[-33,-10,4],[35,26,-4],[89,2,20]]:count===5?[[-124,-18,-15],[-63,-10,4],[5,26,-4],[59,2,15],[132,-7,22]]:[[-144,-18,-15],[-83,-10,4],[-15,26,-4],[39,2,15],[112,-7,10],[169,-13,22]];
 const [x,y,angle]=offsets[index];return {x:921+x,y:745+y,angle,width:base.width*1.1,height:base.height*1.1};
}
export function voluntaryCardFrames(from,to){
 return Array.from({length:61},(_,i)=>{const t=i/60,back=t*t*(2.70158*t-1.70158),turn=t<.5?t*2:1-(1-(t-.5)*2)**3,angle=t<.5?from.angle+(to.angle-50-from.angle)*turn:to.angle-50+50*turn;return {offset:t,left:(from.x+(to.x-from.x)*back)/17+'cqw',top:(from.y+(to.y-from.y)*back)/17+'cqw',transform:'translate(-50%,-50%) rotate('+angle+'deg)'}});
}

export function remoteVoluntaryFrames(){return Array.from({length:61},(_,i)=>({offset:i/60,scale:Math.abs(2*(i/60)**3-1)+' 1'}))}

export function historyWinningCards(hole,board,shortDeck=false){
 let focus;try{focus=bestFiveFocus(hole,board,shortDeck)}catch{return null}
 const selected=[...focus.hole.map(i=>({card:hole[i],hole:true})),...focus.board.map(i=>({card:board[i],hole:false}))],ranks='23456789TJQKA',groups=new Map();
 for(const item of selected){const rank=item.card[0];if(!groups.has(rank))groups.set(rank,[]);groups.get(rank).push(item)}
 const ordered=[...groups.values()].sort((a,b)=>b.length-a.length||ranks.indexOf(b[0].card[0])-ranks.indexOf(a[0].card[0])).flatMap(group=>group.sort((a,b)=>'sdhc'.indexOf(a.card[1])-'sdhc'.indexOf(b.card[1])));
 if(ordered.map(c=>c.card[0]).join('')===(shortDeck?'A9876':'A5432'))ordered.push(ordered.shift());return ordered;
}
export function historyActionColumns(hand){
 const n=hand?.names?.length,trace=hand?.historyTrace,opening=trace?.opening,stages=[0,3,4,5],money=a=>Array.isArray(a)&&a.length===n&&a.every(v=>Number.isSafeInteger(v)&&v>=0),sum=a=>a.reduce((a,b)=>a+b,0);
 if(!Number.isInteger(n)||n<2||n>10||!['holdem','rush','plo','plo5','plo6','shortdeck','aof'].includes(hand.variant)||!hand.names.every(v=>v===null||typeof v==='string')||!Array.isArray(hand.dealtSeats)||hand.dealtSeats.length!==n||!hand.dealtSeats.every(v=>typeof v==='boolean')||!Array.isArray(hand.folded)||hand.folded.length!==n||!hand.folded.every(v=>typeof v==='boolean')||!Number.isInteger(hand.button)||hand.button<0||hand.button>=n||!hand.dealtSeats[hand.button]||![hand.initialStacks,hand.committed,hand.payouts,hand.returns,hand.stacks,opening?.bets,opening?.committed,opening?.stacks].every(money)||!Array.isArray(trace?.actions)||!Array.isArray(hand.history)||trace.actions.length!==hand.history.length||!Array.isArray(hand.board)||!stages.includes(hand.board.length))return null;
 if(!Number.isSafeInteger(sum(hand.initialStacks))||opening.bets.some((v,i)=>v>opening.committed[i]||!hand.dealtSeats[i]&&opening.committed[i]>0)||opening.stacks.some((v,i)=>v+opening.committed[i]!==hand.initialStacks[i])||hand.returns.some((v,i)=>v>hand.payouts[i]||v>hand.committed[i]))return null;
 const columns=['Blinds (Ante)','Pre-Flop','Flop','Turn','River'].map((title,i)=>({title,street:i?stages[i-1]:null,amount:null,rows:[]})),active=Array.from({length:n},(_,i)=>(hand.button+i)%n).filter(i=>hand.dealtSeats[i]);if(active.length<2||active.some(i=>!hand.names[i]))return null;
 if(hand.variant!=='shortdeck'&&active.length>2)active.push(active.shift());
 const ante=active.reduce((total,seat)=>total+opening.committed[seat]-opening.bets[seat],0);if(ante)columns[0].rows.push({kind:'post',seat:null,action:'ante',amount:ante,allIn:false});
 for(const seat of active)if(opening.bets[seat])columns[0].rows.push({kind:'post',seat,action:hand.variant==='shortdeck'?'buttonblind':seat===active[0]?'smallblind':'bigblind',amount:opening.bets[seat],allIn:opening.stacks[seat]===0});
 const actionRows=[],committed=[...opening.committed],stacks=[...opening.stacks],bets=[...opening.bets],folded=hand.dealtSeats.map(v=>!v),lastPaid=Array(n).fill(0),paidByStreet=Array(4).fill(0);let street=0,pot=sum(committed);
 for(let index=0;index<trace.actions.length;index++){
  const event=trace.actions[index],seat=event?.seat,stage=stages.indexOf(event?.street);
  if(!Number.isInteger(seat)||seat<0||seat>=n||folded[seat]||stacks[seat]<=0||stage<0||event.street<street||event.street>hand.board.length||!['fold','check','call','raise'].includes(event.action)||!['paid','bet','stack','pot'].every(k=>Number.isSafeInteger(event[k])&&event[k]>=0)||typeof event.allIn!=='boolean')return null;
  if(event.street!==street){bets.fill(0);street=event.street}
  if(event.paid>stacks[seat]||event.stack!==stacks[seat]-event.paid||event.bet!==bets[seat]+event.paid||event.pot!==pot+event.paid||event.allIn!==(event.paid>0&&event.stack===0)||(['fold','check'].includes(event.action)?event.paid!==0:event.paid===0))return null;
  const text='Seat '+(seat+1)+': '+event.action+(event.action==='raise'?' to '+event.bet:event.action==='call'?' '+event.paid:'');if(hand.history[index]!==text)return null;
  const displayAction=event.action==='raise'&&event.street>0&&Math.max(...bets)===0?'bet':event.action;committed[seat]+=event.paid;stacks[seat]=event.stack;bets[seat]=event.bet;pot=event.pot;if(event.action==='fold')folded[seat]=true;if(event.paid)lastPaid[seat]=stage;paidByStreet[stage]+=event.paid;const row={...event,displayAction,kind:'action',amount:event.action==='raise'?event.bet:event.paid};columns[stage+1].rows.push(row);actionRows.push(row);
 }
 if(committed.some((v,i)=>v!==hand.committed[i]||stacks[i]+hand.payouts[i]!==hand.stacks[i]||folded[i]!==hand.folded[i]||folded[i]&&hand.payouts[i]>hand.returns[i]))return null;
 const returned=Array(4).fill(0);hand.returns.forEach((amount,seat)=>{if(amount){const stage=lastPaid[seat];returned[stage]+=amount;columns[stage+1].rows.push({kind:'return',seat,amount})}});
 let startingPot=sum(opening.committed);for(let i=0;i<4;i++){columns[i+1].amount=startingPot;startingPot+=paidByStreet[i]-returned[i]}
 if(startingPot!==sum(hand.payouts)-sum(hand.returns))return null;
 for(const event of Array.isArray(hand.historyEvents)?hand.historyEvents:[]){

  if(event?.type==='reaction'){
   const seat=event.seat,anchor=event.afterAction,stage=stages.indexOf(event.street);
   if(!Number.isInteger(seat)||seat<0||seat>=n||!hand.dealtSeats[seat]||!Number.isInteger(anchor)||anchor<0||anchor>trace.actions.length||stage<0||event.street>hand.board.length||event.street<(trace.actions[anchor-1]?.street??0)||event.street>(trace.actions[anchor]?.street??hand.board.length)||!Number.isInteger(event.reaction)||![1,2,3].includes(event.reaction))continue;
   const rows=columns[stage+1].rows,next=actionRows.find((row,i)=>i>=anchor&&row.street===event.street),at=next?rows.indexOf(next):rows.length;rows.splice(at,0,{kind:'reaction',seat,reaction:event.reaction});continue;
  }
  const seat=event?.seat,hole=hand.cards?.[seat],indices=event?.indices;
  if(event?.type!=='show-cards'||!Number.isInteger(seat)||seat<0||seat>=n||!hand.dealtSeats[seat]||event.street!==hand.board.length||event.afterAction!==hand.history.length||!Array.isArray(hole)||hole.length!==({plo:4,plo5:5,plo6:6}[hand.variant]||2)||!Array.isArray(indices)||!indices.length||new Set(indices).size!==indices.length||!indices.every(i=>Number.isInteger(i)&&i>=0&&i<hole.length&&/^[2-9TJQKA][cdhs]$/.test(hole[i])))continue;
  columns[stages.indexOf(event.street)+1].rows.push({kind:'show-cards',seat,cards:hole.map((card,i)=>indices.includes(i)?card:null)});
 }
 hand.payouts.forEach((paid,seat)=>{const amount=paid-hand.returns[seat];if(amount)columns[stages.indexOf(hand.board.length)+1].rows.push({kind:'win',seat,amount})});return columns;
}
export function historyHiddenPlayers(hand){
 const n=hand?.names?.length,active=hand?.dealtSeats,hero=hand?.viewerSeat===undefined?hand?.seat:hand.viewerSeat;
 if(!Number.isInteger(n)||n<2||n>10||!['holdem','rush','plo','plo5','plo6','shortdeck','aof'].includes(hand.variant)||!Array.isArray(active)||active.length!==n||!active.every(v=>typeof v==='boolean')||!Number.isInteger(hero)||hero< -1||hero>=n||!Number.isInteger(hand.button)||hand.button<0||hand.button>=n||!active[hand.button]||!hand.names.every(v=>v===null||typeof v==='string'))return null;
 const seats=Array.from({length:n},(_,i)=>(hand.button+i)%n).filter(i=>active[i]);if(seats.length<2)return null;
 const buttonBlind=hand.variant==='shortdeck';if(!buttonBlind&&seats.length>2)seats.push(seats.shift());
 const maps=buttonBlind?[['BTN','UTG'],['BTN','UTG','CO'],['BTN','UTG','MP','CO'],['BTN','UTG','UTG1','MP','CO'],['BTN','UTG','UTG1','MP','MP1','CO'],['BTN','UTG','UTG1','UTG2','MP','MP1','CO'],['BTN','UTG','UTG1','UTG2','MP','MP1','MP2','CO'],['BTN','UTG','UTG1','UTG2','UTG3','MP','MP1','MP2','CO'],['BTN','UTG','UTG1','UTG2','UTG3','MP','MP1','MP2','MP3','CO']]:[['SB','BB'],['SB','BB','BTN'],['SB','BB','CO','BTN'],['SB','BB','UTG','CO','BTN'],['SB','BB','UTG','MP','CO','BTN'],['SB','BB','UTG','UTG1','MP','CO','BTN'],['SB','BB','UTG','UTG1','MP','MP1','CO','BTN'],['SB','BB','UTG','UTG1','MP','MP1','MP2','CO','BTN'],['SB','BB','UTG','UTG1','UTG2','MP','MP1','MP2','CO','BTN']];
 const colors={'SB': '#5d6b36', 'BB': '#33563b', 'BTN': '#3d291d', 'UTG': '#265257', 'UTG1': '#265257', 'UTG2': '#265257', 'UTG3': '#265257', 'MP': '#2c3751', 'MP1': '#2c3751', 'MP2': '#2c3751', 'MP3': '#2c3751', 'CO': '#705712', 'Sitting Out': '#1f1f1f', 'Hero': '#762020'};
 return hand.names.map((name,i)=>{if(!name)return null;const label=i===hero?'Hero':active[i]?maps[seats.length-2][seats.indexOf(i)]:'Sitting Out';return {label,color:colors[label],bold:label==='Hero'}});
}
export function historyPreviewLayout(hand){
 const variant=hand?.mode==='rush'&&hand.variant==='rush'?'holdem':hand?.variant,count=6,hero=hand?.viewerSeat===undefined?hand?.seat:hand.viewerSeat;if(!Number.isInteger(hero)||hero<0||hero>=count)return null;if(!(hand?.mode==='cash'||hand?.mode==='rush'&&['holdem','plo'].includes(variant))||!['holdem','shortdeck','plo','plo5','plo6'].includes(variant)||hand.names?.length!==count||!Number.isInteger(hand.seat)||hand.seat<0||hand.seat>=count||!Number.isInteger(hand.button)||hand.button<0||hand.button>=count||![hand.initialStacks,hand.folded,hand.committed,hand.payouts,hand.returns,hand.cards].every(a=>Array.isArray(a)&&a.length===count)||!Array.isArray(hand.board)||![0,3,4,5].includes(hand.board.length))return null;
 if(![hand.initialStacks,hand.committed,hand.payouts,hand.returns].every(a=>a.every(n=>Number.isSafeInteger(n)&&n>=0))||!hand.folded.every(v=>typeof v==='boolean'))return null;
 const holeCount=({holdem:2,shortdeck:2,plo:4,plo5:5,plo6:6})[variant];
 const validCard=c=>typeof c==='string'&&(variant==='shortdeck'?/^[6-9TJQKA][cdhs]$/:/^[2-9TJQKA][cdhs]$/).test(c);
 if(!hand.names.every(n=>n===null||typeof n==='string')||!hand.cards.every(h=>h===null||Array.isArray(h)&&h.length===holeCount&&h.every(c=>c===null||validCard(c)))||!hand.board.every(validCard))return null;
 const many=holeCount>2,scale=many?.84*.45:.45,gap=many?(holeCount>=5?90:80)*.45/(holeCount/2):36;
 const holeLayout=folded=>({width:122*scale,height:162*scale,mask:many?{x:-19.5,y:-11,width:135,height:81}:null,cards:Array.from({length:holeCount},(_,i)=>({x:(many?67.5:48)+(i-(holeCount-1)/2)*gap,y:many?(folded?67:57):42.5}))});
 const positions=[[320,395],[65,310],[65,130],[320,65],[575,130],[575,310]],buttons=[[269,324],[136,306],[101,202],[277,136],[541,202],[504,306]],players=[];
 for(let pos=0;pos<count;pos++){const seat=(hero+pos)%count;if(!hand.names[seat]||!hand.initialStacks[seat])continue;const [x,y]=positions[pos];players.push({seat,x,y,name:hand.names[seat],avatar:hand.avatars?.[seat],folded:hand.folded[seat],hole:hand.cards[seat],holeLayout:holeLayout(hand.folded[seat]),focus:!hand.folded[seat]&&hand.board.length===5&&hand.cards[seat]?.length===holeCount&&hand.cards[seat].every(Boolean)?bestFiveFocus(hand.cards[seat],hand.board,variant==='shortdeck'):null,balance:Math.max(0,hand.initialStacks[seat]-hand.committed[seat]+hand.returns[seat]),winner:hand.payouts[seat]>hand.returns[seat]})}
 return {ownSeat:hero,theme:hand.mode==='rush'?'rush-'+variant:variant,gameName:({holdem:'Hold’em',shortdeck:'Short Deck',plo:'Omaha',plo5:'5-card Omaha',plo6:'6-card Omaha'})[variant],players,dealer:buttons[(hand.button-hero+count)%count],board:{x:202,y:222.5,gap:59,width:61,height:81},totalPot:hand.payouts.reduce((sum,n,i)=>sum+n-hand.returns[i],0)};
}
