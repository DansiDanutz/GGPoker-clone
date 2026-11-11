# River Room — GGPoker clone project

An independent local poker practice client. Open the directory in T3 or run:

    node server.mjs

Open http://127.0.0.1:18765. In the lobby, choose **Take a seat**. The **Owner console** can create, close, or update tables; its key is kept outside Git in `~/.local/share/river-room/owner.key`. Table settings persist there across restarts. Choose **Play no-limit** in the lobby for four-seat local practice against three computer seats. Enter the total bet for the current street, or use **All in**. A new practice hand rotates the button and resets the stacks. Run `node nolimit-test.mjs`, `node pots-test.mjs`, `node test.mjs` and `node owner-test.mjs` to check the game and owner API. No packages, player account or internet connection are required to play.

## Implemented

Heads-up fixed-limit Hold’em against a computer opponent, blinds and alternating dealer, fold/check/call/raise, four betting streets, seven-card showdown, split pots, hand history, and owner settings for next-hand buy-in and blind size. These are browser-local play chips; each hand resets both stacks. The lobby uses owner-authenticated table settings. Standalone practice (index.html without a table ID) uses browser-local preferences. This is not yet a multi-user service.

## Fidelity and next milestones

The installed reference is GGPoker.app (PLAYGG.RO). This is original code and design; there is no connection to the operator, its accounts, player balances, cashier or private admin systems. No customer data or credentials belong in this repository.

Not a 1:1 recreation. Next: document the visible lobby and table flows and their acceptance criteria; extend local no-limit practice to networked tables; add an independently hosted authoritative game server, authenticated owner roles, audit history and tournament scheduling. Real-money transactions are outside this prototype.

## Reference inventory

Visible lobby labels confirmed in the installed client include Hold’em, tournaments, Rush, Spin, Battle Royale, a leaderboard and cashier. These labels establish a feature inventory, not production behavior or access to operator controls. No screenshots, credentials or operator assets are distributed here.
The verified scoring module lives in engine/hand.mjs; the root hand.mjs is an unshipped T3 scratch file.
