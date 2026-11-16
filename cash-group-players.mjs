export function cashGroupPlayerRows(group,sort='chips',order=1){
 const rows=[];
 for(const table of group.members||[group])for(const [seat,p]of (table.seats||[]).entries())if(p)rows.push({key:JSON.stringify([table.room,seat,p.name]),table,seat,name:p.name,stack:p.stack});
 return rows.sort((a,b)=>{const x=sort==='name'?a.name.toLowerCase():a.stack,y=sort==='name'?b.name.toLowerCase():b.stack;return (x>y?-1:x<y?1:0)*(order===1?1:-1)});
}
export function renderCashGroupPlayers(root,rows,selected,sort,order,choose,sortBy,open,paint){
 const node=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls;if(text!==undefined)e.textContent=text;return e},header=node('div','nativeGroupPlayerHeader');
 root.classList.add('nativeGroupPlayerList');
 for(const [key,label,translation]of [['flag','Flag','LabelFlag'],['name','Player','DataGridPlayersLabelPlayer'],['number','No.','HandHistoryListLabelNo'],['chips','Chips','DataGridPlayersLabelChips']]){
  const b=node('button','',label);b.type='button';b.dataset.nativeLabel=translation;
  if(key==='name'||key==='chips'){b.dataset.sort=key;b.dataset.sortOrder=sort===key?(order===1?'descending':'ascending'):'none';b.setAttribute('aria-pressed',String(sort===key));b.setAttribute('aria-label',label+(sort===key?', '+b.dataset.sortOrder:''));b.onclick=()=>sortBy(key)}
  else{b.disabled=true;b.title=key==='flag'?'Country is not recorded locally':'Native operator table numbers are not available locally'}header.append(b);
 }
 root.append(header);
 for(const p of rows){const b=node('button','nativeGroupPlayer');b.type='button';b.dataset.renderKey=p.key;b.dataset.playerKey=p.key;b.dataset.player=p.name;b.dataset.room=p.table.room;const marker=paint(p);b.dataset.own=String(marker?.own===true);if(marker&&(marker.hasText||marker.color.toUpperCase()!=='#FFFFFF')){b.dataset.noteKind=marker.hasText?'memo':'color';b.style.setProperty('--group-note-color',marker.color)}b.title=p.table.name;b.setAttribute('aria-label',p.name+' at '+p.table.name);b.setAttribute('aria-pressed',String(p.key===selected));const flag=node('span','groupPlayerFlag','—'),name=node('span','groupPlayerName',p.name),number=node('span','groupPlayerNumber','—'),chips=node('span','groupPlayerChips',p.stack.toLocaleString('en-US'));flag.title='Country unknown';number.title=p.table.name+' · operator number unavailable';b.append(flag,name,number,chips);b.onclick=e=>{choose(p.key);if(e.detail===2)open(p)};root.append(b)}
 if(!rows.length)root.append(node('p','groupPlayerEmpty','No players seated'));
}

export function installCashGroupPaint(changed,read=fetch){
 let signature='',tables=[],account=null,epoch=0,busy=false,controller=null,cache=new Map();
 const valid=d=>d&&d.account===account&&typeof d.waiting==='boolean'&&(d.me===null||Number.isInteger(d.me)&&d.me>=0&&d.me<6)&&Array.isArray(d.players)&&d.players.length<=6&&new Set(d.players.map(p=>p.seat)).size===d.players.length&&d.players.every(p=>Number.isInteger(p.seat)&&p.seat>=0&&p.seat<6&&typeof p.name==='string'&&/^[a-f0-9]{64}$/.test(p.subject)&&/^#[a-f0-9]{6}$/i.test(p.color)&&typeof p.hasText==='boolean')&&(d.me===null||d.players.some(p=>p.seat===d.me));
 async function refresh(){
  if(busy||!account||!tables.length)return;busy=true;const stamp=epoch;controller=new AbortController();const signal=controller.signal,next=new Map();
  try{for(const table of tables){const r=await read('/api/rooms/'+table.room+'/preview-paint',{cache:'no-store',signal});if(stamp!==epoch)return;if(!r.ok)throw Error('Private player markers unavailable');const d=await r.json();if(stamp!==epoch)return;if(!valid(d))throw Error('Private player identity changed');next.set(table.room,d)}if(stamp===epoch&&JSON.stringify([...cache])!==JSON.stringify([...next])){cache=next;changed()}}
  catch{if(stamp===epoch){cache.clear();changed()}}
  finally{if(stamp===epoch)busy=false}
 }
 function select(group,viewer){
  const members=group?.members||(group?[group]:[]),roster=t=>JSON.stringify(t.seats?.map(p=>p?.name));
  const next=group&&viewer?JSON.stringify([viewer,members.map(t=>[t.room,roster(t),!t.seats?.some(Boolean)&&t.waitingCount>0])]):'';
  if(next===signature)return;
  const previous=new Map(tables.map(t=>[t.room,roster(t)])),eligible=group&&viewer?members.filter(t=>t.seats?.some(Boolean)||t.waitingCount>0):[];
  // Keep unchanged rooms painted while a different room refreshes; account or roster changes clear affected identity.
  cache=new Map(eligible.flatMap(t=>account===viewer&&previous.get(t.room)===roster(t)&&cache.has(t.room)?[[t.room,cache.get(t.room)]]:[]));
  signature=next;epoch++;controller?.abort();busy=false;account=group&&viewer?viewer:null;tables=eligible;void refresh();
 }
 function get(row){const d=cache.get(row.table.room),p=d?.players.find(p=>p.seat===row.seat&&p.name===row.name);return p?{own:d.me===row.seat,color:p.color,hasText:p.hasText}:null}
 function getTable(table){const d=cache.get(table.room);return d?{playing:d.me!==null,waiting:d.waiting}:null}
 return {select,refresh,get,getTable};
}
