# Remove Chips — local implementation checkpoint

Status: backend and player/owner UI candidate in the working tree; no live rollout. Native evidence is documented in [table-control-applicability.md](table-control-applicability.md). This is not a completed native-equivalent flow.

## Implemented state transition

An owner-created cash/PLO table may opt in through the `removeChips` API setting. A funded, authenticated human seat can POST `remove-chips` with exactly `number`, `version`, `amount` and `sequence`. Amounts and identifiers must be safe whole integers. The request must originate from the local origin and match both profile account and seat token. The reduction must leave the table minimum.

The local policy permits manual removal only between hands, after the three-second settlement presentation window, before ready, and without pending funding or leave actions. This timing is an explicit local rule: the recovered native response does not prove private-server scheduling. Active hands are rejected rather than queued.

The transaction credits the existing cash wallet and records a private seat-session receipt. Effective seat balances subtract reductions from the settled hand without rewriting its stacks, contributions, results or payout history. Next-hand funding, leaving in either player order and ending a solo computer practice session use the effective balance, preventing a second cash-out of the same chips.

A repeated last sequence with the same hand and amount returns the prior result without another credit. Conflicting or stale requests fail. Persistence failures roll back room and wallet together. Restart validation checks both directions of the seat/ledger link and aggregate withdrawn totals, including closed seat sessions. Receipts are private to their seat. The ledger currently caps at 10,000 seat sessions; a validated archival policy is needed before exceeding that limit.

## Verification

`cash-remove-chips-test.mjs` covers Hold’em/PLO, active-hand and settlement-window rejection, account/amount/version/sequence guards, failed writes, retry/restart, immutable payout history, both leave orders, solo practice closure, corrupted receipts/ledger rejection, next-hand stacks and 20,000 combined wallet/chip conservation.

`cash-remove-chips-http-test.mjs` covers authenticated HTTP requests, strict local origin/method, concurrent identical requests credited once, failed persistence, private receipts, process restart and final cash-out. Both model and HTTP tests passed on this working tree on 2026-11-15, together with owner-seat HTTP, global cash-leave HTTP, owner-wallet, insured Spin registration and funded MTT-wallet regressions. This document is not an exact-head release QA receipt.

## Remaining before enabling the feature

- Complete the automatic preference UI and rendered settlement/reconnect journey. The backend now saves the target separately from manual withdrawals and applies excess once before the next deal.
- Complete broad rendered/recovery QA and native visual comparison. The player popup now exposes amount/range, remaining balance, automatic BB/Off, OK and Cancel. The owner form exposes opt-in for Hold’em/PLO/PLO5/PLO6, restores it on edit/duplicate, omits the default and clears/disables it for tournament/AoF/Short Deck. Extracted real form-handler tests pass; rendered owner interaction remains to be verified.
- Verify rendered balances and refill behavior in a complete browser journey. The client now uses effective balances for native-BB and percentage refills and settled seat labels; in-flight chip awards retain the prior displayed amount. The extracted real client-expression test covers reduced/zero balances, pending funding, legacy fallbacks and the active-award branch; it does not establish physical animation timing.
- Preserve the now-verified empty-room permission refresh and owner-removal cash-out behavior when adding the UI. HTTP tests disable/re-enable an existing empty room, reconnect after a process restart, and remove a player after a partial withdrawal; the remaining102 chips are credited once, leaving the expected10,002 wallet balance. No production correction was needed for these paths.
- Run isolated rendered player journeys, regressions, commit-bound QA and a guarded release. No owner live data is used for these fixtures.

Native seated-panel pixels, physical animation/audio timing and private settlement authority remain unverified. AoF/Rush support is not inferred from ordinary cash-table evidence.

## Automatic target contract checkpoint

`remove-chips-options.mjs` implements the recovered ordinary-cash dropdown arithmetic and separate request minimum clamp. Authenticated seated state at an enabled table exposes the options; spectator state does not. Tests cover Off,10BB steps,200BB cap, strict invalid targets and the82/4 floor boundary (listed20BB, effective21BB). The local server uses its configured big blind; a native button-blind table format is not implemented here. The authenticated `remove-chips-option` command saves a listed target separately from manual withdrawal. It requires the same funded local seat, exact local origin and a strict `{version,bb}` payload. An identical saved preference is idempotent; conflicting stale changes fail. The preference is private per authenticated account/game category and survives restart and leaving a seat; enabled seated tables receive it together and future seats inherit it.


## Automatic withdrawal policy and tests

The local scheduler applies a saved target immediately before a subsequent cash deal, after at least three seconds of settlement presentation. It does not debit when the preference is saved. Pending explicit funding takes precedence; leave-next-hand continues through the existing cash-out path. The actual removable amount uses the minimum-clamped target, never the display label alone. Automatic and manual transactions share the same receipt sequence and ledger, immutable prior-hand history and room/wallet rollback. Enabled rooms also snapshot timer-driven transactions so a failed next-deal write cannot leave a wallet credit in memory.

