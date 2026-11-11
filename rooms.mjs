import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import {createHash,randomBytes} from 'node:crypto';
import {startHand,act,options} from './engine/table.mjs';
import {blindLevel} from './blind-level.mjs';
import {visibleCards} from './room-view.mjs';
const buyIns=[30,70,100,100], hour=3600000, turnMs=90000;
const fail=(status,message)=>{throw Object.assign(Error(message),{status})};
const entry=25, initialStack=100;
const intervalMs=Number(process.env.POKER_LEVEL_MS||60000);
if(!Number.isSafeInteger(intervalMs)||intervalMs<1000)throw Error('POKER_LEVEL_MS must be at least 1000');
function nextSeat(stacks,after){for(let j=1;j<=stacks.length;j++){const i=(after+j)%stacks.length;if(stacks[i])return i}}
function tournamentHand(r,now){
  const t=r.tournament,stacks=r.hand?.stacks||Array(4).fill(initialStack);
  let button=0;
  if(r.hand){
    button=nextSeat(stacks,r.hand.button);
    if(stacks.filter(Boolean).length===2)button=nextSeat(stacks,nextSeat(stacks,r.hand.bigBlindSeat));
  }
  const level=blindLevel(t.startedAt,now,t.intervalMs);
  t.level=level.level;t.nextDealAt=null;r.number++;r.hand=startHand(stacks,level.bigBlind,button);
  r.deadline=now+turnMs;r.version++;
  if(r.hand.end)record(r);
}
function record(room){
  const g=room.hand;if(!g.end)return;
  const result={number:room.number,board:[...g.board],history:[...g.history],committed:[...g.committed],payouts:[...g.end.payouts],returns:[...g.end.returns],stacks:[...g.stacks]};
  room.results.push(result);if(room.results.length>20)room.results.shift();
  room.ready.fill(false);
  const t=room.tournament;if(!t)return;
  for(let i=0;i<4;i++)if(!g.stacks[i]&&!t.out[i])t.out[i]=room.number;
  const remaining=g.stacks.flatMap((s,i)=>s?[i]:[]);
  if(remaining.length===1){
    t.winner=remaining[0];t.prizes=t.out.map((_,i)=>i===t.winner?t.pool:0);
    t.nextDealAt=null;
  }else t.nextDealAt=Date.now()+3000;
}
function step(room,action,target){
  try{act(room.hand,action,target)}catch{fail(400,'Illegal action')}
  room.version++;room.deadline=Date.now()+turnMs;record(room);
}
function handle(rooms,id,op,token,body){
  if(!/^[a-f0-9]{48}$/.test(id))fail(404,'Unknown room');
  const now=Date.now();
  for(const [k,r] of rooms)if(now-r.touched>4*hour)rooms.delete(k);
  let r=rooms.get(id);
  if(op==='join'&&(typeof body.name!=='string'||!body.name.trim()||body.name.trim().length>24))fail(400,'Enter a name (1–24 characters)');
  if(!r){
    if(op!=='join')fail(404,'Room not found');
    if(rooms.size>=100)fail(503,'Room limit reached');
    r={tournament:body.mode==='tournament'?{entry,pool:0,intervalMs,startedAt:null,level:1,out:Array(4).fill(null),winner:null,prizes:null,nextDealAt:null}:null,players:Array(4).fill(null),ready:Array(4).fill(false),number:0,version:0,hand:null,results:[],touched:now};rooms.set(id,r);
  }
  let me=token?r.players.findIndex(p=>p&&p.digest===digest(token)):-1,issued;
  if(op==='join'&&me<0){
    const name=body.name?.trim?.();if(!name||name.length>24)fail(400,'Enter a name (1–24 characters)');
    me=r.players.indexOf(null);if(me<0)fail(409,'Room is full');
    issued=randomBytes(32).toString('hex');r.players[me]={name,digest:digest(issued)};if(r.tournament)r.tournament.pool+=entry;r.version++;
    if(!r.players.includes(null)&&r.tournament){r.tournament.startedAt=now;tournamentHand(r,now)}
    else if(!r.players.includes(null)){r.number=1;r.hand=startHand(buyIns,4,0);r.deadline=now+turnMs}
  }
  if(me<0)fail(401,'Join this room first');
  r.touched=now;
  if(r.tournament?.nextDealAt!=null&&now>=r.tournament.nextDealAt)tournamentHand(r,now);
  if(r.hand&&!r.hand.end&&now>=r.deadline)step(r,options(r.hand).due?'fold':'check');
  if(['act','ready','leave'].includes(op)){
    if(body.version!==r.version)fail(409,'Table changed; refresh and try again');
    if(op==='act'){
      if(!r.hand||r.hand.end||r.hand.turn!==me)fail(409,'Not your turn');
      step(r,body.action,body.target);
    }else if(op==='ready'){
      if(r.tournament)fail(409,'No rebuys or ready actions in tournaments');
      if(!r.hand?.end)fail(409,'Hand is not finished');
      r.ready[me]=true;r.version++;
      if(r.ready.every(Boolean)){
        const stacks=r.hand.stacks.map((s,i)=>s||buyIns[i]);
        r.number++;r.hand=startHand(stacks,4,(r.number-1)%4);r.deadline=now+turnMs;r.ready.fill(false);
      }
    }else{
      if(r.hand)fail(409,'Leaving is only available before the first hand');
      r.players[me]=null;if(r.tournament)r.tournament.pool-=entry;r.version++;return {left:true};
    }
  }
  const g=r.hand;
  return {me,issued,tournament:r.tournament,version:r.version,number:r.number,names:r.players.map(p=>p?.name??null),ready:r.ready,results:r.results,
    hand:g&&{blind:g.blind,button:g.button,turn:g.turn,deadline:g.end?null:r.deadline,stacks:g.stacks,committed:g.committed,folded:g.folded,board:g.board,
      cards:visibleCards(g,me),history:g.history,end:g.end,options:g.turn===me?options(g):null}};
}

const digest=token=>createHash('sha256').update(token).digest('hex');
export function openRooms(file){
  let rooms=new Map();
  try{rooms=new Map(JSON.parse(readFileSync(file,'utf8')))}catch(e){if(e.code!=='ENOENT')throw e}
  return (id,op,token,body)=>{
    const old=rooms.get(id),version=old?.version;
    try{return handle(rooms,id,op,token,body)}finally{
    if(rooms.get(id)?.version!==version){
      try{
        writeFileSync(file+'.tmp',JSON.stringify([...rooms]),{mode:0o600});
        renameSync(file+'.tmp',file);
      }catch(e){
        // Discard the unacknowledged update; reload the last committed snapshot.
        try{rooms=new Map(JSON.parse(readFileSync(file,'utf8')))}catch(err){if(err.code!=='ENOENT')throw err;rooms=new Map()}
        throw e;
      }
    }
    }
  };
}
