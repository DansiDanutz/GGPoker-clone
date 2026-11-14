# Run It Multiple Times — recovered native contract

Status: source investigation only. The local app still settles one board. No RIMT button, negotiation or multi-board payout is represented as implemented. Fifteen selected classes were recovered with the installed FFDec; source bytes and hashes remain private in Sandbox and Git QA metadata. No native account action, bet or GUI activation was performed.

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
