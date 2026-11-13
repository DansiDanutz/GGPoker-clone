> Ediție publică a fișei funcționale. `native-source` este un prefix logic pentru exporturile AS3 păstrate local. Fișierele de dovezi JSON menționate sunt private; nu sunt incluse aici. Secțiunile istorice se citesc împreună cu actualizările finale.

# Bet and Muck — fișă nativă detaliată

## Aspect și poziție

Panoul este creat de `MainActionUI` la x=1206, y=709, în coordonatele scenei native; acestea nu sunt pixeli CSS ai ferestrei locale. Fundal negru, dreptunghi rotunjit 494×260, raze 10×10. Poziția containerului închis este x=440; deschiderea îl aduce la x=0. Mânerul folosește table/335 la (−13,−8), înălțime293, și table/332 la (23,104). Simbolul de avertizare este table/333 la (29,27).

Titlul localizat `BetMuck` este alb, bold36, la (64,17). Suma este bold36, culoarea numerică16762445, aliniată după lățimea reală a titlului +5. Descrierea `BetMuckDescription` are font26, culoare11776947, poziție(28,72), lățime278, multiline și word-wrap. Confirmarea este la(313,87), text `ButtonIAgree`, bold30; textul are înălțime45 și y8. Stările butonului vin din desktop_squeeze/6 și /7. Închiderea este la(448,15), imagine table/334.

## Interacțiuni și animație

Click pe mâner deschide panoul. Click pe închidere îl retrage. Tranziția durează0,2secunde în sursă, Ease.easeInOut: mâner alpha1→0, conținut alpha0→1 și container x440→0; închiderea inversează valorile. `show()` și `hide()` resetează poziția instantaneu prin close(true). Acesta este timpul declarat în cod, nu măsurarea animației aplicației pornite.

Confirmarea emite `SHOW_BET_AND_MUCK`. MainActionUI construiește BettingActionInfo: Raise dacă raiseButton.enabled, altfel Bet; folosește suma curentă și isBetAndMuck=true. Nu este o comandă Fold obișnuită și nu este echivalentă cu opțiunea de ascundere a cărților după showdown. Vizibilitatea este condiționată de betAndMuckEnabled; originea și toate condițiile acestei permisiuni rămân de urmărit.

## Frontend, protocol și cărți

DoAction transmite HasBetMuck pe cererea3127. Callbackul OnAction tratează separat Fold+HasBetMuck: marchează jucătorul folded, construiește lista tuturor indicilor cărților și apelează showCard cu ShowCardVO. Acest fapt nu stabilește singur cine vede cărțile sau ce politică aplică serverul; trebuie urmărit ShowCardVO și traseul receptorului înainte de implementarea unei reguli locale.

Suma afișată trece prin DisplayCurrency.exchangeCurrency; valorile negative afișează «−». Schimbarea limbii recalculează poziția sumei după titlu. Schimbarea monedei sau cursului reafișează suma.

## Stare și limite

Contract static recuperat din SWF cu FFDec, după respingerea formatului de către REA. Nu s-a executat o acțiune pe contul real. Funcția nu este activată în clona locală. Eligibilitatea, rezultatul serverului, politica publicării cărților, sunetul și suprapunerea pixel cu pixel rămân neverificate. Nu se deduce o regulă de joc doar din numele funcției.

Surse: BetAndMuckUI.as, MainActionUI.as, DoAction.as și OnAction.as din exporturile native locale. Hashul sursei noi și verificările literale sunt în verificare-bet-and-muck.json.

## Eligibilitate urmărită până la configurația mesei

TableMediator cere simultan: canBetAndMuck, faza River, exact doi jucători activi conform getPlayingPlayerLength(false), betOrRaiseEnabled, betMuckConditionRank ≤ rangul getBestFiveCard(), și modul streamer oprit. TableInfo primește CanBetMuck și BetMuckConditionRank din datele serverului; valorile implicite sunt false și9999. Pragul numeric nu trebuie transformat într-o categorie de mână prin presupunere: convenția rangurilor trebuie verificată separat. Nu este o funcție disponibilă automat la orice masă.

## Corecție importantă: showCard nu înseamnă obligatoriu dezvăluire

TableAnimator tratează explicit isBetAndMuck: folosește indexul original și cardInfo=null, în loc să citească valoarea cărții din originCards/cards. În execuție normală programează motionView.showCard după1secundă; la catch-up apelează imediat. MotionView3D trimite apoi ultimul argument !isBetAndMuck spre showCardEach. Pentru două cărți, deplasările declarate sunt (−94,−18,−15°) și (−5,19,14°), adăugate poziției showCard a locului. Acest traseu este diferit de arătarea voluntară a fețelor. Nu implementăm divulgarea cărților private pe baza numelui metodei. Semantica completă showCardEach și regulile de soluționare server rămân de verificat.

