> Ediție publică a fișei funcționale. `native-source` este un prefix logic pentru exporturile AS3 păstrate local. Fișierele de dovezi JSON menționate sunt private; nu sunt incluse aici. Secțiunile istorice se citesc împreună cu actualizările finale.

# HandRank și panoul Best Five: contract nativ detaliat

## Proveniență și semnificația acestei fișe

Sursele provin din artefactul Game/51/IronDesktop.swf păstrat, SHA2562bf08ebadf070b588feae5d0b8823629aed2e109a126e3bf4ae6ae363c1c32a1. Exportul FFDec este fallbackul după respingerea SWF de către furnizorul REA, nu o execuție REA nativă reușită. Fișa descrie codul clientului exportat. Nu declară verificată temporizarea fizică a aplicației Mac sau implementarea integrală a panoului în clonă.

Surse: BestFiveCardView, HandRankView, SingleBoardHandRank, DoubleBoardHandRank, PlayInfo, BestFiveCards și TableMediator. Două clase numite SmartHudView apar în contexte diferite și nu trebuie confundate cu HandRank.

## Ce vede jucătorul și textele livrate

| Cheie | Engleză | Română livrată |
|---|---|---|
| HandRank | Hand Rank | Clasament mâini |
| MobileCurrentBestHand | Current Best Hand | Cea mai bună mână curentă |
| MobileMyProfileBTN | My Profile | Profilul meu |
| Stats | Stats | Statistici |
| ButtonClose | Close | Închide |

Pentru MobileHudSmartHud există textul englezesc Smart HUD, dar câmpul românesc din catalogul citit este gol. Nu inventăm o traducere livrată. Dicționarul și mecanismul de fallback trebuie deosebite.

Panoul nu este o pagină de clasament al utilizatorilor. HandRank arată combinația curentă proprie, cărțile care o formează și, în ramurile disponibile, un indiciu de draw. HUD și Stats sunt file ale aceluiași ansamblu, cu date diferite descrise în fișa HUD sesiune/all-time.

## Calculul și confidențialitatea în PlayInfo

getBestFiveCard returnează null dacă jocul nu este activ, squeeze este în curs, propriul jucător lipsește sau propriile cărți sunt goale. Folosește cache-ul _bestFiveCards până când _needRefreshBestFiveCard este setat. getBestFiveCardOfBoard aplică aceleași condiții, dar calculează boardul cerut separat.

Cu minimum trei cărți comune, _computeBestFiveCardForBoard cere NewHandManager.getRankOfHand cu cărțile proprii, boardul, numărul cărților proprii și indicatorul Short Deck. Descrierea și valorile aferente sunt separate de rank. Dacă descrierea lipsește, devin șir gol/listă goală/rank−1; nu este inventată o mână câștigătoare.

Combinația se formează prin NewHandVO.setCards și getBestFiveWithSorted. userCardIndex conține pozițiile cărților proprii în lista rezultată; o carte nefolosită poate avea index−1. Doar pentru cel mult două cărți proprii se cere getDrawOfHand în această ramură. Draw-ul Hold’em nu poate fi aplicat automat Omaha doar pentru că evaluatorul acceptă mai multe cărți.

Înainte de flop, pentru două cărți proprii folosește NewHoleCardRank.getRankOnlyTwoCard și arată ambele, cu userCardIndex[0,1]. Pentru mai multe cărți proprii inspectează toate perechile și păstrează perechea cu rank numeric mai mic. Aceasta descrie alegerea preflop a clientului; nu înseamnă că Omaha poate folosi arbitrar cinci cărți proprii la showdown. Tabelele de ranking preflop și regulile de draw necesită urmărire separată înaintea implementării.

## Actualizarea în TableMediator

refreshBestFiveCards nu actualizează în catch-up/pauză sau squeeze. În Streamer Mode emite UPDATE_STREAMER_BEST_FIVE și revine; nu este aceeași cale de afișare. Pe un board, calculează boardul curent; pe două, încearcă ambele și resetează dacă nu există niciun rezultat.

Pentru fiecare rezultat transmite separat setHandValue, setDrawValue și setBestFiveCards. Indiciul de combinație de pe propriul loc este ascuns pentru HC și1P; la Omaha este ascuns suplimentar pentru2P. Această regulă privește indiciul de pe loc, nu interzice afișarea combinației în fila HandRank. Fără această distincție, clona ar ascunde prea mult sau ar arăta indicii native în plus.

