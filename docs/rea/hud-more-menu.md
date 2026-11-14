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

The form is shared with existing hand-history reporting; profile reporting never invents a hand. A muted headless browser uses real pointer controls for More, reason selection, 503/retry, receipt and owner review; it verifies menu geometry, Escape, logout dismissal, literal HTML-looking detail, restart persistence and unchanged game bytes. The hand-history report regression separately verifies its original targets, category, character limit, private receipt and review. Native seated/OS-window placement, full button skin, physical animation and sound timing remain unverified; this is not a complete visual-parity claim.
