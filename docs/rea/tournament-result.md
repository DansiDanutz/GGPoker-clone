# Tournament result — work in progress

## Native evidence

Retained IronDesktop SWF source: TourneyRewardPopup ordinary viewport 360 × 611, RewardInformation, RewardResult and ShowTourneyRewardCommand. The command defers the reward until reward motion completes. EmptyAwardVo distinguishes missing award data from a concrete zero award; zero is eligible. Native final-table and winner backgrounds are table_popup0315/0316 (320 × 112), information panel table_popup0480 (24 × 24), ribbon table_popup0481 (264 × 31), from init_lobby/desktop_assets. tools/extract-result-art.swift validates frame dimensions, rotation and decoded pixel equality. Four crops are retained privately in Sandbox/rea-tools/result-art-20261114; copied additively into the private art directory and referenced by result CSS. Original atlas files remain private. The background switches between native final-table and winner states; the information and ribbon use the recovered dimensions and slice borders.

## Local implementation

The server records actual first-deal time independently of the blind schedule, which shifts on pause. Elimination and final timestamps survive persisted restart; missing legacy timestamps stay unknown. The result projection accepts only the current eliminated or winning player, conserves the prize pool and validates each award against finishing place. Pending awards do not claim wallet credit.

network.mjs invokes the result controller after drawing the table. An open result closes during chip motion, then can resume. Hidden pages defer opening. Polling preserves the dialog. Close dismisses it for the current identity/result; the Table settings button reopens it. Last Hand delegates to the existing authenticated private hand history. Identity loss removes the dialog. No token enters result text.

## Verification and gaps

Targeted model/DOM lifecycle and owner-monitor tests pass, including pause/cold restart, 111-credit accounting, wrong per-seat awards, hidden pages and chip-motion gates. The first full browser run exposed a missing static-module allowlist entry; fixed in server.mjs. A later run exposed an already-open eliminated-player result overlapping a subsequent payout; repaired with a regression assertion. Browser rerun PASS: three isolated player sessions, exact own ranks/prizes, no chip-payout overlap, stable polling, Close/reopen, 60-chip conservation and 75-credit awards, owner access controls and cold restart.

CSS currently implements partial source geometry only. Full artwork parity (branding and flag), reward font, Save/Share brand policy, Best Hand/Bad Beat semantics, native audio and physical timing remain unverified. Do not label this window pixel-identical or released. No live owner data was used.

Latest browser verification: own Last Hand opens each players actual final recorded hand, including the early eliminated seat. Dialog viewport is 360 × 611; Chrome decodes all four native crops at their original dimensions. Background winner state follows the actual winner. Native audio classes are identified but corresponding standalone MP3 files are absent from installed assets/sounds; embedded-source recovery is still needed. Added private art footprint: 168595 PNG bytes plus a small receipt; no dependencies or worktrees.

Avatar integration: source RewardInformation uses Avatar(48), ribbon-relative x24/y-26 and nickname x84/y96. With the source panel/ribbon offsets this becomes local summary x32/y70 and nickname x92/y96. The UI reuses felt.avatarSource through its caller, including validated uploaded local avatars. Unit lifecycle and three-session browser tests pass, including actual 48 × 48 geometry and the fixture avatar source. All owner-monitor cleanup checks also pass.

## Embedded result audio recovered

tools/extract-result-sounds.py resolves SymbolClass to DefineSound from the installed SWF, then extracts only the three MP3 payloads after their seek-sample header. It verifies SWF/tag lengths, MP3 sync, format, 44.1 kHz, exact known sample counts and saved-byte equality. Private output: Sandbox/rea-tools/result-sounds-20261114, with source/payload SHA-256 receipt. Native characters: FallResult142 (443520 samples), ResultFT143 (488448), ResultITM144 (510336); all seek offsets zero. Payload total784008 bytes. ffmpeg -v error -i <file> -f null - decoded each of the three successfully, with no speaker playback. No runtime audio files or mappings have been changed yet. These fallback cues do not establish country-specific winner BGM policy or measured native clock timing.

## Result audio integration

The controller plays the native FT cue for the winner, ITM for a positive award, and FallResult for zero. It uses the existing audio engine, with a current-window generation predicate to reject late resume/decode completion, and stops its own source on Close, Last Hand, identity changes or new chip motion. Polling does not replay it. Reopening activates a new cue. Local result sound uses the effects channel (explicit local policy; native channel assignment is not proven) and existing master mute/volume. Native sample limits are applied at 44100 Hz. HTTP serving retains the existing localhost/reference-only guard; private MP3 files were copied additively to the source-private and installed art directories, not committed.

Verification: tournament-result-test passes winner/ITM/zero mapping, late-decode cancellation and active stop; table-audio-volume-test passes native sample caps, effects routing and master mute; audio-channel-test passes. Full three-session owner-monitor/elimination browser scenario passes again, with Chrome headless and muted. Physical speaker playback, country-specific winner music and measured native event timing remain unverified. No live runtime rollout yet.
