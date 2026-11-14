# Run It Multiple Times — recovered native contract

Status: the negotiation and pot helpers are connected to an explicitly armed hand-engine path and tested there. Hosted room persistence and public controls are not connected; the live app still settles one board. No RIMT button, negotiation or multi-board payout is represented as implemented. Fifteen selected classes were recovered with the installed FFDec; source bytes and hashes remain private in Sandbox and Git QA metadata. No native account action, bet or GUI activation was performed.

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
