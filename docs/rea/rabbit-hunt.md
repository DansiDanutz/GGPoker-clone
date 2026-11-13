# Rabbit Hunt: local counterfactual community cards

## Recovered client path

FFDec exports from the installed Game51 IronDesktop.swf establish OnRabbitCard (callback4017) → RabbitCardInfo → TableMediator.dealRabbitCard → TableAnimator/motion view → CommunityCard3D.openCards. The callback returns without a seated userPlayer. Rabbit cards are separate from the played community cards; RabbitCardInfo carries both the full hypothetical community and the extra cards. This is static source evidence, not a live native hand observation.

CommunityCard3D initially piles the missing cards at their first missing slot. On activation it spreads them to their normal positions using its0.3s cubic easeOut. It opens Rabbit covers and emits the single RabbitCard sound for one missing card, RabbitCardDouble for more than one. It registers the cover with HotKey.RABBIT_CARD; actual native default key was not recovered.

NewRabbit3D uses new_card0000 and card0041. The base is122×162, the rabbit glyph77×138, centered at61/81. Source tint is0x172924; the folded reverse uses0xab9091. Card3D centers and scales the Rabbit cover1.01. The idle glyph moves scaleY1→0.9 over0.3s cubic easeIn and back over0.3s cubic easeOut. Activation stops that loop. openCover starts at the top-left and changes x→140 linearly and y→50 with cubic easeIn over0.2s. SqueezeCover3D places the inverted half-plane mask at the midpoint and reflects the reverse around the fold line (rotation2×angle,negative scaleX). The local SVG uses those point/mask/reflection equations. Native Shadow3D/filter rendering and fresh physical pixel comparison remain unverified.

## Exact retained media

The extractor reads the installed card ATF/ZIP, validates all plane lengths and frame bounds, and retains frame-only decoded RGBA. This card atlas uses raw-DXT5 ATF version3 with four plane records per mip, whereas the existing table atlas uses version2/three planes. The bounded decoder now validates both observed layouts; self-checks cover exact known pixels and rejection of a missing fourth plane. This is not general support for every ATF compression format.

Embedded DefineSound symbols SoundRabbitCard/id120 and SoundRabbitCardDouble/id121 provide unmodified MP3 payloads. Both are44.1kHz with zero seek offset; declared samples are13824 and27648. The extractor records source SHA256, media hashes, sizes and sample counts privately. The browser decodes the actual served clips and checks one matching playback start per successful reveal. Routing to the existing Table Sound channel is local integration; native channel defaults and physical speaker timing were not observed.

## Explicit local policy and privacy

Only an actually dealt, identity-bound participant in an ordinary hosted Hold'em/PLO/PLO5/PLO6 cash hand can preview Rabbit cards after that hand has ended with0,3 or4 real community cards. Active hands, full boards, spectators and players seated after the hand cannot reveal them. AoF, Short Deck, tournaments, Rush, double boards and native operator-specific availability remain outside this first implementation.

The private POST /api/rooms/:id/rabbit requires the seat token and, for profile-backed seats, the matching local profile identity. It accepts only the completed hand number and optional valid version. The hand number rejects stale requests. Existing room boundaries reject foreign Origin, wrong method/content type, malformed JSON and bodies above2048bytes. Unknown command fields reject. An old action can never reveal the next hand's deck.

The server copies the remaining deck/board and reuses the actual burn-and-street routine. Neither the real deck nor the played board, bets, ranks, payouts, wallet, result history or statistics change. The saved per-seat boolean records only that viewer's reveal. Repetition is idempotent; failed save restores the old mask. Cold restart preserves that completed-hand preview; a new hand resets it. Unsupported reveal checkpoints reject.

The recovered callback excludes spectators but does not by itself prove the private server's full sharing/broadcast policy. Local previews therefore remain per participant: another player can request the same hypothetical cards independently, but receives none before their own request. Reopening a revealed hand restores its peeled preview without replaying motion or sound. Shared native reveal notifications and exact operator protocol behavior remain unproven; this policy is documented rather than described as native parity.

## Controls and presentation

| Control/state | Actual local result | Evidence/limit |
|---|---|---|
| Rabbit cover | Authenticated request for the current completed hand, followed by missing-card spread/peel | Native card/glyph and logical board positions; filters/physical raster unverified |
| Configured Rabbit Hunt hotkey | Same enabled cover action; Functions/global/typing/modal guards apply | Source RABBIT_CARD registration; starts locally unassigned |
| Enter on focused cover | Native HTML button activation of the same request | Keyboard accessibility; no separate game mutation |
| Pending payout | Cover remains disabled until the existing award sequence completes | Local integration with previously recovered payout processor |
| Request failure | Error shown, cover re-enabled, no optimistic cards or sound | Injected browser failure and atomic backend failure gates |
| Reduced motion | No idle/spread animation; final peel frame shown; sound preference remains independent | Accessibility behavior, not an assertion of native OS preference handling |
| Spectator/nonparticipant | No control, future-card data or hypothetical faces | Conservative local privacy boundary |

The hypothetical faces occupy a separate layer; the played board remains unchanged. They cannot be used as ordinary community reaction targets. Card theme/suit rendering reuses the existing card compositor. Complete native squeeze interaction/shadows, Rabbit-aware HandRank/history variants and all format policies remain open.

## Verification

- rabbit-test: independent fixed preflop/flop/turn runouts including burns, engine deck/board immutability, live/full-board/insufficient-deck rejection and300-chip folded hand.
- rabbit-peel-test: source linear/cubic point, half-plane inclusion, orientation-reversing isometry, fold-axis reflection and fixed mid-frame70/6.25.
- rabbit-room-test: three streets and Hold’em/PLO/PLO5/PLO6; account/token/participant/stale-hand/body guards; late-seat/spectator privacy; exact remaining cards; failed-write rollback; idempotence; played results/wallet unchanged; invalid checkpoint; restart; next-hand reset.
- rabbit-http-test: actual ephemeral server method/Origin/profile/token/JSON/size guards, privacy, no active leak and restart.
- network-browser-test --rabbit (also --plo): three isolated contexts, flop-two and turn-one cards, source geometry at850/1196, trusted pointer, rejected-request recovery, configurable H/Functions guard and Enter, reduced motion, exact double/single audio signatures/sample durations once, unchanged payouts/360chips, reload without replay and cold restart.

All gameplay uses temporary data and muted headless Chrome. No live owner hand, private server or real-money account is exercised.
