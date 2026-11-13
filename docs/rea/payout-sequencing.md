# Payout și trecerea la mâna următoare

## Dovadă REA

Analiza folosește corpusul static FFDec păstrat local; nu afirmă observarea execuției AIR. OnWinners.onDispatch pune procesorul pe pauză înainte de showWinners și îl reia din callbackul final. TableAnimator.showWinners afișează WIN, apoi apelează movePot după1,5s (zero în catch-up). movePotToWinners avansează poturile prin callbackuri succesive. MotionView3D.potMoveToWinners creditează balanța vizuală doar după încheierea mișcării și eliminarea obiectului.

O mișcare nativă are două segmente de0,4×speedRatio, cu așteptare intermediară max(delay−2×duration,0,1). Delay-ul obișnuit vine din mesajul NotifyTableWinnersParameter.Delay. Valorile speciale Bomb Pot/RIMT nu stabilesc valoarea obișnuită Hold’em. Nu am înlocuit delay-ul local cu un număr ales din aceste excepții. Recuperarea configurației complete de timp rămâne deschisă.

## Defectul reprodus

Serverul local pornește următoarea mână de turneu după3s. Payoutul vizual existent poate dura4s plus runout. Testul RED, în trei browsere autentificate, a observat cheia de acțiuni0:2:0:2 în timp ce un element award al mâinii anterioare era încă prezent. Aceasta dovedește suprapunerea locală; verificările sumei din backend nu o puteau detecta.

## Corecția

În același room, pentru aceeași identitate de loc și aceeași listă de ocupanți, clientul păstrează cel mai recent snapshot al unei mâini ulterioare până se termină toate awardurile. Callbackul ultimului payout aplică snapshotul și construiește noile controale. Snapshoturile vechi ale mâinii deja afișate nu înlocuiesc snapshotul nou aflat în așteptare. Se păstrează un singur snapshot, nu un jurnal nelimitat și nu un timer suplimentar.

Reducerea mișcării încheie payouturile și permite continuarea. Pierderea sesiunii, părăsirea locului sau schimbarea ocupanților abandonează snapshotul și elimină awardurile vechi fără callbackuri de creditare. Reloadul citește starea actuală și nu reconstruiește payoutul trecut. Chatul separat și Rush au cicluri distincte și nu folosesc această amânare de room. Serverul, ceasurile de acțiune, calculul payoutului și portofelele nu sunt modificate.

## Verificare

Fixture-ul de turneu urmărește la20ms orice combinație dintre o nouă cheie de acțiuni (inclusiv waiting pentru un eliminat) și awarduri încă prezente. Toate tranzițiile trebuie să aibă zero suprapuneri. Testul continuă să calculeze independent payouturile, să verifice conservarea fiselor și să joace prin interfață până la winner, cu portofele și restart. Verificările suplimentare urmăresc răspunsul real de polling cu mâna nouă și awardul vechi, schimbarea reduced-motion și un răspuns401 injectat exclusiv în pollingul clientului temporar. După401, locul privat și awardurile dispar, iar snapshotul nu reapare după4,5s. Tokenul valid al fixture-ului este restaurat numai în sessionStorage, urmat de reload; nu este revocată sesiunea backend și nu este modificat jocul. Reloadul face catch-up fără replay.

## Limite

Această corecție stabilește ordinea vizuală a mâinilor; nu dovedește identitatea tuturor duratelor cu aplicația originală. Ceasul serverului continuă în timpul prezentării: un client întârziat face catch-up pe ultimul snapshot, fără să suspende ceilalți jucători. Native speedRatio, Delay obișnuit, poturi multiple secvențiale și comparația fizică cu AIR rămân de verificat. Nu declarăm întregul showdown1:1.
