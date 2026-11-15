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

Poziționarea Chat este aplicată jucătorilor locali așezați la mesele obișnuite cu șase locuri. Spectatorul păstrează controlul existent; Rush rămâne exclus. Întregul rând social, backplate-ul, SnapCam și schimbarea Chat/Helmet după regulile native nu sunt încă reconstruite; accesul local existent la chat rămâne disponibil. Nu declarăm paritate integrală a rândului social.
