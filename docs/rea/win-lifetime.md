# WIN: durată, eliminare și lipsa replayului

## Traseul REA

Dovezile sunt exporturi statice FFDec păstrate local. TableAnimator.showWinners afișează WIN, iar potMoveComplete cheamă playerView.hideWin înainte de a avansa potul. PlayerView3D.hideWin trece prin toate celulele; PlayerCell3D.hideWin apelează extensia. NewPlayerWinExtention setează autoHide=false la afișare; hide elimină extensia, oprește Win, scoate copilul, îl întoarce în pool și golește referința. Acestea sunt operații explicite de lifecycle, nu o etichetă permanentă a rezultatului mâinii.

În traseul obișnuit cu mai multe poturi, WIN este afișat inițial pentru câștigători și eliminat când se încheie primul pot. movePotToWinners nu îl afișează din nou la fiecare pot ulterior. Nu deducem din acest traseu comportamentul separat RIMT/multi-board sau al tuturor jackpoturilor.

## Defectul măsurat

Testul RED a așteptat finalul payoutului din fixture-ul cu două poturi. Clientul local păstra trei imagini nativeWin; sursa cerea eliminarea. Rendererul le recrea din g.end la fiecare redesenare, confundând rezultatul persistent cu efectul temporar.

## Corecție locală

winHand identifică exclusiv o prezentare proaspătă a showdownului. Numai aceasta poate crea badge-uri. hideWin golește markerul și elimină nodurile winMark. Ultima cotă a unui pot îl cheamă înainte de activarea următorului pot; redrawul final nu mai recreează imaginea. Schimbarea identității și reducerea mișcării îl elimină de asemenea. O pagină care recitește o mână deja terminată prezintă rezultatul și cărțile, fără replayul WIN.

Nu schimbăm rezultatul poker, eligibilitatea, stackurile, walletul sau istoricul. Clasa semantică winner și best-five pot continua să descrie rezultatul; imaginea WIN are lifecycle separat.

## Verificări

Fixture-urile audio cu două și trei poturi verifică numărul corect de badge-uri la prezentarea proaspătă, zero la începutul poturilor secundare, zero după ultimul payout și după polling. Un redraw real prin Helmet și restartul serverului nu le readuc. Verificările geometriei imaginii și ale pixelilor care ar putea acoperi rankul/suita cărților se execută cât WIN este prezent, cu o verificare explicită că ținta există; dispariția corectă nu transformă testul într-un succes pe o colecție goală.

Modurile reduced-motion și reconectarea verifică absența unei prezentări vechi. Sunetul WinPot rămâne legat de mișcarea fiecărui pot, separat de badge. Corelarea folosește timestampul nativ al evenimentului CSS și păstrează separat momentul observării în listenerul de bubbling; un callback audio poate rula înaintea acestui listener, fără să preceadă evenimentul care l-a declanșat. Nu am redat audio prin difuzoarele fizice; testele Chrome sunt headless și mute.

## Trei poturi

network-browser-test.mjs --aof-sidepots --payout-audio --three-pots reutilizează patru sesiuni separate și controalele reale de All-In. Stacks48/32/20/12, board egal, poturi48/24/24 și returnare16 produc nouă cote. Stackurile vizuale trec prin16/0/0/0 →28/12/12/12 →36/20/20/12 →48/32/20/12. Sunt112fise, exact trei porniri WinPot și nicio pornire de pot înaintea finalizării tuturor cotelor precedente. Aceasta exercită și holdul minim0,1s: fiecare pot are două segmente0,4s și hold0,1s, deci0,9s în politica locală documentată.

Fixture-ul separat cu două poturi păstrează Fold și returnarea nechemată. Nu pretindem că un singur fixture acoperă simultan orice număr de locuri, poturi și formate.

## Limite

Scara de timp efectivă și ordinary Delay ale aplicației native, temporizarea fizică audio/video, toate jackpoturile și RIMT/multi-board rămân de verificat. Hashurile traseului sunt în win-lifetime-source-audit.json din raportul privat. Corecția urmează ordinea sursei și are probe locale; nu reprezintă încă paritate completă1:1.