## Traseul final confirmat: cărți închise și istoric

Argumentul inversat din showCardEach este numit intern isOpen. În cazul Bet-and-Muck este false: moveOnFelt apelează explicit card.close(), nu card.open(). Prin urmare animația specifică păstrează cărțile cu spatele în sus. Ascunde cartea inițială prin hideCardByIndex și creează o carte animată separată, salvată în _playerShowCards. Mișcarea pe masă durează0,3secunde cu Ease.easeInBack, întârziere index×0,1secunde; rotația se face în două etape de0,15secunde, mai întâi unghiul−50°, apoi unghiul final cu Ease.easeOut. La finalul rotației se emite SOUND_SHOW_CARD inclusiv pe traseul cărții închise. Sunt valori de sursă, nu sincronizare măsurată cu serverul original.

Istoricul tratează întâi jucătorul propriu sau showdown: poate folosi cărțile deja disponibile în acel context. Pentru alt jucător marcat isBetAndMuckFold, previzualizarea produce un vector de CardInfo fără valori, în locul fețelor; numărul declarat aici este2 pentru Hold’em,4 pentru Omaha/OmahaT și5 pentru OmahaFive. Această ramură nu tratează explicit șase cărți, deci nu extindem concluzia la PLO6. Reetichetarea acțiunilor Bet/Raise drept BetMuck este condiționată de hasBetAndMuck și de propria identitate sau de marcajul fold, nu aplicată tuturor pariurilor.

Concluzie limitată la client: animația specială nu divulgă fețele cărților adversarului, iar previzualizarea istoricului păstrează spatele cărților pe această ramură. Politica de auto-fold și soluționarea pariului pe server nu au fost recuperate.

## Regula explicată de aplicație și ordinea rangurilor

Dicționarul local livrat conține `BetMuckDescription`, inclusiv text românesc: „Vei pierde potul în cazul în care adversarul tău îți va plăti pariul, iar mâna ta nu va fi niciodată dezvăluită.” Aceasta confirmă intenția funcției la nivelul produsului. Este dovadă de regulă afișată, nu acces la implementarea serverului. Ramurile pentru adversarul care ridică pariul, deconectare sau erori nu sunt stabilite numai prin acest text.

HandRankBase încarcă rangul numeric din coloana9 a tabelei livrate. Verificarea nouă compară toate cele7462 clase de cinci cărți, atât în hand_rank.txt cât și în hand_rank_normaldeck.txt, cu evaluatorul local independent. Rangul nativ1 este cel mai puternic,7462 cel mai slab; evaluatorul local are scor lexicografic în direcția opusă. Fiecare pereche adiacentă păstrează ordinea corectă. Condiția prag≤rang selectează astfel partea mai slabă a ordinii native, nu mâini mai puternice. Valoarea efectivă a pragului unei mese native nu este cunoscută.

Testul generează un reprezentant legal de suită pentru fiecare clasă, nu toate cele2598960 mâini posibile. Script repetabil: verifica-ranguri-native.mjs; rezultatele și hashurile tabelelor: verificare-ranguri-native.json. Nu există conversie implicită între rangul nativ numeric și scorul local.

## Refuz și refacerea controalelor

DoAction.onResponse verifică ErrorNotAllowed fără o condiție suplimentară pe HasBetMuck: pune tableInfo.canBetAndMuck=false și lastBettingInfo.betAndMuckEnabled=false, apoi reaplică aceeași BettingInfo în MainActionUI. Panoul special este ascuns prin actualizarea eligibilității. Nu există retrimitere automată a pariului în această ramură. ErrorBadRequest are o ramură goală în această clasă; aceasta nu dovedește că aplicația ignoră global eroarea, deoarece infrastructura TableRequest poate avea alte mecanisme. Nu există aici o promisiune de refacere a soldului sau de revenire a acțiunii — acestea ar necesita starea autoritativă a serverului.

Consecință pentru implementarea locală viitoare: o comandă respinsă nu trebuie transformată automat într-un pariu obișnuit și nu trebuie retrimisă fără verificarea rezultatului; am evita astfel o acțiune nedorită sau dublă. Aceasta este o cerință locală de corectitudine derivată din traseul observat, nu codul backendului nativ.
