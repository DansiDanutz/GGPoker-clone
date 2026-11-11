# River Room — GGPoker clone project

An independent local poker practice client. Open the directory in T3 or run:

    node server.mjs

Open http://127.0.0.1:18765. In the lobby, choose **Take a seat**. The **Owner console** can create, close, or update tables; its key is kept outside Git in `~/.local/share/river-room/owner.key`. Table settings persist there across restarts. Choose **Play no-limit** in the lobby for four-seat local practice against three computer seats. Enter the total bet for the current street, or use **All in**. A new practice hand rotates the button and resets the stacks. Run `node nolimit-test.mjs`, `node pots-test.mjs`, `node test.mjs` and `node owner-test.mjs` to check the game and owner API. No packages, player account or internet connection are required to play.

## Four-player private rooms

Choose **Create multiplayer room**, copy the invitation and have four separate browsers take seats. The fourth join starts the hand. First-hand stacks are 30, 70, 100 and 100 practice chips. All four players must mark ready for another hand. Stacks carry forward; a busted seat gets a practice rebuy. Turn expiry checks or folds after 90 seconds, when a seated client next contacts the server. The room keeps the latest 20 results, action histories and net-chip standings. A refresh in the same tab and a server restart preserve the seat and hand. Closing the tab loses its seat token. Rooms expire after four hours of inactivity.

The default address works on one Mac. For play across devices on a trusted LAN, bind to the Mac's LAN address and set the exact origin the players will open (replace the sample IP):

    POKER_BIND_HOST=192.168.1.20 POKER_PUBLIC_ORIGIN=http://192.168.1.20:18765 node server.mjs

Open that LAN URL before creating the invitation. For HTTPS behind a reverse proxy, keep the loopback bind, set POKER_PUBLIC_ORIGIN to the external HTTPS origin, and forward the original Host header. Owner changes are disabled outside default local-only mode. Room snapshots are private server files under POKER_DATA_DIR; do not share them.

Run `node network-browser-test.mjs` from this directory to test four isolated Chrome sessions on an ephemeral server. Set CHROME_BIN if Chrome is installed outside the macOS default path.

## Four-player tournament

Choose **Register for tournament** from the lobby and send the invitation to the other three players. Players can withdraw until the fourth registration starts the freezeout. Each registration adds 25 simulated prize credits to the pool; the event starts with 100 tournament chips per player. There is no wallet or real-money entry. Big blinds progress 4 → 8 → 16 → 32 → 64 → 128 → 256 by elapsed minutes, with changes applied only at the next deal. Players with zero chips are eliminated and may watch. The remaining players automatically advance to the next hand after a three-second showdown display when a client contacts the server. The last player receives the 100-credit prize once, separately from their final stack. Refresh and server restart preserve the result.

Run `node tournament-test.mjs` and `node network-browser-test.mjs --tournament` to verify the registration rules and play the tournament through four isolated Chrome sessions. The browser test accelerates the blind clock.

## Implemented

Heads-up fixed-limit Hold’em against a computer opponent, blinds and alternating dealer, fold/check/call/raise, four betting streets, seven-card showdown, split pots, hand history, and owner settings for next-hand buy-in and blind size. These are browser-local play chips; each hand resets both stacks. The lobby uses owner-authenticated table settings. Standalone practice (index.html without a table ID) uses browser-local preferences. The separate private-room mode is server-authoritative and uses four human sessions.

## Fidelity and next milestones

The installed reference is GGPoker.app (PLAYGG.RO). This is original code and design; there is no connection to the operator, its accounts, player balances, cashier or private admin systems. No customer data or credentials belong in this repository.

Not a 1:1 recreation. Next: document the visible lobby and table flows and their acceptance criteria; add multi-table tournament seating, owner roles and audit history. Real-money transactions are outside this prototype.

## Reference inventory

Visible lobby labels confirmed in the installed client include Hold’em, tournaments, Rush, Spin, Battle Royale, a leaderboard and cashier. These labels establish a feature inventory, not production behavior or access to operator controls. No screenshots, credentials or operator assets are distributed here.
The verified scoring module lives in engine/hand.mjs; the root hand.mjs is an unshipped T3 scratch file.
