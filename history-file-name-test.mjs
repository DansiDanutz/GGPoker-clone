import assert from 'node:assert/strict';
globalThis.Image=class{};globalThis.document={querySelector:()=>null};globalThis.localStorage={getItem:()=>null};globalThis.addEventListener=()=>{};
const {historyFileName}=await import('./player-note-ui.mjs');const h={number:31,blind:4,variant:'holdem'};
for(const [iso,time]of [['2026-11-12T00:05:59Z','12-05_AM'],['2026-11-12T12:05:00Z','12-05_AM'],['2026-11-12T13:05:00Z','01-05_PM'],['2026-11-12T23:59:00Z','11-59_PM']])assert.equal(historyFileName(h,new Date(iso)),'2026-11-12_ '+time+'_2_4_#31.png','Match shipped UTC/noon labeling,not local timezone');
for(const variant of ['holdem','plo','plo5','plo6','rush','aof'])assert.equal(historyFileName({...h,variant},new Date('2024-02-29T03:04:00Z')),'2024-02-29_ 03-04_AM_2_4_#31.png');
for(const patch of [{blind:undefined},{blind:3},{blind:0},{blind:'4'},{variant:'shortdeck'},{variant:'unknown'}])assert.equal(historyFileName({...h,...patch},new Date('2026-11-12T13:00:00Z')),'Hand-31.png','No guessed blind pair');
assert.equal(historyFileName(h,new Date(NaN)),'Hand-31.png');assert.equal(historyFileName({...h,blind:100},new Date('2026-01-01T13:00:00Z')),'2026-01-01_ 01-00_PM_50_100_#31.png');console.log('PASS historyfilename:UTC/datepadding/native12AMnoon/variants/evenblinds/unknownfallback');
