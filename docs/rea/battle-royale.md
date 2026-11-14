# Battle Royale — native evidence and reconstruction obligations

Status: source investigation plus partial local implementation. Registration, Rush hands and backend all-in qualification are implemented and tested below. Final-table play, bounty/prize settlement and full native parity are not complete. Earlier sections record investigation-time limits; later implementation checkpoints supersede them. Codex-only/background inspection; no native account action or real-money operation was performed.

## Evidence boundary

Nine selected classes were recovered from the installed IronDesktop.swf with the existing FFDec. This is the established SWF fallback for REA; no new dependency or app activation. The extracted classes remain private in Sandbox. The English labels below come from the already extracted native-language-en catalog. Server presets, current live format values, bounty distribution, table migration and final ranking policy have not been captured. Source behavior is distinct from observed native runtime behavior.

## Player entry and registration

RegisterBattleRoyaleCommand accepts a typed registration intent. Outside its account-specific German table-limit branch, it compares the user's existing registrations with unfinished entries at the same buy-in. If another matching entry is available it sends registration; otherwise it shows the native unavailable alert. This count comparison is not proof of backend eligibility or an adequate replacement for server validation.

RegisterBattleRoyale uses request1553. It sends BattleRoyaleTypeIndex, Count, an explicit tournament-dollar-first AutoActionFlag, optional TourneyId when not reusing the current window, and TicketIds. The response contains a ResultList and type index. Success synchronizes/creates the tournament entry, attaches its BattleRoyaleType, creates an empty user table and player, then issues OPEN_TABLE. Current-window registration supplies the old tournament as fromTableID. Each response item can fail separately; the client increments its ticket-use index per result. The final callback refreshes playing counters and tournament status.

Failures branch to account/buy-in error handling, event-not-found or registration-stopped alerts, ticket-only restrictions and registration-unavailable messages. A local implementation must provide durable, account-bound play-chip reservation/debit/refund and idempotent registration before opening a playable table. Browser success alone cannot prove funding or seat ownership. Real tournament dollars, tickets, responsible-gaming services and jurisdiction responses are native integration evidence, not local services already implemented.

## Server-configured format

BattleRoyaleType obtains currency, buy-in, table type, bounty settings and highest bounty from tagBattleRoyaleTypeInfo. Its preset supplies StageList; there is no fixed participant count or duration in these classes. Bounty item probabilities or selection behavior are not established by merely reading the displayed bounty list.

| Preset field | Responsibility / proof still required |
|---|---|
| Id, Name | Stable format identity and displayed name |
| BlindStructureId, StartLevel | Structure lookup and initial level |
| StartingChips | Tournament chips, separate from entry cost |
| EnableBlindRollbackForward | Rule exists; exact recalculation not yet traced |
| PayOutType, PrizeStructureId | Prize model references; actual allocation not recovered |
| InTheMoneyPlayers | Number interpolated into final-table rules |
| StageList | StageId-keyed stage definitions |

BattleRoyaleStageInfo indexes protocol stage objects by StageId. Fields read by these getters include MaximumPlayers, DurationMinutes, DurationHands, TableSize, StartBlindBBMultiplier, StartBlindLevel, StageEndTime and ChessClock. Stage2 is in hand-limit mode when DurationHands>0 and DurationMinutes==0. Stage3's displayed chess-clock minutes divide the supplied ChessClock by60. Stage1's survive-to-top helper reads stage2.MaximumPlayers, while the current rules popup interpolates stage3.MaximumPlayers. These are different reads and must not be silently collapsed into one assumed constant.

## Native rules view

The rules popup is500×482. Rush content starts40/51; final-table content starts40/307, moving to40/251 when no Action Race promotion exists. The body uses native Roboto labels with20px section titles and14px description text. The external More link is outside the requested in-app reconstruction scope.

| Native key | Meaning and parameters |
|---|---|
| OnlyHalfWillSurvive | Rush section heading |
| RushStageEndValuePlayers | Rush ends at supplied final-stage participant count |
| FastValueAction | Duration heading interpolated from stage1 minutes |
| IfValueMoreShootOut | After the time limit, ranks at the supplied cutoff and lower enter an all-in shootout for final-table qualification |
| ClimbActionRaceLeaderboard / RackUpRushStage | Promotion-dependent action-race description |
| OpenUpMysteryJackpoBounty | Final-table knockouts open Mystery Jackpot Bounty rewards |
| ValuePlayersReceivePrize | Top preset.InTheMoneyPlayers receive prize money |

The popup passes [stage3MaximumPlayers, stage1DurationMinutes, stage3MaximumPlayers] to the timeout description. The stage-change notice uses stage3MaximumPlayers−1 in its timeout branch. This supports a distinction between automatic qualifiers and shootout participants, but does not yet prove tie-breaking, survivor assignment, table count or multiway shootout settlement. The complete server-provided AlivePlayers/ShootOutPlayers lists must remain authoritative.

## Stage changes and presentation

OnBattleRoyaleStageChanged is callback2551. It locates the tournament by SitAndGoId, updates current StageId, TourneyStageType and TourneyStageStatus, and records StageEndTime (special handling for Shootout). A finished Rush stage records AlivePlayers, ShootOutPlayers and IsFinishedByTimeout. It marks the user's Rush table finished and, when alive-player data is present, all Rush tables finished. It then broadcasts stage-change and table-promotion refresh notifications. This is a server-driven transition, not a local tab switch.

BattleRoyaleStageChangedCommand handles these UI states:

| Type/status | Client effects |
|---|---|
| Rush / Ready | Ready-count sound once per match, replace relevant notices, display top-player/time data, mark pending stage start |
| Rush / Finished | Clear Rush notices; when not catching up, show normal/timeout finish notice if no hand is playing; round-end sound once and only when in-hand sound is enabled |
| Shootout / Ready | Mark stage start pending |
| FinalTable / Ready | Reset Battle Royale mode, mark stage start pending and show prize-count/highest-bounty notice for a nondropped player |
| Every update | Refresh background and table menu |

The native Rush-ready branch activates its table window. That foreground behavior will not be reproduced during background work; the user's no-focus-stealing requirement takes precedence. Catch-up/once-only flags are required evidence for reconnect sound behavior. These source branches do not establish actual MP3 identity, overlap or physical timing.

## Integration obligations and acceptance gates

