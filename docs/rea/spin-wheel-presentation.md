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

## Prize phase and core audio checkpoint

Additional static exports of Ease and SpinAndGoldWheelData establish the ordinary3-Max cash-award mapping: multipliers≤5 use motionType0,>5 through25 use1,and>25 use2. This is not the6-Max/ticket/WSOP mapping. Native easeIn is cubic. `spin-wheel-presentation.mjs` implements spin events, prize holds500/4500/9500ms,700ms cubic wheel exit, and the type2congratulation continuation:700ms ease-out entry,hide beginning8seconds after entry began,then700ms ease-out exit. It emits once-only core sound events and exposes highlight/glow/congratulation state. Cancel suppresses subsequent cues. Visual highlight/glitter/SWF congratulations are still incomplete; exposing their state does not claim they are drawn.

Six MP3payloads were extracted by exact SymbolClass/DefineSound mapping with pinned sample counts/rates: SpinAndGoldSpin192384@44100,SNGWheelStuckHigh11520@44100,SNGWheelStuckLow6912@44100,SngFireworks46656@22050,SNGWheelOut126720@44100,SngBigWin472320@44100. Private assets total385228bytes. The extended extraction tool retained its original three-tournament-sound mode; a separate extraction regression passed all three original counts/hashes. Audio validation copies plus private runtime copies consumed about1.9MiB; no dependencies were installed.

The existing audio engine now routes these core cues through Sound Effect settings and preloads them after an already-authorized audio context exists. Its duration calculation respects the22.05kHz fireworks rate and clamps to the decoded buffer duration, including browser resampling rounding. No extra user preference or preview choice was added. The local server serves only the enumerated cue filenames from private installed artwork.

The muted browser test ran the normal prize hold and visual cubic exit to an empty canvas,with657observed render ticks,155emitted cues and exactly155actual WebAudio source starts. All six assets decoded; no speakers were used. Unit tests verify all three prize types,phase boundaries,cancellation and sample-rate math; ordinary channel,preview,volume andclock regressions passed. Node reports100percent coverage for the three pure wheel amount/motion/presentation modules in this run; this is not whole-app coverage or native runtime parity. A harness bug using the RAF frame timestamp as an initial clock was diagnosed from the owned headless page and corrected to read monotonic current time inside the callback,with rejection on callback errors.

The shared renderer consumes wheel alpha/vertical offset for the exit. Native prize highlights,fireworks/congratulation graphics and sound synchronization against a physical native run remain unverified or unimplemented. Frame-light/base-light/frame-effect audio bindings also remain to be connected with their visual loops. Player table code still does not display this component.

## Winning-segment effect checkpoint

`spin-wheel-prize-effect.mjs` reconstructs the source segment effect: rotation360−45×(targetIndex+1)+22.5degrees; initial0.95scale/zeroalpha grows to1.03over350ms with cubic ease-out,then alternates0.97/1.03in350ms cubic ease-in/out halves. The renderer uses native atlas frame7 at150×173,pivot−76/−86.5,motion-container y−85,inside the rotating wheel base and below the fixed stone/frame. Presentation exposes the authoritative target index and elapsed prize time; the effect stays active during wheel exit. No prize or segment is rerolled. This is a source-derived interpolation; physical frame/callback timing remains unmeasured.

The native SngWheelFrameEffect cue is emitted once when a motionType1/2prize begins,not on every pulse. Its embedded payload is75296bytes,82944samples at44100Hz,SHA25646774e8cd62e0a1a78eb307d66b71799e12470e4cd0e161f6abcedce42a7b1ba. Seven-cue extraction/preload/decode now includes it; source files remain private. A real headless motionType1run completed896render ticks and156cues→156actualWebAudiosources,with an empty canvas after exit. A separate browser pixel-difference assertion verifies that the native pulse becomes visible and preserves the canvas transform. Fixed-frame checks and audio-channel/volume/unit regressions also passed.

The large-prize congratulations SWF was inspected read-only:154374bytes,declared60fps,root1frame,and exported symbolspinAndGoldCongraturation on sprite14with240frames. Selected frames1/120/240were exported asSVG with FFDec,about669KiB total; their hashes are private QA evidence. They are not yet integrated: language selection,animation origin/scale and dynamic prize labels still need recovery. The existing sparkle/glow/frame-light masks and congratulations graphics are not completed by the segment-pulse change. New audio validation copies and selectedSVGs used about1.2MB of private storage in this checkpoint.

## Congratulations graphic timeline checkpoint

