# Local Spin operator capital — implementation in progress

This is independently specified local play-credit administration. The native operator backend was not observed. Native payout evidence requires a separate prize funding source,but does not establish native admin screen layout orcapitalization policy.

## Current implemented boundary

spin-bank.mjs stores funding-only version1state: available,funded,sequence andup to100audit events. Default capital iszero; reading it changes nothing. For legacy version1 state,available equals funded. Version2 adds per-match reservations;available plus active reservations equals funded. Settlement is not enabled yet. A funding command contains sequence,amount andreason. Amount is a whole local play-credit value1–1000000000; this cap is local policy,not a recovered native limit. Reasons are required,trimmed andlimited to200characters.

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

Tests use ephemeral servers,data andheadless muted browsers. No live operator orplayer funds were changed. Funding changes were released in PR109, head0295d7bff246469de9f7e1236aa78faccba04a90, after exact-head candidate tests and guarded idle restart; six owner files15496bytes stayed unchanged.

## Required next stages

Connect the tested reservation primitive to registration/entry escrow andadd prize settlement in the same atomic boundary before enabling matching orPlay Now. Preserve exact100Mprobabilities; do not reroll foraffordability. Recover/validate effective per-multiplier stack/time-bank/insurance configuration before charging entries. Registration,multiplayer game flow,wheel,payout andnative visual/runtime fidelity remain incomplete; see spin-registration-runtime.md.


## Prize exposure reservation — source implementation pending release

Before accepting any entry, a match needs the full worst-case operator exposure: max(prizePool) minus three buy-ins. For observed5000/10000stakes this is99985000/199970000credits. The bank holds this amount without drawing a result orfiltering probabilities. The three entry contributions must later be held in player escrow atomically before starting a match; a bank hold alone does not prove a funded game.

reserve(id,buyIn) accepts a bounded alphanumeric identity,one observed stake andsufficient free capital. Exact retry returns the same receipt; another stake under that ID fails. cancel(id) returns the exposure once andkeeps a cancelled tombstone,so delayed retries cannot reopen that match. A local10000record capacity rejects additional reservations rather than deleting accounting identities; this is independent local policy,not native operator evidence.

Version1 funding snapshots load unchanged. First reservation upgrades to version2 with validated reservation identities,stakes,exact exposure,unique IDs andcancelled flags. Funding while held records the reserved amount alongside available in its audit receipt; their sum equals cumulative funding at that point. Current capital always reconciles available+active holds=funded. Receipt/summary objects are cloned. No prize debit,draw orsettlement exists in this stage.

openRooms exposes internal reserveSpinBank/cancelSpinBank methods through the same snapshot/temp-write/rename/rollback boundary as funding. These are not public/player/owner HTTP actions. Integration into registration remains required,including player debits,queue membership andentry escrow in the same transaction. Restore refuses current outstanding Spin reservations; cancelling them allows restore. No live bank hold was created.

spin-reservation-test.mjs RED first reproduced the missing reservation operation;GREEN verifies both stakes,all possible payout exposure,simultaneous holds,insufficient capital without mutation,strict IDs/checkpoints,exact reserve/cancel retry,cancelled identity reuse rejection,funding while held,player isolation,cold restart andfailed-write rollback forboth reserve/cancel. A second RED exposed missing backup protection;GREEN rejects restore while held andallows it after cancellation. Existing funding/Rush/restore regressions also pass. Full Spin gameplay remains incomplete.


## Entry escrow — internal source implementation

registerSpin atomically validates an explicit practice configuration,reserves full worst-case bank exposure,debits the account wallet andadds one registration to local-spin-entries in rooms.json. Three distinct active accounts share one hold. Same match/account retry does not debit again; conflicting stake/rules orrefunded identity fails. Capacity isthree active players,with bounded100historical account identities per match and10000match records. These limits are local policy.

cancelSpinRegistration refunds one entry once. The final cancellation releases the bank hold once. Direct cancelSpinBank is refused while funded entries remain. A cancelled match identity cannot reopen. Failed entry/refund writes reload bank,wallet andregistration metadata together. Read views expose only the requesting account's registration,common rules andcount,not opponent account names.

Wallet spinSpent/spinReturned counters reconcile against every persisted registration/tombstone,independently of the truncated transaction display. Checkpoints reject missing wallet accounts,duplicate identities,more thanthree active players,configuration changes,bank/entry cancellation disagreement andunmatched cumulative debit/refund totals. Existing cash/Rush/tournament funding remains separate. The player wallet renderer recognizes signed Spin entry andrefund receipts.

The only accepted configuration mode in this stage is local-practice. All eight observed multipliers must have explicit startingChips,timeBankCards andnoDealing values. No field is filled automatically; canonical order allows semantic retries. Local practice validation uses300–1000whole chips and1–4cards,but these ranges do not establish native per-multiplier assignments. Test rules of300chips/1card/noDealing=false are synthetic andnot native defaults. Native-equivalent configuration is still unresolved.

spin-entry-test.mjs verifies RED missing registration andmissing cumulative wallet counters,thenGREEN both stakes,three accounts,full-table rejection,private views,canonical retries,conflicting rules,incomplete/native-claimed configuration rejection,bank/player insufficient funds,refund/debit rollback,duplicate cancellation,cold restart,semantic corruption rejection andactual backup/restore of escrow. wallet-room,owner-wallet,Rush-store/Rush-wallet,tournament-wallet,Spin funding/reservation andbackup regressions pass. There is no player registration HTTP route,owner configuration form,draw,matched table orsettlement yet. Play Now remains disabled; no live player orbank data changed.

Headless UI verification `network-browser-test.mjs --spin-entry-wallet` seeds three synthetic practice registrations through the internal model only while its ephemeral server is stopped,then boots the real server. My Wallet/Transaction History renders the actual -5000entry and+5000refund with Spin & Gold context,private accounts,exactlytwo receipts and5000→10000balance across cold restarts. RED found the context incorrectly said Hosted cash table;GREEN uses Spin & Gold. This is receipt-rendering evidence,not a public registration UI orplayable Spin journey.


## Authoritative outcome — internal source follow-up

drawSpin accepts only an existing match withthree active funded registrations. It uses node:crypto randomInt(100000000) once andpersists ticket+drawnAt withthe entry escrow in the existing atomic transaction. It doesnot accept acaller-selected ticket. All stakes keep the full jackpot hold; there isno affordability filtering orreroll. Prior entry configuration supplies the selected outcome's explicit practice stack/cards/noDealing; native unknowns are not filled in the observed model.

Read views derive the same eight-outcome model result from that saved ticket andreturn decidedAt. They do not expose the raw random ticket. Repeat draw andcold restart do not invoke randomness again orrewrite the checkpoint. Active registration cancellation andnew joins are refused after decision; an already refunded historical entry can still retry its cancellation without another refund. The ticket andtimestamp must be present together andvalid; a decided match must retainthree active registrations.

spin-draw-test.mjs isolates node:crypto mocking in its own test process andrestores it in finally. Both stakes andevery outcome boundary are forced fordeterministic verification ofprize,configured stack/cards andshared result. It asserts one RNG call,cloned reads,no redraw/refund,unchanged wallet/capital,atomic write-failure rollback andcold restart. RED missing draw andmissing decision timestamp precededGREEN. The production implementation hasno deterministic RNG override. This is authoritative-result infrastructure,not rendered wheel,gameplay orsettlement. No new public route orlive financial write isenabled.
