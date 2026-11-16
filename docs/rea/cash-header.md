# Hold’em Table/Group header — native source contract

Status: source-backed heading implementation installed in PR281; the unverified capture compensation shipped in PR280 is removed. Scope is the ordinary no-promotion Hold’em catalog. Rows, native-derived ordering, selected room, waiting/admission, wallet and engine are unchanged. Full physical parity remains unproven.

## Recovered implementation

Thirteen Game51 classes plus a two-class Game37 cross-check are identified in [cash-header-source.json](cash-header-source.json). NewListHeader and NewTableTitleItem are byte-identical between those installed versions. Both specify background#333333,caption#808080 and divider#404040. The active native module remains unobserved.

HoldemLobby constructs an810x24 header. Roboto is enabled, font size12,boldfalse; labels use y1/height24. Dividers begin at cell-width,y6 and are1x12. Group widths133/223/150/157/147 sum810. Table widths176/206/110/116/52/52/52/48 sum812: the last text cell extends two units beyond the810-unit background. The former46-unit normalization is corrected without moving row data anchors. Existing parent/viewport normalization is preserved.

NewListHeader emits CLICK, but the inspected Table/Group/NormalCashGameLobby do not bind that signal to sorting. Passive headings therefore gain no invented arrows, purchases or game actions. Real row selection, arrows,Enter/double click and opening/joining remain separate tested controls.

## Capture audit and correction

The saved native1200x963 PNG contains58/138/73 gray instead of the source51/128/64. A temporary component palette and22px browser leading reduced raw pixel error. That was insufficient authority: native Cua and headless Chrome use different capture/render paths, and their color profiles,DPI/raster and loaded-native-module identity were not bound. Matching raw pixels can compensate for capture differences rather than improve the actual application. The calibration is removed; lower PNG error is not accepted as physical parity.

The corrected local header uses the literal native palette and an uncompensated24px CSS linebox inside its24px label container. Fresh Label/STextField/TrueTypeCompositor inspection records the native integer texture centering,pixel grid fit and four text-field gutter pixels; CSS is a different compositor and exact font metrics/AA remain open. PR283 replaces the earlier ellipsis fallback with source-ordered two-dot slicing. LabelModel.getMergedText calls slice before Label copies the string into the compositor: single-line width includes four TextField gutter pixels, and substr removes one UTF-16 code unit at a time until the full text or prefix plus two literal dots fits. Only the resulting string reaches autoScale. This is not a mandate to shrink the entire original caption. Browser canvas advances remain an approximation of Flash metrics; post-slice compositor scaling and physical raster remain unverified. Ten native heading keys use the existing language catalogs and original regular Roboto asset. No new product image,font,package or backend setting is introduced.

The native image hash stays preserved. Earlier six leading probes and their lower errors remain historical rejected experiments; they are not production constants or an acceptance pass. A read-only WindowServer check found no existing PLAYGG/local poker window to obtain a comparable native capture. No app was launched or foregrounded to fill that evidence gap. The original client remains stopped after its prior self-activation.

## Verification

The old installed header first failed the source-style assertion. Corrected browser gates require source palette,normal Roboto12,columns,label offset/dividers at1200x963 and900x700,actual Romanian translation across list refresh and retained mounted nodes. Header probes restore their earlier focus before unrelated row keyboard tests. The right-edge assertion changes830→832 because of the original48-unit cell,without loosening tolerance.

The full fixture exercises real Table/Group controls,spectator Open without seat/token/debit,Group preferences,transactional two-window funding/retry,private HUD/notes,two hands with five computers,independent payouts,720-chip conservation,reconnect/restart and cross-room balances. All use ephemeral data and muted headless Chrome. Neither source-style checks nor screenshot characterization constitute full native pixel/frame/speaker parity.

The comparison HTML preserves both1200x963 captures at equal zoom,explicitly as evidence with unbound color pipelines. Raw account/player images remain private under.git/danslab-qa. Different table data,promotions,avatars and capture pipelines are not a valid whole-screen error score. A future same-pipeline/profile/DPI comparison is required before any physical color/ink compensation.

## Release evidence

PR281 tested80702e0ad7580145236abd6259164a36a6ee6d25,merged7fde59b940f9ec466b113673089a8fa2653cbc5a. All12 exact-head checks passed with recorded evidence and a fresh qa-check before merge. Private local receipts: `.git/danslab-qa/pr281-evidence.json`, `pr281-pixel-review.json` and `pr281-live.json`. The source review binds13 Game51 classes and two Game37 cross-checks; static evidence does not prove the executing native module.

The idle-guarded rollout installed130files/1513958logicalbytes at runtime `cash-header-source-80702e0`,using129verified immutable hardlinks and15425newCSSbytes. Existing1387artfiles were reused. PID79681→82320; all6ownerfiles/15496bytes stayed byte-identical. No live gameplay QA, foreground activation or speaker playback. Full objective remains incomplete.

PR283 tested5670c30813796fd5e68359653b4ebb123eeb0607,merged99351d7cb5efd204b1a5e9da90e285671c73f0c3. All11 exact-head checks passed; `.git/danslab-qa/heading-slice-evidence.json` and `pr283-live.json` retain local evidence. The browser initially reproduced stale fallback text; observing data-native-fallback corrected it before the successful rerun. Table/Group overflow, full accessible labels, short-text restoration, Romanian polling, two hands/five bots, independent96-chip payout,720-chip conservation and cold restart pass. No native physical parity claim.

Idle rollout PID82320→86445 installed130files/1514966logicalbytes at `heading-slice-5670c30`,with127immutable links and131028newbytes in three files. Existing1387artfiles reused;6ownerfiles/15496bytes unchanged. Canvas glyph advances plus four native gutters approximate Flash; post-slice compositor scaling and script-specific font parity remain open. UniqueLabel selects the script-dependent font before Label invokes getMergedText; plain Arial is not independently imposed on the slicing stage.
