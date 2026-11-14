import assert from 'node:assert/strict';
import {readHotkeys,keyCodes,keyCaption,assignHotkey,hotkeyActions,readHotkeyGroups,hotkeyGroup} from './hotkey-bindings.mjs';
const original=readHotkeys();assert.deepEqual(original.fold,[112]);assert.deepEqual(original.preset1,[17,49]);assert.deepEqual(original.allIn,[]);assert.deepEqual(original.showAll,[]);
assert.deepEqual(keyCodes({key:'F1'}),[112]);assert.deepEqual(keyCodes({key:'a',ctrlKey:true,shiftKey:true}),[16,17,65]);assert.deepEqual(keyCodes({key:'a',metaKey:true}),[15,65]);assert.equal(keyCaption([17,49]),'Ctrl+1');assert.equal(keyCaption([]),'Unassigned');
const edited=assignHotkey(original,'allIn',[65]);assert.deepEqual(original.allIn,[]);assert.deepEqual(edited.allIn,[65]);assert.throws(()=>assignHotkey(edited,'showAll',[65]),/already assigned/);const moved=assignHotkey(edited,'showAll',[65],true);assert.deepEqual(moved.allIn,[]);assert.deepEqual(moved.showAll,[65]);assert.deepEqual(readHotkeys(JSON.stringify(moved)),moved);
for(const raw of ['null','[]','not json',JSON.stringify({allIn:[999]}),JSON.stringify({allIn:[112]}),JSON.stringify({allIn:[65,65]}),JSON.stringify({allIn:'A'})])assert.deepEqual(readHotkeys(raw),original,'Invalid saved bindings safely restore defaults');
assert.equal(keyCodes({key:'Dead'}),null);assert.equal(keyCodes({key:'a',isComposing:true}),null);assert.throws(()=>assignHotkey(original,'unknown',[65]));assert.equal(new Set(hotkeyActions.map(a=>a.id)).size,hotkeyActions.length);console.log('PASS hotkey bindings:source defaults/unassigned actions,Ctrl/Cmd/Shift,immutable assignment,duplicate confirmation/transfer,roundtrip andinvalid-data fallback');

assert.deepEqual(readHotkeyGroups(),{table:true,functions:true,options:true});assert.deepEqual(readHotkeyGroups('{"table":false}'),{table:false,functions:true,options:true});assert.deepEqual(readHotkeyGroups('{"functions":"false"}'),{table:true,functions:true,options:true});for(const id of ["fold","newHand","bet1"])assert.equal(hotkeyGroup(id),"table");assert.equal(hotkeyGroup("sitOut"),"functions");assert.equal(hotkeyGroup("toggleUnits"),"functions");assert.equal(hotkeyGroup("showAll"),"options");console.log("PASS independent source hotkey categories and safe preference parsing");

assert.deepEqual(readHotkeys().timeBank,[]);assert.equal(hotkeyGroup("timeBank"),"functions");

assert.deepEqual(readHotkeys().lastHands,[]);assert.equal(hotkeyGroup("lastHands"),"functions");

assert.deepEqual(readHotkeys().addChips,[]);assert.equal(hotkeyGroup("addChips"),"functions");assert.deepEqual(readHotkeys(JSON.stringify(assignHotkey(readHotkeys(),"addChips",[17,71]))).addChips,[17,71]);

assert.deepEqual(readHotkeys().sitOutAllCash,[]);assert.equal(hotkeyGroup("sitOutAllCash"),"functions");const globalPause=assignHotkey(readHotkeys(),"sitOutAllCash",[71]);assert.deepEqual(readHotkeys(JSON.stringify(globalPause)).sitOutAllCash,[71]);assert.throws(()=>assignHotkey(globalPause,"sitOut",[71]),/already assigned/);

assert.deepEqual(readHotkeys().rabbit,[]);assert.equal(hotkeyGroup('rabbit'),'functions');assert.deepEqual(readHotkeys(JSON.stringify(assignHotkey(readHotkeys(),'rabbit',[72]))).rabbit,[72]);

for(const id of ["runItOnce","runItTwice","runItThreeTimes"]){assert.deepEqual(readHotkeys()[id],[]);assert.equal(hotkeyGroup(id),"options");const assigned=assignHotkey(readHotkeys(),id,[82]);assert.deepEqual(readHotkeys(JSON.stringify(assigned))[id],[82]);assert.throws(()=>assignHotkey(assigned,"showAll",[82]),/already assigned/)}
console.log("PASS native RIMT options: unassigned defaults, persistence and conflict protection");
