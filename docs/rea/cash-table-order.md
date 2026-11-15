# Table View: native order and opening controls

PR253 merged `9adadd12205797c7157a4865859ee27a779c35f4`; tested source `9616b88c5d5b6113f036135747554a104b8c5c7a`.

Hold’em Table View keeps each actual hosted room separate and applies native-derived descending blind/minimum-buy-in/ante/capacity priorities, then descending actual player count. Equal or unavailable operator indices keep stable input order; no operator numbers are invented. Shared rule ordering preserves Group View behavior. Selection remains attached to the room href across refreshes.

ArrowUp/Down changes the selected row without wrapping. Enter and double click dispatch the local equivalent of native OPEN_TABLE: the actual room opens as a spectator. No join/autojoin intent, seat token, reservation or wallet debit is created. Seating still requires the existing explicit Join/buy-in confirmation. Handlers only apply to the current visible Hold’em list and actual row focus; modal form inputs and other catalogs remain separate.

All10exact-head checks passed: native SWF/five Table source identities and all130runtime/1362art hashes, model sorting/nonmutation/no aggregation, HTTP/privacy/player paint, real Table/Group keyboard and pointer actions, Group two-window funding/retry, manual Join/preview/HUD, two hands with five computers, independently verified payouts, restart/reconnect and cross-room conservation. The WIN geometry test pauses only its temporary payout animations during asynchronous image/glyph checks, then resumes and requires completion; reported phase timings from this instrumented test are not native timing evidence. Production payout timing is unchanged.

Guarded idle rollout PID58227→99974 preserved all6ownerfiles15,496bytes byte-for-byte;no live gameplay QA. Runtime130files1,476,593bytes;art1362reused with no new artwork. Two small runtime snapshots of1,476,593bytes each were generated; no dependencies/worktrees/models/downloads. Older runtimes remain preserved. Native timed/featured/private/currency/index metadata, physical same-size AIR raster, animation/audio timing and full-app parity remain incomplete. Generated HTML/inventories remain historical PR216.

[REA source identities](cash-table-order-source.json).