După terminarea squeeze se reactivează calculul și mișcările relevante. BEST_FIVE_CARD_OVER/ON poate ridica propriile cărți foldate cu durata0,4s; OUT/OFF le coboară numai dacă panoul nu mai este vizibil. Nu dezvăluie cărțile adversarilor. Testele locale trebuie să folosească numai payloadul privat deja autorizat propriului loc.

## Un board: geometrie și aspect

HandRankView montează SingleBoardHandRank la x22/y56. Titlul și draw-ul au font28, dimensiune516×42; primul aliniat stânga, celălalt dreapta. Culoarea neutră este#a5a5a5. O descriere de mână nevidă folosește#38a4f9; draw nevid#ff8d8d. Șirurile goale curăță eticheta, fără a afișa implicit un nou rang.

Sunt pregătite cinci sloturi de Card, inițial ascunse. Cardurile au aliniere LT și scară0,85. Distanța orizontală103; x inițial0. Cărțile proprii folosite sunt la y44, celelalte la y68, deci diferența verticală este24 de unități interne. userCardIndex stabilește ridicarea; nu culoarea cărții și nu ordinea de la distribuire.

Aceste dimensiuni se aplică în coordonatele componentei native. Scara finală depinde de containerul mesei; nu sunt transformate automat în pixeli CSS sau într-o captură Mac de altă mărime.

## Schimbarea combinației: ordine și durate

Prima populare trece direct la showInCardList. La o actualizare cu carduri existente, showOutCardList compară ordinalele cu noua listă, oprește tweenurile cardurilor vizate și aplică alpha0 în0,2s cu Ease.easeOut în ramura de ieșire. După0,2s execută showInCardList.

Cardurile care existau pornesc din poziția lor veche și se deplasează spre noul slot în0,5s. Cardurile noi pornesc cu alpha0 în slotul final și apar prin tween0,3s după întârziere0,5s. Cu faza de ieșire, un card nou poate termina apariția la1s de la actualizare; aceasta este o derivare a duratelor din sursă, nu o măsurătoare runtime.

Codul de ieșire folosește lista nouă și sloturile curente; nu afirmăm că realizează un diff perfect după identitate în orice reordonare. Reset oprește apelul întârziat și tweenurile fiecărui card, golește cardInfo, ascunde cardurile și restabilește textele. Clona trebuie să anuleze animațiile vechi când începe altă mână, se schimbă locul sau dispare payloadul privat.

## Două boarduri

HandRankView creează două DoubleBoardHandRank: stânga x22/y56, dreapta x289/y56, etichete#1 și#2. Separatorul este gri#999999, x280/y65, lățime1 și înălțime185. Schimbarea modului ascunde mai întâi toate variantele, apoi afișează ramura aleasă. Indicii prea mari sunt plafonați la ultimul board în metodele publice inspectate; nu este observată o validare generală pentru indici negativi.

DoubleBoardHandRank folosește BestFiveMiniCard în locul Card obișnuit. Are x de pornire24, pas48, y81 pentru cărțile proprii și111 pentru celelalte. Descrierea mâinii este la x40, lățime195, autoscale; draw-ul este la y160,lățime235,aliniere stânga,autoscale. Numărul boardului folosește28 și#ba9c5b.

Două ferestre cu câte o mână nu reprezintă două boarduri ale aceleiași mâini. Această funcție necesită evaluare și distribuire de poturi pe board, nu duplicarea vizuală a rezultatului.

## Container, file și butoanele inferioare

BestFiveCardView pornește invizibil, alpha0 și dezactivat. Containerul este la x570/y562, cu fundal negru alpha0,9,560×332 și colțuri10. Filele sunt poziționate separat la x572/y564 și împart559 între cele vizibile. Pe afișare, selectează din nou HandRank, emite GET_USER_DYNAMIC_HUD_INFO și BEST_FIVE_CARD_ON, instalează închiderea prin click în afară și face fade0,2s cu Ease.easeOut.

hideCards respectă commandLock și starea curentă, elimină evenimentele și handlerul exterior, apoi face fade0,2s. Numai la terminare închide componentele, ascunde containerul și emite BEST_FIVE_CARD_OFF. delayedShowCards anulează comenzile anterioare și programează afișarea după0,3s. Existența metodei nu dovedește toate evenimentele fizice care o apelează.

