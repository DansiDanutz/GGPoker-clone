# Spin wheel presentation — source reconstruction in progress

`spin-wheel-motion.mjs` implements the frame progression in the retained REA export of `SpinAndGoldWheel.onEnterFrameHandler`. It is not yet imported by the table UI, and no working rendered wheel is claimed.

The selected segment and animation variant are separate inputs. The segment must come from a persisted server result and verified display mapping; the animation must never draw or alter a prize. This module accepts an explicit wheel index rather than guessing that the native operator's multiplier-list order matches the local payout-array order. The native multiplier-list permutation `[6,2,4,0,1,5,3,7]` alone does not establish that order.

Each tick renders the current source row before advancing by `ceil(elapsedMs/33)`. Constant velocity switches to reduction when its angle reaches `(7-wheelIndex)*45`, or its track ends. Switching resets the frame before that tick's advance. Reduction adds the target offset to the source angle; it retains the source's nonzero terminal angle rather than snapping to a synthetic zero. High sound events follow `ss`; low sound events follow the source's threshold/sign-crossing calculation. The module emits event flags only, without audible playback.

A closer reading qualifies the earlier fallback description in the registration investigation: `setWheelData` has a missing-row fallback, but the handler calls it only while the current frame is within the track. A tick that overshoots an entire track can retain the previously rendered pose and end/transition without applying its last row. The implementation preserves that observed source behavior. Physically measured native timing remains unknown.

Validation rejects invalid segments/variants, absent/noncontiguous tracks, malformed angle/sound fields and invalid elapsed values. Input rows are copied so later caller mutation cannot change an in-flight result. Completed ticks return no repeat sound events. Tests cover explicit phase/overshoot fixtures and all32 segment/variant combinations with the installed native motion file at17ms cadence. This proves the frame interpreter against supplied data, not native rendering or sound synchronization.

## Graphics recovered for the next integration

The installed `after_lobby/spinAndGoldWheel.json` references a1024×1024 atlas. The existing desktop frame-only loading rule applies; its repeated387×387 trim metadata must not be used to enlarge every sprite. Native `setImages` maps indices0 base,1 ring mask,2 stone/frame,3 arrow,4 symbol,5 highlight,6 frame mask,7 effect,8 flare,9 glow and10 glitter. Indices11–14 are ticket/text variants.

`refresh` sets the wheel container scale to2.1. The360×360 rotating base is centered at its own half-size with container translation193.5/193.5; the stone/frame is387×387. The148×148 symbol is placed156.5/156.5 at half scale. Arrow container pivot193.5/13.5 uses the66×90 arrow at−16.5/−14, half scale. Source amount labels rotate `45*slot-90+22.5` before drawing a720×720 amount board centered360/360 and displaying it at half scale. Fonts, precise surrounding table placement, masks/effects, prize-type mapping and the deal/reveal synchronization boundary still need verification and integration.

Motion data remains the installed89851-byte JSON with SHA256`22fe1566a23475949346cd8548ddb1564c9b363cba41f879b06517c757671c5b`. Native proprietary graphics/source are kept outside public Git. No live data, configuration or prize outcomes were changed by this work.

## Verified private extraction and additional view source

`tools/extract-spin-wheel.py` now extracts15 atlas frames, the bitmap-font page/34 glyph metrics and original motion JSON into ignored home-art files. Its self-check compares every decoded sprite/font RGBA byte, validates glyph bounds, verifies the motion hash and refuses to overwrite differing outputs. Two complete runs passed; generated storage is625045bytes including its private manifest (619190asset bytes). No installation or new dependency was needed; it reuses the existing Python3.14/Pillow environment.

The font page named by the FNT is not a separate installed PNG. `bmfont.xml` locates it at x289,y320,width245,height261 in bmfont.png. Zero frameX/frameY means those pixels retain the FNT glyph coordinate origin; no inferred padding is inserted. The font loader source copies glyph rectangles at their FNT coordinates and preserves xoffset/yoffset/xadvance.

Additional selected-class export of SpinAndGoldWheelView and BitmapFont succeeded with FFDec26.4/2GiB heap after512MiB exhausted memory. This is static decompiler evidence, not native game execution. Private source hashes are retained in Git QA metadata. WheelView positions the wheel at viewport.width/2−404,y176; waiting label at center−368,y124,size736×43. The wheel COMPLETE event hides its background and wheel, and does not itself send a server-ready acknowledgement. That method does not establish when the server deals cards or starts the action clock. Integration must resolve that boundary rather than cover live betting controls with an arbitrary-duration overlay.

NewAmount uses the wheel bitmap font at56, then scales its rotated amount container by32/56. It splits digit and punctuation tokens separately, tapers each token by0.01 per position and uses0.92/0.83 base scales for more than9/10 tokens. Glyph1 and comma/period have special horizontal offsets. This supersedes any temptation to lay out wheel amounts as one standard browser text label; exact label bounds remain to be matched before rendering claims.

## Amount geometry module

`spin-wheel-amount.mjs` now computes NewAmount token groups, raw bitmap glyph bounds, special1/comma/period offsets, cumulative vertical placement and0.01 taper, with the source0.92/0.83 long-label scales. It accepts preformatted text and the extracted font; it does not guess currency formatting or multiplier-to-slot ordering. Unsupported glyphs and malformed/duplicate/out-of-bounds font metrics fail explicitly. The installed font has no kerning entries; extraction now checks this condition so future kerning cannot be silently dropped.

Additional retained Label/STextField exports establish the actual rendering path: unconstrained labels use bothDirections auto-size; STextField calls fillMeshBatch and normalizes resulting mesh bounds. BitmapFont.createSprite is empty in this export, but is not that rendering path. Native subpixel normalization uses integer truncation and remains to be calibrated. The module records this limit in a shortcut comment; its normalized geometry tests are not proof of pixel-identical Flash label placement.

Tests cover special glyph anchors, cumulative taper, token counts10/11, grouped nonnumeric text, malformed fonts/unsupported characters and the actual extracted100,000,000 label. Native-font checks report SKIP when private assets are absent. No wheel UI or gameplay clocks are changed by this module.

## Browser composition checkpoint

`spin-wheel-render.mjs` now loads the selected native base/frame/arrow/symbol/font assets and draws an eight-label wheel from an explicit pose. Source geometry is used: viewport-relative origin,2.1scale,193.5pivot,720-to360amount-board scale,slot rotations,radial300offset,90degree amount container and32/56font scale. Input labels are explicit; no result or slot is selected by this renderer. It draws the mechanical spinning state; highlight/glitter/prize continuation effects and live-table integration remain incomplete.

`network-browser-test.mjs --spin-wheel` runs on an ephemeral server and muted headless browser. It observed384125changed pixels between two poses,zero pixels outside the source-derived overall bounds (including the arrow above the frame),105080opaque reference pixels matching withinRGB tolerance2,and no canvas mutation after invalid labels. The reference is a direct composition of the extracted fixed assets at source positions, not a native runtime screenshot. A requestAnimationFrame run completed583ticks with final wheel angle38, preserving the canvas transform. The test also injected a503font-metadata response; loading rejected and retained the previously drawn frame. These results prove browser composition and source-data motion,not physical native timing,sound or pixel parity.

The source server exposes these renderer modules for bounded local testing. Player table code does not import or display them yet; live owner data and clocks remain untouched. The installed pr90 art snapshot lacks these newly extracted files; a later release must install a new immutable art snapshot alongside the runtime.
