const $=id=>document.getElementById(id);
const tournamentLink=new URLSearchParams(location.search).get('mode')==='tournament';
let room=location.hash.slice(1);
if(!/^[a-f0-9]{48}$/.test(room)){
 room=Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');
 history.replaceState(null,'','#'+room);
}
$('invite').value=location.href;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('copy').textContent='Copied'}catch{$('invite').select()}};
const key='river-seat:'+room;
let token=sessionStorage.getItem(key),state,busy=false;
async function request(op,body={}){
 const headers={'Content-Type':'application/json'};if(token)headers.Authorization='Bearer '+token;
 const res=await fetch('/api/rooms/'+room+'/'+op,{method:op==='state'?'GET':'POST',headers,body:op==='state'?undefined:JSON.stringify(body),cache:'no-store'});
 const data=await res.json();
 if(!res.ok){if(res.status===401||res.status===404){sessionStorage.removeItem(key);token=null;state=null;render()}throw Error(data.error)}
 if(data.left){sessionStorage.removeItem(key);token=null;state=null;render();return}
 if(data.issued){token=data.issued;sessionStorage.setItem(key,token)}
 if(state?.version!==data.version){state=data;render()}
}
async function operate(op,body){if(op==='state'&&busy)return;const version=state?.version;while(busy)await new Promise(resolve=>setTimeout(resolve,25));busy=true;try{await request(op,{...body,version});$('error').textContent=''}catch(e){$('error').textContent=e.message}finally{busy=false}}
function btn(text,fn){const b=document.createElement('button');b.textContent=text;b.onclick=fn;$('actions').append(b)}
function list(id,items){$(id).replaceChildren(...items.map(v=>{const li=document.createElement('li');li.textContent=v;return li}))}
function render(){
 $('join').hidden=!!state;$('actions').replaceChildren();const g=state?.hand,t=state?.tournament;
 const tournament=state?!!t:tournamentLink;
 document.querySelector('h1').textContent=tournament?'Four-player freezeout':'Private no-limit table';
 $('format').textContent=tournament?'Four registrations start the event. Each seat gets 100 tournament chips. Four 25-credit entries fund a 100-credit winner-take-all practice prize. No rebuys.':'Four human seats · practice chips · blinds 2 / 4.';
 $('join').querySelector('button').textContent=tournament?'Register':'Take a seat';
 $('level').textContent=t&&g?'Level '+t.level+' · Blinds '+g.blind/2+' / '+g.blind+(t.winner==null&&t.level<7?' · Next level scheduled '+new Date(t.startedAt+t.level*t.intervalMs).toLocaleTimeString()+' (new hands only)':''):'';

 $('board').textContent=g?'Board: '+(g.board.join(' ')||'Preflop'):'';
 list('seats',(state?.names||[]).map((p,i)=>(p||'Open seat')+(i===state.me?' (you)':'')+(g?' · '+g.stacks[i]+' chips · in pot '+g.committed[i]+(t?.out[i]?' · eliminated in hand '+t.out[i]:g.folded[i]?' · folded':'')+(g.cards[i]?' · '+g.cards[i].join(' '):''):'')));
 list('history',g?.history||[]);list('results',(state?.results||[]).map(r=>'Hand '+r.number+' · Board: '+(r.board?.join(' ')||'no board')+' · Final stacks: '+r.stacks.join(', ')+' · '+(r.history||[]).join('; ')));
 const net=[0,0,0,0];for(const r of state?.results||[])r.payouts.forEach((v,i)=>net[i]+=v-r.committed[i]);
 list('standings',(state?.names||[]).map((name,i)=>({name,score:net[i]})).filter(x=>x.name).sort((a,b)=>b.score-a.score).map(x=>x.name+': '+(x.score>0?'+':'')+x.score));
 if(!state){$('status').textContent='Take a seat to join the room.';return}
 if(!g){$('status').textContent=(t?'Prize pool '+t.pool+' credits · Registration open (':'Waiting for four players (')+state.names.filter(Boolean).length+'/4).';btn(t?'Withdraw registration':'Leave seat',()=>operate('leave'));return}
 if(t?.winner!=null){$('status').textContent='Tournament winner: '+state.names[t.winner]+' · Prize: '+t.prizes[t.winner]+' practice credits.';return}
 if(g.end){$('status').textContent='Hand '+state.number+' settled. '+g.end.payouts.flatMap((p,i)=>p?[state.names[i]+': won '+(p-g.end.returns[i])+(g.end.returns[i]?', returned '+g.end.returns[i]:'')]:[]).join('; ');
 if(t){$('status').textContent+=' Next hand starts automatically.';return}
 if(!state.ready[state.me])btn('Ready for next hand',()=>operate('ready'));else $('status').textContent+=' Waiting for other players.';return}
 $('status').textContent='Hand '+state.number+' · Pot '+g.committed.reduce((a,b)=>a+b,0)+' · '+(state.me===g.turn?'Your turn':state.names[g.turn]+' to act');
 const o=g.options;if(!o)return;
 const act=(action,target)=>operate('act',{action,target});
 btn(o.due?'Call '+o.call:'Check',()=>act(o.due?'call':'check'));if(o.due)btn('Fold',()=>act('fold'));
 if(o.raise){const label=document.createElement('label'),n=document.createElement('input');label.textContent='Bet total ';Object.assign(n,{type:'number',min:o.min,max:o.max,step:1,value:o.min,required:true});label.append(n);$('actions').append(label);btn('Bet / raise',()=>{if(n.reportValidity())act('raise',n.valueAsNumber)});btn('All in',()=>act('raise',o.max))}
}
$('join').onsubmit=e=>{e.preventDefault();operate('join',{name:$('name').value,mode:tournamentLink?'tournament':'cash'})};
render();async function poll(){if(token&&!busy)await operate('state');setTimeout(poll,400)}poll();