My Profile și Close sunt248×44,font28, la y269. Profilul folosește atlasul best_five_card cadre1/3; Close cadre4/6. Eticheta devine#999999 în starea down, altfel alb. pin face Close vizibil și mută profilul la x94; unpin ascunde Close și mută profilul la x190. Constructorul și setTable au și alte poziții inițiale/VIP; acestea nu trebuie combinate ca și cum ar fi o singură stare finală.

My Profile emite SHOW_SMART_HUD. Close anulează comenzile întârziate și ascunde panoul. Clickul pe HUD schimbă pagina și solicită GET_USER_DYNAMIC_HUD_INFO. Fila selectată nu este reclickabilă. În ramura VIP fără HUD, profilul și filaHUD sunt ascunse; nu se desenează un buton mort în locul lor.

## Ce există în clonă și ce lipsește

Clona are bestFiveFocus pentru boarduri cunoscute de3/4/5 cărți, cu test de tie-break nativ, Hold’em board-only, Omaha exact două cărți proprii și Short Deck. Istoricul ordonează și arată combinația câștigătoare; showdownul evidențiază cărțile folosite. HUD-ul propriu se deschide dintr-un control separat. Aceste funcții nu constituie panoul complet HandRank/HUD/Stats.

Lipsesc încă integrarea ansamblului la masă, calculul preflop și draw-urile conform sursei, integrarea calculului flop/turn în panou, sloturile și ciclul de animație, două boarduri complete și verificarea vizuală la aceeași scară. Funcția bestFiveFocus cerea exact cinci cărți comune. Extensia publicată în PR #25 acceptă acum3/4/5 cărți comune, cu ordinea de excludere din NewHandVO și Omaha exact două proprii; testele logice trec. Nu completează boardul cu cărți viitoare inventate sau cărți private ale adversarilor. Publicarea a trecut8 verificări pe commitulc8003d255a4cb7f00b683232c02aab54d25d6ba0,merge `5f93066ad0c728c5dc056f5d00b12ffa4e028047` . Actualizarea live PID13137→46220 păstrează identic6fișiere salvate și starea publică a meselor;modulul servit coincide cu sursa testată. Integrarea panoului rămâne un prag separat. Dovezi: verificare-handrank-selection.json și verificare-handrank-selection-live.json.

## Pragul de acceptare pentru implementare

Testul trebuie să pornească dintr-o masă creată de owner, cu identitate locală și cinci computere: preflop→flop→turn→river, schimbarea filelor, profil, închidere și redeschidere. Verifică payloadul propriu, reset la mână nouă/leave/reconnect, lipsa cărților adversarilor neexpuse, procentul de sesiune cu numitor necunoscut, anularea animațiilor și reduced-motion. Plățile trebuie să rămână identice cu evaluatorul independent și totalul de fise conservat.

Geometria poate fi comparată cu sursa procedurală și capturile existente; paritatea fizică a temporizării native și a controalelor așezate nu este demonstrată de un simplu test headless. Până la aceste probe, starea este identificat și documentat, parțial reconstruit în alte componente, nu1:1 complet.

## Dicționarul preflop: 91 clase, fără suitedness

NewHoleCardRank are91intrări,rank1–91 fără goluri:13perechi și78combinații de ranguri diferite. getRankOnlyTwoCard sortează cele două cărți descrescător după rang și construiește cheia doar din ranguri. Culoarea/suitul nu intră în cheie: AK suited și AK offsuit primesc aceeași clasă pentru această etichetă. Nu este un tabel de echitate sau un clasament complet al celor169 clase de start folosite în alte contexte de poker.

AA are rank1 și descriere1P cu valoareA; KK rank2. Ultimele42 și32 au rank90/91,descriereHC și valoarea rangului mare. Catalogul complet verificat este catalog-handrank-preflop.json,cu sursa și hashul. Constructorul și selectorul pentru mai multe cărți folosesc această ordine preflop pentru a alege o pereche. La egalitate strictă de rank nu înlocuiesc prima pereche găsită.

getRankOnlyTwoCard respinge null sau lungime peste2 cu rank9999,descriere goală; nu protejează explicit lungimile0/1 în codul inspectat. Clona trebuie să valideze exact două cărți legale înainte de apel, nu să reproducă o posibilă excepție de indexare.

