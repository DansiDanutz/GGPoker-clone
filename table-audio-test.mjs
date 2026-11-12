import assert from 'node:assert/strict';
import {tableCues} from './table-audio.mjs';
const hand={history:[],bets:[2,4],stacks:[98,96],committed:[2,4],board:[]};
const s={number:1,hand}, snap=patch=>({...s,hand:{...hand,...patch}});
assert.deepEqual(tableCues(null,s),[]);
assert.deepEqual(tableCues(s,s),[]);
assert.deepEqual(tableCues({...s,hand:null},s),['DealCard']);
assert.deepEqual(tableCues(s,snap({history:['Seat 1: raise to 12'],committed:[12,4]})),['Raise']);
assert.deepEqual(tableCues(s,snap({history:['Seat 1: call 2'],board:['2c','3d','4s']})),['Call','Board']);
assert.deepEqual(tableCues(s,snap({history:['Seat 1: fold'],end:{}})),['Fold','WinPot']);
assert.deepEqual(tableCues(s,snap({history:['Seat 1: raise to 100'],committed:[100,4]})),['AllIn']);
// A spectator poll can span multiple betting rounds for one seat.
assert.deepEqual(tableCues(s,snap({history:['Seat 1: call 2','Seat 2: check','Seat 1: raise to 96'],committed:[100,4],board:['2c','3d','4s']})),['Call','Check','AllIn','Board']);
