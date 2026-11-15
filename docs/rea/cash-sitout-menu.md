# Cash sit-out menu

## Native evidence and limits

The retained FFDec static exports of SitOutMenuView/SitOutList/MenuItem, SitOutType, SitOutHelper, SitOutCommand, TableHeaderDropdown and EAutoActionFlag establish the menu interior, selection logic and separate hand/blind flags. Source hashes and the original common0301 sprite are retained privately in `cash-sitout-menu-source-audit.json`. SWF is unsupported by the REA native provider; this is the existing static fallback, not observed native execution.

SitOutNextHand is flag2, SitOutNextBlind4 and LeaveTableNextBlind2048. The client forwards these to its private server. Neither those enum names nor the official [hotkey FAQ](https://help.ggpoker.com/article/Hotkeys---Frequently-Asked-Questions) specifies whether the next-blind trigger is small blind or big blind. The implementation does not invent that rule. The two blind-based rows remain disabled and do not issue an operation.

This local cash menu supports the current ordinary cash table and all of the signed-in account's existing ordinary cash tables. Rush/tournaments, future-table reservations, move-table, Squid and native global/leave penalty policy are not established. The released implementation used a plain local header trigger. The source-backed header candidate below replaces its graphic and intrinsic geometry; full native window-header placement remains unverified.

## Appearance and interaction

With move-table and Squid absent, the source has four visible rows. The menu is560logical table units wide and288high. Each508×56row starts at x28,y20 with64-unit pitch. Labels occupy x40,y8,width428,height40,font28 within each row and fit down when needed. The selected32×32checkmark begins at x0,y12; its original common0301bitmap is24×24, verified against desktop atlas rectangle3948/3981/24/24 and scaled as in MenuItem. The existing history-art extractor now includes this shared check sprite.

The outer black2-unit line has radius10; the inner#404040line is2units with radius8 and95%#171717fill. Hover/focus background is#2c2c2c. Normal/selected captions are#eeeeee and disabled captions#666666. The implementation uses the existing1700-unit table transform and anchors the dropdown to its actual trigger. Source table/menu language keys are reused. Cash-specific wording makes the local scope explicit.

Current-table pause and all-cash pause/cancel call the existing authenticated APIs. While a pause is scheduled or active, only its selected row is available for cancellation, following the source selection rule. The source TableHeaderDropdown shows/hides immediately and blocks underlying pointer input. The local menu follows this behavior. The menu closes before dispatch, releases its busy lock on failure and shows the existing table error without optimistic state. Outside pointer press, window blur and hidden document dismiss it. Escape restores the trigger; arrow keys/Home/End navigate available rows. Keyboard navigation is a local accessibility adapter, not a recovered native mapping.

## Persistent scope and recovery

`setCashPause` stores an optional advisory `sitOutAllCash:true` for a global cash request. A current-table request clears this marker. Global pause upgrades an already locally paused table to global scope, so the checked item is accurate after reload/restart; no hand, stack or wallet is changed. Global return clears the pause/scope only where returning is allowed, retaining the existing low-stack funding flow.

Legacy snapshots without the marker keep their existing pause and are shown conservatively as current-table intent; the origin of an old global request cannot be reconstructed. An older runtime can clear the pause while retaining the unknown advisory field. The new runtime ignores that inactive marker instead of blocking recovery or reactivating the pause. Invalid marker types, bots, noncash formats or unbound identities are rejected. The marker is shown only in the own seated view, not the public watch view.

No new money movement or public operation is added. Existing cookie/account, Origin, request-body and atomic room-store boundaries remain. Scope changes and global multi-room changes are durable together; save failure restores the prior state. Existing ordinary cash pause, return, global leave and owner restore are regression-tested.

## Acceptance

`cash-sitout-menu-test.mjs` verifies current/all selection, selected-only cancellation, account/capability/busy guards and disabled blind actions. `cash-global-return-test.mjs` verifies two-room scope, promotion from local pause, unchanged hands/wallet, restart, rollback, stale inactive-marker compatibility and invalid marker rejection. HTTP checks cover identity/origin/method/body/atomicity.

`network-browser-test.mjs --cash-sitout --cash-sitout-account --cash-sitout-menu` uses a temporary authenticated account at two hosted tables. It checks actual pointer/keyboard/Escape controls, source geometry at850/1196, current versus global state, persisted checked selection, rejected blind actions,503 retry and unchanged hand/wallet. The established pause/status/DealMeIn sequence then completes. Separate owner+five-computer Hold'em/Omaha hands verify payouts and restart. All browser profiles/data are ephemeral and audio is muted; no live owner game is used.

Physical native geometry/font/audio, next-blind scheduling and the full native global menu remain open requirements. This feature does not close the overall parity goal.

## Active header trigger — subsequent candidate

Selective exports of HeaderSitOutButton, TableWindowHeaderDetail and TableWindowMediator establish the active header route. Earlier SitOutButton3D/TableMenuButton3D exports describe a different component and were not used to infer the active icon. The route forwards the button’s bottom-right global point into the table; SitOutMenuView converts it to local coordinates and SitOutList offsets its container by−560, matching right-aligned menu placement.

HeaderSitOutButton is36×26logical header pixels with radius4. Native common0317 is a72×52white/alpha sprite from desktop atlas1058/3495; the existing history extractor now crops it with decoded RGBA equality. The browser applies the source tint through an alpha mask: normal#999999, hover/down/open#ffffff; hover/open background#5a5a5a, while pressing a closed button has no background. Mouse-down propagation is stopped. Visible text remains available as the accessible name; the focus outline is a local accessibility adapter. Native absolute header layout/order and other header controls remain outside this candidate.

RED observed local58×24 versus native36×26. GREEN headless account/global cash menu journey verifies geometry, decoded72×52sprite, normal/hover/down/open colors, drag-away cancellation, four menu rows at two sizes, keyboard/Escape, current/all-cash intent, restart,503retry, pause glyphs and trusted Deal Me In return without changing the current hand/wallet. Existing extracted history PNG hashes remain unchanged. Sources, SWF/atlas hashes and the817byteprivate PNG receipt are in cash-sitout-header-source.json. Native physical execution/audio and the next-blind server rule are still unobserved. Not yet released at this checkpoint.

## Candidat cash/Rush ulterior PR215

[Pauza globală cash/Rush](global-cash-rush.md) extinde subsetul cash local la sesiunile Rush existente, cu tranzacție comună și teste. Notele anterioare despre lipsa scope-ului Rush sunt istorice pentru acel candidat. All-games pentru turnee/Spin și next-blind nu sunt declarate implementate.
