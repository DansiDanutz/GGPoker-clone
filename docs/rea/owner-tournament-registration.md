# Owner tournament registration withdrawal

## Evidence boundary

This is an independent local owner feature, not a recovered operator admin workflow. The installed player client does not establish private administrator authorization, disqualification, fee forfeiture or payout policy. Bounded filename/term searches of the retained FFDec client exports found no disqualification/admin registration contract. Those negative searches do not prove that the complete native application lacks these features. No original account, native foreground window or external website was operated for this change.

The implementation reuses the already tested local player withdrawal/refund path. It is registration withdrawal before play, not disqualification after start; running-event disqualification remains open in FEATURES.md.

## Owner interaction

All hosted tables now expose **Manage seats**. Tournament rosters use **Withdraw registration** and identify the entrant by seat/name. A modal explains the entry refund and registration revocation. Cancel/Escape leaves the registration and wallet unchanged. Confirmation refreshes the roster, shows the actual entry refund, and records a named `withdraw-registration` audit event. Free or unfunded guest/computer entries report zero wallet refund; their virtual contribution still leaves the prize pool.

Withdrawal is available only while registration remains open: no started event, no dealt hand, no cancellation and no reached scheduled start. The deadline check also closes the race before the scheduler has ticked. Started/cancelled rosters remain inspectable with disabled withdrawal controls. This is an independent local admin interface; native pixel equivalence is not claimed.

## Backend, persistence and privacy

Reuse `GET/POST /api/owner-seats`, the existing local owner key, strict POST Origin/JSON/body-size checks, and the opaque owner-only subject plus exact room version. A public seated session cannot call this operation. Stale confirmations cannot remove a replacement or repeat a refund. The body cannot choose the refund amount.

For funded entries the existing `leaveSeat` moves the frozen configured entry cost back to the same account and reduces the prize pool by that entry. Free entries produce no zero-value wallet movement. The room and wallet persist together; a failed save restores both and revokes no registration. Successful withdrawal invalidates the seated token while retaining the normal local account login. Restart preserves the empty seat, balances and receipts. Audit append failure is reported separately from the already committed refund.

## Verification

- `node owner-registration-test.mjs`: RED missing owner capability, then free/37-chip refunds, pool reduction, failed-save rollback, token revocation, replacement/version protection, cold restart, scheduled deadline before tick and started-event rejection.
- `node owner-seat-http-test.mjs`: existing cash removal plus free/37 tournament withdrawal, authorization/origin/body validation, client refund override rejection, atomic failure/retry, one refund, restart, replacement isolation, active-event rejection and distinct audit entries.
- `node network-browser-test.mjs --owner-registration`: muted headless actual pointer confirmation/Escape, visible37 refund, empty roster/revoked token, cold restart, wallet receipts/audit and disabled controls after start.
- Existing cash-seat, tournament entry/wallet/pause and owner/player full-hand journeys guard adjacent behavior. All tests use temporary data, never a live owner's registration.
