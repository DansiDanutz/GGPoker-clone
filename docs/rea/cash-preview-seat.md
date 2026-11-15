# Hold’em preview: exact seat and marker coordinates

PR264 merged `8b49cac367e82e80a34aabe05160d3939ef2c69a`; tested source `7a64a4770baa9ba1cfce8e1bd97c4b5b37832e16`.

Ordinary six-seat Hold’em preview now uses the original source seat indices and exact coordinate points at scale1.08. Dealer/blind images use source top-left points and the dealer pre-scale(2,2) offset. A heads-up dealer/SB player has one dealer marker,while real blinds remain posted. All13 exact-head checks/reviews passed,including actual sparse seats2/5 and240-chip fold settlement,all six origins,three marker origins,private HUD/seat admission,two six-player hands,independent payouts,cold restart/reconnect and isolated1200×963 visual review. No native relaunch.

Runtime130files1,483,974bytes;all1,365existing art files reused,no added artwork. Guarded idle rollout PID35939→99093 preserved all six owner files(15,496bytes) byte-for-byte. Backup `/Users/davidai/.local/state/playgg-rollouts/pr264-yk26x0gm`. No live gameplay writes. Parent/outer-raster/textfield/country/heat/private-note/operator/full-app timing parity remains incomplete.

REA recovered the original six-seat position table and its direct use of SeatIndex. Seat0 is at the top,then upper-right,lower-right,bottom,lower-left,upper-left. The previous local percentages started seat0 at the bottom and moved portraits/markers relative to the original table texture. The ordinary six-seat Hold’em preview now uses the source points multiplied by1.08. Avatar and plate dimensions remain unchanged;empty-seat actions and HUD clicks still refer to the actual seat index. This preview is independent of a seated player’s rotated playing-table view.

Dealer/blind images use the source top-left point without a CSS centering transform. The dealer receives a(2,2) offset before scaling,as in TableViewComponent. Native per-player priority is dealer,else small blind,else big blind. In heads-up the shared dealer/small-blind player therefore has only the dealer marker;the actual small blind remains posted by the engine. The same existing native images are reused. Other modes and legacy capacities keep their existing renderer.

The browser RED run measured old seat0x116 instead of source120.96. The first GREEN run passed all six origins,two hands,payout and reconnect. Expanded assertions verify every marker’s source origin and a genuine local two-player hand in sparse seats2/5,including dealer/SB priority and fold settlement. Expanded source checks passed,including private HUD notes,manual admission,exact empty-seat4/0,two hands and cold restart/reconnect. All13 exact-head installed checks/reviews passed before merge and guarded idle rollout. A1200×963 source capture was visually compared with the saved original;no native relaunch or real-money action was used.

Exact parent bounds/clipping,text metrics and country/heat/private-note/operator branches remain incomplete,as do native timing and full application parity.

[Source hashes,coordinates and verification scope](cash-preview-seat-source.json).