1. Recover remaining stage/player/preset protocol fields, BattleRoyaleInformation mode selection, registration cancellation, Rush seating/migration and final-table hand/bounty callbacks. Validate current native format variants before selecting a local owner preset.
2. Reuse the account wallet and owner authorization for a durable local event catalog, registration/cancellation/refund, explicit local play-chip entry and funding policy. No real currency integration. Restart and concurrent-registration tests must prove exactly-once funding.
3. Integrate real Rush hands and tournament stacks with elimination, clock/hand-limit boundaries and explicit survivor/shootout policy. Test real separate accounts, unequal all-ins and folded players. Preserve chips at every transition.
4. Implement shootout and final-table qualification from documented rules, with tie cases, already-playing hands and failed persistence tested. A one-table freezeout is not sufficient evidence for Battle Royale.
5. Implement final-table bounty/prize accounting and owner configuration using explicit local rules where native server policy is unknown. Verify each knockout, shared elimination, fund conservation and final winner after process restart.
6. Reconstruct the native lobby/register/rules/wait/Rush/shootout/final/results controls and graphics. Every control must change real local state. Verify geometry at matched viewport sizes and decoded sound/frame behavior; keep physical parity unproven until actually observed.
7. End-to-end acceptance: launch→local login→Battle Royale catalog→register→Rush play→qualification/shootout as required→final-table play→knockout bounty→winner/prize→reconnect after restart. Verify every debit, stack transfer and payout independently. T3 remains stopped.

No gate above is currently passed for local Battle Royale. Existing ordinary Rush/tournament tests prove only their respective components.

## Recovered source identities

- com/nsus/iron/controller/RegisterBattleRoyaleCommand.as: `d2201500ebf9289e40400928553086dc7daf60e9b6abee53b23b1e924d1914a0`
- com/nsus/iron/lobby/view/battleroyale/StageDescriptionType.as: `3b24010251a7b76b3e203202a6bc9d5fa65c762ed18c2803cc6be2cb4d180263`
- com/nsus/iron/popup/BattleRoyaleRulesPopup.as: `3f5297692c495da59418cb72adb695d49c54311b42e7bf5d68e5b5c29647be2d`
- com/nsus/iron/services/callback/OnBattleRoyaleStageChanged.as: `cc8c3d0a693348413e52014015727ba9f1b4ee71da6f2984df47d742cbd8d698`
- com/nsus/iron/services/request/RegisterBattleRoyale.as: `baa77f5ac538b0956f0409b190774026fd64db19eb2a2cd2ae98b075d763c96a`
- com/nsus/iron/table/controller/BattleRoyaleStageChangedCommand.as: `10cca7c483d33e8f62921ef3495ba05a95d4161475c97ae8d9d6529d317f29e1`
- com/nsus/iron/vo/battleroyale/BattleRoyaleStageInfo.as: `bed63aa4b0e0c76524def977977cb8320e6469177a70002a3a66c15ab246fa14`
- com/nsus/iron/vo/battleroyale/BattleRoyaleType.as: `d4cd082a440418a6fdffb4fa45018ea3c6a1fffdcf4e7e669e179dcf213b87c3`
- com/nsus/network/protocol/types/tagBattleRoyalePreset.as: `3363a1222b2afe69ebd16a28991ef49ef8556b1db6fc5cd3415e3d02af09bddf`

## Session, cancellation and engine integration follow-up

A further eight classes were recovered (17 total). BattleRoyaleInformation maps stage id2 to Shootout,3 to FinalTable and other ids to Rush. Ready/Started/Finished are separate server statuses. Its remaining-time display subtracts the synchronized TimeManager clock from the authoritative stage end and clamps at zero. Rush and Shootout have different stored deadline sources. Final-table participant count reads stage3.MaximumPlayers. The starting-blind label combines the configured level's actual small/big blind with the stage's StartBlindBBMultiplier; this is presentation evidence, not proof of the algorithm that computes rollback/forward blinds.

Player records carry UserId, TableId, Sequence, Place, Chips, KoPlayersCount, Bounty and IsDroppedOut alongside nickname/account metadata. Sequence and Place exist as server values; neither field alone establishes a ranking tie-break rule. Stage protocol fields additionally include UseChessClock, BettingDuration, SandGlassDuration, UseChessClockFromPreviousRound, TimeChipCount and ChessClockBlindUpHandCount. These must not be silently replaced by ordinary cash-table time-bank defaults.

GetRushTourneySession is request1556 and sends both SitAndGoId and RushSessionId. On success it requires a known tournament, an existing userRushSession and exact returned session-id equality before syncing; an ended session is cleared. Wrong/stale session responses do not re-seat the player. RushTourneyNewHand request3170 sends RushSessionId and has no local response behavior in its wrapper. OnUpdateRushTourneySessionStatus callback2552 looks up the event's own Rush session, records the new status and broadcasts CHECK_RUSH_STATUS; Idle→Waiting carries a special boolean. This does not yet identify the actual relocation-table callback or the complete session sync structure.

UnregisterBattleRoyale request1554 sends SitAndGoId. The response wrapper treats ErrorTourneyUnregisterNotAllowed specially; other results can clear registration/UI state and send LEAVE_TABLE, even beyond the explicit Success branch. This is an observed client cleanup path, not evidence that funds are refundable on every such response. The local ledger must refund only a proven, authorized cancellation exactly once and preserve funding on unavailable/stale/failed requests.

RegisterBattleRoyaleTableCommand supplies the existing event/window id, type, prior tournament-dollar preference and ticket ids for Play Again, setting isCurrentWindow=true and hiding the multi-table-count picker. A successful new registration must remain a distinct event/session; reusing the visible window must not reuse its old seat authority.

### Current local reuse limits

The inspected engine/rush-pool.mjs can preserve chips, detach folded players and rematch across concurrent six-seat tables; it validates checkpoint totals and assignment ownership. However it requires exactly six players per dealt table, initial stacks at least4big blinds, and a fixed pool blind. These constraints cannot represent arbitrary native StageList.TableSize, late-stage low stacks or stage-specific blind changes without deliberate adaptation and tests.

The higher-level rush.mjs currently creates200-chip cash entries, debits/cashes out the cash wallet and reconstructs a fixed4-chip-blind pool. It is not a tournament registration/stack-transfer service. Battle Royale must separate a one-time entry-cost ledger from tournament chips and must not debit the player's cash wallet every rematch or credit tournament stacks on stage migration. Existing cash behavior must remain covered by its wallet/restart tests.

Next implementation boundary: first trace Rush-session relocation, tournament hand completion and bounty callbacks; then define an event-owned pool coordinator using the existing hand evaluator, strict per-event account/session authority and atomic persisted transitions. Counts/durations/blind policy must be owner-explicit local practice rules until native server values are actually observed. No native server fixture or inferred rule is a completed local feature.

### Additional source hashes