## Draw: fereastra de disponibilitate și cele nouă etichete

NewHandManager.getDrawOfHand respinge cărțile null/ordinal negativ. Unește cărțile proprii cu boardul,returnează gol pentru total sub5 sau cel puțin7,apoi cere _handDraws.getHandDraw. Pentru două cărți proprii înseamnă flop și turn; riverul nu afișează draw. Este distinct de rangul mâinii deja formate.

Maparea inspectată conține nouă rezultate: RoyalStraightFlushDraw,StraightFlushDraw,FlushDrawDoubleGutshotStraightDraw,FlushDrawGutshotStraightDraw,FlushDrawOpenEndedStraightDraw,DoubleGutshotStraightDraw,OpenEndedStraightDraw,GutshotStraightDraw șiFlushDraw. Orice rezultat nemapat produce șir gol. Aceste nume nu sunt probabilități,procente de câștig sau permisiuni de pariere.

Semnătura are un al treilea boolean implicit false,dar corpul inspectat nu îl folosește; PlayInfo apelează cu două argumente. Nu deducem de aici că regulile draw pentru Short Deck au fost verificate. Implementarea _handDraws și variantele sale necesită urmărire înainte de a promite paritate pentru draw.

## Integrarea inițială în masa locală

Modulul hand-panel.mjs este conectat prin player-note-ui.mjs la contextul privat al jucătorului și la același răspuns autorizat de note/HUD. server.mjs include explicit modulul în lista de fișiere statice permise; lipsa acestei înregistrări a fost detectată la testarea inițială și corectată. Nu se adaugă un API public cu cărți ascunse.

Deschiderea este disponibilă cu identitate locală,propriul loc și cărți proprii valide din starea privată autorizată. Nu așteaptă încărcarea statisticilor HUD; un răspuns401 revocă accesul și golește panoul până la o nouă autorizare. Squeeze activ ascunde panoul și împiedică generarea combinației. Portretul propriu are acțiunea accesibilă; stratul Chip Shuffle inactiv,care acoperă efectiv portretul,permite același click. În timpul shuffle-ului activ,clickul păstrează oprirea shuffle-ului și nu deschide panoul. Regiunea nativă originală este un hit-area transparent181×155 la758/870; hit-testing-ul local nu este declarat identic pentru toate stările și dimensiunile.

Hand Rank afișează două cărți proprii preflop,selectate după principiul celor91 clase: orice pereche înaintea high-card,apoi rangurile descrescător; la egalitate rămâne prima pereche. Postflop reutilizează historyWinningCards/bestFiveFocus pentru cinci cărți cunoscute și ordonarea lor. Omaha folosește două proprii și trei comune; Short Deck păstrează selecția specifică. Etichetele curente sunt în engleză; descrierile complete native ale chintelor și toate traducerile nu sunt încă reproduse.

Filele Hand Rank/HUD/Stats schimbă conținutul local fără o acțiune de joc. Redeschiderea selectează Hand Rank. My Profile deschide profilul propriu existent. Close,Escape și clickul exterior închid panoul. Cardurile private din DOM-ul panoului sunt eliminate la închidere; pierderea eșantionului autorizat sau schimbarea identității închide panoul. Aceste citiri nu schimbă pariurile,plățile sau ordinea de acțiune.

Containerul folosește570/562 și560×332 în sistemul intern1700 al mesei. HUD folosește cinci coloane cu originea26/104,pas104,cercuri72 și interior64,valorile30 la y14 și titlurile24 la y76. Hands afișează număr și nu desenează cerc,conform CircleGraphView.TYPE_HANDS. Arcul procentelor folosește unghi întreg. AoF are etichetele AllIn/ATS/Fold/FTA,cu valorile încă necunoscute,în locul reutilizării greșite a PFR/3-bet.

Stats are viewport la40/63,520×200,rânduri de50,titluri26 și valori34. Hands și câștigurile/showdown-urile provin din eșantionul local,iar procentul de showdown este trunchiat ca în sursa nativă. Time bank folosește rezerva disponibilă în payload; timpul sesiunii,sit-out și câștigurile fără showdown rămân necunoscute. Nu există încă un registru durabil de sesiune și nici TimeBankCard. AoF omite rândurile fără showdown și time bank în această ramură.

