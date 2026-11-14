# Battle Royale primary action buttons

Native source establishes a separate skin for Battle Royale. ActionView.setting sets mainActionUI.isBattleRoyalType from GameType.BATTLE_ROYALE. MainActionUI forwards the flag to every ActionButton. ActionButton switches ordinary table4/5/6 to table239/240/241, whose exact StageAssets frame-only dimensions are208×122, rather than232×152. The misleading atlas trim padding is not applied. Source/art hashes and frame rectangles are in battle-action-art.json. Private source and image bytes are not committed.

The button layer remains at1022/1050 and available buttons step217. For Battle, labels move from x35 to25; a one-line label moves y34→27 and two-line labels y14/57→7/50. Pressing adds14 to the text y positions. The local renderer now selects this skin for Battle Rush and authenticated final-state battleFinal, retaining ordinary Hold’em appearance. The betting strip and Quick Fold now have their own recovered Battle branches; details follow below.

Verification: browser regression first failed232≠208 before production changes. The isolated six-account Battle final checks decoded image dimensions, computed width/height/label offsets and real hover/pressed states before making legal bets; independent hand payout verification,600 game chips,150 entry credits and restart without duplicated awards remain required. Ordinary hosted one-human/five-computer coverage checks default geometry232×152, real control actions, two hands and recovery. No real-money account or live gameplay data is used.

Physical native rendering, animation/sound timing, full physical betting-strip and reserved-action parity remain unverified.

## Battle betting strip and Quick Fold

BettingUI forwards isBattleRoyalType to all BettingRateButton instances and BettingLineSlider. Rate buttons switch table9/10/11 (nine-sliced) to table235/236/237 (full78×60 sprites with scale9Grid cleared). Label5/10,68×39 and button positions15+84i/6 remain unchanged. The local Battle branch removes the ordinary borders and draws those full native states, preserving real preset targets and no-wager selection.

Slider changes only the ball art from table8 to table238 (67×80). ValueSlider.setBall uses negative-width/height arithmetic right shift: x−34,y−40. With slider515/38 and travel108, the visual thumb origin is481/−2. The browser input175×80 preserves108px center travel with the larger67px thumb. Horizontal half-pixel CSS compensation preserves the gauge center; browser track rasterization may differ vertically by half a native unit. This is source-coordinate reconstruction, not physical pixel certification.

ReserveActionUI propagates the Battle flag only to QuickFoldButton (which inherits FoldButton→ActionButton); checkbox controls retain their existing skin. Quick Fold moves from1050 to1058 in Battle and uses the existing208×122 Battle action textures and25/27 label. The local implementation now does the same, with pressed text y41.

Browser gates cover four actual preset pointer clicks with up/hover/down art, min/max slider dragging without a betting mutation, actual legal final-hand actions/payout and restart; Battle Rush Quick Fold geometry/pressed art and drag-away cancellation without a revision change; six-player Rush hand and recovery. Ordinary hosted controls must retain their original geometry and pointer behavior. Native physical rendering/sound and server arbitration policies remain unverified.

The native BettingLineSlider overrides the generic slider: a press inside the ball stores its center offset and listens on the stage; an outside press adds/subtracts model.snap once. The local range now implements this with scale-aware pointer coordinates and pointer capture, retaining the existing legal snapping helper and keyboard controls. Release/cancel/blur clears capture. This also avoids relying on browser-default dragging under the scaled panel, which failed the observed min→max pointer test even with the application input callback removed. No betting action is submitted by selecting or dragging an amount.
