# Controale directe pe masa Hold’em

## Chip Shuffle

Controlul local Shuffle chips este direct pe felt, nu ascuns în Table settings. Folosește aceeași comandă autentificată /shuffle și același motor de animație/sunet deja implementat. Nu modifică pariul, cărțile, potul sau soldul. Un al doilea click oprește efectul propriu.

TableEtcMenu3D are slot62×62 și8unități între controale. Iconurile table_menu419/420 sunt124×124, încadrate la62×62 cu factor0,5, fără nine-patch.419arată efect activ;420inactiv. Nu sunt perechi up/hover și nu reprezintă preferința globală. TableMediator pornește START_CHIP_SHUFFLE și efectul propriu, apoi setează meniul activ; al doilea click și END_CHIP_SHUFFLE îl dezactivează.

TableMenu3D ancorează rândul la viewPort.height−90. În ramura fără side-game group și fără BigChat de spectator, x=SideGameGroup.x9+iconLeft20=29. Controlul local folosește această ramură pentru masa administrată cu jucător așezat. Panic și grupurile de jocuri laterale au alte offseturi; nu pretindem că aceste ramuri sunt reconstruite.

Preferința Chip Shuffle rămâne în setări. Când este oprită, controlul propriu este ascuns și animația proprie se oprește; animațiile celorlalți continuă. Spectatorul, chat-only, Rush și formatele locale fără șase locuri nu primesc acest control. Inițializarea atlasului poate ține controlul disabled până când resursa este disponibilă.

## Inventarul TableEtcMenu3D

| ID | Resursă nativă | Acțiune și acoperire locală |
|---|---|---|
| chipShuffle |419activ/420inactiv| START/STOP cosmetic; conectat pe mesele locale șase-seat |
| straddle |422activ/423inactiv;slot72×62| SEND_STRADDLE; contract în straddle.md, arbitrarea nativă rămâne deschisă |
| autoFold |429activ/428inactiv| Deschide/închide editorul; integrare Rush Hold’em în auto-fold.md; controlul local de acces rămâne în setări |
| finalTableBetting |431| OPEN_FINAL_TABLE_BETTING; pariul pe o finală este distinct de acțiunea jucătorului din finala locală |
| deal |430| Cerere de negociere/isMakingADealRequested, nu deal de cărți; negocierea nu este implementată |
| pushSeat |327| PUSH_SEAT_CLICK; eligibilitatea/rolurile native necesită trasare suplimentară |
| splashEgg |434| Se arată doar când inventarul tagThrowable include Egg; efectul/inventarul complet nu sunt implementate |
| splashCigar |435| Inventar Cigar; efectul/inventarul complet nu sunt implementate |
| splashWater |437| Inventar Water; efectul/inventarul complet nu sunt implementate |
| splashPunch |436| Inventar Punch; efectul/inventarul complet nu sunt implementate |
| promotion |399| Inventarul promoțional primit; fără inventar local echivalent |

Nu sunt adăugate controale funcționale fictive pentru operații neimplementate. Inventarul descrie explicit ce este cunoscut, ce este conectat și ce rămâne.

## Verificare

Fișa table-controls-source.json păstrează hashurile celor cinci clase, dreptunghiurile celor două resurse și limitele. Swift compară RGBA decodat pentru ambele imagini instalate cu atlasul curent. Browserul măsoară poziția29/−90 și62×62 la850×615 și1196×929, apoi folosește pointer real pentru start și verifică iconul activ. Șase sesiuni verifică animația/sunetul remote, preferința Off, oprirea proprie și păstrarea exactă a stării mâinii; urmează mâna cu payout independent și restart. Este verificare a sursei și execuției locale; rasterizarea AIR și faza fizică a sunetului rămân neconfirmate.

## Chat așezat și suprapunerea detectată

TableSocialMenu3D folosește table_menu426 pentru Chat, într-un slot68×68. În ramura normală fără Panic, TableMenu3D poziționează grupul la625/963; cu Emoji la0 și Chat la−70, Chat ajunge la555/963. Resursa originală150×150 este încadrată la68×68. Este refolosită deschiderea reală a ferestrei de chat; nu se schimbă mesajele sau autentificarea.

Vechiul Chat fix în colțul de jos acoperea Shuffle. Testul cu pointer real a demonstrat elementFromPoint=Open table chat în centrul Shuffle, deși clickul programatic ar fi trecut. Controalele folosesc acum portaluri deasupra footerului, poziționate după aceeași geometrie a feltului la resize/scroll. Noul test măsoară și Chat555/963/68×68, decodează imaginea150×150 și exercită chatul real în sesiuni separate după shuffle.

Poziționarea Chat este aplicată jucătorilor locali așezați la mesele obișnuite cu șase locuri. Spectatorul păstrează controlul existent; Rush rămâne exclus. Rândul normal și înlocuirea Chat/Emoji prin Helmet sunt conectate conform secțiunii următoare. SnapCam, Avatar dinamic și celelalte ramuri native rămân neimplementate; nu declarăm paritate integrală a tuturor formatelor.

## Rând social și meniu Emoji pe masă

