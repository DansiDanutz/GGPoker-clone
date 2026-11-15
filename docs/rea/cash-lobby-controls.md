# Cash lobby: Open, Join, Wait și Cancel Waiting

## REA și identitate

Trei clase exportate selectiv din Game51 cu FFDec26.4.0 headless: CashGameLobby, NormalCashGameLobby și TablePreview (31.746bytes). [Identități și limite](cash-lobby-controls-source.json). Nu este execuție AIR și nu este o captură fizică nouă.

TablePreview.onOperatorSignalHandler verifică loginul și separă OPEN_TABLE(tableID), JOIN_TABLE(table), WAIT_TABLE(tableID), WAIT_TABLE_CANCEL(tableID). În draw, un jucător deja așezat vede numai Open. O masă neplină oferă Open+Join; o masă plină oferă Open+Wait numai dacă waitingPlayers.length<maxPlayers, iar propriul waiter vede Open+UN_JOIN. Există excepții pentru VIP/featured, regiune și junket; acestea nu sunt inventate pentru mesele locale obișnuite. CashGameLobby.CHANGE_PREVIEW leagă actualul tableID și isUserWaiting de panou; SELECT reîmprospătează previewul de grup. Aceste clase nu stabilesc singure double-clickul listei ori matchmakingul de grup.

## Diferența corectată

Panoul local avea Open plus Join pentru orice masă deschisă, inclusiv plină ori cu propriul cont deja în așteptare/așezat. Acum, numai panoul Table View citește endpointul privat existent `/api/rooms/:id/waiting`, prin cookie-ul propriu. Catalogul public rămâne neschimbat: count, fără conturi ori oferte. Comenzile Wait/Cancel folosesc POSTul existent, cu verificările sale Origin/JSON/account și persistență atomică. Nu adăugăm backend, schemă, debit sau un al doilea FIFO.

Panoul oferă Wait/Cancel Waiting/Open/Join din starea reală, ascunde Join pentru contul așezat și Wait la capul UI egal cu numărul locurilor (waiterul propriu poate anula la cap). Lipsa snapshotului privat nu afișează un Join fals. Cererile vechi sunt ignorate după schimbarea selecției/catalogului; acțiunile sunt blocate cât timp se salvează. Eșecul nu schimbă optimist starea și rămâne în details prin polling, până la succes ori schimbarea selecției. Anchorul Wait/Cancel are semantică button, Enter și Space; Open/Join rămân navigare.

Open păstrează spectatorul fără join/debit. Pentru waiterul cu ofertă, Open reutilizează masa și dialogul existent de buy-in; lobbyul indică locul disponibil. Acceptarea rămâne explicită. Nu declarăm că această navigare într-un singur tab reproduce popupul/multi-window nativ. Group View și public matchmaking nu sunt extinse în acest patch. Backendul păstrează limita locală100 de waiters, distinctă de capul UI normal recuperat din client.

## Verificare

RED: `node network-browser-test.mjs --lobby-waiting` a eșuat pe masa plină care afișa Join, nu Wait. Scenariul folosește șase locuri ocupate și două conturi în browsere izolate: pointer real Wait/Cancel/Open, FIFO independent,503/retry cu eroare păstrată prin poll, restart, lipsa conturilor de așteptare din catalog și lipsa debitului. Cu șase waiters, un alt cont nu vede Wait; propriul waiter poate încă anula. Un loc eliberat oferă doar primului waiter buy-inul60; rezultatul mâinii anterioare rămâne arhivat și neschimbat. Următoarea mână folosește pointer real pentru playerul nou și verifică independent payoutul/totalul660. Întoarcerea în lobby ascunde Join pentru contul așezat; guest Wait cere login fără a crea o intrare.

Stare: integrat și activ prin PR227, merge258edea73576d5cba0141d004e188612a77cb284, sursă verificată1c0d8ca34bef451e27bfbc7e9793906fa120df77. Cele14verificări exact-head au trecut:10pe sursă, trei scenarii instalabile și review cu cele trei clase inițiale/SWF. Geometria/artworkul complet al operatorului, localizarea, popupul nativ de ofertă, operator/private-server policies și comparația fizică rămân deschise.

## Regresie de inițializare găsită în gate

Scenariul existent `--bots --auto-buyin` a eșuat atât pe primul candidat, cât și pe runtimeul anterior PR225. Linkul Join păstra `autojoin=1`, preferința era1 și nu exista eroare de server: catalogul hosted era cerut înaintea unui top-level await pentru emoticon-picker; callbackul putea încerca render/admission înainte ca formularul și waiting UI să fie inițializate, iar catchul existent absorbea eșecul. Cererea inițială este acum pornită după aceste inițializări. Nu este adăugat un retry automat ori un al doilea submit. Testul întârzie deliberat modulul opțional250ms și păstrează Open fără auto-seat, Join cu auto-seat explicit preferat, un singur debit120, zero dialoguri Auto Buy-In, mâini cu cinci computere/payout și restart. Diagnosticarea nu expune tokenuri. Aceasta este o corecție de lifecycle local, nu o temporizare pretins recuperată din AIR.

## Activare și următorul contract vizual

Rollout idle PID52129→20720, runtime121fișiere/1408342bytes în `/Users/davidai/.local/share/playgg-runtime/lobby-waiting-1c0d8ca`, art1330refolosit. Backup `pr227-aceqtcms`; toate cele șase fișiere owner/15496bytes identice, fără gameplay QA pe live. Modulele servite playgg.mjs/network.mjs sunt identice cu pachetul verificat. Prima versiune d8efb1d a eșuat pe Auto Buy-In; rezultatul este păstrat în `.git/danslab-qa/pr227-first-head-d8efb1d`, iar gate-ul final în `pr227-evidence.json`, rollout în `pr227-live.json`.

Patru exporturi selective suplimentare, cu hashuri în operatorSources: LobbyDetailViewOperatorBase, LockButton, WaitButton și UnJoinButton. Open este LockButton DARK_GRAY; Join este LockButton RED; Wait și UnJoin extind GlobalButton RED. Operatorul default are margin10/buttonGap10, width90% și x5% pentru butoane; stratul depinde de înălțimea informațiilor și de waitingStatus37. Aceste câmpuri nu stabilesc singure y absolut, fontul ori rasterizarea; nu am schimbat grafica din aceste informații parțiale. Urmează trasarea viewportului părinte și reutilizarea GlobalButton/ButtonColor/font/skin deja recuperate, cu teste de geometrie/hover/down și aceleași comenzi reale. Nu este revendicată paritate fizică.

## Normal Join follow-up

OpenTableCommand a fost exportat selectiv și legat prin hash în `openTableFollowup`. Metoda openTable coordonează subscription/prepareTable; căutarea literală JOIN_TABLE în această clasă este negativă. Aceasta nu identifică registry-ul notificationului și nu demonstrează comportamentul de seat. Nu am extins automat normal Join fără Auto Buy-In din această dovadă parțială. Urmează registrarea/callerul și tipul conexiunii, cu test explicit de confirmare fără debit înainte de OK.
