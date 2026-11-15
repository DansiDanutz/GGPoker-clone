# Hold’em preview: native surface and actual buy-in range

PR260 merged `dda375efc44fd7fe67c6206033bbec1b144dc560`; tested source `15024c8eb88d136a1f3d44eb2220f42f74e2e408`.

The ordinary local Hold’em Table preview now uses the original `lobby_preview0000` texture (223 × 351), decoded-RGBA verified against the installed atlas. TableViewComponent selects this texture and defaults to scale 1.08; HoldemTablePreview does not override it. The CSS paints 240.84 × 379.08 at the existing preview origin instead of stretching the legacy photo to the parent.

The center label always uses the source `MobileBuyInRange` key, native Roboto 12 and #ebf5cd at source six-seat y175. It reads actual validated local min/max rules, falling back to the table’s fixed default stack. Equal bounds show one amount; a range shows min - max. Thousands grouping is retained (9,760); practice amounts do not pretend to be operator dollars. The existing translation machinery handles the title. The CSS 14px linebox and existing parent bounds still require exact native font-metric/raster verification.

No seat, HUD, dealer/blind marker, selection, waiting, admission or wallet handler was replaced. Other game variants retain their existing renderer. Actual profile avatars are preserved: source PreviewPlayerAvatar uses a real URL plus border/badge flags, so the different native capture alone does not justify replacing all local images with silhouettes.

All 18 exact-head checks/reviews passed: Swift exact crop readback, six preview/inheritance/avatar-context and seven font-chain source identities, six font identities, all 130 runtime/1,365 art hashes, cache/privacy/FIFO/HTTP guards, actual fixed120/range60 - 240/9,760 label and image/scale/color/font/position assertions, real Table/Group controls, observer Wait/Cancel, Group funding/replay/two windows, manual Join/preview/HUD, two hands with five computers, independently verified payouts, restart/reconnect and cross-room conservation. A separate isolated after-capture at1200×963 was visually reviewed against the saved original. All PR259 original/before image hashes stayed unchanged. The native client was not launched again.

Guarded idle rollout PID 27857→37426 preserved all six owner files (15,496 bytes), no live gameplay QA. Runtime: 130 files, 1,482,571 bytes. Art: 1,365 files; 1,364 immutable verified hardlinks plus one PNG adding 65,498 bytes. One small runtime snapshot; no dependencies, worktrees, models or large downloads. Previous runtimes/art were preserved. Markdown/report are current; generated HTML/inventories remain historical PR216.

This resolves two confirmed PR259 baseline differences. It is not full preview or app parity: parent bounds/clipping/resampling, exact text metrics, player plates/country/numeric HUD/actual avatar-data branches, promotions, footer/window semantics and native timing remain incomplete or unverified. Continue from the saved reference/source under the background-only constraint; the native launcher’s observed self-activation makes another unattended launch inappropriate.

[Source, font and exact atlas identities](cash-preview-surface-source.json). [Original comparison checkpoint](native-table-comparison.md).

## Next player-panel contract recovered with REA

`PreviewPlayerCell.as` contains the internal `PreviewPlayerInfo` and `NewPreviewPlayerHud` classes. The information panel is at (0,30) relative to the avatar center; its original `lobby_preview30` background is centered. Name and balance use Roboto10, positioned from the background top at14 (own italic name13) and29 respectively. Own names are orange, bold and italic; account/subscription styles determine other names. Play-money balances are gray and formatted from actual player balance, without a literal “chips” suffix. Exact background dimensions, clipping and text raster must be checked before replacing the current local plate.

The country flag is fed by actual CountryCode, with component offset(23,15), image offset(-11,-8) and scale0.25. The HUD is at(-36,-5); it is hidden at heat0 and otherwise shows actual mandatory VPIP, ordinary VPIP or AoF all-in ratio. It is never a seat number. These are recovered source contracts, not a claim that flags/HUD parity has shipped. Source hashes and the remaining implementation status are recorded in the linked JSON. No native launch or real-money action was needed.
