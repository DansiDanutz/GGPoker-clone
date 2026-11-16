# Implementation checkpoint

This project is a local play-money application under active development. It is not a completed 1:1 clone and does not connect to the original operator's private backend or administer real-money accounts.

## Current verified release

PR274 merged `31b7ad5c31e55207ac3ee80e774126b53bd7a8c8`; tested source `82da9cfd90d66f83277ab65bc4c0f53e44a4a714`.

Lobby tabs,Information links and rule-info controls now inherit the original1/1.3/0.8 multipliers and200ms linear up/hover motion. Dragging out clears pressed styling and cancels activation. Arrow/modal-close skins follow the actual up,down,over constructor order; historical image filenames are preserved as aliases. No image bytes,backend rules,wallet data or global color adjustment changed.

All8 exact-head installed checks/reviews passed:130 runtime identities with128 verified immutable code hardlinks/two committed CSS files,1387 unchanged artwork hashes,13 original source identities,syntax/language,actual pointer/linear midpoint/texture/drag/modal tests and a full six-seat bot journey with independent96-chip payout,next hand,reconnect/restart and720-chip conservation. Installed1200×963 rendering inspected. Tests ran from verified nonsynced copies after source-checkout startup timeouts; temporary QA copies were removed.

Live runtime130files/1,506,146logicalbytes;only26,970newCSSbytes plus manifest metadata were generated through128 immutable runtime hardlinks. Existing1387artfiles reused unchanged. Guarded idle rollout PID92382→73740 preserved all6ownerfiles(15,496bytes) byte-for-byte. Backup `/Users/davidai/.local/state/playgg-rollouts/pr274-z_uym5je`. No live gameplay writes,foreground or speaker actions. Selected-skin/capture color mismatch,loaded-native-module identity,straddle server arbitration and whole-app physical parity remain incomplete.

[Source evidence and remaining gaps](docs/rea/asset-button-pipeline.md).

## Native reference checkpoint

A fresh native window and isolated installed clone were captured at exactly1200×963. This is a real comparison, not a1:1 pass: PR260 corrects the texture and label contract; parent bounds, player metadata, promotions and typography still require further mapping. The original self-activated during its requested background launch and was minimized/quit; no seat, bet, waiting or cashier action was sent. Further background-only work uses the saved captures and source. [Evidence and next implementation targets](docs/rea/native-table-comparison.md).

## Implemented workflows

- Local nickname/PIN login, persistent sessions and user-provided DanGG branding.
- Owner table creation, admission controls, configurable stakes and practice buy-ins.
- Six-seat Hold’em and PLO/PLO-5/PLO-6, Short Deck, four-seat All-In or Fold, separate browser sessions and computer players.
- Unequal all-ins, folded-player exclusion, side pots, uncalled-chip returns and independently checked payouts.
- Freezeout registration, scheduled blind levels, eliminations and practice-credit prizes.
- Hold’em/PLO Rush pools with quick-fold rematching, queues, sit-out and restart recovery.
- Private notes, player HUDs, hand history, authenticated historical viewer identity, BB/anonymous preferences and PNG exports.
- Five-column cash-hand reports with source-derived artwork/geometry and winning-five card selection, including exact-two-hole-card Omaha rules and board-only compensation.
- Owner backups, integrity checks, transactional restore/recovery, audit records and chat moderation.
- Table appearance, betting preferences, hotkeys, native-derived card/chip effects and sound controls.

## Detailed source and behavior documentation

The [REA functional manual](docs/rea/README.md) contains detailed guides. Current local table work includes the private HandRank/HUD/Stats panel, durable seat-session time and counters, and nine source-derived flop/turn draw hints. Native runtime/font/timing parity, full card choreography, button bitmaps, double-board gameplay and all-time operator statistics remain incomplete. See the guides for source limitations and the difference between current-seat statistics and room/pool HUD samples.

## Verification

Node assertion scripts cover game rules, funding, privacy, persistence, owner recovery and settings. `network-browser-test.mjs` uses isolated temporary state and headless Chrome for real browser workflows. Representative checks:

```sh
node history-winning-cards-test.mjs
node history-columns-test.mjs
node pots-test.mjs
node plo-test.mjs
node shortdeck-test.mjs
node owner-restore-test.mjs
node network-browser-test.mjs --bots --player-notes --hand-history
node network-browser-test.mjs --history-limit --native-history-preview --history-cells --history-winning --history-hidden --history-units --history-save
```

Browser/reference checks require the local reference asset pack and Chrome. Mac window/speaker tests are opt-in and are not part of background verification. This plain Node project has no dependency installation or build step.

## Assets and private state

The source repository intentionally excludes the local native-reference asset pack, screenshots, private game/profile data, owner keys and local agent operating notes. Only the user-provided transparent DanGG logo is included from `home-art/`. Extraction/preparation tools document native asset inputs; existing Mac visuals depend on that local pack. A fresh source-only checkout does not contain the complete reference-mode artwork.

## Remaining work

Full native screen-by-screen and seated pixel comparisons, typography/antialiasing, physical animation/sound timing, remaining in-app controls and tabs, native history action types beyond betting, branded tournament formats, multi-table tournaments, Spin gameplay, packaging and accessibility parity remain open. `FEATURES.md` retains the detailed implementation history and gaps. Native private admin behavior has not been observed; owner controls here are independently implemented and tested.
