# Join → rezervare → confirmarea buy-inului

## Traseul REA

[Identități și limite](lobby-join-source.json). Game51, FFDec headless selectiv, fără AIR/cont real. TablePreview trimite JOIN_TABLE cu masa reală. HomeMediator înregistrează verificarea loginului pentru JOIN_TABLE și JOIN_TABLE_WITH_SEAT_INDEX; în handler creează TableConnection, setează reserveSeatWhenOpened=true (și indexul ales când există), apoi emite OPEN_TABLE. TableFacade expune flagul și CHECK_RESERVE_SEAT. CheckReserveSeatCommand, fără userPlayer și cu flagul, trimite RESERVE_SEAT. Requestul3104/ReserveSeat marchează rezervarea proprie la succes și emite CHECK_TAKE_SEAT. CheckTakeSeatCommand desparte TAKE_SEAT automat (preferință explicită ori parametrii auto de grup) de POPUP_OPEN_BUY_IN pentru cazul obișnuit. Aceste etape separă rezervarea de cumpărare; ramura automată are propriile condiții.

Registrul Poker leagă AUTO_JOIN_TABLE și CHECK_AUTO_JOIN de comenzile de grup; acestea implică matchmaking/număr de mese și nu înlocuiesc Join din panoul selectat. OpenTableCommand singur nu a fost tratat ca registry pentru JOIN_TABLE. Găsirea handlerului HomeMediator închide acea necunoscută locală din documentația anterioară, fără a demonstra reguli private de server.

## Schimbarea locală

Doar linkul Join din Table View adaugă intenția one-shot `join=1`. Open rămâne spectator, Group View păstrează traseul anterior. Masa autentificată consumă intenția după inițializarea formularului și a waiting UI (gate-ul de lifecycle PR227), folosind același submit/reserve/dialog și aceleași verificări account/Origin/fonduri/mână. `join` și vechiul `autojoin` sunt scoase imediat din URL și invitație; reloadul după anulare nu reexecută comanda. Preferința Auto Buy-In continuă să controleze cumpărarea automată; intenția Join singură nu o activează.

Fără backend nou, schemă, procedură de cumpărare paralelă ori modificarea politicii de rezervare locală. Rezervarea și Cancel folosesc endpointurile existente, iar debitul manual se produce numai la OK. Rutele guest, VIP/tickets/regional/ratholing și arbitrajul original nu sunt pretinse complete.

## RED → GREEN și gate

`node network-browser-test.mjs --bots --lobby-join-confirm` a reprodus lipsa popupului pe runtimeul imuabil PR229. Două porniri source-mode au avut separat timeout înainte de API; nu sunt folosite drept dovadă RED funcțională. Diagnosticul izolat ulterior a confirmat că serverul pornește și răspunde, fără modificare de cod/backend ori prelungirea timeoutului; rularea sursei a continuat. Un test ulterior de acoperire WIN a găsit elementul deja expirat; verificarea completă este repetată cu snapshotul de art instalat existent, fără eliminarea aserțiunilor de showdown.

Fixture-ul păstrează lansare/login local/owner hosting, Open fără seat/dialog/debit, apoi pointer real Join fără click suplimentar pe loc: o rezervare și zero join-uri până la OK. Escape eliberează locul fără debit; reloadul nu redeschide popupul. O nouă apăsare Join și OK produce o singură cumpărare120, URL/invite curate, apoi cinci computere/două mâini720/payout independent și reconectare. Gate-ul Auto Buy-In existent trebuie să treacă separat, fără dialog și cu un singur debit. Stare: candidat; exact-head și instalabil necesare înainte de activare.
