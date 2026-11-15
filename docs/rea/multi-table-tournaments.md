# Multi-table tournament hosting — local reconstruction

## Current integration state — 15 November 2026

Draft205 now includes funded registration, actual child rooms, authenticated seats and ready barrier, atomic private deals, real betting/settlement, idle physical reseating, account-bound old-token redirects and subsequent hands. A seeded seven-account test plays the real rooms to a winner: seven final places, 2,100 chips and 175 credits paid once. It tests showdown delay, active-peer isolation, failed-action/transfer write rollback and cold file reopen throughout. A separate 12-session HTTP test verifies a real server stop/boot during a private hand.

**UI hosting gate now passes:** an owner creates the event through the admin form; twelve players create local accounts, enter Home/Tournaments, register (including cancellation/refund/rejoin), open their assigned tables and play through transfers to personal paid results. No API write prepares the MTT in this acceptance scenario. A wrong MTT link to an owner-created cash table leaves both wallet and occupancy unchanged.

**Still incomplete:** native same-size pixel/audio comparison, broader MTT owner controls such as pause/cancel after allocation, and exact-head release QA. PR205 remains draft; live PR206 remains unchanged.

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

The draft runtime now imports this planner through the funded registry and parent coordinator below. Child table creation, live hand scheduling, authenticated browser migration and owner/player event screens are still missing. These are required next integration steps; a passing planner test does not mean multi-table hosting is playable. Native rebalance/blind/operator rules and pixel/audio timing remain unverified. Existing single-table and Spin3/6-Max flows remain active independently.


## Parent tournament coordinator (draft integration)

`engine/multi-table-tournament.mjs` now coordinates7–120funded entrant records across six-slot tables using the seating planner. Its input is a version1journal: immutable entries, explicit configuration and begin/finish events. Initial seating uses registration order round-robin, a declared local rule. Configuration requires both `local-idle-balance-v1` and `local-settlement-order-v1`, entry cost and positive whole prize percentages totalling100. It does not claim native initial random seating, cross-table simultaneity or blind compensation.

A numbered begin receipt records assigned identities/starting stacks. Finish consumes a matching internal authoritative room result (six final stacks and actual dealer index), validates identical total chips and empty-seat ownership, assigns global elimination places through the existing elimination helper plus the surviving external field, and invokes idle-only balancing. Cross-table elimination order follows serialized finish events; same-hand ties retain the existing starting-stack/dealer ordering. Retries of the current hand return the saved receipt without another event; changed results reject. A pending balance holds one least-populated idle table, while active hands and unrelated eligible tables can continue. `canBegin` and `waitingTable` expose that scheduling condition.

When one entrant remains, the coordinator derives all global places and exact play-credit prize amounts from the configured entry pool. It computes awards but does not debit or credit wallets. Public parent stack summaries are explicitly `lastSettledStack`, not a claim of live child-hand balances. Journal reconstruction replays checked operations and rejects duplicate/noncanonical events. The parent journal is bounded to100,000operations; reaching the cap rejects further mutation rather than silently discarding financial/history state.

The shared exact-prize allocator now exposes `tournamentPrizeAmounts` for1–100paid places (the whole-percentage model naturally caps at100), while `prizeAmounts` retains its legacy maximum9. Both reject sparse percentage arrays. Largest-remainder arithmetic and higher-place remainder ties are unchanged. Tests cover12paid places,100places,zero/MAX_SAFE pools and existing tournament/Spin/Battle payouts.

`multi-table-tournament-test.mjs` plays actual12-player/two-table Hold’em hands through a winner, checking3,600chips, all12globalplaces,300configured prize credits, journal reloads, duplicate/changed-result handling and active-peer isolation. The `--all-paid` variant awards all12positions. Additional deterministic receipts verify cross-table settlement ordering, equal-stack dealer tie order,4+4unfreezing after a peer finishes, malformed journals and JSON-key-order-insensitive retry. These synthetic receipt checks validate coordinator rules, not card outcomes.

