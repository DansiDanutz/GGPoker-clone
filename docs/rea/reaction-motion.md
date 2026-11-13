# Reacțiile statice ale jucătorului

Analiza urmează fluxul REA, folosind exportul static FFDec26.4.0 al clasei `com.nsus.iron.table.stage.component.player.Emoticon` din clientul instalat. Providerul REA pentru SWF nu este disponibil; exportul nu este execuție nativă observată.

`showEmoticon` selectează imaginea, iar `show` setează scala0,5 și o animă spre1 în0,2secunde cu `Ease.easeOutBack`. Formula nativă folosește constanta1,70158. `Tween.delayedCall(4,hide)` programează dispariția; `hide` anulează tweenurile și elimină extensia. Constructorul activează `isClickHide`; `PlayerExtension` oprește propagarea mouseDown și elimină extensia la click.

Clona aplică aceste valori celor trei reacții statice existente. Animația folosește61mostre ale formulei native, nu o curbă CSS aproximată. O evidență locală limitată la200reacții păstrează începutul și ascunderea voluntară: redesenarea mesei nu reia intrarea sau cele4secunde, iar pollingul nu reafișează o reacție ascunsă. Ascunderea este locală și nu schimbă mesajul serverului sau afișarea altui jucător. Enter/Space permit aceeași operație. Preferința reduced-motion elimină animația și o anulează dacă este activată în timpul redării; durata de afișare rămâne4secunde.

Testul în două sesiuni verifică formula/mijlocul cu depășirea scalei finale, durata200ms, click fără reapariție, izolarea clienților, reduced-motion, expirarea și mâna neschimbată. Același traseu continuă cu testele Helmet, o mână completă, payout independent240jetoane și restart.

Încă neconfirmate: poziționarea finală la fiecare loc, bubble text nativ, emoji animate/GIF și meniul lor, paritatea fizică a temporizării și sunetului. Nu pretindem paritate completă din analiza statică.