All240frames of sprite14were exported with FFDec26.4 using the original154374-byte SWF. The raw SVGs total53590119bytes. `tools/pack-spin-congratulations.py` preserves each canonical frame body/definition string and deduplicates repeated definitions into55entries,producing3838426bytes. It checks frame completeness,dimensions,translation,language instance IDs and local-only image references. A second packing run produced identical bytes. Raw SVGs and the packed native asset remain private; generated storage in this checkpoint is about57.5MB plus small manifests/XML. No dependency was installed.

`spin-congratulations.mjs` loads that pack,selects the source text_en/text_ch instance according to the explicit language flag,and preserves the exported origin328.95/331.75when drawing back in native coordinates. It provides the declared60fps/240frame loop index and draws with the presentation controller’s native entry/exit pose. The controller now exposes elapsed congratulations time,including the700ms exit after its8-second display. Dynamic numerical prize labels are separate and still incomplete; this module is the native graphical/caption layer only.

`network-browser-test.mjs --spin-congratulations` decoded and drew all240English frames plus aChinese frame in an isolated headless browser. Keyframe hashes differ across frames1/120/240and English/Chinese; up to266716visible pixels were observed,invalid indices were rejected,and the canvas transform was preserved. Clock-boundary and presentation regressions pass. These are actual browser asset/render checks,not a native app screenshot comparison or proof of native wall-clock cadence.

The source server can serve the component for testing; player tables still do not display it. Remaining work includes dynamic prize typography/rows,glow/glitter/masked lights,authoritative multiplier-slot ordering and safe integration before the first deal,then fresh installed-art/runtime QA.

## Dynamic main-prize text checkpoint

The existing native-result-font PNG/JSON already contains the exact newspinandgold atlas region516/2/315/316and43glyph metrics used by FontType.NEW_SPINANDGOLD_FONT. No duplicate font extraction was added. `resultTextGlyphLayout` now shares the existing tournament-result validation/atlas math for explicit32px or90px text; `resultGlyphLayout` retains its integer-only32px contract and all existing result tests pass. The congratulations total uses90/56scale,normalizes visible bitmap bounds,and places them at x=(565−width)>>1,y240following the native three-player layout. Native Flash subpixel auto-size translation remains an explicit calibration gap.

The component accepts preformatted prize text and never chooses a reward,currency unit or abbreviation. A selected Currency class export confirms distinct CHIP/GCO formatting paths; it does not establish the operator data units or current runtime formatter settings. No conversion or abbreviation was guessed. The30px placement rows use a different default text-font path: source Setting declares Segoe UI Bold while the shipped font resources/documented exports also contain Roboto variants. The active binding still needs proof; no substitute row font was rendered.

Prize font assets load lazily and are shared across text changes. A failed request can retry,while an unsupported glyph preserves the valid font cache. The browser test injected a503font-metadata failure,recovered on retry,rejected unsupported text,reused the font bitmap,and observed29811changed pixels when the native bitmap total was painted over the original animation. All241graphic frame/language decodes and transform checks still pass. No user-facing table or live owner data was changed. Placement rows and live integration remain incomplete.

## Three-place prize rows checkpoint

Retained InitFont source overrides Setting.defaultBoldFont with Roboto Condensed Bold; the existing native-show-roboto-condensed-bold.ttf is the matching embedded family. This resolves the earlier static-default ambiguity. The private metadata pins its SHA256 and803 supported codepoints. No replacement font or dependency was added.

spin-congratulation-rows.mjs follows the three-player CongratulationItem layout:30px bold white placement titles, gold #efe592 values,5px horizontal/vertical gaps, group centered in565px at y350, and third-row y equal to twice second-row y. Explicit preformatted values are required. Flash textWidth/textHeight+4 is reflected in browser measurement; physical Flash grid-fit and baseline parity remain uncalibrated. Six-player and NoDealing layouts are not implemented by this component.

The headless browser test passed all241 frame/language decodes, a simulated503 row-font metadata failure followed by recovery, unsupported-glyph rejection without fallback,4286 row-changed pixels including1724 gold pixels, row offsets0/48/96, and preserved transforms. Corrected clear-between-draw main-prize comparison observes22250 changed pixels. Unit geometry, legacy tournament results and main-prize glyph tests pass. This is source-component verification, not live-table integration or native physical pixel parity.

## Native glow motion model