`cash-remove-chips-auto-test.mjs` verifies preference-only saving/privacy/auth/invalid targets, the settlement delay, failed tick persistence rollback,98 credited once from178 to80, next-hand initial stacks,20,000 combined conservation, restart and Off. Timing and per-seat scope are explicit local policies, not recovered native private-server behavior. HTTP tests additionally verify the preference route origin, account/seat binding, strict choices and no wallet debit on save. Full popup/browser coverage remains required before release.


## Rendered popup checkpoint

The player Table settings entry opens a412px popup using the existing buy-in dialog styling. Retained native constructor evidence establishes the412px width, title origin40/48, amount/current/result/automatic sections and148×40 buttons. Local controls use actual room/wallet operations; this is not an image overlay. Native spacing, section typography and final seated runtime appearance have not yet been fully compared, so width alone is not pixel parity.

Confirmation performs the immediate manual operation and then saves the independent automatic option, matching the two recovered command roles. The captured manual sequence is retained across a failed acknowledgement; the amount is locked after the first attempt. A preference-save failure reports whether chips were already returned and permits retry without another manual credit. Cancel before confirmation writes nothing. Exact native group propagation remains outstanding.

`node network-browser-test.mjs --remove-chips` passed in two isolated muted/headless Chrome contexts with temporary profiles/server data:412px width, Cancel/no debit, manual40, selected20BB, effective seat138, private receipt, process restart, automatic58 before next hand/initial80 and combined20,000 funds. Seating and fold/ready use API fixture calls; this is focused popup QA, not proof of the complete launch/login/lobby/table journey. The first rendered run exposed a button left disabled by request-busy rendering; that defect was repaired and the complete scenario rerun successfully.


## Owner-to-player UI journey and recovery

The rendered scenario now creates the opted-in table through the actual owner form and creates two isolated local accounts through the launch form. Both players navigate Home → Hold’em → table list → selected table → Buy-in/seat. Start, Fold, payout observation and Ready are also actual UI controls. Server reads and saved checkpoint inspection remain the independent balance oracle; no API calls substitute for those journey actions. The folded heads-up hand finishes178/122, manual40 leaves138, then automatic58 leaves80 before the next deal; wallets plus table chips remain20,000.

`node network-browser-test.mjs --remove-chips --remove-chips-option-failure --remove-chips-lost-ack` passed with both faults in one run: the accepted manual credit response is lost, a retry does not credit twice, the following preference save returns503, the popup reports the partial success, and another OK saves the preference without repeating the credit. Process restart retains seat/balance/preference; the next deal starts through both players’ Ready buttons. This replaces the earlier API-seated/action fixture evidence for this scenario. It still does not prove native pixel/audio identity, multi-seat all-in payouts or cross-table automatic preference propagation.


## Native group propagation — verified gap

Retained `TableInfo.as` lines1764–1789 distinguish two keys: Remove Chips uses `tableStringKey`, based on `gameType.type`; the separate Add Chips key may append Hold’em seat count. Copying the Add Chips group key would therefore be incorrect. Featured/VIP tables prefix the game type withVIP and append the table type ID. `GameType.as` maps normal Omaha, OmahaFive and OmahaSix to the sameOMAHA category; normal Hold’em maps toHOLDEM.

`SetAofAutoRemoveChipOptionCommand` saves target/on-off under that group key and broadcasts. `AutoRemoveChipCommand` applies the target to matching-group seated tables and separately updates the automatic-action flag; AoF has its own additional broadcast rule. This is verified client routing, not a recovered private-server settlement scheduler. `remove-chips-group-source.json` records the four inspected retained exports and hashes; this checkpoint did not freshly export or activate the original client.

The preceding implementation was seat-scoped. This investigation established the following requirements: persist authenticated account/group preferences, propagate to other enabled seated tables atomically, apply on future seating, keep Hold’em and Omaha separate, support each destination table’s independent minimum clamp, retain the native distinction between a saved target and its dropdown availability, and test retries/rollback/restart/privacy across rooms. Do not add seat count to the Remove Chips key or infer VIP/AoF/Rush behavior from ordinary cash support. No native VIP/AoF/Rush parity or rollout is claimed.


## Account/category propagation implementation

The candidate now stores optional HOLDEM/OMAHA targets in the authenticated account checkpoint. Changing the target updates all enabled funded human seats of that account/category in the same room/wallet transaction. Future enabled seats inherit it. Off clears the category while retaining other game categories. No chip credit occurs when changing this preference. Every destination applies its own minimum when calculating an eventual withdrawal, even when the originating dropdown label is unavailable at that destination. The popup follows the native fallback to Off for an unavailable dropdown choice without silently rewriting the saved preference on open.

