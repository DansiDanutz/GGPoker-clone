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