Grafica butoanelor inferioare este încă procedurală,nu bitmapurile native1/3/4/6. Animația de apariție și unele tranziții sunt prezente,dar întregul ciclu fade-out/reordonare/fade-in după identitate nu este încă reprodus. Draw-urile,două boarduri și măsurarea fizică a timingului rămân deschise. Această integrare depășește starea anterioară în care panoul lipsea,dar nu îndeplinește singură acceptarea1:1.

Testele noi includ selecția pură,click real pe suprafața proprie,geometria normalizată570/562/560/332,Hands32,PFR0%,profil,redeschidere,Escape,ștergerea cărților din panoul închis și verificarea că mâna HTTP rămâne identică. Parcursul gazdei cu cinci computere deschide și închide HandRank preflop,apoi continuă mâna,verifică plata independentă și reconectarea. Rezultatele pe commitul final și instalarea live sunt consemnate separat,după finalizarea QA.

Publicare integrare: PR #26 merged,commit testata336fda21c4dcc0d447c2d5bf5e64c817e36bb7c,merge `8a23dc4479aad171e718d433eea537e995d202c8` . Toate14verificările pe commitul exact trec. Instalarea live PID46220→89924 păstrează identic6fișiere salvate și starea publică a meselor;patru fișiere servite,inclusiv noul modul permis de server,coincid cu sursa testată. Fără mutații de joc pe conturile utilizatorului. Dovezi: verificare-handrank-panel.json,verificare-handrank-panel-live.json și pr26-publicare.json.

## Sesiune locală persistentă: început, timp și contoare proprii

Noua implementare nu ia ora deschiderii popupului drept început de sesiune. rooms.mjs setează sessionStartedAt din ceasul serverului numai la ocuparea cu succes a unui loc nou. Câmpul este salvat în același checkpoint ca jucătorul,portofelul și mâna. Reîncărcarea serverului și reconectarea aceluiași cont păstrează valoarea; rotirea tokenului nu o resetează. Leave urmat de Join creează alt început. Clientul nu poate furniza o valoare arbitrară prin formular pentru acest câmp.

sessionStats are exact patru contoare: hands,showdowns,showdownWins,nonShowdownWins. Sunt inițializate cu zero pentru locul nou. La înregistrarea unei mâini terminate,se actualizează numai dacă identitatea capturată la distribuire încă aparține acelui loc. Blocul g.hudRecorded împiedică dublarea la citiri și restart. Un jucător fără cărți distribuite nu primește o mână jucată pentru simpla ocupare a unui loc.

Un jucător nefoldat în pot contestat primește showdown; atribuirea pozitivă de pot peste returnările neplătite primește showdownWin. Câștigătorul rămas singur primește nonShowdownWin. Foldurile nu sunt showdown-uri proprii. Părțile de pot împărțit sunt numărate ca atribuiri locale; politica privată a operatorului rămâne necunoscută. Nu se numără fiecare side pot ca o mână separată.

View-ul autorizat returnează doar sessionStartedAt și copia propriului sessionStats. Spectatorul nu primește câmpurile. Modificarea obiectului returnat nu schimbă stocarea internă. Încărcarea checkpointului respinge timestampuri invalide și contoare negative,fracționare,incomplete sau incompatibile: wins≤showdowns≤hands și showdowns+nonShowdownWins≤hands. Datele vechi fără câmpuri rămân necunoscute; nu se reconstruiesc din ultimele30 mâini și nu primesc ora actualizării ca început fals.

În Stats,Hands și câștigurile sunt acum ale locului curent. HUD și istoricul păstrează separat eșantionul de masă/pool. Astfel,un cont care revine la aceeași masă poate avea HUD cu istoric anterior,dar Stats începe de la noua ocupare. Acesta este contractul local explicit,nu o dovadă că intervalul LinkedSessionInfo al operatorului are exact aceeași politică. Rush încă nu publică acest registru de sesiune; valorile respective rămân indisponibile.

sessionDuration formatează sub o oră ca „01m 01s”,iar de la o oră ca „01h 00m”,folosind sufixele EN livrate DesktopTriviaHour/Minutes/Seconds. Secundele dispar în ramura de ore,conform sursei. Timestamp invalid sau absent produce minus. Ceasul clientului în urma începutului este plafonat local la zero; nu se afișează durate negative. Sincronizarea ceasurilor pe calculatoare diferite necesită verificare separată.

