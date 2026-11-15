# Spin & Gold 6-Max — model local explicit și poarta de integrare

## Ce dovedește sursa nativă

SpinAndGoldType citește TableType și MultiplierSetId din tagSitAndGoType. Schema include separat BlindStructureSetId și PrizeStructureSetId. tagSpinAndGoldTypeInfo primește listele de tipuri, multiplicatori și asigurări; acestea nu sunt un tabel local complet de probabilități/prize. SpinAndGoldTabInfoPage afișează explicit3-Max sau6-Max. SpinAndGoldWheelData are o ramură6locuri cu praguri de efect10/50, distincte de5/25 la3-Max; asigurarea6-Max este legată separat deX4.

Aceste clase dovedesc existența formatului și dependența de configurația primită, nu valorile efective pentru contul/brandul instalat. Reutilizarea probabilităților3-Max sau a scării sale de blinduri ar inventa reguli native. Hashurile surselor sunt în spin-six-source.json; analiza este statică FFDec în fluxul REA, fără joc sau cereri în contul real.

## Modelul implementat

engine/spin-six.mjs acceptă exclusiv o configurație completă mode=local-practice, seats=6. Proprietarul trebuie să furnizeze buy-in-ul, scara SB, ceasul și fiecare rezultat: multiplicator, frecvență, procente de premiu, stack inițial, carduri de timp, unitate/interval de nivel și noDealing=false. Nu există valori implicite împrumutate din3-Max. Limitele locale sunt explicite:1–32rezultate,1–64niveluri, interval1–60, stack300–1000,1–4carduri; acestea nu sunt o configurație efectivă a operatorului recuperată.

Frecvențele locale însumează exact100.000.000de bilete. Biletul trebuie să fie întreg în[0,99.999.999]. Multiplicatorii sunt unici, toate sumele sunt întregi sigure, blindurile strict crescătoare cu dublarea BB fără overflow. Procentele au1–6locuri pozitive și însumează100. Calculul premiilor reutilizează prizeAmounts, cu distribuirea resturilor și șase poziții, completate cu0unde nu se plătește.

Nivelurile folosesc scara explicită și intervalul rezultatului ales, după timp sau număr de mâini. Ceasul întors înapoi rămâne la nivelul1; capătul scării este plafonul. Modelul validează și clonează configurația, inclusiv array-uri și ceas propriu complet, astfel încât un apelant nu poate modifica regulile printr-un rezultat aliasat.

## Verificare executată

spin-six-test.mjs acoperă configurații incomplete, câmpuri suplimentare/moștenite, array-uri rare, intervale fracționare, overflow, probabilități greșite, multiplicatori duplicați și premii invalide. Verifică ambele margini ale fiecărui interval de bilete, rotunjirea exactă în șase poziții, nivelurile pe minute/mâini și plafonul final. Regulile fixtureului sunt arbitrare și locale, nu probabilități pretinse native.

Un rezultat este folosit pentru o mână reală în motorul Hold’em cu șase locuri:300fise fiecare, all-in/call, board complet și1800fise păstrate. Payout-ul este verificat prin enumerare independentă de mâini de cinci cărți folosind rank5. Testele3-Max de probabilități, reguli, bancă și înscriere rămân verzi. Acesta este un test de model/mână; nu dovedește înscrierea sau portofelul6-Max.

## Poarta pentru a deveni jucabil

Modelul este acum utilizat de extensia băncii descrisă în spin-six-bank.md; activarea aplicației se verifică separat în raportul de versiune. Lobby-ul și înscrierea6-Max rămân închise. Urmează obligatoriu:

- Audit și configurație owner6-Max separate de regulile3-Max; versiunea fiecărui match trebuie înghețată.
- Rezervarea expunerii băncii față de șase buy-in-uri, asigurareX4 numai cu termeni expliciți și migrare sigură a checkpointurilor vechi.
- Șase înscrieri autentificate, retry/idempotence/anulare și rambursare atomică, fără mixarea cohortelor3/6.
- Șase locuri reale, gate de prezentare pentru toți, turneu până la câștigător, premii și restart fără plată duplicată.
- Prezentarea nativă6-Max: poziții, praguri10/50, rezultate/congratulations și verificare în browsere separate.

Nu declarăm Spin6-Max funcțional în aplicație înaintea acestui traseu complet. Runtime-ul activ și datele proprietarului nu sunt modificate de acest model neconectat.


## Owner rule persistence — working-tree integration

`spin-rules.mjs` accepts complete explicit six-seat configurations at the existing local practice stakes (5000/10000). These stakes are a local product restriction, not evidence of native six-seat configuration. Rule identity is `(buyIn,seats)`; version-1 three-seat checkpoints remain accepted and saving the first six-seat rule upgrades to version 2. Mixed snapshots preserve both audits. The top-level clock must equal the six-seat configuration clock.

The player `/api/spin` response and existing queue deliberately select only three-seat rules until six-seat registration/table integration is complete. A pending three-seat registration does not block saving independent six-seat rules at the same stake; updating its own three-seat rules remains blocked. No live activation in this step.

Verification: `spin-six-rules-test.mjs` covers same-stake coexistence, immutable legacy configuration, duplicate retries, conflicting clocks, migration, corrupted checkpoints, persistent room reload, unchanged-file rejection and queue isolation. Existing rules/queue model and HTTP tests pass. Full six-account registration and playable tournament are still outstanding.


### Funded six-account entry escrow — working tree

