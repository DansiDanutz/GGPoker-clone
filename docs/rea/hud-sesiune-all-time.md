> Ediție publică a fișei funcționale. `native-source` este un prefix logic pentru exporturile AS3 păstrate local. Fișierele de dovezi JSON menționate sunt private; nu sunt incluse aici. Secțiunile istorice se citesc împreună cu actualizările finale.

# HUD nativ: sesiune, all-time, aspect și traseul datelor

## Proveniență și nivelul de certitudine

Analiza privește artefactul păstrat Game/51/IronDesktop.swf, SHA256 2bf08ebadf070b588feae5d0b8823629aed2e109a126e3bf4ae6ae363c1c32a1. Sursele decompilate sunt în native-source. Furnizorul REA a respins formatul SWF ca nesuportat; descoperirile de mai jos provin din exportul FFDec existent. Aceasta nu reprezintă o execuție nativă REA reușită sau recuperarea backendului operatorului. Sursa explică ramurile clientului; valorile efective primite de la server și comportamentul runtime actual necesită dovezi separate.

## Trei suprafețe care nu trebuie confundate

| Suprafață | Sursă de date identificată | Consecință funcțională |
|---|---|---|
| HUD mic din masa de joc | mytablehud/SmartHudView, getters dynamic HUD, totalHandCount | Poate prezenta date de sesiune; nu trebuie înlocuit automat cu agregatul global |
| Detaliul propriului profil | HudDetailView: allTimeInfo când ID-ul țintă este propriu sau gol | Graficele VPIP/PFR/ATS/3-bet folosesc răspunsul all-time |
| Detaliul adversarului | HudDetailView: getters ai profilului din DynamicHud | Nu dovedește un istoric global accesibil adversarului |
| Barele Flop/Turn/River | HudAverageView: allTimeInfo | WT/WSD/TAF provin din câmpuri server separate; Hands are ramură proprie/adversar |

Un procent cu aceeași etichetă nu dovedește același eșantion. Clona are contoare locale de cameră sau pool Rush, explicit delimitate; echivalența globală nativă rămâne deschisă.

## Cererea normală din masă: protocol 3146

GetDynamicHudNormal trimite OpponentUserId, Currency, GameKind și GameType. În Rush adaugă OpponentRushSessionId și sesiunea Rush curentă. La succes primește DynamicHud, NickName, AccountType, IsSubscribed, BestWins, WorstLosses, AllTimeWinHandCount, AllTimeTotalHandCount, Badges, Alias, OnePassAlias, SmartHudAllTime și câmpuri de streaming. Acestea sunt câmpuri de protocol observate, nu dovezi că toate sunt vizibile simultan sau implementate local.

Datele de identitate, sold, țară și note sunt sincronizate din profilul solicitat. Pentru isOnlyDynamicHud, răspunsul emite UPDATE_TABLE_DYNAMIC_HUD cu HUD și propriul jucător; altfel emite SHOW_DYNAMICHUD. ErrorTableNotFound ascunde alerta și marchează isFailHud; celelalte erori marchează de asemenea eșecul. Efectul final complet asupra popupului nu este dedus numai din această clasă.

## Cererea din afara mesei: protocol 1424

GetRequestSmartHudForNormal omite OpponentUserId pentru propriul cont, dar transmite UserId explicit. Folosește requestCurrencyId, GameKind și GameType. În Rush cele două câmpuri de sesiune folosesc opponentRushSessionId; în afara Rush, TableId este masa cunoscută sau GUID gol.

În direcțiile DIRECTION_HUD și DIRECTION_HANDHISTORY păstrează dynamicHud existent și încarcă separat allTimeInfo. În celelalte direcții preia DynamicHud din răspuns. Astfel, deschiderea din istoricul mâinii nu trebuie presupusă identică cu reîmprospătarea HUD-ului mesei.

## Filtre și familii de joc

SmartHudPlayerData mapează RUSH→RushNCash, TIMED_HOLDEM→TimedTable, HOLDEM/RUB_HOLDEM→Holdem, OMAHA→Omaha și SIX_PLUS_HOLDEM→ShortDeck. GameType și moneda sunt câmpuri distincte de GameKind. VIP junket poate selecta moneda VIP. TimedTable nu este simplul cronometru local GameClock. Absența unui câmp blind-size în cererea inspectată nu dovedește politica internă a serverului.

GetUserDynamicHudInfoCommand nu cere date fără propriul jucător. Configurează sesiunea Rush/masa, play-money și fila implicită, apoi alege furnizori diferiți pentru AoF, Battle Royale, Spin, turnee/WSOP sau normal. Există excepții de așteptare/masă virtuală și WSOP. Furnizorii speciali nu sunt declarați integral analizați prin verificarea doar a cererii normale.

## Short Deck și AoF: excepții reale

