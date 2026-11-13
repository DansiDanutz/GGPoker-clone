# Time Bank: shared live display

## Evidence and difference

Native StatusView.initTimeBank formats ceil(TablePlayer.timeBankRemaining/1000). TablePlayer.timeBankRemaining subtracts current time from timeBankEndTime, clamps bank phases to the saved pool and HotTime to hotTimeDefault; disabled/other phase policies are separate. These are retained static source observations, not native runtime measurements.

The local avatar clock already counted down from the authoritative clock.bankEndsAt/deadline. Stats instead read hand.timeBanks[me], which is the saved pool at turn start, and stayed at the initial value. In HotTime that saved pool is zero even while a positive HotTime countdown is active.

## Implemented

Shared gameClockRemaining in felt.mjs now supplies both avatar digits and Stats. It uses the active actor’s remaining time, clamps negative values and the local action deadline, and prevents client-clock skew from showing more than the saved bank. Inactive/settled seats use saved snapshots; unavailable values stay unknown. HotTime uses its active countdown. This preserves the existing local server policy, including the cap freeze until the server resolves an expired action.

Stats invalidates its render key at second boundaries even when session-start metadata is unavailable. Other panel tabs do not gain timer-driven repainting. No grants,spending,deadlines,manual extension,automatic actions or persistence rules are changed.

## Verification

Portable tests cover active/inactive/settled clocks,HotTime,deadline clamping,clock skew,unknown values,minute rounding and immutable inputs. The six-session --time-bank --hosted browser test opens Stats during a real turn,observes a changing value matching the avatar,proves the same hand,then exercises a finite manual extension,reload/no duplicate grant,unequal all-ins/fold/payout/restart/replacement. --clock-exhaustion verifies that Stats shows positive HotTime after actual bank exhaustion and continues through red digits,private audio,mute/action stop,payout24/720-chip conservation and restart.

An initial preliminary cap-cue cadence assertion failed; a sequential rerun passed. Its assertion now reports actual cue timestamps if it recurs; no unproven cause or threshold relaxation is claimed. Commit-bound evidence records the final run separately.

## Remaining scope

This fixes a stale local display; it does not establish native policy parity for classic ExtraTime,disconnection extensions,paid/free TimeBankCard,operator refills or actual native sound/animation cadence. Local inactive-zero/HotTime lifecycle remains its existing explicit policy. Native physical comparison is still unavailable under the background-only constraint.

A separate final replacement assertion read next.hand.bigBlindSeat although the public room view does not expose it. The fixture now derives the prior big blind independently from button and public dealtSeats (heads-up versus multiway),then verifies clockwise funded-seat rotation. It asserts that the derived seat is an integer. The engine rotation is unchanged; no assertion is removed or weakened.

The first commit-bound run reached a separate rebuy-dialog timeout after a player busted. The fixture had separate enabled/value/click browser calls; it now checks current eligibility and submits atomically in one browser turn,then still requires the exact pending120-chip server state. Expanded failure diagnostics include dialog validity,input bounds,busy state and browser errors. The cause of the original timeout is not claimed proven; production funding code is unchanged,and the failed receipt is retained.
