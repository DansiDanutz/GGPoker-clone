# Masa 3-Max — geometrie nativă și integrarea locală

Analiza folosește exporturi statice FFDec, fallback REA pentru SWF. Sursele și hashurile sunt păstrate în three-max-source-audit.json din raportul privat. Verificările de browser măsoară aplicația locală la două dimensiuni; nu reprezintă o comparație fizică AIR la același moment al jocului.

## Alegerea layoutului

TableSettingManager.create selectează ThreeRingSetting pentru maxPlayers=3, exceptând ramura explicită Avatar Race. Alegerea nu depinde de activarea Spin. SpinAndGoldStartupCommand instanțiază SpinAndGoldTableView3D, dar pozițiile sunt furnizate prin setările comune. Putem folosi geometria dovedită în turneele locale de trei persoane, fără să inventăm stackul ori rezerva de timp Spin.

Separarea dintre numele clasei și regulile jocului contează: pentru maxPlayers=4 și GameType.TOURNEY, fabrica alege AofSetting, dar păstrează gameType=TOURNEY. Aceasta nu transformă un turneu Hold’em în All-In or Fold. Geometria nativă pentru turneele cu patru locuri rămâne o integrare separată; această schimbare nu o declară terminată.

## Coordonatele recuperate

Unitățile sunt ale cadrului TableSetting1700×1200, înaintea scalării către fereastră.

| Poziție relativă | Pivot jucător | Scara jucătorului | Pariu | Dealer |
|---|---|---:|---|---|
| Propriu / jos | 850,952 | 1,1 | 856,768 | 742,838 |
| Stânga sus | 288,290 | 1 | 428,440 | 322,492 |
| Dreapta sus | 1412,290 | 1 | 1272,440 | 1378,492 |

Ambele poziții adverse folosesc presetTypeTwo; dreapta are Reverse.REVERSE. Toate cele trei pariuri și toate cele trei poziții dealer au scara explicită1,1. BetView3D aplică scara poziției de pariere, DealerButtonView3D pe cea a butonului, iar MotionView3D păstrează scara pariului când colectează jetoanele. UI-ul local păstrează aceste scări separat de scara avatarului.

Rotația relativă este seatIndex−userSeatIndex, cu revenire în interval. Pentru spectator, TableSetting.setUserSeatIndex convertește valoarea negativă în3; cu trei locuri rezultă aceeași ordine ca originea0. Cu un jucător așezat, fiecare client își vede propriul loc jos, fără să schimbe identitatea locurilor din backend. Reducerea la heads-up nu micșorează capacitatea declarată a mesei și nu schimbă grila în două locuri.

## Componentele vizuale locale

Masa de trei locuri folosește acum aceleași componente native deja reconstruite pentru celelalte layouturi suportate: avatar și ring192×192 cu pivotul local, placa numelui/stackului, Take Seat cu imaginile originale, fanul HoleCard3D pentru cărțile deschise/ascunse, chip piles, dealer, efect de tură și imaginea WIN. Datele private, stackurile, mutările și sumele sunt în continuare stabilite de server.

Portraitul are limite locale(−96,−81,192,192), înmulțite cu scara locului. Pentru propriul jucător3-Max rezultă211,2×211,2unități. Rendererul generic anterior avea în fixture un diametru de146,1875unități și nu monta nativeHoleCards; testul RED a detectat această diferență. Pariurile au acum jetoane36×35 scalate1,1, iar dealerul40×38 devine44×41,8. Nu este o estimare dintr-un screenshot redimensionat.

În sursă, ThreeRingSetting declară și potChipScale=1,1. Consumatorul recuperat PotView3D.refreshPosition folosește însă potPositions[i].scale, nu acea proprietate. Traseul complet al potChipScale nu este stabilit în corpusul păstrat; nu am înmulțit automat toate poturile centrale după numele câmpului. Poturile folosesc pozițiile/scările dovedite ale PotView, iar verificarea restului traseului rămâne deschisă.

## Chat și reacții

Pentru chat text, presetTypeTwo furnizează ancorele(78,−159), cu semn invers pe dreapta; ancora proprie este(46,−204). Pentru captionul emoticonului, ancorele sunt(58,−142), oglindite pe dreapta, respectiv(26,−187) pentru propriul loc. Captionul urmează scara locului, iar bula text păstrează scara sa nativă separată.

De exemplu un mesaj trimis de locul1, privit de locul0, apare la366,131. Același mesaj privit de expeditor apare la896,748, iar privit de locul2 are artă oglindită la1156,131. Captionul emoticonului apare la346,149 /878,6,747,4 /1176,149 în cele trei perspective. Propriul caption este195,8×110, cele adverse178×100. Trimiterea folosește transportul existent, cu identitate, rate limit, Helmet și moderare; nu schimbă mâna. Clickul de dismiss este local fiecărui destinatar.

## Verificări și limite

network-browser-test.mjs --tournament --event-seats=3 înregistrează trei conturi separate prin apăsări reale pe imaginile Take Seat, verifică debitarea locală, toate rotațiile la850și1196px, limitele avatarurilor/cărților, pariurile și dealerul. Trimite text și emoticon, verifică ancorele și mirroring-ul în toate cele trei ferestre, apoi verifică mâna neschimbată.

Fluxul continuă cu creșterea blindurilor, eliminări, heads-up și un winner. Payouturile fiecărei mâini sunt calculate independent, cele300de fise sunt conservate, premiul75 ajunge în portofel și istoricul efectiv este verificat pentru câștigător și un eliminat. După restart se reverifică premiile, portofelele și geometria. Testul native-hole-layout-test.mjs păstrează verificările formulelor pentru2/4/5/6cărți; testul de browser3-Max descris aici este Hold’em.

Rămân: comparația fizică original/clone la aceeași dimensiune, rasterul/font AA, fundalul și efectele specifice Spin, traseul potChipScale, temporizarea completă a payoutului între mâini și geometria celorlalte capacități. Reutilizarea motionului existent nu dovedește delay-ul apelantului nativ; ordinea payout→mâna următoare cere un test separat. Spin Play Now rămâne dezactivat până la stabilirea configurației și a fluxului său complet.
