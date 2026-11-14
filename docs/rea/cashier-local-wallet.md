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
