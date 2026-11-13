# Cash-table Sit Out — implementation checkpoint

Ordinary hosted Hold’em/PLO tables now support a private next-hand pause flag. The current hand remains unchanged. Paused players retain their actual stack, receive no cards or forced contributions on the next hand, and do not block the other players’ Ready gate. At least two funded, active seats are required before a deal consumes pending funding. Resuming during a hand takes effect at the next deal.

The table settings checkbox and existing Sit Out hotkey dispatch the same authenticated operation. The control is hidden unless the backend advertises support. Seat balances use the server’s identity-bound balance rather than the initial buy-in for undealt players.

## Evidence and limits

REA retained static source: `SitOutCommand.as` uses `SitOutNextHand` for ordinary cash; `SitOutMenuView.as` binds `HotKey.SIT_OUT_NEXT_HAND`. This is not evidence of native AIR runtime timing or operator missed-blind policy. Global pause, next-blind pause, native menu placement and full pixel parity are not implemented by this checkpoint.

`room-sitout-test.mjs` covers Hold’em and PLO: next-hand-only scheduling, private flag, 126-chip retained/cashed balance, replacement isolation, two-active minimum, validation/authentication, write rollback, cold restart and resumed deal with conserved 360 chips. Existing wallet, add-chips, rebuy, Ready, sparse-seat, positions and tick tests pass locally.

Additional verified scenario: five computers continue across multiple hands while their host pauses; after checkpoint reload, resume enters the next hand with the same held balance. A regression exposed the end-of-hand Ready reset clearing that resume request; the reset now preserves eligibility only for an identity-bound player who was actually sitting out and has requested return.

`node network-browser-test.mjs --cash-sitout` passes on an ephemeral HTTP server and headless muted Chrome: actual checkbox and assigned S key pause/cancel, page reload, backend restart, current hand unchanged, private desired flag, and token/origin/body/method rejection. This test exposed a checkbox disabled by render-time busy state; control capability now determines availability.

Pending before publication: final review and commit-bound QA. No live owner data or runtime has been changed.

## Paused-seat dimming

Static `PlayerCell3D.activateDim(.3)` specifies avatar alpha .5 with dim1 and label text alpha .6, unlike Fold’s tinted avatar. The renderer uses actual per-hand `sittingOut`, not the private next-hand request. Headless browser test completes the current hand, prepares the other five seats and confirms the next deal has no paused cards, avatar opacity .5/filter none and name opacity .6. Native status glyph, label placement and timer policy remain pending.

Native status artwork is extracted by `tools/extract-sitout.py` from Starling frame player_cell0192 (72×72), with decoded RGBA equality checked. The label is the installed English `TablePlayerInfoSittingOut`: Sitting Out. For this unlimited-duration local cash policy, source timer offset -85 plus icon30/label90 yields -55/+5, scaled by the existing seat scale. Configured GameClock uses the source no-timer icon5/label60 branch (-80/-25). The status layer remains full opacity above the dimmed avatar. Source runtime font rasterization and physical comparison remain unverified.

Browser geometry check passes at850 and1196px: relative icon(-36,-55),72×72,labelY5,font28 after seat-scale normalization. Reload preserves the actual-pause marker. Requesting return during that hand retains it; next deal clears marker/dimming and restores avatar opacity1. Native runtime raster comparison remains separate.

## Deal Me In

FFDec bounded export of installed `NewDealMeInButton` confirms desktop `table_menu`127..133, button270×90, full gauge mask(5,1,260,80), label key ButtonReJoin (installed English: Deal Me In), font30,x5,y13/down17. `SitOutView` anchors at viewport.width-298,y1090. Local unlimited-duration policy uses progress1; no expiry is fabricated. The extractor composes up/over/down states with the source masks.

The button appears only for the current player actually sitting out; it requests the existing current-table resume operation. The native command sets GlobalSitInData.isAll, so global multi-table behavior remains incomplete and is explicitly scoped in the local tooltip/code. Pending return disables duplicate clicks while the actual-pause marker remains until the next deal.

Trusted headless mouse testing exposed the local diagnostic footer intercepting clicks at the correct button geometry. While the native return control is shown, the footer now follows the table instead of overlapping it. Tests assert hit-testability,270×90 geometry at850/1196, real click, persisted request and removal/restored avatar at the next deal.

## Account-wide cash return

The newly exported `GlobalSitInCommand` confirms isAll propagation to eligible table controllers. Local account-wide return is now supported for ordinary hosted cash Hold’em/PLO tables only. Rush and tournaments remain separate eligibility domains and are not claimed covered.

`POST /local/cash-sit-in` requires local profile cookie, exact Origin, JSON ≤512 bytes and the expected account identity. It accepts no room IDs, target account selector or funding instructions. The room store clears only that account’s pending cash pause flags in one atomic save, preserving current hands and wallets. Failure restores every affected room in memory; retry is idempotent. Actual paused seats return only on later deals. No funds are automatically purchased.

