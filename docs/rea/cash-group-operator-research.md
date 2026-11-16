# Group View operator and in-app Game Info — research checkpoint

Status: source-derived requirements plus initial local implementation, verified in an isolated headless browser; released through PR270 after commit-bound installed verification. Original client was not launched. The installed SWF identity is recorded in the companion source receipt; its identity as the previously running client module is still unproven.

## Operator and list

`LobbyPlayerView` enables Game Info. Its operator starts with Join Table (or Cancel Waiting where applicable); selecting a player replaces this with Profile and Open for an authenticated player, or Open for a guest. Selection changes list height through the operator offset, rather than overlaying rows. The page list begins below the 23px header. Its scrollbar is 5px wide at viewport width minus 5.

`LobbyDetailViewOperatorBase` uses 10px margins, 38px buttons and 10px button gaps. Buttons occupy 90% width at x=5%. The Game Info area adds 30px. Steady operator heights are therefore 88px for one button and 136px for two buttons. The opening tween is 0.3 seconds with Ease.easeOut; list geometry updates during it. The Game Info link dispatches SHOW_GAME_INFO. The separately named OpenGameInfoPopupCommand requires a typed body and must not be mistaken for this handler.

## Game Info is inside the application

`LobbyGameInfoView` constructs a 535px panel. `showHide(true)` moves its content container to x=-535 over 0.2 seconds with Ease.easeOut; the immediate flag uses zero duration. Its mask starts at minus viewport width. Content width is 455px, horizontally centered, y=40. The scrollable height is viewport height minus 50. Close is inset 12px from the top/right; the collapse arrow is at x=1, vertically centered. Different paragraph groups add 56px spacing.

The Hold’em source branch includes currency, game type, table maximum, blind structure, action time, time bank, disconnection extra time, minimum players, optional features and a Hold’em rules block. Several values depend on brand, account or feature configuration. They must not be copied as claims about unsupported local mechanics. The rules block has a separate More Rules action; that external action is distinct from the in-app Game Info panel.

## Resolved command owner and panel anchoring

`LobbyContentView.onPageSignal` handles SHOW_GAME_INFO directly: it calls `setGameType(_currentTab.type.gameType)` and then `showHide(true)`. Thus ordinary Hold’em information follows the active game tab, rather than an arbitrary selected table. Special VIP/featured-table events separately call `setTableInfo` and must not be conflated with the normal game branch.

The panel is added to the content view, initialized at y=42, and resized with x equal to the content viewport width. Its viewport is 535px wide and content viewport height minus 42. Combining that anchor with the negative535px opening translation places its open left edge at content width minus535. Changing the selected lobby tab calls `showHide(false,true)`, closing it immediately. These facts are verified against the recovered command owner, not inferred from an unrelated popup command.

## Remaining implementation evidence

The command owner, panel anchoring and selected game context are now recovered. Recover localized labels and row component geometry before wiring it. Then implement actual local state-backed values, Group View operator/list resizing, profile/open actions and panel dismissal. Verify at 1200×963 against the preserved native capture where visible and explicitly distinguish source-only claims. No new browser screenshot or gameplay test was performed for this research checkpoint.

## Recovered row geometry and text contract