The internal room registration API now accepts the explicit six-seat configuration, validates its buy-in, caps active entrants at six, and reserves six-seat bank exposure before debiting each real local cash-wallet account. Checkpoint validation cross-checks the complete bank configuration against the registration, not just the stake. Cancel/refund reuses the existing atomic ledger. Three-seat behavior remains unchanged.

`spin-six-entry-test.mjs` verifies six separate funded accounts, exactly-once registration/debit, a cold reload after each entry, seventh-account rejection without mutation, six refunds and exact capital restoration, insufficient bank capital without debit, contradictory buy-in rejection, and tampered reservation configuration rejection. This is room/wallet integration, not six authenticated browser sessions. Drawing a six-seat match is still explicitly gated until its table, ready barrier, blind clock, results and presentation use six-seat rules throughout. No live activation or complete playable six-seat claim.

Regression run: entry, atomic-entry, draw, table, settlement, rules, rules-HTTP, queue, queue-HTTP, six-rules, six-bank and six-entry tests all passed; syntax and diff checks passed. Public player registration remains three-seat only.


### Six-seat table integration — supersedes the internal draw gate above

Internal six-seat registrations now feed the playable Hold’em tournament. The room retains the exact funded configuration; checkpoint validation checks it against both entry and bank snapshots. The ready barrier uses the actual room seat count, so the sixth confirmation starts the first hand. Blind progression uses only the explicit six-seat ladder and clock. Six finishing places come from the actual tournament and drive once-only bank/wallet settlement. Prize shares use the configured integers, preserving exact rounding rather than reconstructing percentages from rounded payouts.

`spin-six-table-test.mjs` plays a complete tournament with six local account/token identities, reloads the room after every action, checks 1800-chip conservation and all six finishing places, verifies exact wallet payouts and total capital conservation, rejects premature manual settlement and nonparticipants, and tests rollback of the final ready confirmation and every action when persistence fails. A changed room configuration is rejected on reload. Fourteen targeted model/room/HTTP regressions passed; the strengthened table test passed afterward. This does not yet prove six separate browser UI sessions, native graphics/sound timing or public 6-Max queue behavior.

The eight-segment wheel is returned only for an explicit eight-outcome configuration. Other complete local practice configurations remain playable through the internal API without inventing extra wheel outcomes. Public six-seat presentation and owner forms still require integration before activation.


### Authenticated six-seat queue — working tree

Player queue commands accept explicit `seats:6`; omitted seats retain the established three-seat behavior. Format is part of the operation identity, and a retry cannot switch formats. Rules are matched by stake plus format, using owner revisions, and the sixth entry atomically draws the outcome, settles X4 insurance and creates the six-seat room. `GET /local/spin?seats=6` discovers only six-seat rules; the default still returns three-seat rules. Invalid/duplicate format parameters reject with 400. Existing account/origin protections apply unchanged.

`spin-six-queue-test.mjs` verifies six matched entries, failed sixth-write rollback, exact X4 insurance awards, immutable format identity, replay and cold restart. `spin-six-queue-http-test.mjs` uses six independently authenticated cookie/token sessions on a temporary HTTP server: discovers explicit rules, checks origin/account rejection, registers all six, restarts before ready completion, plays a complete 1800-chip tournament, verifies six unique places and exact wallet/insurance/bank conservation, then restarts and verifies balances again. The latest ten-test regression run including existing three-seat HTTP/table/insurance flows passed. These are HTTP sessions, not rendered browser windows; public six-seat UI/owner forms and native graphics/audio comparison remain outstanding. No live activation.


### Rendered player lobby integration

The player lobby now offers an explicit 3-Max/6-Max format selector. Six-seat stake summaries, X4 insurance terms, registration counts, payout rows and blind tables use the configured six-seat data; they do not borrow three-seat jackpot odds or ladders. Pending saved requests include their format, reject mixed batches and lock the selector while retrying. A reload recovers the pending six-seat format before enabling registration. The browser module `engine/spin-six.mjs` is explicitly served by the static allowlist.

Muted headless `network-browser-test.mjs --spin-six-lobby` passed actual rendered format selection, payout/blind dialogs, insured registration with a deliberately lost successful acknowledgement, reload/retry without a second debit, 1/6 display, cancellation and full refund. `--spin-queue --spin-insured-queue` passed the complete existing three-seat lobby-to-table tournament, independent payouts and restart. The latter test now waits for a registration link to reappear after server restart in each browser context, correcting an observed test synchronization race. Six authenticated HTTP tournament tests also passed again.

This selector is a functional local integration; its exact native position is not claimed verified. Owner six-seat forms, full six-browser table presentation and native visual/audio comparison are still outstanding. The eight-segment native wheel cannot represent arbitrary outcome counts; those local configurations must receive an explicit faithful presentation path before live six-seat activation.


### Rendered owner form

Owner Spin rules now select 3-Max or 6-Max independently at each supported stake. The six-seat form requires an explicit ascending small-blind ladder and editable outcome rows: multiplier, frequency out of 100M, first-place-onward prize percentages, starting chips, time-bank cards, interval unit and interval. Rows can be added/removed; no six-seat defaults are invented. Existing clock/insurance/revision/audit handling is reused, with X4 insurance labels and seat format recorded in audit display. Client normalization and existing server validation reject incomplete probability distributions without advancing the revision.

Muted headless `--spin-six-rules` passed empty-field checks, explicit save, format separation, row add/remove, invalid frequency total rejection without revision change, lost successful acknowledgement followed by idempotent retry, and real server restart/reload. Existing `--spin-rules` also passed its three-seat workflow including pointer save, stale owner-key response rejection and rollback. Six-seat table graphics/audio and full six-browser acceptance remain outstanding; no live deployment.