Model/HTTP tests cover two tables, other-account isolation, unchanged hand and wallet, restart and failed-write rollback. The authenticated headless browser scenario confirms one global request from the actual Deal Me In mouse click; guest seats keep the current-table route. Backend capability advertisement prevents the new frontend from assuming an older running backend supports global return.

## Insufficient stack on return

Retained `TableInfo.dealMeInMin` defaults to2×bigBlind for ordinary two-blind games when no operator override exists. Other native branches use4×buttonBlind or2×thirdBlind; those formats/overrides are not introduced here. `SitIn.onRequest` opens OPEN_GET_CHIPS below that threshold for normal Hold’em/Omaha.

The local room store publishes the ordinary default minimum and a private funding-required flag. A seated paused player below it cannot clear pause through the direct API; global return skips that seat and returns only that account’s required-funding room/minimum/balance. Other eligible cash seats can still return. No wallet is debited by this operation. Confirmed pending chips count toward the next-hand minimum.

The settings toggle or Deal Me In opens the existing Add Chips dialog for the affected current seat. Cancel/Escape preserves pause and spends nothing; confirmation uses the existing single-debit pending-increment flow. The user requests return again after funding. Browser test starts a legal16-chip stake, plays raise12/raise20/fold/fold to leave4, schedules pause, verifies Escape, confirms12 once and returns next deal with16; total268 and the current hand remain correct. No private operator override or automatic purchase is guessed.

## Account-wide cash pause

Static `SitOutMenuView` registers SIT_OUT_ALL_TABLES with SitOutNextHand; `GlobalSitoutCommand` dispatches the pause command to eligible table controllers. Installed localization includes “Sit out all cash game tables on next hand”. The local settings action uses that cash-specific label, with no claim that the complete native menu placement/hotkey catalog is reproduced.

`POST /local/cash-sit-out` shares the origin/cookie/expected-account/body/size boundary of global return. Both use the same atomic account-scoped store loop and shared seat pause transition. Pause never applies the return funding requirement, never folds a running hand and never debits a wallet. Guests cannot target another account’s tables. The button is capability-gated and a repeated click is idempotent.

Tests cover two rooms, other-account isolation, no hand/wallet changes, failed-write rollback/retry and cold restart for both pause and return. Authenticated headless trusted settings click verifies the actual action and current-hand preservation; the guest control remains hidden. Next-blind, leave-all, global Rush/tournament eligibility and native whole-menu geometry/hotkeys remain incomplete.

## Configurable global cash pause hotkey

Native `SitOutMenuView` registers HotKey.SIT_OUT_ALL_TABLES. The local binding catalog now exposes the implemented cash-specific action in Functions, initially unassigned (no native default combination is inferred). It dispatches the same capability/account-gated settings button; the native broader all-game/Rush/tournament scope remains incomplete.

Binding tests cover assignment, persistence, Functions categorization and conflict rejection without changing existing assignments. Authenticated headless keyboard input with a test-only G binding schedules the pause without a betting action; disabling Functions blocks it. The normal current-table S test remains independent.

## Four native pause statuses

FFDec export of `SitOutStateUI` establishes Smoking/Toilet/Drink/Charge with ESitOutState1/2/4/8, desktop table_menu366..369 icons60×60 on table_menu121 buttons68×68; icons(4,4), pressed y8, button pitch73. SitOutView anchors the selector at(1097,1100) for1700px viewport. Unselected alpha .3, selected1. Opponent/player status glyphs are Starling player_cell193..196,72×72. The extractor verifies source-region decoded RGBA, with native art remaining private.

The status endpoint is separate from pause eligibility: `POST /api/rooms/:id/sit-out-state` accepts only state0/1/2/4/8 and optional nonnegative version, requires the seated identity and an actually paused ordinary cash seat. Status does not change the hand, stack or wallet; replay is idempotent, save errors roll back, and checkpoint validation rejects unsupported values. Returning at a new deal clears the cosmetic state. Other players see the status glyph only for that actual paused identity.

| Control | Local action | Native evidence / remaining limit |
|---|---|---|
| Smoking | Persist state1, select button, show smoking glyph | SitOutStateUI366 / player_cell193 |
| Restroom | Persist state2, select button, show restroom glyph | SitOutStateUI367 / player_cell194 |
| Drink | Persist state4, select button, show drink glyph | SitOutStateUI368 / player_cell195 |
| Charge | Persist state8, select button, show charge glyph | SitOutStateUI369 / player_cell196; no invented time grant |

Native `ChangeSitOutState` can receive added-time information from its private server. Local cash has no expiry clock, so these controls do not fabricate a countdown or extra-time grant. Operator timing and brand-specific N8IN Charge artwork remain incomplete. Browser tests check all four trusted clicks, selected alpha, changed glyph, reload, next-deal reset and source selector geometry at850/1196. A render-cache dependency defect found by the test was repaired by including pause/status/balance fields in the existing draw signature.
