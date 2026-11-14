# Local Spin operator capital — implementation in progress

This is independently specified local play-credit administration. The native operator backend was not observed. Native payout evidence requires a separate prize funding source,but does not establish native admin screen layout orcapitalization policy.

## Current implemented boundary

spin-bank.mjs stores funding-only version1state: available,funded,sequence andup to100audit events. Default capital iszero; reading it changes nothing. Available equals funded until game reservations/settlement are implemented. A funding command contains sequence,amount andreason. Amount is a whole local play-credit value1–1000000000; this cap is local policy,not a recovered native limit. Reasons are required,trimmed andlimited to200characters.

A matching retry of the latest command returns its original receipt. Reusing its sequence with different data orskipping asequence fails. Totals stay within safe integers. Acheckpoint validates event order,retained-history length,amounts,running balances andcapital conservation. Summary remains readable ifcommand numbers are exhausted; new funding isdisabled.

openRooms includes this state as local-spin-bank in the existing rooms.json checkpoint,not another mutable database. It loads/deletes that metadata key before room validation,detects duplicate keys,andpreserves legacy snapshots without bank state. Funding persists even when there are no player wallets. The same temp-write/rename boundary andin-memory snapshot rollback cover bank funding. Retried committed funding doesnot rewrite state. Player-wallet balances remain separate.

## Owner surface

/api/owner-spin-bank GET/POST uses the existing local-only owner-key gate. POST requires exact local Origin,JSON andat most2048bytes. The owner console can load capital/audit andsubmit funding. Funding isnot aplayer grant. No Spin registration orprize settlement isenabled by this form.

The UI keeps the same command after a lost acknowledgement; retry credits once. Confirmed funding clears the reason andrefreshes the bank. Audit reasons use textContent. Changing the owner key clears private balance/audit,disables funding andrejects late prior-key responses. Requests have a5second timeout. The native admin surface isnot being claimed as reproduced.

## Verification

- spin-bank-test.mjs PASS: zero/read-only default,200Mcapital,idempotent retry,strict commands,100event retention,corrupt checkpoint rejection,safe-number/sequence exhaustion,cloned summaries,player isolation,empty-account persistence,cold restart andfailed-write rollback.
- spin-bank-http-test.mjs PASS: owner/origin/content-type/size/JSON guards,capital/retry,player-cookie insufficient forowner access,player10Kwallet unchanged,write failure/retry,cold restart,exact snapshot/rescue restoration andchecksum-valid semantic corruption rejection without changing current data.
- network-browser-test.mjs --spin-bank PASS: actual owner pointer submission,dropped acknowledgement/retry produces one200Mfunding,safe audit,write rollback/retry to200005000,player isolation,late response after key change ignored andcold restart.
- Existing tournament-wallet-test.mjs andowner-monitor-test.mjs PASS after the metadata/transaction changes.
- owner-backup-test.mjs andowner-restore-http-test.mjs PASS: backup export,cold restoration of both embedded Rush pools,active-hand guards,rescue androllback. The backup fixture was corrected to assert the current local-rush-pools metadata instead of requiring obsolete standalone Rush files. No production backup behavior changed.

Tests use ephemeral servers,data andheadless muted browsers. No live operator orplayer funds were changed. Source changes have not been committed/released yet.

## Required next stages

Add tested prize reservations/house exposure andsettlement in the same atomic boundary before connecting matching orPlay Now. Preserve exact100Mprobabilities; do not reroll foraffordability. Recover/validate effective per-multiplier stack/time-bank/insurance configuration before charging entries. Registration,multiplayer game flow,wheel,payout andnative visual/runtime fidelity remain incomplete; see spin-registration-runtime.md.