În SIX_PLUS_HOLDEM, HudDetailView și SmartHudView dezactivează ATS, dar păstrează 3-bet și pragurile sale de culoare. Versiunea locală anterioară excludea ambele. Corecția publicată în PR #24 păstrează ATS indisponibil și înregistrează 3-bet din re-raise legal. Toate cele13 verificări pe commitul2dc56168625103d792dbd84d7f67e9a2264aa20c trec, inclusiv32 mâini,3-bet100%,raportare și parcursul cu cinci computere. Merge `1b8d0340a176f2f565719efd470aa27837261e52` . Actualizarea live PID36094→13137 a păstrat identic cele6fișiere salvate și starea publică a meselor, fără acțiuni de joc pe contul utilizatorului. Dovezi: verificare-shortdeck-hud.json și verificare-shortdeck-hud-live.json.

AoF are alt set de grafice: AllIn/ATS/Fold/FTA. Procentele avansate obișnuite nu trebuie reutilizate arbitrar. Regulile exacte ale serverului pentru numitorii acestor grafice nu sunt recuperate aici.

## Filele native de sub masă

BestFiveCardView înregistrează HandRank la stânga, MobileHudSmartHud în centru și Stats la dreapta. Schimbarea filei elimină pagina veche, selectează fila nouă și montează pagina corespunzătoare. Clickul pe HUD emite suplimentar GET_USER_DYNAMIC_HUD_INFO. Fila deja selectată nu acceptă click repetat. MyProfileButton emite SHOW_SMART_HUD; aceasta confirmă semnalul, nu toate efectele handlerului din aval.

La actualizare, TableMediator trimite HUD-ul către BestFiveCardView.setDynamicHudInfo; acesta actualizează SmartHudView și StatusView. StatusView a fost urmărit separat: arată datele sesiunii, timpul și rezervele descrise mai jos; nu este un grafic de profit sau un portofel.

## Aspectul filelor și restricțiile VIP

TableHudTabButton desenează forme procedurale, nu pictograme din atlas. Fundalul selectat este #a48954, normal #333333, alpha 0,9. Eticheta are mărimea 28, y=1 și înălțimea 48; textul selectat este alb, normal #b3b3b3. Forma inițială are înălțimea 48 și rază 4. Constructorul pornește de la 278×48, dar layoutul redimensionează ulterior fundalul la dimensiune minus doi.

alignTab împarte lățimea 559 între filele vizibile, cu x=572+559/n×index și y=564. Acestea sunt coordonate interne ale componentei Flash; nu reprezintă automat pixeli CSS în fereastra Mac. Pentru VIP junket cu HUD dezactivat, fila HUD și profilul se ascund, iar x al butonului Close se schimbă din 287 în 157.

Clona actuală deschide HUD prin portret. Aceasta nu echivalează cu implementarea și potrivirea tuturor celor trei file native. Aspectul integral la aceeași dimensiune și ordinea animațiilor rămân neconfirmate.

## Contractul pentru agregarea locală all-time

O implementare corectă trebuie să separe identitatea proprie, familia jocului, tipul și moneda, să păstreze eșantioanele și să evite dublarea după restart. Contoarele vechi ale camerei pot preceda schimbarea modului; nu pot fi atribuite automat modului curent. Istoricul recent limitat nu poate reconstrui statistici pe viață sau BestWins/WorstLosses complete.

Este necesar un registru durabil cu proveniență per mână/mod, salvat atomic împreună cu checkpointul jocului. Nu adăugăm o sumă transversală care ar expune istoricul privat al adversarilor sau ar număra din nou mâinile după eșec IO. Înregistrările vechi insuficiente rămân necunoscute. Politica nativă pentru egalități, filtrarea serverului și calculele TAF rămân deschise.

## Cum se verifică fiecare afirmație

Pentru cereri: GetDynamicHudNormal.as și GetRequestSmartHudForNormal.as. Pentru filtre: SmartHudPlayerData.as. Pentru rutare: GetUserDynamicHudInfoCommand.as. Pentru interfață: HudDetailView.as, HudAverageView.as, stage/component/mytablehud/SmartHudView.as și BestFiveCardView.as. Clasele SmartHudView din popup și din mytablehud sunt distincte, chiar dacă au același nume scurt.

Inventarul corpusului păstrează căile și hashurile surselor; registrul controalelor separă rolurile explicate de simplele frame-uri extrase. Următorul prag de completare este legarea fiecărui control de handler, condiții, cerere, rezultat, erori, aspect și dovadă runtime. Numărul de fișiere sau grafice extrase nu reprezintă procent de funcționalitate reconstruită.

## Stats: fiecare rând și sursa lui

