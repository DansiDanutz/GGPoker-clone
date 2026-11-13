> Ediție publică a fișei funcționale. `native-source` este un prefix logic pentru exporturile AS3 păstrate local. Fișierele de dovezi JSON menționate sunt private; nu sunt incluse aici. Secțiunile istorice se citesc împreună cu actualizările finale.

# HUD, note private, etichete și raportări

## Intrare și identitate

Portretul adversarului primește rolulbutton,tabIndex0 și o etichetă accesibilă numai când există un subject pentru el și funcția este activă. Click,Enter sauSpace deschid Smart HUD. Jucătorul propriu are un buton separat nativeOwnHud cu statisticaVPIP; nu este tratat drept adversar căruia îi scrii o notă. Observatorul fără identitate de loc nu primește editorul privat.

Cheia de context include camera,tokenul,locul și lista subject-urilor. Cererile GET/POST merg către /api/rooms/ID/notes sau notesPath pentru Rush, cu tokenul locului și fără cache. Dacă identitatea ori masa se schimbă în timpul cererii, răspunsul este respins de interfață. La401 se închid ferestrele de raport,HUD,etichete,detalii și istoric. Datele nu sunt transferate automat către un înlocuitor cu același nume sau pe același loc.

## Aspectul și deplasarea HUD-ului

Smart HUD este un dialog nemodal creat dinamic, cu titlu,nume,avatar,scope,grafice,istoric și zona de note pentru adversar. Avatarul copiază imaginea și poziția portretului de la masă; dacă nu există imagine, folosește inițiala. Titlul poate fi tras cu pointerul. Deplasarea este limitată la dimensiunile viewportului; săgețile de pe titlul focalizat mută fereastra cu10 pixeli. Închiderea elimină nodurile și temporizatorul și închide detaliile/etichetele asociate.

Sursa locală folosește nativeHud,hudGraphs,hudHistory și hudNotes, plus sprite-uri catalogate separat. Aceasta explică structura vie a interfeței, nu dovedește fiecare pixel față de fereastraMac.

## Statistici reale și câmpuri neimplementate

VPIP este rotunjit la procent întreg din voluntary/hands și este disponibil numai când numărătorul și numitorul sunt întregi valizi,0≤voluntary≤hands și hands>0. Graficul folosește procent×3,6grade și praguri locale de culoare: verde≥36,galben≥21,portocaliu≥11,roșu sub11. Lipsa unei statistici este afișată cu «−», nu cu un număr inventat.

În modurile locale Hold’em, PLO și Rush, VPIP, PFR, ATS și 3-bet sunt calculate din mâinile înregistrate. PFR numără o singură dată mâna în care jucătorul a ridicat preflop. ATS numără ridicările din CO/BTN/SB când nu a existat nici call, nici raise voluntar anterior, raportate la oportunitățile legale înregistrate. 3-bet numără re-raise-urile după exact un raise anterior, raportate la oportunitățile în care motorul permitea efectiv ridicarea. Nu împărțim aceste două numere la toate mâinile jucate.

Eligibilitatea de raise este capturată înainte de acțiune în canRaise. Un all-in scurt care nu redeschide acțiunea nu produce o oportunitate falsă; Quick Fold înainte de rând nu este o oportunitate viitoare de steal. Pozițiile sunt cele ale locurilor efectiv împărțite: CO există numai de la patru jucători în sus, iar în heads-up BTN și SB coincid. Potul cu un limper nu este considerat nedeschis în această definiție locală.

Contoarele vechi fără istoric complet sau fără eligibilitatea capturată sunt excluse, nu transformate în zerouri. Tooltipul arată eșantionul: mâini pentru PFR și oportunități pentru ATS/3-bet. Zero oportunități afișează «−», nu 0%. Pragurile native de culoare sunt PFR 11/21/31%, ATS 11/26/41% și 3-bet 5/10/16%; VPIP păstrează 11/21/36%. Asocierea tipurilor cu aceste praguri este urmărită din HudDetailView în CircleGraphView.

Acestea sunt statistici locale cu definiția de mai sus, nu raportul global al operatorului. Clientul nativ primește AtsRatio/ThreeBetRatio de la server; filtrele și numitorii globali nu au fost recuperați. AoF păstrează metricile obișnuite ATS/3-bet indisponibile. În Short Deck numai ATS este dezactivat; 3-bet este disponibil din re-raise-uri legale,conform ramurii native verificate și PR #24. HUD-ul propriu afișează acum WT și WSD din eșantioane locale verificabile, alături de Hands. CB/FCB/CCB/RCB sunt disponibile din eșantioane locale complete începând cu PR #99; definițiile și limitele sunt în [continuation-bet-hud.md](continuation-bet-hud.md). TAF rămâne indisponibil.

Istoricul HUD arată numărul mâinilor și victoriilor,apoi Best hands și Worst hands: maximum3în fiecare coloană,sortate după valoarea absolută a netului și apoi numărul mâinii. Un loc fără exemplu este dezactivat și afișează No recorded hand. Exemplul disponibil deschide detaliul mâinii. Cărțile ascunse ale adversarului nu sunt reconstruite dintr-un calcul sau divulgate pentru a completa miniatura.

