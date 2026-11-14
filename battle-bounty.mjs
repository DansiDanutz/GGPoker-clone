import {isDeepStrictEqual} from 'node:util';
import {settlePots} from './engine/pots.mjs';
import {best,compare} from './game.mjs';
// Local knockout policy: winners of the victim's highest contested pot, ordered clockwise after the dealer.
export function battleBountyKnockouts(g,accounts,hand){
 if(!g?.end||!Array.isArray(accounts)||accounts.length<2||accounts.length>6||new Set(accounts).size!==accounts.length||Array.from(accounts).some(id=>typeof id!=='string'||!/^[a-z0-9][a-z0-9_-]{1,19}$/.test(id))||!Number.isSafeInteger(hand)||hand<1||!Array.isArray(g.initialStacks)||!Array.isArray(g.stacks)||g.initialStacks.length!==accounts.length||g.stacks.length!==accounts.length||g.committed?.length!==accounts.length||g.folded?.length!==accounts.length||!Array.isArray(g.hands)||g.hands.length!==accounts.length||!Array.isArray(g.board)||[...g.initialStacks,...g.stacks].some(n=>!Number.isSafeInteger(n)||n<0))throw Error('Invalid Battle bounty hand');
 const end=settlePots(g.committed,g.folded,g.button,(a,b)=>compare(best([...g.hands[a],...g.board]),best([...g.hands[b],...g.board])));
 if(!isDeepStrictEqual(end,g.end)||g.stacks.some((n,i)=>n!==g.initialStacks[i]-g.committed[i]+end.payouts[i]))throw Error('Invalid Battle bounty settlement');
 const distance=seat=>(seat-g.button-1+accounts.length)%accounts.length,requests=[];
 for(const seat of accounts.map((_,i)=>i).sort((a,b)=>distance(a)-distance(b))){
  if(!g.initialStacks[seat]||g.stacks[seat]!==0)continue;const pot=end.pots.findLastIndex(p=>p.eligible.includes(seat));if(pot<0)throw Error('No contested bounty pot');
  const hunters=end.pots[pot].payouts.flatMap((n,i)=>n>0?[i]:[]).sort((a,b)=>distance(a)-distance(b)).map(i=>accounts[i]);if(!hunters.length||hunters.includes(accounts[seat]))throw Error('Invalid Battle bounty hunters');requests.push({hand,pot,victim:accounts[seat],hunters});
 }
 return requests;
}
// Explicit local policy: finite inventory, no replacement, equal hunter shares with odd credits in caller-supplied order.
export function battleBounty(items,capital,checkpoint=null){
 if(!Array.isArray(items)||items.length<1||items.length>100||Array.from(items).some(p=>!p||Object.keys(p).sort().join(',')!=='amount,frequency'||!Number.isSafeInteger(p.amount)||p.amount<1||!Number.isSafeInteger(p.frequency)||p.frequency<1||p.frequency>10000)||new Set(items.map(p=>p.amount)).size!==items.length||items.reduce((n,p)=>n+p.frequency,0)>10000||!Number.isSafeInteger(capital)||capital<1||capital>1000000000||items.reduce((n,p)=>n+p.amount*p.frequency,0)!==capital)throw Error('Invalid Battle bounty inventory or capital');
 items=structuredClone(items);const remaining=items.map(p=>p.frequency),awards=[],account=id=>typeof id==='string'&&/^[a-z0-9][a-z0-9_-]{1,19}$/.test(id);
 const count=()=>remaining.reduce((a,b)=>a+b,0);
 function draw(input,ticket){
  if(!input||Object.keys(input).sort().join(',')!=='hand,hunters,pot,victim'||!Number.isSafeInteger(input.hand)||input.hand<1||!Number.isInteger(input.pot)||input.pot<0||input.pot>8||!account(input.victim)||!Array.isArray(input.hunters)||input.hunters.length<1||input.hunters.length>6||Array.from(input.hunters).some(id=>!account(id)||id===input.victim)||new Set(input.hunters).size!==input.hunters.length)throw Error('Invalid Battle bounty award request');
  const prior=awards.find(a=>a.victim===input.victim);
  if(prior){if(prior.hand!==input.hand||prior.pot!==input.pot||prior.ticket!==ticket||!isDeepStrictEqual(prior.hunters.map(p=>p.account),input.hunters))throw Error('Battle bounty victim already awarded');return structuredClone(prior)}
  const available=count();if(!available)throw Error('Battle bounty inventory exhausted');if(!Number.isSafeInteger(ticket)||ticket<0||ticket>=available)throw Error('Invalid Battle bounty ticket');
  let index=0,offset=ticket;while(offset>=remaining[index]){offset-=remaining[index];index++}
  const amount=items[index].amount,receipt={hand:input.hand,pot:input.pot,victim:input.victim,ticket,amount,hunters:input.hunters.map((account,i)=>({account,amount:Math.floor(amount/input.hunters.length)+Number(i<amount%input.hunters.length)}))};
  remaining[index]--;awards.push(receipt);return structuredClone(receipt);
 }
 if(checkpoint!==null){try{
  if(typeof checkpoint!=='string')throw Error();const saved=JSON.parse(checkpoint);if(!saved||Object.keys(saved).sort().join(',')!=='awards,capital,items,version'||saved.version!==1||saved.capital!==capital||!isDeepStrictEqual(saved.items,items)||!Array.isArray(saved.awards)||saved.awards.length>count())throw Error();
  for(const a of saved.awards){if(!a||!Array.isArray(a.hunters))throw Error();const receipt=draw({hand:a.hand,pot:a.pot,victim:a.victim,hunters:a.hunters.map(p=>p.account)},a.ticket);if(!isDeepStrictEqual(receipt,a))throw Error()}
  if(awards.length!==saved.awards.length)throw Error();
 }catch{throw Error('Invalid Battle bounty checkpoint')}}
 function summary(){const balance=remaining.reduce((n,f,i)=>n+f*items[i].amount,0);return {capital,remainingCount:count(),remaining:balance,paid:capital-balance,awards:structuredClone(awards)}}
 const snapshot=()=>JSON.stringify({version:1,items,capital,awards});return {draw,summary,snapshot};
}

