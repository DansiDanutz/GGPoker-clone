# Battle Royale stage configuration — recovered contract

This is a static contract recovered from the installed client, not a claim that local Battle matches the native rules. Source identities are bound in `battle-stage-source.json`. No native account interaction occurred.

## Configuration and navigation

`BattleRoyaleType` receives a preset and passes its `StageList` to `BattleRoyaleStageInfo.setStages`. Non-null entries are indexed by `StageId`, not their position in the vector. The getters select stages1,2,3 explicitly. Actual preset values are supplied by the service and have not been observed here. No fixed nine-player final is established by this contract.

| Native field / getter | Recovered meaning | Local coverage / gap |
|---|---|---|
| StageId / StageType | Stage identity and declared mode | Local Rush → qualification → final phases exist; native mode mapping remains unverified |
| TableSize / getStageTableSize(id) | Seats at one table, separate from event population | Current final2–6 seats; independent per-stage native table sizes not supported |
| MaximumPlayers | Population limit for the selected stage | Local event capacity and finalSeats exist; native stage2 cutoff is not independently configurable |
| stage1MaximumPlayers / rushStagePlayer | Stage1 MaximumPlayers | Local event capacity is owner-defined, not a captured native preset |
| round1SurviveToTopPlayers | Stage2 MaximumPlayers | Local top(finalSeats−1) direct plus shootout is an explicit local policy, not proven native qualification |
| stage3MaximumPlayers / finalStagePlayer | Stage3 MaximumPlayers | The HUD literal /9 cannot establish this field or TableSize |
| DurationMinutes | Per-stage minute limit | Local Rush milliseconds only; native stage2/3 minute limits missing |
| DurationHands | Per-stage hand limit | Stage2 hand-based end condition missing locally |
| isStage2LimitHandMode | True when stage2 DurationHands>0 and DurationMinutes==0 | Native branch is explicit; no corresponding configurable local branch |
| StageEndTime | Server-provided stage deadline | Local start/duration deadline exists; no service-provided deadline reconciliation |
| UseChessClock / ChessClock | Declared clock use and allowance | General local clocks exist but are not wired to Battle stage presets; stage3 display divides ChessClock by60 |
| UseChessClockFromPreviousRound | Carry-clock flag | Missing Battle carry-over policy |
| BettingDuration / SandGlassDuration | Declared betting/sandglass durations | Field identity is known; effective native timer semantics and units are not established by declaration alone |
| TimeChipCount | Declared stage time-chip inventory | General local time chips do not establish Battle stage support |
| ChessClockBlindUpHandCount | Declared clock/blind hand-count setting | Effective native rule and local implementation missing |
| StartBlindLevel / getStartBlindLevel(id) | Per-stage starting level, getter fallback1 | Local single starting blind; independent stage level missing |
| StartBlindBBMultiplier / getStartBlindBBMultiplier(id) | Decimal per-stage multiplier, getter fallback0 | Native application formula and local support missing |

The getter fallback for missing MaximumPlayers/TableSize/durations is0; a missing stage is not evidence of a real zero-player event. `isStage2LimitHandMode` assumes stage2 exists and accesses its fields directly. Do not import malformed service data using that assumption in the independent backend.

## What must be proved before changing the engine

1. Obtain actual public/native preset values without joining or funding a real-money game; otherwise retain explicit unknown values.
2. Recover the stage-type mapping and callers that apply table size, clocks, blind level and multiplier. A protocol field alone is insufficient to infer its execution semantics.
3. Keep event population, advancing population and per-table seat count separate in validation, saved state and admin controls.
4. Add independent tests for stage boundaries, active-hand completion, clock carry-over, qualification, chip conservation and exactly-once prizes after restart before claiming parity.

Current local configuration and settlements remain unchanged. Physical native layout, animation and sound timing also remain unverified.

## Stage-change callbacks and presentation

The source inventory now binds9classes plus the installed localization table. `OnBattleRoyaleStageChanged` updates current StageId, type and status from the service callback. A Shootout deadline is kept separately; other deadlines update the corresponding stage. Rush Finished additionally supplies AlivePlayers, ShootOutPlayers and IsFinishedByTimeout. A nonempty alive list marks all Rush tables finished. The client does not compute those service-provided lists in this callback, so their ranking/tie policy remains unproved.

