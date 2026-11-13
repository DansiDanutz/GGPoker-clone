# Owner-controlled cash seat removal

This is an independently designed local owner feature. The native operator’s private admin console was not observed, so no native visual/backend equivalence is claimed.

## Controls and behavior

Each cash table in the owner lobby has Manage seats. The owner enters the existing local owner key; the roster includes occupied human and computer seats. Remove player is available only before a cash hand begins or after settlement. It opens an in-page dialog identifying the player and seat; Cancel/Escape performs no operation. Confirmation returns the player’s remaining local play chips and pending paid funding, revokes their seated token and refreshes the roster. The audit identifies the removed player, cash-out and pending refund.

A running hand cannot be interrupted, including when the target is paused. Tournament registration withdrawal before start is documented in [owner-tournament-registration.md](owner-tournament-registration.md). Cash Hold’em/Omaha and other hosted cash formats reuse the existing leave/settlement path. This feature does not implement mid-hand ejection, tournament disqualification or account bans.

## Backend and money boundary

`GET /api/owner-seats?table=...` returns current version, removal eligibility and an owner-only roster identity. `POST /api/owner-seats` accepts only tableId,seat,subject,version. It requires the local owner key, exact local Origin and JSON within2048bytes. The room’s public operation allowlist does not expose remove-seat. Identity plus exact version rejects stale confirmations or a replacement at the same index.

The store uses the same adoption/leave helpers as player departure. Room and wallet changes persist together; failed writes restore the previous state. Remaining stacks, pending increments and paid top-ups follow the existing cash-out/refund path. A duplicate stale request cannot return chips twice. The audit is appended after settlement; an audit-write failure is reported without claiming settlement rolled back.

## Verification

- `node owner-seat-test.mjs`: active-hand rejection,126-chip settled cash-out plus10 pending chips refunded once, save rollback, token revocation, other stacks118/116, stale replacement rejection, cold restart and computer removal without charging the host.
- `node owner-seat-http-test.mjs`: key/cookie isolation, Origin/JSON/body guards, no public room route, failed write/retry, pre-hand120+10refund, one audit entry and restart.
- `node network-browser-test.mjs --owner-seats`: actual trusted clicks, disabled active-hand buttons, Escape cancellation,126+10result, revoked player token, refreshed remaining roster and named audit.

All gameplay verification uses temporary server data and muted headless Chrome. The live owner’s table is never used for a removal test.
