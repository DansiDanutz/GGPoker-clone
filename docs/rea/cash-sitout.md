# Cash-table Sit Out — implementation checkpoint

Ordinary hosted Hold’em/PLO tables now support a private next-hand pause flag. The current hand remains unchanged. Paused players retain their actual stack, receive no cards or forced contributions on the next hand, and do not block the other players’ Ready gate. At least two funded, active seats are required before a deal consumes pending funding. Resuming during a hand takes effect at the next deal.

The table settings checkbox and existing Sit Out hotkey dispatch the same authenticated operation. The control is hidden unless the backend advertises support. Seat balances use the server’s identity-bound balance rather than the initial buy-in for undealt players.

## Evidence and limits

REA retained static source: `SitOutCommand.as` uses `SitOutNextHand` for ordinary cash; `SitOutMenuView.as` binds `HotKey.SIT_OUT_NEXT_HAND`. This is not evidence of native AIR runtime timing or operator missed-blind policy. Global pause, next-blind pause, native menu placement and full pixel parity are not implemented by this checkpoint.

`room-sitout-test.mjs` covers Hold’em and PLO: next-hand-only scheduling, private flag, 126-chip retained/cashed balance, replacement isolation, two-active minimum, validation/authentication, write rollback, cold restart and resumed deal with conserved 360 chips. Existing wallet, add-chips, rebuy, Ready, sparse-seat, positions and tick tests pass locally.

Additional verified scenario: five computers continue across multiple hands while their host pauses; after checkpoint reload, resume enters the next hand with the same held balance. A regression exposed the end-of-hand Ready reset clearing that resume request; the reset now preserves eligibility only for an identity-bound player who was actually sitting out and has requested return.

`node network-browser-test.mjs --cash-sitout` passes on an ephemeral HTTP server and headless muted Chrome: actual checkbox and assigned S key pause/cancel, page reload, backend restart, current hand unchanged, private desired flag, and token/origin/body/method rejection. This test exposed a checkbox disabled by render-time busy state; control capability now determines availability.

Pending before publication: final review and commit-bound QA. No live owner data or runtime has been changed.
