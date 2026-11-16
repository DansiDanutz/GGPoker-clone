# Settings sidebar native language bindings

Eight selective headless FFDec exports bind SettingsView registration, OptionTabType keys and OptionSideTabButton label assignment to the installed Game51 SWF. Eleven previously English-only sidebar captions now use the existing catalog and language observer. Page routing remains bound to data-settings-page; label text is never a route identifier. This reuses the existing module without dependencies, artwork or backend changes.

Keys: SetBuyinSettings, OptionCardSqueeze, ChipShuffle, DeviceAccess, OptionTabHotkey, OptionTabLanguage, MobileSmartFocus, OptionTabSound, OptionSwitchChipDisplay, OptionTableTheme and TimeBankCard. Original TimeBank and newer TimeBankCard are separate registered source types; the local card setting keeps the latter. Existing captured Betting/OptionTabBetting binding remains unchanged: constructor SetBettingOption alone does not prove the operator runtime label, and is not used to overwrite captured evidence.

Rendered RED acceptance exposed the missing SetBuyinSettings binding before implementation. Acceptance checks Romanian labels directly against the original catalog, disabled capability flags, translated Sound routing/focus and return to the same unsaved betting draft. Full settings acceptance covers cancellation, persistence, prepared wager, actual Enter wager and cold restart; full-hand payout regression remains required before publication.

This change covers sidebar captions only. Page bodies, exact native font/raster/tab geometry, operator visibility overrides and whole-app animation/audio parity remain incomplete.