- com/nsus/iron/model/battleRoyale/BattleRoyaleInformation.as: `c536bef0541d11e19316dcbcc3915a26a2102e1f1593ce8882f2760f508755ec`
- com/nsus/iron/services/callback/OnUpdateRushTourneySessionStatus.as: `feaee16b68fdaebbcbbda9679b0d6ea53f72a200293e2e2b525d8e1621a6bb5f`
- com/nsus/iron/services/request/GetRushTourneySession.as: `711be9d2ccb4b7e70bee1b0d694475018e17cf54d4ce825a16f5569212c118f2`
- com/nsus/iron/services/request/UnregisterBattleRoyale.as: `f72ca320cfc66a3d5952dfa2143d321993ee70049228b44ff09f12d17e93aba9`
- com/nsus/iron/table/controller/RegisterBattleRoyaleTableCommand.as: `d188ca7a67b89491f5da843a6feb66ea150f9fc5b4f66b59838fae3f2d25f5c5`
- com/nsus/iron/table/services/request/RushTourneyNewHand.as: `b0dbcf678aacdac2fd71bb192a10057de668b629c1cba1b371394c9e212c52e8`
- com/nsus/network/protocol/types/tagBattleRoyalePlayer.as: `7046b7bb8f5cb18f01bdeda312340ffa2fda8bb248c19a4e4a8efa96891e169a`
- com/nsus/network/protocol/types/tagBattleRoyaleStage.as: `753a94e9ce10f7dcb24293ab19daf46f9c969a89cdf6c468e839384b1a194b98`

## Session synchronization and bounty evidence

Four more recovered classes bring the inventory to21. RushSession.sync copies server session identity, event id, TableId, start/end timestamps, balance, commission, rebuy sum, hand count, blind group, end-session reservation, status and remaining time bank. It synchronizes linked session/HUD data and sets the player's balance from the returned session balance. setTourney binds the table to the event and its BattleRoyaleInformation.player, using the event type's table type, currency and maximum players. An empty waiting table is distinct from the currently assigned hand table. The actual relocation trigger is not established by this sync method alone; no local migration is claimed implemented.

### Bounty callbacks

OnMysteryBountyMoneyIn callback4110 marks the event as in mystery-bounty mode and refreshes the table menu. Outside catch-up it synchronizes supplied prize pools, derives display-list data and triggers the box-entry presentation when the total pool is positive; it also changes movie/break-popup state. The recovered branch computes a guarantee-adjusted local value, but the shown appearMysteryBountyBox call passes totalMysteryBountyPrizePool. Do not treat that unused temporary as a proven financial top-up or change the local ledger to match a presumed guarantee.

OnMysteryBountyEarned callback4111 skips its effect construction during catch-up. For Battle Royale, every supplied key yields its own award record with PotIndex, StringHandId, hunted UserId and Hunters. Each hunter supplies Amount, ActualAmount and AwardType. The code increments the player's actual-bounty accumulator and key count, attaches hunters and grade/quality/effect metadata, deduplicates the presentation hunter list and sorts awards by hand and pot. A shared/multi-hunter award is explicitly represented; a single visible winner cannot establish sole entitlement. Box grade/effect selection is display metadata, not a recovered random draw algorithm.

If the local user is a hunter and SkipAnimation is false, the client hides a detail view before invoking the bounty effect. SkipAnimation is passed into presentation; it is not permission to skip or repeat financial settlement. No cash-wallet credit is performed by this recovered presentation callback. Account balance/award delivery must be traced separately. A reconnect must rebuild authoritative earned totals while suppressing old effects, rather than rerunning the incrementing callback over historical events.

OnBounty callback4063 is a separate general bounty pipeline. Its helpers group by pot, sort seats and choose a representative using supplied amount/position data; OceanKO-specific types are present. These rules must not be copied into Mystery Battle Royale merely because both display a bounty. The Mystery path above has its own Battle Royale branch.

### Local implementation invariants now established

- Event and Rush-session ids are separate authorities. A hand-table assignment carries no new registration debit, and a stale session cannot move or alter the current entrant.
- Tournament stack chips, event entry cost, prize pool, bounty bank, awarded bounty and account wallet credits are separate quantities. A bounty animation cannot create any of them.
- Every financial award needs an immutable event/hand/pot/key identity, an explicit hunter allocation and exactly-once persisted settlement. Retry/reconnect may redisplay totals but may not credit twice.
- Catch-up and SkipAnimation suppress presentation without changing financial entitlement. New live effects and durable state reconstruction require separate paths.
- Final-table knockout sharing, RNG/distribution, pool exhaustion, guarantee funding and account-credit callbacks remain unverified native-server policy. Local owner practice rules must be explicit before they are implemented.

The next code boundary is an event-owned tournament pool and atomic ledger, reusing the hand engine without reusing cash registration. First acceptance requires real hands, conserved tournament stacks, distinct session ownership, stage-boundary restart and no cash debit on rematch. The current source work does not pass that gate.

### Additional bounty/session source hashes

- com/nsus/iron/model/rush/RushSession.as: `8be7aa2a9a9786cbd3844cc06046ee8c98e456dd16249641dc954f7463006344`
- com/nsus/iron/table/services/callback/OnMysteryBountyMoneyIn.as: `0222cedbce539f6497663337c03702c44392cfbc999dfd5b7090e88b50ee2a64`
- com/nsus/iron/table/services/callback/OnMysteryBountyEarned.as: `c3b0d60a386e98e655c519e208017f3078acbe80d64b3354ca327f0545d71b96`
- com/nsus/iron/table/services/callback/OnBounty.as: `c11834e3d3adfcb3d1e1dddb8e1e2bb62630f0b185ef61636891301a5b4d37c3`

## Local Rush-stage foundation

battle-rush.mjs now wraps the existing six-seat hand/pool engine in an event-owned stage boundary. The caller must provide eventId, even blind, finalSeats(2–6), startedAt and rushEndsAt explicitly. There are no presumed native operator defaults and no wallet calls. This is a backend foundation, not an exposed or playable Battle Royale mode.

Each entrant has a distinct random persisted session. Commands validate that session and the current table id, rejecting stale or missing assignment ids before touching a hand. Views clone a limited projection and reuse visibleCards; opponents' private cards/deck cannot be read or mutated through that projection. The checkpoint binds entries/configuration/session mapping and pool chip totals. It is a private server checkpoint and must not be sent to browsers.

Deadline expiry (or the configured survivor threshold) closes new deals/rematches. Existing hands can finish while draining; only after all active tables settle does the coordinator expose qualification balances. It does not pick qualified players, invent shootout winners or pay money. Closed status persists, so a restored event cannot reopen merely because a caller supplies an earlier timestamp. The outer server must supply its own time and atomically persist commands; HTTP/account-cookie registration, transactional storage and wallet entry funding are not integrated yet.

