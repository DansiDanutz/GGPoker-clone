# Owner table monitor and tournament standings

## Evidence boundary

This is an independent local administration feature. The installed player client does not expose the operator's private admin console. No native admin pixel, authorization or disqualification policy is claimed. It completes part of local hosting using the existing authoritative room, tournament and wallet records.

## What the owner sees

Manage seats now opens a monitor for the selected hosted cash table or tournament. Its summary shows the hand number, phase, current pot, chips in seats plus the live pot, and big blind. Tournament summaries also show the current level, prize pool and a pending pause request. Rows show each player's seat, name, computer marker, remaining chips, current committed chips, state and whose turn it is. Eliminations expose the recorded finishing place; settled prizes appear only when the tournament has actually awarded them.

The live pot is included in chip conservation while a hand is active. After settlement it is zero because those chips are already in player stacks; counting the historical pot again would duplicate them. Registration chips are configured starting stacks, not wallet balances. Prize credits and tournament chips are separate quantities.

Refresh seats requests a fresh snapshot. Close monitor clears the private rows and stops polling. Visible monitors refresh every1.5seconds without recreating unchanged player rows or text nodes, reordering unrelated controls, moving focus or refreshing the entire table catalog. Polling pauses while the document is hidden or a seat-removal confirmation is open. It resumes on visibility and reconnect. A failed read disables removal controls until a successful fresh read. Requests have five-second timeouts. No mutation is automatically retried.

Changing the owner key or closing the page clears the monitor context. A generation/key guard discards late responses after closing, switching tables or changing credentials. Unauthorized polling clears the monitor. Existing withdrawal/removal confirmations, subject/version checks, refunds and audit handling remain in force; monitoring does not introduce mid-hand removal or tournament disqualification.

## Backend and corrected lobby behavior

The existing owner-authenticated GET `/api/owner-seats?table=...` returns a `monitor` projection plus enriched owner-only rows. It does not expose hole cards, decks, account identifiers, player tokens or cookies. Public seated routes cannot request this owner operation. The projection uses recorded stacks, commitments, elimination places and prizes; it does not issue a betting or wallet command.

Investigation reproduced a separate lobby bug: on a later tournament hand, an eliminated player has no dealt cards. The shared seat-balance helper treated that as a waiting cash seat and substituted the configured starting stack. The tournament branch now always uses the actual recorded hand stack, including zero, so both the owner monitor and public selected-table preview agree with the engine. Cash waiting/buy-in behavior keeps its existing path.

## Verification

- `owner-monitor-test.mjs`: missing-monitor RED gate; actor/pot/stack projection, repeated immutable/private reads, pause, cold restart, a controlled unequal-stack elimination, the eliminated-zero preview regression, completed three-player funded tournament, exact111-credit prizes and wallet/restart idempotence.
- `network-browser-test.mjs --owner-monitor`: three separate player browser sessions and an owner session, real owner pause/resume controls, actual betting clicks, independent full-hand payouts,60-chip conservation,75-credit terminal prizes, standings, stable rows/text/focus, server shutdown/reconnect, closed-monitor and changed-key late-response rejection, owner-only access and absence of a public monitor route.
- Existing cash removal, tournament registration/refund, wallet, multi-seat tournament and owner/player journeys remain regression gates. All gameplay uses temporary data and muted headless Chrome; no live owner registration or hand is changed by these tests.

Native admin parity, disqualification/forfeiture policy, multi-table tournament hosting and complete native physical/sound comparisons remain open requirements.
