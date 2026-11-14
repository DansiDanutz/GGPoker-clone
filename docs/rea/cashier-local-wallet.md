# Cashier entry and local play wallet

## Native evidence

OpenCashierPageCommand extends OpenExternalPageCommand. It resolves the cashier OutLink (with optional backup-domain health checks),then opens a configured external page or in-app browser. Parameters include language,client-device information and optional account token. A PRIMEPOKER-specific KYC guard can open a verification popup. This does not establish PLAYGG.RO browser settings,remote page layout,payment methods or operator backend behavior. No external cashier was opened andno real-money action was performed.

OpenCashierCommand on a table dispatches OPEN_CASHER. NewCashierButton uses lobby_side textures0/2/1,ButtonCashier nickname-gradient16px label,pressed alpha0.5 andlabely1 versus-1. Its light animation waits5seconds then fades/rotates over2seconds; a counter is present. The opening command also requests an escrow unread count,but the wiring to this counter has not been traced. Physical hover/light timing andremaining native state artwork are not yet implemented locally.

## Local behavior

The existing captured Cashier button (layout idcash,x1086,y309,107×72 at1196×929) was disabled. It now opens the existing My Wallet in-app page through openProfile/selectProfilePage; it does not introduce a second ledger or external payment flow. Guests go to local launch/login. Wallet balances andtransactions remain authenticated /local/wallet data,including table funding/cash-outs andlocal owner grants. The native remote cashier UI is not being claimed as reproduced.

Cashier Close/Escape returns keyboard focus to Cashier. Enter reopens it. The profile/avatar entry retains its prior return target. The existing request generation andaccount-name checks still reject late responses andwrong-account data.

## Verification

Browser RED confirmed Cashier disabled; after connection,GREEN confirms actual pointer hit at1140,345 opens My Wallet without leaving playgg.html. A second RED showed closefocus returning toProfile; after retaining the initiating Cashier control,GREEN verifies Escape/focus/Enter. The complete player-wallet scenario passes owner grant10000→10500,buyin10300,cashout10500,latergrant10575,retry/stale response safety,two viewport widths,cold restart andwrong-account rejection. A separate guest session verifies Cashier Enter leads to /launch.html. All data is ephemeral; live owner state is unchanged. Avatar regression PASS: Apply/cancel,live spectator update,prepared bet preserved,1200-chip payout,restart/account continuity andguest/logout identity guards.

Missing parity: remote cashier appearance/internal services,table Cashier entry,native hover/down/light animation andescrow counter. The user requested local play money andin-app workflows; these sources do not justify inventing remote payment screens oroperators rules.

## Native button states — pending release

Three atlas crops (lobby_side0000up,0001over,0002down) are each108×65. tools/extract-cashier-art.swift validates original frame dimensions/nonrotation anddecoded RGBA equality after PNG encoding. Private crops/receipt are additive;33199PNGbytes per source-private/runtime-art copy. Raw native assets remain outsideGit.

Cashier now uses these source state textures instead of the captured static button andgeneric brightness hover. Its control is108×65 at the previously observed anchor. NewCashierButton supplies pressed opacity0.5 andlabely1 versus-1. StageAssets.getNicknameLabel confirms bold,useRoboto and16px. Existing privately recovered RobotoBold is reused. NicknameLabel creates a horizontal gradient (createGradientBox angle0),stretched to rendered text bounds; CSS uses the same c1a867/ffffff/e1dc81 colors and1/125/255ratios on an inner text span. The label uses native ButtonCashier localization.

The source parent LobbyUserInfoView sets cashierx-6 anddynamically sets yfromuserBalance.y+bottom+10; the existing captured x1086/y309 anchor is retained here. Full dynamic sidebar/balance geometry andlabel AIR baseline/autoscale are not established by texture size alone. The light remains separate andunimplemented.

Browser player-wallet PASS: all3images decode108×65; button bounds108×65,label16px/y-1; true pointer hover choosesover,press choosesdown/opacity0.5/labely1; dragging outside restoresnormal andcancels activation. The complete wallet/guest/keyboard/restart/account isolation scenario also passes. No live runtime change yet. The later nowrap-only CSS change awaits commit-bound release QA.
