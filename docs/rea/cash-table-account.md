# Table View: authenticated playing and waiting states

PR257 merged `03fa48656abc04850ecd0fa331d2ed43239e4117`; tested source `09f34fe014274c07f6f2490b2744999e7aa93c02`.

Hold’em Table View now uses authenticated server identity to paint every room where the account is seated or queued. Native TableInfo compares waiting UserId with Account.current.id; TableCell refreshes on playing/waiting changes and TableCellRenderer combines the flags. Metrics use original #ff8932, bold and italic with the already installed native Roboto Bold Italic. Table name stays ordinary purple/regular; counter shapes stay unchanged. Selecting another room does not remove the account’s actual status.

The existing cookie-only read-only preview-paint response adds only the current account’s waiting boolean. Actual me identifies a seat; waiting comes from that account in the real room queue. No matching nickname, anonymous seat token or public waiting-player names grant the style. The endpoint still excludes note text, cards, hands, statistics, labels and seat tokens. No new endpoint, asset, font, wallet operation or admission permission was introduced.

The private cache covers actual occupied or queued Table rooms, including a queued room after all seats empty. Same-account unchanged rosters retain paint while other rooms refresh; affected roster/account/view changes abort and invalidate old reads. Account mismatch, malformed boolean and failed reads clear stale status. The selected row’s Wait count uses the confirmed waiting response immediately: 1 after Wait and 0 after Cancel, without waiting for the next public catalog poll. Other updates retain the existing two-second cadence; native notification latency is not established.

All 17 exact-head checks/reviews passed: private HTTP schema/auth/origin/logout/no-write and mucked-card guards; persisted FIFO/offer/expiry/cancel/admission; cache actor/stale/malformed/empty-queue/retained-room cases; source/runtime/art/font identities; real own-row native style and separate observer Wait/Cancel/count/no-seat/no-token/no-debit; Table/Group keyboard/Join, two funded windows/replay, manual Join/preview/HUD, two hands with five computers, independent payouts, restart/reconnect and cross-room conservation. Own and corrected waiting renders were visually inspected. The earlier waiting-count 0 render was kept as regression evidence; final count assertions prove 1/0.

Guarded idle rollout PID 47241→27857 preserved all six owner files (15,496 bytes), with no live gameplay QA. Runtime: 130 files, 1,481,557 bytes. Existing 1,364-art pack reused unchanged. Two small runtime snapshots were generated in this task (1,481,476 and 1,481,557 bytes); no dependencies, worktrees, models or art downloads. Previous runtimes remain preserved. Generated HTML/inventories remain historical PR216; Markdown/report are current.

Full app parity is incomplete. Native physical parent/raster, autoScale/autoSlice, notification/animation/audio timing and operator brand/featured/private/promotion variants remain unverified or unmapped. The existing local queue expiry/admission policy is not a claim about the operator’s private backend.

[REA source identities and local mapping](cash-table-account-source.json).
