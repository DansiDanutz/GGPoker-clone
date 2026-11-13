> Ediție publică a fișei funcționale. `native-source` este un prefix logic pentru exporturile AS3 păstrate local. Fișierele de dovezi JSON menționate sunt private; nu sunt incluse aici. Secțiunile istorice se citesc împreună cu actualizările finale.

# Pariuri, acțiuni anticipate, hotkeys și istoric

Fișa descrie implementarea locală actuală și separă regulile recuperate din sursa nativă de rezultatele testelor. Nu este o afirmație că fiecare stare a panoului a fost comparată pixel cu pixel cu aplicația Mac.

## Cine poate acționa

network.mjs construiește controalele după starea primită de la server. Observatorul vede starea mâinii, fără butoane de pariere. Jucătorul așteptând mâna următoare vede starea de așteptare și, când este permis, Cancel waiting seat. Când nu există încă o mână, gazda poate primi Start hand și Fill empty seats with computers; ceilalți pot ocupa sau elibera locul conform stării. După finalul turneului se afișează câștigătorul și premiile, nu o nouă comandă Ready.

Butoanele active de pariere se construiesc numai când există hand.options pentru jucător. Serverul rooms.mjs verifică separat versiunea mesei, existența unei mâini neîncheiate și faptul că actorul este la rând. O versiune veche sau alt actor primește409. Astfel lipsa unui buton nu este singura protecție. Autentificarea și apartenența la loc sunt verificate în traseul cererii; datele publice nu includ tokenul altui jucător.

## Panoul principal

| Control | Efect | Particularități |
|---|---|---|
| Fold | Trimite act/fold când există o sumă de plătit. | Șterge selecția anticipată locală. |
| Check/Fold | La preț0 execută Check prin rezervare și păstrează selecția Check/Fold pentru acțiunea următoare. | Nu este un Fold gratuit imediat. |
| Check | Trimite act/check când due=0. | Nu mută fise. |
| Call și suma | Trimite act/call când due>0. | Suma vine din opțiunile serverului; poate fi limitată de stack. |
| Bet sau Raise to și suma | Trimite act/raise cu totalul validat din editor. | Butonul nu apare când raise este indisponibil. Este totalul către care ridici, nu un increment adăugat arbitrar. |
| All in în AoF | Trimite act/allin prin panoul specific AoF. | Nu este un buton de raise normal și folosește opțiunile modului. |

Aspectul local folosește clasele nativeMainAction, actionLabel și actionAmount, cu sloturile0/1/2 și cantități în fise sauBB. Sursa nativă MainActionUI stabilește originea și pasul panoului, iar grafica butoanelor este catalogată separat. Coordonatele sursei nu sunt singure dovada unei suprapuneri perfecte cu un panou nativ ocupat.

## Editorul de sumă, slider și patru preseturi

Editorul este input numeric, sliderul este input range și presetările sunt button într-un grup accesibil «Bet amount shortcuts». min/max sunt cele din opțiunile legale. La schimbarea unității înBB, valoarea afișată este convertită, iar valoarea internă în fise este păstrată separat. readTotal respinge o sumă neîntreagă în fise, nefinita, nesigură numeric sau în afara intervalului. Mesajul de validare este «Enter a legal total in whole play-money chips».

Preseturile implicite sunt2BB/3BB/4BB/Pot pentru deschidere și33%/50%/75%/100% pentru parierea normală. Preferințele permit alte patru valori din listele acceptate. Formula include prețul de call și potul efectiv, apoi limitează totalul la min/max. Pot și Max au trasee distincte; opțiunile de rotunjire nu trebuie aplicate automat deschiderii. O presetare simplă modifică editorul și sliderul, fără pariu. Comanda hotkey «Select amount and bet» selectează și apasă Bet/Raise.

Sliderul răspunde la săgeți, Home/End și rotița mouse-ului. Pasul foloseșteBB sauSB conform preferinței; Short Deck folosește tratamentul său. Rotița poate fi inversată din preferință. Focalizarea editorului selectează textul. O schiță validă este păstrată numai când handKey corespunde numărului mâinii, numărului de acțiuni și actorului; nu se transferă arbitrar către o stare nouă.

## Enter și confirmarea pariului

Enter în editor verifică suma și ignoră key-repeat sau compozițiaIME. Dacă river-confirm-bet este0, trimite direct suma. Altfel creează dialogul «Bet … chips?» sau «Raise to … chips?», cu Cancel și Confirm. Focusul inițial este pe Cancel. Cancel/Escape nu pariază; Confirm închide dialogul și trimite acțiunea. Acesta este promptul local, nu o captură a promptului privat nativ.

## Acțiuni anticipate

Selecția anticipată păstrează numărul mâinii, locul și tipul acțiunii. Call este legat de suma exactă: schimbarea prețului îl anulează. Check se anulează dacă apare o sumă de plătit. Check/Fold devine Fold când există cost; în traseul Rush poate produce quick-fold. Execuția se face la rândul jucătorului, nu la momentul selectării, iar o schimbare de stare înaintea microtaskului împiedică aplicarea la altă stare.

