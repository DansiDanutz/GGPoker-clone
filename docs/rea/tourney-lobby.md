# Native tournament lobby — recovered client contract

This records the installed client, not a proposed design. `tourney-lobby-source.json` binds28 selected ActionScript classes by SHA-256. FFDec exported only these classes from the installed Game/51/IronDesktop.swf; private extracted source stays outside the repository. No original account interaction or foreground app was required.

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

The preceding recovery expanded the receipt to24 classes. New source includes TourneyPlayersPage, TourneyPlayerList, TourneyPlayerCellRenderer, TourneyTablesPage, TourneyTableList, TourneyLobbyTableCellRenderer, TourneyHowToPlayPage and BattleRoyaleInformationPage. These resolve the selected-row Open callback and Battle-specific rules page rather than relying on guessed routes.

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

## Local three-pane event lobby

`battle-event.html?event=<actual-id>` now renders the source root1200x706 and left/main/right placements3/160,417/160,782/160. Native base backgrounds are viewport width+4:415x530,365x527 and416x527, distinct from the411/361/412 viewport widths. The Game List double-click opens this lobby without entry. Its Back link selects Game List. How to Play uses the real local event policy; Info/Structure/Prize Pool tabs show actual settings/payouts; Players/Tables read the authenticated projection. Rows and keyboard focus survive polling. Unknown/live rank is shown as unavailable rather than invented. Players currently uses explicit Rank/Name/Chips-behind columns; native flag/bounty variants and profile/search controls remain unfinished.

Header Register/Unregister use existing server authority and actual entry cost, with No/OK withdrawal confirmation. Play Now opens the existing real Rush table, and Take My Seat uses qualified final-room entry/session issuance. Open on the right never joins/debits: it is disabled for Rush and, for an actual final table, opens a signed-in observer without a seat token. The existing room watch projection now permits actual Battle final rooms for local signed-in observers; unknown arbitrary rooms remain unavailable and guests receive401. Private cards stay hidden. Native lobby Open and native own-seat entry are distinct actions.

Tests `--battle-event` verify actual registration/refund/re-entry, source pane bounds, real tabs, live Rush table/disabled Open, stable focus and restart. `--battle-final --battle-prizes --battle-bounties --battle-event-open` opens the actual final from the table row in a separate nonparticipant session before playing, verifies guest401/no private cards/no seat token/no wallet or room writes, then completes the existing six-player qualification/final payout/restart journey. Model watch privacy is checked in battle-final-room-test.

This is an operational native-geometry reconstruction, not full1:1 art. Panel/tab/nine-patch artwork, exact fonts, dynamic player column variants, profile/search, true native date/localization, physical comparison and sound remain incomplete. Local How to Play wording/flow is not claimed pixel-identical to the native stage page. No screenshot is used as an interactive replacement.

## Native panel and vector-tab paint

`TourneyLobbyBase` uses common atlas81 as a24x24 bitmap with8px fixed nine-slice borders; the outer width is viewport+4. Reused extraction tooling crops the installed init_lobby atlas frame common0081 and reads it back to assert exact decoded RGBA, without inventing trim padding. The PNG is251bytes; hashes and script/atlas receipts are in `tourney-panel-source.json`. CSS paints it in a noninteractive pseudo-layer so8px borders do not shift native child coordinates.

`TourneyTabButton` creates vector fills, not atlas sprites. Native height32/radius4, default#3c3c3c/label#b3b3b3, selected#a48954/white. Only the first/last visible tab gets its corresponding rounded ends; a single tab gets both. Group width is viewport.width-11, equally divided, with no gap. Main350 and right401 follow the actual361/412 viewports. Selected tabs have mouse input disabled. These replace the provisional28px gold/gray buttons; no invented hover sprite is substituted.

The real browser pane fixture verifies these fills/heights/group widths/corners,8px border-image and24x24 loaded asset, then exercises all existing registration/Rush/restart behavior. Exact physical typography/browser versus AIR resampling, header art and player-column/profile/search/audio parity still remain open.

## Inherited Latin font contract and unbranded title

The inventory now includes28 selected classes. Newly recovered LabelButton, UniqueLabel, TourneyRegistrationButton and Setting complete the relevant inheritance chain; existing recovered StageAssets/InitFont/GlobalButton establish the initialized font mapping. Hashes and reused TrueType files are recorded in `tourney-font-source.json`.

LabelButton creates getNicknameLabel at18px, regular, with useRoboto=true. StageAssets preserves this flag and UniqueLabel routes ordinary Latin text through Setting.getDefaultFont(...,useRoboto). InitFont maps it to embedded Roboto. Thus tournament tabs use18px regular Roboto, not the provisional14px Arial. The label box starts x2/y1 with width button.width-4; the local tab label span now preserves those bounds. Physical glyph baseline/auto-scale resampling still needs native-runtime calibration.

The header title uses getLabel(...,24,white,bold=true), whose useRoboto defaults false: the initialized default family is Roboto Condensed, with the bold variant. For a type without configured brand assets, title container x10 plus label x4 gives x14/y10,500x33. Header registration instantiates178x44 at596,12 with19px default-family regular text. Existing native regular/bold Condensed and Roboto font files are reused, without download or duplicate art.

