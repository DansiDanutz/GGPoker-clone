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

A real local player-report feature needs authenticated event/target membership, self-report rejection, expected-viewer binding, bounded reason/detail validation, a distinct durable report kind without invented hand cards, atomic save/restart/idempotence and owner-only review rendering that understands that kind. The UI then needs capability-driven More visibility, the actual single-player reporting flow, error/retry handling and a receipt visible in the owner's console. Source recovery is complete for the contract above; this new local backend/UI path is not implemented yet. External partner/live-stream links are excluded from the user's requested scope.