### Required integration boundary

Only the existing authoritative room engine may call finish. No player/owner HTTP body may supply final stacks/dealer as a result. Server integration must atomically persist parent journal, child private hands, account registrations/entry debits and once-only final wallet awards. On restore, match active child initial stacks/identities/hand numbers against the parent receipts before enabling play. Preserve private history and invalidate/migrate old room tokens during reassignment. Owner creation, authenticated registration, child-room scheduling, browser migration and player/admin UI remain required; this parent model alone is not a playable app MTT.


## Funded registry and HTTP registration (draft only)

`multi-table-registration.mjs` stores version1events with immutable explicit settings, a monotonic derived revision, registration attempts/cancellations, the parent journal and final awards. Event IDs are48hex characters; capacity7–120, starting stack1–1M, play-credit entry0–1M, even big blind2–1M, level1–3600seconds and action5–300seconds are validated. Policy names and prize percentages are mandatory. These are local configuration limits, not native defaults.

The final funded registration allocates the complete field and journal in the same transaction as its wallet debit. Retrying an active entry does not charge again. Cancellation is idempotent before allocation; a cancelled account can re-register through a new recorded attempt. Allocation freezes the field. Free events do not create artificial entry/refund/prize cash transfers. Parent models are rebuilt/validated once on load and cached for reads, avoiding full journal replay on every lobby poll.

`cash-wallet.mjs` now records `multi-entry`, `multi-refund`, `multi-prize` receipts and separate cumulative `multiSpent`, `multiReturned`, `multiPrizes` totals. Registry validation recomputes exact expected totals across every event and compares all wallet accounts, including orphan-counter detection. Finished parent prizes are credited once; zero awards produce no cash receipt. Cashier labels describe these transactions and treat entries as debits.

`rooms.mjs` persists registry and wallets in the same existing atomic packed JSON transaction, rolls both back after failed writes or prize overflow, and checks the registry on load. `local-multi-tournaments` is a reserved unique storage key. Pending/free/allocated events count as active and block restoration both through the server activity guard and direct restore service. Completed/all-cancelled events do not remain active.

Owner GET/POST `/api/owner-multi-tournaments` uses the existing loopback-only owner-key/origin/JSON/16KB guards and idempotent creation/audit handling. Authenticated GET `/local/multi-tournaments` returns public settings/parent standings and only that account’s registration record. POST `/local/multi-tournaments/<id>/register` or `/cancel` accepts exactly the signed-in account, with same-origin/JSON/1KB limits. No endpoint accepts final stacks, dealer index, placement or a finish operation. Internal hand callbacks remain trusted server-engine output only.

### Verification and limits

`multi-table-wallet-test.mjs` uses12actual local cash-wallet accounts and real Hold’em engine hands through the internal parent callbacks. It verifies cancel/rejoin, exact300-credit escrow, failed final-entry write rollback, failed finish/prize-write rollback, a prize overflow after earlier awards with full rollback, once-only award retries,120,000total credits after settlement, free-field unchanged wallets, low funds, duplicate identity, private cloned views, cold parent/ledger reopen and semantic corruption rejection for counters/revision/entries/awards. Direct restoration is rejected while registration is active.

`multi-table-http-test.mjs` starts/stops a real temporary server and creates12independent authenticated profile/cookie sessions. Owner creation, player registration, cancellation/rejoin, duplicate retry, full field allocation, wallet totals and process restart pass. Account spoofing, foreign origins, extra result fields and finish routes are rejected. Existing cash/owner/tournament/Rush wallet, Spin and restore regressions pass.

The HTTP test stops before child gameplay; the financial test holds its card-engine games separately from the registry. Neither proves durable private child hands, cross-table card/session migration, rendered MTT controls or a playable app MTT. Those remain the next required integration steps, and draftPR205 must not be merged/deployed before the complete journey passes. LivePR206 remains unchanged.

