# Auto Fold — limbă fără pierderea draftului

AutoFoldContents leagă titlul de AutoFoldHandcart, excluderile de DoNotAutoFoldButton/DoNotAutoFoldSbBb, limitele de LabelMin/LabelMax și switchurile de TableOptionAnimationOn/Off. GlobalButton folosește ButtonApply/ButtonCancel. NewGameInfoType/Data fixează MobildAutoFold și cele patru explicații AutoFoldRange/Settings/DependingOn/CashDrop. Cele cinci surse și14chei sunt în auto-fold-language-source.json. Nu sunt traduceri deduse din textul englez.

## Integrare

Editorul folosește loaderul comun de cataloage și noduri explicite data-native-label. Codurile169mâini, procentul, selecția, stările booleene, contul și lease-ul mâinii nu sunt reconstruite sau traduse. Schimbarea limbii nu aplică setările și nu execută un fold. Cancel continuă să abandoneze draftul, iar Apply păstrează validarea/stocarea existentă.

Titlul, controalele de poziție și switchul activ au legături accesibile prin aria-labelledby către etichetele traduse. Starea switchului schimbă cheia și fallbackul explicit numai când se schimbă On/Off; pollingul nu rescrie textul tradus sau procentul identic. Mesajele locale de eroare și intrarea locală între mese rămân în engleză, fără chei native inventate.

## Layout recuperat

Sursa înregistrează Language.onChange(setLayout) și poziționează Info la title.x+title.width+10. Local Info urmărește48+title.width+10 după traducere și resize. Excluderile au530px cu autoScale; switchurile40px la24px; etichetele GlobalButton au264−4=260px la38px. Textele lungi sunt micșorate în aceste limite, păstrând aceeași geometrie a controalelor. Nu este pretinsă identitatea algoritmului de rasterizare/fitting AIR.

Loaderul apelează numai relayoutul editorului după actualizarea catalogului; nu reconstruiește dialogul și nu reîncarcă preferințele peste un draft. Butonul Info rămâne separat de activare. Textele native sunt aplicate ca textContent; niciuna dintre cele14chei din cele28cataloage instalate nu necesită interpretare HTML.

## Verificare

Testul a eșuat înaintea implementării fiindcă titlul rămânea în engleză. Fluxul real cu ferestre separate schimbă EN→FR→RO→EN într-o matrice deja modificată. Verifică selecția/procentul/starea/mâna identice, celula și focusul păstrate, Apply/Cancel/On/Off și explicațiile native, activarea/dezactivarea excluderii, încadrarea textelor și ancora Info. Pollingul produce zero modificări text în editor. Cancel nu scrie preferința.

Același fixture continuă cu stocare eșuată/retry, fold întârziat autentificat, payout independent1200chips și restart. Sunt reutilizate fonturile, arta și controllerul. Rămân neverificate metricile fizice AIR, toate fonturile asiatice și traducerea integrală a aplicației.
