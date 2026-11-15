# Multi-table tournament hosting — local reconstruction

## Current integration state — 15 November 2026

Draft205 now includes funded registration, actual child rooms, authenticated fixed seats and ready barrier, atomic first private deals, real betting actions and parent settlement derived only from the actual finished hand. A 12-session HTTP test stops/boots the server during a private hand, recovers the same cards, plays a complete folded hand and verifies that its active peer remains untouched. The seven-account room test also settles an all-in hand, cold-reopens during actions and verifies final-action write rollback plus 2,100-chip conservation.

**Still incomplete:** physical reseating, next hands, reconnect redirects after transfers, full owner/player MTT screens and end-to-end tournament payout through real rooms. The parent planner can already record transfers, but those are not yet applied to physical child rooms. Completed hands remain visible in their original seats; no incoming player is assigned an old private hand. The live PR206 runtime remains unchanged. Earlier sections below describe their historical implementation stages; this paragraph is the current status.

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
