# Native asset pipeline and inherited button states

Status: source-backed correction released through PR274 after commit-bound installed verification. Native client stayed stopped and no real-money action or live data write occurred. The installed Game51 SWF is the analysis artifact, not a proven loaded native module.

## Asset resolution evidence

Fresh headless FFDec exports of StageAssets/AtlasLoader match the retained exports byte-for-byte. StageAssets resolves group+four-digit index through AtlasLoader. The loader parses frame x/y/w/h, uses the decoded PNG BitmapData, and by default draws the crop with an integer translation, smoothing=true and no supplied ColorTransform. Its alternate copyPixels branch is false by default. StageImage enables smoothing. These observations support frame-only crops for the inspected unrotated frames; they do not establish every asset override or the capture/display color pipeline.

The existing native1200×963 selected-tab capture has a dominant fill(174,148,90), while the isolated prior clone has(164,137,84). Both PNGs lack image-profile metadata in the retained readback. Selected native tabs are disabled and the inherited button multiplier resets to1, so this mismatch is not justified by applying a hover multiplier to the selected skin. No global gamma/brightness/color compensation is invented. Loaded-module identity, parent transforms and capture/display conversion remain unresolved.

## Inherited interaction behavior

The original constructor is Button(up,down,over,disabled). When no down/over texture is supplied, it defaults to0.8/1.3 respectively. Normal is1 and disabled resets to1 immediately. Up/over interpolation takes200ms; the freshly recovered Tween default is Ease.linear. Pressed state is immediate. LobbyDetailViewTabButton and GameInfoPageButton inherit these multipliers; NormalGameInfoItem’s information button does too. The local CSS previously updated only label colors and therefore omitted the whole-control multiplier. It now applies the source multipliers and timing to these exact controls. Reduced-motion suppression is a local accessibility adaptation, not observed native behavior.

MouseOut changes the native state to up even while a button is held. Pressed styling therefore requires both active and hover. Leaving the target restores label origin/color and cancels a released-outside action. Existing actual view/panel callbacks and disabled selection remain unchanged.

## Corrected texture mapping

Earlier information-control documentation treated constructor arguments in the wrong order. LobbyGameInfoView constructs Button(191,193,192): hover is192 and pressed is193. CloseOptionButton constructs Button(0,0,1): hover is1 and pressed uses0. CSS now follows that order. Historical PNG filenames are preserved for byte-compatible installed asset reuse: arrow-down.png contains192 and is used for hover; arrow-over.png contains193 and is used for pressed. popup-close-down.png contains option1 and is used for hover; option0 is used for normal/pressed. No image bytes were changed or duplicated.

## Verification and limits

The new test first failed against the installed previous release because the multiplier transition was absent. Startup from the synchronized checkout twice timed out before the test could inspect controls; this is not treated as a gameplay failure or a proven iCloud diagnosis. Verification switched to an explicitly test-only nonsynced overlay:128 validated immutable code hardlinks plus the two changed CSS files. The overlay and isolated server/Chrome/profile/data were removed after completion; it was never installed live.

The regression then passed actual pointer hover/down,1.15 multiplier at100ms,disabled1,pressed0.8,drag-out cancellation,information link/icon multipliers and corrected arrow/modal-close textures. Existing Group/panel cubic motion,real rule polling,three408px dialogs,Escape/outside/close/focus and unchanged identity/wallet passed. Full installed release QA and native physical frame/speaker comparison remain outstanding. Straddle remains disabled: its recovered client contract does not establish server arbitration,restraddle progression or first-actor policy; see straddle-contract.md.

## Installed release — PR274

PR274 merged `31b7ad5c31e55207ac3ee80e774126b53bd7a8c8`; tested source `82da9cfd90d66f83277ab65bc4c0f53e44a4a714`.

Lobby tabs,Information links and rule-info controls now inherit the original1/1.3/0.8 multipliers and200ms linear up/hover motion. Dragging out clears pressed styling and cancels activation. Arrow/modal-close skins follow the actual up,down,over constructor order; historical image filenames are preserved as aliases. No image bytes,backend rules,wallet data or global color adjustment changed.

All8 exact-head installed checks/reviews passed:130 runtime identities with128 verified immutable code hardlinks/two committed CSS files,1387 unchanged artwork hashes,13 original source identities,syntax/language,actual pointer/linear midpoint/texture/drag/modal tests and a full six-seat bot journey with independent96-chip payout,next hand,reconnect/restart and720-chip conservation. Installed1200×963 rendering inspected. Tests ran from verified nonsynced copies after source-checkout startup timeouts; temporary QA copies were removed.

Live runtime130files/1,506,146logicalbytes;only26,970newCSSbytes plus manifest metadata were generated through128 immutable runtime hardlinks. Existing1387artfiles reused unchanged. Guarded idle rollout PID92382→73740 preserved all6ownerfiles(15,496bytes) byte-for-byte. Backup `/Users/davidai/.local/state/playgg-rollouts/pr274-z_uym5je`. No live gameplay writes,foreground or speaker actions. Selected-skin/capture color mismatch,loaded-native-module identity,straddle server arbitration and whole-app physical parity remain incomplete.

Earlier development checks preceded the separate release evidence above. Native physical color/frame parity remains unproven.
