import assert from 'node:assert/strict';import{cashSitOutMenuRows}from'./cash-sitout-menu.mjs';
const view={enabled:true,account:true,canAll:true},rows=x=>cashSitOutMenuRows({...view,...x});
assert.deepEqual(rows({}).map(r=>[r.id,r.checked,r.disabled]),[['current',false,false],['all',false,false],['next-blind',false,true],['leave-blind',false,true]]);
assert.deepEqual(rows({paused:true}).slice(0,2).map(r=>[r.checked,r.disabled]),[[true,false],[false,true]]);
assert.deepEqual(rows({paused:true,allCash:true}).slice(0,2).map(r=>[r.checked,r.disabled]),[[false,true],[true,false]]);
assert.equal(rows({account:false})[1].disabled,true);assert.ok(rows({busy:true}).every(r=>r.disabled));assert.ok(rows({enabled:false}).every(r=>r.disabled));
console.log('PASS native cash sit-out menu:current/all scope selection,only selected cancellation while paused,account/capability/busy guards and unverified blind choices disabled');
