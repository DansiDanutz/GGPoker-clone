export function installHelmetScope(context,setHelmet){
 const id=crypto.randomUUID(),prefix='playgg-helmet-peer:',channel=new BroadcastChannel('playgg-helmet'),pending=new Map();let registered='',storageError='',closed=false;
 const account=c=>typeof c.account==='string'?c.account.toLowerCase():'';
 function refresh(){const c=context(),value=c.enabled&&account(c)?JSON.stringify({account:account(c),room:c.room}):'';if(value===registered)return;try{if(value)localStorage.setItem(prefix+id,value);else localStorage.removeItem(prefix+id);registered=value;storageError=''}catch{storageError='Open-table registry unavailable; use This table'}}
 channel.onmessage=async({data})=>{
  if(!data||typeof data!=='object')return;
  if(data.type==='ack'){if(data.target!==id)return;const job=pending.get(data.command);if(!job||!job.waiting.delete(data.peer))return;if(data.error)job.errors.push(String(data.error).slice(0,160));if(!job.waiting.size){clearTimeout(job.timer);pending.delete(data.command);job.resolve(job.errors)}return}
  const c=context();if(data.type!=='apply'||typeof data.muted!=='boolean'||typeof data.command!=='string'||typeof data.source!=='string'||!Array.isArray(data.targets)||data.targets.length>100||!data.targets.includes(id)||!c.enabled||!account(c)||data.account!==account(c))return;
  let error='';try{await setHelmet(data.muted)}catch(e){error=e.message||'Table rejected Helmet change'}
  if(!closed)channel.postMessage({type:'ack',command:data.command,peer:id,target:data.source,error});
 };
 async function apply(muted,all){
  if(typeof muted!=='boolean'||typeof all!=='boolean'||!context().enabled)throw Error('Join this table first');if(!all)return setHelmet(muted);
  refresh();const c=context();if(!account(c))throw Error('Sign in locally to change all open tables');if(storageError)throw Error(storageError);
  const targets=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key?.startsWith(prefix))continue;try{const peer=JSON.parse(localStorage.getItem(key));if(peer.account===account(c))targets.push(key.slice(prefix.length))}catch{}}
  if(targets.length>100)throw Error('Too many registered table windows');const remote=targets.filter(peer=>peer!==id),command=crypto.randomUUID();
  const replies=remote.length?new Promise(resolve=>{const job={waiting:new Set(remote),errors:[],resolve};job.timer=setTimeout(()=>{pending.delete(command);resolve([...job.errors,job.waiting.size+' table window(s) did not confirm; check them before retrying'])},5000);pending.set(command,job)}):Promise.resolve([]);
  channel.postMessage({type:'apply',command,source:id,account:account(c),targets:remote,muted});let localError='';try{await setHelmet(muted)}catch(e){localError=e.message||'This table rejected Helmet change'}
  const errors=await replies;if(localError)errors.push(localError);if(errors.length)throw Error(errors.join('; '));
 }
 function close(){closed=true;try{localStorage.removeItem(prefix+id)}catch{}for(const job of pending.values()){clearTimeout(job.timer);job.resolve(['Table window closed before confirmation'])}pending.clear();channel.close()}
 return {refresh,apply,close};
}