Panoul pornește un timer de o secundă numai când este deschis și îl oprește la închidere sau pierderea contextului. Actualizarea textului păstrează nodurile și focusul,nu trimite cereri noi de joc și nu resetează sesiunea. Testul browser verifică efectiv schimbarea textului în timp și păstrarea aceleiași mâini HTTP. Sit-out,TimeBankCard și politica nativă de sesiune inter-mese rămân deschise. Această secțiune înlocuiește descrierea istorică de mai sus în care Session time și poturile fără showdown erau necunoscute pentru toate locurile.

Publicare sesiune: PR #27 merged,commit testat5809b5641f0f518e329bd57ceff039094c867b5e,merge `9a9fc862556bf81ad59a17b1cb8b45f2010d75a3` . Toate15verificările pe commitul exact trec. Instalarea live PID89924→28483 păstrează identic6fișiere salvate și starea publică a meselor;modulul servit coincide cu sursa testată. Sesiunile vechi nu au fost rescrise sau reconstruite. Dovezi: verificare-seat-session.json,verificare-seat-session-live.json și pr27-publicare.json.

## Grafica butoanelor: cadre identificate și limită de extragere

BestFiveCardAssets declară indicii0–7:BG,MyProfile normal/over/down,Close normal/over/down și fundal de filă. Constructorii reali MyProfileButton/CloseButton folosesc numai1/3 și4/6. LabelButton transmite al doilea argument ca downState,al treilea ca overState; aici al treilea lipsește. Prin urmare existența imaginilor2/5 nu dovedește că sunt afișate la hover în acest panou.

StageAssets formează cheia din prefix și indexul formatat. Manifestul desktop_table_assets.json din assets/after_lobby conține best_five_card0001/0003/0004/0006,rotated=false,toate40×44. Textura comună este desktop_table_assets.png. Nu se caută un fișier separat numit best_five_card.png. Cele patru stări sunt acum explicate explicit în catalogul vizual; resursele over neconectate nu sunt numărate ca stări active verificate.

applySlice9Grid este apelat înainte de redimensionarea la248×44. Button este Sprite,adică DisplayObject; funcția calculeazăRectangle20/22/1/1 din bitmapul40×44. La o redare CSS echivalentă,marginile sursei sunt top22,right19,bottom21,left20,cu centrul1×1 întins. Aceasta păstrează capetele și muchiile,în loc să lărgească tot bitmapul proporțional. Trebuie verificată redarea efectivă după extragere; formula nu este ea însăși o captură nativă.

În lipsa overState,Button folosește textura normală și multiplicatorul1,3. Setarea cu motion durează0,2s când butonul nu este în click. Down are textură proprie,multiplicator1 și eticheta#999999. Constructorul etichetei pornește de la x2; dimensiunea28 și lățimea248 sunt setate ulterior de butonul concret. Această deplasare a textului trebuie inclusă la următoarea potrivire a graficii native.

Interfața locală aplică acum hover brightness1,3 cu tranziție0,2s și pressed brightness1 imediat,text#999. Testul cu pointer real verifică hover,mouse-down,stilul efectiv,release→Close și mâna neschimbată. Bitmapurile locale provizorii nu sunt declarate înlocuite.

Extractorul pregătit este extract-best-five.py în folderul raportului. Citește manifestul existent,selectează patru cadre și are verificare RGBA după extragere. Sintaxa sa este verificată,dar execuția ffmpeg a fost oprită de protecția locală a discului la13,27GiB liberi față de rezerva25GiB. Nu există un rezultat de egalitate pixel-cu-pixel pentru aceste patru PNG-uri. Fișa verificare-best-five-buttons-source.json păstrează hashurile surselor,rectangulele și acest rezultat explicit. Extracția rămâne amânată; protecția nu este ocolită.

Publicare stări butoane: PR #28 merged,commit testatfc6f7f5e7a7318f9560716d30d89440001fe8c68,merge `cf122e2c02bc79cce16f45d9b57a820d88b54212` . Cinci verificări pe commitul exact trec,inclusiv pointer real hover/down/release și Hold’em/ShortDeck. CSS live coincide cu sursa testată,fără restart de server sau acțiune de joc. Dovezi în verificare-best-five-button-states.json și verificare-best-five-states-live.json. Extragerea PNG rămâne amânată de protecția discului.

## Draw-uri implementate: condiții și etichete livrate

