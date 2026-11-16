# Functional Critical Alert audio category

Original OptionSoundPage maps CriticalAlert to SoundType.NOTIFICATION. SoundItem preview whitelist contains NotificationTimeBank,NotificationTimeFFTPreFlop and TimeBankSound. The exact SWF SymbolClass/DefineSound payloads prove existing local ChessClock is NotificationTimeFFTPreFlop (character53) and TimeBankTick is TimeBankSound (character260),not merely similar names. Their bytes remain unchanged. The extractor --critical reproduces all three payloads and validates44.1kHz/native samples/MP3 sync/readback;only the missing NotificationTimeBank character51/6815byte MP3 is added to the installed pack.

Critical Alert is a real third category using the existing channel gain/persistence path. Both currently emitted clock cues and the third source-whitelist preview route through its independent gain. Volume0–100,enabled toggle,master mute/volume,Cancel/OK,cross-window sync,reload/cold restart and original preview lifecycle apply. Missing preferences default to enabled100percent,preserving legacy master-only gain;this is not a claim about the operator default. The new preview endpoint remains an exact allowlisted loopback/reference-only recording route.

Existing createClockAudio event/phase/cadence/expiry/mute/late-decode behavior stays unchanged. The third cue is available for preview;its native automatic bank-notification trigger is not fabricated. Other warning sounds declared SoundType.SOUND are not assigned to Critical Alert based on their names.

RED reproduced missing routing. Acceptance requires category/default/bounds/nonrepeat whitelist,actual clock-transition routing with unchanged cancellation,existing audio volume/preview guards,original endpoint bytes/private header,three actual browser cues sharing a distinct40percent gain,independent mute/re-enable,60percent draft preview with no storage writes,translated labels/accessible names,Cancel/reload/cold restart and full-hand payout regression.

Native six-category geometry,Voice/BGM/SnapCam transport,physical speaker/native timing and full-app fidelity remain incomplete. No new dependency,owner-data migration or poker-engine rule is introduced.
