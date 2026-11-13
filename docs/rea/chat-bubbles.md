# Bulele text de lângă jucători

## Proveniență și diferența față de emoji

Contractul este urmărit din ChatBox, PlayerExtension, PlayerPosition, PlayerPositionPreset, SixRingSetting, AofSetting, UniqueLabel, LabelModel, InitFont și applySlice9Grid din clientul instalat. Metoda este export static FFDec26.4.0, fallback în fluxul REA deoarece providerul SWF nu este disponibil. Nu este o observație nouă a ferestrei native în execuție.

ChatBox este separat de Emoticon: textul are propria bulă, propriul punct de ancorare și durată5secunde. Emoji-ul static folosește altă imagine și durată4secunde. Mesajul de chat păstrat în listă nu este șters când bula expiră sau este ascunsă.

## Aspectul recuperat

| Element | Contract nativ |
|---|---|
| Fundal | player_cell0023 din atlasul desktop,178×100 |
| Umbră | player_cell0024 din același atlas,178×100 |
| Slice9 | dreptunghiul(89,50,1,1); margini sus50,dreapta88,jos49,stânga89 |
| Transparență | numai fundalul are alpha0,7; umbra și textul rămân separate |
| Font | ChatBox cere SYSTEM_FONT; InitFont setează Arial;24px,culoare3355443/#333333 |
| Text | x12,lățime154,wordWrap,plain text,fără interpretare HTML |
| Limită | heightMax100 și autoSlice; LabelModel elimină succesiv caractere și adaugă exact două puncte `..` |
| Înălțime | max(100,labelHeight+34),deci cel mult134 când labelHeight≤100 |
| Așezare text | y=floor((boxHeight−15−labelHeight)/2) |
| Așezare container | y=100−boxHeight; baza bulei rămâne stabilă când textul crește |

Loaderul instalat folosește cadrul efectiv al atlasului. Metadatele trim/sourceSize inconsistente nu sunt folosite pentru a inventa o imagine699×227. Extractorul verifică RGBA pixel cu pixel pentru cele două cadre; totalul PNG este2473octeți. Grafica brută și hashurile rămân locale,iar extractorul și această fișă sunt în repository.

Browserul execută aceleași formule și algoritmul de scurtare, măsurând Arial cu motorul său de text. Nu echivalăm măsurarea DOM/antialiasingul Chromium cu motorul Flash; împărțirea exactă pe rânduri și font-AA în fereastra fizică rămân de comparat.

## Poziționare

ChatBox primește poziția `PlayerPosition.chat`, a cărei scală este explicit1, chiar când avatarul propriu are scala1,1. Această regulă diferă de emoji-ul200×scale. Ownerul furnizează originea locului. Preseturile folosite sunt:

| Poziție relativă | Hold’em6 | AoF4 |
|---|---|---|
| Proprie |(46,−204)| (46,−204)|
| Stânga jos/lateral |(78,−159)| (78,−159)|
| Stânga sus |(84,−112)| — |
| Sus |(90,−98)| (90,−98)|
| Dreapta sus |(−84,−112)| — |
| Dreapta jos/lateral |(−78,−159)| (−78,−159)|

La dreapta, fundalul și umbra sunt oglindite, textul rămâne lizibil, iar dreptunghiul începe cu178unități înaintea ancorei. Această versiune aplică ancorele demonstrate meselor cu6locuri și AoF4. Alte configurații locale păstrează lista de chat; nu primesc coordonate presupuse.

## Comportament local și backend

Mesajul este trimis prin chatul existent al camerei: token/cont,loc,sender,limită280caractere,rate limit și persistență. Nu a fost creat un protocol nou sau modificat motorul de joc. Frontendul alege ultimul mesaj text al ocupantului actual al fiecărui loc; reacțiile nu sunt reinterpretate ca text bubble. Textul este introdus numai prin textContent.

O bulă nouă pornește cu pivotul echivalent unei deplasări verticale+15 și ajunge la0 în200ms,folosind61mostre ale Ease.easeOut cubic nativ. Dispare după5secunde de la primirea pentru afișare,cu ceas monotonic;un mesaj nou întârziat nu pierde timpul de citire din cauza timestampului serverului. Clickul sau Enter/Space o ascunde doar pentru acel client. Pollingul,redesenarea și schimbarea reduced-motion nu o afișează din nou. Elementele DOM reale și efectele lor sunt păstrate între reconcilierile locurilor,în locul clonării sau reluării animației. Preferința reduced-motion elimină/anulează intrarea, păstrând durata de citire.

Istoricul găsit la prima stare a unei pagini nu este reluat ca bule live; aceasta este o regulă locală de reconectare,nu un protocol de istoric recuperat. O evidență limitată la200mesaje ține începutul și ascunderea fiecărui efect.

ChatBubbleView nativ refuză adăugarea unui ChatBox nou când mute este activ. Local,Helmet suprimă bulele noi și marchează evenimentele ca nerejucabile la dezactivare; o bulă existentă își poate termina durata. Lista de chat este tratată separat de Helmet. Interdicția administrativă de trimitere rămâne cea a backendului existent.

## Verificare

Testul `--helmet --chat-bubble` folosește două conturi în sesiuni separate și verifică text literal,imaginile originale,Arial24,#333,box minim100,ancore proprii/oponent/dreapta la850și1196,același nod după resize,200ms,reduced-motion,click/tastatură,minimum4,5secunde de citire,expirare,scurtare cu`..`,Helmet fără replay și reconectare fără replay de istoric. Un răspuns401 care invalidează sesiunea mesei elimină imediat bulele montate și resetează istoricul efectelor; testul restabilește apoi sesiunea validă fără a modifica backendul. Mâna rămâne identică. Traseul continuă cu o mână reală,payout independent240jetoane și restart.

Testul AoF cu4sesiuni verifică și ancora oglindită(1309,343),178×100,fără modificarea mâinii,apoi rezervări,fold,all-in,payout independent128și restart. Aceste verificări dovedesc comportamentul local și implementarea geometriei din sursă; nu dovedesc întreaga paritate vizuală a aplicației native.
