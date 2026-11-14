# Native tournament lobby — recovered client contract

This records the installed client, not a proposed design. `tourney-lobby-source.json` binds24 selected ActionScript classes by SHA-256. FFDec exported only these classes from the installed Game/51/IronDesktop.swf; private extracted source stays outside the repository. No original account interaction or foreground app was required.

## Window and three independent tab groups

The root TourneyLobby sets default viewport height706. It places the left TourneyLobbyStaking container at3,160, the main container at417,160 and the right players container at782,160. The horizontal separator is0,159,1200,1. Child viewports are411x530,361x527 and412x527 respectively. These are distinct coordinate spaces; the main child viewport has y139 but its root placement is y160. Do not add139 to the root offsets without verifying the base resize logic.

TourneyLobbyBase places its tab layer at7,8 and page layer at7,44; background is common atlas81 with8px nine-slice borders. It preserves separate current tabs for each container. Opening a new tournament resets pages when requested and fades root alpha over0.1s after0.1s delay. This is source-defined timing, not hardware frame/audio calibration.

Main registers Info, Structure, Prize Pool and Venue. Info is the default. Venue is conditional on isGGLive; Structure is hidden for Roshambo/avatar race; payout is conditional for phase events and All-In Gacha. These gates mean the enum is not an always-visible menu. Battle Royale should not receive an invented Venue page without an actual venue.

The left container registers How to Play, Staking, Satellites and Prop Bet. For Battle Royale the How to Play page is populated and visible. Staking additionally requires both entry.canTourneyStaking and account.canStakingWithBrand; it is not proven enabled for every Battle event. Satellites disappear when no tournament/SNG satellite records exist and How to Play or Staking is visible. Prop Bet is conditioned on supported brand/config, last-longer enablement, event exclusions and a non-guest account. The presence of this container does not establish enabled staking, satellites or prop betting locally.

The right container registers Players and Tables. Chat appears only with entry.enableLobbyChat: before the tournament it precedes Players/Tables, while after start it follows them. Field is gated by isRandomBounty. Its open button delegates to the currently selected player/table page. Player-profile opens the actual selected player's HUD. These child page payloads still need recovery before adding local fake rows or routes.

## Header and navigation

Header prize pool is at420,94; registration button group at596,12; right simple information at783,10. The group creates a178x44 registration button. Native Battle prize display adds the actual highestMysteryBounty separately from prize pool; an arbitrary remaining bounty budget is not equivalent to this maximum.

OpenTourneyLobbyCommand resolves an existing entry, marks its window active, opens its lobby window and syncs the tournament subscription. Ordinary open does not register. Only OPEN_TOURNEY_LOBBY_REENTRY additionally dispatches OPEN_TOURNEY_REGISTRATION after subscription. This confirms why a double-click must not debit a local entry implicitly.

For Battle Royale the header can dispatch OPEN_BATTLE_ROYALE_TABLE for an existing user table. Unregister dispatches UNREGISTER_BATTLEROYALE_TOURNEY. The tournament mediator formats the event buy-in and shows a confirmation using title LobbyButtonOpenTourneyUnRegister, body BattleRoyaleCancelRegistration and OK/NO. Only OK dispatches UNREGISTER_BATTLE_ROYALE. This confirmation is proven for the tournament lobby; the global Game List mediator was not recovered here, so its behavior is not inferred from this handler.

## Reconstruction status and next evidence

The existing local event page is playable, but is not the three-pane native tournament lobby. Current evidence is sufficient to establish the hierarchy and callback boundaries. Before claiming full parity, recover the actual child player/table pages, How to Play Battle-specific branches, Structure and Payout models, header button gates and nine-patch/tab artwork. Populate them from actual local registration/qualification/table/prize records, with server-authoritative actions. Preserve real native gates rather than making every enum feature visible.

Native localization strings, exact physical typography, active-theme pixels, hover states, window chrome, platform frame delivery and sound timing are still unverified. Never label this source inventory as completion of the whole lobby or backend.

## Local confirmation verification

The local event page now asks before cancelling a Battle registration. It shows the actual configured entry cost passed through the existing table adapter. No or Escape closes the dialog without any command; OK invokes the existing authenticated, revision-guarded cancellation. A registration that closes while the dialog is open is not cancelled by the client. The dialog lives outside the polled action subtree, so refreshes cannot erase a pending choice. This reproduces the confirmed action boundary, not native alert artwork/localized wording.

`node network-browser-test.mjs --battle-rules` covers actual pointer No, Escape, OK/refund and re-registration, followed by server restart and the existing list withdrawal. Both refunds/entry debits are checked exactly; double-click still does not add another entry. RED withdrawal-confirmation commit records the missing dialog before implementation.

Additional payout gate: TourneyPayoutPage explicitly hides its generic header for Battle Royale, and hides next-payout information for this format even before completion. This is a concrete difference from a generic tournament payout tab; retain it when the native Battle payout content is reconstructed.

## Players and Tables — additional eight recovered classes