## Notele adversarului și salvarea automată

HUD-ul adversarului are textarea de maximum1000 caractere,contor,10butoane de culoare,Label și Retry save. Ordinea butoanelor de culoare este[8,0,2,5,4,9,1,7,3,6]; acestea sunt indicii paletei, nu o ordine semantică a forței jucătorilor. Click pe culoarea deja selectată revine la indicele10,fără etichetă colorată. Textul se salvează după1000ms,culoarea după300ms. Salvarea serializează cererile și urmărește modificările apărute în timpul unui răspuns.

Înainte și după salvare se verifică identitatea și subject-ul țintei. O eroare afișează mesajul și Retry save. Close/Escape încearcă salvarea și păstrează fereastra dacă aceasta eșuează,în loc să ascundă pierderea schiței. HUD-ul propriu nu oferă acest editor de adversar.

Există și editorul modal «Private note for …»,cu Save,Close și închiderea din titlu. Acesta salvează explicit. Inputul nou filtrează caracterele<,>,backslash,{,},inclusiv la paste,păstrând limita1000. Textul deja încărcat nu este șters retroactiv doar fiindcă ar conține asemenea caractere; backendul păstrează text literal și normalizează newline-urile. Filtrul de introducere nu este singura măsură de protecție: afișarea folosește textContent,iar serverul validează forma și limitele datelor.

## Etichete private

Label deschide o fereastră modală cu10titluri private,maxim20 caractere pe o singură linie. Schița este separată de valorile salvate. Save trimite numai titlurile modificate prin labelChanges și verifică în răspuns valorile efectiv salvate. Schimbarea identității oprește operația. Close fără Save nu aplică schița. Indicele10reprezintă lipsa etichetei colorate și nu este al11-lea titlu editabil.

Pe masă,un cadru poate semnala textul notei sau numai culoarea; nota goală cu indice10nu afișează cadru. Ramurile de poziționare țin cont de partea mesei și de4sau6 locuri. Această etichetă este privată identității locale,nu o insignă publică a adversarului.

## Raportarea unei mâini

ButonulReport apare numai pe o mână canReport. FormularulFair Play report explică explicit că trimite administratorului local și că fereastra este30de ore de la pornirea mâinii. Lista de ținte conține numai alți jucători participanți dealtSeats,ordonați alfabetic; nu pe tine sau pe un simplu observator. Când există o singură țintă,este selectată și blocată pentru a nu rămâne un formular fără țintă.

Categoriile locale sunt: nickname/avatar ofensator,chip dumping,bonus abuse,collusion,bum hunting,suspicious play,bots și real-time assistance. Categoria6,bum hunting,este exclusă pentru turnee și validată și pe server. Textele native din resursa împachetată pot înlocui titlurile și explicațiile numai după validarea formei și lungimii; lipsa resursei nu schimbă arbitrar categoria numerică.

Selectorul de categorie este un combobox cu listbox,opțiune activă și aria-selected. Săgețile/Home/End mută selecția;Enter/Space aleg;Escape închide mai întâi lista;Tab sau click în afară o închid. Checkboxurile țintelor,săgețilePrevious/Next și numele prescurtate sunt controale reale. Numele complet rămâne în title. Avatarul poate apărea prin fade200ms,dar acest efect este omis pentru reduced-motion.

Descrierea are maximum1000 caractere și contor. Report rămâne blocat fără categorie sau țintă. În timpul cererii sunt blocate țintele,categoria și descrierea. Succesul păstrează un receiptID și arată confirmarea trimiterii; închiderea după succes nu trimite din nou. La eroare se afișează alertă,iar Close din zona de rezultat permite revenirea la formularul păstrat. Schimbarea scope-ului închide raportul.

Serverul saveHandReport validează categoria,numărul mâinii,descrierea,unicitatea și eligibilitatea țintelor,canReport și excepția turneului. ID-ul este derivat din identitate,cameră,mână,categorie,ținte sortate și text normalizat,pentru salvare idempotentă. Nu este o sancțiune automată și nu trimite nimic operatorului GGPoker.

## Revizuirea de către administrator

Load reports cere /api/owner-reports cu cheia owner. Fiecare raport este un details cu dată,reporter,ținte,categorie,descriere,board și plăți. SelectorulOpen/Reviewed și nota de revizuire de maximum1000 caractere sunt independente de formularul jucătorului. Save review trimite id,status,note; butonul este blocat în timpul cererii,apoi prezintă succesul sau eroarea. MarcareaReviewed nu modifică automat pariurile,soldurile ori accesul la masă.

## Dovezi și limite

Testele actuale player-notes-test,player-notes-http-test și player-notes-room-test verifică izolarea conturilor/observatorilor,limitele,normalizarea,restartul,idempotenta,rollbackulIO și respingerea țintei înlocuite. Testele browser ale istoricului și raportării au rezultate consemnate în verificare-hud-note-raportari.json,cu comenzile efectiv executate. Statistica globală și popularea celorlalți indici avansați HUD și geometria completă a ferestrei native rămân deschise.

