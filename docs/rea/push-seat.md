# Push Seat — contract recuperat

Analiză statică a SWF-ului instalat, prin export FFDec selectiv în fluxul REA. Nu au fost trimise comenzi contului real. Hashurile surselor sunt în push-seat-source.json. Secțiunile de contract descriu observațiile statice; checkpointul de mai jos descrie implementarea locală publicată.

## Implementare locală publicată — PR213

[PR213](https://github.com/DansiDanutz/GGPoker-clone/pull/213), sursa `4973b65a7ab43afb0177cd859e4dff70e52c8f01`, este integrat și activ local. Ownerul setează fereastra Push Seat la1–1000mâini pentru o masă cash Hold’em/PLO4/5/6;0omite funcția. Grantul este o politică locală per ocupare a locului, nu un item nativ câștigat. Jucătorul deschide Push Seat, selectează alt loc, așteaptă plata mâinii și apoi confirmă Ready în noua poziție. Anularea este disponibilă înaintea aplicării; aceeași cerere poate fi repetată fără consum dublu. O utilizare în așteptare/aplicată pe masă/mână; conturile, sesiunea, finanțarea, ready și istoricul urmează persoana. Locurile din traseul programat nu primesc oferte noi de buy-in, iar ofertele deja existente blochează traseul.

28verificări pe commitul exact includ planificatorul, auth/Origin/JSON, concurența, rollback, funding/Remove Chips și Ready, plus fluxurile browser în sursă și în pachetul instalat restricționat. Trei sesiuni au trecut owner→Home→listă→buy-in→rezervare→payout→rotație→restart→Ready→a doua mână→cashout, cu30.000credite conservate. Jocul cu cinci computere a trecut două mâini/720chips și reconectare. Coordonatele selectorului, centrul titlului, panoul680×208 și cadrele săgeții1400ms sunt măsurate. Resursele au hashuri în push-seat-art.json.

Nu sunt confirmate pixelii/fonturile AIR, timingul fizic/sunetul, politica serverului privat sau poziționarea identică a intrării în meniul nativ; intrarea locală este în toolbar. Notele de candidat/nepublicat de mai jos păstrează ordinea descoperirilor și sunt istorice. La activare, toate cele șase fișiere owner au rămas identice; testele folosesc date temporare.

## Acces și selecție

TableMenu3D afișează iconul table_menu327 dacă isUserPlaying(), !playInfo.isCatchUp și userPlayer.pushSeatRemainHandCount > 0. TablePlayer și OnPushSeatItemEarned stochează valoarea primită de la server minus1. Nu rezultă din acest cod cum se câștigă dreptul sau când îl consumă serverul.

TableMediator transmite numărul rămas, jucătorii și rezervările către PushSeatsView. Panoul ascunde propriul loc și orice loc rezervat; celelalte locuri, inclusiv cele ocupate, au selector. Selecția transmite indexul vizual prin SELECT_PUSH_SEAT și închide panoul. Clickul pe fundal închide fără comandă. Indexul trimis este locul fizic: PlayInfo.addPlayer indexează vectorul prin seatIndex, iar getPlayers/getReservedPlayers întorc vectorii fără reordonare. TableSetting.getPlayerPosition rotește numai coordonatele prin (seatIndex−userSeatIndex+N)%N. Requestul păstrează indexul fizic, nu indexul poziției desenate; PushSeatButton.seatIndex separat nu este folosit de SelectPushSeatCommand.

## Geometrie și animație

Fundal negru alpha0,5 de la y30 până la marginea de jos. Titlul PushSeatSelecting:32px alb bold, centrat la viewport.width/2 și viewport.height/3,5, lățime jumătate de viewport. Fiecare buton este centrat pe getPlayerPosition(index). Bitmapul table348 formează butonul; săgeata table349 este centrată într-un container la92/82. Containerul oscilează y82→102→82, câte700ms Ease.easeInOut; hide/reset opresc tweenul.

Caseta informativă este ancorată la10px de dreapta/jos: table350 nine-patch680×208, rect10/10/10/10; table351144×208; table352 la33/56. PushSeatInfo:31px alb, x168/y17/lățime490, multiline. Throwablesexpire:26px, culoare11776947, x168/y147/lățime490, parametrizat cu numărul rămas. Textele localizate și pixelii acestor resurse trebuie recuperați separat.

## Cerere, eroare și confirmări

SelectPushSeatCommand apelează reservePushSeat(index). ReservePushSeat trimite cererea3180 cu SelectedSeatIndex; schema include TableId/UserId. La trimitere salvează playInfo.isPlaying și contorul, apoi setează temporar contorul la0 pentru a retrage controlul. La orice rezultat diferit de Success restaurează contorul. ErrorAlreadyReserved/ErrorInvalidSeatIndex afișează PUSH_SEAT_OTHER_PLAYER_RESERVED; ErrorPushSeatNotAllowedReservedSeat afișează PUSH_SEAT_RESERVE_TO_RESERVED_SEAT. Success afișează PUSH_SEAT_RESERVE_COMPLETE numai dacă jucătorul era în joc la trimitere.

Callback4132 OnPushSeatReserved înregistrează SeatIndex/ReservedPlayerId și actualizează selectorii. Callback4133 elimină rezervarea și actualizează selectorii. Callback4134 OnPushSeatChanged setează pushSeatChanging din Start; la final afișează PUSH_SEAT_COMPLETE cu PushSeatNickName. Callback4131 actualizează dreptul rămas. O confirmare de rezervare nu dovedește că mutarea s-a executat.

## Obligații pentru implementarea locală

Rămân necunoscute arbitrarea serverului, acordarea/expirarea dreptului, ordinea și redistribuirea ocupanților, momentul mutării față de mână și tratamentul blindurilor. Nu înlocuim această funcție prin schimbarea CSS a avatarului sau prin evacuarea altui jucător. Implementarea va necesita politică locală explicită, autentificare, rezervare atomică, confirmare separată, conservarea soldurilor/tokenurilor și istoriei mâinii, rollback/restart și două cereri concurente către același loc. Backendul operatorului nu este recuperat din aceste clase.

## Actualizarea ocupanților

OnTakeSeat folosește NotifyTableTakeSeatParameter și actualizează PlayInfo prin addPlayer la seatIndex. Când pushSeatChanging este activ, suprimă ramuri obișnuite de intrare: verificarea inițială a utilizatorului, unele efecte/mesaje, revenirea globală Sit In și avertizarea Mandatory VPIP. Actualizează selectorii Push Seat după intrare. OnLeaveSeat elimină jucătorul după ID și delegă prezentarea către TableMediator.leaveSeat; nu conține algoritmul de redistribuire. Aceste observații confirmă că schimbarea este orchestrată prin evenimente server, nu prin permutarea locală a imaginilor. Nu dovedesc ordinea tranzacției sau politica blindurilor.


## Etapă istorică: planificator local neconectat

`engine/push-seat.mjs` definește explicit politica independentă `local-idle-seat-rotation-v1`, fără a o atribui serverului nativ. Cererile valide au surse/jucători și destinații unice, exclud propriul loc și locurile blocate. Într-o mână activă întoarce numai starea pending, fără mutări. Între mâini, cererile formează lanțuri sau cicluri: fiecare solicitant ajunge la destinația fizică cerută; ultimul ocupant al unui lanț revine la primul loc eliberat. Pentru o singură cerere către un loc ocupat rezultă un schimb, fără evacuare. Lanțul către un loc gol lasă gol primul loc. Niciun jucător sau sold nu este inventat/eliminat.

Testul `push-seat-plan-test.mjs` verifică720permutări și960cazuri cu ocupare parțială, schimburi/lanțuri/cicluri, locuri blocate, conflicte, date invalide, snapshot JSON și inversarea mutării. Folosește și rezultatul unei mâini reale de motor cu all-in-uri inegale, un jucător foldat, side-poturi și jetoane neacoperite:420jetoane, soldurile fiecărui jucător și istoricul rămân identice. Funcția nu modifică snapshotul primit.

Acesta este numai calculul planului. Nu există încă integrare în camere, grant/expirare locală a dreptului, rezervări autentificate persistente, aplicare atomică cu portofel/tokenuri/ready/ceasuri, politică explicită de blind/dealer, API, confirmări, overlay sau test în browser. Planificatorul nu face parte din graful runtime activ și nu constituie o funcție Push Seat jucabilă. Acceptarea unei rezervări nu trebuie raportată drept mutare executată.


## Etapă istorică: rezervări persistente fără aplicare

`room-push-seat.mjs` și integrarea internă din `rooms.mjs` adaugă rezervare/anulare autentificate și persistente. Configurarea internă `pushSeatHands`1–1000 este opt-in pentru cash Hold’em/Omaha șase locuri. Politica locală acordă o fereastră de mâini fiecărei așezări umane finanțate; contorul scade când începe o mână nouă. O rezervare ascunde temporar disponibilitatea; anularea o restabilește numai în fereastra inițială. Aceasta este o regulă locală explicită, nu mecanismul nativ necunoscut de câștigare a itemului.

Cererile folosesc contul profilului, tokenul locului, versiunea, numărul mâinii și secvența. Destinația poate fi ocupată, dar nu proprie sau deja rezervată. Repetarea cererii originale nu rezervă/consumă din nou; o secvență anterioară nu creează o nouă rezervare după anulare. Țintele goale rezervate nu pot fi ocupate prin join sau lista de așteptare. Datele grantului și receiptul rămân private; numai indicii locurilor rezervate sunt publici. Validarea checkpointului verifică forma, fereastra, legătura receipt/rezervare și conflictele dintre surse/destinații. Eșecurile scrierii la rezervare și anulare restaurează snapshotul precedent.

`push-seat-room-test.mjs` trece grantul/fereastra/expirarea, autentificarea, conflictele, payloadul strict, retry/anulare, restart, checkpointuri corupte, blocarea unui join pe ținta goală și păstrarea mâinii/locurilor/tokenurilor/portofelelor. Lotul de11suite țintite a trecut, incluzând testul camerei, plannerul și regresii cash/Remove Chips/Spin/MTT; nu reprezintă un test HTTP sau randat Push Seat.

Aplicarea mutării nu este încă legată. Între timp, candidatul blochează distribuirea unei mâini noi dacă există rezervări Push Seat în așteptare. Nu trebuie publicat sau activat înaintea aplicării atomice, confirmărilor și testelor complete. Endpointurile HTTP, formularul owner și overlay-ul nu sunt încă expuse; runtime-ul live PR212 rămâne neschimbat.


## Etapă istorică: aplicare atomică în camere

Timerul local aplică rezervările numai fără mână activă și, după o mână încheiată, după cel puțin trei secunde pentru prezentarea plății. Aplică simultan planul de schimburi/lanțuri/cicluri, păstrând obiectele jucătorilor: cont, digest/token, host, statistici, bancă de timp, grant, fonduri adăugate sau rezervate și sold efectiv. Nu creditează/debitează portofelul pentru mutare. Mâna veche este eliminată din starea curentă înainte de schimbarea perspectivelor private; rezultatul și istoricul HUD rămân identice. Soldurile trec în waitingStacks la locurile noi.

Rezervarea solicitantului primește statusul applied numai după mutare. Fiecare jucător efectiv mutat, inclusiv cel deplasat de altă cerere, primește un receipt privat cu mâna, momentul și locurile fizice vechi/noi. Validarea verifică poziția salvată, marcajul tranzacției și legătura dintre applied și receipt. Retry-ul rezervării originale întoarce starea aplicată fără altă mutare; anularea după applied este respinsă. O scriere eșuată restaurează toate locurile, rezervările și soldurile precedente.

Politica de blind/dealer este locală explicită: referința vechiului button/big blind rămâne la coordonatele fizice, iar algoritmul existent nextDealer avansează de acolo. Nu se presupune compensare a blindurilor după reguli private native. Starea Ready urmează jucătorul; hostul nu poate ocoli bariera prin Start/Fill. Dacă toți erau deja pregătiți, mutarea și distribuirea următoare sunt o singură tranzacție. Dacă nu, Ready rămâne obligatoriu. După plecarea tuturor ocupanților marcajul de așteptare se elimină, astfel încât noii jucători pot porni normal.

Integrarea cu Remove Chips păstrează retragerile manuale și permite reducerea automată la următoarea distribuire, inclusiv după ce mâna curentă a fost eliminată pentru mutare. Sumele pending Add Chips și fondurile topUpTo/walletTopUp se păstrează și sunt folosite o singură dată.

`push-seat-apply-test.mjs` verifică schimb, lanț, ciclu și țintă goală; bariera mâinii/3secunde; rollback; tokenuri/statistici/bănci/fonduri; istoricul nemodificat; receipturi și checkpointuri corupte; retry după aplicare; Ready; părăsirea mesei și noi ocupanți. Conservă30.000de jetoane plus portofele în scenariile cu retragere manuală/automată, Add Chips și top-up rezervat. Scenariul cu șase jucători pregătiți păstrează60.000de credite și pornește mâna următoare la locurile corecte după restart. Lotul de13suite model a trecut; sintaxa și diff-ul trec. Acesta nu este încă un test HTTP sau randat Push Seat.

Endpointurile HTTP, configurarea owner și overlay-ul nativ rămân de implementat înainte de publicare. Runtime-ul live PR212 este neschimbat; funcția nu este încă disponibilă jucătorului.


## Starea candidatului: API și configurare owner

API-ul expune `push-seat` și `push-seat-cancel` numai prin POST JSON, cu origine locală exactă, cont și token de loc. Limita payloadului este2KB; formele/cheile sunt validate de tranzacția camerei. Configurarea owner validează `pushSeatHands`1–1000 pentru cash Hold’em/PLO/PLO-5/PLO-6 și refuză schimbarea cât timp masa este ocupată. Catalogul păstrează setarea la restart.

Consola owner are fereastra locală în mâini, implicit0/dezactivată; zero este omis din cerere. Edit/duplicate refolosesc configurația; formatele neacceptate șterg/dezactivează câmpul. Testul handlerului real al formularului verifică valorile implicite, opt-in10 și eligibilitatea. Interacțiunea randată a formularului pentru această funcție rămâne de verificat.

`push-seat-http-test.mjs` trece sesiuni autentificate pentru patru jucători: limite owner și blocare la ocupare, metode/origini/JSON/size/account, rollback la rezervare și anulare, două duplicate acceptate fără repetare, două cereri concurente cu o singură reușită și refuzul țintei chiar după refreshul versiunii. Jucătorul respins își păstrează grantul. Restartul păstrează o mână activă și rezervarea; după încheiere timerul aplică schimbul, confirmă locurile și păstrează tokenurile. Receipturile grant/mutare sunt private. Ready pornește mâna următoare la noile locuri; restartul acesteia și ieșirile conservă480jetoane și40.000credite, inclusiv verificarea fiecărui portofel față de soldul personal final. Regresia HTTP Remove Chips a trecut.

Testele nu trimit comenzi aplicației native sau contului real. Overlay-ul de selecție, integrarea Ready după mutare și animația/mesajele în frontend rămân deschise. Nu este încă o funcție Push Seat complet jucabilă în interfață; runtime-ul live PR212 este neschimbat.


## Grafica, textele native și corectarea direcției

Resursele au fost urmărite prin StageAssets.getBitmapDataAt și TableEtcMenu3D: iconul din meniu este table_menu0327(70×70), iar overlay-ul folosește namespace-ul distinct table0348(184×184), table0349(90×90), table0350/0351(30×30 nine-patch) și table0352(78×100). Nu trebuie confundate cu table_menu0348–0352. `tools/extract-push-seat.swift` extrage cele șase cadre și verifică egalitatea pixelilor RGBA după salvare/decodare PNG. Sunt37.399bytes de PNG-uri private în home-art, ignorate de Git conform politicii existente; scriptul și receiptul `push-seat-art.json` păstrează reproductibilitatea și hashurile.

O citire streaming țintită a tabelului de traduceri17MB a recuperat exact trei etichete EN, fără a pretinde analizarea semantică a întregului fișier. PushSeatInfo precizează explicit deplasarea jucătorilor afectați cu un loc în sens antiorar. Această dovadă a arătat că vechiul plan local de simplu schimb era insuficient pentru ținte neadiacente; nu fusese publicat. Planificatorul a fost corectat înainte de integrarea UI.

Pentru o singură cerere, interpretarea locală bazată pe text și coordonatele fizice rotește intervalul circular până la țintă, păstrând persoana solicitantă la destinație și deplasând celelalte poziții în sens antiorar. Locurile goale participă la aceeași rotație. Într-o etapă nepublicată s-a încercat un plan generalizat pentru cereri simultane. Acesta a fost eliminat după recuperarea mesajului suplimentar PushSeatAlreadyReserved și a rutei sale din NoticeType/ReservePushSeat; starea curentă este descrisă mai jos. Nu se declară recuperarea arbitrajului privat.

Testele curente trec720configurații inițiale,30direcții complete și960cazuri parțial ocupate; noua aserțiune a reprodus vechea eroare0→2 înainte de corecție. Aplicarea tranzacțională și scenariul HTTP complet cu restart/payout au trecut după schimbare. Selectorul grafic și integrarea interfeței rămân de conectat.

Sursa Ease.easeInOut combină easeIn(t)=t³ și easeOut(t)=(t−1)³+1 pe jumătăți; mișcarea săgeții este700ms în jos și700ms în sus, între y82 și102, la x92. O animație generică CSS ease-in-out nu trebuie prezentată drept această funcție exactă. Metricile fonturilor/compozitorului nativ și timingul fizic nu sunt certificate de aceste valori statice.


## Restricția pe mână și mesajele de confirmare

O a doua citire streaming țintită a recuperat toate cele șase etichete PushSeat și Throwablesexpire, acum șapte texte EN exacte în receiptul grafic. NoticeType leagă PUSH_SEAT_OTHER_PLAYER_RESERVED de PushSeatAlreadyReserved; ReservePushSeat folosește acest notice pentru ErrorAlreadyReserved/ErrorInvalidSeatIndex. Mesajul spune că alt jucător a folosit deja Push Seat și că se poate încerca în mâna următoare. Acestea susțin inferența unei restricții pe mână; nu constituie observarea directă a serverului privat.

Politica locală a fost aliniată conservator la această indicație: o singură rezervare în așteptare sau o mutare aplicată pe masă/mână. Retry-ul aceleiași cereri rămâne idempotent; celelalte cereri sunt respinse fără consumarea grantului, chiar către alt loc. O anulare înaintea aplicării eliberează rezervarea; după applied nu este posibilă o nouă utilizare până când începe mâna următoare. Admiterea globală, checkpointul și planificatorul validează limita, astfel încât vechea schemă multi-rezervare nu poate fi încărcată ca stare validă.

Planificatorul generalizat nepublicat a fost simplificat la rotația intervalului circular pentru o singură cerere. Testele curente verifică720configurații inițiale de identități,30direcții complete,960cazuri parțial ocupate, refuzul mai multor cereri, solduri și istoricul unei mâini reale cu side-poturi. Vechile315perechi/multiple destinații aparțin explorării istorice eliminate, nu contractului activ.

Receiptul privat al fiecărui jucător mutat include acum inițiatorul (`by`), iar notificarea publică de aplicare păstrează mâna/momentul/numele inițiatorului. Aceasta permite folosirea textului nativ PushSeatReserved cu numele corect, inclusiv pentru jucătorii deplasați. Checkpointul verifică legătura poziției și notificării; publicarea numelui nu expune tokenuri sau granturi private. Backendul, owner form, aplicarea și testul HTTP au trecut după schimbare. Selectorul și Ready în frontend sunt încă neconectate; nu există activare live pentru Push Seat.

## Integrare UI în lucru
Selectorul folosește cele șase PNG-uri recuperate, textele EN și segmentele cubice native ale săgeții. Țintele omit propriul loc și locurile rezervate, dar permit locuri ocupate. Cancel și selecția transmit comenzile tranzacționale existente. Ramura după mutare afișează Ready și finanțarea necesară, iar aplicarea stării așteaptă animațiile payout și când indexul propriu se schimbă. Testul pur de eligibilitate/cadre a trecut după RED pentru modulul absent; verificarea browser/render/focus/flux complet rămâne obligatorie. Nicio activare live.

Testul headless `node network-browser-test.mjs --push-seat` a trecut: owner opt-in, trei conturi independente, Home/listă/buy-in, decodarea PNG-urilor, cinci ținte și segmentele săgeții, Escape fără rezervare, ținta rezervată ascunsă, cerere în timpul mâinii, payout, rotație Alice0→2/Bob1→0/Cara2→1, cărți vechi eliminate, mesaj cu inițiator, restart fără repetarea confirmării, Ready în UI, a doua mână cu propriile cărți private și cashout cu total30000. Testul a găsit și corectat încărcarea modulului în allowlist, `remainingHands` și parametrii traducerii; aserțiunile așteaptă randarea după polling/payout. Testul separat un jucător+cinci computere a trecut două mâini/720chips/reconectare. Aceste rezultate nu certifică potrivirea pixelilor native, fonturilor sau timingului fizic. Candidatul nu este încă publicat/activat.

## Revizie coordonate și rezervări concurente
Sursa PushSeatsView desenează numai dim-ul de la y30; containerul și țintele rămân la originea viewportului. CSS a fost corectat să nu deplaseze țintele cu30px, iar titlul este centrat vertical în jurul height/3.5. Ambele fundaluri informative folosesc scale9 cu margini10, nu întinderea uniformă a panoului lateral. Clickul pe dim închide selectorul conform onDimClick.

Protecție locală explicită: rotația nu traversează un loc pentru care există deja o ofertă de buy-in, iar pe intervalul unei cereri în așteptare nu se acordă oferte noi. Altfel un jucător ar putea confirma un loc pe care rotația tocmai l-ar ocupa. RED în planificator și join pe un loc intermediar, apoi GREEN; nu se pretinde recuperarea acestei politici din serverul privat. Intervalul verifică limitele înainte de iterare pentru a nu bloca încărcarea unui checkpoint corupt.

## Candidat ulterior PR213 — rândul nativ al iconului

Revizia TableMenu3D/TableEtcMenu3D/SideGameGroupView3D a confirmat y=viewport.height−90, baza x9+20 când grupul side-game este ascuns, slot62×62 și spațiu8. Bitmapul70×70 este redus la62×62. În cash-ul local fără celelalte sloturi, Push Seat este la x29 sau99 dacă Chip Shuffle este vizibil. Rândul nativ conține și Straddle/Auto Fold/final bet/deal în condițiile lor; nu se pretinde implementarea acestor sloturi prin poziționarea actuală. Sursele/hashurile și ramurile neimplementate sunt în table-etc-menu-source.json.

Candidatul mută controlul din header în rândul mesei, urmărește resize/scroll și vizibilitatea Chip Shuffle, ascunde iconul când rezervarea consumă dreptul și păstrează Cancel Push Seat separat în footer ca facilitate locală. RED pentru headerul greșit și repoziționarea lipsă după schimbarea preferinței, apoi GREEN: măsurători62×62/x29↔99/y90, ascundere după rezervare, Cancel/re-reserve și întregul flux de două mâini/restart/30.000credite. Aceste schimbări ulterioare nu sunt încă activate live; PR213 rămâne versiunea instalată.

## Corecție candidat — alegerea automată a locului

Selecția implicită din rooms.mjs consulta numai rezervările obișnuite și se putea opri la primul loc din intervalul Push Seat, deși existau alte locuri libere. Folosește acum aceeași listă reservedSeats ca ofertele și vederea publică. Testul push-seat-join-test.mjs reproduce refuzul incorect, apoi verifică alegerea locurilor4și5 în timp ce2și3 sunt protejate, refuzul explicit fără debit, restart, capacitate epuizată, eliberarea la anulare și cashout o singură dată pentru noii jucători încă nedealți. Conservarea include atât soldurile disponibile la masă, cât și blindurile deja comise. Este o regulă a serverului local; nu se atribuie algoritmului privat nativ.
