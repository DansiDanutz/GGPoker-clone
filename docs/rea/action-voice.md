# Action Voice reconstruction — in progress, not installed

The source/catalog/resource stage is complete; the player-facing feature is not yet wired. Live remains PR293. `voice-packs.mjs` is an unused candidate module, not a claim of working voice playback. Native source/image/sound identities are in action-voice-source.json.

VoicePack.list supplies14 packs in original order,defaultVDaniel and a separate GGPNL influencer restriction. The local candidate represents the normal owner catalog without inferring an operator account flag. Seven VoiceAction entries are ordered All-In,Raise,Bet,Check,Call,Fold,Straddle. Exact class spelling matters:VWilliams maps to VoiceBetWilliam,and All-In uses VoiceAllin. The original Vmale4 legacy alias is singularVWilliam,which is not a canonical pack;the candidate preserves its default fallback rather than silently inventing a fix. Catalog objects are frozen and invalid selectors cannot generate arbitrary cue/file paths.

All98 model symbols match original SoundItem VOICE declarations and SWF SymbolClass/DefineSound entries. The existing extractor gains --voices;all98 exact MP3 payloads total900362bytes,44.1kHz,and are read back against independently inventoried samples/seek/hash values. Fourteen original action_voice portraits total953587bytes and are identified without recoding. No actor portrait is invented;the unused CircleFrame asset is not substituted for source drawing. Full browser decoding remains pending;an availability check for an additional decoder was blocked by disk preflight and was not bypassed.

## Original in-app workflow

Sound's voice-selection button first saves changed sound-page preferences,then navigates internally to MyPage/MyActionVoice. It is not a dropdown. MyActionVoice has a20px title at36,24,a carousel centered410,68,an action bar410,244,a302px volume slider at242,320 and a green Apply button. Apply persists pack and voice volume while staying on the page;preview does not save the selection. Source UserSetting defaults voice volume to0.5 and enabledtrue.

Carousel mask is748x162;selected portrait radius60 versus36 at the sides. The first slot is131units from center,then85per additional slot;drag threshold5,110px per slot,cyclic wrap and0.2s snap animation. Selected label uses the pack's primary key at16px/bold/#fefefe;side labels use subtitle keys at12px/#666666. The AI badge is explicitly hidden in the source. Preserve these rules rather than inventing a card grid.

Preview uses the selected pack's exact action clip,shared master volume override/restoration,and the existing3.5s fade/4s stop lifecycle. Action-bar waveform/cooldown is1s. Source slide/drag/volume/speaker/Apply behavior still needs browser implementation and verification.

## Required table transport and action rules

TableMediator resolves the own actor's pack from the local preference and the opponent's pack from player.voiceName. A listener's selected pack must not replace every actor. Persist the authenticated account's choice and project safe canonical pack IDs by authenticated seat identity,following existing account/avatar ownership. Do not infer account identity from a display nickname. Preserve PIN/session/avatar/wallet data and validate backup/restore compatibility.

Voice playback requires native userPlayer.isPlaying (status equals EGamePlayerStatus.Playing);the equivalent local eligibility predicate needs an explicit mapping test before routing.Source suppresses preflop Fold voice. A zero-balance non-call gets All-In voice,while an all-in Call retains Call voice. AoF is separately All-In. Local tableCues currently loses actor/street detail and treats some all-in calls as AllIn effects;do not blindly append voices to its strings. Use public action trace metadata with actor,street and actual action,without exposing private cards or replaying reconnect history. Preserve existing sound effects,clock alerts and payouts.

## Release gate

Implement source carousel/selection/action preview/volume/Apply and Sound→MyPage navigation;authenticated account save and public seat metadata;source action-voice routing and independent volume/mute;safe exact media serving;browser decode of all98 cues;independent packs in separate sessions;full hand/payout and cold restart. Only after these pass should the candidate be installed. Native physical speaker timing and full-app fidelity remain unproven.
