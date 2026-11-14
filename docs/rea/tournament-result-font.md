# Tournament result bitmap font — native evidence

RewardResult constructs its prize label at32px and assigns FontType.NEW_SPINANDGOLD_FONT. UniqueLabel maps this to newspinandgold. This is a bitmap-font alias, not a TTF family. No matching DefineFont2/3/4 was found in IronDesktop; font.swf contains13ordinary embedded fonts and13name tags (Roboto variants,emoji,Korean,Chinese).

StageAssets enqueues assets/bmfont/bmfont.png,bmfont.xml andnewspinandgold.fnt. This identifies the lobby bitmap-font variant used for this popup. The similarly named table_assets andhand_history definitions are different:41glyphs/309×308versus lobby43glyphs/315×316. They must not be substituted merely because the alias matches.

The bmfont atlas region newspinandgold is x516,y2,width315,height316. The .fnt declares nominal size56,lineHeight56 and43glyphs. It includes digits,currency symbols,regional suffixes,punctuation,space/tab/newline. Digit0 has texture58,115,52×55,offset0,25,advance54; digit1 has247,217,33×55,offset0,25,advance34. Glyph advances,offsets and nominal scaling must be retained rather than using equal-width CSS text. Local play-credit labels remain explicit and must not acquire a dollar sign.

Native BitmapFont.parseFontXml crops glyphs from the bitmap and reads xoffset,yoffset,xadvance plus optional kernings. Its layout applies font scale and horizontal/vertical alignment before final glyph coordinates. Retained source includes BitmapFont andBitmapFontType; physical AIR smoothing and final label baseline still require verification. Do not claim exact native text bounds from atlas dimensions alone.

A private JSON receipt in Sandbox/rea-tools/result-font-metrics-20261114.json contains all43glyph records,atlas size/region and source SHA256 hashes. Self-checks confirm declared glyph count,nonnegative rectangles and every glyph/region inside its texture. No font atlas was added toGit and no UI font change has been made yet. LivePR104continues to use the prior prize text font.

## Local implementation — pending release

The result controller loads the private metric JSON and validates glyph/atlas bounds,then decodes the atlas and checks its dimensions before using sprites. Numbers retain32/56scale,x/y offsets andvariable advances. Native glyph spans retain text for accessibility and a separately readable play credits unit; no real-currency symbol is added. Missing or invalid local font data leaves the readable text fallback. Ordinary font loading is not tied to an old player identity: successful load refreshes the current context through the existing result lifecycle guard.

Model checks cover zero,10,1000000,variable advances,texture-region offsets,missing glyphs,bad rectangles andunsafe/fractional values. Three-session browser tests PASS actual glyph counts/transparent text/native texture selection,own awards,Save/native-background pixel samples,cancel/error handling,Last Hand andcoldrestart. Font glyph pixel comparison inside exported PNG andphysical AIR smoothing/label alignment remain open. LivePR104is unchanged; changes are uncommitted. Private atlas+metrics were copied additively tosource-private andruntime art directories:461714bytes per copy; no dependencies or worktrees.

## Exported glyph and invalid-data checks

The actual result PNG is decoded in Chrome. For the early eliminated player, glyph rectangles are measured from the export DOM and compared with independently drawn native atlas crops at the source32/56scale. The check requires at least30bright glyph pixels and mean RGB-channel error at most15 to allow fractional CSS/canvas interpolation; it is not a claim of byte-identical full rasterization. This passes alongside native background samples,PNG download,cancel/error/Last Hand andcold restart. The native .fnt has zero kerning pairs.

Additional failing-then-passing unit checks cover null glyph records,duplicate glyph IDs andzero-size digit rectangles. These are rejected before rendering,retaining text fallback. Fractional/unsafe prize values andmissing/out-of-bounds glyphs are also rejected. Physical AIR baseline/smoothing,whole-image comparison andatlas decoding failure in a rendered browser remain unverified. The latest validation-only change has passed unit tests; commit-bound browser QA remains required before release.

Latest source-browser verification PASS also covers metadata HTTP503 andmalformed glyph JSON in isolated controllers: plain own-award text remains readable,no sprites are used,andClose clears the window. Full three-session payout/Save/Last Hand/restart andowner privacy checks pass after boundary validation. Commit-bound installed QA follows before release.
