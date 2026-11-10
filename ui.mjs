import {act,deal,moves} from './game.mjs';
const $=id=>document.getElementById(id);let config={stack:200,blind:4};
try{const c=JSON.parse(localStorage.getItem('river-table'));if(c){deal(c.stack,c.blind);config=c}}catch{}
const tableId=new URLSearchParams(location.search).get('table');
if(tableId){$('settings').closest('details').hidden=true;const a=document.createElement('a');a.href='/';a.textContent='← Lobby';a.style.color='#eaca8a';document.querySelector('main').prepend(a)}
let g,button=1; $('stack').value=config.stack;$('blind').value=config.blind;
$('settings').onsubmit=e=>{e.preventDefault();try{const stack=+$('stack').value,blind=+$('blind').value;deal(stack,blind);localStorage.setItem('river-table',JSON.stringify({stack,blind}));config={stack,blind};$('notice').textContent='Saved for the next hand.'}catch{$('notice').textContent='Use an even blind and a buy-in of at least four big blinds.'}};
const suits={s:'♠',d:'♦',c:'♣',h:'♥'};
function cards(id,list){$(id).replaceChildren(...list.map(c=>{const b=document.createElement('b');b.className='card '+(!c?'back':'dh'.includes(c[1])?'red':'');b.textContent=c?(c[0]==='T'?'10':c[0])+suits[c[1]]:'◆';return b}))}
function btn(label,f){const b=document.createElement('button');b.textContent=label;b.onclick=f;return b}
function render(){while(!g.end&&g.turn===1){const m=moves(g),r=Math.random();act(g,m.includes('raise')&&r<0.18?'raise':m.includes('call')?(r>.93?'fold':'call'):'check')}
 cards('hero',g.hands[0]);cards('opp',g.end?.show?g.hands[1]:[null,null]);cards('board',g.board);
 $('street').textContent=({0:'Preflop',3:'Flop',4:'Turn',5:'River'})[g.board.length];$('pot').textContent='Pot · '+(g.end?.pot??g.pot);
 $('op').textContent='Computer · '+g.stacks[1]+(g.button===1?' · Dealer':'');$('you').textContent='You · '+g.stacks[0]+(g.button===0?' · Dealer':'');
 $('status').textContent=g.end?(g.end.winner===-1?'Split pot':g.end.winner===0?'You win':'Computer wins'):'Your turn';
 $('actions').replaceChildren(...(g.end?[btn('Deal again',start)]:moves(g).map(a=>btn(a+(a==='call'?' '+(g.bets[1]-g.bets[0]):''),()=>{act(g,a);render()}))));
 $('log').replaceChildren(...g.log.map(t=>{const li=document.createElement('li');li.textContent=t;return li}))}
async function start(){if(tableId){try{const r=await fetch('/api/tables');const table=(await r.json()).find(t=>t.id===tableId&&t.open);if(!table)throw Error();config={stack:table.stack,blind:table.blind}}catch{$('actions').replaceChildren();$('status').textContent='Table unavailable. Return to the lobby.';return}}button=1-button;g=deal(config.stack,config.blind,button);render()}start();
