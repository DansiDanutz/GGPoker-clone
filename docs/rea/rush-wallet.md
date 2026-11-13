# Rush: local wallet, session balance and cash-out

## Evidence and independent local policy

Retained native `BuyInCommand.as` dispatches `REQUEST_RUSH_ADD_CHIP` with amount/balanceVo for a Rush session and refreshes `REFRESH_RUSH_PLAYER_BALANCE` after completion. This establishes a separate Rush balance path; it does not disclose the operator wallet transaction protocol. The local backend below is independent play-money behavior, not a recovered private operator implementation.

New local Rush sessions use the existing200-chip buy-in for both Hold’em and PLO. Each authenticated account/pool holds a separate session balance backed by its shared local wallet. Computers retain virtual practice chips. An old unfunded session remains virtual until left or genuinely rebought; free old chips never become wallet credits. The UI explicitly distinguishes funded/legacy balances and shows buy-in cost and wallet balance.

## Atomic storage and recovery

Funded Rush snapshots live under the reserved `local-rush-pools` record in `rooms.json`, beside `local-cash-wallets`. A snapshot and its wallet debit/credit commit by the existing temporary-file/rename operation. A failed first or later write restores both in-memory states. Per-pool versions reject stale/replayed financial commits. The legacy `rush.json`/`rush-plo.json` files are read only until a committed embedded snapshot exists; embedded data then takes precedence. They are not deleted or overwritten by funded saves.

The pool records signed external funding separately from its original stake total: current pool chips equal initial stakes plus net funding. Transfers validate safe integers, nonnegative balances and total limits. A waiting player still associated with an unsettled detached old hand cannot transfer or cash out. Finished payouts release that restriction. Rebuy after an actual bust adds200 to the session and debits200 from the wallet in the same save.

Owner restore checks embedded Rush hands as well as legacy files, and ignores a superseded legacy pool when an authoritative embedded snapshot exists. Active embedded hands block restore before any data is replaced. Backup file names remain unchanged, so wallet and funded session state are carried together in the existing rooms snapshot. Startup rejects funded Rush metadata if wallet mode is disabled.

## User controls and boundaries

Join Rush pool uses the authenticated local cookie account and debits200 once. Existing active-session joins do not debit again. An empty registered balance offers Rebuy200play chips. Leave Rush and cash out is available once the current and detached hands have settled; pending settlement disables it with an explanation. A repeated departure or restart cannot credit twice. Hold’em/PLO transfers remain isolated by pool while sharing the same account wallet.

The HTTP route retains local-origin, cookie, method, JSON/content-type and size checks. Join/leave reject extraneous body fields; accounts and amounts are not accepted from client financial commands. Wallet receipts use Rush buy-in/Rush cash-out with the correct debit/credit sign. No real funds, external payments or operator account balance are involved.

## Verification and remaining limits

Tests cover pool capital/restart/overflow, first and later save rollback, account/pool isolation, insufficient funds, stale/replayed commits, old virtual sessions, a deterministic genuine busted player rebuy, active/detached cash-out rejection and backup-restore protection. HTTP tests cover the actual authentication/origin/body boundary and both pools. Headless isolated browser tests cover Home→Rush→join→eleven computers→quick-fold rematch→two independently ranked payouts→real cash-out control→cold restart. Multi-session Rush tests retain their separate authenticated contexts and independent payouts.

The fixed stake, between-hands cash-out restriction, shared local wallet and migration rules are explicit local policy. Native Cashier pixels, buy-in popup timing, operator fees/refills, arbitrary stakes, multiple same-account concurrent Rush sessions and complete native parity remain open. Source art is served from the private installed artwork snapshot; tests do not touch live owner games.
