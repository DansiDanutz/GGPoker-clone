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
