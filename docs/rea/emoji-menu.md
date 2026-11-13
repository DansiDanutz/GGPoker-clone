# Emoticoane Standard/Dneg/Greg — traseu REA și implementare locală

## Dovezi și limite

Analiza folosește export static FFDec al IronDesktop.swf, nu execuție nativă REA. Clasele urmărite sunt TableEmoticonList, EmoticonItem, EmoticonItemData, EmoticonManager, StringTable, ChatSender, TableChat și TableChatWindowMediator. Imaginile provin din resursele instalate ale aplicației; copiile și exporturile brute rămân locale, ignorate de Git.

TableEmoticonList.setEmoticon parcurge30poziții, omite indicii27și28 și produce ID1…27și30. EmoticonItem solicită StageAssets.getEmoticon(idx−1): miniaturile sunt cadrele55×55 emoticonNNNN din atlasul desktop_table_assets. Imaginile de masă provin din assets/emoticon/ID.png,200×200. Extractorul tools/extract-emoticons.py verifică egalitatea fișierelor întregi și a pixelilor RGBA pentru decupaje; manifestul local home-art/rea/native-emoticon-art.json înregistrează proveniența și hashurile pentru28imagini,28miniaturi și8controale.

StringTable definește MOBILE_BUBBLE1…27; etichetele englezești sunt preluate exact din string_table.json. Aliasul MOBILE_BUBBLE30 nu apare în clasa exportată. Deși dicționarul conține MobileBubble30=Phew, legătura nu este demonstrată: eticheta vizibilă30 rămâne goală, cu nume accesibil Emoticon30.

## Aspect verificat

Viewportul inițial este296×510, fundal#0b0c0d/0,9 și contur sus/dreapta1px#2d2d2d. Numărul coloanelor este partea întreagă din lățime/66; la296 sunt4coloane și7rânduri. Butonul are54×62, pas66, imagine46×46; eticheta este la−7,46 cu60×18,12px,#999, autoScale. Alpha este0,8 implicit și1 la hover. Conținutul458 plus footer50 produce508px; înălțimea este limitată de spațiul ferestrei. Categoria standard folosește table_menu0173,40×40, x12, footer−48.

ChatSender stabilește composer72px, input x12/y8/height26,14px,_sans,max100caractere, ghid Message. Emoji x12/y45,24×24, cadre415–417; Send x(width−56)/y43,46×24, cadre421–424 pentru disabled/normal/over/down. Aceste dimensiuni sunt verificate în browserul headless; echivalența fonturilor și antialiasingul fizic nu sunt dovedite.

## Funcționare și backend local

Selecția nativă emite RECOMMAND_EMOTICON_SELECT cu index/avatarName; TableChat resetează composerul, iar mediatorul trimite SEND_BUBBLE_MESSAGE cu emoticonIdx pentru masa normală. Protocolul local folosește câmpul distinct emoticon cu aceleași ID-uri; nu pretindem că reproduce protocolul operatorului.

rooms.mjs validează strict ID, câmpurile permise și versiunea, aplică limita comună de trimitere, Helmet și mute administrativ. Reacțiile locale vechi reaction1…3 rămân compatibile, fără rescrierea jurnalelor. Mesajele native nu dublează bula text și nu modifică mâna sau portofelul. Istoricul păstrează tipul și ordinea, inclusiv evenimentele sosite după decontare. Reîncărcarea nu repetă efectele istorice.

Pickerul golește draftul la selecție; la eșec îl restaurează dacă utilizatorul nu a introdus alt text. Eșecul lasă lista deschisă și cere verificarea chatului înainte de retry; nu retrimite automat. Escape închide lista și restabilește focusul. Serverele vechi care nu servesc modulul opțional păstrează cele3controale legacy.

## Verificări și lucru rămas