SpinAndGoldWheel.playGlowMotion and Ease.easeOutBack establish a30-second linear rotation,700ms2→900px expansion with back constant1.70158,position1→−450 and alpha0→1. Browser alpha is clamped while source size overshoot is retained. The separate atlas10flash expands2→840px at386→−34in300ms cubic easeOut,holds one second,then fades700ms with the same easing. spin-wheel-glow.mjs reconstructs this entry/steady model with tests for boundaries,overshoot,rotation wrap and invalid clocks. It is not yet drawn or imported by the renderer; exit shrink/translation and random individual sparkles remain separate pending work.

Glow renderer integration: existing exact atlas9(134×134)and10(150×150)are now loaded with strict dimension checks and drawn before the wheel,matching native child order. Glow container center406/406,30-second rotation and source700ms exit to y−300 are retained; exit shrinks900→2 at−450→−1 with the same Back easing. The player table still does not import the overall wheel scene. Random individual sparkles and masked light sweeps remain pending.

## Winning-segment masked light

Native atlas5(130×113)provides the light texture and atlas6(122×159)the alpha mask. The source sizes the light to122×80,starts at x−61/y−239,delays500–800ms,then moves y→0over2000ms cubic easeIn at alpha0.5. The container rotates by360−45(target+1)+22.5degrees inside the rotating base,above amounts and below the winning pulse. spin-wheel-light.mjs implements one explicitly timed source cycle; the renderer reuses a122×159offscreen alpha-mask layer. The random repeat scheduler and SNG_WHEEL_FRAME_LIGHT cue are not yet connected. No random delay or sound was silently substituted. Browser tests compare the hidden/start and visible sweep and redraw the starting pose to detect cached-mask trails.

## Frame-light repetition and sound

The presentation controller now starts the source frame-light loop for type1/2 prize phases,retains it through wheel exit,and removes the pose on completion/cancellation. Each cycle samples500–800ms once,then runs the2-second sweep. A start flag emits one cue per sweep; zero-delta polls do not repeat it. Callback completion starts the next delay without replaying missed historical cycles. The renderer consumes these poses directly.

SoundItem binds SNG_WHEEL_FRAME_LIGHT to SoundSngWheelFrameLight. Named SymbolClass/DefineSound extraction identifies character139,66816samples at44100Hz,60680MP3bytes,SHA25678fd1813e0a8dc76c06130f4533fe4cc6267597d2c6d7031b94c8d67b3ef3da6. The extractor now pins eight Spin cues; existing effects controls,preload and duration capping apply. Native assets remain private. No speaker playback or physical native timing comparison was performed.

## Authoritative segment transform

SpinAndGoldMultiplierSetInfo.setMultiplierSet allocates eight slots and assigns incoming entries using[6,2,4,0,1,5,3,7]. Ordinary PLAYGG processing preserves this result; SpinAndGold.setTypeList only re-sorts for the separate2Acebrand. SpinAndGoldWheelData.setWheelIndex searches the resulting vector for the table's authoritative multiplier; SpinAndGoldWheel reverses that index as7−wheelIndexfor motion targeting.

spin-wheel-segments.mjs implements that exact transform for an explicit eight-entry vector and selected multiplier. Tests cover all eight winners,alternate unsorted input,immutability,duplicates,missing winner and malformed values. This helper does not sort by payout or frequency,draw a prize,or infer operator packet order. The observed payout-dialog order alone does not prove the incoming protocol-vector order. Source hashes are retained privately in .git/danslab-qa/spin-wheel-segment-source.json. Actual server/client integration must supply explicit practice order or stronger native evidence; current live gameplay remains unchanged.

## Local server presentation contract

Room state now exposes spin.wheel with the explicit transformed multipliers,wheelIndex,targetIndex and order=`local-practice-payout-order`. This local order uses the existing descending payout-table rows as its declared input; it is not represented as recovered operator protocol order. Winner lookup uses the room's committed multiplier,never a client draw or animation result. The metadata is derived without mutation and remains identical after cold restart. Real-engine tests retain900-chip and100M-prize conservation,private admission,once-only entry/settlement and failure rollback; atomic entry and authenticated HTTP restart regressions pass.

The predeal barrier is not yet implemented: currently the third seated player starts the first hand and clock immediately. Consequently the player client must not display a blocking wheel over that running clock. Next integration must delay actual first deal/clock together and persist the lifecycle across restart,with corresponding multi-browser acceptance tests.

## Persistent predeal barrier — server stage

