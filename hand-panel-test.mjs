import assert from 'node:assert/strict';
globalThis.Image=class{};globalThis.document={querySelector:()=>null};globalThis.localStorage={getItem:()=>null};globalThis.addEventListener=()=>{};const {currentHandRank,sessionDuration,bestFiveMotion}=await import('./hand-panel.mjs');
assert.deepEqual(currentHandRank(['As','Kd'],[]).cards,[{card:'As',hole:true},{card:'Kd',hole:true}]);
assert.match(currentHandRank(['As','Ad'],[]).label,/pair of As/);
assert.deepEqual(currentHandRank(['As','Kd','Kh','2d'],[]).cards.map(c=>c.card),['Kd','Kh'],'Native preflop any pair outranks high cards');
assert.equal(currentHandRank(['As',null],[]),null);assert.equal(currentHandRank(['As','As'],[]),null);assert.equal(currentHandRank(['As','Kd'],['2c']),null);
const own=['As','Ad'],board=['Ah','Kh','Qh'];const saved=JSON.stringify([own,board]);assert.equal(currentHandRank(own,board).cards.length,5);assert.match(currentHandRank(own,board).label,/three of a kind/);assert.equal(JSON.stringify([own,board]),saved);
for(const n of [4,5,6]){const h=['9h','8h','2c','3c','3d','7d'].slice(0,n);for(const b of [['Ah','Kh','Qh'],['Ah','Kh','Qh','Jh'],['Ah','Kh','Qh','Jh','Th']])assert.equal(currentHandRank(h,b).cards.filter(c=>c.hole).length,2)}
assert.match(currentHandRank(['Ah','Kh'],['6c','7d','8s','9h'],true).label,/straight/);assert.match(currentHandRank(['Ah','Kh'],['Qh','Jh','9h','As','Ad'],true).label,/flush/);
assert.ok(currentHandRank(['2s','Kd'],[],true)===null);assert.equal(currentHandRank(['As','Kd'],['As','2h','3h']),null);
console.log('PASS current own HandRank:preflop pair choice,known flop/turn/river,exact-two Omaha,ShortDeck,privacy/malformed guards and immutable input');

const now=1700000000000;for(const [elapsed,text]of [[0,'00m 00s'],[61000,'01m 01s'],[3599000,'59m 59s'],[3600000,'01h 00m'],[3661000,'01h 01m']])assert.equal(sessionDuration(now-elapsed,now),text);for(const start of [undefined,null,-1,1.5,NaN,Infinity])assert.equal(sessionDuration(start,now),'-');assert.equal(sessionDuration(now+1000,now),'00m 00s');console.log('PASS native session duration:seconds/minutes,hour boundary,unknown inputs andclock-skew clamp');

assert.equal(currentHandRank(['Ah','Kh'],['Qh','Jh','2c']).drawKey,'RoyalStraightFlushDraw');assert.equal(currentHandRank(['Ah','Kh'],['Qh','Jh','2c','3d','4c']).drawKey,'');assert.equal(currentHandRank(['Ah','Kh','2d','3d'],['Qh','Jh','2c']).drawKey,'');console.log('PASS current-hand draw wiring:known flop hint,river hidden andOmaha excluded');

const oldCards=[{card:'Ah',hole:true},{card:'Kh',hole:true}],newCards=[...oldCards,{card:'Qh',hole:false},{card:'Jh',hole:false},{card:'2c',hole:false}];const first=bestFiveMotion([],oldCards);assert.equal(first.out,0);assert.deepEqual(first.cards.map(c=>[c.from,c.to,c.y,c.delay,c.duration]),[[0,0,44,500,300],[103,103,44,500,300]]);const flop=bestFiveMotion(oldCards,newCards);assert.equal(flop.out,200);assert.deepEqual(flop.fadeOut,[2,3,4]);assert.equal(flop.cards[0].duration,500);assert.equal(flop.cards[2].delay,500);assert.equal(flop.cards[2].y,68);const turn=bestFiveMotion(newCards,[newCards[2],newCards[0],newCards[1],{card:'3d',hole:false},newCards[3]]);assert.equal(turn.cards[0].from,206);assert.equal(turn.cards[0].to,0);assert.deepEqual(turn.fadeOut,[3],'Native fades the slot of each new card,not a generic removed-identity diff');assert.throws(()=>bestFiveMotion(oldCards,[{card:'?',hole:true}]));console.log('PASS source best-five motion:initial500+300,update200+500+300,retained-card positions,own/board heights andnative slot-fade rule');

for(const [hole,board,short,label]of [
 [['4s','8d'],['5c','6h','7s'],false,'a straight, 4 to 8'],
 [['As','2d'],['3c','4h','5s'],false,'a straight, A to 5'],
 [['Ah','6d'],['7c','8h','9s'],true,'a straight, A to 9'],
 [['Ah','8h'],['2h','4h','6h'],false,'a flush A high'],
 [['4h','8h'],['5h','6h','7h'],false,'a straight flush, 4 to 8'],
 [['Ah','2h'],['3h','4h','5h'],false,'a straight flush, A to 5'],
 [['Ah','6h'],['7h','8h','9h'],true,'a straight flush, A to 9'],
 [['Ah','Kh'],['Qh','Jh','Th'],false,'a royal flush']
])assert.equal(currentHandRank(hole,board,short).label,label);
console.log('PASS native hand descriptions:straight endpoints,normal/ShortDeck ace-low,flush highcard,straightflush androyal');

for(const [hole,board,label]of [
 [['As','Kd'],['2c','5h','8s'],'A high'],
 [['As','Ad'],['2c','5h','8s'],'a pair of As'],
 [['As','Kd'],['Ac','Kh','8s'],'two pair, As and Ks'],
 [['As','Ad'],['Ac','Kh','8s'],'three of a kind, As'],
 [['As','Ad'],['Ac','Kh','Ks'],'a full house, As full of Ks'],
 [['As','Ad'],['Ac','Ah','Ks'],'four of a kind, As'],
 [['6s','Td'],['7c','8h','9s'],'a straight, 6 to T'],
 [['Ah','Kh','2c','3c'],['Qh','Jh','Th','6d','7s'],'a royal flush']
])assert.equal(currentHandRank(hole,board).label,label);
assert.equal(currentHandRank(['Ts','Td'],[]).label,'a pair of Ts');
console.log('PASS all native description templates andT rank abbreviation;Omaha exact-two royal andpreflop pair');
