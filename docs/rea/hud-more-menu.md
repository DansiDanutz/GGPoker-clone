# Smart HUD More menu and player reports

This records selected decompiled client behavior, not completed local functionality. SHA-256 identities are in battle-hud-source.json. The installed app and its real-money account were not operated; no report was sent to an external service.

## What is visible

SmartHudMoreMenu registers nickname history, video-call blocking and reporting in that order. History is explicitly hidden by setHistory. Video call is visible only for another player's HUD while Account.current.snapCamEnabled is true. Report is visible only when the HUD player has useReport and their nickname differs from the viewer's. hasVisibleMenu is the union of video/report eligibility; SmartHudView hides both More and its divider when that union is false. It refreshes the condition when video status changes. An unconditional three-item menu would therefore be incorrect.

SnapCam block state comes from SnapCamBlockManager for target alias and VIP-junket scope; clicking toggles the button's state and emits CLICK_MORE_MENU_VIDEO_CALL. That does not establish an independent local camera protocol, media permissions or cross-device transport. No nonfunctional camera control is added to the local app.

## Appearance and dismissal

The menu is211px wide with layered rounded black/#404040/#17171795% fills at0/1/2px inset. Visible items begin atx20,y14 and advance32px; final height is19+32×visible-count. MoreMenuButton uses14px text#eeeeee atx26,y0,height22 and default width118; Report expands label width156 and uses table_popup216 aticony2. The trigger uses lobby_popup367. SmartHudView anchors the menu atx139,y0 in its More container; its inner header places the trigger to the left of a divider atx316. These are content coordinates, not evidence of an OS title-bar drag control.

The trigger toggles the menu. ReleaseOutSide dismisses it, and hide removes the menu from its parent and outside-release registration. Refresh resets trigger activation. The source does not justify keeping the menu visible after authentication or target change.

## Player report flow

