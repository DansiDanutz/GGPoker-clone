# DanGG — local play-money poker

An independent local play-money poker client, developed in Codex. The current Mac instance is available at [the local player login](http://127.0.0.1:18770/). T3 is not part of this workflow. This is an implementation checkpoint, not a completed 1:1 reproduction. See [STATUS.md](STATUS.md) for current validation and remaining work. The public repository contains source, tests, extraction tools and the user-provided DanGG logo. Native reference artwork, local captures and verification reports under `home-art/` remain local; reference-mode visuals require that existing asset pack.

The [detailed functional manual](docs/rea/README.md) documents controls, appearance, backend/frontend behavior, source findings and unverified gaps. Raw local reports and private evidence remain outside Git.

On this Mac, open `~/Applications/PLAYGG Local.app` for the native window connected to this project. It reuses the local server, or starts it with the same saved data when unavailable. Quitting the window leaves the server running for other players. Login cookies use WebKit's persistent store. Rebuild with `zsh tools/install-mac-app.sh`; verify isolated first-launch and cold-relaunch behavior only after an explicit foreground-test request with `PLAYGG_ALLOW_FOREGROUND_QA=1 zsh tools/test-mac-app.sh`. `PLAYGG_ALLOW_FOREGROUND_QA=1 PLAYGG_AUDIO_PROBE=1 zsh tools/test-mac-app.sh` additionally measures audio attributed to the isolated app without storing samples. That optional gate currently returns failure because the parent-app tap is silent; it still completes the gameplay and relaunch checks. This does not distinguish silent playback from WebKit helper attribution. The launcher requires this checkout and the configured Node executable to remain in place. Other poker apps on the Mac are separate applications.

To start the same local instance from this directory:

    PORT=18770 POKER_REFERENCE_HOME=1 POKER_DATA_DIR="$HOME/.local/share/playgg-owner" node server.mjs

Use the existing running instance when port 18770 is occupied. This data directory preserves the Mac's accounts, table definitions, room state and owner audit. The owner key is in `~/.local/share/playgg-owner/owner.key`; do not put it in Git.

Create a local nickname and six-digit PIN, or sign in with an existing local account. Open Hold’em, PLO, Short Deck or All-In or Fold, select an owner-created table, and take a seat. Choose **Fill empty seats with computers** to play alone. With two or more people seated, the first seated player can choose **Start hand with … players** without filling the table. A player joining an empty seat during a cash hand waits for the next deal; their practice buy-in is added then. Hold’em and Omaha use six seats; AoF uses four. **Ready for next hand** continues with current balances; busted cash seats receive a local practice rebuy. **End practice and release table** clears a finished solo table.

After a cash hand settles, **Leave table** releases your seat and records its practice chip amount. The other players retain their stacks while waiting for a replacement; the next deal keeps hand/dealer progression. A player still waiting for their first deal can cancel the reservation during a cash hand without receiving chips. Dealt players cannot leave mid-hand; leaving a started freezeout remains unavailable. These receipts are local practice records, not a wallet balance or real-money withdrawal.

PLO supports four, five and six hole cards with pot limits. Short Deck uses six-through-ace cards and independently tested ranking; its local ante/button-blind allocation is explicitly labeled and native equivalence remains unverified. AoF Hold’em supports Fold/All in only. Native rebuys, jackpots and AoF Omaha remain incomplete. `FEATURES.md` records evidence and gaps; passing a local hand is not a claim of 1:1 parity.

Game Settings → Betting options controls scroll direction and whether Enter asks for bet confirmation. Changes are drafts until OK; Cancel/Escape discard them. Amounts still follow table betting limits. Game Settings → Sound offers saved master volume and table mute. Game Settings → Hotkey enables fixed action keys and optional on-screen key hints. Other settings pages remain listed as unavailable where their behavior is unverified.

## Hosting as the owner

On the local Home screen, choose **Hold’em → Host & manage tables**. Enter the owner key from the server's printed key-file path, choose a unique table ID, name and format, and save. A cash table uses the configured starting stack and blind. A freezeout defaults to 100 starting chips and initial blinds 2/4; owners can configure starting chips, blinds and an optional per-player ante. The default four-player prize pool is 100 practice credits. Antes are separate from street bets and double with each local blind level, taking effect on the next hand. The player lobby shows current occupancy. Closing registration blocks new entrants; seated players can finish and reconnect. Occupied tables retain their name, format and stakes. Use a new ID for another event.

Hosted tables enforce the local 90-second turn deadline even with all windows closed: check when free, fold when facing a wager. Computer turns wait at least 500 ms; extra clients or refreshes cannot shorten that delay. Scheduled tournaments also advance through the server timer. These durations are local policy, not verified native timings.

In the owner console, **Create backup** saves a private game/profile snapshot and **Verify integrity** checks its hashes. Files live in `~/.local/share/playgg-owner/backups/`; each is limited to 20 MiB, with ten retained slots and no automatic deletion. The owner key is excluded. The console provides a confirmed transactional restore with a rescue snapshot. Isolated tests cover rollback and recovery after interruption; active games and pending recovery prevent an unsafe restore.

The Mac's private Home reference artwork is available only in local reference mode. The multiplayer lobby and game work independently of that artwork.

## Four-player private rooms

Choose **Create multiplayer room**, copy the invitation and have four separate browsers take seats. The fourth join starts the hand. First-hand stacks are 30, 70, 100 and 100 practice chips. All four players must mark ready for another hand. Stacks carry forward; a busted seat gets a practice rebuy. Turn expiry checks or folds after 90 seconds, when a seated client next contacts the server. The room keeps the latest 20 results, action histories and net-chip standings. A refresh in the same tab and a server restart preserve the seat and hand. Guest seats depend on their tab token; signed-in hosted seats can recover through their account after reopening. Rooms expire after four hours of inactivity.

The default address works on one Mac. For play across devices on a trusted LAN, bind to the Mac's LAN address and set the exact origin the players will open (replace the sample IP):

    POKER_BIND_HOST=192.168.1.20 POKER_PUBLIC_ORIGIN=http://192.168.1.20:18765 node server.mjs

Open that LAN URL before creating the invitation. For HTTPS behind a reverse proxy, keep the loopback bind, set POKER_PUBLIC_ORIGIN to the external HTTPS origin, and forward the original Host header. Owner changes are disabled outside default local-only mode. Room snapshots are private server files under POKER_DATA_DIR; do not share them.

Run `node network-browser-test.mjs` from this directory to test four isolated Chrome sessions on an ephemeral server. Set CHROME_BIN if Chrome is installed outside the macOS default path.

## Four-player tournament

Choose **Register for tournament** from the lobby and send the invitation to the other three players. Players can withdraw until the fourth registration starts the freezeout. Each registration adds 25 simulated prize credits to the pool; the event starts with 100 tournament chips per player. There is no wallet or real-money entry. Big blinds progress 4 → 8 → 16 → 32 → 64 → 128 → 256 by elapsed minutes, with changes applied only at the next deal. Players with zero chips are eliminated and may watch. The remaining players automatically advance to the next hand after a three-second showdown display when a client contacts the server. The last player receives the 100-credit prize once, separately from their final stack. Refresh and server restart preserve the result.

Run `node tournament-test.mjs` and `node network-browser-test.mjs --tournament` to verify the registration rules and play the tournament through four isolated Chrome sessions. The browser test accelerates the blind clock.

## Verification

Standalone tests cover hand ranking, betting, side pots, computers, blind levels, tournaments, owner authorization and persistence, Omaha, Short Deck and AoF. The existing browser harness supports `--bots`, `--hosted`, `--plo`, `--plo5`, `--plo6`, `--shortdeck`, `--tournament`, `--aof`, and `--aof --fold-player`. It uses temporary servers and isolated Chrome contexts. No package installation is required.

## Fidelity and next milestones

The installed reference is GGPoker.app (PLAYGG.RO). This is original code and design; there is no connection to the operator, its accounts, player balances, cashier or private admin systems. No customer data or credentials belong in this repository.

Not a 1:1 recreation. Next: document the visible lobby and table flows and their acceptance criteria; add multi-table tournament seating, remaining game modes and owner roles. Owner create/update audit history and its authenticated viewer are implemented. Real-money transactions are outside this prototype.

## Reference inventory

Visible lobby labels confirmed in the installed client include Hold’em, tournaments, Rush, Spin, Battle Royale, a leaderboard and cashier. These labels establish a feature inventory, not production behavior or access to operator controls. Native captures and artwork are local comparison evidence; reference-mode serving is restricted to loopback. Credentials are not project assets.
The verified scoring module lives in engine/hand.mjs; the root hand.mjs is an unshipped T3 scratch file.

Rush lobby (`/playgg.html?player&view=rush`) now offers isolated Hold’em and PLO practice pools. Join a pool, then choose Play Rush with computers for solo play. Eleven named computers provide fresh opponents after quick-fold; payouts, pool chips and active assignments persist. Server timers continue without a browser. No real money, native Cash Drops or exact timing parity is claimed.

Owner-created freezeouts may set a local start date/time. At the deadline, two or more registrations start the event; fewer cancel with a recorded simulated entry refund. Empty seats receive no chips. Leave the start field empty for the existing full-registration start. Scheduled events and results persist across server restart.

Freezeout game selection supports No-limit Hold’em or Pot-limit Omaha (four private cards, exact two-hole/three-board evaluation). PLO events appear in the tournament PLO category; the local six-player PLO practice event can be filled with five computers.

Owner prize shares accept comma-separated whole percentages (for example 50,30,20). Credits round by largest remainder, with higher finishing place breaking ties, so the entire prize pool is paid exactly. Scheduled events need enough registrations for all paid places and at least two players. The empty six-seat PLO practice event uses 50/30/20; winner-takes-all remains the default for new events.

The native-style cash catalog lists only owner-hosted server tables. Local identity is detected on direct lobby URLs too; signed-out views show Guest/Play money and link to local login. Captured reference-account balances and online counts are not local app state.

Click your signed-in profile to choose a local avatar and Apply. The choice is stored on the account and appears at any chosen seat, in spectator/catalog views and Rush. Nicknames remain locked. Seven avatar choices are available; uploads and other account services are not implemented.

Local login now survives backend restarts for its existing twelve-hour lifetime; launch resumes a valid session into the lobby. Sign out revokes that session durably. Raw cookie tokens are not stored: private account-store v1 keeps their digests and expiry. Legacy account records migrate automatically on the next successful write without changing PIN hashes or avatars. Sessions created before this change were memory-only and need one sign-in after the update.

Owner chat moderation: enter the local owner key in the owner console, then choose **Manage chat** beside a hosted table. Mute/Unmute applies to text and reactions only. Local-account mutes persist for that table across rejoining; guest mutes belong to the occupied seat identity. Betting and seating remain enabled. Changes are private-audited; a stale player selection must be reloaded.

Cash buy-ins: optional **Minimum buy-in** and **Maximum buy-in** fields let owners offer a range on Hold’em and Omaha tables. Keep both blank for a fixed stack. The default starting stack must fall inside the range; limits cannot change while occupied. Players choose their play-chip buy-in when seating. Waiting reservations are funded on their next deal. This uses local practice chips, without a wallet or real funds.

Custom avatars: open **My Game Profile → Upload Image**, choose a PNG/JPEG/WebP up to 5 MiB, then **Apply**. The preview uses a square center crop; Close/Escape cancels. One saved custom image appears under **Custom** and follows your local account into table seats and lobby previews. Images are resized to 256×256, validated and stripped of ancillary metadata before local storage; nothing is uploaded externally.

Tournament clocks: set **Blind level duration (seconds)** in the owner console for an individual freezeout, or leave blank for the server default. The interval is locked once players register and applies to the next hand; each event keeps its own clock through restart.

Spin & Gold information preview: use the **Spin & Gold** lobby control (or `/playgg.html?view=spin`). The two observed play-money stakes, 1–4 game-count selection, Info/Blind Structure/Payout tables and insurance explanation work locally. **Play Now remains unavailable** while multiplier-specific starting stacks and time-bank allocation are unverified. Same-size native/local evidence is in `/home-review.html#spinInfoComparison`.

Default cash buy-in: Home gear → Game Settings → Buy-in settings lets you save a percentage of the table maximum. Amounts below the minimum clamp upward. Your manual seating amount takes precedence; existing users without a saved preference retain the owner default. Auto Top-up can refill to the maximum at the next hand after Ready, with an exact private practice-chip receipt; completed payouts stay unchanged. Auto Buy-In can seat a signed-in local player from Join using that percentage; Open stays spectator-only. Top-up sliders select a 0–100% trigger threshold and a 20–100% target, with threshold never above target. Funding uses integer practice chips and respects the table minimum.

Betting shortcuts: Home gear → Game Settings → Betting options configures four opening and four pot-percentage/Max buttons. Settings update open local tables while retaining a prepared amount. Ctrl+1–4 selects the matching shortcut; selection never submits a bet. Big Blind/Small Blind controls the wheel increment. The shortcut illustration comes from the installed native atlas. Native rounding behavior remains unverified.

Table backgrounds: Home gear → Game Settings → Table Theme offers20 original background textures plus the current green table. Apply saves the local preference; Cancel discards the draft. Table settings has the same selector, and open tables update after the artwork decodes while retaining game state. Original dark source felt is used; independent felt colours and variant-specific composition remain incomplete.

Card backs: Home gear → Game Settings → Table Theme offers nine original card-back designs. Apply saves the choice; Cancel discards the draft. Table settings → Card back changes it immediately on that device. Appearance changes retain the hand and do not reveal opponents; card-front styles remain incomplete.

Card fronts: Home Game Settings → Table Theme or Table settings → Card front switches two/four-colour faces. Four colours uses green clubs and blue diamonds from native observations. It changes appearance only, preserving dealt cards and privacy. Four additional native front layouts and exact native glyph geometry remain unverified.

Table appearance: open Game Settings → Table Theme to choose among six card fronts, nine backs, ten felt choices and twenty backgrounds. OK applies the draft; Cancel discards it. Table settings also changes the current browser’s felt/front/back preferences while retaining the hand and prepared bet. The native/local settings comparison is at `/home-review.html#feltColourComparison`.

The live table’s Felt colour and Table background selectors apply only to that table in your browser. Choose Use Game Settings to return to the general preference. Card-front/back choices remain general preferences.

At a table, the chat icon opens a separate chat window; the gear opens settings over the table. These panels preserve the current table and prepared bet. Rush chat is unavailable. Current original/local table comparison: `/home-review.html#tablePanelsComparison`.


Showdown update: six-seat WIN uses the recovered original46-frame effect and preserves visible card identifiers. Verification scope and remaining native timing/placement gaps: [native WIN report](home-art/rea/native-win-verification.json).


Chip Shuffle: Table settings → Shuffle chips starts the original-frame cosmetic effect; press again to stop. Wheel over the chips controls it. The Chip Shuffle preference disables your own effect while retaining other players’ animations, following the recovered client rule. Tests: `node chip-shuffle-test.mjs`, `node network-browser-test.mjs --shuffle-settings`, and `node network-browser-test.mjs --hosted`. Scope and remaining native sound/placement gaps: home-art/rea/chip-shuffle-table-verification.json.


Chip Shuffle now uses the original embedded Up/Combine/Other sounds in preview, at your seat and across sessions. They follow recovered frame triggers and stop with remote animation. Audio source/verification: home-art/rea/chip-shuffle-audio-verification.json. Native phase/mixing and physical speaker output remain unverified.

### Native atlas extraction

`StageAssets` desktop action buttons use `after_lobby/desktop_table_assets.png` with `tools/extract-reserved-actions.swift`. Starling `Assets.current` player/chip graphics use `table_assets/table_assets_1.atf` and its ZIP metadata with `tools/extract-starling-atf.py`; their numeric frame indices are separate namespaces. Do not extract Starling frames from the desktop PNG. The Python extractor uses the existing Pillow runtime, validates ATF v2 raw DXT5, runs synthetic decoder checks, and compares each exported PNG with its decoded atlas crop. Run `--self-test` independently. Extraction evidence is `home-art/rea/starling-atlas-extraction.json`.
