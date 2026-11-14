# Battle Royale Smart HUD — recovered contract

This inventory binds16 selected installed-client classes in battle-hud-source.json. It establishes client rendering and request/response boundaries. It does not recover the original server’s career calculations or implement a working local HUD.

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

## Local read-only career summary

GET /api/battle/<event>/hud?player=<canonical-name> now supplies a summary for an actual registered member of the selected local event. Authentication and exact local origin checks apply; only GET and exactly one canonical player query are accepted. Unknown event members return404. The response contains public name/avatar, scope=completed-local-events, games, totalWinnings, totalBounty, passStage1Rate, finalRankAverage, actual finalTableSizes and totalKills=null. It excludes wallet funding/balance, session tokens, cards, notes, aliases and unrelated profile metadata.

Explicit local policy: count completed registered events with settled payouts or an actual completed final. Total Winnings is the sum of recorded tournament-prize awards plus actual bounty shares in those completed events; Total Bounty uses those shares alone. Rush clearance is floor(qualified completed events×100/completed events), unavailable before a completed event exists. Final average uses actual recorded finishing places at played final tables only; nonfinalists have no invented rank. Actual table sizes accompany the average instead of inventing the native fixed9 denominator. Total Kills stays unavailable because shared-elimination attribution is not established. These are local career rules, not recovered original server formulas or a replacement for the native HUD renderer.

Tests complete real all-in prize/bounty tournaments and compare summary values with actual payouts, bounty shares and finish places. They check absent samples/nonfinalists, pre-settlement rollback showing0games, fresh restart retaining exactly1game, exact response-key privacy,401/403/405/400/404 and unchanged room bytes. Reads do not tick, settle or write. View Profile UI remains to be wired to this endpoint.

## Local View Profile adapter

Players footer now exposes View Profile at native x70,y464/130x26; it is disabled without a real selected event member and hidden on Tables. Player-row double-click opens the same Battle-specific HUD. Existing table Open remains separate. The new battle-hud module renders the native368x204 metric card/four cards/Games pill and recovered TotalAmountPanel bar/label offsets. Source14, TotalAmountPanel, defines4x40 bar, title12px at12,−2/162x22 and value20px bold at12,14/162x30, zero#666 versus enabled#d9b03e. Original close-control sprites are reused. Header/avatar placement reuses the existing local HUD header reconstruction; it is not a claim of complete Battle window parity.

The dialog reads only the authenticated local career endpoint. Scope explicitly says completed local events/play credits. Unknown samples/kills display an em dash; final average uses actual local final size when uniform, not a fabricated native9. No private notes/editors or cash VPIP graphs are substituted. Open/Close/Escape, row double-click, no-sample values, unavailable kills, stale-response suppression after close and401 clearing are covered. Viewer identity is read before and after loading; mismatch closes and clears the dialog. Polling refreshes a live dialog; selected-player change, disappearing membership, list tab change, failed lobby read or pagehide close it and invalidate pending responses. Non-auth errors clear metric values and show a status message until a subsequent refresh succeeds.

Full native own HUD average/detail/note regions, drag behavior, badge/country/logo, game-type menu, nested fonts and physical comparisons remain incomplete. The compact frame currently uses the opponent metric-card offset for both viewer types; data-mine records the real distinction but does not claim own-frame parity. Browser acceptance additionally reopens the winner after actual full-tournament settlement and server restart, verifies1game, exact prize-plus-bounty and1/3, then closes with unchanged room bytes. This is working local functionality with an explicit remaining visual/feature checklist.

## Own HUD average region and authorization

Recovered SmartHudForMineView/SmartHudMineView sets isMyHud, creates HudAverageView, shows it, hides the hand label and moves detail.smartHud to y8. It overrides player-note creation/update with no action: own HUD must not show an opponent-note editor. Existing SmartHudView moves the own game-type layer from142 to266. With the desktop title offset40, local own average starts at182 and the Battle card at306; opponent card stays182. Native average is368x116, with112px Flop/Turn/River columns at8/128/248 and row intervals20. Flop/Turn use CB/FCB/CCB/RCB; River uses WT/WSD/TAF/Hands. Native own source takes HandCount from allTimeInfo rather than opponent sample count.

Local HUD now distinguishes the canonical target from the original-case authenticated display name. This corrects mixed-case accounts previously classified as opponents. The server independently normalizes its authenticated viewer; only an actual self request receives ownStats. Other viewers continue to receive the public career shape without this field, and the query cannot choose a viewer. ownStats scope is recorded-local-final-hands: existing persistent final-room HUD counters for that account only, never cards, tokens, note subjects or another player’s raw counters. Rush/qualification and unrecorded legacy fields are not represented as all-time data. Ratios aggregate matching known numerator/denominator pairs; no denominator yields unavailable. Hands sums recorded final participation. TAF remains unavailable because its original formula/local counters are not established.

The self panel uses the recovered average-region/card offsets, existing native HUD color mapping and fill/label-placement convention. Missing metrics draw a6x1 hyphen; Hands has no percent bar. A real check-down final hand verifies1hand/WT100 and WSD from actual positive showdown award, with public caller omission. HTTP tests use distinct cookies, include original-case own identity and verify0samples. Browser verifies self0sample versus opponent layout, then opens the actual winner’s own panel after full-tournament restart and compares Hands with the actual final hand number, keeping room bytes unchanged. Full header/detail/notes/menu/physical/font calibration remains incomplete; available samples are explicitly local final hands.
