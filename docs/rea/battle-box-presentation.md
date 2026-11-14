# Native mystery-bounty box presentation

Status: source-backed frame renderer and nominal clock verified in isolation; not connected to live bounty receipts yet. Financial settlement remains in battle-bounty.mjs/rooms.mjs. This renderer never selects a reward or derives a visual grade from its amount.

## Evidence boundary

Sources were exported with bounded FFDec from installed Game/51/IronDesktop.swf into `/Users/davidai/Sandbox/rea-tools/battle-royale-source/scripts`:

- `MysteryJackpotBountyBoxAnimationView`: overlay, award queue, winner positions and animation callbacks.
- `MysteryJackpotBountyBoxMovieClip`: named layer visibility, sound signals, amount/end frames and completion hold.
- `MovieClipBase`: elapsed-time clock, integer currentFrame and pause/stop behavior.
- `MysteryBountyBoxAnimationVo`: visual type selection from server-provided quality/effect metadata.
- `MysteryBountyEarnAmount`: amount font/size and reveal tween.
- `SoundItem`: exact sound asset names.

The animation resource is `Game/assets/after_lobby/mystery_jackpot_bounty_box_motion.swf`: 886788 compressed bytes,915699 decoded bytes, encoded30fps, root timeline1frame. SymbolClass83 is MysteryJackpotBountyBoxMotion with285frames. The named child sprites contain normal/light/fireworks169frame timelines and a292frame first/gold timeline. These are distinct from StageAssets table-atlas images and the table3D chip atlas.

## Source behavior

| Boundary | Recovered behavior |
|---|---|
| Clock | MovieClipBase is constructed with33milliseconds per frame. This is not33fps; the SWF header's30fps is also not the elapsed-time divisor used by this class. |
| Frame conversion | currentFrame is an integer conversion of elapsed/frameTime. The movie starts at offset0; the renderer clamps its first displayed frame to1. |
| Quality/effect | boxQuality>0 selects type4. Otherwise effectLevel3→type3,2→type2, all other values→type1. No amount threshold is established. |
| Before frame16 | first,normal,normal_light,normal_fireworks are hidden. Other original root artwork remains intact. |
| Type1 | normal plus normal_light at alpha0.3. |
| Type2 | normal plus full-alpha normal_light. |
| Type3 | normal, full-alpha light and normal_fireworks. |
| Type4 | first/gold only. |
| Amount reveal | CHANGE at frame121 for types1–3, frame205 for type4. |
| Terminal frame |169 for types1–3,285 for type4; pause then delayed completion after1second. |
| Queue | Each completion advances the next award. Remaining-box indicator is shown while more awards remain. Reset clears queue/callbacks and stops the clip. |
| Overlay | Black alpha0.6, starting at y30. Box anchor is viewport.width/2,viewport.height/2+30. |
| Winners | Container y180; alpha0→1 over0.5s. Positions: one(0,0); two(±205,0); three add(0,122); four use(±205,0)/(±205,122). The native fallback for more than4 reuses its last position; no improved layout is claimed as native parity. |
| Winner row | StageAssets table385 background at x41,66px avatar,46px bold gold label at x91; container is centered using background width. |
| Amount | NEW_SPINANDGOLD_FONT,80px,white; container scale0.1/alpha0→scale1/alpha1 over0.5s with easeOutBack. |

These are static nominal boundaries. Live Flash sampling, jank, operator speed overrides, parent viewport calibration and physical frame/audio alignment remain unverified. The current renderer covers frame/layer selection, not the complete overlay/winner/amount/queue composition.

## Artwork reconstruction and checks

Selected sprite83 frames1–285 were exported as SVG into `/Users/davidai/Sandbox/rea-tools/battle-box-frames/DefineSprite_83_MysteryJackpotBountyBoxMotion`. Raw frame bytes total229010687. `tools/pack-battle-box.py` validates all285XML frames, exact1330.5×1318.95 bounds and669.35/1051.85 origin, named layer identity, executable-tag/event-attribute exclusions and external URL-attribute guards. It preserves canonical XML strings while deduplicating definitions and embedded PNG data URLs.

The private generated `home-art/native-battle-box.json` contains2365unique definitions and407unique PNGs in16240574bytes. Expansion was checked against every original canonical definition/body, including a direct comparison with the first undeduplicated pack. No geometry, transforms, colors, bitmap bytes or drawing order were intentionally changed. Tracked source/art hashes are in `docs/rea/battle-box-source.json`. Per-frame SHA-256 receipts are in `home-art/rea/battle-box-pack.json`; generated artwork remains private like the existing native art. Raw exports remain in Sandbox; no dependencies or additional checkout were installed.

`battle-box-render-test.mjs` checks quality/effect branches,33ms clock thresholds, layer onset, amount/end/hold boundaries and invalid inputs. `network-browser-test.mjs --battle-box-art` decodes all407PNGs and16representative normal/gold SVG frames, checks exact bounds/origin and all layer/alpha branches, verifies distinct low/full-light rendered pixels, and rejects out-of-range normal frames. It uses a disposable muted headless browser, not a foreground Mac-app capture. These checks establish source-art reconstruction and renderer behavior; they do not establish physical native pixel/frame parity.

## Sound availability and remaining integration

The freshly exported SoundItem binds types1/2 to `SoundMjbBnrNormalOne`, type3 to `SoundMjbBnrNormalTwo`, and type4 to `SoundMjbBnRGold`. The clip dispatches PLAY_SOUND when starting and STOP_SOUND when stopping. None of these asset files was found under the installed Game cache. No substitute sound was selected and no speaker playback was attempted.

Next work: connect the renderer to newly observed authoritative bounty receipts, suppress catch-up/reload replay, sequence it against chip payout/next-hand presentation, reconstruct winner/amount/remaining-box views from the proper atlas/font, and locate the exact audio resources. Local receipts currently lack native boxQuality/effectLevel metadata; their presentation must be explicitly defined without pretending the reward amount proves a native grade. Full native overlay interaction, animation/sound timing and live receipt integration remain incomplete.


## Connected local presentation (unreleased)

`battle-bounty-scene.mjs` observes new authoritative final-table receipts via a validated queue. Initial and replacement-session snapshots are silent. Existing chip awards finish before the modal starts; pending next-hand state and tournament result presentation wait until its queue completes. Reduced motion holds the final normal frame for one second. Hidden-page cancellation clears presentation only. Native winner/remaining atlases are extracted by `tools/extract-battle-box.swift`; the amount reuses the native result glyph atlas at80px. Winner-label fallback metrics and physical native timing remain uncalibrated. Receipts lack quality/effect metadata, so type1 is explicit local policy. No substitute audio is played.

Verification: `battle-bounty-queue-test.mjs`, `network-browser-test.mjs --battle-bounty-scene`, `battle-bounty-room-test.mjs`, and `network-browser-test.mjs --battle-final --battle-prizes --battle-bounties` pass. The scene browser fixture exercises silent initial receipts, chip gate, sequential modal completion, remaining count, amount visibility, duplicate suppression and async session cancellation. It does not prove whole-native pixel equivalence. Ordinary no-hand entry must not be blocked by an undefined hand number; explicitly covered by the scene test.

Release QA found and corrected a next-hand race: a held next-hand snapshot must refresh the bounty scene after chip nodes have gone, rather than returning without starting its queued animation. Otherwise the queue and pending snapshot wait on each other. The complete final browser regression covers this handoff.
