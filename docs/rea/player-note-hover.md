# Native private-note hover tooltip

## Recovered evidence and scope

Static FFDec analysis of the installed `IronDesktop.swf` establishes this separate hover surface. The REA native provider does not support this SWF; the retained FFDec fallback is static evidence, not a recording of execution. The private audit `note-tooltip-source-audit.json` retains the artifact identity and hashes of eight exported classes; `note-class-index.json` retains the bounded class-name investigation. Logical paths below refer to that retained native-source export.

`com/nsus/iron/table/view/component/PlayerNoteView.as` controls hover eligibility, delay, positioning and cleanup. `NoteToolTip.as` builds the contents, layout, text truncation and label frame. `PlayerNoteManager.as` provides identity-indexed private notes, label titles and default colors. `PlayerNoteInfo.as` normalizes newlines and shows a label when either note text or a nondefault color exists. This does not establish a global offline note-list screen: the native class-name index and these controllers have not identified its entry point or layout. The offline-list parity item stays unresolved.

## Opening, updates and dismissal

PlayerNoteView listens for Starling hover touches. It refuses broadcast mode, a missing/closed/inactive native window, private VIP tables, the tournament-detail overlay, an active table-casino event and a point covered by the Ocean badge. Its first touch after returning to the native stage only marks the pointer as inside. It walks from the hover target to an IPlayerTouchArea and its IPlayerItem, requires an opponent, and requires the table to permit history/chat/HUD. VIP-private or HUD-disabled players are excluded.

For an eligible opponent it obtains the private note by stable alias, sets content and schedules showing after **300 ms**. Hiding kills the delayed callback, clears the note player, and hides the tooltip. Mouse leave and leaving the player touch area dismiss it. Showing dispatches GET_PLAYER_NOTE_FOR_TOOLTIP, so a refreshed private note can replace the cached content. A returned update is accepted only when its player ID matches the current hovered player. The own player has no opponent-note tooltip. An open auto-fold view suppresses the tooltip for native player x greater than980.

The local app now implements this separate delayed surface through `note-tooltip.mjs`, sharing the existing private seated-note APIs. Clickable HUDs and editors remain separate controls. The implementation follows the recovered native behavior; physical window/font/raster comparison remains unverified.

## Positioning

In PlayerNoteView.setNote, compute the vector from communityCardPosition to the player's native x/y anchor. Its length is reduced by50 native units, then rotated back toward that same angle. The resulting point is translated by communityCardPosition. If the resulting vector x is positive, subtract tooltip width; if vector y is positive, subtract noteHeight. Thus the tooltip grows inward from a point50units toward the board. The source does not clamp this surface to the viewport in that method.

These are table-coordinate formulas. Native parent scaling, real window clipping and physical font/raster output still require direct comparison; the636-unit source width is not automatically636CSSpixels. Use the existing native table-coordinate transform for implementation, and verify every viewer rotation at the same viewport.

## Contents and geometry

The outer StageAssets `table0412` nine-patch is636units wide. Initial height496 is replaced by content-driven layout. Header nickname: x32,y32,height40,font28,#fefefe. Balance: font32,#74cefd, at y32 and right inset32 after measurement. Country: font24,#999999, at nickname right+16,y38,height32; it is omitted when unknown and sliced only into the remaining header width. Do not invent a local player's country.

Up to six earned badge groups use88-unit cells and96-unit stride at x32. The row appears only when actual badge data resolves to images. Empty cells follow real groups; they are not fabricated awards. Without badges the next block begins from y72; badges add20gap plus88height.

The metrics block starts20units below the header/badge area and is104high. Hands are centered on x98. A2×104 divider sits at x164. Four CircleGraphView instances have scale2 and x196,308,420,532. Their ordinary labels are VPIP,PFR,ATS,3-bet; Short Deck ATS is unavailable. AoF has a separate All-in/ATS/Fold/FTA branch. Native ratios come from the operator server. Local implementation must keep its existing explicit recorded-table/pool scope and leave unavailable metrics unknown.

## Note text and colored label

The note block follows the metrics by20units. Its procedural background is x32,width572,color#040404,radius16. Text uses x48,width540,font28,leading8,color#cccccc,word-wrap and literal content. The source measures two lines and six lines using actual font bounds. It clamps text height to that measured range, adds26units for note padding/border, then32units of bottom padding to determine noteHeight. This replaces the fixed initial496height.

If full text exceeds the six-line bound plus2units, fitNoteText performs a binary search for the longest prefix whose measured height fits with the suffix `..`. This is not CSS ellipsis or a six-line character-count heuristic. The mask matches the measured visible height. Empty notes still retain the two-line minimum.

The label uses `table0252` as the full tooltip frame and `table0251` for its title tab. The tab starts at x16,y−32,height32; text starts x32,y−32,font24 and has widthMax350. Frame/tab are tinted to the private note color. A default white label with no custom title hides the colored frame and tab. Empty nondefault label titles keep a120-unit tab; a title grows it to measured text width+32. Text is black when perceived RGB luminance exceeds128, otherwise white.

The StageAssets desktop atlas, not the Starling ATF atlas, resolves these keys. Verified atlas rectangles: table0412=(3203,3428,40,40), table0251=(213,994,24,30), table0252=(3778,3391,42,42). Each is unrotated. applySlice9Grid must be followed when extracting/rendering; the atlas sourceSize metadata is not the cropped bitmap size.

## Implementation acceptance contract

The acceptance contract requires cached private hover data with300ms cancellation, identity checks before and after asynchronous refresh, dismissal on pointer exit/window blur/hidden document/account or target change/401, and no mutation of betting state. Reuse the existing note APIs and palette; no new public note endpoint is needed for a seated hover tooltip.

Verify header/metrics/notes, both text bounds and the literal `..` suffix; colored/title/default frames; own/observer privacy; six-seat and AoF viewer rotations; updates while visible; replacement and delayed-response isolation; early pointer exit; no click or focus theft; unchanged actions/cards; full hand payout and restart. A physical native comparison and native font timing remain separate unverified acceptance gates.

## Local implementation and explicit limits

`player-note-ui.mjs` supplies only the authorized current opponent row, recorded local metrics, palette/title and known stack. A transparent192-unit source-backed PlayerTouchArea above the name plate/cards restores both actual pointer hover and click-to-HUD; keyboard focus stays on the existing accessible portrait. The overlay is an input hit area, not a replacement image of the player. Pointer exit, blur, hidden document, identity/target change and401 clear the private DOM. A delayed response cannot reopen an abandoned hover. Hover does not move focus. Existing notes update the visible surface; unchanged polls retain its DOM.

Native cropped/tinted nine-patch skins are extracted by `tools/extract-note-tooltip.swift`;23PNGs total14992bytes, decoded RGBA equality verified. CPU tint multiplication rounds to8bits; exact native GPU rounding remains unverified. No existing installed artwork is overwritten. Native metric percent suffixes and integer angular fill are used; source language keys annotate captions. Unknown country/badges are omitted, not fabricated.

The browser adapter measures rendered font line boxes for the native two/six-line bounds and uses the source binary prefix search. AIR glyph-bound equivalence and native parent clipping remain unverified. Font-load completion remeasures the surface. The transparent name-plate region is also accepted as a local hover adapter; its exact native hit mask is unverified. Native broadcast/VIP/casino/auto-fold restrictions have no corresponding local modes, so this does not establish those formats.
