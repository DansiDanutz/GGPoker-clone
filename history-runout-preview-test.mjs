import assert from 'node:assert/strict';
globalThis.Image=class{};globalThis.document={querySelector:()=>null};globalThis.localStorage={getItem:()=>null};globalThis.addEventListener=()=>{};
const {historyPreviewLayout,historyWinningRunCards}=await import('./felt.mjs');
const hand={mode:'cash',variant:'holdem',names:['A','B','C','D','E','F'],seat:2,viewerSeat:2,button:0,folded:[true,true,false,true,false,true],initialStacks:Array(6).fill(120),committed:[4,4,120,4,120,4],payouts:[0,0,256,0,0,0],returns:Array(6).fill(0),stacks:[116,116,256,116,0,116],board:['2c','3d','4h','5s','9c'],cards:[null,null,['Ac','Kh'],null,['Qc','Qh'],null]};
const boards=[hand.board,['2c','3d','4h','6s','Tc'],['2c','3d','4h','7s','Jc']],input={...hand,runoutBoards:boards,runoutDecision:{runs:3}},before=structuredClone(input),layout=historyPreviewLayout(input);
assert.equal(layout.runoutCards?.length,9,'Three-run flop history must render the shared prefix once plus each distinct suffix');
assert.deepEqual(layout.runoutCards.map(c=>[c.run,c.slot,c.card]),[[0,0,'2c'],[0,1,'3d'],[0,2,'4h'],[0,3,'5s'],[0,4,'9c'],[1,3,'6s'],[1,4,'Tc'],[2,3,'7s'],[2,4,'Jc']]);
for(const card of layout.runoutCards){assert.ok(Math.abs(card.x-(320+(card.slot*59-118)*.9))<1e-9);assert.ok(Math.abs(card.y-(280+(card.run*42-82.5)*.9))<1e-9);assert.ok(Math.abs(card.width-54.9)<1e-9);assert.ok(Math.abs(card.height-72.9)<1e-9)}
assert.deepEqual(input,before);assert.equal(layout.totalPot,256);console.log('PASS source three-run history geometry, one shared flop prefix and immutable accounting');

for(const count of [2,3])for(const shared of [0,3,4]){
 const deck=['2c','3d','4h','5s','9c','6s','Tc','7s','Jc','8s','Kd','Jh','Th','8d','9d'],prefix=deck.slice(0,shared);let at=shared;
 const boards=Array.from({length:count},()=>[...prefix,...deck.slice(at,at+=5-shared)]),fixture={...hand,board:boards[0],cards:Array(6).fill(null),runoutBoards:boards,runoutDecision:{runs:count}},before=structuredClone(fixture),out=historyPreviewLayout(fixture);
 assert.equal(out.runoutCards.length,shared+count*(5-shared));assert.deepEqual(out.runoutCards.filter(c=>c.run===1).map(c=>c.card),boards[1].slice(shared));assert.ok(out.runoutCards.every(c=>Math.abs(c.y-(305-(count===2?15:25)+(c.run*42-82.5)*.9))<1e-9));assert.deepEqual(fixture,before);
}
for(const patch of [{runoutBoards:[]},{runoutBoards:[...boards,boards[0]]},{runoutDecision:{runs:2}},{runoutBoards:[boards[0],['2c','3d','6h','5s','Tc']]},{runoutBoards:[boards[0],['2c','3d','4h','Ac','Tc']]},{runoutBoards:[boards[0],['2c','3d','4h','XX','Tc']]},{runoutBoards:[boards[0],['2c','3d','4h','6s']]},{mode:'tournament'},{variant:'shortdeck'}]){const fixture={...input,...patch};if(Array.isArray(patch.runoutBoards))fixture.runoutDecision={runs:patch.runoutBoards.length};assert.equal(historyPreviewLayout(fixture),null,'Malformed or unsupported multi-run preview must not masquerade as the first board')};
assert.equal(historyPreviewLayout({...hand,runoutBoards:[hand.board],runoutDecision:{runs:1}}).runoutCards,undefined,'Single run keeps normal unscaled board');
assert.ok(historyPreviewLayout(input).players.every(p=>p.focus===null),'Holdem preview preserves both hole faces; ranked summary is separate');
console.log('PASS two/three run histories at preflop/flop/turn, invalid/private guards, single-run fallback and visible Holdem holes');

const paid={...input,pots:[{runs:[{payouts:[0,0,80,0,0,0]},{payouts:[0,0,0,0,80,0]},{payouts:[0,0,48,0,48,0]}]}]};
assert.deepEqual(historyWinningRunCards(paid,2).map(v=>v.run),[0,2]);assert.deepEqual(historyWinningRunCards(paid,4).map(v=>v.run),[1,2]);assert.deepEqual(historyWinningRunCards(paid,0),[]);for(const win of historyWinningRunCards(paid,2)){assert.equal(win.cards.length,5);assert.ok(win.cards.every(v=>(v.hole?paid.cards[2]:paid.runoutBoards[win.run]).includes(v.card)))}
assert.deepEqual(historyWinningRunCards({...paid,pots:[{runs:[{payouts:[1]}]}]},2),[]);assert.equal(historyWinningRunCards(hand,2).length,1);console.log('PASS summary ranks only actually awarded run boards, retains tied wins and rejects malformed allocations');