## Identitatea meselor și ceasul comun — 15 noiembrie 2026

Registrul salvează `startedAt` la ultima înscriere necesară. Anularea/reînscrierea înaintea completării nu pornește ceasul; repetarea înscrierii și redeschiderea checkpointului nu îl resetează. Acest reper va alimenta nivelurile comune de blinduri ale camerelor. Checkpointurile alocate fără un timestamp întreg nenegativ sunt respinse; schema este încă exclusiv draft, nepublicată.

Fiecare masă din rezumat primește un identificator de cameră de 48 de caractere hexazecimale, derivat prin SHA-256 din domeniul versionat, eveniment și identificatorul mesei. Astfel nu este necesar un registru redundant de legături și identitatea rămâne aceeași la restart și la începerea unei mâini. Acesta este un identificator public, nu token de acces. Camerele efective și autorizarea lor nu sunt încă create de acest pas; existența câmpului `room` nu dovedește că masa poate fi deschisă. La crearea efectivă rămâne obligatorie verificarea coliziunii cu camere existente.

Verificare: `node multi-table-registration-test.mjs` acoperă momentul alocării, retry, checkpoint reopen, identități distincte între mese/evenimente, stabilitate după begin și respingerea ceasurilor invalide. Suitele financiare și HTTP cu restart trec în continuare. Nicio modificare în runtime-ul live PR206.

## Camere efective și locuri autentificate — draft

Ultima înscriere creează acum toate camerele de șase locuri în aceeași tranzacție cu registrul și portofelul. Limita de camere și coliziunile de identitate opresc întreaga operație. Fiecare cameră reține evenimentul, masa și distribuția inițială a conturilor; configurația, identitatea, ceasul și locurile sunt validate la redeschidere. Ștergerea sau modificarea unei camere alocate face checkpointul invalid.

Un cont alocat poate intra numai pe locul său, fără o a doua taxă de intrare. Tokenul trebuie să aparțină contului autentificat; recuperarea sesiunii folosește mecanismul existent de rotație. Cele 12 locuri și tokenurile au fost verificate după redeschiderea fișierului. Eșecul scrierii la ultima înscriere păstrează cele 11 înscrieri și banii anteriori.

Distribuirea cărților, ready-barrier, transferurile și interfața MTT sunt încă neconectate. În acest stadiu camerele acceptă numai join/state/watch/summary; comenzile de joc sunt respinse explicit. Validarea refuză mâini injectate în acest checkpoint intermediar. Activitatea financiară este controlată de turneul părinte, iar o mână reală neîncheiată blochează întotdeauna restaurarea. O cameră asociată unui eveniment absent/neîncheiat sau cu identitate neconformă nu poate ocoli verificarea de restaurare.

Test nou: `multi-table-rooms-test.mjs`; regresii financiare/HTTP MTT, Spin șase locuri, turneu simplu și restaurare model/HTTP. Testul financiar verifică acum și restaurarea unui turneu complet încheiat. Aceste dovezi nu echivalează cu un turneu multi-masă jucabil în browser.

## Prima distribuire privată — integrare internă în draft

`startMultiTournamentHands` pornește prima mână pentru toate mesele numai după conectarea tuturor conturilor alocate. Metoda este internă; nu există încă o comandă de player/owner în interfață pentru ea. Înregistrarea begin în coordonator și mâinile private folosesc aceeași tranzacție atomică. Repetarea după pornire nu redistribuie cărțile și nu scrie fișierul.

`multi-table-deal-test.mjs` verifică șapte jucători la mese de patru și trei: bariera de conectare, eșecul scrierii ambelor mâini, retry, 2.100 de jetoane conservate și lipsa unei taxe suplimentare. Avansarea ceasului comun cu șase intervale produce blindul plafonat 640 la ambele mese. După redeschidere, fiecare token vede exact cele două cărți proprii; spectatorul nu vede nicio carte privată. Sunt respinse nepotrivirile de număr, stack inițial, total, blind, cărți duplicate sau structură deck/hands invalidă. Recuperarea este verificată prin redeschiderea modelului de fișier, nu printr-un test nou de browser sau kill/restart server în timpul mâinii.

