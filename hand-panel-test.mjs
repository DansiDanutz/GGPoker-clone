import assert from 'node:assert/strict';
globalThis.Image=class{};globalThis.document={querySelector:()=>null};globalThis.localStorage={getItem:()=>null};globalThis.addEventListener=()=>{};const {currentHandRank}=await import('./hand-panel.mjs');
assert.deepEqual(currentHandRank(['As','Kd'],[]).cards,[{card:'As',hole:true},{card:'Kd',hole:true}]);
assert.match(currentHandRank(['As','Ad'],[]).label,/pair of As/);
assert.deepEqual(currentHandRank(['As','Kd','Kh','2d'],[]).cards.map(c=>c.card),['Kd','Kh'],'Native preflop any pair outranks high cards');
assert.equal(currentHandRank(['As',null],[]),null);assert.equal(currentHandRank(['As','As'],[]),null);assert.equal(currentHandRank(['As','Kd'],['2c']),null);
const own=['As','Ad'],board=['Ah','Kh','Qh'];const saved=JSON.stringify([own,board]);assert.equal(currentHandRank(own,board).cards.length,5);assert.match(currentHandRank(own,board).label,/three of a kind/);assert.equal(JSON.stringify([own,board]),saved);
for(const n of [4,5,6]){const h=['9h','8h','2c','3c','3d','7d'].slice(0,n);for(const b of [['Ah','Kh','Qh'],['Ah','Kh','Qh','Jh'],['Ah','Kh','Qh','Jh','Th']])assert.equal(currentHandRank(h,b).cards.filter(c=>c.hole).length,2)}
assert.match(currentHandRank(['Ah','Kh'],['6c','7d','8s','9h'],true).label,/straight/);assert.match(currentHandRank(['Ah','Kh'],['Qh','Jh','9h','As','Ad'],true).label,/flush/);
assert.ok(currentHandRank(['2s','Kd'],[],true)===null);assert.equal(currentHandRank(['As','Kd'],['As','2h','3h']),null);
console.log('PASS current own HandRank:preflop pair choice,known flop/turn/river,exact-two Omaha,ShortDeck,privacy/malformed guards and immutable input');
