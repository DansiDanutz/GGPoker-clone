# Spin player registration — local practice

The native Spin lobby evidence retains the two play-money stakes, 3-Max selection, quantity 1–4 and separate insurance control. Native registration and wheel evidence is catalogued in `spin-registration-runtime.md` and `spin-configuratie-nativa.md`. This implementation adds local account-backed registration; it does not establish pixel parity for the new queue/status controls or implement insurance or wheel presentation.

## State and trust boundary

`GET /local/spin` requires a local player session and returns the configured stake snapshots and that account's registrations. Owner audit reasons, funding and raw draw tickets are absent. `POST /local/spin` accepts the expected account plus an operation identity, buy-in and per-stake revision. The authenticated server identity determines the account; owner rules determine configuration and clocks. A changed expected account is rejected before mutation.

The server finds an undecided compatible group with room for a distinct account. Operation identities persist on entry records, including refunded entries. Replaying the same identity returns its current state; another account, stake or revision cannot reuse it. The third entry, crypto draw and real private tournament room are one persistence transaction. A failed write restores all wallets, exposure, registrations, draw and room state. Existing independent register/draw/start callers retain their previous transactional wrappers.

`POST /local/spin/cancel` accepts an expected account and registration ID. Only that account's waiting entry can be refunded. Repeated cancellation is harmless. Decided matches cannot be cancelled. Cancellation of the last waiting participant releases its operator exposure. Funded games retain their own rule snapshots across future owner updates.

## Lobby behavior

The uninsured Play Now control creates 1–4 operation identities and saves the pending list per account before sending any request. Each successful acknowledgement removes only that item after durable storage succeeds. Refresh/retry reuses the retained identities. Partial success remains visible in the server registration list. A definitive stale-rule rejection drops only the remaining unsubmitted batch so the player can inspect current rules and register again. Ambiguous transport failures preserve requests for retry.

Active registrations show participant count, Cancel while waiting, and Open table once a private room exists. Two-second polling runs only while the pane is open and no write is in progress; closing clears the timer and invalidates late responses. A failed or changed session clears the displayed private queue. Info uses configured starting-chip/card ranges and action duration where available. Insurance remains disabled.

## Verification and remaining work

- `spin-atomic-entry-test.mjs`: third-entry atomic creation, failed-write rollback, exact retry and cold reopen.
- `spin-queue-test.mjs`: matching, operation conflicts, per-stake revisions, cancellation replay, rollback and reopen.
- `spin-queue-http-test.mjs`: real server, three authenticated sessions, origin/type/account checks, one shared table, once-only cancellation and process restart.
- `network-browser-test.mjs --spin-queue`: three isolated muted headless contexts, real pointer Play/Cancel, dropped acknowledgement plus reload/retry, four-game debit/refund and restart recovery.

The browser test now follows the common Open table link, takes seats through real pointer controls and plays the three-account tournament to a winner. It verifies every completed hand with an independent payout oracle, 900 chips, finishing places, exactly-once signed wallet prizes and operator/player conservation. It restarts the server after the first game action and again after settlement; private cards, result and balances recover. This complements the standalone real-table test, which uses internal match seeding instead of public registration. Native wheel animation, insurance, disconnected seat recovery policy, exact registration layout and native timing remain incomplete or unverified. Production owner capital and settings must not be changed by tests.

## Lost-seat-session recovery audit

The full three-browser test additionally removes one player’s room token before the midhand restart. A real Take a seat click recovers the existing account seat, rotates its token and rejects the old token with401. The hand number, private cards, balance and entry count remain unchanged; play then reaches the same verified payout/restart checks. This proves recovery of a previously occupied seat, not automatic seating of a player who never opened the matched table.

Retained REA source was rechecked: RegisterSpinAndGoldCommand delegates to the tourney request layer after platform/table-count gates; SpinAndGoldStartupCommand.initView only constructs the table view and selects chip currency. Neither inspected method proves initial server seating, an absent-player deadline or a refund rule. The source paths/hashes and unresolved boundary are retained privately in Git QA metadata. Until stronger evidence exists, the clone still waits for all three first joins; it must not silently refund a decided prize or invent an absent-player elimination rule.
