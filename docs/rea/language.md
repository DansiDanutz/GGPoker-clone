# Language — native evidence and integration gate

## Observed static behavior

Bounded FFDec export of `LanguagePage` establishes a draft choice applied only by OK/Apply; Cancel reloads the cached language. The selector is built from `Brandy.current.languageSupport`, not every language compiled into the application. Layout: container(36,63), three columns at253px, row pitch36, toggle width241 and label14px. `ChangeLanguageCommand` persists languageType, changes the current language, selects script-specific fonts and invalidates localized casino caches. Those external casino workflows are outside this local player implementation.

`Language.as` exposes28 supported codes in a stable order, including Romanian. `setStringTable` uses the current-language value when its key exists and English only when the language key is absent; `getString` returns an unknown key unchanged. The installed string table contains11,662 text keys. This proves catalog availability, not the exact brand-enabled PLAYGG.RO list.

## Implemented foundation

`tools/extract-languages.py` reads the installed table and native supported-order definition. It creates28 private local JSON catalogs with exact native fallback behavior, native language names, per-file checksums and source identity. All catalogs pass JSON roundtrip/value equality. Generated native strings remain ignored and private; the repository contains only the extractor and independent lookup code.

`native-language.mjs` validates catalogs, accepts only supported exact stored codes (unknown preference→English), preserves Unicode and intentional empty values, and reads only own dictionary keys. Callers must render values with textContent; native markup is data, not executable HTML.

`native-language-test.mjs` covers these rules with portable fixtures; `--native` additionally verifies all28 actual local catalogs and Romanian Deal Me In text.

## Not enabled yet

Language remains disabled in the local settings UI. No application label or saved user preference has been changed by this foundation. Before enabling the page: establish local offered-language policy/brand evidence, connect actual UI labels and dynamic controls, preserve player names/amounts as user data, integrate draft OK/Cancel/Escape/persistence and cross-window refresh, validate fallback/missing files and font coverage, then run browser journeys. Do not present catalog extraction as a working translated application or full1:1Language parity.