New Spin rooms now persist spinReady=[] and suppress the immediate third-seat deal. An authenticated,origin-bound POST /api/rooms/:id/spin-ready records only that seated account's completion; no client winner,prize or action is accepted. All three seats must be present. Repeated acknowledgements do not change state; the final account atomically starts the first hand and action clock. Legacy rooms without spinReady keep their prior lifecycle. This all-three-complete policy is explicit local practice behavior,not recovered native absent-player policy.

Tests prove no hand/clock while waiting even after60seconds and restart,one preserved acknowledgement,rejection of wrong-account/arbitrary fields,rollback on failed final write,and exactly one first deal at the actual completion time. Real tournament payouts and wallet/bank conservation still pass. HTTP tests use three independent account cookies/room tokens,verify foreign-origin and wrong-account rejection,restart the server between acknowledgements,and observe one first-hand clock.

This is intentionally unreleased staging: the current player client does not yet run the scene or send completion,so newly created Spin tables on this source revision wait at the barrier. Full browser lobby-to-winner tests must be restored by the actual scene integration before merge or deployment. Livepr117is unchanged.

## Player scene integration

spin-wheel-scene.mjs now drives the actual seated client while the persistent predeal barrier is pending and all three seats are present. It loads the native motion/sprites,uses server-supplied multiplier positions and prizes,plays the existing shared effects cues,and renders the original congratulations timeline/bitmap total/three placement rows for type2. Practice amounts are explicit whole play-credit numbers without inferred operator abbreviations. Visual motion variant is sampled independently of the committed prize.

Only successful presentation completion sends spin-ready. Loading/rendering/save failures retain the barrier and expose Retry; saved completion does not replay on polling. Page exit or changed seat invalidates the scene,cancels RAF and late audio,and releases loaded images. The scene occupies the existing1700×1200table coordinate system.

The actual three-browser journey now passes from TakeSeat through wheel to real hands,winner,independently verified payouts and bank/wallet conservation. A forced ticket0fixture exercises100M prize/three paid places and the original big-prize scene. Server/browser restart during the wheel keeps the first hand unstarted and reconstructs the presentation; midhand and final restarts preserve cards/results/wallets. These are isolated test fixtures,not live-account writes. Native frame timing/pixel parity,asset-failure retry acceptance and remaining sparkles/wait-light effects still require verification. No release QA or rollout has occurred.

## Recovery acceptance

Three-browser fault injection now rejects the first motion-JSON load with503,verifies no first hand and the same committed multiplier,then clicks actual Retry and completes the tournament. A separate first completion request returns503before reaching the server; the completion message offers recovery without claiming the hand cannot have started. Retry resends completion without reloading motion or replaying the scene. The successful retried response is then deliberately discarded after the server has processed it; ordinary state polling recovers the saved acknowledgement. The full hand/payout/900-chip/wallet-bank conservation and restart oracle still runs after these faults.

spin-ready requests now use the existing5-second AbortSignal timeout pattern,preventing a permanently pending request from holding the shared request queue. The stalled-connection timeout itself has not yet been fault-injected. Retry controls are local recovery UI,not claimed native pixel parity.

Stalled-request acceptance now passes: the actual player's first completion fetch never resolves until its provided AbortSignal fires. The browser observed5001ms,verified no first hand,clicked Retry without another motion load,and recovered a deliberately discarded successful response by polling. The complete three-account tournament/payout/restart oracle passed afterward. This closes the earlier untested timeout claim.

## Individual native sparkles

SpinAndGoldWheel825–839spawns immediately,then schedules a new particle after500–1500ms. The source passes a random0–360value directly to Math.cos/sin; the implementation preserves these radian calculations rather than silently converting degrees. Radius is300–500around387/387. Glitter1555–1603uses500–800ms cubic entry,scale0.1→0.5–2.5,then a twice-as-long cubicOut alpha fade and a random24-bit RGB replacement retaining texture alpha.

spin-wheel-sparkles.mjs reconstructs those poses with injected deterministic randomness for tests. The type2 controller suppresses new particles on exit and clears them on cancellation. The renderer tints exact atlas10 through a reused alpha-preserving canvas and draws particles after the wheel in source root coordinates. Input validation precedes canvas mutation. Unit tests cover source angle semantics,immediate/delayed spawn,entry/fade,spawn suppression and cancel. Headless checks verify actual red-tinted pixels,exact original redraw without trails,invalid alpha rejection and preserved transforms.

The Glitter class emits PLAY_SOUND synchronously before SpinAndGoldWheel attaches its signal listener; no extra bomb sound was inferred from that unreachable initial listener path. Physical native animation/sound parity still needs direct runtime evidence. Waiting-state base/ring sweeps and flares remain unimplemented.
