# Sit-out bank and Stats countdown — REA contract

Status: native client contract recovered; a finite local sit-out bank is not implemented. The existing local unlimited-duration pause remains unchanged. A blank Stats duration is not evidence that a cumulative elapsed-pause counter should be added.

## Evidence and interpretation

Seven classes were freshly exported headlessly from the installed Game/51 IronDesktop.swf using existing FFDec/Temurin. [Source byte identities](sitout-bank-source.json) bind the inspected files; no native window was opened. As elsewhere, installed-artifact identity does not prove the module actually loaded in the earlier native capture.

`StatusView.initSitOutTime` excludes tournament, Rush and AoF Sit-and-Go players. For other players it takes `kickOutTimeRemaining`, adds `sitOutAddedDuration` only when `sitOutTimeAdded`, then formats `ceil(milliseconds/1000)`. The ordinary field is remaining time in a seat-removal budget, rather than accumulated time spent paused. `setSitOutTime` follows the same normal-game scope; its excluded branch writes the time-bank cell instead of the sit-out cell. This exact source discrepancy is recorded without declaring a native runtime defect or copying it locally.

`TablePlayer.kickOutTimeRemaining` returns the static `sitOutBankRemaining` while not sitting out. When sitting out, `kickOutEndTime == -1` returns the maximum double sentinel. Otherwise it returns corrected deadline minus current time, subtracting an additional elapsed hurry interval when `hurryTimeStart >= 0`. `sync` reads the server's `KickOutEndTime` and initializes the static bank from that timestamp (or the sentinel). A per-second Stats redraw alone does not establish the operator's bank allocation or refill policy.

`OnSitOut` protocol4009 uses the server's `KickOutTime`, sets the actual player's status and balance, initializes both deadline fields, resets the status to Default, and forwards the transition to the table mediator. It ignores Rush sessions. The callback requests speed2 when players are waiting, but the inspected TablePlayer setter always stores1. This prevents treating the apparent waiting-list branch as proof of a working double-speed runtime policy.

`OnChangeSitOutState` protocol4039 synchronizes the server-supplied player first, sets a local added-duration field to30000ms for a non-default state, assigns the supplied state and refreshes seat/user presentation. This establishes a thirty-second client display term. It does not prove free/cumulative server extensions, the authoritative deadline update rule or repeated-toggle entitlement. An elapsed-time counter or a blind30-second server extension would change the meaning.

## Current local behavior

The local seat/room policy has unlimited sit-out duration; Stats therefore leaves Sit-out time unavailable. Existing native status choices, actual next-hand pause, return, global scope, private ownership, retained chips and safe cash-out remain their existing implementations. No timer, expiry, status extension, forced departure, wallet write or backend schema was added in this investigation. Session duration and time-bank cards are separate working counters and must not be presented as this bank.

Before enabling a finite bank, establish or explicitly specify the independent owner's initial allocation, start/stop/refill rules, actual-versus-requested pause boundary, added-state entitlement, waiting-player acceleration, expiry notification and atomic seat/wallet release. Require restart-preserved authoritative deadlines, disabled/default unlimited compatibility, exactly-once cash-out/refund and no interruption of a still-owned active hand. Browser counters must follow server state, remain private where appropriate, and not reset on refresh or panel reopening. Native operator bank values, expiry semantics and physical timing are still unverified.

## Coverage audit alongside this investigation

The parity table previously still listed Rabbit history and durable Battle bounty history as missing/unreleased. Rabbit history/PNG is already released in PR276, and all-board/awarded-run RIMT history in PR277. The current installed Battle code also includes the durable public archive introduced by commit478568d. A fresh isolated audit of its history, room and HTTP suites passes: actual award hands survive eviction of the HUD cache and restart; reads are immutable; private hole cards, traces, subjects, tokens and inventory tickets are excluded; corrupted archive shape, duplicate rows and ledger-share mismatches reject; wallet/inventory/hand writes roll back together;600gamechips/150prizecredits/14bountycredits remain accounted for without duplicate awards. This is local functional verification, not a claim that the private native server or physical UI was reproduced. No live game state was changed.
