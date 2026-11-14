# Run It Multiple Times — recovered native contract

Current implementation status: owner-created all-human Holdem cash tables can opt into local-practice RIMT. Normal browser betting, automatic local roles, proposal/acceptance, animated boards/focus/per-run awards and restart now pass without a seeded hand. Released in PR127 at main5d86d42e10c32c479ad188b873f10ba5967a28cc (tested sourcecd9323462297e5e223b28cbe4012765141d424d5). The verified local runtime is installed; existing table settings and owner data were preserved. PR127 initially kept bot/guest tables on ordinary one-board play; the computer policy below extends that implementation. Guest seats remain excluded. Native server role, tie, odd-chip, timeout and eligibility policies remain unverified; local policies are explicit below. Earlier sections describe the staged investigation and their then-current limitations.


Historical status at initial export: the negotiation and pot helpers are connected to an explicitly armed hand-engine path and tested there. Hosted room persistence and public controls are not connected; the live app still settles one board. No RIMT button, negotiation or multi-board payout is represented as implemented. Fifteen selected classes were recovered with the installed FFDec; source bytes and hashes remain private in Sandbox and Git QA metadata. No native account action, bet or GUI activation was performed.

## Roles and state transitions

The native enum defines None=0, RunItOnce=1, RunItTwice=2 and RunItThreeTimes=3. None must not be silently interpreted as a completed one-board decision.

OnAskingForRIMTSuggest (callback 4068) obtains the server-named UnderdogId, assigns ASKING_FOR_RIMT_SUGGEST, records the participant in allinInfo and forwards the supplied AskingTime to the mediator. Only that user's client opens the suggestion panel; observers receive an announcement. The client does not select the underdog itself in this callback.

OnRIMTSuggested (4069) records the server's Type on the named underdog and moves that player to RIMT_SUGGESTED. The mediator hides both suggestion/decision panels. For two or three runs it can issue native reaction 28 or 29 with its corresponding caption, subject to rendering and mute-mode gates.

OnAskingForRIMTDecide (4070) names FavoriteId and links the two opponent objects. Only the favorite's client opens the accept/reject panel, populated with the opponent's proposed type. The protocol includes Type, but this particular callback does not itself assign that field to the participant; the preceding confirmed suggestion supplies the displayed type. The mediator receives AskingTime directly.

OnRIMTDecided (4071) records the final server Type both globally and on the favorite, moves that player to RIMT_DECIDED and hides the decision view. If the opponent proposed more than one run, matching final/proposed types can emit reaction 25; a different final type can emit reaction 20. Rendering/mute gates still apply. A local click or successful request response is not itself this authoritative final event.

## Commands and request boundaries

Suggestion dispatches SUGGEST_RIMT_TYPE with rimtType. SuggestRimtCommand forwards it to request 3138. SuggestRimt sets GameId from playInfo.gameID and RIMTType from the choice. Its response handler is empty; the state update comes through callbacks.

Decision dispatches DECIDE_RIMT with isAgreed. DecideRimtCommand forwards a boolean to request 3139, which sends the current GameId and IsAgreed. Its response handler is also empty. Both protocol request types have UserId/TableId fields, but these request wrappers do not set them directly; the common request/authentication layer remains to be traced. These fields are not evidence that a replacement server should trust client-supplied identities.

The AskingTime fields are doubles and are passed to the view tween duration without scaling in these selected classes. The view animates its progress indicator from one to zero; no local auto-accept, auto-reject or timeout settlement is dispatched by that tween. The authoritative timeout policy cannot be recovered by inventing a default from this animation.

## Native controls and layout

The suggestion view has 640 × 295 content. Its button container starts at x33/y21; three green H170 buttons are spaced at x0/198/396 and correspond to one, two and three runs. The three dedicated RUN_IT_* hotkeys register on these controls. Information/progress begins at x39/y211. A click sends its choice and fades out the view. The parent AllinMomentBaseView supplies outer placement and transitions; those have not yet been recovered for this guide.

The decision view uses the same content bounds and information/progress placement. The opponent nickname, wants-to caption and proposed type form a centered row at y33 with 30-pixel labels and 5-pixel gaps. The question occupies x154/y69/328 × 40. Yes is green H64 at x84/y124, No gray H64 at x338/y124. The question can auto-scale. A click sends true or false and fades out; a language change recalculates text positions.

These are source coordinates, not a measured same-size screenshot comparison. Native button slices, fonts, parent frame, fade timing and hotkey mappings need their existing asset/source paths verified before a pixel-parity claim.

## Backend and gameplay questions still open

These client classes do not establish format/stake eligibility, exactly-two-player restrictions, how the server chooses underdog/favorite, equal-equity policy, timeout defaults, disconnected-player handling, side-pot eligibility across boards, odd-chip assignment among runs, burn/deck consumption order or rake. None of those rules is inferred from the enum or panel copy.

The local engine already has contribution/fold-based side-pot splitting, uncalled returns and within-pot winner/odd-chip allocation in engine/pots.mjs. Its existing policy is a single-board practice rule, not proof of the native multi-board allocation. A multi-board implementation must reuse the validated split boundaries and return unmatched chips only once, then establish an explicit verified allocation rule for contested amounts and evaluate each board independently. It must not duplicate a pot or let the browser supply a payout.

## Acceptance gates before enabling the feature

- Bind proposal/decision to an authenticated seat, current room and hand; reject other actors, stale hands, duplicate conflicting commands and malformed types.
- Persist each server decision and deadline so reload/restart cannot change a selected run count or replay a payout. Settle once from server cards and contributions.
- Keep opposing private cards hidden according to the existing showdown rule. Never send undealt future boards or deck state to a browser.
- Test one/two/three boards, unequal all-ins, folded contributors, unmatched returns, ties, odd chips, insufficient remaining deck and independent total conservation.
- Exercise both players' real proposal/accept/reject controls in separate browser sessions, timeout/disconnect recovery and restart before/after settlement.
- Compare the recovered native controls at the same viewport and keep all unverified source/runtime gaps visible in the feature tracker.

