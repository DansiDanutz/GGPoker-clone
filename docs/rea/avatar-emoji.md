# Emoticoanele Avatar — contract recuperat, integrare încă deschisă

Metoda: analiză statică FFDec a clientului instalat, fallback REA pentru SWF. Au fost exportate punctual `AvatarEmojiManager` și `AvatarEmojiSet` din `Game/51/IronDesktop.swf`, folosind JPEXS 26.4.0 deja instalat. Sursele brute și hashurile rămân în raportul privat. Acest document nu dovedește execuție AIR sau disponibilitatea fișierelor CDN.

## Ce reprezintă categoria

Avatar nu este o a patra copie a celor 28 de emoticoane standard și nici fotografia profilului pusă într-un cerc. Este un set dinamic asociat avatarului contului, cu buton propriu, miniaturi și GIF-uri. Filtrul meniului are valoarea `10000`, însă aceasta nu este ID-ul unui singur emoticon.

`currentAvatarSet` caută în `Account.avatarList` intrarea al cărei `AvatarId` corespunde `Account.avatarID`. Dacă nu o găsește, folosește perechea `avatarEmojiId`/`avatarEmojiName`, numai dacă este validă. În context Junket poate selecta avatarul membrului Junket; altfel revine la setul obișnuit. Nu avem o listă statică recuperată cu toate numele, drepturile și ID-urile seturilor oferite de operator.

Înregistrarea cere un ID pozitiv și un nume nenul/nevid. Un set deja înregistrat după nume este reutilizat. Catalogul nativ păstrează și indexul după ID-ul de bază. Numele afișat și tagul provin din metadatele contului, nu sunt deduse din numele fișierului.

## Fișiere și numerotare

`AvatarEmojiSet` are implicit 30 de poziții. Pentru poziția `i`, numerotată de la 1, ID-ul fișierului este `emojiId + i - 1`.

| Resursă | Cale relativă recuperată |
|---|---|
| Buton categorie | `<emojiName>/btn/button.png` |
| Miniatură | `<emojiName>/thumb/<size>/<fileEmojiId>.png` |
| Animație | `<emojiName>/emoji/<fileEmojiId>.gif` |

Clasa declară dimensiunile 55 și 80. Preîncărcarea din manager folosește efectiv numai 80, plus butonul și GIF-ul fiecărei poziții. Un set implicit produce 61 de intrări de preîncărcare: un buton, 30 de miniaturi și 30 de GIF-uri. Progresul exclude butonul, deci numitorul este 60. Aceste numere nu înseamnă că toate fișierele au fost descărcate sau că toate sunt afișate în meniu.

Meniul sare pozițiile cu index intern 27 și 28: pozițiile 28 și 29 lipsesc, iar 1–27 și 30 rămân selectabile. La setul implicit rezultă 28 de elemente. Etichetele folosesc familia `MOBILE_BUBBLE` și indexul din set; un text necunoscut nu trebuie inventat.

Rezolvarea unui ID pentru cache folosește baza `floor(id / 100) * 100 + 1`, apoi indexul relativ. Aceasta este regula observată în cod, nu dovada că orice ID arbitrar dintr-un bloc este permis. Backendul local trebuie să accepte doar un catalog aprobat, asociat unui set real.

## Încărcare, cache și erori

Baza URL provine din `ServerInfo.dynamicEmojiBaseUrl`. Lipsa ei produce URL gol. Codul imaginilor încearcă mai întâi fișierul inclus la `assets/emoticon_thumb/<relativePath>`, apoi CDN. Ramura de citire de pe disc există, dar apelul este condiționat explicit cu `false`; nu trebuie descrisă drept cache persistent activ. Ramura CDN nu configurează un fișier de salvare.

GIF-urile folosesc `URLLoader` binar și sunt reținute în memorie numai dacă au între 1 și 3.145.728 de octeți. Erorile IO și de certificat termină încercarea și eliberează procesorul. Finalizarea încercării nu echivalează cu succesul tuturor resurselor: `isAvatarAttempted` și `isAvatarLoaded` sunt condiții diferite.

Managerul deduplică încărcarea aceluiași set și adună callbackurile. Schimbarea setului anulează taskurile celorlalte seturi, elimină înregistrările încă nerezolvate și callbackurile lor. Resursele deja încărcate rămân în cache. Închiderea meniului golește obiectele elementelor; nu este demonstrată aici invalidarea întregului cache al managerului.

## Aspectul și stările meniului

Tabul Avatar este la x=159, y=0 în bara categoriilor. Celelalte taburi sunt la x=12, 61 și 110. Indicatorul de progres este lat de 40 și începe la x=159, y=32. Apăsarea tabului în timpul încărcării este ignorată.

La deschidere, fără un set asociat contului, tabul este ascuns. Cu buton încărcat, dar încercare neterminată, apare starea de progres. După finalizarea încercării apare starea ready, chiar dacă aceasta nu dovedește încărcarea tuturor fișierelor. Dacă filtrul salvat era Avatar și setul încă se încarcă, meniul afișează temporar Standard. Schimbarea avatarului invalidează selecția curentă, ascunde meniul deschis și emite semnalul de închidere.

Selectarea unui element emite indexul și `avatarName`; traseul complet până la autorizarea și payloadul serviciului operatorului nu este stabilit de aceste două clase. Nu permitem clientului local să trimită URL-uri arbitrare sau să aleagă singur un rol/set autorizat.

## Animația deasupra locului

`Emoticon.showEmoticon` tratează ID-urile de la 10000 drept Avatar. Captionul folosește indexul modulo 100 sau textul explicit. Cu URL GIF, imaginea statică este ascunsă; se folosesc întâi octeții GIF din cache, apoi încărcarea URL.

Există o perioadă de grație de 200 ms. Dacă GIF-ul nu este gata, se afișează emoticonul standard corespunzător indexului. O completare tardivă este eliminată, în loc să înlocuiască brusc fallback-ul. Dacă nu există URL, fallback-ul static apare direct. GIF-ul valid este centrat și scalat uniform astfel încât dimensiunea maximă să fie 200; nu este întins obligatoriu la 200×200. Durata generală de afișare este de patru secunde, iar ascunderea curăță GIF-ul și timerul de grație.

Nu sunt demonstrate aici decodarea și temporizarea fiecărui cadru GIF, buclele, sunetele sau rezultatul fizic al randării AIR. Cele 56 de timeline-uri Dneg/Greg deja reconstruite nu dovedesc această ramură diferită.

## Starea locală și condițiile de integrare

Inventarul read-only al folderului instalat `Game/assets` nu a găsit GIF-uri și nu a identificat un folder `emoticon_thumb`. Acesta este doar domeniul scanat; nu este o afirmație despre toate cacheurile sistemului sau disponibilitatea CDN. Nu au fost deschise contul, aplicația nativă ori pagini externe și nu au fost trimise cereri către CDN.

Categoria Avatar nu este activată local. Pentru integrarea fidelă lipsesc încă un catalog concret de seturi și drepturi, fișierele lor autentice, traseul complet de trimitere/recepție și contractul decoderului GIF. După recuperare, verificarea trebuie să acopere selecția pe cont, progresul și eroarea parțială, schimbarea avatarului, deduplicarea/anularea, limitele de fișier, timpii sub/peste 200 ms, completarea după ascundere, privacy/moderare/Helmet, istoricul mâinii, payout și restart. Nici un placeholder nu poate fi contabilizat drept această funcție terminată.
