# Payout secvențial: pot principal și poturi secundare

## Sursa și diferența reprodusă

REA folosește aici corpusul static FFDec păstrat local. TableAnimator.movePotToWinners pornește fiecare pot, așteaptă callbackul potMoveComplete, apoi avansează indexul. MotionView3D.potMoveToWinners mută împreună toate cotele câștigătorilor aceluiași pot și cheamă callbackul doar după creditarea ultimului câștigător. Delay-ul primit este împărțit la numărul poturilor. Nu am observat execuția AIR a acestui traseu.

Testul RED cu all-in-uri inegale a măsurat același timestamp6979,8ms pentru începutul ambelor poturi locale. Astfel, sumele puteau fi corecte în backend, dar prezentarea simultană nu respecta ordinea din sursa nativă.

## Implementare locală

Fiecare pot are grupul său de awarduri, câte unul pentru fiecare cotă pozitivă. Potul principal începe după prezentarea existentă a showdownului; awardurile poturilor următoare sunt ascunse și nu au animații active. După încheierea tuturor cotelor unui pot, callbackul activează potul următor. Nu adăugăm un timeout de avansare și nu pornim anticipat sunetul potului aflat în așteptare.

Pentru mai multe poturi, fiecare award are două animații CSS: apropiere de jucător0,4s și intrare/fade0,4s, separate de hold. Distanța de oprire rămâne140×scara jucătorului. Păstrăm bugetul local existent2s pentru Delay: durata unui pot este0,8+max(2/numărPoturi−0,8;0,1). Pentru două poturi rezultă1s fiecare:0,4+0,2+0,4. Pentru trei sau mai multe, holdul minim0,1s previne durate negative. Formula urmează sursa la scara implicită1; valoarea reală ordinary Delay și orice override speedRatio al aplicației native rămân necunoscute. Bugetul local este marcat shortcut în cod, fără a fi prezentat ca parametru recuperat de la serverul original.

Un singur pot păstrează traseul existent de2s. Regulile poker, ordinea de eligibilitate, împărțirea egalităților, returnările nechemate, portofelul și ceasurile serverului nu se schimbă.

## Poturi vizibile și stackuri

Pila unui pot dispare când începe mișcarea cotelor sale; poturile viitoare rămân vizibile. Un redraw al aceleiași mâini păstrează pila aflată în așteptare și nu reintroduce un pot deja distribuit. Fiecare cotă se adaugă stackului vizual numai la încheierea intrării/fade; încheierea primului segment de0,4s nu creditează nimic. Callbackurile repetate nu pot dubla creditarea.

Ready rămâne blocat cât există orice award, inclusiv un pot ascuns în așteptare. Snapshotul mâinii următoare rămâne amânat până la ultima cotă, prin mecanismul documentat în payout-sequencing.md. Reducerea mișcării finalizează balanțele, iar pierderea/părăsirea sesiunii abandonează prezentarea veche. Reloadul și restartul citesc rezultatul final fără replay.

## Sunetul

Începutul real al animației de deplasare declanșează WinPot o singură dată pentru acel index de pot. Cotele aceluiași pot pornesc împreună și nu multiplică sunetul. Testul identifică PCM-ul decodat al SoundWinPot.mp3 și urmărește pornirile WebAudio; difuzorul fizic rămâne mut în testele headless.

## Fixture și verificări

network-browser-test.mjs --aof-sidepots --payout-audio folosește patru sesiuni, stackuri48/32/20/48, Fold al locului3 și All-In prin controalele reale. Rezultatul are poturi60 și24, returnare16 și148de fise conservate. Boardul egal în modul audio produce cinci cote câștigătoare: trei pentru potul principal și două pentru cel secundar.

Înainte de distribuire, stackurile vizuale sunt16/0/0/48; la începutul potului secundar sunt36/20/20/48; la final48/32/20/48. Potul secundar începe după toate cele trei încheieri ale potului principal. La primul start rămâne pila index1; la al doilea nu mai rămâne nicio pilă. Sunt exact două sunete, corelate cu propriul start. Schimbarea reală Helmet în timpul prezentării păstrează identitatea și vizibilitatea potului viitor și nu schimbă mâna.

Modul fără --payout-audio măsoară separat originile, oprirea și finalul traiectoriilor, prin pauză/scrub urmat de restaurarea animației. Acesta verifică geometria, fără să pretindă temporizare nescriptată. Modul audio păstrează animațiile naturale pentru verificarea ordinii. Ambele verifică payouturi independente, returnarea nechemată, lipsa cărților adversarului foldat, Ready, balanțe finale și restart fără replay.

## Limite

Nu declarăm duratele native absolute sau latența difuzoarelor identice. Bugetul ordinary Delay, overrideurile speedRatio, durata completă WIN/hideWin, toate formatele și cazurile cu trei sau mai multe poturi în browser necesită în continuare dovezi. Sursa confirmă ordinea și formula, iar fixture-ul confirmă fluxul local cu două poturi.
