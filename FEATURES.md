# Parity tracker

Target: reproduce player-visible workflows using independent code and an owner-controlled backend. The installed PLAYGG.RO client is the visual reference. A feature is not complete until its flow is tested in this project.

| Workflow | Current coverage | Missing for parity |
|---|---|---|
| Lobby | List locally owned tables, show buy-in and blind, join an open table | Reference layout, filters, occupancy, waiting lists |
| Hold’em | Heads-up fixed-limit practice; blinds, betting, burn/deal, showdown and uncalled-chip returns. Four-seat no-limit practice with computer opponents, variable bets, unequal stacks, side pots and tied winners | Private network rooms support four humans, reconnect, durable stacks, auto-check/fold and hand review. Missing: public matchmaking and account-based seat recovery |
| Tournaments, Rush, Spin, Battle Royale | Reference labels observed | Rules, registration, scheduling, timers, payouts in play chips |
| Leaderboard | Private room standings (net chips over last 20 hands), durable hand results | Cross-room rankings and account identity |
| Owner console | Local owner key, create/update/close tables, durable settings | Multi-user permissions, audit trail, moderation, backups |
| Cashier | Reference label observed | No wallet, payment integration or real funds |
| Visual and platform fidelity | Original browser UI for macOS | Screen-by-screen comparison, accessibility and native packaging |

The operator’s private admin system was not observed. Admin workflows here must be specified and tested independently.