This investigation is the next implementation boundary; it does not complete the full GGPoker reconstruction.


## Official rule cross-check and explicit allocation foundation

The [official GGPoker help article](https://help.ggpoker.com/es/article/RIMT-Correrlo-M%C3%BAltiples-Veces-1717475512643), read through indexed help text, confirms two active all-in players, mutual agreement, one-board play if either declines, and separate pot portions for the board outcomes. It states that multiple runs add no extra rake. The direct English help page returned an empty readable body in this environment; no extra unseen English content is claimed. This resolves those general player rules, not format/stake eligibility, timeout behavior or odd-chip/deck policies.

`settleRunouts` in engine/pots.mjs now splits contributions/folds once with the existing validated splitPots routine. Unmatched contributions enter returns once, independently of the number of boards. The caller supplies an explicit nonnegative whole-chip allocation for each contested pot across one, two or three boards; every row must sum exactly to that pot. There is no default inter-board odd-chip rule. Each board uses its own comparator, and per-run/per-pot payouts are recorded along with the aggregate. The within-board tie/odd-chip winner allocation reuses the same private award helper as ordinary settlePots, preserving the existing local clockwise policy rather than copying a second implementation.

Tests independently verify unequal contributions 50/120/200/120 with the fourth player folded: contested pots 200 and 210, an 80-chip unmatched return once, and final explicit three-run payouts 67/206/217/0, totaling 490. Other cases cover two runs, tied odd amounts, a zero-valued run, no contested pot, frozen inputs, sparse/malformed arrays, nonfinite comparisons, unsafe totals and exact one-board compatibility. Real Hold'em evaluators check a shared flop where aces win one run, kings make a set on another and a board straight ties the third; explicit thirds of a 201-chip pot yield 100/101/0 with the folded contribution retained.

Existing pot, live-pot/privacy/restart, inactive-seat, PLO/PLO-5/PLO-6, Short Deck, AoF, tournament and insured Spin wallet regressions pass after extracting the shared award helper. No negotiation, new board dealing, endpoint, UI control, timeout fallback or wallet transfer is enabled by this function. Source implementation is not deployed. Server role/deadline negotiation and an evidenced dealing/allocation policy are required next before exposing RIMT in the app.


## Hand-bound negotiation model — source implementation, not gameplay-wired

`engine/rimt.mjs` now provides creation, strict checkpoint reconstruction and pure command application. Creation requires an explicit hand number, distinct proposer/decider seats, creation time, proposal deadline and decision duration. There is no guessed native timeout or automatic equity-based role selection. Times are whole safe milliseconds, and overflow of the derived deadline is rejected.

Only the proposer may choose one/two/three runs. Choosing one resolves immediately; two/three requires the decider's boolean response. Agreement records the proposal; refusal records one run. The saved state contains the proposal, decision, timestamps and outcome reason. Repeating the same role/hand/choice returns the same result even after its deadline; a changed choice or wrong hand/actor is rejected. Deadline equality closes a new choice, avoiding disagreement between expiry and acceptance at the boundary. Commands and states reject extra fields and inconsistent snapshots, including accepted outcomes beyond their deadline. Inputs are cloned rather than mutated.

Expiry is an explicit local practice policy: if mutual agreement is absent when the supplied deadline expires, resolve to one run. It never silently authorizes multiple boards. This conservative fallback is not presented as a recovered native timeout rule. The caller must persist the returned state atomically, bind it to an authenticated room/seat and execute server timers; none of those HTTP/storage integrations is enabled by this pure model.

Tests cover one/two/three, agreement/refusal, expiry before/at both deadlines, actor and stale-hand rejection, retry identity, changed-choice conflicts, clock reversal, invalid timestamps, overflow, frozen inputs and malformed reconstructed states. JSON round trips are checked at initial/proposed/final stages; this proves checkpoint compatibility, not a restarted live server. A combined rank fixture feeds confirmed outcomes into settleRunouts: a 201-chip pot gives 201/0 for one run, 101/100 for two, and 100/101 for three under the caller's explicit allocations. The fixture uses real Hold'em evaluation but preselected boards, not a newly playable hand.

Next integration must pause a card engine before automatic runout, obtain eligible server-designated roles, persist the pending negotiation with private deck state, then deal/settle only the final authorized count. Native odd-chip/deck/timeout policies and full browser controls remain unresolved; the UI is not enabled.


## Armed hand-engine pause and finalization — not enabled in rooms

`startHand` accepts an optional seventh argument identifying the hand armed for runout negotiation. Its default leaves the old state shape and ordinary dealing unchanged. When betting has closed with two remaining participants and an incomplete board, an armed hand stops before the automatic runout: no cards are removed, no payout is made, turn becomes null and betting/quick-fold actions are unavailable. The engine boundary includes a covering player with chips remaining; the eventual server must still establish native eligibility and role selection rather than treating this mechanical pause as a recovered operator rule.

`finishRunout` requires a valid final negotiation matching the armed hand and its two remaining participants. It validates private card uniqueness, hole counts, board prefix, remaining deck capacity, contribution/stack totals and the explicit per-pot run allocations. It computes all boards, ranks and payouts in local copies before committing them. Invalid decisions, allocations, duplicate/invalid cards, insufficient deck or corrupt bankroll leave the hand unchanged. A repeated identical completed decision/allocation returns the existing hand; changed completion data is rejected.

The explicit local dealing policy reuses the existing street burn/draw function, completing each remaining board in sequence from one private deck. Common flop/turn cards remain shared, consistent with the recovered PlayInfo common-prefix model. Native multi-run burn order, insufficient-card policy and inter-board odd chips remain unverified. No reshuffle or guessed allocation is introduced. One armed run produces the same board, remaining deck, stacks and aggregate payout as the existing unarmed engine under the same fixed cards.

The full engine fixture uses contributions 50/120/4 with the third player folded: a 104-chip contested pot and a 70-chip unmatched return. Three explicit portions 35/35/34 produce final stacks 52/122/116, preserving all 290 initial chips. Tests cover one/two/three boards, a blind-only all-in, shared flop/turn, pending/final JSON reconstruction, idempotent completion and atomic failures. Existing no-limit, pots, live-pot/privacy/restart, inactive-seat, PLO variants, Short Deck, AoF, Rush, Rabbit, tournament-wallet and insured Spin tests pass.

Because browser practice pages import the shared hand engine, its new RIMT dependency was added to the server's closed module allowlist. A red browser test reproduced its 404 before the route change; the final test loaded the dependency, existing four-seat controls and the negotiation module successfully. This is module compatibility, not a new RIMT UI acceptance test. Room opt-in, authenticated role commands, durable timers/restore validation, multi-board public state/history and native proposal/decision controls are the next integration work. No live installation or owner data changed in this stage.


## Durable room and authenticated HTTP integration — fixture-gated

The room adapter now binds negotiation to signed-in seated accounts and the current hand. Suggest/decide endpoints require the local Origin, JSON, seat bearer token and matching account cookie. Actor, stale-hand, extra payout fields and unknown adapter operations are rejected. The ordinary betting clock stops during negotiation. Public state exposes roles, choice, phase and deadlines while excluding the private base hand, remaining deck, allocation plans and future boards. Completed history retains all runout boards.

Private checkpoints validate the original pending hand and every explicit allocation plan against engine completion. A failed final write rolls the whole in-memory operation back; retry cannot double-credit or append another result. Room-file reopen and actual HTTP server-process restart are tested both after proposal and after completion. Deadline expiry resolves once under the documented local one-board fallback.

Seven targeted suites pass: rimt-room, rimt-http, rimt-hand, rimt-negotiation, room-live-pots, game-clock-room and spin-insurance-entry. The HTTP fixture has unequal all-ins and a folded contribution, a 104-chip contested pot and a 70-chip return; three boards preserve the 290-chip bankroll. Tests use temporary files and processes, never owner balances.

This remains fixture-gated source work, not a live release or browser gameplay claim. No ordinary room arming route, native equity-role calculation, owner opt-in or proposal/decision UI exists yet. Native burn order, odd-chip allocation and timeout defaults remain unverified.


## Recovered parent-panel geometry and server role boundary

Selected installed-client exports AllinMomentBaseView, RimtInformation and AllinRimtPlayerState now establish the panel parent rather than inferring its placement from child coordinates. AllinMomentBaseView.draw positions its container at viewport width minus content width minus 3. Its vertical coordinate is 1200 minus (45 plus content height) minus 2; this is a native 1200-unit design space, not a CSS viewport-height formula. For the recovered 640 by 295 RIMT content, the parent starts at y=858 and content starts at y=903. The title uses table atlas 92, 394 by 52, with label x13/y5, 270 by 44, size30 and color0xFAA700. Content starts 45 units below the title and uses nine-patch table atlas93. The optional close button uses atlas94 at325/15; its existence in the base does not prove that each RIMT subclass enables closing.

Entry and exit tween the container by 500 vertical units and alpha between zero and one over 0.4 seconds with Ease.easeOut when motion is enabled, zero duration otherwise. These are static tween parameters, not measured native frame or speaker timing. Hiding kills the container tween.

RimtInformation uses atlas96 at28/25, a 560-wide progress bar at0/1 and the MobileAIMDescription label at85/18, 458 by60, font28, gray0x999999, left-aligned and autoscaled. AllinRimtPlayerState has a 500 by200 design viewport, 450-wide progress bar at y140, 30-unit nickname/behavior text at y21 and a bold40-unit state label at20/59 sized462 by44. Its viewport height becomes140 without the progress bar and200 with it. The progress tween decreases rate from1 to0; no decision callback is installed there.

Re-reading callbacks4068 and4070 confirms that proposer and decider identities arrive as UnderdogId and FavoriteId. The inspected client classes do not establish the server equity algorithm or equal-equity tie policy. A seat-order guess must not be described as recovered native behavior. This boundary is still open for normal-room activation; the authenticated backend fixture deliberately supplies explicit roles. Source hashes and asserted expressions are retained in .git/danslab-qa/rimt-panel-source.json. No native account action or GUI activation occurred.


## Exact private panel artwork recovered

TableButtonTheme confirms GREEN_H170 uses table70/71/72, GRAY_H64 uses73/74/75 and GREEN_H64 uses85/86/87 for up/over/down. Selected parent assets are table92(title),93(body),94(close) and96(information). tools/extract-rimt.py reuses the existing desktop atlas extraction pattern: strict integer bounds, unrotated frame-only crop, exact RGBA readback and refusal to overwrite differing outputs. Native StageAssets frame handling is preserved; no unrelated spriteSourceSize padding is synthesized.

Thirteen private PNGs were extracted, totaling9,944bytes. Title source is74x52, body40x40, close24x22, info43x43; button sources are40x170 or40x64 and require the native nine-patch scaling contract. Re-running extraction passes with byte-identical outputs. Source/asset hashes and dimensions are retained privately in home-art/rea/rimt-art.json. These extracted assets are not committed or installed live; only the reproducible script is tracked. No panel UI or gameplay activation is claimed by this extraction. System Python lacked Pillow; the existing capcut-tools Python environment supplied it without any installation.


## Connected role-only browser panel — seeded-hand acceptance

The table now installs rimt-panel.mjs and feeds it authoritative room state. A pending proposal offers one/two/three to the designated proposer; a pending response offers Yes/No only to the decider. Each command carries the displayed hand number and selected value to the authenticated room endpoint. In-flight commands disable all buttons, failed requests leave choices available for retry, and deadline expiry disables choices without a client-side automatic agreement. Spectators, other seats, stale hand identities and finished negotiations do not display actionable controls. Polling preserves the existing DOM controls; remounting derives the pending phase from server state.

The panel uses the thirteen recovered private images with the source-derived nine-patch center slices, child positions, 640x295 content, 45-unit title offset, right3/bottom2 placement in the1700x1200 table design space and400ms entrance displacement500. Native language keys are attached to title, choices, question, Yes/No and information text. The English information text is the actual catalog entry: No extra rake. Give it a try! The earlier standalone browser test caught inherited section padding increasing total height; the panel now explicitly resets that style.

A muted headless browser test checks all thirteen image decodes, trusted pointer selection, measured850px-wide parent geometry (x528.5/y429/width320/height170), stable nodes, in-flight double-click exclusion, retry, decision command, spectator hiding and deadline disabling without automatic action. A separate test opens four isolated authenticated browser sessions against a real ephemeral server, seeds the validated pending all-in fixture, submits three runs through actual table controls, restarts the server and reloads the decider, then accepts through its actual pointer control. All three board records are produced, the70-chip unmatched contribution returns once and all290chips remain. A second server restart/reload preserves the saved bytes and does not replay payment.

This proves connected panel commands and recovery, not ordinary-game activation or full RIMT presentation. The test deliberately seeds the pending hand; normal owner opt-in/role selection, all-board rendering/award choreography, native progress-bar artwork, full translated proposal composition, exit tween, RIMT hotkey wiring and physical visual/audio comparison remain open. No live installation or owner data changed.

Ordinary-table regression after panel integration: one browser plus five computers completed two hands, independently checked payouts, carried balances and rotated the button, retained720chips, reconnected and released the seat. The pending panel uses a single deadline timer rather than a perpetual animation-frame polling loop. All tests remained muted/headless and used isolated data.


## Multiple-board final-state display and independent per-run payout checks

New selected exports CommunityCardPosition, CommunityCardView3D and OnCommunityCards were cross-checked with the retained TableSetting and TableMediator. TableSetting establishes center850/562, scale1.148 and horizontal card distance144. Two runs use105-unit vertical steps, placing centers at457/562; three runs use72-unit steps, placing centers at418/490/562. CommunityCardView3D moves each completed river row to its indexed position over0.4seconds. TableMediator waits0.3seconds before that river check. These static parameters do not prove the complete operator callback timeline. Source hashes are retained in .git/danslab-qa/rimt-board-source.json.

The table previously displayed only the first board even though all board results were settled and saved. It now renders all final runout rows using the shared card renderer and recovered vertical positions, with the same card-layer pivot358/93 and native card sizing. The duplicate single-board row is hidden while multiple rows exist and restored on ordinary hands. Aggregate-winner focus based solely on board1 is disabled for these rows, avoiding incorrect dimming when different boards have different winners.

The four-session authenticated browser fixture now runs separately for two and three boards. It verifies every rendered card against server state through its accessible rank/suit label and measures each row center in native design units. An independent evaluator ranks each eligible player on each board, allocates each explicit pot portion including tied odd chips clockwise after the button, and compares every per-board payout and the aggregate against the server. Both variants preserve290chips, return the unmatched70once, survive proposal restart and retain all rows after final restart/reload. The browser test first failed because the rows were absent; after implementation it detected that card identity must be read from actual accessible labels rather than a nonexistent test dataset.

This implements final-state display only. Row-by-row deal/movement, active-board focus, per-run chip awards and audio scheduling still require integration; the current aggregate award renderer must not be described as native RIMT choreography. Normal-game activation remains disabled, and no live release or owner-data writes occurred.

Ordinary owner-plus-five-computers regression also passes after the multiple-row renderer change: two hands, independent payout oracle, button/blind progression,720-chip conservation, reconnect and release. Next choreography evidence seed: retained OnWinners reads the server-supplied Delay and adds1second only for normal Holdem with data.IsOnRIMT. Bomb-pot overrides are separate branches and must not be applied to ordinary Holdem. The actual supplied delay remains unknown.


## Native winner traversal and per-run chip award integration

Retained TableAnimator.showMultiBoardWinners establishes run-major, pot-minor traversal: finish all pots of run0 before advancing to run1 and then run2. For pot0 of a run, it calls showWin for that run/pot winners and focuses that board; movePotToWinners uses getWinnersAt(run,pot), hides WIN after the pot callback and advances to the next pot/run. Missing winner groups are skipped. The move duration uses TableWinners.delay divided by potLength; potLength is the last pot index plus1, not the number of run/pot groups. Normal Holdem RIMT adds1second to the operator-supplied Delay in OnWinners. The local renderer retains its explicitly provisional2second budget plus that recovered1second for RIMT; the supplied native Delay has not been observed.

The old retained player-source TableMediator.showWinners contains a decompiler timeout stub. The already-retained shuffle-source version has a complete method and confirms dispatch to showMultiBoardWinners when isOnRimt is set. Its source hash is preserved separately rather than treating the timeout stub as valid implementation evidence. No repeated whole-client export was needed.

A newly selected TableWinners export resolves a display-only detail: updateEarnedAmount splits each pot into chip-unit portions and adds the remainder to run0. It splits each displayed board portion among tied winners and adds that display remainder to the winner with the largest actual earnedAmount. This is explicitly earnedAmountOnDisplay; callback earnedAmount remains separate. It does not establish the actual server inter-board allocation or replace the existing explicit allocation input. For example,104 display chips over3runs with unit1 gives36/34/34; the isolated engine fixture still deliberately supplies35/35/34. Do not claim those policies are identical.

The local renderer now creates a separate chip award per positive per-board/per-pot share, preserves its actual stored amount, and assigns sequential stage IDs independent of the pot index. Completion credits only that share and releases the next stage after all tied winner shares of the current stage finish. RIMT WIN is created for pot0 winners of the current run and removed after each group. Cues are deduplicated per stage rather than per pot, so later boards using pot0 retain their own cue. The reduced-motion transition derives remaining cue groups from actual award nodes, including skipped zero groups. Ordinary one-board sequencing uses the same existing path.

Remaining native work includes row-by-row deal/move and active-board focus; current rows show final cards while the award stages run. Local duration, physical timing and native sound playback remain unverified, and ordinary RIMT activation is still disabled. All changes are source-only and tested with isolated fixtures.

Browser acceptance now observes actual award-node creation, animation starts and completion credits for2/3runs. It compares each share to the independent board evaluator, checks that the next run waits for the preceding local3second stage, verifies current-run WIN seats, decodes one WinPot source per stage and checks final displayed balances. The ordinary three-pot regression retains three sequential cues, exact intermediate credits, WIN removal and112-chip restart conservation. Completion-credit sampling is scheduled after the browser event dispatch; an earlier capture/microtask probe sampled before the target handler and was corrected rather than treating pre-credit observations as a game-state failure.


## Common-prefix display correction and reduced-motion transition

Tracing PlayInfo.addCommunityCard/getCommunityCard through CommunityCardInfo and MotionView3D.throwCommunityCard resolves a distinction that the earlier full-board final display did not cover. PlayInfo stores shared community cards separately from each run tail and concatenates them for hand evaluation. CommunityCardInfo start/end indices locate the newly delivered cards within that combined board. MotionView3D routes only those new cards into the indexed RIMT CommunityCard3D slots. The ordinary community-card instance remains separate from three run-row instances. Thus a previously dealt flop/turn remains visible once at the ordinary row while only the remaining indexed slots appear in multiple rows. Full repeated five-card rows are appropriate only when there was no shared prefix.

The public RIMT projection now includes sharedCount, derived from the private validated pending base board; no private cards/deck are added. The renderer keeps that common prefix in the ordinary row, reserves its empty slots in each run row and displays each tail at the native row position. It suppresses the old single-board animation path for multiple runs instead of applying future-card indices to a shortened common row. Final per-run data/history and all settlement amounts remain unchanged.

In the isolated engine seed, the shared-flop fixture reaches the flop through raise8/call/fold before unequal all-ins; the shared-turn fixture also checks through the flop before the all-ins. Both preserve contributions50/120/4, contested104, unmatched70 and total290. Browser checks compare prefix labels once, tail labels per row, total visible card count, native row centers, independent per-run awards and process-restart recovery. The original preflop fixture remains a separate regression.

A dedicated reduced-motion transition test switches preference after the first real award starts. It checks removal of every remaining award, final displayed balances, all remaining per-stage decoded cues exactly once, no WIN leftovers and no new award/audio when normal motion is restored. This verifies the local preference transition, not physical native timing or initial reduced-motion RIMT playback. Sequential board dealing/focus and ordinary hosted activation remain open.


## Sequential RIMT row dealing and payout barrier

showdownPlan now retains the ordinary one-board plan unchanged and adds an explicit timeline for each of two/three runs. Each continuation is dealt at the ordinary562-center row, then its completed river waits300ms and moves to its indexed native row over400ms before the next run begins. A group throw takes the recovered nominal200ms, and a fresh flop spreads over300ms. Common-prefix slots remain empty in the run rows. The final row completion becomes the chip-award barrier, so no run payout starts while a later board is still being dealt. The existing reveal clock and nominal speed ratio1 are local timing composition; extra operator callback gaps and actual native runtime speed remain unknown.

The renderer reuses actual card artwork, throw path, flop spread and board cue handling for each run, with run/index identities preventing later streets from losing their cue to earlier runs. Run rows use the recovered400ms easeOut movement from562 to their final center. A reconnect receives only the completed static state and does not replay this fresh-hand plan. Reduced-motion preference removes row/card/throw effects and finishes pending awards through the existing once-only path.

The pure presentation fixture independently asserts the preflop/shared-flop/shared-turn2/3run clock,300ms river pauses,400ms movements and final payout barrier; the legacy showdown-plan suite still passes without changed ordinary plan shapes. Browser acceptance samples each real row animation at0/200/400ms, checks its nominal delay and native coordinates, observes ordered per-run street cues and verifies that the first payout starts only after the last river wait/move. Per-board rank/payout, intermediate credits, WIN, decoded payment cues,290-chip conservation and restart checks remain part of the same acceptance flow. Native physical frame/audio parity and active-board winner focus remain open.

SoundItem and MotionView3D distinguish SOUND_BOARD_FLOP (SoundBoardFlop) from SOUND_BOARD. The former was embedded in IronDesktop.swf rather than present as an external sounds file. The existing named DefineSound extractor now supports --board with pinned symbol/rate/sample checks. Character89 yields27,648samples at44,100Hz,20,190MP3bytes, SHA2564d9164d7ba2d17491683f3f2730f1fc55b9e3b9363435c9a5f1f826d8c23214b. The private extracted file is home-art/BoardFlop.mp3; it is not committed. RIMT fresh flops use this clip through the table audio channel with the native sample-duration cap; turn/river keep Board. The local-only sound allowlist serves it from private reference art. Browser signature probes independently decode both actual clips and distinguish the emitted sources for every normal-motion RIMT street. Existing ordinary table-cue selection is unchanged in this stage.


## Active-run focus, native brightness and easing

CommunityCardView3D.focusToMultiBoardCommunityCard is called at the main pot of each Holdem run. It makes the active row undimmed, lifts it30units over400ms with Ease.easeInOut unless it is the final row, waits2seconds after the lift and returns it over400ms with Ease.easeOut. The last row has zero lift. Other rows receive dimAlpha0.6 and return to their indexed base positions. Common-prefix cards in the separate ordinary row are not part of this method.

Tracing CommunityCard3D.setCardsDim into Card3D.setDim resolves the actual brightness: any positive dim request selects0.6 brightness; zero selects1. This is not a black-overlay alpha conversion to0.4. Ease.easeInOut combines half cubic easeIn with half cubic easeOut. The local focus uses equivalent segmented keyframes at0/200/400/2400/2800ms. It cancels prior focus motions, preserves current offsets when switching and stores the focused run identity so incidental table redraws retain the same dim selection.

RIMT main-pot award start now activates this focus alongside that run WIN. Remaining shares keep their existing callback-based credits and sound ordering. A completed/reloaded hand renders the final nonempty main-pot run as bright with other run rows dimmed, without replaying focus. New-hand/reset and reduced-motion paths cancel focus animations; detached award events cannot create a late focus or cue after removal.

Browser acceptance first failed because row filters were absent. It now records the actual row focus at each award start and samples eight points:0/100/200/300/400/2400/2600/2800ms. Checks cover exact cubic lift/hold/return, native row base coordinates, last-row no-lift behavior and computed1/0.6 brightness, together with per-run WIN, payment cues and intermediate credits. Restart and motion-preference restoration check that no focus animation is replayed. Native physical visual/audio parity and ordinary hosted activation remain open.


## Owner opt-in and ordinary-hand activation — explicit local practice policies

The owner form now offers Run It Multiple Times for Holdem cash tables. The server rejects nonboolean values and unsupported formats and locks changes while a table is occupied. The flag persists in table/room settings. Existing tables default to ordinary play. A cash hand arms the runout boundary only when every active participant is a signed-in human; computer/guest hands continue ordinary one-board play in this stage. This boundary is explicit and is not a recovered native eligibility rule.

When an eligible played hand reaches the existing two-active-player all-in pause, the server computes exact heads-up equity from those two hole hands and the shared board. It enumerates every completion from52cards excluding only those known cards, without inspecting the actual private deck order, folded hands or hidden burns. The lower win count proposes; ties use the first eligible seat clockwise after the button. Both choices have15seconds. Each contested pot is split into whole-chip portions with any remainder assigned to the first run, matching the recovered display convention as an explicit local financial policy. Actual native server policies for these decisions remain unknown.

engine/rimt-equity.mjs uses a rank/suit bit-mask seven-card score only for role selection; it does not replace the game's payout evaluator. The existing reference evaluator measured145ms for10,000seven-card evaluations, implying about50seconds for a preflop role calculation. The new evaluator checks all1,712,304possible boards for two preflop hands in about121–127ms in observed local runs. These are measurements of this Mac and fixture, not a server-load guarantee. Unit verification covers every rank category,10,000deterministic independent comparisons against the existing21-subset evaluator, exhaustive flop comparison, a44river turn oracle, reversed-hand symmetry, a tied final board and malformed/duplicate cards.

The normal hosted HTTP test creates an owner table and three authenticated buy-ins50/120/120, starts the hand and executes call/all-in/fold/call through normal room actions. No hand/cards/checkpoint are injected. The server creates the negotiation, persists its proposal across process restart and completes three runs with explicit36/34/34portions of the104chip contested pot. The unmatched70returns once, all290chips remain and repeated acceptance after another restart leaves saved bytes unchanged.

The normal browser test saves this flag using the actual owner form, opens separate signed-in sessions, starts a six-seat table with three players and uses trusted pointer actions for the full unequal-all-in/fold hand and RIMT choices. Account creation and initial buy-in setup use test API calls; the test is not a fresh login/lobby acceptance claim. It reuses the independent payout, row animation/focus, decoded Board/BoardFlop/WinPot, intermediate-credit and restart checks. The fourth session observes rather than occupies a seat. All files/accounts/processes are ephemeral; no live owner configuration, balances or native account changed.

Additional activation checks: a tied preflop pair-vs-pair fixture verifies clockwise proposer selection after the dealer,15second deadlines and first-run remainder allocation; frozen equity inputs remain unchanged. The ordinary hosted HTTP test also verifies available wallets9950/9880/9880 plus290table chips equal the original30000play chips. Existing owner API/room privacy/action-clock tests and the ordinary one-browser-plus-five-computers two-hand720-chip/reconnect/release regression pass. This does not claim RIMT negotiations with bots.


## Verified PR127 release

PR127 is merged at5d86d42e10c32c479ad188b873f10ba5967a28cc; its tree equals tested sourcecd9323462297e5e223b28cbe4012765141d424d5. Forty-two exact-head checks passed before qa-record/qa-check and expected-head merge. They include85runtime-file and1238private-art-file manifests, all installed module syntax, source engine/config/privacy/clock assertions, actual installed owner-form RIMT gameplay without a seeded hand, staged and reduced-motion fixtures, independent payout/audio/credit checks, ordinary three-pot and five-bot gameplay and an insured Spin tournament after restart. A separate installed check verifies that an RIMT-enabled table with five bots completes ordinary one-board play without hanging on negotiation.

The guarded rollout verified idle live rooms/tournaments, saved the previous service definition and all six owner files, froze the service and rechecked unchanged data before switching to the tested runtime/art snapshot. PID2099became27952. All six owner files (15496bytes) remained byte-identical. No live gameplay, balance, grant or table-configuration writes were performed. Player, owner and catalog endpoints returned200; owner HTML contains the RIMT control and served code/art/audio bytes match the immutable installed snapshots. Backup is retained privately under .local/state/playgg-rollouts/pr127-emq2etei. Previous runtime/art snapshots remain preserved.

Generated storage for this release is1024099runtime bytes plus190731576private-art bytes and the small owner/service backup. The new private-art snapshot adds13RIMT PNGs and BoardFlop audio; a generated local review capture also differs from the previous snapshot. No source checkout, dependency installation, cleanup or foreground app activation was performed. Full native parity, bot/guest RIMT negotiation and the broader FEATURES checklist remain open.


## Local computer negotiation policy

Signed-in humans and trusted locally created computers can now participate in the armed cash-hand path. A computer is eligible only with the server-created bot flag and a valid32hex-character note identity. Anonymous guest seats remain excluded. Public choice endpoints still require an authenticated human account matching its seated token; no public bot-command route was added.

Computers suggest two runs when they are proposer and accept a proposal when they are decider, no sooner than500ms after phase creation. The policy is local practice behavior, not native GGPoker AI. The ordinary trusted room timer/state/watch path first resolves deadline expiry, then applies at most one eligible computer choice. Phase timestamps are already durable in the existing hand-bound decision, so no separate volatile bot queue or timer state is introduced. A human can still choose one/two/three or refuse a computer proposal. Both-computer negotiations advance in two separate phases.

Unit checks cover trusted identities,500ms boundaries, human choices/refusal, both-computer JSON restoration, deadline precedence and once-only settlement. Real room-file tests inject proposal and final-write failures: saved bytes remain unchanged, memory rolls back, reopening/retrying completes once, one result is recorded and290chips remain. The fixture preserves the preexisting action-version invariant rather than weakening checkpoint validation.

HTTP and single-browser/five-computer tests exercise both role directions. They create a real six-seat table, seat one authenticated human with50chips and fill five computers with120each. Only initial hole cards/deck are seeded before any action, ensuring one computer calls the human all-in and the other four fold; no pending negotiation/result is injected. Normal computer betting leads to a116chip pot from two50contributions and four folded4contributions, with650total table chips. The bot-proposer case runs twice with human acceptance; the human-proposer case runs three times with automatic bot acceptance, including a server restart during the pending decision. Independent ranks verify every per-run payout. Browser checks also verify decoded payment cues, displayed final balances, absence of WIN leftovers and final restart with no replay. The human wallet remains9950available; bot practice chips are existing local computer stakes.

The graphics, row motion, focus and card/audio paths reuse the previously recovered native RIMT presentation. Native server-policy/physical parity and guest participation remain separate open items.

## RIMT keyboard integration — 14 November 2026

Native HotKey.as registers RUN_IT_ONCE, RUN_IT_TWICE and RUN_IT_THREE_TIMES as OPTION actions without default key-code arguments. The local registry now exposes all three under Options, unassigned by default. Existing settings handle assignment, conflicts, persistence and category enablement. The table dispatcher clicks only a visible, enabled proposer button; it does not assign Yes/No shortcuts. Master/category switches, input focus, modal guards and key-repeat suppression remain shared with other hotkeys. Browser verification uses a disposable pending-hand fixture, not the owner account. This does not establish native seated layout or physical keyboard timing parity.

## Decision label reconstruction — 14 November 2026

RimtDecideView creates three labels at content y33, height40 and font30: nickname white, MobileAimWantsTo gray11711154, proposal gold16426752. updateLayout centers their combined widths with two5-unit gaps. The local decision panel now uses separate text nodes/spans with these colors, height and spacing. Text remains escaped through textContent; overlong local nicknames shrink/ellipsis instead of covering the fixed decision controls. Native account-type nickname colors/bold and exact Flash glyph shaping remain unverified. A rendered850px panel test checks the three colors,16.5px content offset,20px height and2.5px gaps alongside existing role/busy/retry/deadline tests.

## RIMT deadline progress — 14 November 2026

Recovered AllinMomentsProgressBar uses desktop table95 as a nine-patch450×12 background; table205 starts at1/1 and rate sets its width to448×rate. RimtInformation positions the bar at0/1 and sets its container width560. The initial450-wide fill at x1 gives451-wide display bounds; local horizontal scale560/451 is derived from that source layout (physical native output remains unmeasured). Original PNG frames20×12 and450×10 are extracted by tools/extract-rimt.py --progress with exact RGBA readback and private hashes; no substitute gradients. The inspected suggest/decide callers tween rate1→0 and do not switch to red.

The room public projection now exposes only the current phase startedAt (createdAt or proposedAt), alongside its existing deadline. No future cards or allocations are exposed. The panel reconstructs elapsed time from those durable timestamps, reuses its linear animation during polling, clamps expiry, cancels on hide/destroy and never accepts a choice automatically. Missing/invalid timing renders empty. Headless panel tests sample full/half/empty widths, geometry, stable animation identity and half-consumed reconstruction; room and HTTP tests verify restart/privacy/phase clocks. Flash tween scheduler and physical frame timing remain unverified.

## Observer announcement reconstruction — 14 November 2026

Status at source recovery: recovered and traced, with observer UI initially absent. The implementation checkpoint below supersedes that implementation status; actor choice controls remain separate from the announcement.

TableMediator calls AllinMomentsAnnounceView.update on each RIMT callback, passing PlayInfo.userIsDeciding. That getter is the local player's isDeciding, which includes ASKING_FOR_RIMT_SUGGEST, ASKING_FOR_RIMT and ASKING_FOR_AII. The announcement removes the active player's own cell and fades out globally while the viewer is deciding. Observers, folded participants and the other pending participant otherwise receive the announcement; this does not expose private cards.

| Native state | Displayed player | Behavior key | State key | Progress |
|---|---|---|---|---|
| ASKING_FOR_RIMT_SUGGEST | Proposer | MobileAimDecidingOn | MobileDealChoice | Asking duration |
| RIMT_SUGGESTED | Proposer | Empty | MobileAimDecided | Hidden |
| ASKING_FOR_RIMT | Decider | MobileAimDecidingOn | Opponent's rimtTypeKey | Asking duration |
| RIMT_DECIDED, proposal once | Proposer | MobileAimWantsTo | Proposer's rimtTypeKey | Hidden |
| RIMT_DECIDED, matching multi-run result | Decider | MobileAimAgreesTo | Proposer's rimtTypeKey | Hidden |
| RIMT_DECIDED, differing multi-run result | Decider | MobileAimRejects | Proposer's rimtTypeKey | Hidden |

The native callbacks are distinct events. The local durable model can project pending suggest/decide, once/agreed/declined, but has no durable intermediate RIMT_SUGGESTED broadcast window. Local conservative timeout must not be falsely labeled as a human rejection. Final announcement removal/reset must follow hand lifecycle rather than replaying a new event on reconnect. Exact native operator callback gaps remain unknown.

AllinRimtPlayerState has a500×200 viewport while progress is visible and500×140 otherwise. SAllinPlayerState uses desktop common145, a30×30 atlas frame with explicit Rectangle(10,10,10,10) nine-patch. The parent's table93 body is hidden; there is no title. Nickname and gray behavior labels use font30,height40,y21, centered together with15 units gap. Gold bold state uses font40,x20,y59,width462,height44. Progress is at y140; initial x is (500 - initial bar width) >> 1, then its width is set450. This differs from the actor panel's560-wide information bar.

AllinMomentsAnnounceView.align adds2 units after each attached cell. With only the RIMT cell attached, content height is202 pending or142 final. AllinMomentBaseView retains its45-unit content offset even without a title, aligns right at viewport.width-(500+3), and positions the container at1200-(45+contentHeight)-2. Therefore content begins at table x1197,y996 pending or y1056 final in the1700×1200 reference. These are source-derived coordinates, not a physical native screenshot measurement. Fade uses the shared400ms easeOut/500-unit vertical offset; reduced/native motion mode can disable it.

Recovered sources: AllinMomentsAnnounceView SHA256 2bce67f9f9f5c3729903a557006949a64af9e5f84ea2506187adc5d66820fedb; SAllinPlayerState SHA256 67069ac335343ebf4d27ab8eddd7d977f2f6150d5c9c159a55c06dd29063abdc. Private files are under Sandbox/rea-tools/rimt-observer-source; source bytes are not committed. Atlas metadata confirms common0145 at578/3895,30×30,not rotated in init_lobby/desktop_assets. No real-account action, GUI activation or speaker playback was used.

Implementation acceptance: every viewer role and phase; native frame/colors/geometry; no actor-choice controls in observer panel; same durable countdown without reset; correct once/agreed/declined identity; no invented timeout refusal; hide/reset on new hand; reconnect without new sound/reaction; full hosted payout/restart regression. Dynamic emoji reactions are a separate source-backed gap and must retain mute/skip-render/filter rules.

Observer implementation checkpoint: local observer/folded/nonactor viewers now receive the separate source-backed500×200 pending or500×140 final panel, exact common145 atlas frame, native translation keys, actor identity and durable countdown. Active actors retain only their choice panel. Once/agreed/declined messages use the named proposer/decider, timeout stays unlabeled as human refusal, and old-hand/reset/destroy removes the announcement and its animations. No audio, emoji or game mutation is introduced by the announcement. Standalone browser tests cover geometry, role privacy, native labels, stable countdown, final reasons, timeout and hand reset; hosted multiplayer regression exercises ordinary betting/keyboard proposal/payout/restart. Intermediate callback-only suggested state and dynamic emoji reactions remain open.

Observer release review correction: AllinMomentBaseView.fadeIn applies the500-unit entry offset only while hidden. The local observer now measures its current position before phase layout changes and animates from that position to the new target; pending→final moves60source units instead of replaying the entry. A RED/GREEN850px browser assertion verifies the initial−30px transition. Reduced motion remains immediate. Full native frame-by-frame trajectory and fade-out are still unverified.

Observer exit implementation: the announcement now follows the source400ms easeOut downward500-unit/opacity0 exit when its role or hand no longer applies. It is inert and aria-hidden immediately; its countdown is canceled. Repeated polling does not restart the exit. Returning visibility cancels the old exit and clears its stale hide callback; reduced motion hides immediately; destroy cancels/removes all animations. Standalone browser tests cover exit duration, inert state, completion, interrupted return and reduced mode. This change applies to the observer announcement; the actor choice panel still hides immediately. Native physical frame comparison remains unverified.

Actor exit integration: both actor and observer panels now reuse the same source400ms easeOut/500-unit exit. Actor buttons become disabled, inert and aria-hidden immediately; server hand/role checks remain unchanged. Countdown and deadline timer stop on dismissal; repeated snapshots do not restart the exit. Reopening cancels the pending exit and restores interaction only through the normal current-role/deadline render. The standalone browser RED/GREEN gate now verifies actor deferred hiding and immediate disabled controls as well as observer midpoint/return/reduced/destroy behavior. This supersedes the previous actor-immediate-hide limit; native physical timing and shared entry/exit interruption trajectories remain unverified.
