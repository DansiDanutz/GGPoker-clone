# Comenzi globale pentru toate jocurile — candidat de release

Stare: modelul, HTTP și UI sunt implementate și testate pe sursă; QA exact-head și pachetul instalabil urmează înainte de release. Serviciul live rămâne PR219. Nu prezentăm ruta nouă drept funcționalitate disponibilă în meniul live.

## Contract nativ REA

Cele13identități de artefacte native/derivate sunt în all-games-pause-source.json. SelectSitoutMenuCommand separă isAll/isGlobalAutoAction de isGlobal cash. GlobalSitoutCommand permite turnee/Spin în ramura all-games, dar le exclude în ramura cash. GlobalSitInCommand păstrează aceeași distincție și excluderile sale. GlobalSitoutManager preferă rezerva per-masă celei all-tables; revenirea globală golește rezervele. Acest contract static nu certifică execuția AIR, temporizarea serverului sau moștenirea pe mese viitoare.

## Implementarea locală

Modelul comun accountPause actualizează camerele cash suportate, turneele/Spin/MTT eligibile și intrările Rush Hold’em/PLO existente într-un singur checkpoint. pauseCash/resumeCash păstrează domeniul cash; pauseAll/resumeAll folosesc domeniul all-games. Identitatea este comparată fără diferență de majuscule pentru a include MTT, unde conturile sunt normalizate. Nu se folosesc nickname-uri de spectator și nu se creează sesiuni noi.

sitOutAllGames este un indicator privat de proveniență pentru alegerea globală. Nu este confundat cu sitOutAllCash. Alegerea locală curentă sau alegerea globală cash șterge indicatorul all-games numai în sesiunile afectate. Câmpurile sunt validate la restaurare; spectatorul nu primește preferința privată. Preferința se mută împreună cu identitatea MTT prin mecanismul deja testat de pauză individuală.

Pauza nu execută o acțiune de joc, nu schimbă cărțile, nu oprește ceasul administrativ și nu debitează portofelul. Revenirea cash cu fonduri insuficiente păstrează pauza și raportează cerința de finanțare; nu cumpără automat jetoane. Turneele păstrează blindurile și mecanismul de Check/Fold local din PR219. Nu se schimbă regulile de payout. Un eșec de salvare restaurează toate camerele și ambele pool-uri Rush. Modelele Rush sunt reîncărcate de handler numai după commitul reușit.

Rutele POST /local/all-games-sit-out și /local/all-games-sit-in cer sesiune locală, Origin exact, Content-Type JSON, corp de maximum512bytes și contul autentificat exact. Nu acceptă room/seat/alte câmpuri sau selecția contului altui jucător. GET este405. Routerul reutilizează aceeași validare strictă precum ruta cash.

## Dovezi observate

all-games-pause-test.mjs pune în pauză atomic șase sesiuni: cash, turneu, Spin, MTT și două formate Rush. Verifică mâinile/portofelul identice, idempotence, eșec de scriere, restart, preferințe private, contul MTT normalizat, anularea locală independentă, domeniul cash separat și faptul că o sesiune nouă nu moștenește comanda. Câmpuri corupte sunt respinse. Testul a reprodus și reparat eliminarea incompletă a indicatorului all-games la override Rush.

all-games-pause-http-test.mjs folosește server temporar și cookie-uri separate: method/Origin/identitate/body bounds, salvare eșuată și retry, mâna curentă și portofelul identice, restart de proces și revenire numai cash care lasă turneul în pauză.

## Interfață și verificări de browser

Headerul folosește cheile originale SitOutAllNow și SitOutAllTableNB în cash și turnee; turneul păstrează trei rânduri560×224, cash patru560×288. allTables din modelul meniului este alimentat numai de sitOutAllGames, nu de sitOutAllCash. Alegerea globală doar cash apare drept selecție curentă în header, conform flagului isGlobalAutoAction separat din client; nu este etichetată ca all-games.

Setările păstrează separat butonul cash și adaugă butonul pentru toate jocurile; textele de revenire sunt copy local explicit, nu o captură certificată a panoului nativ. Acțiunea configurabilă sitOutAllGames este în categoria functions, fără combinație implicită locală; aceasta nu afirmă o valoare implicită recuperată din aplicația originală. sitOutAllCash și bindingurile existente sunt păstrate. Deal Me In autentificat trimite all-games return; un guest trimite numai revenirea proprie pe masă. Cerințele de finanțare cash/Rush și erorile sunt păstrate; nu se cumpără automat jetoane.

Scenariul --all-games-pause folosește trei contexte izolate și patru sesiuni ale aceluiași cont: cash, turneu și Rush Hold’em/PLO. Pointerul real și hotkey-ul H configurat verifică ambele scope-uri, checkboxurile corecte, blocarea categoriei functions, retry503, mâinile și portofelul identice la solicitare, restartul serverului, Deal Me In pe toate jocurile și un payout cash independent cu360jetoane. Testul a detectat că deschiderea setărilor înainte ca operația precedentă să elibereze controlul era anulată de închiderea programată; așteaptă acum butonul reactivat, deschide panoul și verifică hit-testul real înainte de click. Nu se înlocuiește pointerul cu apel direct al handlerului.

Scenariul cash/Rush existent a fost actualizat să verifice domeniul all-games al headerului și al Deal Me In. Hotkey-ul cash G rămâne verificat separat și se anulează prin controlul cash, fără a folosi o alegere all-games drept alias.

QA exact-head, pachetul instalabil, merge și activare sunt încă necesare pentru candidat. Battle final, next-blind, politica serverului pentru sesiuni viitoare și comparația fizică de pixeli/audio rămân neimplementate sau neverificate. Acest release intermediar nu substituie obiectivul integral1-la-1.

Testul de formate --all-games verifică separat Spin3/6 până la winner și MTT7 cu mutări între mese: proveniența globală rămâne legată de cont, se șterge la revenirea locală și nu modifică plățile sau conservarea fondurilor.

Revizia instalabilă a candidatului c905cd8 a reprodus ștergerea mesajului503 de către operate(state), confirmată și pe sursă de aserția care așteaptă1100ms. Corecția păstrează erorile acțiunilor la refresh automat; următoarea acțiune reușită le șterge explicit. Testul verifică atât persistența peste poll-uri, cât și curățarea după retry reușit. Prima serie QA este istorică și trebuie repetată pe commitul reparat.

Follow-up candidat: Battle finale este admis separat prin mecanismul de turneu validat; calificarea Rush rămâne exclusă. Vezi [dovezi și teste](battle-final-sitout.md). Notele anterioare privind excluderea finalei sunt istorice după activarea acestui follow-up; nu anticipăm release-ul.
