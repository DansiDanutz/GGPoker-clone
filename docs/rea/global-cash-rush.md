# Pauză cash globală și Rush — contract și implementare locală

## Dovezi native și limite

GlobalSitoutManager, SelectSitoutMenuCommand, SetAutoActionFlags, SetGlobalSitoutCommand și OnChangeGlobalSitoutStateCommand au fost exportate selectiv cu FFDec headless. Hashurile celor cinci exporturi, ale surselor existente asociate și SWF-ului sunt în global-cash-rush-source.json. Nu au fost executate comenzi în contul real sau clientul AIR.

Managerul păstrează separat rezerva pe TableInfo și rezerva all-tables, cu prioritate pentru cea pe masă. SelectSitoutMenuCommand separă isGlobal cash de isAll pentru toate jocurile; ultimul devine IsGlobalAutoAction. GlobalSitoutCommand exclude turneele/Spin din ramura cash, dar nu Rush cash; SitOutCommand și cererea3128 tratează RushSessionId și sesiunea încă neatașată unei mese. Acestea susțin includerea Rush în subsetul cash local. Meniul nativ Header All Tables și acțiunile helper cash sunt distincte: etichetele locale limitate la cash nu declară paritate pentru toate jocurile.

Nu rezultă o politică verificată pentru mese deschise după cerere sau pentru SB/BB la next-blind. Nu se activează automat noi sesiuni și nu se inventează taxe, penalizări ori refacerea timpului de pauză. Turneele/Spin, Short Deck și politica operatorului rămân în inventarul incomplet.

## Flux în aplicația locală

Din headerul unei mese Hold’em/Omaha suportate sau al unei sesiuni Rush Hold’em/PLO finanțate, deschizi Sit Out și alegi toate mesele cash. Același scope este disponibil în setările Rush și prin hotkey-ul configurat. Sunt marcate numai sesiunile existente ale contului autentificat; ceilalți jucători și computerele rămân neschimbați. Alegerea curentă afectează numai masa sau poolul curent și înlocuiește markerul global pentru acea sesiune.

Pauza schimbă eligibilitatea la următoarea potrivire, nu execută fold și nu mută jetoane în mâna curentă. Quick-fold în timpul pauzei nu înscrie jucătorul la altă masă. Revenirea globală înscrie din nou o sesiune Rush efectiv pusă în pauză și acum liberă; o sesiune liberă, dar deja activă, nu pornește implicit. Aceasta este politica locală de coadă, nu o afirmație de recuperare a arbitrajului privat.

Un sold Rush zero păstrează pauza și produce o cerință explicită de buy-in200jetoane locale. Revenirea nu debitează portofelul; înscrierea/rebuy-ul confirmat de jucător finanțează revenirea. Lipsa celor șase jucători nu împiedică anularea unei pauze rezervate. Global Leave/next-blind și alte formate nu sunt extinse prin această schimbare.

## Backend, persistare și frontend

rooms.mjs aplică schimbările tuturor meselor și poolurilor în același checkpoint folosit deja de portofel și Rush. Un eșec de scriere restaurează întregul snapshot. Rush păstrează intrările, coada, versiunea și markerul privat advisory sitOutAllCash; JSON-ul mâinii și banii nu sunt modificați. Serverul recitește în memorie checkpointul Rush numai după reușita operației globale, înaintea următoarei cereri/timer; lease-urile cosmetice nu sunt șterse.

rush.mjs validează tipul markerului, îl elimină la override/rebuy/leave și nu reactivează un marker vechi rămas inactiv după un runtime anterior. Headerul adaptează controalele existente și arată scope-ul curent/all-cash. Cerințele de finanțare Rush sunt explicate fără rebuy implicit. Cookie-ul contului, Origin exact, metoda, JSON-ul și limitele payloadului rămân aceleași.

## Verificare candidat

RED changed1în loc de3 a reprodus omisiunea Rush; RED a reprodus și pornirea nedorită a unui pool deja activ și refuzul anulării înainte de șase jucători. GREEN verifică o masă obișnuită+Rush Hold’em+PLO, idempotence, rollback, cold restart, private scope, ceilalți jucători, mâini/portofel neschimbate, quick-fold fără rematch, coadă după revenire, două mâini Rush cu payout/conservare1200jetoane pe format, override local, lipsă fonduri fără debit, rebuy explicit, checkpoint corupt și marker inactiv legacy. Sesiunile nou create nu moștenesc cererea veche.

Scenariul headless --cash-sitout --cash-sitout-account --cash-sitout-menu --cash-sitout-rush folosește conturi temporare și server separat. A trecut headerul din masa obișnuită și din Rush, ambele pooluri, global pause/resume, override, hotkey configurat, restart, geometrie,503retry, glyph-uri și Deal Me In. Regresiile pentru portofel/Rush cashout și fundare au trecut. Candidatul nu este încă activat live și nu certifică pixelii sau sunetul AIR.

## Candidat ulterior: Short Deck

[Short Deck cash Sit Out](shortdeck-sitout.md) adaugă separat acest format la eligibilitatea cash și globală. Nota de limitare Short Deck de mai sus descrie checkpointul inițial PR216; all-games pentru turnee/Spin și next-blind rămân deschise.
