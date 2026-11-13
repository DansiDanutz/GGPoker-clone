# Language — native evidence and integration gate

## Observed static behavior

Bounded FFDec export of `LanguagePage` establishes a draft choice applied only by OK/Apply; Cancel reloads the cached language. The selector is built from `Brandy.current.languageSupport`, not every language compiled into the application. Layout: container(36,63), three columns at253px, row pitch36, toggle width241 and label14px. `ChangeLanguageCommand` persists languageType, changes the current language, selects script-specific fonts and invalidates localized casino caches. Those external casino workflows are outside this local player implementation.

`Language.as` exposes28 supported codes in a stable order, including Romanian. `setStringTable` uses the current-language value when its key exists and English only when the language key is absent; `getString` returns an unknown key unchanged. The installed string table contains11,662 text keys. This proves catalog availability, not the exact brand-enabled PLAYGG.RO list.

## Implemented foundation

`tools/extract-languages.py` reads the installed table and native supported-order definition. It creates28 private local JSON catalogs with exact native fallback behavior, native language names, per-file checksums and source identity. All catalogs pass JSON roundtrip/value equality. Generated native strings remain ignored and private; the repository contains only the extractor and independent lookup code.

`native-language.mjs` validates catalogs, accepts only supported exact stored codes (unknown preference→English), preserves Unicode and intentional empty values, and reads only own dictionary keys. Callers must render values with textContent; native markup is data, not executable HTML.

`native-language-test.mjs` covers these rules with portable fixtures; `--native` additionally verifies all28 actual local catalogs and Romanian Deal Me In text.

## Not enabled yet

Language remains disabled in the local settings UI. The first explicit table bindings below are implemented; the settings selector is still disabled and no live user preference is changed by tests. Before enabling the page: establish local offered-language policy/brand evidence, connect actual UI labels and dynamic controls, preserve player names/amounts as user data, integrate draft OK/Cancel/Escape/persistence and cross-window refresh, validate fallback/missing files and font coverage, then run browser journeys. Do not present catalog extraction as a working translated application or full1:1Language parity.

## First explicit table bindings

`installTableLanguage` currently binds only marked nodes for ButtonReJoin (Deal Me In), TablePlayerInfoSittingOut and MobileSitOut. Keys are tied to retained source classes, not guessed from matching English words. Player names, chat, chip amounts and unmarked controls are never traversed for translation. The paused-seat accessible label composes the original player name with the translated status.

The loader validates the language list and catalog before committing a new dictionary. Missing/unavailable catalogs retain the previous working language, while a generation counter discards older asynchronous loads. Cross-window storage updates and reload use the persisted local language preference. An optional module probe preserves the old English UI on running backends that do not yet serve the module. It does not start a game action or change a wallet.

`node network-browser-test.mjs --table-language` checks Romanian labels, unchanged player named Deal Me In/chat/hand, actual shared-window English update, failed-catalog recovery, reload and a delayed English response that cannot replace newer French. This is partial label integration, not full translated-app coverage or an enabled Language settings page. Remaining labels, native list policy, OK/Cancel/Escape, visible loading/error flow and font coverage are still required before enabling it.

## Betting-action bindings

Retained native constructors establish Fold→MyTurnBetFoldText, Call→MyTurnBetCallText, Check→HandSummaryCheck, Bet→MyTurnBetBetText and Raise→MyTurnBetRaiseToText. FoldButton’s free-action branch uses CheckFold. The local main-action captions now use those six exact keys; typed amounts remain separate numeric nodes and action closures keep their original engine operations. Accessible labels use the translated caption plus the actual amount. Existing native auto-fit runs after label changes.

The French catalog intentionally uses Parole for Check and Checker / Passer for CheckFold; those source values are preserved. The canonical English CheckFold text is Check / Fold, including spaces, so the six-session reserved-action regression expects that native label.

`node network-browser-test.mjs --bet-language` plays an actual three-player hand through French Call and Bet clicks. It verifies all six captions, fit of CheckFold, original player named Call/chat text, typed12 and input focus across EN→FR, localized amount aria, no game-version change from language updates, payout24/uncalled return12 and final128/116/116 (360 total). `--preactions --hosted` verifies the complete six-human reserved-action/reload/restart flow and720-chip conservation with canonical English labels. Other betting formats, remaining labels and font/runtime parity are not claimed complete.
