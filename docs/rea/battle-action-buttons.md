# Battle Royale primary action buttons

Native source establishes a separate skin for Battle Royale. ActionView.setting sets mainActionUI.isBattleRoyalType from GameType.BATTLE_ROYALE. MainActionUI forwards the flag to every ActionButton. ActionButton switches ordinary table4/5/6 to table239/240/241, whose exact StageAssets frame-only dimensions are208×122, rather than232×152. The misleading atlas trim padding is not applied. Source/art hashes and frame rectangles are in battle-action-art.json. Private source and image bytes are not committed.

The button layer remains at1022/1050 and available buttons step217. For Battle, labels move from x35 to25; a one-line label moves y34→27 and two-line labels y14/57→7/50. Pressing adds14 to the text y positions. The local renderer now selects this skin for Battle Rush and authenticated final-state battleFinal, retaining ordinary Hold’em appearance. This does not implement the separate native Battle betting-strip or reserved-action skins.

Verification: browser regression first failed232≠208 before production changes. The isolated six-account Battle final checks decoded image dimensions, computed width/height/label offsets and real hover/pressed states before making legal bets; independent hand payout verification,600 game chips,150 entry credits and restart without duplicated awards remain required. Ordinary hosted one-human/five-computer coverage checks default geometry232×152, real control actions, two hands and recovery. No real-money account or live gameplay data is used.

Physical native rendering, animation/sound timing, full betting-strip and reserved-action parity remain unverified.