`NormalGameInfoItem` uses a455×36 background with10px round-rectangle diameter. Base fill is1907997 (#1d1d1d). Title is Roboto14, #fefefe, x12; its vertical origin is integer-centered plus1px. Value is Roboto14, #b1b1b1, right inset12. Optional explanation is12px #5f5f5f, x10, width435, multiline/word-wrapped. It begins at y38. Total ordinary row height is40px plus explanation height and2px when present. Optional feature icons shift the title to x41. The source renderer must measure actual localized text rather than use fixed explanation heights.

The panel frame is #3b3b3b with a2px inset black interior. Group View link is Roboto13; its native icon follows measured text width plus5px, total height20. Source colors are numerical asset/source values; the previously documented native color-pipeline discrepancy still applies.

Existing local English catalog contains CategoryHoldem, MobileInformation, TexasHoldemMostPopularLong, Mobile14Seconds, LabelSixOrNinePlayers, SbBbAnte, MobileTwoPlayers and DealingWillOnlyStartWhen. This confirms the labels can reuse the existing localization layer. However, native14-second/6-or-9-player values cannot describe arbitrary owner tables: local actionSeconds defaults to90 and is owner-configurable. The generic original panel describes operator game rules; the local implementation must distinguish local rules from original informational text and expose actual supported table settings without misrepresenting parity.

## Initial local implementation and checks

The Hold’em Group View now has an in-app Information action. The panel reuses existing original language catalogs, source535/455px frame/content widths,36px row backgrounds and source typography/colors. It aggregates the actual hosted Hold’em catalog’s capacities and action times, displays real ante presence and play-money currency, and reuses the original Hold’em rules text. Empty catalogs do not fabricate table settings. Closing/Escape restores focus; changing game tabs removes the old panel and returning creates one closed instance. Unchanged refreshes preserve row nodes.

Changed code: playgg.mjs, cash-group-players.css and cash-group-catalog.mjs. Regression coverage is in cash-group-catalog-test.mjs and cash-game-info-browser-test.mjs. The initial missing helper failed first; the implemented tests then passed. Isolated1200×963 headless browser checks passed real pointer opening/closing, Escape, six rows, local90-second value, source535/455 widths after stage scaling, unchanged row identity over polling, PLO/Hold’em lifecycle and unchanged viewer/wallet. The private working capture was inspected, not published. No live owner data or native client was touched.

This is not a complete native panel: feature rows and same-screen native comparison remain unfinished. The local mixed-catalog values intentionally differ from operator-specific static native values. These remaining items must be completed before calling the panel1:1. The development checks below preceded the separate commit-bound release verification recorded at the end.

## Original controls and motion added

The extractor’s --cash-game-info mode now recovers common4/5 close skins (12×11), lobby191/192/193 arrow skins (22×80) and lobby112 link icon (16×16). All six decoded RGBA crops were read back against the source atlas; total generated PNG storage is3907bytes. The source CloseButton uses common4 for normal/pressed and common5 for hover. Corrected inherited constructor order: arrow normal/hover/pressed use191/192/193 respectively; see asset-button-pipeline.md.

Both opening and closing use200ms motion and a clipped535px region. Reopening cancels the old motion and starts from its current position. Native Ease.easeOut computes1+(t−1)^3; cubic-bezier(1/3,1,2/3,1) reproduces that curve exactly. Reduced-motion preference skips duration as a local accessibility adaptation. The isolated browser pauses the opening at100ms and verifies that exactly one eighth of travel remains within tolerance, then finishes it. Separate pointer tests verify both close and arrow dismissal, Escape and game-tab lifecycle, and decode all six original images. No speaker/foreground/native-client action was performed.

The midpoint test first failed: focus scrolled the overflow-hidden clip so the visible offset was nearly zero despite a correct transform. The repair uses a non-scrollable overflow:clip mask plus preventScroll focus. The same100ms/one-eighth assertion then passed, as did both dismissal buttons and tab lifecycle. This is a verified local browser repair, not a claim about native focus behavior. Updated isolated1200×963 rendering was visually inspected with the original extracted arrow and close textures.

The broader working-tree network-browser-test.mjs --bots --cash-group-dialog journey passed: native Group/Table controls, real two-table group Join/replay, private profile/HUD actions, complete six-seat bot hand, independent96-chip payout, second hand, reconnect/restart and cross-room conservation (720 retained chips). These are development checks, not commit-bound release evidence. A subsequent panel-only painted-frame adjustment removes CSS border-box coordinate drift; its dedicated browser check verifies native content y40 without a2px layout inset. All live runtime and owner data remain unchanged.

## Group parent and operator calibration

Group View now shares the verified source241px sidebar frame,234px tab header at(4,4) and page y35 with Table View. The original1200px reference frame is calibrated inside the existing1196px stage without moving the main table list. An operator wrapper reserves88px for Join/Open plus Information, or136px for Profile/Open plus Information. At1200×963 the preview occupies(844,185),241×690 unselected and241×642 selected; Profile starts at837, Open at885. Buttons are216.9×38 at x12.05 inside the sidebar. The Information link begins30px above the bottom. Source operator fill is#1f1f1f with a2px#313131 top line.

The list and operator height transitions use the original300ms cubic ease. The browser test pauses the list at150ms and measures648px, matching690−48×0.875, then verifies the settled642px. Existing player selection, Profile, actual room Open, private HUD and group Join callbacks are preserved. Leaving Hold’em unwraps the shared controls before destroying the operator, avoiding duplicate controls or a changed tournament/PLO structure.

Red/green evidence: the new geometry test initially failed the old sidebar x origin; after calibration it caught an obsolete selected-Open10px margin, which was removed. The dedicated browser test then passed all geometry/motion checks. The existing broad test initially normalized only the stage transform and reported239 instead of240; it now includes the independently calibrated sidebar transform while retaining the same source240/23/28 and41/107/30/62 expectations. A new full-flow run is required after this test correction. A private selected-player1200×963 working render was inspected; this is source-based Group calibration, not a newly observed native Group capture or a full pixel match.

The next broad run passed the corrected source dimensions but clicked Profile while the newly added300ms operator transition was still moving; the physical press/release did not open its target HUD. The test now waits for the actual operator animation to finish before that stationary-target click, rather than removing the native motion or adding an arbitrary delay. The rerun remains the gate for declaring the whole Group journey verified after calibration.

Final development rerun after the Group calibration passed network-browser-test.mjs --bots --cash-group-dialog, including the own/observer HUD, actual room Open, lost-response-safe two-room Join, complete120-chip pot independently awarded as[0,0,0,120,0,0], next hand, reconnect/restart and720-chip conservation. The dedicated panel/Group test also passed900×700 resize and1200×963 restoration, with operator buttons remaining inside the window. These are working-tree checks; commit-bound QA, merge and guarded live rollout remain outstanding.

## Installed release — PR270

PR270 merged `7db0c343e1ca3de8cbefeda44db2e7ff8336ac15`; tested source `1ec77b284db52cdb9d0660ec45026ab76bdc4d04`.

Group View now uses the source241px sidebar and animated88/136px operator. Selection changes list690→642px at1200×963, with actual Profile/Open/Join callbacks retained. The in-app Information panel uses original close/arrow/icon art,200ms cubic motion, original language catalogs and actual local catalog rules. Native fixed14-second values are not copied over owner-configurable action times. Source/implementation/browser focus issues and remaining differences are documented.

All16 exact-head installed checks/reviews passed:130 runtime identities,1381 artwork hashes/1375 unchanged hardlinks,15 original AS3 identities,6 independent exact RGBA crops,unit/font/language/private metadata checks,actual Group/panel geometry and cubic midpoints,resize/lifecycle/stable refresh,two complete six-seat browser journeys,independent payouts,reconnect/cold restart and conserved balances. Installed1200×963 Group capture inspected; original app not relaunched.

Live runtime130files/1,498,363bytes;art1381files with1375 verified immutable hardlinks plus6new PNGs totaling3907bytes. Guarded idle rollout PID49447→4590 preserved all6ownerfiles(15,496bytes) byte-for-byte. Backup `/Users/davidai/.local/state/playgg-rollouts/pr270-tjy2zqkz`. No live gameplay writes,foreground or speaker actions. Native feature rows,loaded-module identity,color/text pipeline,fresh native Group comparison and whole-app parity remain incomplete.

## Time Bank/cards and Multiple Dealing — next candidate

REA’s addTimeBankCell selects continuous bank or card information, and InfoType maps the titles to MobileTimeBank/TimeBankCard. The original Hold’em values depend on operator configuration (30–45seconds or3–5cards, with an operator replenishment description). The local engine instead has an owner-configured finite continuous bank or free cards, allocated per seating with an explicit duration and per-action cap. The panel now reads these actual catalog fields. It does not display private remaining card inventory or claim native automatic replenishment. Mixed catalogs show the real distinct configurations; a card-only catalog follows the card branch without inventing a continuous bank.

MultipleDealing reflects the actual owner rimt opt-in, including mixed Off/On catalogs. It uses original lobby200 (23×21), NormalGameInfoItem’s x12/y7 icon position, title x41 and the native paragraph transition’s56px spacing. The extractor’s --cash-game-info-features mode verifies the exact RGBA crop; one new PNG is1360bytes. Existing backend/negotiation/clock behavior is unchanged. Informational sub-popups and remaining native features are still incomplete.

Red/green: the new clock summary assertions first failed because the old panel omitted these rules, then passed for disabled/continuous/card/mixed modes, singular card text, configured seconds/caps and Multiple Dealing. Isolated browser checks create actual owner-configured bank/card tables, observe the panel update through polling, verify configured values and the native icon, preserve stable rows when unchanged and retain original Group/panel geometry/lifecycle. Unit/room/HTTP checks passed finite bank/card spending,private inventory,no refill,stale/idempotent actions,restart and720-chip hand conservation; hosted RIMT passed unequal all-ins,a folded player,three agreed boards,290allocatedchips,70uncalled return and restart. Candidate is not installed yet; PR270 remains the live release.

The private mixed-rules1200×963 working render was inspected. The capture first exposed a test-harness startup race: Chrome had created DevToolsActivePort before both lines were written. The browser fixture now waits for a numeric port and complete /devtools/browser/ path before connecting; the rerun passed and cleaned up both isolated processes/profile. This test-only repair changes no application behavior. Candidate remains local and unreleased.

## Internal rule-information controls — next candidate

The recovered InfoType constructor marks Time Bank, Time Bank Card and Multiple Dealing with useInfoButton=true. NormalGameInfoItem uses common274 at16×16,4px after the measured title. LobbyGameInfoItem dispatches GAME_INFO_INFORMATION_CLICK with infoType. OpenGameInfoPopupCommand maps these to TIME_BANK/TIME_BANK_CHIP/MULTIPLE_DEALING and OPEN_NEW_GAME_INFO_POPUP, distinct from the535px lobby panel.

NewGameInfoType starts with a408px popup. NewGameInfoView uses28px left/right,24px top,33px bottom padding and16px item spacing. The title is native Roboto Bold20, #2c75b2, centered. The lobby_popup44 frame is the existing native-autofold-help-bg asset. CloseOptionButton’s lobby_option0/1 skins are scaled to14×14, tinted#c3c3c3 and inset15px. Original ReleaseOutSide dismissal is implemented with a complete outside press/release; Escape and close restore focus to the triggering information control. Dialog lifecycle is removed when leaving Hold’em.

GameInfoTemplateType uses original game_info0000 (Multiple Dealing352×180),0001 (Time Bank352×186) and0026 (cards352×180). Their bytes are preserved exactly. The popup renderer also reconstructs the source’s generic Player/1,000/TIME overlays with original positions,sizes and colors, using text-only localization. These are illustrative native diagrams, not embedded app screenshots or gameplay controls. Original card descriptions include paid purchases,distribution of paid fees and automatic policies; those are not asserted as available local features. Local clock/card descriptions instead show actual configured free duration,count and turn limits. Multiple Dealing keeps the native one/two/three-board diagram; the actual existing negotiation engine remains authoritative.

The new popup extractor first failed Swift’s non-throwing precondition autoclosure check; moving the checked read outside the assertion fixed compilation. Original diagrams and skin hashes are in popup_atlas;27 original class identities are retained. The browser interaction test first failed on the missing information control, then passed all three actual pointer-open dialogs,width408,exact illustration sizes,configured card values,Escape,close,outside dismissal,focus return,still-open parent panel and unchanged identity/wallet. Candidate remains unreleased; native physical text raster and the intentionally omitted paid-feature behavior remain gaps.

## Installed rule-information release — PR272

PR272 merged `05b766f1fb85d282eb867ec07fae75743acadf5b`; tested source `47eb7a5a43da166a1d7cbf7a447f4c2f909acf88`.

Hold’em Information now reflects actual local continuous-bank,free-card and Multiple Dealing rules,including mixed catalogs and polling changes. Three native-style408px informational dialogs use the recovered frame,close controls,original diagrams and source-positioned labels. Escape,close,outside dismissal and focus return work without seating/debit. Paid card/refill descriptions unsupported locally are not asserted as working features.

All16 exact-head installed checks/reviews passed:130 runtime identities,1387 artwork hashes/1381 immutable hardlinks,27 original class identities and4 unchanged local rule sources,three exact crops/three byte-identical diagrams,syntax/catalog/language,finite clock/card room behavior and private inventory,hosted unequal-all-in/fold/three-run RIMT with290allocatedchips/70uncalled return/restart,actual dialog/Group controls and a six-seat bot journey with96-chip independent payout,next hand/reconnect/restart/720-chip conservation. Installed1200×963 modal capture inspected; native app not relaunched.

Live runtime130files/1,504,881bytes;art1387files with1381 verified immutable hardlinks plus6new PNGs totaling148,590bytes. Guarded idle rollout PID4590→92382 preserved all6ownerfiles(15,496bytes) byte-for-byte. Backup `/Users/davidai/.local/state/playgg-rollouts/pr272-d3ggqvbv`. No live gameplay writes,foreground or speaker actions. Native paid/refill features,remaining game-info branches,loaded-module identity,color/text pipeline,fresh physical comparison and whole-app parity remain incomplete.

Earlier candidate notes record the development sequence; this verified release supersedes their unreleased status.

## Inherited button-state correction candidate

The prior arrow/CloseOption state interpretation was incorrect because Button parameters are up,down,over,disabled. The unreleased correction also restores inherited1/1.3/0.8 multipliers and200ms linear transitions,including drag-out cancellation. Original image bytes remain unchanged; see [source and verification](asset-button-pipeline.md). Global selected-skin color differences remain unresolved.

The inherited-button correction above is now installed through PR274 with8 exact-head checks; [release evidence](asset-button-pipeline.md). PR272 remains the historical base for clock/card/rule dialogs; full native parity remains incomplete.
