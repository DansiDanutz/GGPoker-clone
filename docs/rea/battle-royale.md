# Battle Royale — native evidence and reconstruction obligations

Status: source investigation only. Local Battle Royale registration, staged play and bounty settlement are not implemented. Existing Rush and tournament engines are possible building blocks, not evidence that this format works. Codex-only/background inspection; no native account action or real-money operation was performed.

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
