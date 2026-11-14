# Spin — reguli explicite de practică în consola owner

## Scop și limită

Configurația efectivă nativă per multiplicator rămâne neconfirmată. Această funcție salvează numai reguli declarate local-practice; nu transformă300fise sau15secunde/card în valori native recuperate. Nu activează încă Play Now,matchmakingul sau roata. Banca și portofelele nu se modifică la salvare.

## Câmpuri și comportament

Ownerul selectează5000sau10000și completează pentru fiecare dintre cei opt multiplicatori Starting chips300–1000și Time-bank cards1–4. Durata acțiunii1–120secunde,secundele unui card1–60și maximul cardurilor pe acțiune sunt explicite. Maximul trebuie să încapă în numărul cardurilor oricărui rezultat. Numai formatul cu cărți este suportat;noDealing=trueeste respins,pentru a nu configura un rezultat fără controller implementat. Toate câmpurile numerice pornesc goale pentru o miză neconfigurată.

Este necesar un motiv de schimbare de maximum200caractere. Fiecare salvare are o revizie monotonă. Retry-ul identic al ultimei operații întoarce aceeași chitanță,fără revizie suplimentară sau rescriere. O operație veche/conflictuală este respinsă și cere reîncărcare. UI-ul păstrează comanda după un răspuns pierdut și afișează auditul folosind textContent.

Cele două mize sunt independente. Schimbarea selecției nu copiază automat valorile alteia. Un meci decis păstrează propria configurație și propriul clock; editarea regulilor viitoare nu schimbă masa existentă. Înscrierile aflate încă înaintea extragerii trebuie anulate înaintea schimbării regulilor aceleiași mize,ca să nu rămână o coadă cu reguli înlocuite.

## Backend și persistență

spin-rules.mjs validează schema version1,cele două seturi,reviziile și ultimele100chitanțe complete. Configurația și clockul sunt canonizate prin helperii comuni spinPracticeConfiguration și spinPracticeClock; nu există a doua listă de reguli divergente pentru tabel și owner. GET rămâne disponibil la epuizarea reviziilor,cu următoarea revizie null.

Starea local-spin-rules este parte din rooms.json șieste eliminată din harta camerelor înaintea validării jocurilor. Poate fi prima stare salvată,fără conturi sau bancă finanțată. Scrierea folosește tranzacția existentă cu snapshot,temp-write,rename și rollback. Backup-ul include automat regulile; restaurarea respinge o configurație semantic invalidă chiar dacă checksumul arhivei a fost recalculat corect.

/api/owner-spin-rules GET/POST folosește cheia owner și modul local-only. POST cere Origin exact,JSON și cel mult16000bytes. Cookie-ul unui jucător nu oferă acces owner. Nu există aici o rută publică de configurare sau de înscriere. Interfața refuză răspunsuri vechi după schimbarea cheii și golește câmpurile și auditul private.

## Verificare executată

spin-rules-test.mjs:RED magazin lipsă,apoiGREEN pentru valori implicite goale,fără scriere la citire,reguli explicite stricte,retry,revizii,blocarea cozii,izolarea mesei deja create,rollback,cold restart,clone,audit100și limita safe-integer. Salvarea inițială nu creează portofele și nu alimentează banca.

spin-rules-http-test.mjs:cheie/origin/type/size/JSON,revizii și retry,eșec de scriere,restart,izolarea jucătorului și băncii,snapshot/restore și respingerea coruperii semantice cu checksum valid. Datele sunt temporare.

network-browser-test.mjs --spin-rules:8rânduri goale,mize separate,Save prin mouse,audit fără HTML activ,răspuns pierdut→retry o singură dată,scriere eșuată→retry,schimbarea cheii cu răspuns GET întârziat și restart real al serverului. Banca rămâne0. Testele existente ale mesei Spin și finanțării trec după mutarea validatorului de clock în helperul comun.

Administrarea este independentă de backendul privat GGPoker. Rămân de conectat înregistrarea autentificată/cantitatea/anularea/matchingul din lobby la aceste reguli,roata nativă și fluxul complet pentru utilizator. Paritatea fizică nativă și configurația nativă exactă nu sunt demonstrate.