battle-rush-test.mjs drives a real fast-fold rematch before the old hand finishes, restores both active tables in a fresh process, drains them through real check/call actions and verifies1200chips and the qualification boundary. It also covers incorrect sessions, old/missing table ids, mutable-view isolation, changed event config, duplicate sessions, missing pool checkpoints and reopening prevention. rush-pool-test.mjs remains green. Existing engine limitations (six-seat pool/initial minimum stack) still apply. Browser journey, qualification/shootout/final play and financial settlement remain unimplemented.

## Private atomic stage storage

battle-rush-store.mjs persists the stage checkpoint and monotonically increasing revision in one private0600 file. Mutations require the current revision; a handle whose on-disk state changed is rejected before touching the model. Temporary files use exclusive creation, contents are flushed, and same-directory rename commits the new checkpoint. A failed command/write reconstructs the previous in-memory model. Read-only methods do not create new revisions, and an unchanged tick does not rewrite disk.

The store has one owning server process. The disk comparison detects stale sequential handles, not a simultaneous cross-process write race; it is not a multiwriter lock. No power-loss/directory-fsync guarantee is claimed. The outer server must keep session maps/checkpoints private and supply authoritative clock/account identity. Registration funding and user-facing HTTP remain separate outstanding integration work.

battle-rush-store-test.mjs injects initial and later write failures with an existing temporary directory, checks unchanged bytes/model/revision, rejects stale command revisions and handles, and restores current sessions, table assignment, draining phase and1200chips in a fresh Node process. Store state cannot reopen the expired stage. The tests use disposable directories and do not touch the owner account or cash wallet. Source and in-memory stage tests remain green; this is not yet an end-to-end Battle Royale app.

## Shared-wallet event registration integration

The owning openRooms backend now stores local-battle-events in the same atomic checkpoint as the existing cash wallet, Rush and Spin state. No second event-file write participates in registration funding. The standalone stage store remains a tested private foundation; the app registration path uses the shared room transaction so entry/refund cannot commit separately from registration.

createBattleEvent validates explicit owner-practice id/name/capacity/starting stack/blind/final seats/Rush duration/entry cost. Internal registerBattleEvent canonicalizes the existing local wallet identity, debits entry cost with a tournament-entry receipt, registers once, and starts the Rush model only when the configured capacity is reached. Retry for an already registered account is idempotent, including after start. Prestart cancellation refunds once with tournament-refund; cancellation or an additional entrant after start is rejected. These are explicit local practice scheduling/funding rules, not recovered native matchmaking defaults.

The started model checkpoint, random sessions, entries and debit are committed together. Startup validates event identity/config/session/pool checkpoint and requires local wallet mode. battleEvent returns only public settings/count/phase and, for the requested registered account, its own session/stage projection; full registration/session/checkpoint records are omitted. HTTP authentication must bind that requested account to its cookie before these internal methods are exposed. Cancellation must gain a request/revision gate before exposing delayed client mutations. Any registered event currently counts as active play for recovery protection; final completion release remains to be implemented.

battle-registration-test.mjs proves initial/later debit/refund failure rollback, final-entry start failure rollback, case-insensitive duplicate registration, no duplicate debit/refund, insufficient funds, invalid/duplicate creation, disabled wallet mode, own-session privacy and restart. Rush wallet, tournament wallet, Spin atomic entry, owner restore, stage core/store and syntax regressions pass. The backend is not yet reachable through the player UI or HTTP API. There is no qualification/shootout/final/bounty/prize settlement or proof of native fee/escrow policy.

## Authenticated registration HTTP boundary

Local-reference mode now exposes GET /api/battle (catalog), GET /api/battle/:id/state, and POST register/cancel under that event path. The account is taken exclusively from the existing local profile cookie; a body account/session/checkpoint field is rejected. Guest state/mutations require local login. Mutation requests require exact local Origin, JSON content type, a bounded2048-byte body and the operation's allowed fields. Cancellation requires the current event revision; a delayed cancellation cannot refund or remove a newer registration. Registration retry remains idempotent for an already registered cookie account.

/api/owner-battle GET/POST reuses the existing constant-time owner-key/local-host boundary. Creation requires explicit settings, exact Origin and bounded JSON, and attempts an owner audit entry. Owner catalog output contains no player session secrets. These endpoints are not installed live yet, and no player/owner controls for them have been added to the UI.

battle-registration-http-test.mjs boots a disposable real server, exercises unauthorized owner/guest, wrong Origin/content type and identity-spoof fields, verifies stale-cancel/debit/refund behavior, registers six distinct cookie accounts into Rush, checks six unique own sessions and100tournament chips each, then restarts and verifies the same session/debit and poststart cancellation rejection. Existing Rush/tournament wallet HTTP and backend registration tests pass. It does not yet deal/play a Battle Royale hand over HTTP; that command integration is next.

## HTTP Rush hand commands

The event API now accepts POST deal/act/quick-fold. Each command binds the local account cookie, that entrant's persisted event session, current event revision and (for actions) current table id. Allowed fields are explicit; account/clock/checkpoint injection is rejected. All game operations run under the shared room checkpoint transaction, and the server supplies Date.now. The owning server timer advances deadline closure without a public clock endpoint. A failed save rolls the hand/event state back together.

Stage views expose current seat/names and a cloned private-card-filtered hand. A separate latest settled result preserves board, pot shares/returns and visible cards after the pool releases the seat, making posthand payout verification/reconnect possible without returning a private deck or all session credentials. Neither rematch nor hand settlement debits or cashes out the account wallet.

battle-hand-http-test.mjs creates an owner event and six independent cookie accounts, starts the stage, injects a failed first-deal write, exercises a real fast-fold plus duplicate rejection, plays the remaining hand through actual API actions, independently ranks each eligible pot and verifies exact split/odd-chip shares. It checks600tournament chips, six unchanged9975entry-wallet balances, private cards, session/revision/clock guards and byte-identical midhand/final restart. Registration HTTP, stage core/store and existing Rush/tournament wallet HTTP regressions pass. These tests do not establish a separate-browser UI journey, native animation/layout, qualification/shootout or prize/bounty completion.

## First shared-table browser journey

The Home tournament-format tab now opens the local Battle Royale event catalog, with event selection, entry cost/stack/count/phase details and an event-page link. The event page uses the existing network.html six-seat Hold’em/Rush renderer through battle-table.mjs. Registration/cancellation, Find next table, legal check/call/bet/raise and quick-fold use the authenticated event API. Revision/session/table authority remains server-bound. Current/final cards, pot shares, source artwork and existing payout animation are reused; no second poker renderer was introduced.

The adapter preserves Rush-specific flow and omits unsupported cash rebuy/cash-out, bot fill, sit-out and chat actions. Closed events do not offer registration. Unknown qualification behavior is explicitly labeled as not implemented rather than displaying a false winner. The shared urgent turn alert now requires a finite action deadline; the new stage currently has no per-action clock and no artificial deadline is created for appearance.