native-emoticon-test.mjs verifică28ID-uri, etichetele, payloadurile invalide/amestecate, limita comună, mute/Helmet, rollback atomic, restart, istoric și conservarea240jetoane. network-browser-test.mjs --helmet --native-emoticon folosește click real în popup, verifică geometria, eroare/retry, ID30 fără etichetă inventată, lipsa replayului, istoricul nativ și mâna completă cu restart.

Categoriile Standard/Dneg/Greg sunt implementate local. Rămân avatar10000, încărcarea seturilor dinamice și întregul chrome al ferestrei de chat. Nu sunt declarate echivalență pixel-perfect, timing nativ sau sunet verificat fizic.

## Bula asociată emoticonului standard

Clasa privată EmoticonChatBox este definită la sfârșitul Emoticon.as, nu într-un fișier separat. Extinde ChatBox și suprascrie show/hide exclusiv cu visible=true/false: nu execută tweenul vertical200ms și durata5secunde a mesajului text normal. Este copil al Emoticon, după imagine, și dispare împreună cu extensia la4secunde sau click. Numai imaginea are animația0,5→1; bula nu se mărește odată cu ea.

Emoticon.showEmoticon traduce MOBILE_BUBBLE+indice și cheamă setMessage/show. Constructorul setează AUTO_CHANGE și useStringTable=true. UniqueLabel alege pentru text latin fontul implicit Roboto Condensed: InitFont.defaultFont și LabelModel.useRoboto=false, fără resetLabelFormat20 în acest traseu. Reutilizăm fontul original deja extras NativeActionRoboto,24px,#333. Grafica rămâne player_cell0023 originală, alpha0,7, cu umbra0024 și slice9 identic ChatBox. Nu există setColor în traseul emoticonului; colorarea aurie a chatului propriu nu i se aplică.

PlayerPosition.emoticon este(0,1), scala locului; EmoticonPosition.chat are scala implicită1 și nu primește owner. Bula este deci în coordonatele locale ale emoticonului, apoi întregul ansamblu este scalat cu scala locului. Preseturile pentru6locuri sunt(26,−187),(58,−142),(64,−95),(70,−81),oglindit(−64,−95),(−58,−142). AoF folosește pozițiile0,1,3,5 ale aceleiași liste. În dreapta, corpul și umbra sunt oglindite, textul rămâne lizibil. Originea scenei este seat+(0,1)×scale; ancora bulei este apoi adăugată și scalată, cu178unități scăzute dinx la oglindire. Înălțimea urmează max(100,textHeight+34), y local crește cu100−height.

Implementarea păstrează imaginea și bula ca noduri distincte ale aceluiași efect, evitând reluarea animației la reconcilierea locului. Click/Enter/Space pe oricare le ascunde pe ambele doar local; pollingul nu le reafișează. Nu schimbă jurnalul, mâna sau payoutul. ID30 nu primește o etichetă inventată și nu reutilizează bula mesajului anterior; aspectul exact al aliasului absent rămâne necunoscut.

Fixture-ul native-emoticon verifică ancorele proprii/oponent, scala1/1,1 la850și1196, oglindirea la dreapta, grafică originală, lipsa tweenului pe bulă, nod stabil, ascundere locală cuplată, expirare și lipsa replayului la reconectare. Testul continuă cu o mână completă240jetoane și restart. Acestea verifică implementarea formulelor recuperate, nu un nou capture fizic nativ sau echivalența antialiasingului.

## Dneg și Greg — timeline-uri recuperate

TableEmoticonList oferă filtre0/1000/4000. Fiecare produce28ID-uri:base+1…27 și base+30. Cele84de controale și etichetele sunt enumerate în [catalog](emoticon-catalog.md). Iconurile de categorie sunt table_menu0173/0175/0382,40×40, la x12/61/110. Categoria selectată este activă/dezactivată pentru click; celelalte folosesc matricea nativă cu fiecare coeficient RGB=1/6 și alpha neschimbat, nu filtrul CSS grayscale standard. Preferința locală este izolată după cont și păstrată la reîncărcarea chatului; conturile anonime nu scriu o preferință globală.

