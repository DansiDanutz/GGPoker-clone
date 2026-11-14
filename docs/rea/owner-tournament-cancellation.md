# Owner cancellation of running local tournaments

This is an independent local owner feature, not a claim about GGPoker’s unobserved private admin console. It is distinct from disqualification, which still needs a prize-eligibility policy.

## Player and owner behavior

The existing Tournament controls dialog adds Cancel tournament and refund entries. Confirmation names the event and explains that the current hand completes first, every paid entry is refunded, no tournament prize is paid, and cancellation cannot be undone. Escape/Keep tournament makes no request. A failed request requires Refresh before an explicit retry. Pause/resume are unavailable once cancellation is pending.

During a hand, the request changes only cancellation metadata. It does not fold anyone, move chips, alter cards or terminate the hand. Players continue using their normal legal controls and see the pending cancellation message. After the final action, the hand/history/payouts settle normally; cancellation then supersedes winner/prize finalization, clears pause/deal scheduling and refunds paid entries. At a paused/between-hand boundary, cancellation is immediate without changing the settled hand. A finished tournament cannot be cancelled retroactively. The current endpoint controls running events; prestart registrations retain their existing withdrawal flow.

Each paid human entry returns its actual configured entry amount. Free entries return zero; sponsored computer entries do not create human wallet credits. No tournament prize is paid, and no new hand is dealt. The player status identifies the local administrator cancellation and actual paid-entry refund. Prize result overlays are suppressed for cancelled events. The owner audit records the accepted cancellation request once; wallet refund receipts record actual settlement separately.

## Authority, atomicity and recovery

Existing `/api/owner-tournaments` accepts the exact cancel action through the same owner-key, Origin, JSON/body and current-version boundaries. No public room control route is added. Duplicates of an already pending/completed owner cancellation are idempotent and do not repeat refunds or audit writes. Stale unaccepted commands are rejected.

A hand-preserving owner control retains the hand action-version boundary, as existing chat/card metadata does. A player action based on the unchanged pre-notification hand stays valid; after a real action its old version is rejected. This avoids dropping a legal click merely because a cancellation/pause notification is still arriving. Actor, legality and real game-version checks remain authoritative; there is no automatic bet retry.

Room/hand/refund wallet writes use the existing atomic room checkpoint and rollback. Failed final writes and overflow on the third refund roll back both prior refunds and the final action. Pending cancellation persists across restart. Its strict `walletSettled:false` marker deliberately makes older runtimes reject the checkpoint rather than silently ignore cancellation and continue the event. The marker is cleared for an unfunded cancellation or becomes true after paid refunds settle. An actual previous installed runtime is checked to reject the pending checkpoint without writes and accept completed refunded data. Use a compatible runtime for recovery; never strip the marker to force an old runtime to load. Completed cancellation uses the existing cancelled/refunds representation plus ownerCancelled metadata.

## Verification and limits

- `tournament-cancel-test.mjs`: queued/paused/free cancellation, unchanged active/settled hands,111-credit refunds exactly once,300 game chips, no prizes/new hand, atomic request/final-write failures, third-wallet overflow rollback, restart, idempotence, invalid checkpoint and hand-preserving metadata versions. A deterministic all-in fixture settles300 chips to aces over kings/queens but refunds entries instead of awarding a tournament prize when cancellation was already pending.
- `tournament-cancel-http-test.mjs`: owner/cookie/Origin/body/version isolation, no public command, save failure, pending restart, three paid accounts/refunds, audit and cold recovery.
- `network-browser-test.mjs --tournament-cancel`: trusted pointer confirmation/Escape/503 retry, three separate signed-in player sessions, real Fold controls, cancellation suppressing prior pause/restart notices,111 credits refunded once,300 chips, no prize overlay/new hand, two server restarts and private wallet receipts.

All tests use temporary accounts, servers and muted headless browser contexts. No live owner tournament is cancelled by tests. Native private admin behavior, cancellation animations and tournament disqualification remain unverified/unimplemented.
