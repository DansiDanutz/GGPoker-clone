# Spin 6-Max — bancă și asigurare locală

spinBank reutilizează capitalizarea, rezervările, auditul și rambursările existente. O rezervare6-Max primește configurația completă validată de engine/spin-six.mjs; fără acest argument, regulile3-Max rămân neschimbate. Nu există conversie implicită a unui meci3-Max în6-Max.

## Expunere și contabilitate

Rezerva este max(0, premiul maxim−6×buy-in). Pragul0 contează când toate premiile sunt acoperite de cele șase intrări; banca nu creditează o expunere negativă. La decontare, netul meciului este6×buy-in−premiul rezultatului ales. Configurația este clonată și înghețată logic prin identitatea rezervării: retry cu aceleași valori este idempotent, iar o configurație schimbată pe același ID este refuzată, chiar dacă expunerea maximă coincide. Ordinea cheilor unui obiect nu schimbă identitatea regulilor; ordinea rezultatelor rămâne semnificativă pentru bilete.

Agregarea netului folosește BigInt intern, apoi verifică domeniul întregilor siguri înainte de a întoarce Number. Aceasta previne pierderea unui jeton la sume intermediare mari care se compensează. Valorile persistate rămân numere întregi JSON, fără schimbarea formatului de transport.

## Asigurare

Limita este șase polițe active pentru o rezervare6-Max, trei pentru una legacy. Declanșarea6-Max foloseșteX4, cea3-MaxX2, conform contractului documentat în spin-insurance.md. Prima și despăgubirea sunt termeni locali expliciți, nu rate private deduse. Fiecare poliță păstrează garanția max(primă, despăgubire), pentru a permite și rambursarea. Draw-ul este unic; retry nu plătește din nou și decontarea meciului cere același bilet.

## Checkpoint și compatibilitate

Versiunea5 adaugă configurația opțională pe rezervarea6-Max și păstrează lista polițelor. Checkpointurile1–4 sunt citite ca înainte. Un checkpoint mixt permite meciuri3/6; operațiile de asigurare păstrează versiunea5, fără retrogradare la4. Configurațiile, limitele de polițe, expunerea și totalurile sunt reverificate la restaurare. O intrare6-Max cu expunere0 poate funcționa la secvența de finanțare0; aceasta nu creează un eveniment fictiv de capitalizare.

Un runtime vechi nu poate citi versiunea5. Activarea publică6-Max necesită, înainte de folosire, coordonarea băncii cu înscrierile, auditul regulilor și politica de restaurare. Nu este oferită compatibilitate inversă fictivă prin eliminarea metadatelor6-Max.

## Verificare și poartă rămasă

spin-six-bank-test.mjs verifică expunerea completă și fondurile insuficiente, zero hold, șase polițe/X4, rezultate declanșate și nedeclanșate, conservarea exactă a unui registru de portofele simulat, rambursări/idempotence, clone și reguli schimbate, restaurare mixtă4→5, coruperea datelor și agregarea exactă a sumelor mari. Testele existente pentru banca/reservation/settlement/insurance/atomic-entry/queue/HTTP3-Max sunt regresii obligatorii.

Testul registrelor simulate nu înlocuiește șase portofele reale prin API. Înscrierea6-Max, migrarea integrală a registrului de meciuri, anulările/rambursările atomice prin API, gate-ul de prezentare și turneul până la câștigător rămân de conectat. Nu declarăm formatul jucabil în lobby pe baza acestui test de bancă.
