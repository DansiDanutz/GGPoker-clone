import {startHand,act,options} from './engine/table.mjs';
const el=id=>document.getElementById(id);
let g,button=3;
function deal(){button=(button+1)%4;g=startHand([100,160,240,200],4,button);render()}
function play(action,to){act(g,action,to);render()}
function control(label,fn){const b=document.createElement('button');b.textContent=label;b.onclick=fn;el('actions').append(b)}
function list(id,lines){el(id).replaceChildren(...lines.map(s=>{const li=document.createElement('li');li.textContent=s;return li}))}
function render(){
  while(!g.end&&g.turn!==0){
    const o=options(g),r=Math.random();
    if(o.raise&&r<0.14)act(g,'raise',Math.min(o.max,o.min+4*Math.floor(Math.random()*4)));
    else act(g,o.due?(r>.87?'fold':'call'):'check');
  }
  el('board').textContent='Board: '+(g.board.join(' ')||'Preflop');
  list('seats',g.stacks.map((s,i)=>(i?'Computer':'You')+(i===g.button?' · Button':'')+' · '+s+' chips · '+g.committed[i]+' contributed'+(g.folded[i]?' · Folded':!g.end&&!s?' · All in':'')+(!i||(g.end&&!g.folded[i]&&g.folded.filter(f=>!f).length>1)?' · '+g.hands[i].join(' '):'')));
  list('history',g.history);el('actions').replaceChildren();
  if(g.end){el('status').textContent=g.end.payouts.map((v,i)=>v?'Seat '+(i+1)+' won '+(v-g.end.returns[i])+(g.end.returns[i]?' · '+g.end.returns[i]+' uncalled returned':''):'').filter(Boolean).join('; ');control('New practice hand',deal);return}
  const o=options(g);el('status').textContent='Your turn · Pot '+g.committed.reduce((a,b)=>a+b,0);
  control(o.due?'Call '+o.call:'Check',()=>play(o.due?'call':'check'));if(o.due)control('Fold',()=>play('fold'));
  if(o.raise){const label=document.createElement('label'),n=document.createElement('input');label.textContent='Bet total this street ';n.type='number';n.min=o.min;n.max=o.max;n.step=1;n.value=o.min;n.required=true;label.append(n);el('actions').append(label);control('Bet / raise',()=>{if(n.reportValidity())play('raise',n.valueAsNumber)});control('All in',()=>play('raise',o.max))}
}
deal();
