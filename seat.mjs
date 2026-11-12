import {element,cards} from './felt.mjs';
import {startHand,act,options,nextDealer} from './engine/table.mjs';
const $=s=>document.querySelector(s),auth=await fetch('/local/me');
if(!auth.ok){location.replace('/launch.html');throw Error('Local login required')}
const {name}=await auth.json(),id=new URLSearchParams(location.search).get('table')==='1'?1:0,title=['Green Felt','Blue Felt'][id],key=JSON.stringify(['local-hand',name,id]);let g=JSON.parse(sessionStorage.getItem(key)||'null');
$('h1').textContent=title+' · No-limit Hold’em · 2 / 4';
const seats=Array.from({length:4},(_,i)=>{const e=document.createElement('div');e.className='seat s'+i;$('.felt').append(e);return e});
function takeSeat(){if(g)return;g=startHand([100,160,240,200],4,0);render()}
function button(label,fn){const b=document.createElement('button');b.textContent=label;b.onclick=fn;$('#actions').append(b)}
const historyKey=JSON.stringify(['completed-hands',name,id]);
function showCompleted(){
 const records=JSON.parse(localStorage.getItem(historyKey)||'[]');
 if(g?.end&&!records.some(r=>r.id===g.recordId)){
  records.unshift({id:g.recordId,number:g.handNumber||1,at:Date.now(),board:[...g.board],actions:[...g.history],committed:[...g.committed],paid:[...g.end.payouts],returned:[...g.end.returns],stacks:[...g.stacks]});
  records.length=Math.min(records.length,20);localStorage.setItem(historyKey,JSON.stringify(records));
 }
 $('#pastHands summary').textContent='Completed hands ('+records.length+')';
 $('#records').replaceChildren(...records.map(r=>{
  const row=document.createElement('details'),heading=document.createElement('summary'),body=document.createElement('div');
  heading.textContent='Hand '+r.number+' · '+new Date(r.at).toLocaleString()+' · Pot '+r.committed.reduce((a,b)=>a+b,0);
  const lines=['Board: '+(r.board.join(' ')||'No community cards'),...r.actions,...r.stacks.map((stack,i)=>(i?'Computer '+i:name)+': won '+(r.paid[i]-r.returned[i])+', returned '+r.returned[i]+', final stack '+stack)];
  for(const text of lines){const p=document.createElement('p');p.textContent=text;body.append(p)}
  row.append(heading,body);return row
 }))
}
function render(){
 while(g&&!g.end&&g.turn!==0){const o=options(g);act(g,o.due?'call':'check')}
 $('h1').textContent=title+' · No-limit Hold’em · 2 / 4'+(g?' · Hand '+(g.handNumber||1):'');
 if(g){g.recordId??=crypto.randomUUID();sessionStorage.setItem(key,JSON.stringify(g))}
 showCompleted();
 $('#actions').replaceChildren();$('#board').replaceChildren(...cards(g?.board||[]));$('#pot').textContent=g?'Pot · '+g.committed.reduce((a,b)=>a+b,0):'Four seats · play money';
 document.querySelectorAll('.wager').forEach(e=>e.remove());
 seats.forEach((s,i)=>{
  const who=i?'Computer '+i:g?name:'Open seat',portrait=element('div','portrait',i?'♠♣♦'[i-1]:g?name.slice(0,1).toUpperCase():'+'),plate=element('div','plate',who);
  s.classList.toggle('folded',!!g?.folded[i]);s.classList.toggle('winner',Boolean(g?.end&&g.end.payouts[i]>g.end.returns[i]));
  plate.append(element('span','stack',g?g.stacks[i]+' chips':i?[0,160,240,200][i]+' chips':'Take seat · 100 chips'));s.replaceChildren(portrait,plate);
  if(!g){if(!i){const b=element('button','seatJoin','Take this seat');b.onclick=takeSeat;s.append(b)}return}
  const c=element('div','cards');if(!i||g.end&&!g.folded[i]&&g.folded.filter(f=>!f).length>1)c.append(...cards(g.hands[i]));else if(!g.folded[i])c.append(element('span','back'),element('span','back'));s.append(c);
  if(g.button===i){const d=element('span','dealer');d.setAttribute('aria-label','Dealer');s.append(d)}
  if(!g.end&&g.bets[i]){const w=element('div','wager w'+i),img=new Image();img.src='/home-art/bet-stack.png';img.alt='';w.append(img,document.createTextNode(g.bets[i]));$('.felt').append(w)}
 });
 const h=$('#currentActions');h.replaceChildren(...(g?.history||[]).map(x=>{const li=document.createElement('li');li.textContent=x;return li}));
 if(!g){$('#status').textContent='Seat 1 is open · buy-in: 100 practice chips';button('Take seat 1',takeSeat);return}
 if(g.end){$('#status').textContent='Hand settled · '+g.end.payouts.flatMap((v,i)=>v?[(i?'Computer '+i:name)+' receives '+v]:[]).join(', ');if(g.stacks[0]>0&&g.stacks.filter(Boolean).length>1)button('Deal next hand',()=>{
   const handNumber=(g.handNumber||1)+1;
   g=startHand(g.stacks,g.blind,nextDealer(g.stacks,g));g.handNumber=handNumber;render()
 });else $('#status').append(g.stacks[0]===0?' · Out of chips. Leave to buy in again.':' · You have all the chips.');
 button('Leave seat',()=>{g=null;sessionStorage.removeItem(key);render()});return}
 $('#status').textContent='Your turn';const o=options(g),play=(a,v)=>{act(g,a,v);render()};button(o.due?'Call '+o.call:'Check',()=>play(o.due?'call':'check'));if(o.due)button('Fold',()=>play('fold'));if(o.raise){const n=document.createElement('input');Object.assign(n,{type:'number',min:o.min,max:o.max,value:o.min,required:true});n.setAttribute('aria-label','Bet total');const slider=document.createElement('input');Object.assign(slider,{type:'range',min:o.min,max:o.max,value:o.min,step:1});slider.setAttribute('aria-label','Adjust bet total');slider.oninput=()=>n.value=slider.value;n.oninput=()=>{if(n.validity.valid)slider.value=n.value};$('#actions').append(slider,n);button('Bet / raise',()=>{if(n.reportValidity())play('raise',n.valueAsNumber)});button('All in',()=>play('raise',o.max))}
}render();