`BattleRoyaleStageChangedCommand` distinguishes Rush Ready, Rush Finished, Shootout Ready and FinalTable Ready. Rush Ready plays its ready-count sound once using an information flag, shows the top(finalStageMaxPlayers) notice with stage1 duration and marks pending stage start. Rush Finished suppresses end notices during catch-up and while the current hand is still playing; timeout copy receives stage3MaximumPlayers−1. End sound is separately guarded by round-one-complete and in-hand sound-enabled flags. Shootout Ready marks pending stage start. FinalTable Ready resets Battle mode and shows the bounty/prize notice only for a player not dropped out. Background and table menu refresh after the branch. NoticeType identifies these stage notices as infinite-duration, not a guessed timed toast. Original foreground activation is intentionally not reproduced by background automation.

English keys `RushStageToTopValue`, `RushStageEndType11`, `RushStageEndType22`, `FinalStageStartNotiValue` preserve placeholder-driven top count, duration, cutoff, paid places and highest bounty. Some other translations contain literal counts; that does not establish the actual preset. Local bounty-disabled/prize-unconfigured events must not display native claims of guaranteed awards.

`getStageStartingBlinds(stage)` reads StartBlindLevel, retrieves that blind-structure row and formats its small/big blinds. It passes StartBlindBBMultiplier separately into `BBAverageStack` (English explanatory average-stack text). This method does not recalculate blinds from stacks. Actual server blind computation remains unknown; do not implement a multiplication formula from the field name alone.

## Local all-in qualification notice

The local table now displays the source-keyed RushStageEndType22 heading/body during its actual `shootout` phase, using configured finalSeats−1. It requires a registered account and suppresses the banner while that viewer still has an unfinished hand. It clears when the phase changes; it has no arbitrary toast timeout or wagering handler. The local shootout only occurs when too many survived Rush, hence this branch does not guess a native nine-player limit. Repeated poll/recovered state displays current information without replayed sound or fade.

The existing native tournament notice background and placement are reused, with source32px gray heading/28px white body in stage-scaled units. DesktopNotice binds player_cell100, background alpha0.8, minimum100px height, text+30px sizing and center alignment; exact Battle-specific setting/placement, word wrapping and font rasterization remain uncalibrated. The source inventory now binds11classes. No new artwork was extracted.

Unit tests cover configured cutoffs, all other phases, guest suppression, unfinished hands, invalid seat counts, immutable repeat/recovery. Browser verification additionally uses a clearly labeled controlled shootout HTTP response during an actual six-player Rush journey, checks a nonblocking persistent banner and unchanged room bytes, restores the real response and verifies disappearance. This is controlled presentation evidence; the500ms event coordinator may finish small shootouts before a browser poll sees them. Native stage animation queues, ready/final introductions and source sounds are not implemented by this change.

The notice root uses data-native-notice-key as provenance, not the text-only localization hook: that hook replaces textContent and would destroy the structured title/body. This first version uses verified English copy; translated structured notices remain open. Browser testing detected and prevented that destructive interaction.

## Structured localization

The table localization adapter now reads the existing native catalog for this notice without assigning HTML. It accepts exactly two plain `<font>` text blocks, substitutes the current configured cutoff, and updates the two existing title/body spans. No font attributes are executed or inserted. Malformed/nested markup and templates missing a required indexed value fall back to the supplied English current-event text. The installed Polish string has a literal cutoff instead of `{0}`, so English is used for that branch to avoid reporting the wrong local rule. The other27 installed language templates retain the current cutoff.

The network renderer updates provenance/values/fallback only when the notice identity or cutoff changes. Repeated polling therefore does not reset a translated notice to English or replace its DOM. Unit tests check all28 installed catalog identities,27 parsed templates, Polish fallback and malformed markup. Browser testing switches the controlled current-stage notice to Romanian, checks the two retained spans/current cutoff and zero text-node mutations during subsequent polls, then verifies Polish safe fallback and return to English. Other native stage introductions, animation queues and sounds remain incomplete.

## Embedded stage sounds

