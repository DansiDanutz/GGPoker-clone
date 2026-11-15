# Native Group ordering and keyboard actions

PR251 merged `594d3199c75ad182bfe7ab09f17e38a661c17a82`; tested source `14829a494248557b381ab4c433a58f3f934a058f`.

Hold’em Group View follows the recovered native descending blind, minimum buy-in, ante and seat-count order for comparable local practice groups. Up/Down changes the selected real group without wrapping; Enter and double click open the existing Group confirmation without a debit. Other forms, hidden/stale catalogs and Table View are outside this keyboard handler. Native featured/password/currency/variant metadata are not invented.

All 10 exact-head checks passed, including source/runtime/art identities, catalog/HTTP/private paint, actual keyboard and pointer input, Group funding/retry/two windows, manual Join/preview/HUD, two hands with five computers, independently verified payouts, restart/reconnect and cross-room conservation. WIN coverage now measures one synchronous displayed frame before asynchronous image decoding; all glyph-overlap assertions remain. Runtime130files1,476,293bytes;art1,362files reused unchanged. Guarded idle rollout PID79331→58227 preserved all6ownerfiles15,496bytes byte-for-byte;no live gameplay QA. No new dependencies/artwork/downloads. Two small runtime snapshots were created during this task, each1,476,293bytes; previous runtimes preserved.

Physical same-size native AIR comparison, animation/audio timing, operator metadata and full-app parity remain incomplete. Generated HTML/inventories remain historical PR216. [Source hashes](cash-group-order-source.json).