Coordonatorul oferă o copie a receiptului curent pentru validare fără a începe o mână nouă. Acțiunile de joc, finish autoritar și mutările rămân neconectate și blocate la nivelul comenzilor camerelor MTT. Acest pas nu reprezintă un turneu jucabil complet.

## Betting and authoritative finish

`multi-ready` requires a valid local profile, the account-bound seat token, local Origin and the current version when marking a new ready slot. Only after every assigned account at every initial table is seated and ready does the same persistence transaction begin all child hands. Extra result fields are rejected; the client cannot send after-stacks or awards.

All MTT room requests take a complete registry/rooms/wallet rollback snapshot. On an actual settled room hand, the parent receives the saved hand number, final stacks and dealer exactly once. Failed persistence restores the last action and parent finish together. Generic single-table winners and auto-deals are suppressed for these children; global status comes from the parent in the response's `multi` field. A complete showdown and a folded-hand payout have been verified at the room layer, with the active peer unchanged. New cards and transfers remain pending.

Tests: `multi-table-hand-test.mjs`, extended `multi-table-http-test.mjs`; registry/child/deal/wallet, Spin six-seat, single-table wallet and restore regressions pass. HTTP scope includes actual server stop/boot during private play. No rendered browser MTT acceptance journey has passed yet.

## Idle physical seating, privacy and later hands

The registry persists `layoutAt`, a journal position for the seating layout actually applied to child rooms. Loading replays that prefix once and caches its table snapshots; reading the physical layout does not replay the journal on every poll. The current parent may already plan another layout while completed private hands remain available for showdown. This separates planned moves from applied moves without pretending an active hand has moved.

The internal seating operation preserves every active table, waits at least 3,000 ms for any affected completed showdown, and atomically updates all affected rooms plus the layout marker. Outgoing tokens are retained as account-bound departure receipts; destination tokens are rotated. The old token yields only a current room redirect or eliminated status after matching the signed-in account. Incoming players must recover a fresh destination token. Old private hands are cleared before new occupants appear; HUD history remains keyed to its original account subjects and room. Only card-free dealer metadata survives for the next hand.

Later authenticated ready acknowledgements start eligible parent tables from the authoritative current stacks and numbered begin receipt, retaining local dealer progression and global blind clock. The parent alone credits the final prizes. The seeded seven-account room test reaches a winner, cold-reopens during actions, verifies all seven places, 2,100-chip conservation and 175 credits exactly once. The internal seating operation is still explicitly driven by this test; HTTP automatic scheduling and rendered UI remain mandatory acceptance gates.

## Automatic server progression and full HTTP tournament

The existing 500 ms server timer now calls `tickMulti` under the same restore freeze guards. One registry/rooms/wallet transaction expires overdue actions, settles real completed hands, applies eligible idle seating after the showdown delay and starts ready hands. It reuses the same seating/start implementations as the internal test helpers without nested persistence transactions. A failed disk write restores the entire tick, including actions at both tables. An unchanged tick does not rewrite the checkpoint.

The extended `multi-table-http-test.mjs` uses twelve independent profile cookies and seat tokens, creates/joins/readies through HTTP, restarts the actual server during a private hand, follows automatic transfer receipts with fresh destination tokens, plays every later hand to a winner and verifies all twelve places, 3,600 chips and 300 prize credits. A second process restart preserves the winner and every wallet balance. A source token must be removed before destination join; it does not authorize the destination. A timer may rotate a completed-seat token between state and ready, so that ready attempt can be rejected and recovered by the following state redirect.

