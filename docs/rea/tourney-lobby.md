# Native tournament lobby — recovered client contract

This records the installed client, not a proposed design. `tourney-lobby-source.json` binds16 selected ActionScript classes by SHA-256. FFDec exported only these classes from the installed Game/51/IronDesktop.swf; private extracted source stays outside the repository. No original account interaction or foreground app was required.

## Window and three independent tab groups

The root TourneyLobby sets default viewport height706. It places the left TourneyLobbyStaking container at3,160, the main container at417,160 and the right players container at782,160. The horizontal separator is0,159,1200,1. Child viewports are411x530,361x527 and412x527 respectively. These are distinct coordinate spaces; the main child viewport has y139 but its root placement is y160. Do not add139 to the root offsets without verifying the base resize logic.

TourneyLobbyBase places its tab layer at7,8 and page layer at7,44; background is common atlas81 with8px nine-slice borders. It preserves separate current tabs for each container. Opening a new tournament resets pages when requested and fades root alpha over0.1s after0.1s delay. This is source-defined timing, not hardware frame/audio calibration.

Main registers Info, Structure, Prize Pool and Venue. Info is the default. Venue is conditional on isGGLive; Structure is hidden for Roshambo/avatar race; payout is conditional for phase events and All-In Gacha. These gates mean the enum is not an always-visible menu. Battle Royale should not receive an invented Venue page without an actual venue.

The left container registers How to Play, Staking, Satellites and Prop Bet. For Battle Royale the How to Play page is populated and visible. Staking additionally requires both entry.canTourneyStaking and account.canStakingWithBrand; it is not proven enabled for every Battle event. Satellites disappear when no tournament/SNG satellite records exist and How to Play or Staking is visible. Prop Bet is conditioned on supported brand/config, last-longer enablement, event exclusions and a non-guest account. The presence of this container does not establish enabled staking, satellites or prop betting locally.

The right container registers Players and Tables. Chat appears only with entry.enableLobbyChat: before the tournament it precedes Players/Tables, while after start it follows them. Field is gated by isRandomBounty. Its open button delegates to the currently selected player/table page. Player-profile opens the actual selected player's HUD. These child page payloads still need recovery before adding local fake rows or routes.

## Header and navigation

Header prize pool is at420,94; registration button group at596,12; right simple information at783,10. The group creates a178x44 registration button. Native Battle prize display adds the actual highestMysteryBounty separately from prize pool; an arbitrary remaining bounty budget is not equivalent to this maximum.

OpenTourneyLobbyCommand resolves an existing entry, marks its window active, opens its lobby window and syncs the tournament subscription. Ordinary open does not register. Only OPEN_TOURNEY_LOBBY_REENTRY additionally dispatches OPEN_TOURNEY_REGISTRATION after subscription. This confirms why a double-click must not debit a local entry implicitly.

For Battle Royale the header can dispatch OPEN_BATTLE_ROYALE_TABLE for an existing user table. Unregister dispatches UNREGISTER_BATTLEROYALE_TOURNEY. The tournament mediator formats the event buy-in and shows a confirmation using title LobbyButtonOpenTourneyUnRegister, body BattleRoyaleCancelRegistration and OK/NO. Only OK dispatches UNREGISTER_BATTLE_ROYALE. This confirmation is proven for the tournament lobby; the global Game List mediator was not recovered here, so its behavior is not inferred from this handler.

## Reconstruction status and next evidence

The existing local event page is playable, but is not the three-pane native tournament lobby. Current evidence is sufficient to establish the hierarchy and callback boundaries. Before claiming full parity, recover the actual child player/table pages, How to Play Battle-specific branches, Structure and Payout models, header button gates and nine-patch/tab artwork. Populate them from actual local registration/qualification/table/prize records, with server-authoritative actions. Preserve real native gates rather than making every enum feature visible.

Native localization strings, exact physical typography, active-theme pixels, hover states, window chrome, platform frame delivery and sound timing are still unverified. Never label this source inventory as completion of the whole lobby or backend.

## Local confirmation verification

The local event page now asks before cancelling a Battle registration. It shows the actual configured entry cost passed through the existing table adapter. No or Escape closes the dialog without any command; OK invokes the existing authenticated, revision-guarded cancellation. A registration that closes while the dialog is open is not cancelled by the client. The dialog lives outside the polled action subtree, so refreshes cannot erase a pending choice. This reproduces the confirmed action boundary, not native alert artwork/localized wording.

`node network-browser-test.mjs --battle-rules` covers actual pointer No, Escape, OK/refund and re-registration, followed by server restart and the existing list withdrawal. Both refunds/entry debits are checked exactly; double-click still does not add another entry. RED withdrawal-confirmation commit records the missing dialog before implementation.

Additional payout gate: TourneyPayoutPage explicitly hides its generic header for Battle Royale, and hides next-payout information for this format even before completion. This is a concrete difference from a generic tournament payout tab; retain it when the native Battle payout content is reconstructed.
