# Spin — reguli explicite de practică în consola owner

## Stare curentă — PR203

Editorul owner separă formatele3-Max/6-Max pentru fiecare miză locală5000/10000. Pentru6-Max cere distribuția completă per multiplicator:frecvențe însumând100M,procente de premii1–6poziții însumând100,stackuri/carduri,intervale/clock și scară explicită de small-blinds. Asigurarea configurabilă declanșeazăX2la3-Max șiX4la6-Max. Câmpurile neconfigurate sunt goale. Nu sunt presupuse probabilități sau reguli private native.

Persistența acceptă în continuareversion1; prima configurație6promovează laver2,cu maximum4seturi independente (miză,locuri),audit100,ceas verificat identic cu configurația finanțată și recuperare atomică. Salvarea regulilor nu finanțează banca și nu debitează jucători. Înscrierea/masa/premiile/restartul sunt conectate și testate;vezi [fișa6-Max](spin-six.md).

Secțiunile de mai jos păstrează checkpointul inițial3-Max. Afirmațiile despre version1exclusiv sau funcții încă neconectate sunt istorice și sunt înlocuite de starea curentă de mai sus. NoDealing și backendul privat al operatorului rămân neimplementate/neobservate.


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