HandDraw este urmărit acum din NewHandManager spre măștile concrete ale clientului. Cele nouă etichete native sunt:

| Cheie | Engleză livrată | Română livrată |
|---|---|---|
| DoubleGutshotStraightDraw | Double Gutshot Draw | Draw de chintă în două găuri |
| FlushDraw | Flush Draw | Draw de culoare |
| FlushDrawDoubleGutshotStraightDraw | Flush & Double Gutshot Draw | Draw de culoare și chintă la două găuri |
| FlushDrawGutshotStraightDraw | Flush & Gutshot Draw | Draw de culoare și de chintă în gaură |
| FlushDrawOpenEndedStraightDraw | Flush & Open Ended Draw | Draw de culoare și de chintă la două capete |
| GutshotStraightDraw | Gutshot Draw | Chintă în gaură |
| OpenEndedStraightDraw | Open Ended Draw | Draw de chintă la două capete |
| RoyalStraightFlushDraw | Royal Flush Draw | Draw de roială mare |
| StraightFlushDraw | Straight Flush Draw | Draw de chintă de culoare |

Interfața locală folosește momentan textele EN,ca restul mesei. Afișează hintul în HandRank,la dreapta,cu#ff8d8d,lățime516,înălțime42 și font28 în coordonatele native. Fără rezultat,textul este gol. Nu reprezintă o probabilitate,un număr de outs sau o recomandare de pariere.

Funcția primește numai cele două cărți proprii cunoscute și boardul vizibil de3/4 cărți. Preflop,river,Omaha și payloadurile cu cărți necunoscute,duplicate sau invalide produc șir gol. La river hintul dispare chiar dacă la turn încă exista draw. Nicio carte viitoare din deck și nicio carte privată a adversarului nu intră în calcul.

## Măștile și ordinea de prioritate

Vectorul nativ are14poziții:A-low,2,3,…,K,A-high. Un as ocupă ambele capete. Se verifică întâi o chintă făcută,apoi open-ended,cele două tipare double-gutshot și cele trei tipare gutshot deplasabile,urmate de marginile fixeA234 șiJQKA. O potrivire cere toate pozițiile măștii; duplicatele de rang nu adaugă poziții noi.

Măștile deplasabile se verifică de jos în sus,cu primul match întors pentru fiecare tipar. În timpul potrivirii,se poate înregistra și existența a patru cărți din aceeași suită într-un interval de cinci poziții. Straight/royal flush draw suprascrie apoi categoria de chintă,iar draw-ul de culoare se combină cu open-ended,double-gutshot sau gutshot. Chiar dacă există deja open-ended,verificările următoare pot identifica ramura straight-flush; portarea păstrează această ordine.

Implementarea locală folosește bitseturi14 biți în locul vectorilor și comparației zecimale convertite la int din sursă. Testul verifică toate16384codificările pentru a demonstra că această comparație este injectivă în domeniul respectiv. Este o verificare finită a reprezentării,nu execuția originalului Flash și nici o verificare exhaustivă a tuturor mâinilor de poker.

## Particularități păstrate din sursă

DecisionFlush testează exact4sau5 cărți ale aceleiași suite. Șase cărți de aceeași suită nu intră în acea ramură. De exemplu Ah/Kh cu Qh/Jh/2h/3h poate rezulta Gutshot Draw în sursa inspectată,deși există deja culoare. Testul păstrează explicit această particularitate; nu o confundă cu regula evaluatorului de plăți.

O chintă deja formată este verificată înaintea măștilor draw. Ah/Kh cu Qh/Jh/Tc/2d păstrează Flush Draw și nu Royal Flush Draw în ramura inspectată. Aceasta nu este o estimare generală a posibilităților de îmbunătățire a mâinii.

Callerul Short Deck nu transmite alt set de măști în această cale; al treilea boolean al getDrawOfHand nu este folosit în corpul inspectat. Portarea nu inventează un tratament specialA6789. Exemplul Ah/6d cu7s/8c/Kd nu primește un draw adăugat arbitrar. Politica runtime a clientului Mac actual și eventualele diferențe de versiune rămân de verificat.

Aceste hinturi sunt separate de evaluatorul Hold’em/ShortDeck și de distribuirea poturilor. Comportamentul cosmetic observat în sursă nu modifică ordinea mâinilor,plățile sau acțiunile legale.

