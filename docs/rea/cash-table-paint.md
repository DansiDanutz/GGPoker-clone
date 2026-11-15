# Table View: native row paint and counters

PR255 merged `701575947a010093e021bfdd6ccaed44ead04a02`; tested source `f64f1a3759cf62ad882d73ec41bdeef789efbc2a`.

Ordinary Hold’em Table View uses source-derived32px rows,4px radius, normal#242424/hover#2f2f2f/selected#3c1616, native Roboto15px for table name and14px for metrics. Names use#9c7cb5, stakes/default buy-in#fefefe and ordinary metrics#888. The original common277indicator is tinted Hold’em#12c012 at4×32. Label anchors follow the810px source coordinate system, normalized to the existing local parent; physical native raster is not verified.

PlayerCounterView uses original lobby90empty/lobby89filled97×9 textures at source503,11. Native masks start at−1 and extend capacity×11/occupied×11 pixels. Two decoded-RGBA-exact atlas crops replace provisional CSS rectangles. Real per-seat markers remain in the DOM for state/accessibility checks; the actual textures are painted through masks. Actual owner table names replace the visible “hosted” suffix. Ordinary default buy-in is shown instead of a VIP-style min/max range. Available zero metrics/rounded VPIP/large-pot rounding follow the source; missing metrics stay unknown.

13 exact-head checks/reviews passed: catalog/HTTP/private paint, syntax/diff, all130runtime and1364art hashes, six paint classes/seven font-chain classes, exact Swift RGBA readback and six font identities, inspected headless render, native color/geometry/normal/hover/selected/empty/full masks/default buy-in assertions, Table/Group arrows/Enter/double click, Group funding/retry/two windows and manual Join/preview/HUD, two hands with five computers, independently checked payouts, restart/reconnect and cross-room conservation. A source-checkout diagnostic saw an invalid WIN decode (complete=true,width=0) despite the same file hash; this was not reproduced in either final installed browser journey. Strict WIN assertions remain, with extra HTTP diagnostics; the source-checkout failure is not counted as passing or explained as a proven cause.

Guarded idle rollout PID99974→47241 preserved all6ownerfiles15,496bytes byte-for-byte, no live gameplay QA. Runtime130files1,480,168bytes;art1364files with1362verified immutable hardlinks plus2PNGs693newbytes. One small runtime snapshot;no dependencies/worktrees/models/downloads. Previous runtimes and art preserved. Markdown/report updated;generated HTML/inventories remain historical PR216.

PR257 implements the previously missing authenticated own/waiting-row orange/bolditalic states and confirmed waiting count; see [the current account contract](cash-table-account.md). Still incomplete: native operator play-money/featured/private/promotion variants, physical parent/raster/autoSlice/autoScale, native animation/audio timing and full-app parity. Authenticated identity is now mapped by PR257; nickname inference remains prohibited.

[Source/font/atlas identities](cash-table-paint-source.json).
