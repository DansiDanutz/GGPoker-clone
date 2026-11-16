# Betting settings controls: source skins, fonts and preset captions

Eight identified native classes cover OptionBettingPage, ChooseItem, OptionViewToggleButton, OptionCheckInToggleButton, DropDownButton, Setting, InitFont and TrueTypeCompositor. Five control/font exports are fresh; page/compositor evidence is reused by exact source identity. The original1200x957 settings capture remains unchanged. Native and Chrome capture color profiles/raster remain unbound, so literal source colors are used without raw-image compensation.

ChooseItem uses206-unit captions,10gap and two240x24 buttons with8gap; the three rows step32. Buttons use original lobby_option346/347 backgrounds with9/9/2/2 scale9 and the345mark at12,6. Label x33/y2,normal#808080,active#ddbc73,Roboto14. Hover multiplier1.05,down0.7 is applied to the skin; an inactive pressed button previews the mark without committing until release. Four existing PNGs are decoded-RGBA exact against the atlas, not regenerated approximations.

Rounding replaces the browser blue checkbox with source348off/349on16x16 images, retained as separate base and check layers. Checked/unchecked/hover/down label colors follow the source. The actual checkbox, callbacks and keyboard behavior remain. Only two PNGs were added:756bytes. Existing1387artfiles are immutable links in the candidate1389file pack.

The missing Opening subtitle uses MobileBigBlindOrButtonBlind and Normal uses MobilePercentPot, both parenthesized and Roboto12. Source titles areRoboto16; field headersRoboto14. Source positions inside the existing preset parent are retained: header centers318/442/566/690, title x21, opening title y32/subtitle51/control38, normal title74/subtitle91/control76; fields68x26 at284+124i. Historical closed-select colors/arrow followed the source, but its Condensed constructor-font assumption is corrected by the later setInputTextFormat trace; the editable-control follow-up uses regular Roboto. Outer parent and illustration anchors remain the existing calibrated frame; they are not newly certified as native physical coordinates.

Single-line titles carry the native16px starting size and fit in integer steps down to5 with four width-gutter pixels. Canvas advances approximate Flash metrics; locale/font/resize updates reset from16 rather than keeping a prior reduced size. General marked-label handling is reused in the language loader, leaving unmarked labels unchanged.

The prior installed browser failed the20-label contract because both subtitles were missing. A pure autoScale test failed on the missing helper export before implementation. Final acceptance requires original six-sprite readback, all runtime/art/source identities, actual radio widths/skins/colors/fonts, native checkbox appearance, Romanian titles fitting above subtitles and English size restoration, stable draft/controls, Apply/Cancel/wheel/Enter and full hand/payout/restart.

## Confirmed remaining functionality gap

Native DropDownButton supports direct typing, focus normalization and native four-row popup behavior. Opening accepts0.1–99.9 with one displayed decimal; normal accepts1–999percent. The native opening list includes Max as well as Pot. Local controls still expose fixed selects and omit opening Max. The source-backed next implementation is an editable preset control with validation/persistence/legal-target tests; visual work here does not claim that functionality or native popup parity. Native script-specific fonts, exact autoScale/raster and physical animation/speaker timing also remain incomplete.

Same-size comparison captures the local panel at1200x957 before changing the original observed configuration: BB unit, increase wheel, always confirm, rounding enabled, opening2/3/4/Pot and normal33/50/75/100. Account/balances/banner/footer state and native capture color profiles are not treated as a whole-screen parity score. Raw images and the comparison page remain private local evidence, separate from the playable app.

The fixed-select functionality gap recorded above is historical; [editable-bet-presets](editable-bet-presets.md) implements direct typing and opening Max. Physical native comparison remains incomplete.