`cash-remove-chips-group-test.mjs` passed actual six-room checkpoint tests for failed-write rollback, Hold’em propagation across different limits, shared Omaha4/5/6, account isolation, disabled-table exclusion, future seating, category-scoped Off, cold restart and corrupt preference/seat-link rejection. The missing seat-preference link was reproduced as a failing corruption assertion and repaired before the suite passed. Seven targeted model/client suites pass after this change. Cross-room rendered UI and exact-head release validation remain outstanding.


## Rendered two-table propagation

The `--remove-chips-group` scenario now creates a second enabled table through the owner form and opens an authenticated second tab in the same isolated account context. That tab takes a real180-chip seat, inherits20BB, changes Off and20BB through the popup, and the first table’s popup eventually reflects each value through ordinary polling. Preference changes do not debit funds. Leaving the extra seat returns180 once, restoring the original wallet baseline before process restart and the next hand.

The base grouped rendered scenario passed. The test waits for observed popup values rather than assuming that a fixed delay proves background-tab polling. The extra tab uses the authenticated player route and the same1200×850 test viewport; earlier fixture attempts omitted the player route or clicked outside the smaller clipped viewport. Those fixture failures are retained as limitations of the earlier attempts, not evidence of a server propagation defect. Target selection stays inside muted headless Chrome and does not activate desktop windows. The combined `--remove-chips --remove-chips-group --remove-chips-option-failure --remove-chips-lost-ack` run also passed. The test explicitly waits for the close event to remove a dialog before reopening it; merely observing a closed dialog is not the same as observing its removal.


## Pre-release review checkpoint

Strict restore validation now rejects a non-boolean enabled permission (including the truthy string`yes`); its corruption assertion failed before the repair and passed afterward. Twelve targeted suites passed after this repair: manual/automatic/group removal, cash wallet rooms, owner seat removal, ordinary/global cash leave, sit-out, owner restore, MTT wallet, insured Spin entry and owner grants. Seven changed production/browser modules passed Node syntax checks. These are working-tree checks, not commit-bound PR release QA or a full application coverage measurement.


## Native result/selector correction candidate

Further retained source inspection found a concrete presentation mismatch after PR210. `UnifiedRemoveChipsPopup.buildResultViewModel` sets the AOFTableCashOut result to the slider value (the withdrawal), not balance minus withdrawal. `BuyInResultView` uses an18px title and22px total; the play-money total color is#999999. `RenewBalanceSelector` has separate minimum/maximum buttons, a selection row56px below the input and slider origin80px within that row. These are source-derived component facts, not proof of overall seated-screen placement. Hashes for five inspected components are recorded in `remove-chips-popup-source.json`.

The candidate reuses existing result typography, displays the selected withdrawal amount and restores real Min/Max controls instead of stretching the range across their space. The rendered assertion reproduced absent Max before implementation. This does not establish total popup height, exact translated title, full native vertical layout, native compositor or sound parity.


## Source-driven popup layout candidate

Two additional native classes, BuyInStackLayout and BuyInStackLayoutResult, were freshly exported headlessly with the existing FFDec installation. Their source hashes, three retained layout exports and the matching Game51 artifact identity are in `remove-chips-layout-source.json`. Static analysis establishes: fixedPopupHeight defaults to0; content starts at48 + title.height +32; visible sections follow insertion order; the configured section gap is20 and bottom padding12; popup height adds114; buttons sit77px above the lower edge. Raising the dropdown’s display child index does not change section insertion order.

For supported ordinary cash, the visible section order is automatic dropdown38px, Current Chips26px, selector90px and the measured result, with20px gaps. The candidate computes positions and height from those relationships and measured title/result bounds. Current Chips uses separate15px/16px labels with right-aligned play-money value. Button widths148 and gap20 yield the recovered53px first-button origin. Font readiness and section resize update the layout; observers disconnect when the popup closes.

Local error messages receive an additional measured reserve so the recovery explanation cannot cover OK/Cancel. This is an explicit accessibility/recovery adaptation rather than a claim about native error layout. The browser test first failed on the old automatic-row position350 versus the source formula107 for that rendered title. It now checks every section offset, selector row56, total-height formula and button offset77, then passes the combined grouped/lost-ack/preference-failure/restart journey. It also verifies the partial-success error stays above OK. Client refill regression, module syntax and diff checks pass.

These tests establish agreement with recovered layout relationships using browser font measurements. They do not prove AIR font metrics, exact translated title, native compositor/audio identity or complete1-to-1 visual equivalence. The candidate is not yet activated; PR211 remains the installed release.
