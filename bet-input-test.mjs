import assert from 'node:assert/strict';
import {betIncrement,snapBetAmount,wheelBetAmount} from './betting-preferences.mjs';
assert.equal(betIncrement(4,'bb'),4);assert.equal(betIncrement(4,'sb'),2);assert.equal(betIncrement(200,'sb','shortdeck'),200);
for(const [value,want] of [[8,8],[9,8],[10,12],[11,12],[13,12],[117,116],[119,119]])assert.equal(snapBetAmount(value,8,119,4),want);
assert.equal(snapBetAmount(9,9,119,4),9,'Native minimum is preserved even off-grid');assert.equal(snapBetAmount(119,9,119,4),119,'All-in endpoint is preserved');assert.equal(snapBetAmount(-20,9,119,4),9);assert.equal(snapBetAmount(200,9,119,4),119);
for(const [value,direction,want] of [[9,1,12],[9,-1,8],[8,1,12],[8,-1,8],[118,1,119],[119,-1,116],[9,0,9]])assert.equal(wheelBetAmount(value,direction,8,119,4),want);
assert.equal(wheelBetAmount(9,1,8,119,2),10);assert.equal(wheelBetAmount(9,-1,8,119,2),8);
console.log('PASS native blind-unit slider rounding, off-grid wheel alignment, exact min/all-in endpoints and Short Deck button-blind override');
assert.equal(snapBetAmount(14,8,14,4),14,'Pot-limit cap need not be a multiple of the blind');assert.equal(wheelBetAmount(13,1,8,14,4),14,'Wheel clamps at the legal pot-limit cap');
