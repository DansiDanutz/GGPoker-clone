# Spin & Gold 6-Max — model local explicit și poarta de integrare

## Ce dovedește sursa nativă

SpinAndGoldType citește TableType și MultiplierSetId din tagSitAndGoType. Schema include separat BlindStructureSetId și PrizeStructureSetId. tagSpinAndGoldTypeInfo primește listele de tipuri, multiplicatori și asigurări; acestea nu sunt un tabel local complet de probabilități/prize. SpinAndGoldTabInfoPage afișează explicit3-Max sau6-Max. SpinAndGoldWheelData are o ramură6locuri cu praguri de efect10/50, distincte de5/25 la3-Max; asigurarea6-Max este legată separat deX4.

Aceste clase dovedesc existența formatului și dependența de configurația primită, nu valorile efective pentru contul/brandul instalat. Reutilizarea probabilităților3-Max sau a scării sale de blinduri ar inventa reguli native. Hashurile surselor sunt în spin-six-source.json; analiza este statică FFDec în fluxul REA, fără joc sau cereri în contul real.

## Modelul implementat

engine/spin-six.mjs acceptă exclusiv o configurație completă mode=local-practice, seats=6. Proprietarul trebuie să furnizeze buy-in-ul, scara SB, ceasul și fiecare rezultat: multiplicator, frecvență, procente de premiu, stack inițial, carduri de timp, unitate/interval de nivel și noDealing=false. Nu există valori implicite împrumutate din3-Max. Limitele locale sunt explicite:1–32rezultate,1–64niveluri, interval1–60, stack300–1000,1–4carduri; acestea nu sunt o configurație efectivă a operatorului recuperată.

Frecvențele locale însumează exact100.000.000de bilete. Biletul trebuie să fie întreg în[0,99.999.999]. Multiplicatorii sunt unici, toate sumele sunt întregi sigure, blindurile strict crescătoare cu dublarea BB fără overflow. Procentele au1–6locuri pozitive și însumează100. Calculul premiilor reutilizează prizeAmounts, cu distribuirea resturilor și șase poziții, completate cu0unde nu se plătește.

Nivelurile folosesc scara explicită și intervalul rezultatului ales, după timp sau număr de mâini. Ceasul întors înapoi rămâne la nivelul1; capătul scării este plafonul. Modelul validează și clonează configurația, inclusiv array-uri și ceas propriu complet, astfel încât un apelant nu poate modifica regulile printr-un rezultat aliasat.

## Verificare executată

spin-six-test.mjs acoperă configurații incomplete, câmpuri suplimentare/moștenite, array-uri rare, intervale fracționare, overflow, probabilități greșite, multiplicatori duplicați și premii invalide. Verifică ambele margini ale fiecărui interval de bilete, rotunjirea exactă în șase poziții, nivelurile pe minute/mâini și plafonul final. Regulile fixtureului sunt arbitrare și locale, nu probabilități pretinse native.

Un rezultat este folosit pentru o mână reală în motorul Hold’em cu șase locuri:300fise fiecare, all-in/call, board complet și1800fise păstrate. Payout-ul este verificat prin enumerare independentă de mâini de cinci cărți folosind rank5. Testele3-Max de probabilități, reguli, bancă și înscriere rămân verzi. Acesta este un test de model/mână; nu dovedește înscrierea sau portofelul6-Max.

## Poarta pentru a deveni jucabil

Modulul nu este încă importat în runtime. Lobby-ul și înscrierea6-Max rămân închise. Urmează obligatoriu:

- Audit și configurație owner6-Max separate de regulile3-Max; versiunea fiecărui match trebuie înghețată.
- Rezervarea expunerii băncii față de șase buy-in-uri, asigurareX4 numai cu termeni expliciți și migrare sigură a checkpointurilor vechi.
- Șase înscrieri autentificate, retry/idempotence/anulare și rambursare atomică, fără mixarea cohortelor3/6.
- Șase locuri reale, gate de prezentare pentru toți, turneu până la câștigător, premii și restart fără plată duplicată.
- Prezentarea nativă6-Max: poziții, praguri10/50, rezultate/congratulations și verificare în browsere separate.

Nu declarăm Spin6-Max funcțional în aplicație înaintea acestui traseu complet. Runtime-ul activ și datele proprietarului nu sunt modificate de acest model neconectat.
