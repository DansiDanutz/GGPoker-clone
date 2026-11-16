import assert from 'node:assert/strict';
import {cashGroupCatalog,cashTableCatalog} from './cash-group-catalog.mjs';
const a='a'.repeat(64),b='b'.repeat(64),rows=[{id:'one',name:'One',mode:'cash',groupId:a,open:false,occupied:2,seats:[{name:'Alice',stack:100},null]},{id:'two',name:'Two',mode:'cash',groupId:a,open:true,occupied:1,seats:[{name:'Bob',stack:120}]},{id:'other',groupId:b,open:true,occupied:3,seats:[]},{id:'unknown',occupied:null,seats:null}];
const before=JSON.stringify(rows),result=cashGroupCatalog(rows);assert.equal(result.length,3);assert.equal(result[0].id,'two','Join targets an open real member, not a closed representative');assert.equal(result[0].occupied,3);assert.equal(result[0].members.length,2);assert.deepEqual(result[0].members.map(r=>r.id),['one','two']);assert.equal(result[1].occupied,3);assert.equal(result[2].occupied,null);assert.equal(JSON.stringify(rows),before,'No mutation of table projections');assert.equal(cashGroupCatalog([{...rows[0],open:false},{...rows[1],open:false}])[0].open,false);assert.equal(cashGroupCatalog([{...rows[0],occupied:null},rows[1]])[0].occupied,null);assert.equal(cashGroupCatalog([{...rows[0],groupId:undefined},{...rows[1],groupId:undefined}]).length,2);assert.deepEqual(cashGroupCatalog([]),[]);
console.log('PASS Group aggregation:one row per actual rule identity,real summed occupancy,open representative,closed/unknown/separate cases and immutable input');

const ordered=[
 {id:'low',blind:2,stack:40,capacity:6},
 {id:'short',blind:4,minBuyIn:80,stack:100,ante:0,capacity:2},
 {id:'six',blind:4,minBuyIn:80,stack:100,ante:0,capacity:6},
 {id:'ante',blind:4,minBuyIn:80,stack:100,ante:1,capacity:6},
 {id:'buyin',blind:4,minBuyIn:120,stack:200,ante:0,capacity:6},
 {id:'high',blind:10,stack:40,capacity:6},
 {id:'tie',blind:10,stack:40,capacity:6}
];
const orderBefore=JSON.stringify(ordered);
assert.deepEqual(cashGroupCatalog(ordered).map(t=>t.id),['high','tie','buyin','ante','six','short','low'],'Native descending blind / minimum buy-in / ante / capacity, stable ties');
assert.equal(JSON.stringify(ordered),orderBefore,'Sorting preserves source projections');
console.log('PASS native comparable Hold’em Group ordering and stable ties');

const tables=[{id:'empty',blind:4,stack:120,capacity:6,occupied:0},{id:'busy',blind:4,stack:120,capacity:6,occupied:5},{id:'tie',blind:4,stack:120,capacity:6,occupied:5},{id:'higher',blind:8,stack:60,capacity:6,occupied:0}];
const tablesBefore=JSON.stringify(tables);
assert.deepEqual(cashTableCatalog(tables).map(t=>t.id),['higher','busy','tie','empty'],'Native comparable Table View rule priorities then descending real player count, stable ties');
assert.equal(JSON.stringify(tables),tablesBefore);assert.deepEqual(cashTableCatalog([]),[]);assert.equal(cashTableCatalog(tables).length,tables.length,'Table View retains individual tables');
console.log('PASS native Table View sorting/occupancy/stable ties/no aggregation/no mutation');


const {cashGameInformation}=await import('./cash-group-catalog.mjs');
assert.deepEqual(cashGameInformation([]),[],'Empty catalog must not invent rules');
const infoTables=[{capacity:6,actionSeconds:14,ante:0},{capacity:6,actionSeconds:30,ante:2},{capacity:4,ante:0}];
const infoBefore=JSON.stringify(infoTables),info=cashGameInformation(infoTables);
assert.deepEqual(info.map(r=>r.key),['MobileCurrencyTitle','MobileMissionGameType','TableMax','LabelBlinds','TimeToAct','MinimumPlayersForDealing']);
assert.equal(info.find(r=>r.key==='TableMax').value,'4 / 6');
assert.equal(info.find(r=>r.key==='TimeToAct').value,'14 / 30 / 90 seconds');
assert.equal(info.find(r=>r.key==='LabelBlinds').value,'SB, BB, Ante');
assert.equal(cashGameInformation([{capacity:6}]).find(r=>r.key==='LabelBlinds').value,'SB, BB');
assert.equal(JSON.stringify(infoTables),infoBefore,'Information preserves server projections');
console.log('PASS local game information aggregates actual rules without inventing native defaults');
