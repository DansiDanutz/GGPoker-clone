import assert from 'node:assert/strict';
globalThis.Image=class{};globalThis.document={querySelector:()=>null};globalThis.localStorage={getItem:()=>null};globalThis.addEventListener=()=>{};const {historyWinningCards}=await import('./felt.mjs');
const values=cards=>cards.map(c=>c.card);
assert.deepEqual(values(historyWinningCards(['Ac','Kh'],['2c','3d','4h','5s','9c'])),['5s','4h','3d','2c','Ac']);
assert.deepEqual(values(historyWinningCards(['Ac','Qh'],['6c','7d','8h','9s','Kc'],true)),['9s','8h','7d','6c','Ac']);
assert.deepEqual(historyWinningCards(['As','Ad'],['Ah','Kc','Kd','2s','3h']),[{card:'As',hole:true},{card:'Ad',hole:true},{card:'Ah',hole:false},{card:'Kd',hole:false},{card:'Kc',hole:false}]);
assert.deepEqual(values(historyWinningCards(['Ac','Ad'],['Kh','Ks','2c','3d','9h'])),['Ad','Ac','Ks','Kh','9h']);
assert.deepEqual(values(historyWinningCards(['As','Ac'],['Ad','Ah','Kc','2s','3h'])),['As','Ad','Ah','Ac','Kc']);assert.deepEqual(values(historyWinningCards(['As','Kh'],['Ad','Ac','Qd','9s','2h'])),['As','Ad','Ac','Kh','Qd']);
const boardOnly=historyWinningCards(['2c','3d'],['Ts','Js','Qs','Ks','As']);assert.equal(boardOnly.filter(c=>c.hole).length,0);assert.deepEqual(values(boardOnly),['As','Ks','Qs','Js','Ts']);
for(const count of [4,5,6]){const cards=historyWinningCards(['Ac','Kh','Qc','Qh','2d','3h'].slice(0,count),['2c','3d','4h','5s','9c']);assert.equal(cards.length,5);assert.equal(cards.filter(c=>c.hole).length,2)}
for(const [hole,board]of [[null,['2c','3d','4h','5s','9c']],[['Ac',null],['2c','3d','4h','5s','9c']],[['Ac','Kh'],[]],[['Ac','Ac'],['2c','3d','4h','5s','9c']]])assert.equal(historyWinningCards(hole,board),null,'Missing/private/invalid cards cannot be guessed');
console.log('PASS nativewinningfive:groups/ranks/SDHC suits,bothace-lowstraights,boardonly,exacttwoOmaha4/5/6 andprivate/incompleteguards');
