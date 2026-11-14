# Tournament elimination, retained result and native reward boundary

## Native evidence

FFDec exports of the installed client establish a distinct elimination lifecycle. OnTourneyDroppedOut handles NotifyTourneyDroppedOut2508, marks the entrant dropped out, assigns the reported place/award, clears their table association and updates the player list. For the current user it removes the playing entry and constructs TourneyReward. Conditional re-entry depends on server flags and entry eligibility; it is not inferred from an empty hand. The reward also carries IsDroppedOutByAdmin and ForceDropoutReason. These client fields do not establish private admin authorization or forfeiture policy.

Ordinary tournaments forward SHOW_TOURNEY_REWARD without the separate five-second delay used by Battle Royale. ShowTourneyRewardCommand guards the normal popup on award.isEmpty and Cookie type. When rewardMotioning is active, it stores the callback for completion; otherwise it evaluates the popup immediately. An administrator drop has a separate alert branch. The precise meaning of every award subclass and the complete native animation schedule remain to be followed; a popup is not assumed to open unconditionally for every zero-prize elimination.

TourneyRewardPopup uses a360×630 initial viewport and a360×611 ordinary setReward layout. It displays the reported rank and total entrants; buttons vary by brand, award and re-entry eligibility. Close dispatches popup cleanup and a separate result-close signal. RewardInformation and RewardResult are retained for the next visual reconstruction step. These are static source observations, not measurements from a native seated session.

## Corrected local player journey

The server previously treated every undealt seat as waiting for the next hand. On a later tournament hand, an eliminated entrant consequently received waitingForHand and the frontend offered Cancel waiting seat, which the server correctly refused. The shared view now excludes recorded tournament eliminations from that waiting classification. Ordinary cash waiting seats keep their existing behavior.

An eliminated player sees their known finishing place and may watch the remaining players. Betting, ready/rebuy and waiting-seat cancellation controls are absent. Restart and reconnect retain the same elimination record and zero stack. Existing public-card visibility rules continue to apply; no opponent hole cards are disclosed by this change.

Final settlement shows each seated session's own finishing place and actual prize alongside the tournament winner. A still-running event does not label a future prize as already paid: the local wallet settles at the final result. Missing historical placement data is shown as unavailable. This is the current functional status presentation; the full native reward popup, graphics, Share/Save actions and physical timing are not yet implemented or claimed equivalent.

## Verification

- `owner-monitor-test.mjs` first reproduces waitingForHand=true for an eliminated entrant after the next deal. The repaired gate checks that it is absent, no legal betting options exist, invalid departure is rejected and funded111-credit prizes remain exact after restart.
- `network-browser-test.mjs --owner-monitor --elimination-state` uses three separate player sessions plus the owner. A real first hand produces unequal20/18/22stacks; a controlled second-hand deck gives AA the main pot, KK the side pot/uncalled return and eliminates QQ. The next hand verifies place3, zero stack, no waiting/cancel/betting controls and the same state after a cold restart. The event then reaches a winner with independent60-chip payout checks,75-credit prizes and all three personal final place/prize summaries.
- Existing owner monitoring, cash waiting/funding, tournament seat counts, wallet/entry, pause, registration and ordinary Hold’em/Omaha journeys remain regression gates. All fixtures are temporary; no live owner hand, registration or wallet is used for gameplay testing.
