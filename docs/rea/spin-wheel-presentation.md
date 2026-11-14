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