## Actualizarea PFR și instalarea locală

PFR este disponibil prin PR #21, testat pe commitul 64c0273f239d16243e1f00b71decb98823465c82 și merged în main. Cele 15 verificări includ ridicări repetate numărate o dată, excluderea postflop, date vechi necunoscute, restart, Rush Hold’em/PLO, HTTP privat și afișarea reală în browser. Testul cu 32 de mâini cunoscute fără raise afișează 0%, cu eșantionul de 32 în tooltip. Testul separat include raise și re-raise reale pentru contorul pozitiv.

Serviciul live a fost actualizat numai după verificarea absenței mâinilor active, cu backup privat. Toate cele șase fișiere de date salvate și starea publică a celor zece mese au rămas identice după restart. Nu s-a jucat o mână pe contul utilizatorului pentru acest control. Pentru o sesiune veche fără contor PFR, eșantionul începe cu mâinile complete înregistrate după actualizare; până atunci afișarea rămâne necunoscută. Verificările sunt în verificare-pfr.json și verificare-pfr-live.json.

## Actualizarea ATS și 3-bet

PR #22 este merged pe commitul testat e347357543844909517e37581ce0e00d9d871bc3. Cele 19 verificări acoperă poziții sparse/heads-up, limperi, re-raise legal, redeschidere după all-in scurt, Quick Fold timpuriu, istorice vechi, persistență, confidențialitate și afișarea unor valori pozitive reale în browser. Istoricul păstrează toate câmpurile anterioare, plus eligibilitatea, fără modificarea regulilor pariurilor sau plăților.

Actualizarea live PID 95050→62212 a păstrat identic cele șase fișiere de date și starea celor zece mese. Nu s-a efectuat o acțiune pe contul live. Eșantioanele ATS/3-bet pentru sesiunile vechi încep după apariția unor mâini cu eligibilitate complet înregistrată. Dovezi: verificare-hud-opportunities.json și verificare-hud-opportunities-live.json.

## WT, WSD și barele HUD-ului propriu

WT este raportul dintre showdown-urile contestate și mâinile cunoscute în care jucătorul a văzut flopul. Un fold preflop nu intră în numitor; un fold pe flop sau river intră ca flop văzut, fără showdown. Boardul cu cinci cărți nu este suficient singur: la un fold pe river poate rămâne un singur jucător, deci nu există showdown contestat.

WSD este raportul dintre mâinile cu o parte de pot atribuită la showdown și showdown-urile cunoscute. Returnările neplătite sunt excluse. În definiția locală, o parte de pot împărțit contează drept atribuire chiar dacă profitul net este zero; politica exactă a serverului original pentru egalități și filtrele globale nu este recuperată. Datele vechi fără cronologie suficientă rămân necunoscute.

Sursa HudAverageView folosește allTimeInfo.River.WtsdRatio și WmsdRatio, primite de la server. Interfața locală afișează eșantionul de masă sau pool Rush, nu statisticile globale originale. Hands păstrează numărul local înregistrat. Pentru AoF aceste procente avansate rămân indisponibile, conform ramurii speciale native.

Aspectul nou urmează sursa procedurală, nu un bitmap: fundalul 368×116, trei coloane de 112 cu spațiu 8, rânduri la y24/44/64/84, bare 74×14 la x32/y1, rază3, fundal#171717 și umplere întreagă floor(procent×74/100). Procentul se mută după capătul umplerii sau în interior când altfel ar depăși bara. Datele necunoscute folosesc semnul6×1 la x66/y7. Hands nu are bară. Titlurile au12bold, etichetele și valorile12regular; fonturile locale existente sunt reutilizate. Întreaga fereastră nativă și toate diferențele de font nu sunt declarate verificate pixel cu pixel.

Pragurile sunt WT21/26/31 și WSD26/51/76 pentru portocaliu/galben/verde. Zero procente cunoscute au text gri; datele necunoscute au semnul separat. Tooltipurile explică numele native și eșantioanele locale. CB/FCB/CCB/RCB au fost completate în PR #99; un numitor zero sau un istoric insuficient păstrează semnul de indisponibilitate. TAF rămâne indisponibil: textul nativ nu clarifică suficient tratamentul call-urilor pentru a declara formula serverului.

PR #23 este merged pe commitul testat09aff1ee15828926a99311c86f3d8337d17b51d6, cu22de verificări trecute. Browserul verifică WT50% dintr-un showdown în două flopuri văzute, umplere37 pixeli, poziția valorii, culoarea și semnul necunoscut. Cazurile controlate includ câștig/pierdere, fold preflop/flop/river,side pot,returnări și pot împărțit. Backupul/restaurarea,confidențialitatea,mâna cu cinci computere,plata și restartul trec. Actualizarea live PID62212→36094 păstrează identic șase fișiere de date și zece mese publice, fără o acțiune pe contul utilizatorului. Dovezi în verificare-showdown-stats.json și verificare-showdown-stats-live.json.
