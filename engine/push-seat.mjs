export function pushSeatInterval(from,to){if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||from>5||to<0||to>5||from===to)throw Error('Invalid Push Seat interval');const seats=[];for(let i=(from+1)%6;;i=(i+1)%6){seats.push(i);if(i===to)return seats}}
// Explicit local policy; native displacement, entitlement and blind rules are unobserved.
export function pushSeatPlan(input,policy){
 const bad=()=>{throw Error('Invalid local Push Seat snapshot')},fields=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===keys.length&&Object.keys(x).every(k=>keys.includes(k)),seat=n=>Number.isInteger(n)&&n>=0&&n<6;
 if(policy!=='local-idle-seat-rotation-v1')throw Error('Choose the explicit local Push Seat policy');
 if(!fields(input,['seats','playing','reservations','blocked'])||!Array.isArray(input.seats)||input.seats.length!==6||typeof input.playing!=='boolean'||!Array.isArray(input.reservations)||input.reservations.length>1||!Array.isArray(input.blocked)||input.blocked.length>6||input.blocked.some(n=>!seat(n))||new Set(input.blocked).size!==input.blocked.length)bad();
 const positions=new Map();let total=0n;
 for(const [i,p]of input.seats.entries()){if(p===null)continue;if(!fields(p,['id','stack'])||typeof p.id!=='string'||!/^[a-zA-Z0-9:_-]{1,128}$/.test(p.id)||positions.has(p.id)||!Number.isSafeInteger(p.stack)||p.stack<0)bad();positions.set(p.id,i);total+=BigInt(p.stack)}
 if(total>BigInt(Number.MAX_SAFE_INTEGER))bad();
 const edges=new Map(),targets=new Set(),requested=new Set();
 for(const r of input.reservations){if(!fields(r,['player','target'])||typeof r.player!=='string'||!positions.has(r.player)||!seat(r.target)||positions.get(r.player)===r.target||input.blocked.includes(r.target)||targets.has(r.target)||requested.has(r.player))bad();if(pushSeatInterval(positions.get(r.player),r.target).some(i=>input.blocked.includes(i)))bad();edges.set(positions.get(r.player),r.target);targets.add(r.target);requested.add(r.player)}
 const seats=structuredClone(input.seats);if(input.playing)return {policy,seats,moves:[],pending:edges.size>0};
 // Source EN specifies counter-clockwise shifts; the circular interval includes empty positions.
 if(edges.size){const [from,to]=edges.entries().next().value,moving=structuredClone(input.seats[from]);for(let i=from;i!==to;i=(i+1)%6)seats[i]=structuredClone(input.seats[(i+1)%6]);seats[to]=moving}
 const moves=seats.flatMap((p,to)=>p&&positions.get(p.id)!==to?[{player:p.id,from:positions.get(p.id),to,stack:p.stack,requested:requested.has(p.id)}]:[]);
 return {policy,seats,moves,pending:false};
}