Brand backgrounds and banners are dynamic URLs resolved through actual tournament-type metadata; no matching local type is configured here. The native no-type branch hides both and uses the unbranded title position. No arbitrary PLAYGG/GG promotional banner is invented. The local Back navigation remains a separate affordance in the header and is not claimed as native artwork.

Browser checks assert18/24bold/19 sizes, title bounds and actual loaded font faces, then repeat entry/refund/Rush/focus/restart. TrueType bounds/cmap/glyph/name tests now include regular Condensed. Long-title native autoScale, non-Latin script font branches, exact physical text rasterization, remaining native header/button artwork, player fields/profile/search and sound are unfinished.

## Native registration-button state graphics

`ButtonColor.RED` maps common30/32/31, but GlobalButton's actual constructor passes up30, down32, null over and disabled27 into Button. Loading a local over31 variable does not pass it to the superclass. Therefore this header control's hover uses the up bitmap with1.3 RGB multiplier; it must not substitute the atlas31 texture merely because the color class lists it. Button applies a nominal0.2s multiplier tween; original default easing and physical frame delivery remain uncalibrated.

The body bitmaps are20x40. applySlice9Grid on DisplayObject produces rectangle10,20,1,1, hence CSS fixed slices top20/right9/bottom19/left10. Shadow common20 is40x40 with15/15/10/10 scale9 rectangle; offsets−5,+5 and size+10,+5 give188x49 for the178x44 control. Existing Swift extraction reads back all four original crops and asserts exact RGBA; source/hash/pixel receipts are in `tourney-entry-source.json`. State images are preloaded to avoid a first-press fetch gap.

GlobalButton changes label alpha to0.5 when pressed or disabled. Disabled uses the gray27 body at full whole-control opacity plus an equal-weight1/3 RGB ColorMatrix, not CSS luminance grayscale or global0.4 opacity. Local SVG applies the actual matrix, with filter bounds expanded to preserve the shadow. The text lives in a separate span so its alpha changes without dimming the entire background.

The browser fixture checks normal/pressed/disabled image selection, exact slice/offset/size geometry, hover multiplier, half-alpha label and full disabled-control opacity. It presses then releases outside and verifies no wallet/registration action. A temporary red probe in the isolated headless page is sampled from an in-memory rendered capture: the disabled matrix must produce opaque RGB85/85/85, proving actual filter application rather than only a CSS property string. The probe is removed before real registration/refund/Rush/restart. No image is displayed or retained and no owner data is used.

Source target states and sprite pixels are established; full physical AIR/browser resampling, transition easing and disabled-to-enabled timing still need comparison. Native long-title autoScale, remaining player controls/columns and audio remain unfinished.

## Inline Players search

Selected exports of TourneyPlayersHeader and SearchInput establish an inline390x28 header, not a popup. Players column click toggles the header for signed-in users. Input is321x19 at16,4, font13 and maxChars30. Enter or the search icon calls send only when at least3characters are present. Submitted search pins the header and requests100 results from offset0 with newkeyword=true; close clears the keyword, removes the header and requests the normal list. Empty-input focus-out resets the normal list. Source hashes are recorded in tourney-player-search-source.json.

The local lobby now exposes this toggle/submit/close lifecycle against actual authenticated public player names, preserving polling and selection authority. Search never registers, debits, joins or issues a token. The original server matching algorithm is unavailable: local policy is explicitly case-insensitive substring matching, not a claimed native algorithm. Native lobby512/513/514 background and search/reset artwork, scroll pinning and physical placement remain unfinished; vector controls are provisional. The headless event fixture covers the missing-control RED, min3/max30, canonical account identity, one result across polling, empty result, close restoring6players, unchanged room bytes/wallet and restart.

Additional selected source: TourneySearchButton uses lobby516 for up/over/down and517 disabled (14x14). ResetButton uses lobby550/551 (40x18) and an actual Reset label, not a close-X; its pressed label moves down2px. SearchInput hides the search icon and shows Reset after submission; reset is at350,4 and the icon at364,6. Local control visibility and Reset labeling now follow this branch; the original sprites are not installed yet.

## Native search paint reconstruction

Seven original sprites (4583PNG bytes) replace the provisional field/search/reset controls: lobby512/513/514 over/focus/up40x24, lobby516/517 normal/disabled search14x14, lobby550/551 Reset40x18. The shared extractor verifies exact decoded RGBA against original atlas crops. Source/atlas/file hashes are included in tourney-player-search-source.json. Focus persists for a nonempty input on blur; submitted mode changes the background and swaps the icon for Reset. The pressed Reset label offset is3px versus1px up. Background is390x22 at2,2; input321x19 at16,4 and search14x14 at364,6; local nine-slice uses a one-pixel center. Physical AIR/browser slicing and scrolling pinning remain uncalibrated, as does the header search icon. Browser QA decodes all7images/dimensions, checks the focus sprite and pressed Reset image/label offset, then runs the real unchanged-wallet/room search and restart journey.