Panoul este ascuns pentru observator, mâna încheiată, actorul curent sau în timpul Card Squeeze. Butonul selectat are aria-pressed. Pentru AoF opțiunile sunt Fold/All-In, cu reguli distincte după ce s-a acționat. Opțiunea specială a big blindului Rush poate ascunde rezervările. Aceste diferențe provin din ramuri explicite, nu dintr-o singură regulă universală.

## Toate cele21de acțiuni hotkey locale

| Grup | Acțiune | Implicit / efect |
|---|---|---|
| Table Actions | Fold | F1; folosește controlul eligibil Fold/Check-Fold, iar în Rush poate quick-fold. |
| Table Actions | Check / Call | F2; acțiunea legală curentă sau rezervarea eligibilă. |
| Table Actions | Bet / Raise | F3; confirmă totalul editorului când există butonul. |
| Table Actions | Select amount1–4 | Ctrl+1…4; selectează presetul fără pariu. |
| Table Actions | All-In | Neatribuit; maximul legal dacă există slider, All-In AoF sau Call când raise lipsește și există due. Nu consumă automat întregul stack pe un Call mai mic. |
| Table Actions | Select amount and bet1–4 | Neatribuite; preset plus apăsarea Bet/Raise. |
| Table Actions | New hand | Neatribuit; apasă Ready for next hand sau comanda Rush eligibilă. |
| Functions | Switch chip display | Neatribuit; apasă controlul de schimbare a unității. |
| Functions | Sit out next hand | Neatribuit; traseul local este Rush. Nu promitem funcția cash normală pe baza etichetei. |
| Functions | Time bank | Neatribuit; apasă rezerva eligibilă, fără carduri plătite. |
| Functions | Hand history | Neatribuit; deschide istoricul disponibil. |
| Functions | Add Chips | Neatribuit; deschide controlul eligibil de alimentare. |
| Options | Show left/right/all | Neatribuite; folosesc numai controalele Show eligibile cu indicii originali. |

Cele21rezultă din3acțiuni de bază+4preseturi+All-In+4preseturi-cu-pariu+New hand+5funcții+3Show. Panoul de configurare creează un rând pentru fiecare, cu etichetă, Assign și Clear. Rândul folosește coloane220/160/70px, gap12 și spațiu vertical6px; lista are înălțime maximă340px cu scroll. Aceasta este geometria implementării locale, nu măsurarea ferestrei native.

Assign capturează o combinație suportată. Conflictul deschide «Hotkey already assigned», cu Cancel și Reassign; Cancel păstrează atribuirea existentă, Reassign transferă combinația și golește acțiunea veche. Clear setează lista goală. Reset bindings reface valorile implicite în schița de setări. Grupurile Table Actions/Functions/Options pot fi dezactivate separat. Persistența se face prin mecanismul de aplicare al ferestrei de setări, nu prin presupunerea că fiecare click a fost deja salvat.

Dispecerul nu pariază în timp ce utilizatorul tastează în input,textarea,select sau contenteditable, în compozițieIME, într-un dialog modal, în HUD/istoric, în fereastra de chat sau în timpul squeeze. Ignoră repetarea tastei. Combinațiile legate sunt consumate pentru a nu activa suplimentar controlulHTML focalizat. Datele de setări invalide revin la valori implicite și combinațiile duplicate nu sunt acceptate în configurația normală.

## Istoricul dinamic al mâinilor

player-note-ui.mjs creează fereastra tableHandHistory, lista de mâini și detaliul selecției. Lista păstrează maximum50de mâini în această fereastră, ordonate descrescător, și menține selecția când sosesc actualizări. Schimbarea identității/scope închide fereastra. Închiderea elimină nodurile și referințele ferestrei; Escape este tratat explicit. Fereastra folosește dialog.show, nu showModal, și pune focus pe Close.

Fiecare rând arată cărțile proprii disponibile, câștigătorii și potul. Returnarea fiselor neplătite nu este câștig: câștigătorul se determină prin paid>returns, iar potul exclude returns. Înălțimea se ajustează la numărul câștigătorilor, iar textul potului este micșorat dacă depășește spațiul. Accesul la cărți depinde de datele vizibile furnizate de server, nu de extragerea mâinilor private ale adversarilor. Butoanele de raportare și HUD sunt documentate separat; nu sunt incluse automat într-o afirmație de istoric complet nativ.

## Verificare și limite

În această etapă au trecut hotkey-bindings-test.mjs, betting-preferences-test.mjs și reserved-action-test.mjs. Ele verifică parsarea,conflictele,grupele,formulele,limitele și tranzițiile rezervărilor. Sunt teste de logică, nu măsurarea întregului ecran. Testul browser exact dinPR19, păstrat în raport, verifică separat cazul All-In→Call60 cu120rămase înainte de câștig și distribuția independentă; nu a fost declarat o nouă execuție în această etapă.

Surse: network.mjs,betting-preferences.mjs,hotkey-bindings.mjs,hotkey-settings.mjs,rooms.mjs,player-note-ui.mjs. Geometria și sunetul originalului au dovezi separate și limite explicite în raportul principal. Bet and Muck nu este activat local.
