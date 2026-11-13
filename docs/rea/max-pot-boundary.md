# Șase jucători, cinci poturi: limita locală verificată

## Scop

Testul extinde traseul de payout documentat în multipot-payout.md și win-lifetime.md la masa Hold’em obișnuită cu șase locuri. Sunt cinci poturi în total: potul principal și patru secundare. Nu sunt cinci poturi secundare. Nu am adăugat alt motor de joc sau o pagină de demonstrație: testul folosește network.html, API-ul normal de rooms și controalele existente.

Datele inițiale sunt un checkpoint temporar, cu stackuri inegale și un board egal determinist. Serverul și toate cele șase sesiuni de browser sunt izolate de contul/dosarul live al proprietarului. Sursa vizuală este corpusul static FFDec; aplicația AIR și contul real nu sunt operate.

## Acțiuni reale și model independent

network-browser-test.mjs --max-pots --payout-audio pornește șase contexte de browser, fiecare cu propriul token de loc. Înaintea acțiunilor, fiecare vede numai propriile cărți. Fiecare mutare este un pointer Chrome real, cu e.isTrusted=true, pe butonul Hold’em al jucătorului aflat la tură. Raise/All-In folosește maximul sliderului; un short-stack care poate doar plăti folosește Call. Se verifică ordinea locurilor3/4/5/0/1/2, grila de șase locuri și absența butoanelor speciale AoF.

Stackurile sunt48/40/32/24/16/8. Cinci niveluri contestate produc poturi48/40/32/24/16, iar cele8fise nechemate se întorc locului0. Boardul royal comun face egalitate între toți jucătorii eligibili ai fiecărui pot. Oracle-ul independent folosește nivelurile și clasamentul cărților; nu recopiază g.end.payouts ca așteptare.

| Etapă | Participanți eligibili | Cote | Stackuri vizuale la început |
|---|---|---:|---|
| Principal48 |0–5|6×8|8/0/0/0/0/0|
| Secundar40 |0–4|5×8|16/8/8/8/8/8|
| Secundar32 |0–3|4×8|24/16/16/16/16/8|
| Secundar24 |0–2|3×8|32/24/24/24/16/8|
| Secundar16 |0–1|2×8|40/32/32/24/16/8|
| Final |—|20de cote în total|48/40/32/24/16/8|

Sunt168fise conservate:160distribuite prin poturi și8returnate. Fixture-ul separat cu două poturi păstrează cazul Fold; acesta nu pretinde un jucător foldat în fixture-ul maxim.

## Ordine, poziții și sunet

Cele cinci pile sunt măsurate în coordonate native1700×1200:850/663,692/706,1008/706,850/760,544/776. TableSetting definește aceste poziții, iar SixRingSetting le moștenește. Se verifică suma etichetei și a pilei grafice pentru fiecare index, înainte să înceapă distribuirea.

La fiecare start rămân montate toate cotele curente și viitoare:20,14,9,5,2. Ready este disabled la fiecare dintre aceste momente; un click pe butonul blocat nu trimite Ready la server. Fiecare pot începe după callbackurile tuturor cotelor precedente. Pilele viitoare rămân pe masă până la propriul start. WIN există inițial și dispare după primul pot, fără reafișare pentru următoarele.

Se identifică PCM-ul decodat al fișierului original SoundWinPot.mp3 și exact cinci porniri WebAudio. Timestampul nativ al evenimentului CSS este separat de observarea în bubbling. Fiecare cotă are două segmente400ms, cu diferență500ms între delayurile lor: hold100ms și durată900ms în politica locală de timp. Aceasta exercită limita inferioară pentru împărțirea bugetului local la multe poturi; nu stabilește ordinary Delay sau speedRatio ale serverului/aplicației originale.

Traseul de showdown cu șase jucători poate dura mai mult decât fixture-urile cu patru locuri. Așteptarea testului audio este limitată explicit la20s, în parametrul harnessului, nu trimisă ca userGesture către CDP. Erorile CDP includ metoda, fără a expune parametri/tokenuri.

## Încheiere și restart

După ultima cotă, stackurile afișate trebuie să fie exact cele calculate independent, totalul potului160, Ready activ, fără awarduri/pile/WIN rămase. Pollingul și schimbarea Helmet nu pot recrea badge-ul. După restartul serverului și reload, același rezultat și aceleași balanțe sunt păstrate fără replay. Erorile de pagină trebuie să rămână absente.

## Limite

Este verificată combinația Hold’em cu șase jucători și cinci poturi, împreună cu fixture-urile separate de două/trei poturi, Fold și returnare. Nu este o probă pentru orice combinație de format/stake/multi-board/jackpot sau pentru paritate fizică pixel/frame/difuzor cu AIR. Motorul, rendererul și contabilitatea nu au necesitat modificări pentru acest prag; schimbarea adaugă dovada de browser și documentația.
