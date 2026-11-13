# Turnee locale — înscriere, rambursare și premii în portofel

Aceasta este integrarea backendului independent, cu bani de joc. Nu reprezintă recuperarea taxelor, contabilității sau adminului privat GGPoker. Valoarea de25 pe înscriere și fondul de premii existau deja în modelul turneelor locale; acum sunt conectate la portofelul contului. Configurația nativă lipsă pentru Spin nu este completată sau ocolită prin această integrare.

## Separarea celor două solduri

Entry-ul local este25 de jetoane din portofel. Stackul de joc al turneului este separat: de exemplu trei stackuri de100 înseamnă300 de fise la masă, dar fondul de premii este75. Nu se creditează portofelul după fiecare pot. Doar rezultatul final al turneului produce premiile bănești locale.

Pentru trei conturi cu grant inițial10000, înscrierea lasă9975 fiecăruia. La final, suma premiilor este75; cu participanți umani finanțați integral, suma soldurilor lor revine la30000. Împărțirile personalizate folosesc funcția existentă prizeAmounts și clasamentul existent, nu o nouă rotunjire făcută în browser.

## Autoritate și înscriere

Numai o înscriere nouă, autentificată și găzduită debitează portofelul. Serverul stabilește contul din sesiunea locală; un nume ori un cont trimis în JSON nu poate selecta portofelul altcuiva. Fluxul useProfile cere autentificare și păstrează protecțiile Origin existente. Debitul este făcut după validarea locului și a stării înscrierilor, în aceeași tranzacție cu ocuparea locului.

Recuperarea propriului loc rotește credentialul conform fluxului existent și nu debitează din nou. Fondurile insuficiente resping înscrierea fără loc nou sau modificare de sold. În API-ul propriei sesiuni, tournamentEntryPaid spune dacă acel entry este finanțat; spectatorii nu primesc acest câmp. Textul mesei distinge intrarea plătită de o intrare de practică fără transfer.

## Retragere, anulare și rezultat

Retragerea înaintea închiderii înscrierilor rambursează25 și eliberează locul atomic. Refolosirea tokenului retras este respinsă și nu produce o a doua rambursare. Regula existentă interzice retragerea în timpul turneului.

Dacă un turneu programat nu are suficienți participanți, cancelarea și rambursările intră în același checkpoint. La winner, premiul fiecărui entry finanțat se adaugă în contul său, iar markerul de decontare este salvat împreună cu rezultatul și soldurile. Un premiu zero nu creează o mișcare artificială. Citirea stării, tickurile și restartul nu repetă plata.

## Intrări vechi, invitați și computere

Entry-urile gratuite existente nu sunt taxate retroactiv și nu primesc o rambursare sau un premiu de portofel pentru o taxă nedebitată. Ele păstrează rezultatele de practică ale modelului vechi. Aceasta protejează datele existente; nu este o migrare ascunsă de solduri.

Invitații fără cont și computerele rămân participanți de practică. Contribuțiile lor nominale de25 sunt sponsorizare virtuală în modelul local. Nu se creează portofele pentru computere și nu se atribuie banii altui cont după numele afișat. Un cont care și-a finanțat entry-ul poate câștiga fondul de practică astfel sponsorizat; această situație nu are aceeași invariantă de sumă a portofelelor ca un eveniment finanțat numai de oameni. Nu sunt bani reali ori fonduri ale operatorului.

## Persistență și validare

Starea mâinii, clasamentul, markerul de decontare și portofelele sunt în același rooms.json. Scrierea temporară și rename-ul existent publică întregul checkpoint. O eroare de validare sau de scriere anulează modificările financiare și de joc neconfirmate; următorul retry pornește din starea anterioară.

Checkpointurile cu entry finanțat cer cont existent, turneu găzduit și participant uman. Fondul trebuie să corespundă înscrierilor. Premiile trebuie să corespundă clasamentului, structurii și sumei fondului; rambursările trebuie să corespundă participanților. Markere false/incoerente sunt refuzate. Dezactivarea modului wallet blochează evoluția unui turneu finanțat nedecontat, în loc să piardă plata. Backup/restore păstrează rezultatul și portofelul ca aceeași versiune, fără repetarea premiilor.

## Interfața portofelului

Transaction History și My Wallet afișează Tournament entry cu semn negativ, Tournament refund și Tournament prize cu semn pozitiv. Rândurile indică Hosted tournament. Soldul, spent și returned folosesc agregatele portofelului existent; nu adună separat rezultatele de la masă. Sunt chitanțe locale independente, nu o copie verificată a ferestrei Cashier native.

## Dovezi și limite

tournament-wallet-test.mjs verifică debitare/recuperare/retragere, fonduri insuficiente, scriere eșuată inclusiv la mâna care decide premiile, anulare și rambursare, un turneu de trei conturi, distribuție personalizată, conservarea300/30000, idempotence la restart, sponsorizarea computerelor, compatibilitatea gratuită, mod wallet oprit, checkpointuri invalide, rollback al primelor două credite dacă al treilea premiu depășește limita numerică, versiunea confirmată a decontării și backup/restore.

tournament-wallet-http-test.mjs verifică autentificare/Origin, identitatea stabilită de server, debitare unică, rollback la retragere, rambursare, chitanțe private și restart. network-browser-test.mjs --tournament --event-seats=3 folosește sesiuni separate și controalele reale până la winner; verifică portofelele tuturor, istoricul efectiv al câștigătorului și al unui eliminat, apoi restart și absența plăților duplicate.

Rush și Spin nu sunt activate financiar prin această schimbare. Spin rămâne informativ până la recuperarea configurației sale. Aspectul nativ al Cashierului, taxele operatorului, multi-table și comparația fizică a animațiilor/sunetului rămân în inventarul general de paritate.
