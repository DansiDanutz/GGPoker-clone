# Recorded continuation-bet HUD

## Native evidence

Retained FFDec source `com/nsus/iron/table/view/popup/smarthud/HudAverageView.as` uses three 112px columns in a 368×116 panel, with 8px padding/gaps. Flop and Turn contain CB, FCB, CCB and RCB; the client receives CbRatio, FcbRatio, CcbRatio and RcbRatio. This is static source evidence, not observation of a native seated session. The operator's server formulas and population denominators are unavailable.

The source defines separate color thresholds (orange/yellow/green):

| Metric | Flop | Turn |
|---|---|---|
| CB | 31/51/71 | 36/46/56 |
| FCB | 46/56/66 | 26/36/51 |
| CCB | 11/21/31 | 16/26/36 |
| RCB | 6/11/16 | 6/11/16 |

## Local accounting

These percentages describe the recorded local table or Rush pool, never a claimed GGPoker-wide sample. Only completed hands with a complete supported action trace qualify. Missing legacy decisions remain unknown; a zero denominator renders `-`.

The previous street's last raiser is the aggressor. Their first decision on an unopened next street creates a CB opportunity only if betting is legally available. A raise counts as a continuation bet; a check declines the opportunity. Earlier opponent leads remove the opportunity. Automatic all-in runouts do not create decisions. A fully checked flop provides no aggressor for an immediate turn continuation: delayed bets are excluded from this local statistic.

FCB/CCB/RCB share a response denominator. Each opponent's first fold/call/raise facing the unchanged continuation price contributes one response. Once another player raises, later players face that re-raise and are excluded from the original continuation response sample. Short all-in calls count as calls. Turn samples follow the last flop aggressor, including a flop check-raiser. AoF is excluded.

Counters are recorded once by the ordinary room ledger and reconstructed from settled Rush records. HUD reads do not increment counters. Existing data is not migrated or rewritten merely to manufacture historical samples.

## Verification and delivery status

`node continuation-stats-test.mjs` covers actual engine actions, consecutive barrels, checks, delayed bets, leads, response types, multiway re-raises, short calls, all-in runouts and legacy/incomplete exclusions.

`node continuation-room-test.mjs` covers six seated local players, recorded opportunities/responses, read idempotence, persistence after reopening the room store, chip conservation and native color boundaries.

`node network-browser-test.mjs --continuation-hud` checks a real six-player hand and payout, own HUD at850/1196px, flop100/turn0 CB, call100/fold0/raise0 responses, unknown exclusions, native colors, sample titles and cold server restart. Release evidence must bind these checks to the PR head and installed artifact. Native operator denominators and seated pixel/sound parity remain unverified.
