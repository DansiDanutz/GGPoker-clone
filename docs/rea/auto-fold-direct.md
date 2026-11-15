# Auto Fold — control direct Rush

Controlul de pe masă reutilizează editorul și controllerul Auto Fold existente. Setările păstrează intrarea pentru configurare între mese. Butonul direct este vizibil numai pentru contul înscris cu loc într-o masă Rush Hold’em; nu este adăugat la PLO, Battle sau mesele cash obișnuite.

TableEtcMenu3D folosește table_menu428 pentru preferința inactivă și429 pentru activă. Acestea sunt imagini132×132 încadrate proporțional în slot62×62, nu stări hover/down. Starea iconului urmărește preferința salvată; simpla deschidere a editorului nu activează foldul. Al doilea click închide și abandonează draftul, ca ramura nativă setSideMenu.

Rândul folosește pas70, baza x29 și y=viewport.height−90 când grupul lateral nu este prezent. Implementarea ancorează în coordonatele feltului la resize/scroll și plasează Auto Fold după Shuffle dacă acesta este vizibil. Cu Shuffle vizibil, Auto Fold este la99; dacă preferința Shuffle este oprită, Auto Fold revine imediat la29. Integrarea Rush Shuffle este descrisă în rush-shuffle.md. Grupul de jocuri laterale și offsetul Panic nu sunt reconstruite; acestea nu sunt declarate potrivire integrală a rândului nativ.

Focusul vizibil și aria-expanded/aria-pressed separă deschiderea editorului de preferința activă. Închiderea revine la controlul direct dacă mai este disponibil, altfel la setări. Schimbarea identității și ieșirea invalidează editorul existent; trimiterea foldului rămâne în controllerul autentificat anterior, fără comandă nouă în backend.

Verificare: testul nou a eșuat înainte de implementare fiindcă lipsea controlul direct. Browserul măsoară x29/−90/62×62 la1196×929 și850×650, verifică elementFromPoint și folosește pointer real pentru deschidere/închidere fără salvare. Restul fixtureului verifică editorul169celule, eroare de stocare/retry, izolarea contului, foldul întârziat real, payout1200chips și restart. Cele două cropuri sunt comparate RGBA cu atlasul original; sursele, dimensiunile și hashurile sunt în auto-fold-direct-source.json. Compoziția fizică AIR și sunetul rămân neverificate.
