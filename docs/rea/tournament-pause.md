# Local owner tournament pause

## Native static evidence

Existing FFDec exports of IronDesktop.swf/Game51 expose separate callbacks: OnTablePauseReserved (4109) emits TABLE_PAUSE through SHOW_TOURNEY_ANNOUNCE_STRING; OnTablePaused (4036) handles actual pause types. Its Admin branch displays TOURNEY_PAUSED with the private/default pause message, optional resume time and break dealer marker. Its resume branch removes that notice and conditionally shows TOURNEY_RESUMED. OnTableBlindPaused (4097) separately applies BlindPauseInfo to the current blind structure, using its remaining duration and pause/resume timestamps.

These are static client observations. They do not establish the remote admin UI, authorization, server transition timing or whether every table pause also freezes blinds. Original source remains private under Sandbox/rea-tools/player-source; no proprietary source is committed here.

## Explicit independent local policy

The owner console offers Tournament controls on each tournament row. Running events can be paused after the current hand; no wager, actor deadline or current hand is frozen. Resume before settlement cancels that request. Once settled, pause prevents the next deal and freezes the local blind schedule. Resume shifts the blind start by the actual paused duration and preserves the unused portion of the three-second between-hand delay. If the last hand determines a winner, normal finishing/prizes take precedence and pause state is cleared.

The dialog reads fresh authoritative state and displays queued versus actual pause. Refresh recovers from another owner window or stale version. Player/spectator status distinguishes queued pause and actual pause. This is functional local hosting, not an assertion of native admin visual parity.

GET/POST /api/owner-tournaments requires the existing local owner key; mutations additionally require exact local Origin, JSON, a bounded object, a known hosted tournament and current version. Commands are limited to pause/resume. Identical desired-state retries do not increment versions; stale opposite commands reject. Writes use existing room atomic save/rollback. Changed commands append the owner audit; audit failure is reported independently of saved state. Paused state is validated on reopen and survives process restart.

## Verification

- tournament-pause-test: failing gate before implementation, queued/cancel/idempotence/stale command, unchanged hand, failed-write rollback, frozen blind schedule, persisted pause/reopen, remaining delay, invalid checkpoint rejection, final-hand winner precedence and 300 chips/75-credit prize.
- tournament-pause-http-test: ephemeral server, owner/origin/content-type guards, queued→actual pause, no new hand across cold restart, resume, complete three-player tournament, 300 chips, 75-credit prize, audit and terminal restart.
- network-browser-test --tournament-pause: real owner dialog, three isolated player contexts, queued/paused statuses, cold restart/reload, owner resume and next-hand chip conservation; muted headless Chromium only.

Native physical rendering, notice artwork, sound/timing, remote admin policy, scheduled breaks, hand-for-hand and multi-table synchronization remain unverified or unimplemented. No live owner game is played by these tests.

## Native table notice

Additional source exports establish NoticeType.TOURNEY_PAUSED as an infinite notice and TOURNEY_RESUMED as SHORTLY. OnTablePaused's Admin refresh builds two translated lines when there is no custom message or resume time: MoblieTournamentHansBeenPaused and MobilePleaseWaitTournamentResume. DesktopNotice uses desktop player_cell0100, background alpha0.8, 28px white nonbold text, label width viewport−240 and x120, minimum height100 or label height+30. DesktopNoticeView centers the one-notice layer using `(viewport.height−(height+5))>>1` minus18. Local CSS follows that relationship in the existing1700-coordinate table; Flash integer rounding and actual native font raster remain unverified.

NoticeDuration.INFINITY has1second fade/no expiry. DesktopNotice uses cubic easeOut on appearance and easeIn on dismissal; no new sound is established by these sources. The local notice appears only on actual persisted pause, remains stable through polling and language changes, and fades on resume. Reduced-motion immediately applies the final visibility. The notice is noninteractive and uses text-only translated labels. The separate queued TABLE_PAUSE announcement and transient resumed notice are still not reproduced: their full presentation/queue lifecycle is separate evidence.

The extractor independently verifies exact decoded RGBA of the699×10 desktop background frame and records source hashes privately. Browser checks measure width1700,label1460,font28,minimum100,center relationship,pointer pass-through,FR catalog changes,stable DOM/no repeat animation,three isolated players and cold restart/resume. These measurements demonstrate source geometry,not fresh native same-size pixels.