network-browser-test.mjs --battle-table creates six separate browser storage contexts (API account creation fixture), then uses real pointer controls through Home/Tournaments→Mystery Battle Royale→event selection→registration→Find next table→check/call streets. It independently verifies the settled pot shares,600displayed tournament chips, six seats, clean browser errors and reload/server restart. The initial RED rendering failure identified an undefined-deadline urgent-animation call and was repaired at the shared guard. The ordinary five-computer two-hand720chip browser regression also passes.

This catalog uses existing local list components, not a claimed native Battle Royale catalog match. Native BattleRoyaleTableView3D backgrounds, rules popup art, seated betting comparison, owner event-creation UI, full event qualification/shootout/final/bounty/result journey and per-action clocks remain outstanding. None of the new Battle Royale backend/UI changes is installed live yet.

## Owner event creation UI

The existing owner console now has a dedicated Battle Royale practice form for id/name, registration capacity, starting tournament chips, blind, final-table places, Rush duration and play-chip entry cost. It uses the same owner key and /api/owner-battle API. Defaults are editable local practice proposals, not observed native operator configuration. The form describes the still-incomplete qualification/final/bounty stages; creating an event itself never registers or charges a player.

During a save/load the form controls are disabled and repeated submission is ignored. Field drafts remain after validation or network failure. A successful creation is reported separately from a failed list refresh. Owner-key changes invalidate pending display responses and clear the previous event list. The list shows event id/name/count/phase/entry cost, and the player-lobby link opens the real local catalog. Admin audit rendering now labels create-battle-event instead of incorrectly displaying the generic cash-table Closed state.

The extended --battle-table browser journey creates the event through the actual owner form, first rejects a server-invalid cutoff, corrects it and verifies one saved event, then drives the six-player lobby/registration/hand/payout/restart flow. It also reloads counts, rejects a wrong owner key after clearing stale data, and checks the Battle Royale audit entry. These operations use disposable server data; the live owner catalog remains untouched. Native private admin UI was never observed and is not claimed as a reconstruction target; this is independently specified owner control.

## Transactional qualification and all-in shootout

battle-qualification.mjs now consumes the frozen post-Rush balances. Explicit local practice policy: equal stacks use registration order; if too many positive-stack players remain, the first finalSeats−1 advance directly and the rest play six-seat all-in batches. Real stacks carry forward, a singleton gets a bye, tied/side-pot survivors continue in further bounded rounds until one shootout qualifier remains. If survivors already fit, all advance. Native cutoff tie-breaking, table batching and stack-transfer policy remain unverified; this implementation is not claimed as recovered native server logic.

Each step resolves at most one actual hand using the existing hand engine and legal maximum raises/calls, never a synthetic winner draw. The snapshot retains round/serial, fixed direct qualifiers, waiting/advanced contenders and the last completed hand, dropping its unused deck. Restoration checks source/config/direct qualifiers, participant uniqueness, total chips, card identity and recomputed last-hand pot settlement. Views clone public completed cards and payout data without the deck. A completed qualification is idempotent.

The shared event transaction starts qualification only after the Rush pool is fully drained. Its optional saved qualification field is backward compatible with existing Rush-only events. Server ticks advance the shootout and revision atomically, while old Rush play commands are rejected. The public phase becomes shootout then final-ready, with public qualification data. The current UI reports those phases but does not yet animate the shootout or open a playable final table. The old Rush checkpoint is frozen transfer provenance, not another spendable chip pool.

battle-qualification-test.mjs checks native-independent pot shares/odd chips,1200chips, ties/byes/rounds, every-step reconstruction, fresh-process continuation, tampered checkpoint rejection and no repeated completion. battle-qualification-room-test.mjs uses12registered accounts and a short test clock to verify first-transition write rollback, mid/final store restart,1200chips, unchanged9975entry wallets and unchanged final checkpoint on repeated ticks. Registration/hand HTTP and core regressions pass. No live owner records were used. Final-table creation, payouts/bounty bank, UI shootout choreography and actual native qualification comparison remain open.

battle-qualification-http-test.mjs additionally boots a disposable real server, creates twelve separately authenticated accounts and registers all through HTTP. Its actual server timer advances the one-millisecond test Rush into all-in qualification. Every account receives the same completed qualification, three qualifiers retain1200chips, each entry wallet remains9975, and Rush deal commands return409. Anonymous event state returns401. A server restart preserves the complete authenticated projection; subsequent ticks leave the persisted file byte-identical. This verifies the API/timer/restart boundary, not browser presentation or final-table play.

## Final-table transfer foundation

The internal startBattleFinal operation transfers a completed qualifier list into the existing tournament room engine. The room identity is deterministic per event; room creation and event linkage share the same atomic checkpoint. Qualified account order and unequal stacks are preserved. Repeated calls and restarts return the same room, while failed writes roll back both sides. Restore validation rejects orphan/mismatched event links, altered account rosters, settings, first-hand stacks or total chips. The frozen Rush and qualification records remain provenance, with Rush actions closed.

This final table uses existing Hold’em dealing, betting, clocks, results and elimination code. Qualified accounts recover their fixed seats using the existing join/session mechanism; outsiders, bot fill, withdrawal and replacement are rejected. Entries are not charged again. Its prize pool is deliberately zero at this foundation boundary: event entry credits remain held, and no wallet prize/refund or bounty is claimed. Public routing is described below; these changes are not installed live yet.

battle-final-room-test.mjs verifies early-start rejection, failed-save rollback, exactly-once transfer/restart, real qualification stacks100/100/1000, fixed-account recovery, outsider/bot/leave rejection, a full check/call hand preserving1200chips, unchanged entry wallets and completed-hand restart. Existing tournament, funded-wallet and three/six-seat regressions pass. Automatic final entry, public routing, single-survivor completion, configurable prize/bounty settlement and browser/native comparisons remain open.

## Qualified player entry into the final table

POST final-room binds the authenticated local account, current event revision and persisted Rush session. Only accounts in the completed qualification roster can enter. It creates or reuses the deterministic final room and issues a private seat token using the existing account recovery path. The event reports final-table after creation. The player page exposes Enter final table only for a qualifier, refreshes event state before entry, stores the returned token in sessionStorage and navigates to the common tournament renderer. No token enters a URL. The return link leads to the original event, allowing a qualifier to recover its seat. The server timer advances final-room clocks and between-hand scheduling independently of browser polling.

The event and final-table format text explicitly state that entry credits remain held and wallet prizes/bounties are pending. This is playable card-game routing, not completed event accounting or native final-stage visual parity. A fixed Battle account's token recovery changes metadata only: it preserves actionVersion so another qualifier's unchanged legal action remains valid. Actual game actions still invalidate stale commands. The room regression covers both cases.

