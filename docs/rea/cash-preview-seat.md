# Hold’em preview: exact seat and marker coordinates

REA recovered the original six-seat position table and its direct use of SeatIndex. Seat0 is at the top,then upper-right,lower-right,bottom,lower-left,upper-left. The previous local percentages started seat0 at the bottom and moved portraits/markers relative to the original table texture. The ordinary six-seat Hold’em preview now uses the source points multiplied by1.08. Avatar and plate dimensions remain unchanged;empty-seat actions and HUD clicks still refer to the actual seat index. This preview is independent of a seated player’s rotated playing-table view.

Dealer/blind images use the source top-left point without a CSS centering transform. The dealer receives a(2,2) offset before scaling,as in TableViewComponent. Native per-player priority is dealer,else small blind,else big blind. In heads-up the shared dealer/small-blind player therefore has only the dealer marker;the actual small blind remains posted by the engine. The same existing native images are reused. Other modes and legacy capacities keep their existing renderer.

The browser RED run measured old seat0x116 instead of source120.96. The first GREEN run passed all six origins,two hands,payout and reconnect. Expanded assertions verify every marker’s source origin and a genuine local two-player hand in sparse seats2/5,including dealer/SB priority and fold settlement. Expanded source checks passed,including private HUD notes,manual admission,exact empty-seat4/0,two hands and cold restart/reconnect. Full exact-head installed checks remain pending. A1200×963 source capture was visually compared with the saved original;no native relaunch or real-money action was used.

Exact parent bounds/clipping,text metrics and country/heat/private-note/operator branches remain incomplete,as do native timing and full application parity.

[Source hashes,coordinates and verification scope](cash-preview-seat-source.json).
