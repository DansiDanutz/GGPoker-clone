import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
for(const flags of [
 ['--history-report'],
 ['--history-limit','--history-report'],
 ['--native-history-preview','--history-report'],
 ['--history-limit','--native-history-preview','--history-report-names']
]){
 const result=spawnSync(process.execPath,['network-browser-test.mjs',...flags,'--payout-oracle-only'],{cwd:new URL('.',import.meta.url),encoding:'utf8',timeout:10000});
 assert.notEqual(result.status,0,'Missing report dependencies must fail: '+flags.join(' '));
 assert.match(result.stderr,/History report requires|Report names require/);
}
const valid=spawnSync(process.execPath,['network-browser-test.mjs','--history-limit','--native-history-preview','--history-report','--history-report-names','--payout-oracle-only'],{cwd:new URL('.',import.meta.url),encoding:'utf8',timeout:10000});
assert.equal(valid.status,0,valid.stderr);assert.match(valid.stdout,/PASS payout oracle/);
console.log('PASS history report flags: four incomplete combinations fail before browser setup; complete combination accepted');

for(const [flag,message]of [['--observer-chat',/Observer chat fixture requires/],['--rush-helmet',/Rush Helmet requires/],['--helmet-rush',/Mixed Helmet requires/],['--chat-bubble',/Text bubble fixture requires/],['--native-emoticon',/Native emoticon fixture requires/]]){const r=spawnSync(process.execPath,['network-browser-test.mjs',flag,'--payout-oracle-only'],{cwd:new URL('.',import.meta.url),encoding:'utf8',timeout:10000});assert.notEqual(r.status,0);assert.match(r.stderr,message)}

console.log('PASS Helmet browser flags: Rush and mixed fixtures require their base journeys before setup');

const restoreArgs=['network-browser-test.mjs','--tournament-cancel','--cancel-restore','--payout-oracle-only'],restoreEnv={...process.env};delete restoreEnv.POKER_RUNTIME_DIR;
const missing=spawnSync(process.execPath,['network-browser-test.mjs','--cancel-restore','--payout-oracle-only'],{cwd:new URL('.',import.meta.url),encoding:'utf8',timeout:10000});assert.notEqual(missing.status,0);assert.match(missing.stderr,/Cancellation restore requires/);
const restricted=spawnSync(process.execPath,restoreArgs,{cwd:new URL('.',import.meta.url),encoding:'utf8',timeout:10000,env:{...process.env,POKER_RUNTIME_DIR:'/fixture/installed'}});assert.notEqual(restricted.status,0);assert.match(restricted.stderr,/restricted installed harness disables fsync/);
const durable=spawnSync(process.execPath,restoreArgs,{cwd:new URL('.',import.meta.url),encoding:'utf8',timeout:10000,env:restoreEnv});assert.equal(durable.status,0,durable.stderr);assert.match(durable.stdout,/PASS payout oracle/);
console.log('PASS cancellation restore flags: base journey and target-matching source mode required before any fixtures; restricted harness unchanged');

for(const flags of [['--cash-sitout-rush'],['--cash-sitout-rush','--cash-sitout'],['--cash-sitout-rush','--cash-sitout','--cash-sitout-account']]){const r=spawnSync(process.execPath,['network-browser-test.mjs',...flags,'--payout-oracle-only'],{cwd:new URL('.',import.meta.url),encoding:'utf8',timeout:10000});assert.notEqual(r.status,0);assert.match(r.stderr,/Mixed Rush menu requires/)}
const mixed=spawnSync(process.execPath,['network-browser-test.mjs','--cash-sitout-rush','--cash-sitout','--cash-sitout-account','--cash-sitout-menu','--payout-oracle-only'],{cwd:new URL('.',import.meta.url),encoding:'utf8',timeout:10000});assert.equal(mixed.status,0,mixed.stderr);assert.match(mixed.stdout,/PASS payout oracle/);console.log('PASS mixed cash/Rush menu flag dependencies before browser setup');