`multi-table-tick-test.mjs` separately advances the clock for both tables, forces the shared tick write to fail, proves rollback, reruns expiry successfully, proves unchanged-tick idempotence and reopens the checkpoint with 2,100 chips and unchanged entry debits. These are API/model proofs. Browser reconnection, ready acknowledgements and owner/player screens are the next required layer.

## Rendered table journey — seven and twelve isolated sessions

`network.mjs` now consumes account-bound move/elimination envelopes separately from ordinary room snapshots. A move waits for current payout elements, joins the destination with the signed-in local profile and no old-room Authorization, validates and saves the fresh token, then replaces the table URL. Same-room reseating updates the token in place. Eliminated sessions keep polling the source receipt for global standings and final personal prizes. Reload with no previous in-memory room state receives a card-free envelope sufficient to render the final status safely.

The poll loop sends `multi-ready` only after local payout elements/pending hand transitions finish. MTT table text shows the funded global pool, local policy, remaining field and global standings. Unsupported local withdrawal controls are suppressed during initial MTT waiting. These additions reuse the playable six-seat layout and betting controls; they do not establish native pixel identity.

`network-browser-test.mjs --multi-table --multi-seats=12` uses twelve separate Chrome storage contexts, muted/headless at 1196×929. Both initial tables have six assigned humans. One context runs normal motion, others request reduced motion. Actual visible betting controls play to the winner, the existing independent payout oracle checks completed hands, the process is restarted during private play, transfers recover fresh tokens, and all twelve final ranks/wallet prizes remain correct after a second server restart plus page reload. Total chips: 3,600; prize credits: 300. The seven-session variant also passes, as does the existing six-session rendered Spin regression. The test records that no destination join starts while an award element remains. No owner live data or native account was used.

The first twelve-session attempt exposed a test setup race: form existence did not prove its async submit handler was ready. The harness now waits for the actual handler before submitting, matching the existing browser-test convention. Owner creation and player registration are still API fixture setup in this scenario; the lobby implementation and uninterrupted UI acceptance remain next.

## Owner and player lobby integration

The existing owner page now offers a multi-table form for 7–120 players, starting chips, entry credits, prize percentages, first even big blind, blind interval and action limit. The explicit local seating/ranking policy is disclosed. The tournament ID is stable across retries; creating a new ID is a separate action. The shared owner request helper preserves owner-key authentication, JSON validation/error reporting, timeout and stale-key response guards. Owner lists show registration/waiting/playing/finished state and the winner. The native operator interface is unobserved; this admin UI is a local implementation.

The existing Tournaments catalog combines single-table and MTT records using the same row/detail infrastructure, sort, search and buy-in filters. Register debits once, cancellation before allocation refunds once, and assigned players open their current table. Completed/eliminated entries show personal place/prize rather than offering a false registration. Registration anchors have keyboard button semantics; ordinary table links reset those handlers. Assigned table links verify the signed-in player's event/room assignment before automatic profile join, so arbitrary MTT parameters cannot cause an unattended cash buy-in.

The twelve-context browser scenario now creates the event through the actual owner form, creates each local player through the login form, clicks Home → Tournaments, registers/cancels/rejoins through visible controls, opens assigned tables and plays to a winner. It also creates a cash guard table through the owner form and verifies that a wrong MTT link changes neither its occupied count nor the user's balance. Server restart and final personal paid reload remain covered.

A separate ordinary four-player tournament regression exposed an observation race in its assertion: payout-animation waits can skip a short blind-all-in hand. The hand's payout oracle still passed, but the stack assertion used the last observed hand rather than the immediate predecessor. It now uses the retained preceding result, requires it to exist, and preserves independent payout/conservation checks. The full four-player regression then passed, including geometry, payout sequencing, wallet history and restart.

## Review: cross-room persistence and idle timer

