# Auto Fold — Rush & Cash Hold’em

## Stare actuală

Regulile statice și modelul de eligibilitate sunt recuperate și testate. Funcția nu este încă activată în aplicația locală: lipsesc selectorul conectat, timerul și verificarea reală în browser. Modulul nu este importat de runtime și nu execută pariuri sau fold-uri. Nu modifica preferințele live pe baza acestui document.

## Cele 169 de categorii

AutoFoldItemType definește13perechi,78categorii suited și78offsuit. Fiecare are indexul nativ, cheia mâinii, gageRate și selectRate. Datele complete și hashurile surselor sunt în auto-fold-source.json; auto-fold.mjs păstrează aceleași valori. Sunt categorii de mâini, nu169combinații fizice: există1326perechi distincte de cărți, cu6combinații pentru fiecare pereche,4pentru o categorie suited și12pentru offsuit.

Managerul verifică rangurile și suita celor două cărți. Clientul nativ primește cărțile proprii sortate; normalizarea locală acceptă aceeași mână și în ordine inversată. Cărți duplicate, absente sau invalide nu produc o selecție.

UserSetting pornește cu Auto Fold oprit, pozițiile Button și SB/BB incluse și59indici selectați. autoFoldRate implicit este50; suma selectRate pentru lista salvată este50,7. Indicatorul de rată și selecția explicită sunt câmpuri native separate; nu înlocuim lista pentru a fabrica exact50%. În selectorul pozițiilor, checkboxurile de excludere sunt inversate la salvare: UserSetting.isAutoFoldButtonPosition și isAutoFoldSBAndBBPosition primesc negația selecției vizuale.

## Eligibilitate și declanșare

AutoFoldManager cere activarea capabilității și preferinței, fără catch-up. Sesiunea trebuie să fie Rush Hold’em cash, nu turneu. Cash Drop direcționat în pot exclude Auto Fold. Jucătorul trebuie să existe, să nu fie folded, să fie preflop, fără nicio acțiune anterioară și cu două cărți cunoscute. Excluderile Button și SB/BB se aplică înaintea selecției mâinii. TableMenu3D exclude explicit Battle Royale. Omaha și mesele cash Hold’em obișnuite nu devin Rush prin această funcție.

OnAskAction verifică această eligibilitate atât la tura proprie, cât și când un alt jucător primește acțiunea și există rezervarea Quick Fold. Timerul este înlocuit per sesiune și are1secundă. La expirare, sursa verifică din nou preflop/fără acțiune/nefoldat și trimite rushFold cu tipul ales și ID-ul acțiunii. OnHoleCards folosește eligibilitatea și pentru a suprima Card Squeeze. Acesta este un contract de sursă, nu măsurare fizică a întârzierii serverului.

Integrarea locală trebuie să păstreze identitatea mâinii și contului, să anuleze timerul la acțiune manuală, schimbarea selecției, logout, eroare, transfer sau reconnect și să revalideze starea înainte de trimitere. Retry-ul automat nu trebuie să foldeze mâna nouă. Aceste părți nu sunt încă implementate.

## Aspect și salvare

AutoFoldView3D folosește meniul lateral cu size720 și înălțime1112. AutoFoldContents desenează un fundal750×1104, titlul la48/20, tabelul de mâini centrat la y82, selectorul de rată la360/717 și pozițiile la53/878. Apply are264×64 la76/1019; Cancel la380/1019. Diferența dintre dimensiunea meniului și fundalului este păstrată ca fapt, nu corectată prin presupunere.

Apply salvează activarea, cele două permisiuni de poziție, rata și indicii selectați, sincronizează managerul și emite AUTO_FOLD_STATE_CHANGE. Cancel reîncarcă datele salvate și închide meniul. Geometria celulelor, toate stările grafice și animațiile panoului necesită auditul claselor componente înainte de realizarea UI.

## Model și verificare locală

readAutoFoldPreferences recuperează datele corupte într-o stare dezactivată și returnează copii independente. eligibleAutoFold folosește proiecția locală Rush cu șase locuri și refuză implicit o capabilitate/catch-up/Cash Drop neconfirmată. Nu este un algoritm generic pentru toate dimensiunile de masă.

Testul auto-fold-test.mjs acoperă exhaustiv1326perechi/169categorii, ordinea inversă, selecțiile implicite, date corupte și poziții. Folosește motorul real pentru a verifica faptul că o acțiune proprie anterioară sau trecerea la flop oprește eligibilitatea. Aceste teste nu dovedesc un fold automat efectuat în browser.

Rămân: selectorul nativ complet, procentul/drag-ul matricii, capabilitatea locală explicită, integrarea timerului/versionării și Card Squeeze, testele multi-sesiune cu payout/reconnect/restart, comparația fizică și sunetul.
