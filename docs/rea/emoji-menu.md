# Emoticoane standard — traseu REA și implementare locală

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

Nu sunt terminate categoriile Dneg1000, Greg4000 și avatar10000, animațiile lor MovieClip, bula de text asociată emoticonului și întregul chrome al ferestrei de chat. Nu sunt declarate echivalență pixel-perfect, timing nativ sau sunet verificat fizic.
