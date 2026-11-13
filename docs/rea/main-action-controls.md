# Main betting controls: source contract and local keyboard order

## Evidence

Seven retained FFDec exports define the ordinary action panel: MainActionUI, ActionButton, ActionButtonBase, CallButton, CheckButton, MainActionBetButton and RaiseButton. The six concrete/base button exports were recovered directly from the installed IronDesktop.swf during this check. This is static source evidence; no native seated hand or real-money account was operated.

MainActionUI puts the button layer at1022,1050 in native stage coordinates. Available actions are placed consecutively with a217-unit pitch. The amount editor is at1022,976. ActionButton uses table textures4/5/6 for up/hover/down. Each button is232×152 in the retained atlas; label boxes are162×45 at x35. A single label uses y34; a label with amount uses y14 and57. Pressing shifts both down14 and changes the text to#999999. Labels start at34bold with auto-scale. These measurements support source comparisons, not a claim of physical native pixel parity.

CallButton uses MyTurnBetCallText and CheckButton uses HandSummaryCheck. MainActionBetButton uses MyTurnBetBetText; RaiseButton uses MyTurnBetRaiseToText. Call/Check share the CHECK_AND_CALL hotkey; Bet/Raise share BET_AND_RAISE. The local server still determines legal amounts and action eligibility.

## Corrected local behavior

The local ordinary table previously created Call/Check before Fold/Check-Fold, then positioned Fold to its left with CSS. Consequently DOM and keyboard order contradicted the visible layout. Constructing the existing Fold control first preserves the displayed positions, callbacks, hotkeys and amount validation while making Tab traverse Fold → Call/Check → Bet/Raise. This is a local accessibility correction; the native desktop Tab order has not been observed.

Rush retains its separately mounted quick-fold control. AoF retains its separate two-button panel. No betting request is sent by focusing or tabbing through an action. No game rules, money calculations, authorization or saved preferences change.

## Verification

The isolated headless owner+five-computer browser test first failed on the prior DOM order F2,F1,F3. It now checks F1,F2,F3 and real keyboard Tab movement without a room-version change. Additional pointer checks compare the native hover/down images, pressed label offsets28/71 and text#999999; moving off the pressed button before releasing must cancel the action. Existing stage-coordinate/font checks, amount editing, full-hand independent payout, second hand, reconnect and cold restart remain regression gates for Hold’em and Omaha.

The source export and test do not establish native seated placement relative to every window, AIR/browser glyph rasterization, or physical animation/speaker timing. Spin activation remains separately incomplete because the concrete per-multiplier starting-stack/time-bank and NoDealing configuration have not been recovered.
