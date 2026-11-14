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
