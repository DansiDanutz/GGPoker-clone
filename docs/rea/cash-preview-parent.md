# Hold’em preview: native parent frame

PR266 merged `480b5aefdfdf4e3a7144fff71f44c872c54db273`; tested source `12e1c62b87872ae7ad690e3147f172ea9851b021`.

The ordinary Hold’em Table View parent is calibrated to the original1200×963 native reference and recovered source dimensions. Actual preview is approximately(843.985,185)/241×376;Open(856.032,571)/216.891×38;Wait y619. The existing list/counter geometry is unchanged. All14 exact-head checks/reviews passed,including source/capture/runtime/art identities,1200parent/header/control geometry,900×700 proportional resize/restore,real HUD/admission/sparse heads-up,Group/Table/Wait/Cancel/buy-in replay,two hands,independent payouts,cold restart and cross-room conservation. No native relaunch.

Runtime130files1,485,462bytes;existing1,365art files reused,no added art bytes. Guarded idle rollout PID99093→22223 preserved all six owner files(15,496bytes) byte-for-byte. Backup `/Users/davidai/.local/state/playgg-rollouts/pr266-i67elkw8`. No live gameplay writes. Group parent/native tab art,font/color-profile/full-app timing fidelity remain incomplete.

REA recovered the ordinary cash detail width241,header(4,4)/234×28,page offset35,operator offset376 and real38px buttons with10px gaps and90% width. The saved actual1200×963 native capture supplies the outer anchor(844,150). The local preview previously began at(848.829,188.629),width232.776;its source coordinates were being scaled by the legacy1196px whole-page frame.

The ordinary Hold’em Table View sidebar now has an independent native reference frame. A1196/1200 local scale compensates the legacy stage,so at1200px it renders source pixels directly. Header is(848,154)/234×28;preview(844,185)/241×376;Open is approximately(856.05,571)/216.9×38 andWait at619. The original seat/marker coordinates and plate assets remain unchanged,now measured in this frame. Existing list geometry remains unchanged. Explicit grid placement keeps the list in column1/row2 when the sidebar is removed from grid flow.

The frame clips at the window bottom. At900×700 the same layout scales proportionally and retains player identities;this is a local resize policy test,not a native900px comparison. The border/background colors are sampled native rendered output. Their difference from raw SWF color constants does not prove that the native color-management transform has been recovered.

Browser RED exposed the old parent origin. Source GREEN verifies parent/header/page origins,real HUD notes,manual admission,empty-seat pointer targets,source seat/marker origins and genuine heads-up settlement. All14 exact-head installed checks/reviews passed,including responsive/Group round trips,before merge/rollout. A fresh isolated1200×963 source capture was reviewed against the saved original;no native relaunch or real-money action was used.

Group View parent calibration and native tab graphics/fonts remain separate work. Full-app outer frame,physical raster/color profiles,country/heat/note/operator branches and native animation/audio timing remain incomplete.

[Original source/capture identities and calibration limits](cash-preview-parent-source.json).
