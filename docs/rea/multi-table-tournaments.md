# Multi-table tournament hosting — local reconstruction

## Evidence and scope

Four selective FFDec exports from the installed IronDesktop.swf are hashed in [source receipt](multi-table-source.json). `MoveTableCommand.execute` receives a `TableConnection`, assigns `tableFacade.nextConnection`, and uses a processor Task before dispatching OPEN_TABLE for tournaments. The non-tournament branch dispatches directly. This proves client transition sequencing in that method, not the private allocation/balancing algorithm or an after-hand guarantee.

`OnTableChanged` (4135) updates table metadata/menu; its name must not be confused with a seat-transfer allocation contract. `NotifyTableChangedParameter` contains TableUserId/Table metadata. `OnWaitForMoveTablePlayer` (4061) suppresses its own user and shows MOVE_TABLE_WAITING for another. These exports do not establish destination choice, blind compensation, global simultaneous elimination ranking, initial seating randomness or final-table timing.

## Implemented foundation

`engine/tournament-seating.mjs` provides `tournamentSeatPlan(tables, 'local-idle-balance-v1')`. This is an explicit local practice policy, not recovered native server behavior. A snapshot has at most20tables, each with a unique ID, Boolean playing flag and six physical seat slots. A player has a unique account ID and a nonnegative safe-integer stack. Idle snapshots omit eliminated zero-stack players; active snapshots retain all hand participants, including all-ins/folded players, and require at least two participants. Snapshots with sparse arrays, duplicate identities, unknown fields or unsafe aggregate stack totals are rejected.

The pure planner clones its inputs. Only idle source and destination tables can exchange players. It closes the least occupied eligible idle table when the remaining idle capacity can hold its participants and the global surviving field needs fewer tables. Snapshot table order breaks ties deterministically (the event controller must preserve its creation order); first empty destination slots are chosen. Remaining idle tables are balanced until their counts differ by at most one. Active tables and their seat assignments are never changed; deferred balancing is explicitly pending. Every movement records player/stack and old/new table/physical-seat identities. No wallet, hand or blind state is mutated.

`local-idle-balance-v1` intentionally does not claim native blind fairness/compensation. The future owner UI must disclose this local policy; production integration must apply the plan atomically after revalidating the affected hand states and preserve private seat-token/history ownership.

## Verification

`tournament-seating-test.mjs` first failed because the model did not exist. It now checks direct6+1→4+3 balancing, table consolidation, empty/finished fields, deterministic idempotence, strict malformed inputs, stack preservation and active-hand deferral. Exhaustive1,728valid three-table occupancy/live-state combinations preserve input snapshots, every player/stack, exact open/closed table partition and active-table identities. Three actual six-player Hold’em hands supply progressive snapshots; active peers stay unchanged and all5,400tournament chips remain in the final assignments.

## Remaining end-to-end work

This module is not yet imported into the runtime. It does not create an MTT, debit registration, start child tables, persist a parent event, rank eliminations globally, transfer authenticated browser sessions, pay prizes or provide an owner/player event interface. These are required next integration steps; a passing planner test does not mean multi-table hosting is playable. Native rebalance/blind/operator rules and pixel/audio timing remain unverified. Existing single-table and Spin3/6-Max flows remain active independently.


## Parent tournament coordinator (not yet served)

`engine/multi-table-tournament.mjs` now coordinates7–120funded entrant records across six-slot tables using the seating planner. Its input is a version1journal: immutable entries, explicit configuration and begin/finish events. Initial seating uses registration order round-robin, a declared local rule. Configuration requires both `local-idle-balance-v1` and `local-settlement-order-v1`, entry cost and positive whole prize percentages totalling100. It does not claim native initial random seating, cross-table simultaneity or blind compensation.

A numbered begin receipt records assigned identities/starting stacks. Finish consumes a matching internal authoritative room result (six final stacks and actual dealer index), validates identical total chips and empty-seat ownership, assigns global elimination places through the existing elimination helper plus the surviving external field, and invokes idle-only balancing. Cross-table elimination order follows serialized finish events; same-hand ties retain the existing starting-stack/dealer ordering. Retries of the current hand return the saved receipt without another event; changed results reject. A pending balance holds one least-populated idle table, while active hands and unrelated eligible tables can continue. `canBegin` and `waitingTable` expose that scheduling condition.

When one entrant remains, the coordinator derives all global places and exact play-credit prize amounts from the configured entry pool. It computes awards but does not debit or credit wallets. Public parent stack summaries are explicitly `lastSettledStack`, not a claim of live child-hand balances. Journal reconstruction replays checked operations and rejects duplicate/noncanonical events. The parent journal is bounded to100,000operations; reaching the cap rejects further mutation rather than silently discarding financial/history state.

The shared exact-prize allocator now exposes `tournamentPrizeAmounts` for1–100paid places (the whole-percentage model naturally caps at100), while `prizeAmounts` retains its legacy maximum9. Both reject sparse percentage arrays. Largest-remainder arithmetic and higher-place remainder ties are unchanged. Tests cover12paid places,100places,zero/MAX_SAFE pools and existing tournament/Spin/Battle payouts.

`multi-table-tournament-test.mjs` plays actual12-player/two-table Hold’em hands through a winner, checking3,600chips, all12globalplaces,300configured prize credits, journal reloads, duplicate/changed-result handling and active-peer isolation. The `--all-paid` variant awards all12positions. Additional deterministic receipts verify cross-table settlement ordering, equal-stack dealer tie order,4+4unfreezing after a peer finishes, malformed journals and JSON-key-order-insensitive retry. These synthetic receipt checks validate coordinator rules, not card outcomes.

### Required integration boundary

Only the existing authoritative room engine may call finish. No player/owner HTTP body may supply final stacks/dealer as a result. Server integration must atomically persist parent journal, child private hands, account registrations/entry debits and once-only final wallet awards. On restore, match active child initial stacks/identities/hand numbers against the parent receipts before enabling play. Preserve private history and invalidate/migrate old room tokens during reassignment. Owner creation, authenticated registration, child-room scheduling, browser migration and player/admin UI remain required; this parent model alone is not a playable app MTT.