The qualification HTTP test now enters all three qualifiers through the authenticated endpoint, rejects wrong-session/stale-revision/nonqualified requests, verifies shared room identity and exact carried stacks, plays a real final hand preserving1200chips and restores it after server restart. All twelve entry wallets remain unchanged. The browser gate uses six independent contexts for qualification, real pointer entry for the three qualifiers, the existing three-seat controls, independent600chip payout verification and reload/server recovery. Native final-stage background, rules graphics, timing, prizes/bounties and single-survivor completion remain open.

## Explicit entry-funded final prizes (unreleased)

Additional native protocol evidence was recovered from the same shipped SWF using bounded FFDec class exports. tagBattleRoyaleType carries BuyIn, BuyInGroup, Preset and BountySetting. tagBattleRoyalePreset declares PayOutType, PrizeStructureId, InTheMoneyPlayers, StartingChips, blind structure/start level and stage list. tagBattleRoyaleBountySetting contains HighestBounty plus an item collection; tagBattleRoyaleBountyItem contains BountyAmount and Frequency. Their populate methods read server-provided fields. These declarations do not establish actual operator values, fee allocation, draw algorithm, replacement/depletion rules or knockout attribution. BattleRoyaleRewardInformation supplies presentation setters rather than the missing accounting algorithm. Sources are under Sandbox/rea-tools/battle-royale-source/scripts at their fully qualified class paths.

The local owner form now accepts optional prizeShares: positive descending whole percentages totaling100, at most finalSeats places. It is blank by default. Configured events allocate all registered entry credits to final-place prizes, with no fee or bounty deduction. Existing events without prizeShares preserve held-credit behavior; no old event is silently assigned a payout policy. If fewer players reach a multi-player final than configured prize places, unused percentages merge into the last qualified place. This is an explicit local practice policy, not recovered native operator behavior.

Configured final rooms carry capacity×entryCost as their tournament prize pool and use the existing prizeAmounts largest-remainder calculation and elimination places. Event payout receipts and wallet tournament-prize movements commit with the decisive hand in the same checkpoint transaction. A failed final-action save restores the hand, wallets and receipt together. A completed event reports finished, exposes account/place/amount receipts and releases its active-play hold. Repeated ticks, restart and qualified seat recovery do not pay again. Restore checks pool, configured marker, shares, unique finishing places, recomputed prize amounts and exact event/room payout correspondence; corrupted receipts are rejected.

Owner event lists and player details display configured percentages or held-credit status. The event page displays finished awards and lets qualifiers review the final table. The final-table format text describes the local entry-funded policy and explicitly excludes mystery bounties. Unconfigured events retain pending-award text. No native prize-panel pixel parity is claimed.

battle-prize-test.mjs plays a real12-account all-in qualification/final tournament, verifies1200tournament chips and300entry credits distributed210/90/0, all twelve wallets, invalid configurations, decisive-hand write failure/rollback, cold restart, repeated ticks, seat recovery and tampered receipt rejection. network-browser-test.mjs --battle-final --battle-prizes exercises the owner form with invalid70/20 then corrected70/30, qualifier-only real-pointer entry in separate contexts, all-in play through a winner, independent pot verification,600chips/150entry credits paid105/45/0, all six wallets and restart without duplicate awards. The existing unconfigured HTTP/final, six-browser Rush and funded tournament regressions pass. Mystery bounty funding/draw/knockout ledger, single-survivor completion and native physical/graphic comparison remain open.

## Single-survivor completion (unreleased)

When drained Rush leaves exactly one positive-stack qualifier, no final card table is needed. The server tick now settles a configured event directly: the sole survivor receives the complete entry-funded prize pool, with one account/place1/amount receipt committed atomically alongside qualification and wallet state. All configured place percentages are absorbed by the only remaining place. This follows the explicitly declared local unused-place allocation policy; native single-survivor/operator payout rules remain unverified.

No final room is created, and finalEligible is false because there is no seat to take. The event reports finished and its normal award text; unconfigured events keep entry credits held, report one-survivor status and offer no impossible final-table button. Such held events retain their active-play hold. Restart validates that a roomless receipt belongs to the unique qualified account, has place1 and equals the full entry pool. Repeated ticks do not pay again; a failed save restores qualification, receipt and wallet together.

battle-single-survivor-test.mjs uses controlled initial hole/deck cards in disposable data, then real six-player Rush all-in actions produce one600chip winner. Both configured150credit payment and unconfigured held-credit paths are checked, including failed transition write, restart, byte-identical subsequent ticks, absence of a fictitious room and wrong-recipient rejection. The --battle-single browser gate uses six independent sessions, real pointer all-in controls, independent pot verification, correct six wallets, no final-table button and server/reload recovery; --single-held covers the unconfigured presentation. Controlled cards establish the edge-case fixture, not native runtime/RNG parity. Mystery bounty accounting and native physical/graphic comparison remain open.

## Finite mystery-bounty inventory ledger (not integrated yet)

battle-bounty.mjs supplies the accounting kernel for a declared operator bounty budget and an explicit amount/frequency inventory. The declared capital must equal the complete inventory value. This assertion alone does not fund an operator bank or debit an account; that application transaction remains to be connected. The existing Spin bank was inspected but its stake-specific exposure/insurance rules do not implement an event inventory, so it was not repurposed.

The local policy is explicit: every frequency unit is one ticket, a selected item is removed without replacement, and a victim can receive only one knockout award. A request binds hand number, pot index, victim and an ordered list of distinct hunters; the victim cannot be a hunter. The caller supplies a bounded integer ticket. This kernel does not choose randomness, establish knockout entitlement or accept a player-provided award as authoritative. Those decisions must remain in the owning server's final-hand settlement transaction.

A selected amount splits equally across the supplied hunters, with odd credits following their supplied order. Future engine integration must derive that order from seats. The recovered callback4111 supports multiple hunters and server-supplied Amount/ActualAmount, but it does not prove equal shares, without-replacement drawing or the local ticket interpretation of Frequency. These are independently declared local policies and are not presented as recovered native server behavior.

Receipts retain hand/pot/victim/ticket/amount and exact hunter shares. Repeating an identical request/ticket returns the same cloned receipt; changing its identity or ticket is rejected. Exhausted inventory cannot pay another award. Snapshot restoration binds the original inventory/capital and replays every draw, recomputing amounts/shares and rejecting duplicate victims, altered tickets/recipients/amounts or malformed records. Summary and receipt copies cannot mutate the ledger. Capital equals remaining inventory value plus paid receipt value; no extra credits are introduced by a draw.