// Public jackpot history uses only already disclosed cards, never the participant-private projection.
export function battleBountyPublicHand(room,awards,number){
 if(!Number.isSafeInteger(number)||number<1)throw Error('Invalid bounty hand number');
 const matching=awards.filter(a=>a.hand===number),h=room?.hudHistory?.find(h=>h.number===number),r=h?.result;if(!matching.length||!r||r.number!==number)return null;
 return structuredClone({number,at:h.at,variant:h.variant||'holdem',blind:h.blind,button:h.button,names:h.names,avatars:h.avatars||[],cards:h.cards,board:r.board,committed:r.committed,payouts:r.payouts,returns:r.returns,stacks:r.stacks,history:r.history,awards:matching.map(a=>({pot:a.pot,victim:a.victim,amount:a.amount,hunters:a.hunters}))});
}

export function readBattleBountyArchive(hands,awards,accounts,total){
 try{
  if(!Array.isArray(hands)||hands.length>new Set(awards.map(a=>a.hand)).size||new Set(hands.map(h=>h?.number)).size!==hands.length)throw Error();
  for(const h of hands){
   const n=accounts.length,money=v=>Array.isArray(v)&&v.length===n&&v.every(x=>Number.isSafeInteger(x)&&x>=0&&x<=total),card=c=>typeof c==='string'&&/^[2-9TJQKA][cdhs]$/.test(c);
   if(!h||!Number.isSafeInteger(h.number)||h.number<1||h.variant!=='holdem'||!Number.isSafeInteger(h.at)||h.at<0||h.at>8640000000000000||!Number.isSafeInteger(h.blind)||h.blind<2||h.blind%2||!Number.isInteger(h.button)||h.button<0||h.button>=n||!isDeepStrictEqual(h.names,accounts)||!Array.isArray(h.avatars)||![0,n].includes(h.avatars.length)||h.avatars.some(a=>!(Number.isInteger(a)&&a>=0&&a<=6)&&!(typeof a==='string'&&/^\/local\/avatar-images\/[a-f0-9]{64}\.png$/.test(a)))||!Array.isArray(h.board)||h.board.length>5||h.board.some(c=>!card(c))||!Array.isArray(h.cards)||h.cards.length!==n||h.cards.some(v=>v!==null&&(!Array.isArray(v)||![0,2].includes(v.length)||v.some(c=>c!==null&&!card(c))))||!money(h.committed)||!money(h.payouts)||!money(h.returns)||!money(h.stacks)||h.returns.some((v,i)=>v>h.payouts[i])||h.stacks.reduce((a,b)=>a+b,0)!==total||h.committed.reduce((a,b)=>a+b,0)!==h.payouts.reduce((a,b)=>a+b,0)||!Array.isArray(h.history)||h.history.some(v=>typeof v!=='string'))throw Error();
   const cards=[...h.board,...h.cards.flatMap(v=>v||[])].filter(Boolean);if(new Set(cards).size!==cards.length||!isDeepStrictEqual(h,battleBountyPublicHand({hudHistory:[{...h,result:h}]},awards,h.number)))throw Error();
  }
  return structuredClone(hands);
 }catch{throw Error('Invalid public bounty archive')}
}