showEmoticon păstrează ID1000/4000 și apelează AnimateButton.setImage(100+ID−1). onLoadAnimation alege dneg_emoticon/dneg_ sau greg_emoticon/greg_. Clasele publicate sunt dneg_1100…1129 și greg_4100…4129; selecția exclude1127/1128 și4127/4128. Cele60de clase exportate au doar constructorul super(), fără addFrameScript/enterFrame/gotoAnd/stop/play. Numele simbolurilor provin din SymbolClass, nu din ordinea fișierelor.

SWF-ul principal are60fps, iar pachetele au30fps. AnimateButton avansează explicit cu0,5 la enterFrame și cheamă gotoAndStop; cronologia locală folosește pași60Hz, nu rata monitorului. Păstrează faza celulei între reacții, reia la1 după depășirea totalFrames și nu aplică tweenul imaginii statice. Evenimentul enterFrame are loc o dată pe cadru conform [documentației AIR](https://airsdk.dev/docs/development/display/working-with-movie-clips/controlling-movie-clip-playback). Un caz rămâne nedemonstrat fizic: expresia nativă poate produce gotoAndStop(0); local îl limităm la primul cadru și marcăm explicit această limită în cod. Nu pretindem timing1-la-1 la această graniță.

Sunt56de timeline-uri selectate:28Dneg×30cadre și28Greg×45cadre, total2100. FFDec exportă APNG-uri cu decupajul comun al fiecărui sprite. Prima transformare SVG păstrează originea inițială; de exemplu Dneg1001 are origine(18,55;3,55),186×198, Greg4001 are(27,1;4,6),143×189. Redarea locală adaugă originea la containerul nativ(−100,−100), aplicând scala locului și offsetul vertical1. Astfel nu întinde forțat fiecare decupaj la200×200.

Extractorul tools/extract-animated-emoticons.py împachetează cadrele în56foi WebP lossless,58.797.590octeți. Re-decodează fiecare foaie și verifică întregul RGBA, inclusiv culorile invizibile, față de cadrele FFDec. Manifestul local păstrează hashuri sursă, cadre, simboluri, geometrie și foi. Extractorul pentru imagini statice produce acum84PNG-uri200×200,84miniaturi și10controale,4.925.362octeți. Resursele brute rămân ignorate de Git; codul, metadatele geometrice și extractoarele sunt publicate.

Verificarea browserului compară toate valorile alpha și RGB ale pixelilor opaci cu referința recuperată. Nu cere egalitate numerică a RGB translucide după trecerea prin Canvas2D: conversia alpha premultiplicată este cu pierderi conform [standardului HTML](https://html.spec.whatwg.org/multipage/canvas.html). Verificarea completă a fișierelor RGBA rămâne separată și strictă. Nu schimbăm imaginile pentru a adapta testul la rotunjirea Canvas.

Testul în două conturi verifică schimbarea reală a categoriilor,28elemente/categorie, iconurile40px, originile și dimensiunile, progresia30/45cadre, lipsa intrării statice, DOM păstrat la resize, reduced-motion și expirare. Preferințele se păstrează la reload și nu trec între conturi. Evenimentul animat în timpul mâinii este verificat în istoricul complet după payout/restart, inclusiv atunci când rezultatul este remiză și nu apare în coloanele Best/Worst ale HUD. Limite: paritatea randării native AIR/AA/timingului fizic, frame0 și seturile avatar nu sunt demonstrate.

Contractul categoriei dinamice Avatar, recuperat separat din manager/set și ramura GIF, este documentat în [avatar-emoji.md](avatar-emoji.md). Categoria rămâne neimplementată; lipsa fișierelor în Game/assets nu demonstrează lipsa lor în toate cacheurile sau pe CDN.