battle-bounty-test.mjs verifies17declared credits,11→4/4/3 and3→2/1 shared awards, remaining inventory/exhaustion, invalid tickets/configuration, duplicate-victim/idempotence guards, immutable projections and fresh-process restoration. A RED duplicate-receipt restore case exposed replay deduplication accepting a repeated record; canonical receipt-count validation now rejects it. At this foundation checkpoint the kernel had no server route, wallet movement, admin UI or knockout attribution. The following integration adds those boundaries; it is not installed live yet.

## Operator capitalization and real final-hand bounty settlement (unreleased)

The owner console now has a separate local bounty form: event ID, amount × count rows, calculated capital and a funding reason. It explicitly creates/reserves operator play-credit capital rather than charging player wallets or deducting final-place prizes. A budget must exactly cover its finite inventory and contain at least finalSeats−1 items. This is local play-money capitalization, not a real-money deposit. Funding is immutable and allowed only before registrations; identical retries return the existing ledger without capitalizing it again. Remaining unused capital stays in that event's inventory. Editing, topping up or reclaiming that capital is not implemented.

POST /api/owner-battle-bounty uses the existing local-host/constant-time owner-key guard, exact POST origin, JSON and bounded8KiB body, with exact id/capital/items/reason fields. The capitalization and reason persist with the event; one fund-battle-bounty audit record is written for new funding. The response separately reports an audit-log write failure. Owner lists display remaining/paid bounty credits, and audit rendering labels the budget rather than misreporting a closed cash table. No player endpoint accepts funding or a caller-selected draw.

Only completed final-table hands create bounty requests. battleBountyKnockouts recomputes pot settlement from private cards, board, contributions and folds, verifies final stacks, then identifies positive-start/zero-finish seats. Explicit local attribution: winners of the eliminated player's highest contested eligible pot are hunters. Victims and hunters are ordered clockwise after the dealer. Folded players and players retaining uncalled returned chips are not treated as eliminated. This policy is independently specified; callback4111's server-supplied PotIndex/Hunters does not prove the native attribution algorithm.

The owning server chooses a cryptographic integer ticket across remaining frequency units. Inventory replay decides the amount; no replacement occurs. Wallet battle-bounty credits, the event's updated inventory/receipts, the decisive hand and final-place prizes share the existing room checkpoint transaction. Any failed save rolls them back together. Restoration binds award victims to qualified final accounts and their recorded elimination hand, and checks current-hand pot/hunter correspondence. Repeated ticks/recovery do not pay another bounty to an already awarded victim. Rush and qualification/shootout eliminations do not earn these final-table rewards.

Public event/table views show budget summaries and completed receipts without private checkpoints or future inventory tickets. The table's existing results list includes separately labeled local bounty receipts; wallet history labels Battle Royale bounty separately from Tournament prize. The final-place prize pool still contains all entry credits, with no fee/bounty deduction. Catalog/table descriptions distinguish funded bounties from an unconfigured inventory. Native mystery-box artwork, reveal animation/audio and timing are not reproduced by these transparent local ledger views.

battle-bounty-knockout-test.mjs plays unequal20/40/80/120/120/150 all-ins, verifies530chips, shared main-pot hunters, side-pot attribution, folded-player exclusion and30uncalled return, plus settlement-tamper rejection. battle-bounty-room-test.mjs verifies14operator credits, idempotence/registration lock, real final eliminations, wallet/inventory/hand save rollback,600game chips/150entry-prize credits/14bounty credits, no shootout bounty and cold-restart/idempotence; a current-hand recipient substitution is rejected. battle-bounty-http-test.mjs checks owner/origin/method/JSON/body/field authority, one funding audit, six cookie accounts, actual final play through a winner, separately labeled wallet credits and unchanged persisted state after restart. The --battle-final --battle-prizes --battle-bounties browser gate uses real owner form clicks, rejects too few items, saves the corrected14credit inventory, plays the final, verifies per-hand receipts and six balances, reloads the paid budget/audit and restarts without duplicate awards. Existing no-bounty final/HTTP, prize, single-survivor and tournament-wallet regressions pass. Full native draw/attribution policy, mystery-box graphics/sound/timing and capital-management extensions remain open.


## Local event rules window (current implementation)

Four native classes establish the RulesPopup structure; hashes/paths are in `battle-rules-source.json`. The popup is500×482; Rush begins40/51, and Final Table40/251 without a promotion (40/307 with one). Each description spans412px, headings are20px bold/useRoboto, and body text14px. StageAssets supplies decorative textures battleroyale37/38 and arrow44; those images have not yet been recovered, so their parity is not claimed. The More link dispatches an external info signal and is outside the requested in-app scope.

Native labels use server preset stage3.MaximumPlayers, stage1.DurationMinutes and InTheMoneyPlayers. The local window instead binds the actual owner settings and finite bounty summary. It does not repeat the native “Only Half Will Survive” claim because local finalSeats/capacity can differ. Local qualification directly advances the highest finalSeats−1 stacks and resolves remaining players through real all-in shootouts; equal stacks use registration order. Active Rush hands finish before stage transition. Prize percentages, unconfigured held entries, sole-survivor completion and absent/funded bounty status are explicit.

The Rules entry is disabled until an event is selected; it tracks the selected event during catalog polls. Escape and Close return focus, catalog switching removes the prior window, and reload requires reselection. A transient rules view neither registers a player nor spends/refunds wallet credits. Unit tests cover configuration/invalid data/immutability; the browser test creates two isolated owner events, uses actual pointer opening/selection/closing, checks500×482 geometry, polling stability, Escape/focus return and reload, and verifies unchanged event state. This is a functional source-guided local rules view, not a full native pixel match.


### Recovered native rules decorations

The installed `assets/init_lobby/desktop_assets.json` contains battleroyale0037/0038 (160×22) and0044 (4×9). The bogus shared320×134 trim metadata is ignored by the source-established StageAssets frame-only loader. The existing Swift extractor now handles both box panels and these rule decorations, preserves prior outputs and verifies decoded RGBA equality against each atlas crop. Source/file hashes are in `battle-rules-source.json`; PNGs remain private local artwork. Both section headers use native left/right textures at0/320, display width100 and height22; heading x103/width200 and Rush y−3 match source. Four local rule title rows use the original4×9 arrow at0/4. The browser checks decoded dimensions, actual computed CSS geometry, stable selected-event updates, no footer overlap and all prior control/data-safety assertions. Font rasterization, close-button chrome and whole-native popup pixels remain unverified; local policy text deliberately describes local behavior.


## Native lobby hierarchy and connected local pages