A four-table boundary case was missing from the twelve-player journey: a ready acknowledgement from an unchanged waiting table can start another eligible table's next hand. The previous persistence predicate looked only at the requesting room version and wallet. The new synthetic 24-account receipt fixture reproduced a hand present in memory but absent from disk. MTT requests now also compare their complete transaction snapshot; an unacknowledged write failure rolls back the other room and its parent begin receipt together. Unchanged requesting-room touch metadata is restored so a read does not become a disk write. The fixture is explicitly synthetic settlement setup and does not claim a 24-player poker payout test.

The idle MTT timer also performed two complete serializations per call with no allocated tournament. It now skips work when no allocated event needs progression, including completed events after final seating application. Existing expiry/write-rollback tests continue to pass.

The same review corrected two presentation boundaries: switching from Battle to Tournaments clears stale disabled/keyboard semantics, and multi-entry/refund/prize wallet notes identify the tournament rather than a cash table. The rendered scenario verifies keyboard registration after switching tabs and the real Cashier transaction note.

## Ready acknowledgement recovery and shared table controls

A one-shot 401 response to `multi-ready` reproduced a stalled tournament: the generic error branch removed the source token and stopped polling, so no participant ready acknowledgement followed. MTT non-state actions now perform one authenticated state read with the existing token. It can consume the server's account-bound move/elimination receipt. Ready acknowledgements can proceed on a later poll; other actions report that they were not repeated. Betting actions are never automatically replayed. If that state read also returns 401, the existing generic branch still clears the unauthorized session. The fixture then reloads through normal local profile authentication rather than treating the rejected token as authorized.

Ready requests also use the same five-second abort boundary as the other presentation acknowledgements. The lost-ack fixture lets the actual server accept a successful ready response, then withholds that response until the signal aborts. The existing token remains available for the next authoritative state read. The fixture retries injection after any non-success response so it does not mislabel a stale-version rejection as a committed acknowledgement.

The MTT command guard now delegates participant chat, private notes/history, Helmet, chip shuffle and selective post-hand reveals to the existing shared handlers. Account/token checks, Helmet chat blocking, shuffle rate limits, note-owner subjects and card-index validation remain active. `multi-table-controls-test.mjs` covers note isolation and cold recovery, a single-card reveal with the other card concealed, and unchanged payouts/wallets/chip totals. The rendered scenario exercises actual chat, private-note, Helmet and shuffle controls; it verifies that another player's private notes remain empty. Selective reveal is currently proven at the room API layer, not with a new rendered MTT animation comparison.

## Current verification checkpoint — 15 November 2026

At commit `15188ae630b14d8fda6cc54dbb24adf23f5a21d0`, the exact-head QA run passed its first 26 checks, then failed the combined twelve-browser fault/control scenario. Expanded browser instrumentation established that the initial acting player's raise did reach the server and received HTTP 409 (`Table changed; refresh and try again`); the earlier first-client-only counter could not establish absence of other players' requests. Helmet/shuffle updates advanced the betting action-version boundary despite leaving the hand unchanged. A focused regression reproduces that rejection, then passes after preserving the existing action boundary for those presentation-only operations; an actual intervening poker action still invalidates the old version. The combined twelve-browser rerun passes: actual betting, independent payout checks, transfers/rejoin, a mid-hand process restart, all twelve finishing places, 3,600 chips and once-only 300-credit prizes. This is working-tree evidence; exact-commit release QA remains required. PR205 remains draft and unmerged; these MTT changes are not installed in the owner's live app. The prior passing QA record belongs to `7e28d67`, not this revision. Exact native seated controls, animation/audio timing and complete feature parity remain unverified.

`--multi-ready-401`, `--multi-ready-state-401`, `--multi-ready-timeout`, `--multi-control-401`, `--multi-act-401` and `--multi-controls` are bounded browser fault/feature fixtures. Rejected chat preserves the draft and sends nothing until an explicit user retry; rejected betting preserves the token and hand history, with exactly one attempted action before an explicit second click. The combined seven-context scenario passes through a full paid tournament. Native pixel/audio parity and configured MTT time-bank rules remain outside these checks.
