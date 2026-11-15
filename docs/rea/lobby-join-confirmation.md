# Join → rezervare → confirmarea buy-inului

## Traseul REA

[Identități și limite](lobby-join-source.json). Game51, FFDec headless selectiv, fără AIR/cont real. TablePreview trimite JOIN_TABLE cu masa reală. HomeMediator înregistrează verificarea loginului pentru JOIN_TABLE și JOIN_TABLE_WITH_SEAT_INDEX; în handler creează TableConnection, setează reserveSeatWhenOpened=true (și indexul ales când există), apoi emite OPEN_TABLE. TableFacade expune flagul și CHECK_RESERVE_SEAT. CheckReserveSeatCommand, fără userPlayer și cu flagul, trimite RESERVE_SEAT. Requestul3104/ReserveSeat marchează rezervarea proprie la succes și emite CHECK_TAKE_SEAT. CheckTakeSeatCommand desparte TAKE_SEAT automat (preferință explicită ori parametrii auto de grup) de POPUP_OPEN_BUY_IN pentru cazul obișnuit. Aceste etape separă rezervarea de cumpărare; ramura automată are propriile condiții.

Registrul Poker leagă AUTO_JOIN_TABLE și CHECK_AUTO_JOIN de comenzile de grup; acestea implică matchmaking/număr de mese și nu înlocuiesc Join din panoul selectat. OpenTableCommand singur nu a fost tratat ca registry pentru JOIN_TABLE. Găsirea handlerului HomeMediator închide acea necunoscută locală din documentația anterioară, fără a demonstra reguli private de server.

## Schimbarea locală

Doar linkul Join din Table View adaugă intenția one-shot `join=1`. Open rămâne spectator, Group View păstrează traseul anterior. Masa autentificată consumă intenția după inițializarea formularului și a waiting UI (gate-ul de lifecycle PR227), folosind același submit/reserve/dialog și aceleași verificări account/Origin/fonduri/mână. `join` și vechiul `autojoin` sunt scoase imediat din URL și invitație; reloadul după anulare nu reexecută comanda. Preferința Auto Buy-In continuă să controleze cumpărarea automată; intenția Join singură nu o activează.

Fără backend nou, schemă, procedură de cumpărare paralelă ori modificarea politicii de rezervare locală. Rezervarea și Cancel folosesc endpointurile existente, iar debitul manual se produce numai la OK. Rutele guest, VIP/tickets/regional/ratholing și arbitrajul original nu sunt pretinse complete.

## RED → GREEN și gate

`node network-browser-test.mjs --bots --lobby-join-confirm` a reprodus lipsa popupului pe runtimeul imuabil PR229. Două porniri source-mode au avut separat timeout înainte de API; nu sunt folosite drept dovadă RED funcțională. Diagnosticul izolat ulterior a confirmat că serverul pornește și răspunde, fără modificare de cod/backend ori prelungirea timeoutului; rularea sursei a continuat. Un test ulterior de acoperire WIN a găsit elementul deja expirat; verificarea completă este repetată cu snapshotul de art instalat existent, fără eliminarea aserțiunilor de showdown.

Fixture-ul păstrează lansare/login local/owner hosting, Open fără seat/dialog/debit, apoi pointer real Join fără click suplimentar pe loc: o rezervare și zero join-uri până la OK. Escape eliberează locul fără debit; reloadul nu redeschide popupul. O nouă apăsare Join și OK produce o singură cumpărare120, URL/invite curate, apoi cinci computere/două mâini720/payout independent și reconectare. Gate-ul Auto Buy-In existent trebuie să treacă separat, fără dialog și cu un singur debit. Stare: integrat și activ prin PR231, mergee431a008aca822e79f1dc63cf7489628008749ea, sursă verificată0ed32019152aeba39fcb031b9b6996fd9122101b.

## Gate final și activare

Raportul are12verificări trecute și o rulare duplicată source-mode marcată explicit skipped după eșec de bootstrap înainte de aplicație. Toate scenariile funcționale au trecut: manual/source și manual+Auto Buy-In+queue/skin pe copia instalabilă. Toate121fișierele runtime au fost comparate byte-for-byte cu commitul; nu au fost eliminate aserțiuni ori îngustate scenarii. Failurile originale sunt păstrate în `.git/danslab-qa/pr231-first-run-0ed3201`; gate-ul final este `pr231-evidence.json`, echivalența `pr231-runtime-equivalence.json`. GitHub/gate a avut o eroare tranzitorie; numai după un nou qa-check reușit s-a făcut expected-head merge.

Rollout idle PID30191→6765, runtime121fișiere/1411898bytes în `/Users/davidai/.local/share/playgg-runtime/lobby-join-0ed3201`, art1330refolosit. Backup `pr231-vj_ip5ou`; șase fișiere owner/15496bytes identice, fără gameplay QA pe live. `pr231-live.json` păstrează dovada. Native physical popup/timing și politici private rămân neverificate.

## Incidentul checkoutului după activare

Git a raportat `mmap failed: Operation canceled` la fast-forward și a lăsat FEATURES gol, apoi alte fișiere parțial actualizate. Nu a fost tratat ca editare validă. Octeții vechi/parțiali și indexul au fost păstrați sub `.git/recovery/pr231-partial-fastforward` și `pr231-manual-fastforward`. Au fost verificate numai cele șapte căi din diferența HEAD→origin/main; conținuturile trebuiau să fie versiunea veche, cea integrată sau octeți zero din checkoutul eșuat. Orice alt conținut ar fi oprit recuperarea.

Fișierele au fost scrise atomic din bloburile commitului integrat, apoi indexul și refurile au fost avansate numai fast-forward, cu expected-old și verificare de ancestry; fără reset hard, rescriere de istoric sau bypass de QA. Starea finală este curată. Eșantionarea copilului Git identificat prin cwd/parent a arătat citirea unui test urmărit;70fișiere dataless totalizau279071bytes. Ultima cerere exactă de materializare a inclus40fișiere/144210bytes, după ce o parte reveniseră deja local. Nicio imagine ignorată, model, cache ori politică de sincronizare nu a fost modificată. `.gitignore`107bytes a fost de asemenea materializat și comparat cu blobul comis. Aplicația instalată și datele owner au rămas separate de acest checkout.