`battle-lobby-source.json` records eight successfully recovered native classes and exact installed backgrounds/atlas crops. BattleRoyaleNewLobby has a148px sidebar,72px rows and content x148. Game Lobby and Game List are distinct pages. The Leaderboard tab is added only when getPromotion() returns a promotion and is guest-login gated; the local app has no promotion, so it does not show a fabricated ranking.

GameLobby uses an unchanged614×492 top image and615×779 bottom image, anchored to the viewport bottom. Buy-in cards begin in a596×140 slider at x7,viewportheight−245; card x increments120 and y17. Native selected/unselected card sprites are116×124. Join Now is160×40 at230,viewportheight−72. My Tables is124×44 at22,viewportheight−65 and is present only for personal entries. The details link at395,viewportheight−50 emits OPEN_BATTLE_ROYALE_RULES_POPUP, so it is an in-app rules control, not the external More link inside the rules window.

The connected local view binds cards to explicit owner events and opens the existing local registration journey. Registered events populate My Tables and reopen the existing account entry without another charge. The two visible tabs switch actual mounted views, preserving event selection; the common selected-event readout/rules remains functional. Both card and list updates reuse updateElement to preserve mounted nodes and focus across polling. A real browser regression found redundant delayed modal focus restoration; native HTML dialog restoration now handles the caller, avoiding later focus theft.

The rules browser verifies two real owner configurations, default lobby/two tabs/no promotion leaderboard, source layout dimensions, pointer card/list selection, Join Now guest route, details/rules, stable card/list identity and keyboard focus after poll, rules artwork/close/Escape/reload, and unchanged event data. The six-browser journey now selects a native-art card, uses Join Now, registers, checks My Tables re-entry without duplicate registration, then plays a complete hand and verifies600 chips plus reload/server restart.

This remains partial native parity: owner-event cards substitute explicit local hosting for unverified native buy-in matchmaking; cards truthfully show remaining bounty budget, not an invented highest award. The native Highest Bounty winner panel, stage-info overlays, multi-table registration dialog, complete Game List columns/filter/sort, promotion leaderboard, global red-button/MyTables chrome and physical font/pixel/hover/audio timing require further work. No native account was mutated or brought forward.


## Local bounty highlights and public hand history

`battle-highlights-source.json` records the native view/class hash, texture crops and measured source geometry. Header308×30 sits above a list at y34; top cell308×128 and normal cells308×60 have4px gaps. The top amount uses the recovered NEW_SPINANDGOLD_FONT atlas at38px; regular amount is28px. Avatar frames/masks are native textures63/64, scaled47px/39px. Empty background21 scales154×116→308×232, sits at y126 and contains table387 at108/28,size92×92. A native row click dispatches OPEN_HAND_HISTORY_MYSTERY_JACKPOT_BOUNTY with a jackpot hand id. This is an in-app history operation.

The local feed deliberately uses a declared local policy: maximum recorded operator-funded draw, then up to20 newest other awards by retained hand timestamp. It is not proof of native Epic eligibility/global window policy. Metadata comes from authoritative ledger receipts and retained public hand records; no dates or winner identities are invented. Missing dates remain unavailable. Amounts/hunters/entry/avatars derive from the actual event/hand. The feed reuses stable DOM nodes through polling.

GET `/api/battle/:id/bounty-history?hand=N` requires a local login and the existing local host/origin boundary. Only a positive canonical safe integer query is accepted; duplicates/extra fields are rejected. The hand must belong to a real bounty award in that event's final room and remain in the existing30-hand HUD archive; otherwise404. The public projection explicitly allowlists board,names,already disclosed cards,history,payouts/returns/committed/stacks,avatars/timing and public award shares. It never copies privateCards,historyTrace,subjects,deck,seat digests/tokens or draw tickets. It does not mutate event/wallet/room state. A participant or unrelated signed-in viewer receives the same public cards, preserving folded/mucked privacy.

Clicking a local row opens a functional public-hand window with native card fronts, actual board/payout rows, separate bounty receipts and action text. Loading, guest login, missing/expired history and network failure are explicit; no fabricated hand replaces an unavailable record. The window currently does not reproduce the complete native jackpot-history chrome/replay layout. Native date formatting, NEW badge/global winner policy and physical font/pixel parity remain open.

RED privacy export and missing-lobby-row checkpoints precede implementation. Tests cover an explicit public-field allowlist, concealed folded-card/private-trace exclusion, cloned reads/wrong-hand binding, actual room/HTTP nonparticipant access/origin/method/query/expiry/restart, and real browser payout/card equality with unchanged data. Browser checks also cover close/error handling, native38px amount decoding and stable row/focus through polling.

### Bounty animation first-frame clock repair

The repeated full journey exposed Invalid bounty presentation time or type and a held next hand. A deterministic normal-motion fixture supplies a RAF timestamp100ms earlier than scene construction; the former adapter passed negative elapsed time to the strict pose model and never completed. Clamp elapsed at0 in the scene adapter, retaining the pose model's negative-input rejection. This changes no financial state or nominal frame clock. The scene lifecycle and full hand regression must pass with this boundary case before release.


## Durable public bounty archive

New bounty settlements now persist `bounty.hands`, a bounded public-only list keyed by the actual awarded hand number, in the existing event/room/wallet atomic checkpoint. Every newly awarded hand must have its public snapshot before settlement commits. Existing retained legacy award hands are backfilled during the next bounty settlement when available; missing old data is not fabricated. No separate database, writer or scheduler is introduced. Read-only requests never migrate the store.

The optional field preserves legacy checkpoint compatibility. Its strict reader checks exact public projection/keys, unique award-bound hand numbers, qualified seat order, valid/unique board and disclosed cards (including partial reveals), avatar paths, safe timestamps/blinds/button, chip conservation and exact ledger award shares. Private fields and altered award records are rejected. When the HUD record remains available, restore also compares the archive against the actual recorded public projection. Archives survive removal/eviction of that cache and keep their original timestamp/avatar metadata. Reads return clones. An authenticated show-cards command refreshes the current archived public disclosure; ordinary reads do not modify it.

Persistence failure rolls the archive back with the hand, inventory, wallet and prize state. Existing save-failure injection and replay tests therefore cover the archive as part of the same transaction. Room tests restore real completed events after clearing only the independent HUD cache, verify the identical public hand and metadata across fresh opens/ticks, reject private/duplicate/share/retained-history tampering, and verify legacy fallback/read-only behavior plus honest404 for legacy data already absent. HTTP and six-browser tests also remove that cache while their ephemeral server is stopped, then restart and open the actual public bounty hand successfully. Live owner data is never modified by these fixtures.

The 30-hand limit remains on the ordinary recent HUD cache; newly archived bounty hands no longer depend on it. An old checkpoint lacking an archive can only recover what its remaining records establish. Native global retention, full jackpot replay chrome and physical visual/audio parity remain unverified.
