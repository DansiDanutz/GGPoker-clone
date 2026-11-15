import {installPlayerNotes} from './player-note-ui.mjs';
export function installLobbyPlayerHud(){
 let selected='',epoch=0,current={enabled:false,state:null};
 const settings=document.createElement('details'),message=document.createElement('p');settings.hidden=true;message.id='lobbyHudError';message.setAttribute('role','alert');message.className='lobbyHudHost';document.body.append(settings,message);
 const notes=installPlayerNotes(settings,()=>current);
 function select(table){const next=table?JSON.stringify([table.room,table.seats?.map(p=>p?.name)]):'';if(next===selected)return;selected=next;epoch++;message.textContent=''}
 async function open(table,index){
  const stamp=epoch,selection=selected;message.textContent='';
  try{
   if(!await notes.closeHud())return;if(stamp!==epoch)return;
   const response=await fetch('/api/rooms/'+table.room+'/preview-notes',{cache:'no-store'}),data=await response.json();if(stamp!==epoch||selection!==selected)return;if(!response.ok)throw Error(data.error||'Player HUD unavailable');
   const target=data.players.find(p=>p.seat===index);if(!target||target.name!==table.seats?.[index]?.name)throw Error('Player has left; choose a current player');
   const subjects=Array(table.capacity||6).fill(null),names=[...subjects],avatars=[...subjects];for(const p of data.players){subjects[p.seat]=p.subject;names[p.seat]=p.name;avatars[p.seat]=p.avatar}
   current={enabled:true,room:table.room,token:'',viewer:data.viewer,notesPath:'/api/rooms/'+table.room+'/preview-notes',notesScope:'Recorded table session',state:{me:data.me,noteSubjects:subjects,names,avatars,settings:{variant:table.mode==='cash'?'holdem':table.mode}},onError:text=>{message.textContent=text}};
   await notes.openHud(index);
  }catch(error){if(stamp===epoch)message.textContent=error.message}
 }
 return {select,open};
}
