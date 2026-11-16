# Native settings sidebar skins

OptionSideTabButton constructs an inner Button with lobby977 up and978 down, followed by a separate lobby979 selected overlay. The label is above both. Source Button defines1.3 hover brightness because there is no explicit over bitmap, but1 down brightness because an explicit down bitmap exists. Up/over multiplier transitions retain the existing native200ms linear behavior. The selected overlay stays independent of these inner button states.

The source230x28 size replaces228px approximate CSS width. Rectangle(3,3,2,2) on a10x10 frame maps to CSS top/right/bottom/left slices3/5/5/3. All three images are exact decoded frame-only crops; original trimmed metadata is not used to pad the small skins. tools/extract-settings-sidebar.py reproduces and reads back each crop (288bytes total).

Stable sidebar buttons now contain a separate native catalog label at x3,width200,height28,Roboto14,color#cccccc. Existing single-line fitting handles translated labels and resets after locale/font changes. Routes, focus destinations, selected identity, disabled local capability flags and draft persistence remain unchanged. Local focus outlines and unsupported-page opacity are accessibility integration, not a native disabled-state claim.

Rendered RED exposed228px source width before implementation (physical228.76 due to the existing stage scale). Assertions compare logical source units after removing stage scale. Acceptance checks230x28,label geometry/font/color,three10x10 decodes,asymmetric slices,actual hover/down,drag-away cancellation and release navigation; full language/settings/custom-wager/restart and bot-payout regression remain publication gates.

Physical native parent/color/raster/glyph/animation timing remains unverified. The separately recorded Romanian betting body wrapping collision is not fixed or hidden by this sidebar change.
