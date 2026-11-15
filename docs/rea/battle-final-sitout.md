# Battle Royale: pauza la masa finală — candidat

Stare: modelul și scenariul de browser au trecut; QA exact-head/instalabil și activarea urmează. Serviciul live rămâne PR221 până la release. Surse: battle-final-sitout-source.json, șapte identități AS/SWF. Nu este execuție AIR sau certificare a serverului privat.

## REA și delimitarea fazelor

SetAutoActionFlags are ramura specială Battle numai când entry, rushSession și entry.isBattleRoyale sunt toate prezente. Finala locală este o cameră de turneu separată, cu conturi fixe și stackuri transferate după calificare; nu este pool-ul Rush. TableInfo.isTourney include categoria BattleRoyale, iar GlobalSitoutCommand admite generic turneele în ramura all-games. OnTourneySitOut4038 păstrează indicatorul aplicat separat de statusul de joc și nu repetă o tranziție identică.

Aceste surse susțin folosirea mecanismului de pauză de turneu în finală. Nu susțin eliminarea distincției față de calificarea Rush și nu recuperează politica privată de pauză/timing a fiecărei faze.

## Schimbare în aplicația locală

Sunt eliminate excluderile explicite pentru Battle final din setTournamentPause, capabilitățile publice de control, tranzacția all-games și validarea provenienței private. Se reutilizează aceeași stare dorită/aplicată, fără câmpuri de payout sau bounty noi. validateBattleFinals continuă să ceară legătura finalRoom corectă, participanții calificați fixați și conservarea stackurilor; camere de calificare nu sunt introduse în această rută.

Solicitarea nu schimbă mâna, portofelul sau registrul bounty. Pauza se aplică la următorul deal, cu cărți și blinduri păstrate, Check/Fold automat după500ms și revenire la următorul deal. Aceste momente sunt politicile locale deja documentate pentru turnee, nu temporizare nativă certificată. all-games poate controla finala; cash-only continuă să o excludă. Proveniența dorită rămâne privată; spectatorul vede numai starea aplicată.

Calificarea Rush, admiterea participanților și comenzile acesteia nu sunt modificate. Widgetul cash-global rămâne ascuns în finală; controalele normale ale turneului și Deal Me In sunt reutilizate. Interacțiunile native exacte în timpul scenei bounty și comparația fizică de cadre/sunet rămân în afara dovezilor acestui release.

## Probe de model

battle-final-sitout-test creează12conturi, finanțează explicit14credite bounty și transferă trei supraviețuitori cu stackuri reale din calificare. Verifică auth/corp, mâna/portofelul neschimbate la rezervă, proveniența privată, izolarea cash-only, rollback și restart. Un checkpoint cu proveniență false este respins.

Un jucător intră efectiv în pauză, păstrează cărțile și contribuțiile obligatorii, cere revenire, recuperează după restart și primește cărți la următorul deal. Finala se joacă până la winner, cu1200jetoane,300premii și14bounty plătite o singură dată. Capitalul și calificarea rămân identice în timpul pauzei; portofelele includ separat o masă cash martor cu120jetoane ținute, astfel încât totalul wallet+cash să fie120014. Eșecul unei acțiuni de joc nu dublează plățile.

## Probe de browser

--battle-final --battle-prizes --battle-bounties --battle-pause folosește șase contexte autentificate și trei finaliști. Pointerul real rezervă/anulează all-games și apoi pauza curentă, fără schimbarea mâinii sau a portofelului. Verifică efectul la mâna următoare, restartul serverului, Deal Me In și revenirea. Primele două payouturi sunt verificate independent înaintea continuării turneului.

Scenariul existent continuă prin controalele reale până la winner:600jetoane,150credite de premii și14bounty, toate cele șase portofele și restart fără plăți repetate. Ownerul configurează politica70/30 și inventarul11+3 prin formularul existent, inclusiv respingerea intrărilor invalide. Un neparticipant deschide istoricul public al bounty-ului prin pointer și verifică datele reale, fără mutații în cameră sau portofel.

Nu declarăm pauza în calificare, next-blind, politici private de operator ori paritatea fizică pixeli/animații/audio drept finalizate. Obiectivul integral al aplicației rămâne deschis.
