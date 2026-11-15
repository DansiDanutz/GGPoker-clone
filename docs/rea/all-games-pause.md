# Comenzi globale pentru toate jocurile — candidat backend

Stare: modelul și HTTP sunt implementate și testate în branchul candidat; UI și pachetul instalabil nu sunt încă validate. Serviciul live rămâne PR219. Nu prezentăm ruta nouă drept funcționalitate disponibilă în meniul live.

## Contract nativ REA

Cele nouă identități de artefacte sunt în all-games-pause-source.json. SelectSitoutMenuCommand separă isAll/isGlobalAutoAction de isGlobal cash. GlobalSitoutCommand permite turnee/Spin în ramura all-games, dar le exclude în ramura cash. GlobalSitInCommand păstrează aceeași distincție și excluderile sale. GlobalSitoutManager preferă rezerva per-masă celei all-tables; revenirea globală golește rezervele. Acest contract static nu certifică execuția AIR, temporizarea serverului sau moștenirea pe mese viitoare.

## Implementarea locală

Modelul comun accountPause actualizează camerele cash suportate, turneele/Spin/MTT eligibile și intrările Rush Hold’em/PLO existente într-un singur checkpoint. pauseCash/resumeCash păstrează domeniul cash; pauseAll/resumeAll folosesc domeniul all-games. Identitatea este comparată fără diferență de majuscule pentru a include MTT, unde conturile sunt normalizate. Nu se folosesc nickname-uri de spectator și nu se creează sesiuni noi.

sitOutAllGames este un indicator privat de proveniență pentru alegerea globală. Nu este confundat cu sitOutAllCash. Alegerea locală curentă sau alegerea globală cash șterge indicatorul all-games numai în sesiunile afectate. Câmpurile sunt validate la restaurare; spectatorul nu primește preferința privată. Preferința se mută împreună cu identitatea MTT prin mecanismul deja testat de pauză individuală.

Pauza nu execută o acțiune de joc, nu schimbă cărțile, nu oprește ceasul administrativ și nu debitează portofelul. Revenirea cash cu fonduri insuficiente păstrează pauza și raportează cerința de finanțare; nu cumpără automat jetoane. Turneele păstrează blindurile și mecanismul de Check/Fold local din PR219. Nu se schimbă regulile de payout. Un eșec de salvare restaurează toate camerele și ambele pool-uri Rush. Modelele Rush sunt reîncărcate de handler numai după commitul reușit.

Rutele POST /local/all-games-sit-out și /local/all-games-sit-in cer sesiune locală, Origin exact, Content-Type JSON, corp de maximum512bytes și contul autentificat exact. Nu acceptă room/seat/alte câmpuri sau selecția contului altui jucător. GET este405. Routerul reutilizează aceeași validare strictă precum ruta cash.

## Dovezi observate

all-games-pause-test.mjs pune în pauză atomic șase sesiuni: cash, turneu, Spin, MTT și două formate Rush. Verifică mâinile/portofelul identice, idempotence, eșec de scriere, restart, preferințe private, contul MTT normalizat, anularea locală independentă, domeniul cash separat și faptul că o sesiune nouă nu moștenește comanda. Câmpuri corupte sunt respinse. Testul a reprodus și reparat eliminarea incompletă a indicatorului all-games la override Rush.

all-games-pause-http-test.mjs folosește server temporar și cookie-uri separate: method/Origin/identitate/body bounds, salvare eșuată și retry, mâna curentă și portofelul identice, restart de proces și revenire numai cash care lasă turneul în pauză.

## Ce mai trebuie înainte de release

Meniul trebuie să trimită all-games folosind cheile native, fără să redea o alegere cash ca all-games. Setarea/hotkey-ul cash existent trebuie păstrate separat; Deal Me In trebuie conectat la domeniul nativ all-games pentru conturile autentificate. Sunt necesare browser mixt cash+turneu+Rush, controale reale de pointer și tastatură, retry503, restart, payout după revenire și repetarea scenariilor pe pachetul instalabil. QA exact-head, merge și activare nu au avut loc pentru acest candidat.

Battle final, next-blind, politica serverului pentru sesiuni viitoare și comparația fizică de pixeli/audio rămân neimplementate sau neverificate. Acest backend este o etapă a obiectivului integral, nu un substitut pentru paritatea1-la-1.
