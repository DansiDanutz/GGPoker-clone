import {spinWheelCues} from './spin-wheel-presentation.mjs';
import {readFile} from 'node:fs/promises';
import {recoverOwnerRestore,restoreOwnerBackup} from './owner-restore.mjs';
import {ownerBackup} from './owner-backup.mjs';
import {prizeAmounts} from './engine/prizes.mjs';
import {profiles} from './local-profile.mjs';
import {openRooms} from './rooms.mjs';
import {openRush} from './rush.mjs';
import http from 'node:http';
import {createHash,randomBytes,timingSafeEqual} from 'node:crypto';
import {readFileSync,writeFileSync,renameSync,mkdirSync,appendFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {homedir} from 'node:os';
import {fileURLToPath} from 'node:url';
const referenceArt=process.env.POKER_REFERENCE_ART_DIR||fileURLToPath(new URL('./home-art/',import.meta.url));
const port=Number(process.env.PORT||18765),host=process.env.POKER_BIND_HOST||'127.0.0.1', origin=process.env.POKER_PUBLIC_ORIGIN||('http://'+host+':'+port);
const directory=process.env.POKER_DATA_DIR||join(homedir(),'.local/share/river-room');mkdirSync(directory,{recursive:true,mode:0o700});
const cashWalletsEnabled=process.env.POKER_REFERENCE_HOME==='1'&&host==='127.0.0.1'&&origin==='http://127.0.0.1:'+port;
let restoring=false,restoreBlocked=false,activeRequests=0;recoverOwnerRestore(directory);
let playerProfile=profiles(join(directory,'local-players.json'));
let roomRequest=openRooms(join(directory,'rooms.json'),playerProfile.avatar,cashWalletsEnabled);
let rushRequests={holdem:openRush(join(directory,'rush.json'),'holdem',playerProfile.avatar,roomRequest.notes,roomRequest.rushStore),plo:openRush(join(directory,'rush-plo.json'),'plo',playerProfile.avatar,roomRequest.notes,roomRequest.rushStore)};
setInterval(()=>{if(restoring||restoreBlocked)return;try{for(const request of Object.values(rushRequests))request.tick()}catch{console.error('Rush timer could not save state; prior checkpoint retained')}},500).unref();
const keyPath=join(directory,'owner.key'),db=join(directory,'tables.json');
try{writeFileSync(keyPath,randomBytes(32).toString('hex'),{mode:0o600,flag:'wx'})}catch(e){if(e.code!=='EEXIST')throw e}
const key=readFileSync(keyPath,'utf8').trim();
let tables=[{id:'practice',name:'Green Felt',stack:200,blind:4,open:true}];
try{tables=JSON.parse(readFileSync(db,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}
function loadRestoredModels(){
 const nextTables=JSON.parse(readFileSync(db,'utf8'));if(!Array.isArray(nextTables)||new Set(nextTables.map(t=>t?.id)).size!==nextTables.length||nextTables.some(t=>!t||typeof t.id!=='string'||!/^[a-z0-9-]{1,40}$/.test(t.id)||typeof t.name!=='string'||!t.name.trim()||t.name.length>60||!Number.isInteger(t.stack)||!Number.isInteger(t.blind)||t.blind<2||t.blind%2||t.stack<t.blind*4||t.stack>1000000||typeof t.open!=='boolean'||t.mode!==undefined&&!['cash','plo','plo5','plo6','shortdeck','aof','tournament'].includes(t.mode)||t.entryCost!==undefined&&(t.mode!=='tournament'||!Number.isSafeInteger(t.entryCost)||t.entryCost<0||t.entryCost>1000000)))throw Error('Invalid restored table definitions');
 const nextProfile=profiles(join(directory,'local-players.json')),nextRooms=openRooms(join(directory,'rooms.json'),nextProfile.avatar,cashWalletsEnabled),nextRush={holdem:openRush(join(directory,'rush.json'),'holdem',nextProfile.avatar,nextRooms.notes,nextRooms.rushStore),plo:openRush(join(directory,'rush-plo.json'),'plo',nextProfile.avatar,nextRooms.notes,nextRooms.rushStore)};
 return {playerProfile:nextProfile,roomRequest:nextRooms,rushRequests:nextRush,tables:nextTables};
}
const hostedId=id=>createHash('sha256').update('river-hosted:'+id).digest('hex').slice(0,48);
setInterval(()=>{if(restoring||restoreBlocked)return;for(const table of tables){try{roomRequest(hostedId(table.id),'tick',undefined,{},table)}catch{console.error('Hosted table timer could not save state; prior checkpoint retained')}}try{roomRequest.tickSpin()}catch{console.error('Spin timer could not save state; prior checkpoint retained')}},500).unref();
const files=new Set(['spin-insurance-render.mjs','spin-insurance-motion.mjs','spin-insurance-glow.mjs','spin-wheel-flares.mjs','spin-wheel-wait-motion.mjs','spin-wheel-wait.mjs','spin-wheel-sparkles.mjs','spin-wheel-scene.mjs','spin-wheel-light.mjs','spin-wheel-glow.mjs','spin-congratulation-rows.mjs','spin-congratulations.mjs','spin-wheel-prize-effect.mjs','spin-wheel-presentation.mjs','spin-wheel-render.mjs','spin-wheel-amount.mjs','spin-wheel-motion.mjs','tournament-result.mjs','cash-sitout-menu.mjs','note-tooltip.mjs','rabbit-peel.mjs','rabbit-view.mjs','native-language.mjs','emoticon-animation-data.mjs','emoticon-animation.mjs','emoticons.mjs','emoticon-picker.mjs','helmet-ui.mjs','helmet-scope.mjs','hand-panel.mjs','hotkey-bindings.mjs','hotkey-settings.mjs','player-note-ui.mjs','card-squeeze.mjs','chip-shuffle.mjs','betting-preferences.mjs','felt.css','felt.mjs','spin-lobby.mjs','engine/spin.mjs','engine/prizes.mjs','index.html','ui.mjs','game.mjs','engine/hand.mjs','engine/pots.mjs','engine/deck.mjs','engine/table.mjs','network.html','network.mjs','table-audio.mjs','nolimit.html','nolimit.mjs','lobby.html','lobby.mjs']);
http.createServer(async(req,res)=>{
 const json=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data))};
 if(restoring||restoreBlocked)return json(503,{error:restoreBlocked?'Restart recovery is required':'Local recovery in progress; retry shortly'});activeRequests++;
 try{
 if(req.headers.host!==new URL(origin).host)return json(403,{error:'Local host required'});
 const path=new URL(req.url,origin).pathname;
 // Reference recordings are private to the Mac and never served in shared-room mode.
 const localHome=process.env.POKER_REFERENCE_HOME==='1'&&host==='127.0.0.1'&&origin==='http://127.0.0.1:'+port;
 const cue=/^\/table-audio\/(Check|Call|Bet|Raise|AllIn|Fold|DealCard|ShowCard|RabbitCard|RabbitCardDouble|ShowDownCard|Board|GatherChips|WinPot|ShuffleUp|ShuffleCombine|ShuffleOther|SqueezeOpen|AofButton|ChessClock|TimeBankTick|TournamentResultFT|TournamentResultITM|TournamentFallResult|SpinAndGoldSpin|SNGWheelStuckHigh|SNGWheelStuckLow|SngFireworks|SNGWheelOut|SngBigWin|SngWheelFrameEffect|SngWheelFrameLight|SngWheelBaseLight)\.mp3$/.exec(path);
 if(localHome&&cue&&req.method==='GET'){
  const wheelAudio=Object.values(spinWheelCues).includes(cue[1]);
  let data;try{data=await readFile(join((wheelAudio||cue[1].startsWith('Shuffle')||cue[1].startsWith('Tournament')||['RabbitCard','RabbitCardDouble','ChessClock','TimeBankTick','ShowDownCard'].includes(cue[1]))?referenceArt:join(homedir(),'Library/Application Support/com.nsuslab.ncf.launcher.live.ggpcom/Game/assets/sounds'),(wheelAudio||cue[1].startsWith('Tournament')||['RabbitCard','RabbitCardDouble','AofButton','ChessClock','TimeBankTick','ShowDownCard'].includes(cue[1])?'':'Sound')+cue[1]+'.mp3'))}catch{return json(404,{error:'Local sound unavailable'})}
  res.writeHead(200,{'Content-Type':'audio/mpeg','Cache-Control':'private, max-age=3600'});res.end(data);return;
 }
 const avatarImage=/^\/local\/avatar-images\/([a-f0-9]{64})\.png$/.exec(path);
 if(localHome&&avatarImage&&req.method==='GET'){const data=playerProfile.image(avatarImage[1]);if(!data)return json(404,{error:'Avatar unavailable'});res.writeHead(200,{'Content-Type':'image/png','Cache-Control':'private, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'});res.end(data);return}
 if(localHome&&['/local/cash-sit-in','/local/cash-sit-out','/local/cash-leave'].includes(path)){
  if(req.method!=='POST')return json(405,{error:'Method not allowed'});
  if(req.headers.origin!==origin)return json(403,{error:'Local origin required'});
  const account=playerProfile.identity(req);if(!account)return json(401,{error:'Sign in locally'});
  if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Expected JSON'});
  let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>512)return json(413,{error:'Request too large'})}
  let body;try{body=JSON.parse(raw);if(!body||Array.isArray(body)||typeof body!=='object'||Object.keys(body).some(k=>!['account',...(path==='/local/cash-leave'?['leaving']:[])].includes(k))||Object.keys(body).length!==(path==='/local/cash-leave'?2:1)||typeof body.account!=='string'||path==='/local/cash-leave'&&typeof body.leaving!=='boolean')throw Error()}catch{return json(400,{error:'Expected the current account'})}
  if(body.account!==account)return json(401,{error:'Signed-in account changed'});
  return json(200,path==='/local/cash-leave'?roomRequest.leaveCash(account,body.leaving):path.endsWith('sit-out')?roomRequest.pauseCash(account):roomRequest.resumeCash(account));
 }
 if(localHome&&['/local/spin','/local/spin/cancel'].includes(path)){
  if(!['GET','POST'].includes(req.method)||path.endsWith('/cancel')&&req.method!=='POST')return json(405,{error:'Method not allowed'});
  if(req.method==='POST'&&req.headers.origin!==origin)return json(403,{error:'Local origin required'});
  const account=playerProfile.identity(req);if(!account)return json(401,{error:'Sign in locally'});
  if(!cashWalletsEnabled)return json(503,{error:'Local practice mode is disabled'});
  if(req.method==='GET')return json(200,{account,rules:roomRequest.spinRules().stakes,registrations:roomRequest.spinQueue(account)});
  if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Expected JSON'});
  let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>1024)return json(413,{error:'Request too large'})}
  let body;try{body=JSON.parse(raw);if(!body||Array.isArray(body)||typeof body!=='object')throw Error()}catch{return json(400,{error:'Invalid JSON'})}
  if(body.account!==account)return json(401,{error:'Signed-in account changed'});delete body.account;
  if(path.endsWith('/cancel')){if(Object.keys(body).length!==1||typeof body.id!=='string'||!(/^[a-f0-9]{48}$/).test(body.id))return json(400,{error:'Expected a Spin registration identity'});try{return json(200,roomRequest.cancelSpinRegistration(body.id,account))}catch(error){return json(error.status||500,{error:error.status?error.message:'Local operation failed'})}}
  try{return json(200,roomRequest.queueSpin(account,body))}catch(error){return json(error.status||500,{error:error.status?error.message:'Local operation failed',...(error.status===409&&error.code==='spin_rules_changed'?{code:error.code}:{})})}
 }
 if(localHome&&path==='/local/wallet'&&req.method==='GET'){const account=playerProfile.identity(req);return account?json(200,{account,...roomRequest.wallet(account)}):json(401,{error:'Sign in locally'})}
 if(localHome&&['/local/me','/local/login','/local/create','/local/logout','/local/avatar'].includes(path))return await playerProfile.handle(req,res,path,json);
 if(localHome&&req.method==='GET'&&(path==='/'||['/launch.html','/seat.html','/seat.mjs','/playgg.html','/playgg.mjs','/playgg-carousel.mjs','/home-review.html'].includes(path)||['/home-art/native-history-roboto.ttf','/home-art/native-history-roboto-italic.ttf','/home-art/native-hud-roboto-bold.ttf','/home-art/native-show-roboto-condensed-bold.ttf','/home-art/native-action-roboto-condensed.ttf'].includes(path)||/^\/home-art\/[a-zA-Z0-9_-]+\.(png|webp|json)$/.test(path))){
  const file=path==='/'?'launch.html':path.slice(1);
  let data;try{data=await readFile(file.startsWith('home-art/')?join(referenceArt,file.slice(9)):new URL(file,import.meta.url))}catch{return json(404,{error:'Reference asset unavailable'})}
  res.writeHead(200,{'Content-Type':file.endsWith('.ttf')?'font/ttf':file.endsWith('.webp')?'image/webp':file.endsWith('.png')?'image/png':file.endsWith('.json')?'application/json':file.endsWith('.mjs')?'text/javascript':'text/html; charset=utf-8','Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'});res.end(data);return;
 }
 const rush=/^\/api\/rush\/(?:(holdem|plo)\/)?(state|join|deal|act|quick-fold|fill-bots|cancel-queue|notes|sit-out|helmet|leave)$/.exec(path);
 if(rush&&localHome){
  const op=rush[2],rushRequest=rushRequests[rush[1]||'holdem'];
  if(op==='notes'?!['GET','POST'].includes(req.method):req.method!==(op==='state'?'GET':'POST'))return json(405,{error:'Method not allowed'});
  if((req.method==='POST'||op==='notes'&&req.headers.origin)&&req.headers.origin!==origin)return json(403,{error:'Local origin required'});
  const account=playerProfile.identity(req);if(!account)return json(401,{error:'Sign in locally'});
  let body={};
  if(req.method==='POST'){
   if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Expected JSON'});
   let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>(op==='notes'?8192:2048))return json(413,{error:'Request too large'})}
   try{body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))throw Error()}catch{return json(400,{error:'Invalid JSON'})}
  }
  try{return json(200,rushRequest(account,op,body))}catch(e){if(e.status)return json(e.status,{error:e.message});throw e}
 }
 const match=/^\/api\/rooms\/([0-9a-f]{48})\/(watch|join|state|act|spin-ready|ready|add-chips|leave|fill-bots|start|end-practice|chat|helmet|sit-out|sit-out-state|shuffle|time-bank|time-card-option|notes|rabbit|show-cards|waiting)$/.exec(path);
 if(match){
  const [,id,op]=match;
  if(['notes','waiting'].includes(op)?!['GET','POST'].includes(req.method):req.method!==(['state','watch'].includes(op)?'GET':'POST'))return json(405,{error:'Method not allowed'});
  if(req.headers.origin&&req.headers.origin!==origin)return json(403,{error:'Origin not allowed'});
  if(['waiting','spin-ready'].includes(op)&&req.method==='POST'&&req.headers.origin!==origin)return json(403,{error:'Local origin required'});
  let body={};
  if(req.method==='POST'){
   if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Expected JSON'});
   let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>(op==='notes'?8192:2048))return json(413,{error:'Request too large'});chunks.push(chunk)}
   try{body=JSON.parse(Buffer.concat(chunks));if(!body||typeof body!=='object'||Array.isArray(body))throw Error()}catch{return json(400,{error:'Invalid JSON'})}
  }
  const account=localHome?playerProfile.identity(req):null;
  if(op==='chat'&&account&&!(req.headers.authorization||'').replace(/^Bearer /,'')&&req.headers.origin!==origin)return json(403,{error:'Local origin required'});
  if((op==='waiting'||op==='join'&&body.useProfile===true)&&!account)return json(401,{error:'Sign in locally'});
  if(op==='join'&&body.useProfile===true&&account)body.name=account;
  try{return json(200,roomRequest(id,op,(req.headers.authorization||'').replace(/^Bearer /,''),body,tables.find(t=>hostedId(t.id)===id),op==='join'&&body.useProfile!==true?null:account))}
  catch(e){if(e.status)return json(e.status,{error:e.message});throw e}
 }
 if(path==='/api/hosted'&&req.method==='GET'){res.setHeader('X-Playgg-Time-Cards','1');res.setHeader('X-Playgg-Tournament-Entries','1');res.setHeader('X-Playgg-Time-Card-Options','1');return json(200,tables.map(t=>({...t,room:hostedId(t.id),...roomRequest(hostedId(t.id),'summary',undefined,{},t)})))}
 if(path==='/api/tables'&&req.method==='GET')return json(200,tables);
 const backup=/^\/api\/owner-backups(?:\/([a-f0-9]{24})(\/restore)?)?$/.exec(path);
 if((['/api/owner-spin-rules','/api/owner-spin-bank','/api/owner-chat','/api/owner-reports','/api/owner-wallets','/api/owner-seats','/api/owner-tournaments'].includes(path)&&['GET','POST'].includes(req.method))||(path==='/api/tables'&&req.method==='POST')||(path==='/api/owner-audit'&&req.method==='GET')||(backup&&(['GET','POST','DELETE'].includes(req.method)))){
  if(origin!=='http://127.0.0.1:'+port||host!=='127.0.0.1')return json(403,{error:'Owner changes require local-only mode'});
  const token=Buffer.from((req.headers.authorization||'').replace(/^Bearer /,''));const expected=Buffer.from(key);
  if(req.headers.origin&&req.headers.origin!==origin)return json(403,{error:'Local origin required'});
  if(token.length!==expected.length||!timingSafeEqual(token,expected))return json(401,{error:'Owner key required'});
  if(path==='/api/owner-spin-rules'){
   if(!cashWalletsEnabled)return json(503,{error:'Local practice mode is disabled'});if(req.method==='GET')return json(200,roomRequest.spinRules());
   if(req.headers.origin!==origin)return json(403,{error:'Local origin required'});if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Expected JSON'});let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>16000)return json(413,{error:'Request too large'});chunks.push(chunk)}
   try{return json(200,roomRequest.setSpinRules(JSON.parse(Buffer.concat(chunks))))}catch(error){return json(error instanceof SyntaxError?400:error.status||500,{error:error instanceof SyntaxError?'Invalid JSON':error.status?error.message:'Could not save Spin practice rules'})}
  }
  if(path==='/api/owner-spin-bank'){
   if(!cashWalletsEnabled)return json(503,{error:'Local cash wallets are disabled'});
   if(req.method==='GET')return json(200,roomRequest.spinBank());
   if(req.headers.origin!==origin)return json(403,{error:'Local origin required'});if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Expected JSON'});
   let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>2048)return json(413,{error:'Request too large'});chunks.push(chunk)}
   try{return json(200,roomRequest.fundSpinBank(JSON.parse(Buffer.concat(chunks))))}catch(error){return json(error instanceof SyntaxError?400:error.status||500,{error:error instanceof SyntaxError?'Invalid JSON':error.status?error.message:'Could not save Spin bank funding'})}
  }
  if(path==='/api/owner-wallets'){
   if(!cashWalletsEnabled)return json(503,{error:'Local cash wallets are disabled'});
   if(req.method==='GET')return json(200,{nextSequence:roomRequest.nextGrantSequence(),lastGrant:roomRequest.lastGrant(),accounts:playerProfile.names().map(name=>({name,...roomRequest.wallet(name)}))});
   if(req.headers.origin!==origin)return json(403,{error:'Local origin required'});if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Expected JSON'});
   let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>2048)return json(413,{error:'Request too large'});chunks.push(chunk)}
   try{const body=JSON.parse(Buffer.concat(chunks));if(!body||typeof body!=='object'||Array.isArray(body)||typeof body.account!=='string')return json(400,{error:'Choose a registered local account'});const name=playerProfile.names().find(name=>name.toLowerCase()===body.account.toLowerCase());if(!name)return json(404,{error:'Local account not found'});const {account,...command}=body;return json(200,roomRequest.grant(name,command))}catch(error){return json(error instanceof SyntaxError?400:error.status||500,{error:error instanceof SyntaxError?'Invalid JSON':error.status?error.message:'Could not save play-chip grant'})}
  }
  if(path==='/api/owner-reports'){
   if(req.method==='GET')return json(200,roomRequest.notes.getReports());
   let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>4096)return json(413,{error:'Request too large'})}
   try{const command=JSON.parse(text);if(!command||typeof command!=='object'||Array.isArray(command))return json(400,{error:'Invalid review command'});return json(200,roomRequest.notes.reviewReport(command.id,command))}catch(error){return json(error instanceof SyntaxError?400:error.status||500,{error:error.status?error.message:error instanceof SyntaxError?'Invalid JSON':'Could not save report review'})}
  }
  if(path==='/api/owner-tournaments'){
   let command={};if(req.method==='POST'){
    if(req.headers.origin!==origin)return json(403,{error:'Local origin required'});if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Expected JSON'});
    let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>2048)return json(413,{error:'Request too large'})}try{command=JSON.parse(text);if(!command||typeof command!=='object'||Array.isArray(command))throw Error()}catch{return json(400,{error:'Invalid JSON'})}
   }
   const table=tables.find(t=>t.id===(req.method==='GET'?new URL(req.url,origin).searchParams.get('table'):command.tableId));if(!table)return json(404,{error:'Unknown hosted table'});
   try{const result=roomRequest(hostedId(table.id),req.method==='GET'?'owner-tournament':'tournament-control',null,command,table);
    let auditSaved=true;if(result.changed)try{appendFileSync(join(directory,'owner-audit.jsonl'),JSON.stringify({at:new Date().toISOString(),action:command.action+'-tournament',before:null,after:{...table,tournamentControl:result}})+'\n',{mode:0o600})}catch{auditSaved=false}return json(200,{...result,auditSaved});
   }catch(error){return json(error.status||500,{error:error.status?error.message:'Could not save tournament control'})}
  }
  if(path==='/api/owner-seats'){
   let command={};if(req.method==='POST'){
    if(req.headers.origin!==origin)return json(403,{error:'Local origin required'});if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Expected JSON'});
    let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>2048)return json(413,{error:'Request too large'})}try{command=JSON.parse(text);if(!command||typeof command!=='object'||Array.isArray(command))throw Error()}catch{return json(400,{error:'Invalid JSON'})}
   }
   const table=tables.find(t=>t.id===(req.method==='GET'?new URL(req.url,origin).searchParams.get('table'):command.tableId));if(!table)return json(404,{error:'Unknown hosted table'});
   try{const result=roomRequest(hostedId(table.id),req.method==='GET'?'owner-seats':'remove-seat',null,command,table);if(req.method==='GET')return json(200,result);
    let auditSaved=true;try{appendFileSync(join(directory,'owner-audit.jsonl'),JSON.stringify({at:new Date().toISOString(),action:result.removed.entryRefund!==undefined?'withdraw-registration':'remove-seat',before:null,after:{...table,removed:result.removed}})+'\n',{mode:0o600})}catch{auditSaved=false}return json(200,{...result,auditSaved});
   }catch(error){return json(error.status||500,{error:error.status?error.message:'Could not remove player'})}
  }
  if(path==='/api/owner-chat'){
   let command={};
   if(req.method==='POST'){let text='';for await(const chunk of req){text+=chunk;if(text.length>4096)return json(413,{error:'Request too large'})}try{command=JSON.parse(text);if(!command||typeof command!=='object'||Array.isArray(command))throw Error()}catch{return json(400,{error:'Invalid JSON'})}}
   const table=tables.find(t=>t.id===(req.method==='GET'?new URL(req.url,origin).searchParams.get('table'):command.tableId));if(!table)return json(404,{error:'Unknown hosted table'});
   try{
    const result=roomRequest(hostedId(table.id),req.method==='GET'?'moderation':'moderate-chat',null,command,table);
    if(req.method==='GET')return json(200,result);
    let auditSaved=true;if(result.changed)try{appendFileSync(join(directory,'owner-audit.jsonl'),JSON.stringify({at:new Date().toISOString(),action:command.muted?'mute-chat':'unmute-chat',before:null,after:{...table,moderation:{seat:command.seat,name:result.moderated.name,muted:command.muted}}})+'\n',{mode:0o600})}catch{auditSaved=false}
    return json(200,{...result,auditSaved});
   }catch(error){return json(error.status||500,{error:error.status?error.message:'Could not save chat moderation'})}
  }
  if(backup?.[2]){
   if(req.method!=='POST')return json(405,{error:'Use POST to restore'});if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Expected JSON'});
   let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>4096)return json(413,{error:'Request too large'})}let command;try{command=JSON.parse(text)}catch{return json(400,{error:'Invalid JSON'})}
   if(!command||command.confirm!==backup[1])return json(400,{error:'Confirm the exact backup ID before replacing local state'});
   if(restoring||restoreBlocked)return json(503,{error:'Another recovery is in progress; retry shortly'});restoring=true;try{
    const until=Date.now()+5000;while(activeRequests>1){if(Date.now()>=until)return json(409,{error:'Other requests are still finishing; retry restoration'});await new Promise(resolve=>setTimeout(resolve,25))}
    if(roomRequest.hasActivePlay()||Object.values(rushRequests).some(r=>r.hasActivePlay()))return json(409,{error:'Finish active hands and tournaments before restoring'});
    const result=restoreOwnerBackup(directory,backup[1],tables,operation=>{const models=loadRestoredModels();appendFileSync(join(directory,'owner-audit.jsonl'),JSON.stringify({at:new Date().toISOString(),action:'restore',before:null,after:{name:'Local backup '+operation.id,backupId:operation.id,rescueId:operation.rescueId}})+'\n',{mode:0o600});return models});({playerProfile,roomRequest,rushRequests,tables}=result.loaded);return json(200,{restored:true,id:result.id,rescueId:result.rescueId});
   }catch(error){if(error.recoveryRequired)restoreBlocked=true;return json(error.status||500,{error:error.status?error.message:'Local restore failed',...(error.rescueId?{rescueId:error.rescueId}:{})})}finally{restoring=false}
  }
  if(backup&&req.method==='DELETE'){
   if(!backup[1])return json(405,{error:'Select a backup to delete'});if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Expected JSON'});
   let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>4096)return json(413,{error:'Request too large'})}let command;try{command=JSON.parse(text)}catch{return json(400,{error:'Invalid JSON'})}
   if(!command||command.confirm!==backup[1])return json(400,{error:'Confirm the exact backup ID before deleting it'});
   if(restoring||restoreBlocked)return json(503,{error:'Recovery in progress; deletion is blocked'});
  }
  if(backup){try{const result=ownerBackup(directory,req.method,backup[1],tables);if(backup[1]&&req.method==='GET')res.setHeader('Content-Disposition','attachment; filename="playgg-backup-'+backup[1]+'.json"');return json(200,result)}catch(error){return json(error.status||500,{error:error.status?error.message:'Could not complete backup operation'})}}
  if(path==='/api/owner-audit'){
   try{const file=join(directory,'owner-audit.jsonl');if(statSync(file).size>1048576)return json(413,{error:'Audit exceeds viewer limit; inspect the local audit file'});
    return json(200,readFileSync(file,'utf8').trim().split('\n').filter(Boolean).slice(-100).map(line=>JSON.parse(line)))}
   catch(error){if(error.code==='ENOENT')return json(200,[]);throw error}
  }
  let body='';for await(const c of req){body+=c;if(body.length>4096)return json(413,{error:'Request too large'})}
  let t;try{t=JSON.parse(body)}catch{return json(400,{error:'Invalid JSON'})}
  if(!t||typeof t.id!=='string'||!/^[a-z0-9-]{1,40}$/.test(t.id)||typeof t.name!=='string'||!t.name.trim()||t.name.length>60||!Number.isInteger(t.stack)||!Number.isInteger(t.blind)||t.blind<2||t.blind%2||t.stack<t.blind*4||t.stack>1000000||typeof t.open!=='boolean')return json(400,{error:'Invalid table settings'});
  if(t.mode!==undefined&&!['cash','plo','plo5','plo6','shortdeck','aof','tournament'].includes(t.mode))return json(400,{error:'Unknown format'});
  if(t.cardSqueeze!==undefined&&(typeof t.cardSqueeze!=='boolean'||t.cardSqueeze&&!['cash','plo','plo5','plo6','tournament'].includes(t.mode||'cash')))return json(400,{error:'Card Squeeze is available on Hold’em and Omaha tables only'});
  if(t.variant!==undefined&&(t.mode!=='tournament'||t.variant!=='plo'))return json(400,{error:'Unknown tournament game'});
  if(t.entryCost!==undefined&&(t.mode!=='tournament'||!Number.isSafeInteger(t.entryCost)||t.entryCost<0||t.entryCost>1000000))return json(400,{error:'Tournament entry must be 0–1000000 whole play chips'});
  if(t.tournamentSeats!==undefined&&(t.mode!=='tournament'||![3,4,6].includes(t.tournamentSeats)))return json(400,{error:'Tournament seats must be 3, 4 or 6'});
  if(t.prizeShares!==undefined){try{prizeAmounts(0,t.prizeShares);if(t.mode!=='tournament'||t.prizeShares.length>(t.tournamentSeats||4))throw Error()}catch{return json(400,{error:'Prize shares must be positive whole percentages totalling 100, with no more places than seats'})}}
  if(t.minBuyIn!==undefined||t.maxBuyIn!==undefined){if(!['cash','plo','plo5','plo6'].includes(t.mode||'cash')||!Number.isSafeInteger(t.minBuyIn)||!Number.isSafeInteger(t.maxBuyIn)||t.minBuyIn<t.blind*4||t.minBuyIn>t.stack||t.maxBuyIn<t.stack||t.maxBuyIn>1000000)return json(400,{error:'Cash buy-in limits must contain the starting stack, from 4 big blinds to 1000000 chips'})}
  if(t.timeBankSeconds!==undefined&&(!Number.isSafeInteger(t.timeBankSeconds)||t.timeBankSeconds<0||t.timeBankSeconds>3600))return json(400,{error:'Local time bank must be 0–3600 whole seconds'});
  if(t.timeChipCount!==undefined&&(!Number.isSafeInteger(t.timeChipCount)||t.timeChipCount<0||t.timeChipCount>100))return json(400,{error:'Free time cards must be 0–100 whole cards per seating'});
  if(t.timeChipCount&&t.timeBankSeconds)return json(400,{error:'Choose free time cards or a continuous time bank'});
  if(t.timeChipCount&&(!Number.isSafeInteger(t.freeTimeChipSecondsPerUnit)||t.freeTimeChipSecondsPerUnit<1||t.freeTimeChipSecondsPerUnit>300||!Number.isSafeInteger(t.maxTimeChipsPerAction)||t.maxTimeChipsPerAction<1||t.maxTimeChipsPerAction>10))return json(400,{error:'Free cards require 1–300 seconds per card and 1–10 cards per turn'});
  if(!t.timeChipCount&&(t.freeTimeChipSecondsPerUnit!==undefined||t.maxTimeChipsPerAction!==undefined))return json(400,{error:'Enable free cards before configuring their duration and turn limit'});
  if(t.hotTimeSeconds!==undefined&&(!t.timeBankSeconds||!Number.isSafeInteger(t.hotTimeSeconds)||t.hotTimeSeconds<1||t.hotTimeSeconds>(t.actionSeconds??90)))return json(400,{error:'Hot time must be 1 through the action time, with a time bank enabled'});
  if(t.actionSeconds!==undefined&&(!Number.isSafeInteger(t.actionSeconds)||t.actionSeconds<5||t.actionSeconds>300))return json(400,{error:'Action time must be 5–300 whole seconds'});
  if(t.levelSeconds!==undefined&&(t.mode!=='tournament'||!Number.isSafeInteger(t.levelSeconds)||t.levelSeconds<1||t.levelSeconds>3600))return json(400,{error:'Tournament blind levels must last 1–3600 whole seconds'});
  if(t.ante!==undefined&&(t.mode!=='tournament'||!Number.isSafeInteger(t.ante)||t.ante<0||t.ante>=t.stack))return json(400,{error:'Starting ante must be a whole per-player amount below the tournament stack'});
  const previous=tables.find(x=>x.id===t.id);
  if(t.startsAt!==undefined&&(t.mode!=='tournament'||!Number.isSafeInteger(t.startsAt)||t.startsAt<=0||t.startsAt>8640000000000000||(!previous&&t.startsAt<=Date.now())))return json(400,{error:'Choose a future tournament start time'});
  if(previous&&((previous.cardSqueeze===true)!==(t.cardSqueeze===true)||(previous.actionSeconds??90)!==(t.actionSeconds??90)||(previous.timeChipCount||0)!==(t.timeChipCount||0)||(previous.freeTimeChipSecondsPerUnit||0)!==(t.freeTimeChipSecondsPerUnit||0)||(previous.maxTimeChipsPerAction||0)!==(t.maxTimeChipsPerAction||0)||(previous.timeBankSeconds||0)!==(t.timeBankSeconds||0)||(previous.timeBankSeconds?(previous.hotTimeSeconds??5):0)!==(t.timeBankSeconds?(t.hotTimeSeconds??5):0)||(previous.entryCost??25)!==(t.entryCost??25)||previous.stack!==t.stack||previous.blind!==t.blind||previous.name!==t.name||(previous.ante||0)!==(t.ante||0)||(previous.minBuyIn??previous.stack)!==(t.minBuyIn??t.stack)||(previous.maxBuyIn??previous.stack)!==(t.maxBuyIn??t.stack)||(previous.mode||'cash')!==(t.mode||'cash')||(previous.tournamentSeats||4)!==(t.tournamentSeats||4)||(previous.startsAt||null)!==(t.startsAt||null)||(previous.levelSeconds??null)!==(t.levelSeconds??null)||(previous.variant||'holdem')!==(t.variant||'holdem')||JSON.stringify(previous.prizeShares||[100])!==JSON.stringify(t.prizeShares||[100]))&&roomRequest(hostedId(t.id),'summary').occupied)return json(409,{error:'Occupied table: keep its settings or create another table ID'});
  const next=tables.filter(x=>x.id!==t.id).concat({id:t.id,name:t.name.trim(),stack:t.stack,blind:t.blind,open:t.open,...(t.actionSeconds!==undefined?{actionSeconds:t.actionSeconds}:{}),...(t.timeBankSeconds?{timeBankSeconds:t.timeBankSeconds,hotTimeSeconds:t.hotTimeSeconds??5}:{}),...(t.timeChipCount?{timeChipCount:t.timeChipCount,freeTimeChipSecondsPerUnit:t.freeTimeChipSecondsPerUnit,maxTimeChipsPerAction:t.maxTimeChipsPerAction}:{}),...(t.cardSqueeze?{cardSqueeze:true}:{}),...(t.ante!==undefined?{ante:t.ante}:{}),...(t.levelSeconds!==undefined?{levelSeconds:t.levelSeconds}:{}),...(t.minBuyIn!==undefined?{minBuyIn:t.minBuyIn,maxBuyIn:t.maxBuyIn}:{}),...(t.entryCost!==undefined?{entryCost:t.entryCost}:{}),...(t.prizeShares!==undefined?{prizeShares:t.prizeShares}:{}),...(t.variant?{variant:t.variant}:{}),...(t.startsAt!==undefined?{startsAt:t.startsAt}:{}),...(t.tournamentSeats!==undefined?{tournamentSeats:t.tournamentSeats}:{}),...(t.mode&&t.mode!=='cash'?{mode:t.mode}:{})});
  writeFileSync(db+'.tmp',JSON.stringify(next),{mode:0o600});renameSync(db+'.tmp',db);tables=next;
  let auditSaved=true;
  try{appendFileSync(join(directory,'owner-audit.jsonl'),JSON.stringify({at:new Date().toISOString(),action:previous?'update':'create',before:previous||null,after:next.find(x=>x.id===t.id)})+'\n',{mode:0o600})}
  catch{auditSaved=false;console.error('Table saved but owner audit could not be written')}
  return json(200,{saved:true,auditSaved})
 }
 const file=path==='/'?'lobby.html':path.slice(1);
 if(req.method!=='GET'||!files.has(file))return json(404,{error:'Not found'});
 const data=await readFile(fileURLToPath(new URL(file,import.meta.url)));
 res.writeHead(200,{'Content-Type':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html; charset=utf-8':'text/javascript','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(data)
 }catch{if(!res.headersSent)json(500,{error:'Local operation failed'});else res.end()}finally{activeRequests--}
}).listen(port,host,()=>console.log('River Room: '+origin+' · owner key file: '+keyPath));
