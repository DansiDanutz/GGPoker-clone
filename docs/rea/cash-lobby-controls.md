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

Stare: candidat, gate exact-head și pachet instalabil necesare înainte de activare. Geometria/artworkul complet al operatorului, localizarea, popupul nativ de ofertă, operator/private-server policies și comparația fizică rămân deschise.