SoundItem binds READY_COUNT to SoundBnRReadyCount and ROUND_END to SoundBnRRoundEnd. These are embedded DefineSound payloads in the installed IronDesktop.swf, rather than external files in assets/sounds. The existing bounded extractor now accepts --battle, resolving exact SymbolClass characters81/82 and pinning MP3 format,44.1kHz and native sample counts before writing private output outside the synced checkout.

| Clip | Native samples | Nominal sample duration | MP3 bytes |
|---|---:|---:|---:|
| BnRReadyCount |331776|7.523265306s|240872|
| BnRRoundEnd |72576|1.645714286s|26459|

Both seek offsets are0. Total extracted payload267331bytes. Source, payload and extraction receipt hashes are recorded in battle-stage-source.json. Read-only ffprobe confirms both streams are stereo MP3 at44.1kHz (container durations7.527250s and1.653687s, including encoding padding). Full ffmpeg null-sink decoding was blocked by the disk preflight at14.23GiB free, below25GiB reserve; it did not run. No speaker playback occurred. Files remain private under Sandbox/rea-tools/battle-stage-sounds-20261114 and have not been copied into the live runtime.

The native ready sound is gated by Rush Ready plus isMatchSoundPlayed. Round-end dispatch is inside !isCatchUp and guarded by battleRoyaleRoundOnePlayingComplete and inTheHandSoundEnable. An existing source banner or a generic state refresh alone is insufficient authority to replay either sound. The local engine does not yet expose the native predeal Ready interval, and long reconnection/catch-up must be distinguished from a newly observed phase transition before wiring auto playback. This extraction establishes exact clip identity and readable MP3 metadata only; full decodability, audible parity and timing remain unverified.

### Round-end dispatch continuity gate (not wired yet)

`battleStageAudio` now tracks witnessed Rush-to-closed transitions per participant session. Initial/recovered closed state consumes that session silently; repeat packets and stale Rush packets cannot replay it. Interrupt clears continuity, identity changes cannot inherit another player's transition, and returning to a consumed session stays silent. A caller-provided catch-up/hidden flag suppresses dispatch. Unit tests pass these cases. The function is preparation for transport/audio integration: it is not called by the live network renderer yet, and no new sound is claimed to play. Native Ready timing and the in-hand sound policy still require integration evidence.

### Round-end integration candidate

The continuity gate is now wired into Battle responses, with offline/hidden/error interruption and generation leases that cancel deferred audio after recovery or identity change. The source RoundEnd clip is served only in local-reference mode, routed to Sound Effect, and capped to min(decoded duration,72576/44100). A private APFS-cloned art snapshot adds only the26459byte clip (1284files). The ReadyCount clip remains unwired. Muted headless browser testing decoded the actual RoundEnd MP3 in memory and observed exactly one matching buffer-source start on a controlled Rush-to-shootout response, with no repeats across later polls/language changes; the full six-session600chip hand and restart passed. This is a saved integration candidate, not yet merged or live. Physical audible/native timing remains unverified; the earlier FFmpeg disk hold was not bypassed or retried.

### Browser transport recovery regression

The --battle-table acceptance now opens additional isolated targets in the test account context. It witnesses Rush, unlocks actual native audio, injects HTTP503 and then returns a controlled closed-stage response: no RoundEnd buffer starts. A pre-document interceptor holds the first closed-state read across page reload until after native audio is decoded/unlocked; releasing it also produces zero starts. A third target holds the actual RoundEnd HTTP payload after a witnessed phase transition, dispatches offline, then releases the payload; the invalidated lease prevents that late clip from starting. The existing positive control still starts exactly one native-matching buffer on an uninterrupted transition.

All three negative cases pass with unchanged room bytes and no page errors, followed by the actual six-player600chip hand/server-restart checks. No production fix was needed. These are controlled browser transport scenarios, not a physical native application/network/audio comparison. The existing installed runtime is reused because only the test and documentation changed.

### Full decoder check completed

After disk headroom changed, the exact null-sink FFmpeg command was rechecked and allowed at56.38GiB free. Both private BnRReadyCount and BnRRoundEnd decoded completely with exit0, no output artifact and no speaker playback. The prior hold remains recorded as history; fullDecodeTested is now true. This closes file-decodability verification, not native dispatch/timing or Ready implementation.