TableSocialMenu3D aliniază invers controalele vizibile pe sloturi68 și pas70. Fără SnapCam/Helmet, Chat este la−70 și Emoji la0 în grupul625/963. Fundalul424 are rect9-slice42/5/18/76 în bitmap104×89, apoi x−84/y−8/166×84. Cu Helmet activ, Chat și Emoji dispar; Helmet439 ocupă0 și fundalul devine−14/−8/96×84. Pointerul Helmet deschide dialogul real existent pentru dezactivare; nu modifică pariuri.

Emoji427 deschide TableEmoticons3D din stânga la0/30,560×1170. Deschiderea folosește200ms cubic ease-out, de la−560 la0. Grila are4coloane, originea36/42, pas130/140, butoane128×126, imagini92×92 și caption24la−18/92,128×34. Categoriile Standard/Dneg/Greg au28elemente fiecare; ID28/29 sunt excluse în fiecare set, iar ID30 nu primește o etichetă inventată. Sortarea folosește comparația lexicografică nativă a etichetelor cunoscute, nu localeCompare.

Taburile sunt în container4/1061, cu poziții18/16,108/16,198/16 și74×72. Folosesc resursele originale5/2/380; inactivele au matricea grayscale nativă cu1/6pe fiecare canal RGB. Fundalul6 păstrează rectul9-slice20/20/1/1. Cele7cropuri noi ocupă92943bytes și sunt verificate RGBA față de atlas.

Selecția trimite comanda emoticon existentă, autentificată și validată, cu același catalog84de imagini/animații. Nu deschide o pagină externă sau fereastra Chat pentru a simula meniul lateral. Preferința este aceeași cheie de cont folosită de pickerul Chat; se sincronizează între ferestre, iar reload-ul o păstrează. Pentru guest este numai în memoria ferestrei. Schimbarea categoriei nu trimite mesaj.

Un eșec lasă meniul deschis cu eroare și permite retry explicit, fără trimitere automată. Trimiterea așteaptă operația ocupată cu limită5s și revalidează tokenul/locul înainte de a trimite. Schimbarea identității sau plecarea închide meniul vechi. Hotkey-urile de pariere sunt izolate în meniu; Escape îl închide și restabilește focusul. Local închidem după confirmarea trimiterii pentru a păstra recuperarea la eroare, cu holdul de200ms descris mai jos; temporizarea fizică AIR și cooldownul privat nu sunt certificate.

Browserul verifică geometria,84miniaturi, pointer real,503/retry, reacție animată în altă sesiune, aceeași mână înainte/după și rândul Helmet/dialog. Fluxul continuă cu două mâini, payout independent, restart, cash-out și înlocuirea locului. Verificarea cu cont local și5computere acoperă preferința după reload și în ambele ferestre, fără mesaj automat, apoi păstrarea720chips. Nu sunt simulate SnapCam sau avatarurile dinamice; ramurile cu Panic și alte formate rămân deschise.

Regresia extinsă Chat/Helmet separă versiunea camerei de progresul mâinii: un mesaj sau o schimbare Helmet poate crește versiunea fără o nouă acțiune. Fixtureul recitește snapshotul la fiecare tură, tratează explicit hand.end și așteaptă cheia DOM me/number/history.length/turn a actorului. După click cere history.length mai mare decât snapshotul actorului sau hand.end, apoi verifică payout-ul. Diagnosticul anterior arăta deja toate cele opt acțiuni call/check și mâna decontată, deși testul mai aștepta Check; nu a fost schimbată regula jocului pentru a adapta testul.

## Mișcare, închidere și întrerupere

TableSideMenu3D.hide(true) fixează poziția la coordonata afișată și trimite tweenul tot la acea coordonată timp de0,2secunde, apoi hideComplete setează visible=false. Pentru Emoji LEFT_SIDE aceasta este0→0, nu0→−560. Interfața locală păstrează acum panoul vizibil200ms la poziția0. În acest interval, aria-expanded este false și conținutul este inert pentru a evita trimiteri suplimentare.

Redeschiderea în timpul holdului anulează vechiul callback și pornește din nou deschiderea−560→0 cu ease-out cubic. Un callback vechi nu poate închide panoul nou. Schimbarea identității/locului, pierderea permisiunii, Helmet și pagehide închid imediat pentru a nu păstra un meniu activ al vechii sesiuni. Reduced motion omite animațiile; activarea sa în timpul închiderii termină imediat închiderea, iar activarea în timpul deschiderii arată poziția finală. Aceste reguli de accesibilitate și siguranță sunt locale, separate de Tweenul nativ.

Testul browser măsoară cinci poziții ale deschiderii−560→0 și cinci puncte ale holdului0→0, durata200ms și ancora0/30. Verifică resize850×615/1196×929 fără recrearea celulelor, redeschidere la jumătatea holdului și executarea forțată a vechii animații fără închiderea panoului nou. Reduced motion și plecarea locului sunt verificate în același flux cu mesaje reale, payout și restart. Acestea dovedesc contractul sursei și execuția browserului; nu sunt măsurători ale compoziției fizice AIR.

Diagnosticul suplimentar PR194 a identificat un selector ambiguu în fixtureul Helmet: startsWith(Check) selecta Check/Fold înaintea butonului Check și arma acțiuni rezervate persistente. Fixtureul selectează acum eticheta exactă .actionLabel pentru Check/Call; nu modifică acțiunile rezervate ale aplicației. Verificarea completă și integrarea rămân condiționate de poarta QA a commitului final.
