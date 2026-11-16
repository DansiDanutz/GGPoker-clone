# Implementation checkpoint

This project is a local play-money application under active development. It is not a completed 1:1 clone and does not connect to the original operator's private backend or administer real-money accounts.

## Current verified release

PR270 merged `7db0c343e1ca3de8cbefeda44db2e7ff8336ac15`; tested source `1ec77b284db52cdb9d0660ec45026ab76bdc4d04`.

Group View now uses the source241px sidebar and animated88/136px operator. Selection changes list690→642px at1200×963, with actual Profile/Open/Join callbacks retained. The in-app Information panel uses original close/arrow/icon art,200ms cubic motion, original language catalogs and actual local catalog rules. Native fixed14-second values are not copied over owner-configurable action times. Source/implementation/browser focus issues and remaining differences are documented.

All16 exact-head installed checks/reviews passed:130 runtime identities,1381 artwork hashes/1375 unchanged hardlinks,15 original AS3 identities,6 independent exact RGBA crops,unit/font/language/private metadata checks,actual Group/panel geometry and cubic midpoints,resize/lifecycle/stable refresh,two complete six-seat browser journeys,independent payouts,reconnect/cold restart and conserved balances. Installed1200×963 Group capture inspected; original app not relaunched.

Live runtime130files/1,498,363bytes;art1381files with1375 verified immutable hardlinks plus6new PNGs totaling3907bytes. Guarded idle rollout PID49447→4590 preserved all6ownerfiles(15,496bytes) byte-for-byte. Backup `/Users/davidai/.local/state/playgg-rollouts/pr270-tjy2zqkz`. No live gameplay writes,foreground or speaker actions. Native feature rows,loaded-module identity,color/text pipeline,fresh native Group comparison and whole-app parity remain incomplete.

[Source evidence and remaining gaps](docs/rea/cash-group-operator-research.md).

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
