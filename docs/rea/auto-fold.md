# Auto Fold — Rush & Cash Hold’em

## Implementare locală

Rush & Cash Hold’em are editorul cu169categorii, selecție prin click/drag, procent, excluderi Button/SB/BB și Apply/Cancel. Auto Fold este oprit implicit și se activează explicit, separat pentru contul autentificat. Accesul direct pe masă folosește iconurile native428/429 și geometria rândului Etc (auto-fold-direct.md); Table settings păstrează accesul între mese. Omaha, Battle Royale și mesele obișnuite nu primesc editorul.

Controllerul este conectat la comanda Quick Fold existentă, cu identitatea și versiunea mâinii verificate. Testul cu șase sesiuni temporare execută un fold automat real și termină mâna cu ceilalți cinci, verificând independent payout-ul și1200chips după restart. Verificarea pe commit și activarea runtime-ului se consemnează separat în QA/registrul versiunilor; acest document descrie implementarea, nu declară întreaga clonă finalizată.

## Cele 169 de categorii

AutoFoldItemType definește13perechi,78categorii suited și78offsuit. Fiecare are indexul nativ, cheia mâinii, gageRate și selectRate. Datele complete și hashurile surselor sunt în auto-fold-source.json; auto-fold.mjs păstrează aceleași valori. Sunt categorii de mâini, nu169combinații fizice: există1326perechi distincte de cărți, cu6combinații pentru fiecare pereche,4pentru o categorie suited și12pentru offsuit.

Managerul verifică rangurile și suita celor două cărți. Clientul nativ primește cărțile proprii sortate; normalizarea locală acceptă aceeași mână și în ordine inversată. Cărți duplicate, absente sau invalide nu produc o selecție.

UserSetting pornește cu Auto Fold oprit, pozițiile Button și SB/BB incluse și59indici selectați. autoFoldRate implicit este50; suma selectRate pentru lista salvată este50,7. Indicatorul de rată și selecția explicită sunt câmpuri native separate; nu înlocuim lista pentru a fabrica exact50%. În selectorul pozițiilor, checkboxurile de excludere sunt inversate la salvare: UserSetting.isAutoFoldButtonPosition și isAutoFoldSBAndBBPosition primesc negația selecției vizuale.

## Eligibilitate și declanșare

AutoFoldManager cere activarea capabilității și preferinței, fără catch-up. Sesiunea trebuie să fie Rush Hold’em cash, nu turneu. Cash Drop direcționat în pot exclude Auto Fold. Jucătorul trebuie să existe, să nu fie folded, să fie preflop, fără nicio acțiune anterioară și cu două cărți cunoscute. Excluderile Button și SB/BB se aplică înaintea selecției mâinii. TableMenu3D exclude explicit Battle Royale. Omaha și mesele cash Hold’em obișnuite nu devin Rush prin această funcție.

OnAskAction verifică această eligibilitate atât la tura proprie, cât și când un alt jucător primește acțiunea și există rezervarea Quick Fold. Timerul este înlocuit per sesiune și are1secundă. La expirare, sursa verifică din nou preflop/fără acțiune/nefoldat și trimite rushFold cu tipul ales și ID-ul acțiunii. OnHoleCards folosește eligibilitatea și pentru a suprima Card Squeeze. Acesta este un contract de sursă, nu măsurare fizică a întârzierii serverului.

Integrarea locală trebuie să păstreze identitatea mâinii și contului, să anuleze timerul la acțiune manuală, schimbarea selecției, logout, eroare, transfer sau reconnect și să revalideze starea înainte de trimitere. Retry-ul automat nu trebuie să foldeze mâna nouă. Controllerul este conectat la stările și transportul aplicației, cu întrerupere la erori, acțiuni manuale și schimbări de preferințe.

## Aspect și salvare

AutoFoldView3D folosește meniul lateral cu size720 și înălțime1112. AutoFoldContents desenează un fundal750×1104, titlul la48/20, tabelul de mâini centrat la y82, selectorul de rată la360/717 și pozițiile la53/878. Apply are264×64 la76/1019; Cancel la380/1019. Diferența dintre dimensiunea meniului și fundalului este păstrată ca fapt, nu corectată prin presupunere.

Apply salvează activarea, cele două permisiuni de poziție, rata și indicii selectați, sincronizează managerul și emite AUTO_FOLD_STATE_CHANGE. Cancel reîncarcă datele salvate și închide meniul. Geometria și stările recuperate sunt descrise mai jos; clasele de bază stabilesc separat ancorarea și animația.

## Model și verificare locală