SmartHudView emits OPEN_FAIRPLAY_REPORT_POPUP with target fairplayData, tableId (HUD field, falling back to player's tableId) and location2. SmartHudWindowMediator forwards SET_FAIRPLAY_REPORT_POPUP and closes the HUD. The report window uses a selected-player list, a service-supplied reason catalog and details. Submission requires at least one selected player and a selected reason. With handInfo it emits a prefixed clientHandHistoryId; without a hand it emits an empty string. ReportLocation, tableId, reporter, reported targets, reason, detail and nicknames are separate fields in FairplayReportVo.

The reason dropdown uses ReportTypesData, localized language rows and an English fallback, with tournament-category filtering. A cached hand-report category list alone does not establish every allowed native profile-report reason. SendFairplayReportCommand calls the API gateway, shows loading and handles429 (too many) and409 (already reported) separately. Its generic remaining-status completion branch is not proof of server success and should not be copied into the independent backend without normal HTTP success validation. The operator's actual deduplication/rate limits and permissions remain unknown.

## Local implementation boundary

The existing local saveHandReport requires a participating, reportable hand within30hours, validates other dealt seats, stores the immutable hand and exposes it to the owner review console. It must not receive a fabricated hand to represent a HUD-only report. Battle event members may not share a recorded hand, so that shortcut would create false evidence and break the report model.

A real local player-report feature needs authenticated actor and actual event-target membership, self-report rejection, expected-viewer binding, bounded reason/detail validation, a distinct durable report kind without invented hand cards, atomic save/restart/idempotence and owner-only review rendering that understands that kind. The UI then needs capability-driven More visibility, the actual single-player reporting flow, error/retry handling and a receipt visible in the owner's console. Source recovery establishes the contract above; the local backend and player form are described below. External partner/live-stream links are excluded from the user's requested scope.

## Local profile-report backend and owner review

The backend now exposes authenticated GET/POST `/api/battle/<event>/player-report?player=<canonical target>`. The target must actually belong to the event; any signed-in local observer may report another player. Self-report is rejected. POST accepts only viewer/category/detail; viewer must still match the authenticated cookie. Categories reuse the explicit local Fair Play catalog, excluding tournament Bum Hunting. This is local operator policy, not proof of the native service's current catalog, eligibility, rate limits or deduplication window.

A strict `kind:profile` record stores event ID/name, canonical reporter/target, local reason/detail, timestamp and review state. It has no hand, room, card or hand-number fields. Exact normalized submissions are idempotent via a content-bound receipt. The shared note store atomically persists both profile and legacy hand reports; private-note/label writes preserve both. Unknown/corrupted kinds fail closed. Existing pre-profile runtime readers cannot read this new record kind, so recovery must retain a compatible runtime rather than discard reports.

The owner-only report console renders the target and event with an explicit No hand attached context, and uses its existing review controls. It does not send reports to GGPoker or an external service. HTTP tests cover guest denial, actual target, self/expected-viewer/origin/query/UTF8/body validation,1000CJK characters, owner-only review, restart and backup restoration. The restore-active-registration guard is tested before the fixture cancels its test registrations and restores the snapshot. Model tests mix real legacy hand records, notes and label edits with profile records, inject atomic-write failure and verify exact receipt behavior and unchanged game bytes. A muted browser uses the actual owner Load/Save buttons and verifies literal HTML-looking report text remains inert and review survives restart.

The player-facing HUD now exposes More only after authenticated target capability checks. The own-player HUD has no reporting entry. The 20×20 trigger and 19×20 report icon are exact native atlas crops; the one-item menu uses the recovered 211×51 geometry, x139/y40 local placement and Escape/outside dismissal. Report flushes the existing note editor before closing the HUD, then opens the shared Fair Play form with the actual target selected. A fresh capability check and expected-viewer POST bind submission to the signed-in player. Logout/account change closes the private form. Failed submission retains the selected reason and draft for explicit retry.

The form is shared with existing hand-history reporting; profile reporting never invents a hand. A muted headless browser uses real pointer controls for More, reason selection, 503/retry, receipt and owner review; it verifies menu geometry, Escape, logout dismissal, literal HTML-looking detail, restart persistence and unchanged game bytes. The hand-history report regression separately verifies its original targets, category, character limit, private receipt and review. Native seated/OS-window placement, full window skin, physical animation and sound timing remain unverified; this is not a complete visual-parity claim.

## Report and Close button skin

FairplayReportView creates GlobalButton REPORT/GREEN at100,518 and CLOSE/DARK_GRAY at230,518, both110×37. The shared local form now reuses the exact existing desktop common atlas crops and shadow. GlobalButton defaults to19px white condensed text and shadow at−5,+5 with width+10/height+5. Its constructor supplies no hover image; the inherited Button applies RGB multiplier1.3 to the up artwork with a nominal0.2s tween. Native easing remains unverified. Down state uses the native down crop and half-opacity label. Disabled state uses common27 with equal-RGB averaging and half-opacity label, rather than dimming the whole control. Source and reused-art hashes are in hud-more-atlas.json.

The player-profile browser test checks both button positions/sizes, font, shadow geometry, disabled skin/label, enabled green skin, settled hover brightness and immediate press reset, real pointer-down skin/label and release outside without submission before the real error/retry/receipt workflow. These assertions establish source-bound CSS behavior, not physical Mac rendering parity or complete report-window styling.

## DotLabel headings and explanations

The native source uses a DotLabel group at19,10 and19,107; dropdown/details use the same group at19,269 and19,401. Each dot is radius2.5, color#43a1ff, centered at0,10. Titles are14px atx8 with410px width; explanatory copy is13px atx9,y22 in410×51. The shared local form now follows those offsets, restores Who Are You Reporting?/Please select the offending player(s). and Describe what happened. Source English text and its language-table hash are recorded in hud-more-atlas.json.

The native introductory copy promises an operator Security Team investigation; the local form accurately retains local administrator routing. Native ReportLastDays says30days, while the independent existing local hand policy is30hours. The later eligibility audit below resolves the ordinary cutoff against actual client code; the native sublabel/OS chrome remain open. No access to old private hand snapshots was widened.

## Native eligibility and desktop viewports

HandHistoryView.update reads the current Date, calls setHours(getHours() -30), then shows Report only when rawData.StartTime.time is strictly greater than that cutoff and hhdata.user is true. This is30hours in ordinary periods, contradicting the30days English help string. The local30-elapsed-hour policy therefore remains; tests now cover one millisecond inside, exact expiry and future-started rejection as well as receipt idempotence and unchanged game state. Native local-calendar setHours can differ from elapsed-hour subtraction across daylight-saving transitions; that edge and the operator server's independent rules are not established by this client code.

DesktopFairplayReportView explicitly overrides the generic460×590 default with460×610 on initialization/clear, and report() sets380×300 for either outcome. The shared local form now uses those desktop viewport dimensions. Error/complete child button coordinates remain135,108 and135,216 respectively; child constructor defaults are not substituted for the actual desktop container. A browser RED observed590 instead of610; GREEN checks initial460×610 and failed-submit380×300 before retry/review/restart. Local failed-submit draft retry is retained as an explicit usability improvement; the native error close dispatches its close signal.

## Native details editor

NotePad places NoteEditView at8,30 inside the19,401 group. NoteEditView uses table_menu145 as a20×20 nine-slice background, resized420×70; its input is another4,4 inside, with width410 and height70 set by NotePad. The shared local form now uses the exact atlas crop, input12,34 in the group,14px system sans input and#d1d1c0 text. The native placeholder uses#999999. Its counter is13px#666666 and displays length/1000 without spaces. The explicit1000-character limit and multiline input remain. Source/atlas hashes and exact RGBA crop proof are in hud-more-atlas.json reportEditor.

The pointer browser checks geometry, color/font and empty/typed counters, multiline typing, actual1001-character paste clamped to1000 and replacement with literal report text before retry/receipt/review/restart. The external5px scrollbar is implemented below; native line-metric and physical rasterization equivalence remain open. System font rasterization, Flash internal text gutters and exact Unicode/line-count equivalence remain unverified.

## External details scrollbar

A selected export of com.nsus.lib.display.TextScroller confirms that pointer-down immediately centers the thumb under the pointer, then stage-level mouse-move updates scrolling until mouse-up. The NoteEditView subclass uses a black5×70 track, common2758×16 thumb with scale9(3,6,2,2), and hides it when all text fits. NoteEditView.setSize places the track at width−5, so the report group's track is423,30. Source/art hashes and exact RGBA crop receipt are in reportScrollbar in hud-more-atlas.json.

The local shared form now hides the browser's internal scrollbar and renders that external track/native thumb. DOM scrollHeight/clientHeight/scrollTop drive the thumb and pointer mapping; this preserves click/drag/clamp semantics, while native Flash's ceil-to-line behavior and line-dependent thumb measurements remain unverified. Home/End/arrows/pages provide a local accessibility adapter. Pointer/window listeners exist only during a drag and are removed on pointer-up/cancel, blur, submit/outcome and dialog close. A label-default click previously refocused the textarea and jumped back to its caret; preventing that default preserves the chosen scroll position.

Browser checks cover hidden empty/short text, overflow after1000-character paste,5px track and actual5px thumb, click-to-top, drag past the track while pointer is outside, keyboard Home/End, shortening hides it, and logout while dragging with subsequent pointer events/error inspection. The hand-history regression also verifies that a configured table unit shortcut cannot run with the report focused while its underlying modal history is active. This does not establish every independent nonmodal-window hotkey route.
