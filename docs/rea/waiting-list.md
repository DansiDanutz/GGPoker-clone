# Lista de așteptare — texte și tipografie native

TableWaiting leagă WaitingPlayersInTable și MobileMyPosition de două rânduri independente. Butonul GlobalButton folosește ButtonType.JOIN_WAITING/CANCEL_WAITING, adică LobbyButtonWaitingTable/LobbyButtonUnWaitingTable. Poziția concatenează numărul cu First/Second/Third/Fourth; nu traduce sau parsează numărul. Hashurile celor opt surse sunt în waiting-list-source.json.

## Aspect recuperat

TableMenu3D poziționează grupul la1344/1085. GlobalButton este320×80 cu etichetă38px. LabelButton rezervă316px la x2 și activează autoScale. Contoarele sunt30px, au5px între titlu și valoare și se termină la30px în stânga butonului. Fără poziție, rândul este centrat vertical; cu poziție, primul rând începe la−2, iar al doilea urmează înălțimea primului. Grafica/stările/shadow deja implementate sunt păstrate.

InitFont înregistrează și selectează Roboto Condensed ca default, nu valoarea inițială Segoe UI din Setting. UniqueLabel și GlobalButton rezolvă fontul implicit prin această setare; excepțiile coreene sunt separate. Interfața locală folosește fontul original deja instalat NativeActionRoboto pentru buton și contoare. Eticheta lungă este micșorată în limita316px la traducere, resize și încărcarea fontului. Fittingul local este o implementare independentă a constrângerii autoScale; metricile fizice AIR nu sunt certificate.

## Limbă și stare reală

Textele folosesc cataloagele private native deja instalate. În română: Intră în lista de așteptare / Ieși din lista de așteptare, Jucător în așteptare:, Poziția mea: și sufixele1ul/2lea/3lea conform catalogului. Nu corectăm editorial șirurile native. Numărul și sufixul sunt noduri separate; EN revine la1st/2nd/3rd/th. Schimbarea dintre Join și Cancel actualizează și fallbackul explicit, astfel încât un catalog indisponibil nu păstrează eticheta acțiunii vechi.

Actualizările listei nu rescriu textele traduse sau numerele identice. Butonul, nodurile și focusul rămân aceleași. Spațiul textual dintre titlu și valoare păstrează lectura accesibilă, în timp ce distanța vizuală este dată de gap5. Actualizarea limbii nu trimite join/cancel/reserve/buy-in și nu schimbă mâna, poziția sau soldul. Transportul FIFO, rezervările și debitarea la confirmarea buy-in rămân implementarea locală existentă, nu backend nativ recuperat.

## Verificare și limite

Testul browser a eșuat înaintea legării cheilor deoarece Join rămânea în engleză. Verificarea folosește schimbarea reală de storage dintr-o altă fereastră a aceluiași cont, EN→RO→EN înainte și după înscriere, textul lung încadrat, contoare și ordinal, buton/focus păstrate și zero modificări text la polling. Snapshotul mâinii rămâne identic. Același fixture continuă cu două conturi în coadă, grafică/pointer, restart, ofertă de loc, buy-in și păstrarea soldurilor. Nu au fost introduse imagini/fonturi/dependențe sau reguli backend noi.

Rămân: metricile fizice AIR, toate fonturile asiatice și politicile operatorului pentru coadă/rezervări. Schimbarea de limbă verifică nodurile marcate, nu traducerea integrală a aplicației.
