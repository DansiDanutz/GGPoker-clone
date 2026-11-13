# Patru locuri și orientarea spectatorului

## Metodă și surse

Analiza folosește exporturile statice FFDec păstrate în corpusul REA, nu executarea aplicației AIR. FourRingSetting, AofSetting, TableSettingManager, TableSetting și TableMediator au hashuri în four-seat-spectator-source-audit.json din raportul privat. Coordonatele sunt unități ale cadrului1700×1200; măsurătorile locale sunt normalizate la același cadru, la850și1196px lățime de browser.

TableSettingManager alege FourRingSetting pentru masa obișnuită cu patru locuri și AofSetting pentru turneul cu patru locuri. Cele două clase au aceleași ancore jucător/pariu/dealer. Diferă pozițiile unor time-bank chips; nu pretindem că această integrare reconstruiește acele overlayuri. Numele AofSetting nu schimbă regulile turneului în All-In or Fold.

## Geometria comună

| Poziție relativă | Pivot jucător | Scară jucător | Pariu | Dealer | Preset |
|---|---|---:|---|---|---|
| Propriu/jos |850,952|1,1|856,768|742,838|user|
| Stânga |135,502|1|316,568|282,664|presetTypeTwo|
| Sus |850,154|1|856,350|776,338|presetTypeOne|
| Dreapta |1565,502|1|1384,568|1418,664|presetTypeTwo, reversed|

Pariurile și dealerul au scara1, separată de avatarul propriu1,1. Portraitul folosește pivotul(−96,−81) și192×192 înmulțit cu scara; dealerul este40×38, jetoanele36×35. Se reutilizează componentele native deja prezente: ring, etichetă nume/stack, Take Seat, fan HoleCard3D, poturi și payout, turn glow, WIN și captionuri. Identitatea locurilor și regulile backendului rămân aceleași. Mesele create de admin primesc layoutul după capacitatea lor, fără ID special de fixture.

## Orientarea și spectatorul

TableMediator.refreshPosition transmite seatIndex al utilizatorului sau−1. FourRingSetting și AofSetting transformă o valoare negativă în2; TableSetting de bază o transformă în3. getSeatIndex scade această origine și revine în interval. De aici rezultă originea2 pentru spectatorul cu patru locuri,3 pentru șase locuri și echivalent0 pentru trei locuri. Un participant își folosește propriul index și rămâne jos.

Clientul aplică acum aceeași funcție de rotație la jucători, pariuri, dealer, bule text și captionuri. La șase locuri, locul absolut0 este la poziția relativă3, adică sus(850,154), când utilizatorul privește fără loc. Anterior era jos(850,952). Schimbarea orientării nu conferă unui spectator cărți private sau acțiuni de joc.

## Chatul la patru locuri

Preseturile furnizează ancore text user(46,−204), TypeTwo(78,−159), TypeOne(90,−98), cu TypeTwo oglindit pe dreapta. Captionurile sunt(26,−187),(58,−142),(70,−81), iar pe dreapta(−58,−142). Bula text rămâne178×100; captionul propriu este scalat la195,8×110.

Pentru mesajul locului1, cele patru perspective au textul la(213,343),(896,748),(1309,343),(940,56); captionul la(193,361),(878,6,747,4),(1329,361),(920,74). Perspectiva locului2 îl vede oglindit. Clickul de dismiss este local, iar trimiterea nu modifică mâna. Pentru spectatorul de șase locuri, mesajul aceluiași loc1 are x1199 și baza bulei la y262, oglindită; pentru înălțimea minimă100, colțul superior este y162; toate aceste calcule folosesc aceeași origine ca avatarul.

## Defectele și verificarea

Testul RED al turneului cu patru locuri a găsit pivotul generic aproximativ(697,844,17), portrait146,19×146,19 și nativeCards=false. Testul RED al spectatorului de șase locuri a găsit locul0 jos, în contradicție cu originea3 din sursă. Acestea sunt diferențe măsurate înaintea corecției.

Fixture-ul de turneu cu patru browsere înregistrează prin pointer pe Take Seat, verifică fiecare perspectivă la două dimensiuni, chat/reacții, apoi joacă până la winner cu oracle independent pentru fiecare payout observat, conservarea fiselor, portofele și restart. Verifică și absența suprapunerii payoutului cu mâna următoare. Monitorul identifică mâna afișată și din rezultate, pentru cazul în care blindurile încheie imediat o mână și nu există controale active; nu confundă acea stare terminală cu o tranziție blocată.

Fixture-ul observer/Helmet verifică două sesiuni autentificate fără loc, rotația tuturor celor șase ancore, dealerul și pariurile unei mâini active, mirroring-ul chatului, cărțile private ascunse, apoi payoutul și restartul. Fluxurile cash obișnuite și AoF se verifică separat pentru regresii.

## Limite

Geometria derivată din sursă și funcționalitatea locală nu reprezintă o comparație fizică AIR pixel cu pixel. AA/fonturile, catalogul dinamic complet de avataruri, overlayurile de time-bank chip și temporizarea nativă completă rămân deschise. Formula fanului pentru2/4/5/6cărți are teste separate; browserul de turneu descris aici este Hold’em. Nu declarăm toate formatele și toate taburile1:1.
