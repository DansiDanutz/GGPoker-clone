import assert from 'node:assert/strict';
globalThis.Image=class{};globalThis.addEventListener=()=>{};globalThis.document={querySelector:()=>null};globalThis.localStorage={getItem:()=>null};
const {gameClockText}=await import('./felt.mjs');
for(const [ms,text] of [[0,'00:00'],[-1,'00:00'],[1,'00:01'],[1000,'00:01'],[1001,'00:02'],[59001,'01:00'],[60000,'01:00'],[60001,'01:01'],[3600000,'60:00']])assert.equal(gameClockText(ms),text);
console.log('PASS native ceil-to-second GameClock digits, minute boundaries, zero/exhaustion and60-minute local pool');
