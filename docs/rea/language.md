# Language — native evidence and integration gate

## Observed static behavior

Bounded FFDec export of `LanguagePage` establishes a draft choice applied only by OK/Apply; Cancel reloads the cached language. The selector is built from `Brandy.current.languageSupport`, not every language compiled into the application. Layout: container(36,63), three columns at253px, row pitch36, toggle width241 and label14px. `ChangeLanguageCommand` persists languageType, changes the current language, selects script-specific fonts and invalidates localized casino caches. Those external casino workflows are outside this local player implementation.

`Language.as` exposes28 supported codes in a stable order, including Romanian. `setStringTable` uses the current-language value when its key exists and English only when the language key is absent; `getString` returns an unknown key unchanged. The installed string table contains11,662 text keys. This proves catalog availability, not the exact brand-enabled PLAYGG.RO list.

## Implemented foundation

`tools/extract-languages.py` reads the installed table and native supported-order definition. It creates28 private local JSON catalogs with exact native fallback behavior, native language names, per-file checksums and source identity. All catalogs pass JSON roundtrip/value equality. Generated native strings remain ignored and private; the repository contains only the extractor and independent lookup code.

`native-language.mjs` validates catalogs, accepts only supported exact stored codes (unknown preference→English), preserves Unicode and intentional empty values, and reads only own dictionary keys. Callers must render values with textContent; native markup is data, not executable HTML.

`native-language-test.mjs` covers these rules with portable fixtures; `--native` additionally verifies all28 actual local catalogs and Romanian Deal Me In text.

## Local settings selector

The settings page now offers the28 compiled default languages as an explicit local policy. Brandy.as proves that a downloaded brand configuration can override this default through its languages array; the actual PLAYGG.RO override remains unobserved. This is not proof of the native brand-enabled list.

The selector uses the source three-column positions/pitch and241×24 choices, title(33,20), list(36,63),14px labels and selected color#ddbc73. Native OptionViewToggleButton uses lobby_option346/347/350 backgrounds and345 icon; the current CSS/browser radio is an acknowledged raster difference, not a pixel-match claim. Native label keys are evaluated against the currently saved catalog, rather than assuming endonyms: MobileLang_ro is Română in English fallback but Romanian in the Romanian catalog.

Selecting a radio only changes the draft. Cancel/Escape discard it. OK validates the selected catalog before writing any settings, persists river-language and updates already-open table windows through the existing storage listener. Failed loads leave the dialog open with an error and retain the saved language. A dialog-generation token prevents a delayed OK request from saving after Cancel/Escape, even when the dialog is reopened with the same selection. Other settings retain their existing commit behavior.

Browser coverage includes28 choices, no live preview, Cancel reset, OK→Romanian in another table, failed-catalog retention, and delayed-response/Escape/reopen cancellation. This enables a functioning partial-language preference, not a fully translated app. Remaining lobby/table labels, native toggle raster, script font coverage, brand list and native runtime comparisons remain open.

## First explicit table bindings

`installTableLanguage` binds explicitly marked nodes. The initial keys are ButtonReJoin (Deal Me In), TablePlayerInfoSittingOut and MobileSitOut; the six main betting-action keys are documented below. Keys are tied to retained source classes, not guessed from matching English words. Player names, chat, chip amounts and unmarked controls are never traversed for translation. The paused-seat accessible label composes the original player name with the translated status.

The loader validates the language list and catalog before committing a new dictionary. Missing/unavailable catalogs retain the previous working language, while a generation counter discards older asynchronous loads. Cross-window storage updates and reload use the persisted local language preference. An optional module probe preserves the old English UI on running backends that do not yet serve the module. It does not start a game action or change a wallet.

`node network-browser-test.mjs --table-language` checks Romanian labels, unchanged player named Deal Me In/chat/hand, actual shared-window English update, failed-catalog recovery, reload and a delayed English response that cannot replace newer French. This is partial label integration, not full translated-app coverage or full Language parity. Remaining labels, native brand policy, raster and font coverage still need verification.

## Betting-action bindings

Retained native constructors establish Fold→MyTurnBetFoldText, Call→MyTurnBetCallText, Check→HandSummaryCheck, Bet→MyTurnBetBetText and Raise→MyTurnBetRaiseToText. FoldButton’s free-action branch uses CheckFold. The local main-action captions now use those six exact keys; typed amounts remain separate numeric nodes and action closures keep their original engine operations. Accessible labels use the translated caption plus the actual amount. Existing native auto-fit runs after label changes.

The French catalog intentionally uses Parole for Check and Checker / Passer for CheckFold; those source values are preserved. The canonical English CheckFold text is Check / Fold, including spaces, so the six-session reserved-action regression expects that native label.

`node network-browser-test.mjs --bet-language` plays an actual three-player hand through French Call and Bet clicks. It verifies all six captions, fit of CheckFold, original player named Call/chat text, typed12 and input focus across EN→FR, localized amount aria, no game-version change from language updates, payout24/uncalled return12 and final128/116/116 (360 total). `--preactions --hosted` verifies the complete six-human reserved-action/reload/restart flow and720-chip conservation with canonical English labels. Other betting formats, remaining labels and font/runtime parity are not claimed complete.

## Reserved-action bindings

`ReserveAction.as` maps FOLD/QUICK_FOLD_TO_ANY_BET to LabelFold, FOLD_TO_ANY_BET to CheckFold, CHECK to HandSummaryCheck, CALL to HandSummaryCall and ALL_IN to MyTurnBetAllInOrFoldAllInText. `ReserveActionUI.updateCallAmount` explicitly combines the translated HandSummaryCall prefix with the displayed amount. The French reserved prefix is Paye, distinct from the main-action Suivre; that native context distinction is preserved.

The local reserveText wrapper now contains a marked caption and separate numeric reserveAmount. The selected action retains its original kind and captured numeric call; translation never parses a localized label into a game action. Existing checkbox geometry/selection is preserved, and native auto-fit runs after translated captions change. Rush’s check-fold representation still maps to LabelFold.

`node network-browser-test.mjs --reserve-language` verifies all five French captions and visible free CheckFold fit in a second player session. A trusted fixed Call2 selection survives FR→EN→FR and executes once; a subsequent Call4 reservation cancels when the due amount becomes12. The player name Call remains unchanged. The controlled hand pays28 including8 uncalled chips, finishing132/116/112 and conserving360. Broader format regressions and native runtime/font verification remain separate gates.

The legacy auto-scale probe now changes only reserveAmount during its long-number check, preserving the nested caption/amount nodes. Replacing the entire wrapper text destroyed those nodes and invalidated subsequent reservation checks; this was a test-fixture issue, not a reason to add DOM-repair behavior to production. The unchanged six-session720-chip/restart assertions pass with the corrected probe.
