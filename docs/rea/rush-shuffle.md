# Chip Shuffle în Rush

Rândul nativ TableEtcMenu3D include Chip Shuffle înainte de Auto Fold. TableMenu3D nu exclude Rush din ramura Shuffle a jucătorului așezat: vizibilitatea depinde de isUserPlaying, !isCatchUp și preferința Chip Shuffle, cu excluderile Avatar Race/Roshambo. Sursele și iconurile419/420 sunt deja identificate în table-controls-source.json. Nu este introdus un nou set de animații sau sunete.

## Interfață

Hold’em și PLO Rush reutilizează controlul Shuffle62×62, atlasul animat și cue-urile existente. Shuffle ocupă x29/(height−90); Auto Fold Hold’em trece la x99. Oprirea preferinței ascunde Shuffle și mută imediat Auto Fold la29; reacțiile celorlalți rămân independente de preferința proprie. Battle și ferestrele chat-only nu primesc această integrare.

Schimbarea mesei Rush oprește animația proprie și cele remote, golește indexul evenimentelor văzute și inițializează noua masă fără reluarea primei stări. Identitatea efectului este legată de masa reală, nu doar de numărul scaunului sau de numele repetat. Reconectarea nu relansează o animație din snapshot.

## Transport local

POST /api/rush/{holdem|plo}/shuffle folosește autentificarea cookie și verificarea originii existente. Câmpul table este întregul pozitiv al mesei fizice. Serviciul refuză botul, contul neînscris/plecat, masa veche, câmpurile suplimentare și versiunile/tipurile invalide. Identitatea opțională din frontend este verificată și eliminată de server înainte de serviciu. O comandă în așteptare nu urmează jucătorul într-o altă masă.

Evenimentul este temporar: {seat,at} în vederea participanților aceleiași mese, vizibil2450ms; pauza dintre porniri este3000ms, după politica locală Shuffle existentă. Maparea internă pe cont este limitată de capacitatea de100înregistrări a poolului. Nu se publică identificatorul contului în eveniment. Nu se modifică versiunea jocului, cărțile, istoricul, soldurile sau fișierele persistente. Evenimentele sunt ținute în memorie și dispar la restart; nu necesită tranzacție de portofel. Frontendul urmărește separat schimbarea listei de efecte, fără a depinde de o acțiune de joc sau de creșterea versiunii mâinii.

Acesta este protocol local independent, nu protocolul privat al operatorului. Expirarea și rate limitul sunt ale implementării locale; nu sunt declarate temporizare de rețea nativă recuperată.

## Verificare

Testele model/API acoperă ambele formate: payload strict, cont/loc real, comandă veche, cooldown/expirare, recepție de către colegul de masă, conservarea mâinii/versiunii/fișierelor, restart fără replay și rematch izolat. Testul browser Rush folosește pointer real la două dimensiuni, efect propriu și remote în contexte separate, dezactivare/reactivare, deplasarea Auto Fold și reload fără replay. Continuă cu fold automat real, payout independent1200chips și restart.

Fixtureul așteaptă acum un control Shuffle vizibil în fiecare browser implicat: șase noduri de scaun pot exista și înaintea primirii mesei și nu dovedesc sincronizarea. Suprimarea efectelor din prima stare rămâne activă. Nu au fost adăugate resurse grafice sau dependențe. Compoziția fizică AIR și temporizarea difuzoarelor rămân neverificate.