readAutoFoldPreferences recuperează datele corupte într-o stare dezactivată și returnează copii independente. eligibleAutoFold folosește proiecția locală Rush cu șase locuri și refuză implicit o capabilitate/catch-up/Cash Drop neconfirmată. Nu este un algoritm generic pentru toate dimensiunile de masă.

Testul auto-fold-test.mjs acoperă exhaustiv1326perechi/169categorii, ordinea inversă, selecțiile implicite, date corupte și poziții. Folosește motorul real pentru a verifica faptul că o acțiune proprie anterioară sau trecerea la flop oprește eligibilitatea. Aceste teste nu dovedesc un fold automat efectuat în browser.

Rămân: comparația fizică, măsurarea liniilor de text în AIR, localizarea editorului și integrarea cu eventuale Cash Drops locale. Card Squeeze rămâne indisponibil în Rush în implementarea existentă. Sunetul și temporizarea native nu sunt certificate de testele locale.

## Matricea și timerul — model verificat separat

Matricea nativă are13×13celule de44×44 pe pas48, deci întinderea efectivă este620×620. Rândul întâi este AA,AKs,…,A2s; sub diagonală sunt variantele offsuit. Centrul în panoul720 este x50, iar y82 vine din AutoFoldContents. Celulele folosesc verde#019813 pentru păstrarea mâinii și gri#404040 cu cruce#626262 de4unități pentru fold. Textul26 este alb sau#ccc. drawRoundRect primește diametrul elipsei4, nu o rază CSS4.

AutoFoldRangeTable nu permite ștergerea ultimei celule selectate. Înaintea unei adăugări, verifică floor(selectedItemRate)≥96 și o refuză dacă pragul este atins. Acesta nu este un clamp al sumei la95 și poate permite ultimei adăugări să treacă puțin de96. Suma este calculată în ordinea matricei folosind selectRate nativ. Sliderul de prag selectează toate clasele cu gageRate≤valoare, în domeniul1–95.

Un click schimbă celula și stabilește modul pentru drag. EnterFrame continuă să aplice aceeași stare celulei curente până la mouseUp/mouseOut/releaseOutside. Ramura mouseMove din handler nu este înregistrată în addEvent; nu presupunem că hoverul singur schimbă selecția. Modelul local editAutoFoldSelection permite această pictare idempotentă și păstrează limitele.

createAutoFold este controllerul folosit de editorul și transportul Rush. Prima citire, schimbarea contului și recuperarea după întrerupere consumă snapshotul curent; o nouă versiune de acțiune eligibilă programează1secundă. Pollurile identice nu resetează timerul. La expirare sunt verificate din nou identitatea, mâna/handVersion, preferințele, busy și eligibilitatea. Un număr de generație invalidează inclusiv callbackuri deja puse în coadă înainte de interrupt. Eșecul trimiterii oprește continuitatea și nu retrimite aceeași acțiune automat; apelantul transportului trebuie să prezinte eroarea.

Testele cu ceas controlat au demonstrat o eroare înainte de corecție: un callback păstrat după interrupt putea trimite. Testul eșuează fără generație și trece cu ea. Sunt verificate și lipsa replay-ului, modificarea preferințelor și cazul în care mâna/contul se schimbă înainte de expirare. Aceste teste izolate nu sunt singure dovadă de Auto Fold în aplicație; verificarea browser de mai jos acoperă integrarea.

## Editor conectat și verificare în browser

Celulele păstrează ordinea și culorile native, iar grafica originală include18cropuri pentru switch-uri, procent, Apply, fundalul explicațiilor și închidere. Fișa auto-fold-art.json conține dimensiunile, dreptunghiurile și hashurile celor două atlase. Extractorul Swift compară RGBA după decodare. Interiorul folosește dimensiunile recuperate; ancorarea și skinul explicațiilor urmează clasele native recuperate mai jos; metricile fizice ale textului rămân necalibrate.

Procentul este păstrat separat de selecție, inclusiv valoarea fracționară rezultată din celule; sliderul de prag folosește1–95. Preferințele locale vechi fără procent primesc50. Valorile corupte sunt recuperate dezactivate. Datele sunt separate pe cont; acestea nu importă preferințe din aplicația originală.

Apply persistă atomic preferința localStorage și anulează deciziile vechi. O eroare păstrează draftul, afișează mesajul și permite retry sau Cancel. Cancel/Escape nu modifică preferința salvată. Dialogul blochează hotkey-urile de joc pentru controalele sale. Info arată cele patru explicații native, fără deschiderea unei pagini externe.

Rush state expune numai identitatea contului deja autentificat. Comenzile UI păstrează contul capturat împreună cu versiunea; dacă autentificarea s-a schimbat, API-ul refuză cu401 înainte de mutarea poolului. Câmpul account rămâne opțional pentru clienții existenți, dar este trimis de interfața actuală. Identitatea de pe server închide editorul vechi și schimbă cheia preferinței; un draft al altui cont nu se salvează.

