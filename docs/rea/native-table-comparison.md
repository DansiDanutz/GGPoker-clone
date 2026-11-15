# Native / local Table View: same-size evidence

This is a measured reference checkpoint, not a completed 1:1 acceptance test. The installed PLAYGG.RO application and an isolated local practice fixture were captured at exactly **1200 × 963 pixels**. The local snapshot uses the installed PR257 runtime, source `09f34fe014274c07f6f2490b2744999e7aa93c02`; product code was not changed in this checkpoint.

The original client was not running initially. A requested background launch spawned a child that activated itself. The UI inspection used only Hold’em/Table View navigation and list scrolling, with background event delivery; no seat, wager, waiting-list, cashier or promotion action was sent. The window was minimized and the application gracefully quit; zero remaining windows and terminal process state were checked. Future background-only work must use the saved reference/source, rather than relaunch a client known to activate itself.

The clone was captured in headless Chrome with a temporary data directory, fresh practice profiles, an actually hosted six-seat table and five computer players. The version guard initially rejected a fill request missing its version; the helper was corrected to pass the actual joined version. Temporary processes/profile/data were removed afterward. The live owner instance and data were not used for this comparison.

## What the comparison establishes

| Area | Observed difference / limit | Next action |
|---|---|---|
| Main list geometry | Header/list anchors are close at the same extent; this is not a full automated pixel-diff result. | Preserve established row/control behavior and verify individual native parent bounds. |
| Preview table background | Native TableViewComponent selects `lobby_preview` texture **0**, 223 × 351, for ordinary Hold’em and applies default scale **1.08**. Clone still stretches the legacy `standard-table-preview.png`. | Replace the legacy layer with the exact native atlas texture after recovering complete parent/scale rules. |
| Preview center label | Native code always uses `MobileBuyInRange` and the real min/max or equal single amount. Clone currently says Buy-in/default stack. | Bind the label to actual local buy-in rules and native typography/position. |
| Avatar / player metadata | Native capture and local fixture have different players, avatar data and metadata. Flags, numeric HUD/plate details and exact avatar branches remain incomplete. | Recover PreviewPlayerAvatar/PreviewPlayerCell semantics; do not infer country or identity from a nickname or treat different data as a proven geometry defect. |
| Promotions | Native rows include crown/gold promotion styling and live promotion data. Local ordinary rows use a no-promotion branch. | Recover a real owner-controlled promotion data producer and source UI contract; do not add decorative fake state. |
| Header / preview / footer typography | Visible differences remain, including header weight and preview presentation. | Source the corresponding native controls before editing; no guessed font or placement claim. |
| Window semantics | Current local Table Open uses its actual room route. Native window/focus behavior is not yet mapped end to end. | Recover OpenTableCommand/window management without operating a real-money seat. |

Dynamic operator balances, currency, names, promotions and live table statistics are intentionally different from the independent local practice fixture. A global image error score would mix data differences with rendering differences and is not a valid acceptance result here. Branded DanGG changes are separately authorized user customization.

The comparison HTML keeps both PNGs at equal scale with a shared zoom control. Raw captures contain account/player visuals and remain only in `.git/danslab-qa`; they are not published with the repository. Public records preserve dimensions, hashes, source identities and geometry. The native process loaded its executable from the launcher’s Loader bundle; a loaded SWF path was not observed. Game51 source hashes remain the artifact-analysis reference, not a claim about a memory-mapped path.

The local measured header bounds are approximately x20.067/y302.007/w809.699/h24.080; selected row height32.107; counter width97.324/height9.030. All coordinates come from the local browser. Native bounds require individual pixel/source verification; visual proximity is not recorded as exact equivalence.

[Machine-readable reference and source identities](native-table-comparison-source.json). The current implementation and gameplay evidence remain documented in [PR257 account states](cash-table-account.md).
