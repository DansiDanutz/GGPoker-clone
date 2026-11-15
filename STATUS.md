# Implementation checkpoint

This project is a local play-money application under active development. It is not a completed 1:1 clone and does not connect to the original operator's private backend or administer real-money accounts.

## Current verified release

PR266 merged `480b5aefdfdf4e3a7144fff71f44c872c54db273`; tested source `12e1c62b87872ae7ad690e3147f172ea9851b021`.

The ordinary Hold’em Table View parent is calibrated to the original1200×963 native reference and recovered source dimensions. Actual preview is approximately(843.985,185)/241×376;Open(856.032,571)/216.891×38;Wait y619. The existing list/counter geometry is unchanged. All14 exact-head checks/reviews passed,including source/capture/runtime/art identities,1200parent/header/control geometry,900×700 proportional resize/restore,real HUD/admission/sparse heads-up,Group/Table/Wait/Cancel/buy-in replay,two hands,independent payouts,cold restart and cross-room conservation. No native relaunch.

Runtime130files1,485,462bytes;existing1,365art files reused,no added art bytes. Guarded idle rollout PID99093→22223 preserved all six owner files(15,496bytes) byte-for-byte. Backup `/Users/davidai/.local/state/playgg-rollouts/pr266-i67elkw8`. No live gameplay writes. Group parent/native tab art,font/color-profile/full-app timing fidelity remain incomplete.

[Calibration and remaining gaps](docs/rea/cash-preview-parent.md).

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