## Verificarea integrării draw-urilor

Testul logic include toate cele nouă etichete,cazuri made-hand,quirkul de șase cărți de aceeași suită,limitele Short Deck,scope-ul și imutabilitatea intrărilor. currentHandRank este verificat separat pentru conectarea drawKey,ascunderea la river și excluderea Omaha.

Fixture-ul de browser are șase identități temporare și cărți fixate înaintea pornirii serverului de test. Deschide HandRank preflop,avansază legal prin flop și turn unde verifică Royal Flush Draw,textul exact,culoarea,alinierea și dimensiunile,apoi verifică dispariția la river. Mâna se termină,plata este verificată independent,totalul720de fise se păstrează și rezultatul rămâne după restart. Acest test nu folosește contul live al utilizatorului.

Dovezile statice sunt în verificare-hand-draw-source.json. Execuția SWF nativă,compararea fizică a fontului și timingul rămân neconfirmate; sursele provin din fallbackul FFDec după respingerea formatului de către REA.


## Coregrafia cărților și independența de încărcarea HUD

SingleBoardHandRank și Ease.easeOut stabilesc fazele: pentru prima afișare, întârziere500ms și fade300ms; la actualizare, fază de ieșire200ms, deplasare500ms pentru cărțile păstrate și întârziere500ms plus fade300ms pentru cărțile noi. Curba cubică este cubic-bezier(0.3333333333,1,0.6666666667,1), cu progres87.5% la jumătatea duratei. Originea orizontală este vechiul indice înmulțit cu103; destinația este noul indice înmulțit cu103. Înălțimile rămân44 pentru cărți proprii și68 pentru board.

Ieșirea urmărește slotul din lista nouă al unei cărți absente anterior, conform sursei, nu o regulă inventată de eliminare după identitate. Numai animațiile sloturilor vizate sunt anulate în faza de ieșire; toate vechile animații sunt anulate la înlocuirea efectivă. Filele reutilizează stratul de cărți, inclusiv actualizarea lui în afara ecranului, fără reluarea apariției. Închiderea, schimbarea identității,401 și mâna nouă invalidează callbackurile întârziate. Preferința reduced-motion afișează direct starea finală.

Fixture-ul headless verifică reordonarea efectivă a două cărți, poziția la250ms, reutilizarea stratului între file, încărcarea HUD ținută deliberat în așteptare, revocarea401 și recuperarea autorizării, închiderea în faza200ms, mâna nouă și reduced-motion. O mână completă verifică independent plata și conservarea720jetoanelor, apoi restartul serverului temporar. Nu constituie măsurarea pe Mac a timingului fizic, sunetului, primei deschideri sau sincronizării tuturor runout-urilor all-in. Bitmapurile butoanelor și două boarduri rămân nefinalizate.


## Showdown la actualizarea unei cărți arătate voluntar

Testul controlat include acum un jucător foldat care arată o singură carte în timpul WIN și deplasării jetoanelor. Înaintea corecției, redraw-ul elimina clasa animației WIN. Pentru aceeași mână, masa păstrează WIN-ul montat și soldul intermediar până la callbackul animației de plată deja existent. Nu recalculează plata, nu creează o a doua deplasare de jetoane și nu modifică ledgerul serverului. Testul suspendă temporar animațiile pentru a verifica ordinea determinist, apoi le reia și verifică soldurile finale, conservarea720jetoanelor și restartul. Măsurarea timingului fizic în aplicația originală rămâne separată și neefectuată.


## Închiderea panoului: tranziție și revocare

BestFiveCardView.hideCards folosește Tween.to(alpha0,durată0.2,Ease.easeOut); close și ascunderea containerului sunt executate la finalul tweenului. Clona aplică această ordine pentru Close,Escape,click exterior și toggle pe suprafața proprie. În timpul ieșirii, panoul nu mai acceptă input și callbackurile de intrare a cărților sunt invalidate. Repetarea toggle-ului nu redeschide panoul înainte de terminarea ieșirii.

Pierderea autorizării, identității sau schimbarea mâinii anulează tranziția și elimină imediat cărțile private. Reduced-motion închide imediat. Testul verifică200ms,opacitate0.125la100ms,curba cubică,ștergerea conținutului la final,revocarea401în timpul unei tranziții suspendate și închiderea fără animație. Nu constituie măsurarea pe Mac a timingului fizic.
