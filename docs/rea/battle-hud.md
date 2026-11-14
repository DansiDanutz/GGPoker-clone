# Battle Royale Smart HUD — recovered contract

This inventory binds13 selected installed-client classes in battle-hud-source.json. It establishes client rendering and request/response boundaries. It does not recover the original server’s career calculations or implement a working local HUD.

## Entry and identity

TourneyLobbyPlayers View Profile and player-row double-click call sendHud. The selected actual TourneyPlayer is checked for blocked, converted using SmartHudPlayerData.setTourneyPlayer and dispatched as SHOW_SMART_HUD → OPEN_SMARTHUD. Table Open remains a separate operation. The payload carries actual selected opponent ID, table ID, tournament ID, nickname, chips, avatar data and Battle Royale game-tab selection. Row ordering is not player identity. Source nickname/real-name/aliases/country values are not evidence of locally available equivalents.

The lobby request GetDynamicHudBattleRoyale uses1555. For the ordinary selected-player path it includes opponentUserId when different from self, tableId or empty GUID, sitAndGoId and currency. Its direction-lobby branch updates BattleRoyale.myState and emits UPDATE_BATTLE_ROYALE_MYSTATE rather than opening a selected-player window. The table request uses3169, asynchronous with its own error-check flag disabled, and sends opponent ID plus actual tournament ID. This is a distinct protocol, not a reason to call the real server or reuse local seat credentials across accounts.

Lobby success maps DynamicHud, badges, identity metadata, TotalWinnings, PassStage1Count/Rate, FinalRankAverage, TotalKills, TotalGameCount, TotalBounty and SmartHudAllTime into a BattleRoyaleHudInfo. Certain direction values preserve the supplied dynamicHud instead of the response value. Failure sets isFailHud; it does not prove that all statistics are zero. Nickname/balance/country/note data then synchronize from the selected payload and viewer-specific note manager. Do not place private note aliases, badges, country, subscription or streaming metadata into a public player-list projection.

## Frame and game-specific content

DesktopSmartHudView wraps SmartHudView. SmartHudView title bar is y−40; user-info16,−8; detail16,80; game-type layer16,142; combo214,151; note preview16,354. Own HUD relocates game-type layer to y266 and combo to274 and uses an average view. Self/opponent frames therefore cannot be assumed identical. Successful BattleRoyaleHudInfo selects BattleRoyaleHudView; it does not select Hold’em or generic tournament content. isFailHud leaves game-specific panels hidden.

HudBaseView draws368×204, fill#212121, round-rectangle diameter16. Battle content places Total Winnings at8,8. Four174×68 rounded cards sit at8,56;186,56;8,128;186,128. Fill#171717/diameter8. Their labels use12px/#ccc at0,8,174×24; values18px bold/#fefefe at0,30,174×32. Games pill is148,106,72×40, fill#212121/diameter40; count16px bold at0,−1/72×26 and Games12px at0,19/72×22. TotalAmountPanel’s own nested artwork still needs recovery.

| UI | Client value |
| --- | --- |
| Total Winnings | USD.format(totalWinnings); panel enabled when nonzero |
| Rush Stage Clear | String(passStage1Rate) + percent sign |
| Final Avg Finish | String(finalRankAverage) + “ / 9” |
| Total Bounty | USD.format(totalBounty) |
| Total Kills | NONE.format(totalKills) |
| Games | NONE.format(totalGameCount) |

Protocol rates and final average are doubles. BattleRoyaleHudInfo.passStage1Rate is int, so assigning the rate truncates its fraction before the view renders it. Monetary fields use the protocol long reader. Those facts do not reveal server denominator, aggregation window, fractional kill attribution, amount scaling or whether total winnings includes bounty. Do not infer these from UI labels.

## Local implementation boundary

Current player-note-ui.mjs openHud depends on an authenticated table-seat context, viewer-specific subject/note rows and recorded table/pool samples. Its VPIP/PFR/ATS/3-bet content is not the Battle Royale card above. Moving that complete dialog into this lobby would produce the wrong game-specific panel and risks incorrect note authorization.

Implement the lobby adapter with selected event membership and explicit local account identity. Keep public identity/outcome data separate from notes belonging to the logged-in viewer. Any new local career summary must state which completed local events it counts, which actual payout/bounty ledger it uses and which values are unavailable. Never present local formulas as recovered native server behavior. Changing selection, closing the window, switching identity or losing authorization must invalidate delayed requests and clear private data. Test pointer/double-click/keyboard/open-close behavior plus own/opponent cases, errors, restart and unchanged wallets/room state.

The native fixed9 final denominator is a concrete display difference: the local Battle engine currently supports2–6 final seats. The label alone does not prove the original event’s actual seating capacity or rules. Do not fabricate a9-seat result or expand the engine based only on this label. Full parity requires recovering the actual Battle final configuration and reconciling its capacity, preview/table geometry and settlement behavior. View Profile remains unimplemented; these recovered sources are evidence for its implementation, not proof it works.
