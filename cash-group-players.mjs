export function cashGroupPlayerRows(group,sort='chips',order=1){
 const rows=[];
 for(const table of group.members||[group])for(const [seat,p]of (table.seats||[]).entries())if(p)rows.push({key:JSON.stringify([table.room,seat,p.name]),table,seat,name:p.name,stack:p.stack});
 return rows.sort((a,b)=>{const x=sort==='name'?a.name.toLowerCase():a.stack,y=sort==='name'?b.name.toLowerCase():b.stack;return (x>y?-1:x<y?1:0)*(order===1?1:-1)});
}
export function renderCashGroupPlayers(root,rows,selected,sort,order,choose,sortBy,open){
 const node=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls;if(text!==undefined)e.textContent=text;return e},header=node('div','nativeGroupPlayerHeader');
 root.classList.add('nativeGroupPlayerList');
 for(const [key,label,translation]of [['flag','Flag','LabelFlag'],['name','Player','DataGridPlayersLabelPlayer'],['number','No.','HandHistoryListLabelNo'],['chips','Chips','DataGridPlayersLabelChips']]){
  const b=node('button','',label);b.type='button';b.dataset.nativeLabel=translation;
  if(key==='name'||key==='chips'){b.dataset.sort=key;b.dataset.sortOrder=sort===key?(order===1?'descending':'ascending'):'none';b.setAttribute('aria-pressed',String(sort===key));b.setAttribute('aria-label',label+(sort===key?', '+b.dataset.sortOrder:''));b.onclick=()=>sortBy(key)}
  else{b.disabled=true;b.title=key==='flag'?'Country is not recorded locally':'Native operator table numbers are not available locally'}header.append(b);
 }
 root.append(header);
 for(const p of rows){const b=node('button','nativeGroupPlayer');b.type='button';b.dataset.renderKey=p.key;b.dataset.playerKey=p.key;b.dataset.player=p.name;b.dataset.room=p.table.room;b.title=p.table.name;b.setAttribute('aria-label',p.name+' at '+p.table.name);b.setAttribute('aria-pressed',String(p.key===selected));const flag=node('span','groupPlayerFlag','—'),name=node('span','groupPlayerName',p.name),number=node('span','groupPlayerNumber','—'),chips=node('span','groupPlayerChips',p.stack);flag.title='Country unknown';number.title=p.table.name+' · operator number unavailable';b.append(flag,name,number,chips);b.onclick=e=>{choose(p.key);if(e.detail===2)open(p)};root.append(b)}
 if(!rows.length)root.append(node('p','groupPlayerEmpty','No players seated'));
}