The receipt now contains24 classes. New source includes TourneyPlayersPage, TourneyPlayerList, TourneyPlayerCellRenderer, TourneyTablesPage, TourneyTableList, TourneyLobbyTableCellRenderer, TourneyHowToPlayPage and BattleRoyaleInformationPage. These resolve the selected-row Open callback and Battle-specific rules page rather than relying on guessed routes.

Tables uses a401x23 header at y2 and list at y26. Its columns are Table54, Players54, Largest Stack140, Smallest Stack140. Cell labels start at x0/58/116/260 with those same widths, at y1/h20; separator is x0/y22/w406/h1. Only nonempty tables are valid list items. Selecting a table dispatches TOURNEYLOBBY_PLAYERS_SELECT with the actual tournament/table IDs. Double-click calls onOpenTable; Open dispatches OPEN_TOURNEY_TABLE with the two string IDs. It does not send a join/register/seat command.

Important Battle constraint: TourneyTableList.onOpenTable returns immediately when entry.isBattleRoyaleRush. The parent TourneyLobbyPlayers also disables Open during Battle Rush, covering both the Players and Tables tabs. Outside Rush, selecting a valid table can enable Open; selected-player Open is limited to Waiting/Running tournament states. View Profile is independently enabled for a selected player. Do not implement arbitrary spectator-opening of Rush tables merely to make an extra button clickable. Source establishes client gating, not an original-server access rule.

The table page shows a follow-the-action notice before play and a tournament-complete notice after completion, rather than showing a fake active table. The subscription flag needUpdateSubscription controls its login-needed label; the source label name alone does not prove every account/login transition. Local authentication/subscription behavior still needs an explicit implementation and tests.

Players headers are rebuilt according to event bounty status and brand. For a normal non-N8IN bounty variant the fields are Rank34, National Flag34, Players92, Bounty84 and Chips/Prize(BB)138; the non-bounty variant uses Players160 and Chips/Prize148. N8IN has different widths and omits the national-flag field. The initial constructor header is not the final runtime contract. Search and bounty sorting dispatch actual player-list requests. Source uses server-provided rank/place/dropout and award data; local standings must not invent finishing places or a zero bounty for a feature whose ledger is absent. Local identities have no real-name/country data, so no native account personal information should be copied or fabricated.

Selecting a player with a table ID dispatches the selected-table event and refreshes the surrounding player-list range. Player-list double-click forwards DOUBLE_CLICK; its final caller behavior still needs inspection. The explicit Open method sends the selected tournament/table pair. This distinction prevents treating every double-click as an implicit seat purchase.

How to Play chooses BattleRoyaleInformationPage for Battle events. Its Rush section starts at y2 and Final section normally at y270; a conditional branch moves Final to y210. It reuses the native stage decorations already identified but is not the same geometry as the standalone rules popup. The branch inputs and individual description views need to be mapped before reusing local rule layout as native lobby content.

Next implementation boundary: build a read-only, explicit public projection of actual local registrations, current players/tables and settled places; preserve hidden cards/sessions/checkpoints and atomic wallet authority. Connect the native three-pane view to this projection and reuse existing entry/final-room operations. Test selection without writes, disabled Rush Open, actual final-table Open/re-entry, live updates and restart. Full native lobby is still not implemented by this evidence expansion.

## Actual local player/table projection

`GET /api/battle/:id/lobby` is a local authenticated, read-only projection. It rejects guest access, wrong origin, non-GET methods and query parameters. Signed-in nonparticipants may inspect the same public rows. There is no actor/account override and no join, table-open or wallet mutation. Unknown events retain the existing404 response.

Players contain only name, chips, table, alive and place. Registration rows use null chips/alive/place because play has not started. During Rush the projection reads the actual pool assignments and current stacks; fast-fold detached players are not counted twice in their previous tables. Rush table IDs are local serial identifiers and explicitly open:false. Qualification uses actual surviving direct qualifiers/shootout contenders; eliminated players have0chips and no invented place. Finals use the real room stacks, elimination record and existing finish places. Nonqualifiers do not receive fabricated finishing positions. Completed events show no active tables. A sole qualified winner uses the actual recorded award place.

Chip display policy is explicit: chips means current chips behind, excluding committed wagers. Table min/max use those same current stacks, so an unresolved all-in can show0 behind while still alive. This does not establish the original server's update cadence or whether its lobby stack includes committed wagers. No cards, deck, history, session tokens, private checkpoint, funding record or personal-account metadata is returned. Rows are rebuilt from primitive fields and cannot mutate stored state.

`battle-list-state-test.mjs` follows real Rush all-ins, qualification and a1200chip/300credit final through a winner, checks projection keys/chip values/real places/no invented ranks and read-only restore. `battle-registration-http-test.mjs` exercises401/403/405/400, registration/nonparticipant reads, a real6player Rush table with exact chips behind, open:false, immutable file bytes and fresh server restart. Existing server revision/wallet authority is unchanged. This backend supplies the forthcoming native panes; it does not itself implement or prove the three-pane UI.