Testul browser verifică169celule, dimensiunile44/4/620, cele18imagini decodate, Info, rata min/max prin pointer, pictarea a trei celule, protecția ultimei selecții, izolarea F1, Cancel, eroare localStorage/retry și schimbarea contului. Reload-ul și recuperarea dupăHTTP503 consumă snapshotul fără fold; numai o acțiune nouă a adversarului pornește noua decizie. Exact un POST automat este trimis cu contul corect. Un POST pentru alt cont este refuzat fără schimbarea fișierului poolului.

După fold, utilizatorul temporar selectează Sit out pentru a opri rematch-ul automat al poolului; ceilalți cinci joacă până la showdown. Astfel se verifică payout-ul fără confundarea soldului liber cu chips deja așezate într-o mână nouă. Toate1200chips rămân în pool, foldatul nu primește potul, iar preferința dezactivată și plățile persistă după restart. Datele ownerului live nu sunt folosite de fixture.

## Ancorare, mișcare și închiderea explicațiilor

TableMenu3D setează AutoFoldView3D pe RIGHT_SIDE și y=viewPort.height−1112. TableSideMenu3D pornește x=1700 și ajunge la1700−720=980 în0,2secunde. Ease.easeOut este exact(t−1)³+1; curba CSS echivalentă are punctele(1/3,1),(2/3,1). Fundalul750 depășește cu30unități marginea scenei; containerul local720 taie acea margine, păstrând pozițiile interioare. La resize se păstrează alinierea dreapta/jos. Reduced motion sare peste deplasare.

Nu inventăm o glisare de închidere: hide din clasa de bază are aceeași coordonată inițială și țintă, iar AutoFoldView3D elimină conținutul imediat după super.hide. Timpii reali de compoziție AIR rămân neobservați.

Butonul Info nativ arată explicația la fiecare click, fără toggle; ReleaseOutSide o ascunde. În implementare, click în editor în afara explicației o închide fără a pierde draftul. Clickul pe explicație sau pe închidere o ascunde. Skinul NewGameInfoView este acum recuperat conform secțiunii următoare; localizarea și măsurarea fonturilor AIR rămân de potrivit.

Testul browser măsoară cinci poziții ale animației, inclusiv capetele și progresul cubic la25/50/75%, durata200ms, ancora720 și resize în850×650/1196×929. Verifică și preferința reduced motion și comportamentul repetării/închiderii Info. Este dovadă de contract static și execuție locală, nu comparație fizică frame cu frame cu AIR.

## Grafica explicațiilor și fonturile

NewGameInfoView folosește lobby_popup44: crop60×60 cu scale9Grid20/20/20/20. După scala2 din Information, panoul are656lățime totală, margini de nine-patch40, padding sus48/stânga56/dreapta56/jos66. Fundalul nativ este păstrat; nu mai este înlocuit printr-un dreptunghi alb cu bordură gri.

NewGameInfoTitle folosește20bold,#2c75b2,centrat; scala2 produce40px. Label folosește14normal,#040404,offsetx15 și lățime257 în coordonate native. Blocurile au12unități între ele, deci24locale. Punctul NewGameInfoDot are centru3/10 și rază2,5; local rezultă un cerc10×10 la1/15 față de rând. Titlul și conținutul sunt separate prin16unități, local32.

StageAssets.getLabel transmite ultimul argument în model.useRoboto. UniqueLabel→Setting.getDefaultFont→getRobotoFont și InitFont confirmă Roboto/Roboto Bold pentru textul latin al explicațiilor. Sunt refolosite fonturile native deja instalate, fără descărcări. Alte alfabete au ramuri separate, care nu sunt demonstrate prin testul în engleză.

CloseOptionButton folosește lobby_option0 up/down și1 hover, redimensionate16×16; la scala2 sunt32×32, la30de marginea dreaptă și sus. ColorTransform.color=#c3c3c3 înlocuiește RGB și păstrează alpha. CSS mask folosește alpha imaginilor originale și acea culoare constantă; nu înmulțește greșit RGB și nu desenează simbolul× dintr-un font.

Testul browser încarcă cele18imagini, fonturile regular/bold și verifică geometria, culorile, nine-patch-ul, punctele și măștile up/hover/down prin pointer real. Red-green a demonstrat diferențele față de vechiul panou alb. Fluxul păstrează apoi editorul, foldul automat, payout-ul independent și restartul. Dreptunghiul scale9 și alpha provin din resurse, dar line-height/gutter și înălțimea finală a TextFieldului AIR necesită comparație fizică; geometria declarată nu dovedește paritate completă de rasterizare.
