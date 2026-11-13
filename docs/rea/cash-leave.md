# Account-wide local cash departure

## Evidence boundary

Installed SitOutType names distinguish LeaveTableNextHand, LeaveAllCashGameTable, LeaveNextBlind and LeaveAllNB menu labels. SitOutHelper/SitOutCommand carry auto-action flags to the private server. Those client flags do not establish the remote server's next-blind trigger or all missed-blind/leave-penalty policies. The bounded source search and official [hotkey FAQ](https://help.ggpoker.com/article/Hotkeys---Frequently-Asked-Questions) confirm separate hand/blind scheduling concepts, but do not establish small-versus-big-blind behavior. That feature remains unimplemented rather than guessed.

This feature is an explicit local play-money policy: leave this signed-in account's ordinary hosted Hold'em/PLO/PLO5/PLO6 cash seats after their current hands. Rush, tournaments, AoF and Short Deck remain outside this operation. Its settings control says “Leave all local cash tables after this hand”; it is not a claim to have reproduced the entire native menu or operator policy.

## Actual state and funding

POST /local/cash-leave accepts only the expected account and a boolean leaving. Exact local Origin, profile cookie, JSON,512-byte body limit, method and unknown-field validation prevent guest/foreign-account targeting. Owner keys alone are insufficient. A repeated requested state is idempotent. Cancellation clears still-pending flags for this account; other players remain unchanged. New seats taken later do not inherit an old request.

Active dealt hands keep their actor, wagers, cards, deadlines and wallet amounts. The private per-seat leaveNextHand flag persists through restart. Waiting seats with no hand, or actual undealt seats with no current contribution, can leave immediately. Settled hands wait the existing local three-second between-hand interval before release. Ready and computer ticks cannot start another hand while departures from that hand remain pending. This is a local scheduling rule, not a recovered native leave delay.

Release reuses the existing cash leave helper: final stack returns once, separately debited pending chips are refunded, remaining stacks and dealer history survive, and host ownership moves to another human when present. Account scheduling and its immediate departures use one atomic room+wallet save with memory rollback. Timer-driven release uses the existing save/rollback boundary. Wallet-disabled mode cannot cash out funded seats.

A bounded private departure receipt binds the old seat token digest and account to the final cash-out. Only authenticated state requests with that former token/account can recover it; repeated reads/restart cannot credit again. Other accounts cannot see the receipt, and ordinary public snapshots expose no departure token/account list. New seat tokens remain independent. Receipts are limited to the latest100 per room, so they are recovery metadata, not an unlimited historical export.

## Presentation and payout ordering

The capability-gated table settings button schedules or cancels the account-wide request. Current table status shows the actual private flag. Unsupported older backends hide it. The leave receipt supplies the actual cash-out shown on the table.

Server release can occur while a client is still showing a longer multi-pot/runout animation. The client retains that finished-hand presentation until its existing final award callback: its own departure receipt waits for awards, and a remaining player's next empty-hand snapshot waits as well. This extends the existing payout-sequencing guard rather than cutting off cards/WIN/chips. Identity changes and explicit clear still revoke the old presentation immediately.

## Verification

- cash-global-leave-test starts two funded cash tables; verifies unchanged live hands/wallets, private flags, cancel/idempotence, failed-save rollback, cold restart,2999/3000ms release boundary, exact payouts, account-bound receipt retries, waiting-seat immediate cash-out and separately debited40-chip refund.
- cash-global-leave-http-test runs an ephemeral server: profile/Origin/method/JSON/size/identity/unknown-field guards, two active tables, restart, independent final balances, no duplicate credits and wrong-account receipt rejection.
- network-browser-test --cash-global-leave uses two windows of the same authenticated account, trusted mouse activation, two full all-in hands, independently conserved360chips per table, payout-before-seat-removal presentation, exact wallet cash-outs, receipt retries and cold restart. The test profile uses a valid account identifier; an initial spaced fixture name was rejected by existing profile validation, which remains unchanged.

All tests use temporary data and muted headless Chrome. Native menu geometry, native physical pixels/sound, native leave penalties, next-blind scheduling and global Rush/tournament rules remain open.
