# Rabbit Hunt: oprirea completă a animației și investigarea vizibilității

Stare: integrat și activ prin PR223. Cele13verificări exact-head au trecut, inclusiv Hold’em/PLO pe sursă și pachet instalabil; restarturile sunt izolate. Dovezile AS/Pcode/SWF sunt în rabbit-motion-source.json; nu este o execuție AIR sau o comparație fizică nouă.

## Ce confirmă REA

OnRabbitCard4017 primește runout-ul și îl păstrează separat de boardul jucat; fără userPlayer, callbackul returnează. Card3D consumă callbackul de click o singură dată. CommunityCard3D deschide coperta în client; semnalul CLICK_RABBIT_CARD este consumat în CommunityCardView3D pentru a coordona a doua tablă locală atunci când este double-board. Handlerul citit nu transmite o comandă de rețea. RABBIT_CARD_OPENED din TableMediator mergează cache-ul local și actualizează best-five și mișcarea cărților.

Acest traseu susține un control de deschidere per-viewer. Nu dovedește singur politica serverului de livrare a notificărilor ori eligibilitatea pentru un jucător venit târziu. [FAQ-ul oficial](https://help.ggpoker.com/article/Table-Features-and-Settings---Frequently-Asked-Questions) a returnat în instrumentul de citire o pagină LWC fără text; un snippet localizat despre disponibilitatea cărților nu a fost tratat ca dovadă pentru o deschidere forțată pe celelalte sesiuni. Limita de vizibilitate nu este schimbată în acest patch.

## Defect reprodus

În animația normală locală există300ms de spread, apoi200ms de peel. Dacă prefers-reduced-motion devenea true în timpul spread-ului, listenerul punea coperta direct în poziția finală, dar lăsa timerul300ms activ. Când preferința revenea la false, timerul pornea peel de la zero: o copertă deja deschisă se închidea parțial și se deschidea din nou.

Testul --rabbit --rabbit-motion-toggle a urmărit toate mutațiile data-peel după finalizarea instantanee și a eșuat: existau valori sub1. Acesta este un defect al lifecycle-ului local, nu o temporizare recuperată de la sistemul de operare nativ.

## Corecție

Listenerul de preferință finalizează numai animația curentă activă. Finalizarea anulează timerul și RAF-ul, termină spread-ul, fixează SVG-ul la1 și șterge callbackul activ înainte de onOpened. O singură gardă de sunet permite un cue dacă întreruperea apare înaintea lui și evită un al doilea cue dacă peel-ul începuse deja. Schimbarea preferinței după finalizare sau după reload nu mai reexecută finalizarea ori sunetul. O mână nouă continuă să invalideze callbackurile vechi prin generation.

Duratele și geometria normală300ms/200ms rămân neschimbate. Nu sunt schimbate rezultatele, boardul jucat, cărțile private, portofelul, regulile ori persistența serverului. Preview-ul propriu HandRank este actualizat după finalizarea vizuală, ca înainte.

## Verificări

Scenariul existent păstrează trei contexte izolate, control real de pointer/Enter/hotkey, dimensiuni850/1196, exactitatea runout-ului, cue-urile single/double și payouturi neschimbate360jetoane. Extensia testează întreruperea atât în spread, cât și în peel, revenirea preferinței la false, lipsa oricărei reînchideri, un singur cue și lipsa replay-ului după reload sau noi schimbări ale preferinței. Verifică HandRank propriu, independența celeilalte sesiuni și izolarea spectatorului. Se rulează pentru Hold’em și PLO; PLO păstrează exact două cărți proprii în evaluare.

Audio este măsurat în Chrome headless mut prin semnătura bufferului și numărul de starturi, fără difuzoare. Nu afirmăm paritate fizică de sunet/pixeli, suport double-board jucabil sau o politică de broadcast a serverului privat. Aceste limite rămân în obiectivul integral.

## Activare locală

Guarded idle rollout PID94131→99734; runtime /Users/davidai/.local/share/playgg-runtime/rabbit-motion-45628ce,121files/1405511bytes; existing1330art resources reused. Backup /Users/davidai/.local/state/playgg-rollouts/pr223-aw8frt47. All six owner files/15496bytes unchanged, no live gameplay QA writes. Served rabbit-view.mjs equals installed bytes. Evidence .git/danslab-qa/pr223-evidence.json and pr223-live.json.