| Rând nativ | Valoare și comportament | Condiție / necunoscut |
|---|---|---|
| MobileRushSessionTime | sessionInfo.sessionTime, convertit din milisecunde | Sub o oră: minute și secunde; peste o oră: ore și minute, cu texte localizate |
| Hands | sessionInfo.totalHandCount | Număr de sesiune; nu este all-time |
| PotsWonAtShowdown | sessionInfo.potsWonAtShowdown | PlayerSessionInfo formatează câștiguri din showdown-uri și procent întreg |
| PotsWonWithoutShowdown | sessionInfo.winWithOutShowDownCount | Semnul minus când isNoneWithOutShowdown este adevărat |
| MobileTimeBank | ceil(timeBankRemaining/1000), formatat ca timp | Minus dacă rezerva este dezactivată |
| TimeBankCard | freeTimeChipRemainCount | Alternativă la timpul numeric; tipul mesei decide vizibilitatea |
| SitOutTime | ceil((kickOutTimeRemaining + extensia activă)/1000) | Minus pentru turnee, Rush și AoF Sit & Go |

StatusView trimite potsWonAtShowdown direct la StatusCell.setValue; urmărirea suplimentară a modelului de mai jos confirmă că este text cu numărător, numitor și procent, nu sumă monetară. Inițializarea și clear setează valorile la minus. sync actualizează din TablePlayer; refresh pornește apelul întârziat, apoi updateSessionTime se reprogramează la fiecare secundă. close și clear opresc timerul. Nu este un motiv pentru polling de rețea la fiecare secundă.

## Stats: geometrie, scroll și ramura AoF

Viewportul Slider este520×200, cu scrollbar de200, lățime16 la x495. Modelul inițial are sursă310; setUI folosește296 în modul normal sau200 în AoF. Oprirea propagării rotiței împiedică scrollul să ajungă la alt container. Rândurile normale sunt la y0/50/100/150/200/250; TimeBank și TimeBankCard împart y200, fiind afișată una dintre ele după timeBankInfo.isTimeBankChipType.

AoF/AoF Sit & Go păstrează patru rânduri: timpul sesiunii, Hands, PotsWonAtShowdown și SitOutTime la y150. Nu montează PotsWonWithoutShowdown sau rezervele în container. Existența valorii în model nu dovedește vizibilitatea rândului.

StatusCell are titlul26, culoare#999999, x14, înălțime48, aliniere stânga și autoscale; lățimea implicită260, iar eticheta lungă fără showdown folosește350. Valoarea este34bold alb, x268, lățime212, înălțime48, aliniere dreapta și autoscale. Separatorul opțional este496×2 la y45, #333333. SitOutTime este construit fără separator. Sunt coordonate interne native, nu măsurători ale ferestrei Mac la scara curentă.

## Anomalie observată în sursa SitOutTime

În setSitOutTime, ramura neeligibilă setează _timeBank la minus, în timp ce initSitOutTime setează _sitOutTime. Documentăm diferența exactă; nu o transformăm într-o regulă dorită și nu pretindem că am demonstrat un defect runtime. Pentru clonă trebuie păstrată corectitudinea valorilor și verificat comportamentul observabil, fără copiere oarbă a unei posibile greșeli.

## Acoperire rămasă pentru aceste file

Sunt explicate acum structura și datele StatusView. Modelul sessionInfo și unitățile potsWonAtShowdown sunt explicate mai jos. Rămân componentele HandRank și montarea/paritatea vizuală a întregului ansamblu în clonă. Aceste file nu sunt declarate implementate prin existența HUD-ului local deschis din portret.

## PlayerSessionInfo: contorii și formula confirmată

TablePlayer.sync alimentează sessionInfo din data.LinkedSessionInfo. PlayerSessionInfo.sync copiază SessionStartTime, TotalHandCount, WinShowDownCount, ShowDownCount și WinWithOutShowDownCount. Sunt valori din protocol; clientul inspectat nu reconstruiește aici numărătorii din cărți sau acțiuni.

potsWonAtShowdown pornește de la cheia MobileAofB, confirmată în dicționarul livrat ca „{0} din {1}” în română și „{0} of {1}” în engleză, apoi adaugă „({2}%)”. Înlocuiește cu winShowDownCount, showDownCount și showDownWinRate. Rata este winShowDownCount/showDownCount×100 returnată ca int: pentru valori finite pozitive conversia trunchiază partea fracționară, diferit de rotunjirea procentelor unor grafice locale. Exemplu derivat din formulă:2/3 produce66%, nu67%.

Getterul ratei nu are protecție explicită la numitor zero în această sursă. Nu declarăm rezultatul concret al conversiei runtime fără execuție Flash. O implementare locală trebuie să trateze lipsa eșantionului explicit, fără Infinity sau un câștig fals.

sessionTime este TimeManager.current.currentTime minus sessionStartTime, sau zero dacă timpul de început lipsește. Prin urmare timerul vizual nu dovedește o nouă cerere de rețea și nu trebuie resetat la fiecare deschidere a filei. Persistența/reconectarea trebuie să păstreze începutul sesiunii conform contractului local ales și etichetat.
