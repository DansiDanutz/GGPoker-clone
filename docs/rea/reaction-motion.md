# Reacțiile statice ale jucătorului

Analiza urmează fluxul REA, folosind exportul static FFDec26.4.0 al clasei `com.nsus.iron.table.stage.component.player.Emoticon` din clientul instalat. Providerul REA pentru SWF nu este disponibil; exportul nu este execuție nativă observată.

`showEmoticon` selectează imaginea, iar `show` setează scala0,5 și o animă spre1 în0,2secunde cu `Ease.easeOutBack`. Formula nativă folosește constanta1,70158. `Tween.delayedCall(4,hide)` programează dispariția; `hide` anulează tweenurile și elimină extensia. Constructorul activează `isClickHide`; `PlayerExtension` oprește propagarea mouseDown și elimină extensia la click.

Clona aplică aceste valori celor trei reacții statice existente. Animația folosește61mostre ale formulei native, nu o curbă CSS aproximată. O evidență locală limitată la200reacții păstrează începutul și ascunderea voluntară: redesenarea mesei nu reia intrarea sau cele4secunde, iar pollingul nu reafișează o reacție ascunsă. Ascunderea este locală și nu schimbă mesajul serverului sau afișarea altui jucător. Enter/Space permit aceeași operație. Preferința reduced-motion elimină animația și o anulează dacă este activată în timpul redării; durata de afișare rămâne4secunde.

Testul în două sesiuni verifică formula/mijlocul cu depășirea scalei finale, durata200ms, click fără reapariție, izolarea clienților, reduced-motion, expirarea și mâna neschimbată. Același traseu continuă cu testele Helmet, o mână completă, payout independent240jetoane și restart.

Încă neconfirmate: poziționarea finală la fiecare loc, bubble text nativ, emoji animate/GIF și meniul lor, paritatea fizică a temporizării și sunetului. Nu pretindem paritate completă din analiza statică.

## Ancore și dimensiuni native

`PlayerPosition` construiește `EmoticonPosition(0,1)`, cu owner egal poziției jucătorului. Setterul scale transmite scala locului către emoticon. `PlayerExtension.refreshPosition` aplică offsetul înmulțit cu scala și adaugă coordonatele ownerului; inversarea nu schimbă offsetulX zero. `EmoticonImage.alignCenter` mută imaginea la−width/2,−height/2. Cu imaginea200×200, dreptunghiul final are stânga `seatX−100×scale`, sus `seatY−99×scale`, lățime și înălțime `200×scale`.

CSS-ul meselor cu șase locuri și AoF folosește acum aceste formule, în locul plasării locale de7cqw în dreapta avatarului. Testul verifică atât vizualizarea expeditorului cu scala1,1, cât și vizualizarea celuilalt jucător cu scala1, la lățimi850 și1196, transformând geometria înapoi în scena1700unități. Aceasta verifică implementarea formulelor statice recuperate; nu este o comparație fizică nouă cu o fereastră nativă.

Teste generale reparate: primul pas de shuffle după o pauză de peste1500ms este zero prin trunchierea formulei native; testul trimite și pasul imediat următor, verificând că acesta avansează. Testul de practică alege explicit Rebuy pentru stack zero, Ready pentru ceilalți, și verifică exact300+120×număr_rebuy jetoane în mâna următoare. Acestea sunt actualizări de test, fără schimbarea regulilor de finanțare.
