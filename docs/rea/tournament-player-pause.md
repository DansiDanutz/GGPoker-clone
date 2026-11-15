# Pauza jucătorului în turnee și Spin — investigație REA

Stare: contractul clientului nativ identificat; implementarea locală este candidat în validare, încă neactivat în serviciul live. Pauza administrativă a turneului există separat și nu este echivalentă. Versiunea activă rămâne PR217; aceasta a extins numai pauza cash la Short Deck.

## Ce confirmă sursele originale

Hashurile surselor FFDec, ale SWF-ului și ale dicționarului derivat sunt în `tournament-player-pause-source.json`. Analiză statică; nici AIR, nici serverul privat nu au fost executate.

| Control / stare | Dovadă nativă | Implicație pentru reconstrucție |
|---|---|---|
| Pauză după mână | SitOutCommand convertește SitOutNextHand în TourneySitOutNextHand când există entry | Nu se reutilizează starea cash care elimină participantul din deal și blinduri |
| Pauză la blind | Același controller convertește separat TourneySitOutNextBlind | Nu se prezintă această opțiune drept funcțională până când declanșarea este implementată și testată |
| Toate mesele cash | GlobalSitoutCommand cere isGlobal și exclude isTourney/isSpinAndGold | Acțiunea cash existentă trebuie să continue să excludă turneele și Spin |
| Toate jocurile | SelectSitoutMenuCommand setează isAll și isGlobalAutoAction separat de isGlobal; GlobalSitoutCommand exclude Roshambo/AvatarRace și tratează VipJunket leave separat | Nu se redenumește simplu comanda cash în toate jocurile |
| Solicitare | SetAutoActionFlags folosește protocol3128: ChangingFlag, IsAdd, SkipLeavePenaltyCheck, IsGlobalAutoAction și RushSessionId când există | Starea dorită, starea aplicată și confirmarea serverului sunt distincte; UI nu trebuie să confirme optimist un save eșuat |
| Indicator activ | TablePlayer.isSitOut este status SittingOut SAU isSitOutOnTourney; acesta din urmă vine din data.IsTourneySitOut | Indicatorul de turneu nu este identic cu absența unui jucător cash din mână |
| Revenire pe turneu | SitInCommand elimină TourneySitOutNextHand prin setAutoActionFlags(...,false) în ramura entry; ramura cash trimite suplimentar sitIn/PostBlinds | Revenirea turneului nu este rebuy sau debit din portofel |
| Revenire globală | GlobalSitInCommand admite turnee/Spin numai cu isAll; leave-all le exclude | Revenirea cash existentă nu trebuie să schimbe aceste jocuri |
| Deal Me In | SitOutView construiește GlobalSitInData cu isAll=true și isFromDealMeIn=true | Butonul nativ are un domeniu mai larg decât revenirea cash locală actuală; diferență încă deschisă |
| Cronometru adversar | PlayerSitOutUI3D.isShowTime cere !isUser && !isTourneyPlayer și !param2 | Nu se inventează cronometru de expirare cash pentru jucătorii de turneu |

EAutoActionFlag definește CheckOrFold=8, TourneySitOutNextHand=512, TourneySitOut=1024 și TourneySitOutNextBlind=262144. Existența lor nu demonstrează singură politica serverului pentru fiecare decizie automată sau fereastra exactă de revenire.

## Unde trebuie să ajungă implementarea

`rooms.mjs`: tournamentHand trebuie să păstreze stackurile, ante/blindurile, cărțile și rotația pentru participantul în pauză; starea dorită se aplică separat la granița mâinii. tick/state și tickMulti trebuie să trateze actorul aflat în pauză fără a opri masa. Această rută trebuie să rămână distinctă de computerMove și de pauza administrativă a evenimentului. Recuperarea checkpointului trebuie să valideze noul indicator și să nu permită introducerea lui într-un cash game.

Migrarea MTT schimbă obiectele fizice de masă: preferința trebuie urmărită prin contul înscris și transferată împreună cu participantul, fără a se transmite înlocuitorului. Spin folosește aceleași camere de turneu, însă păstrează regulile sale de prezentare/ready, clock, eliminare și plată.

`server.mjs` și `network.mjs`: autentificare prin cont+token, POST/origin/body bounds, starea privată dorită versus indicatorul public, controlul curent versus global, retry după503 și revenire fără debit. Meniul nativ, setarea și hotkey trebuie să schimbe aceeași stare. UI nu trebuie să ascundă o contribuție obligatorie sau să afișeze adversarilor cărți private.

## Criterii de acceptare înainte de release

1. Solicitarea în mijlocul mâinii nu modifică pariul, cărțile, clockul administrativ sau portofelul; anularea înainte de următorul deal nu activează pauza.
2. Mâna următoare păstrează plata blindurilor/ante, rotația și totalul jetoanelor. Check când nu există sumă de plătit și Fold când există trebuie documentate ca politică locală până la dovadă nativă a execuției; niciodată Call/Raise automat din presupuneri.
3. Turneu cu participanți izolați, participant în pauză și eliminare până la câștigător; payout și portofel verificate independent. Varianta all-paused nu poate bloca schedulerul.
4. Salvare eșuată, retry, restart activ și între mâini; revenire fără cărți noi introduse în mâna curentă sau reexecutarea plății. Momentul exact al revenirii rămâne de stabilit înainte de UX.
5. MTT reechilibrare/mutare/masa finală și Spin3/6: preferință legată de identitate, blinduri, premii și conservarea fondurilor. Pauza ownerului rămâne separată.
6. Verificări reale de pointer/hotkey, domeniu cash versus all-games, spectator fără acțiuni/cărți private și pachet instalabil. Comparația fizică nativă/pixel/audio rămâne un gate separat.

## Necunoscute și limitări

Clientul nu dezvăluie politica completă a serverului pentru blind-out, auto-check/fold, revenire în mijlocul mâinii, penalități sau kick-out. Acestea necesită dovezi suplimentare ori reguli locale declarate explicit. Nu certificăm comportament nativ din numele enumurilor. Nu au fost folosite contul real, T3, ferestre în prim-plan sau difuzoarele.

## Candidat local — implementare și verificări

`tourneySitOutNextHand` este preferința privată dorită; `tourneySittingOut` este indicatorul aplicat la deal. `tournamentHand` păstrează stackurile, cărțile și toate contribuțiile obligatorii. Schimbarea preferinței nu modifică mâna curentă. Revenirea este la următorul deal, o regulă locală explicită până la verificarea serverului original. Acțiunile manuale, rezervate și folosirea time bank sunt blocate cât timp indicatorul aplicat este activ.

Schedulerul obișnuit și MTT aplică Check când nu există sumă de plătit, altfel Fold, după500ms. Acesta este comportament local declarat; nu afirmăm că500ms este temporizarea nativă. O pauză nu consumă automat TimeBankCards. MTT transferă preferința împreună cu obiectul contului, rotește tokenul și acceptă participanții în pauză la bariera Ready între mâini. Pauza administrativă păstrează funcția distinctă de înghețare a ceasului evenimentului.

Meniul curent pentru turneu folosește trei rânduri560×224, față de patru rânduri560×288 la cash. Sursa SitOutList.menuAlign calculează40+56N+8(N−1); setSitOut ascunde rândul leave-cash în turneu. Cheile native SitOutAllNow și SitOutAllTableNB sunt păstrate; acțiunile globale și next-blind rămân dezactivate până la implementarea lor. Nu sunt înlocuite cu acțiuni cash. Butonul Deal Me In local revine numai pe masa curentă în această etapă, spre deosebire de isAll din sursa nativă; diferența rămâne deschisă.

Testele modelului acoperă Hold’em/PLO, blinduri/cărți, starea privată, auth/body, rollback, checkpoint corupt, restart și premii. Formatele Spin3/6 și MTT7 sunt jucate cu participanți în pauză, cu mutări între mese, fără Ready manual pentru cei în pauză, apoi cu revenire când este necesar; conservarea jetoanelor, băncii și portofelelor este verificată. La un blind plafonat, toți participanții în pauză pot schimba blinduri fără eliminări: schedulerul continuă mâinile; nu inventăm eliminări forțate. Testul reia un supraviețuitor și verifică încheierea turneului.

Scenariul de browser cu trei contexte izolate verifică pointer real, geometria meniului, contribuția big blind a jucătorului în pauză, ascunderea opțiunilor de pariere, restartul serverului, retry503, revenirea la următorul deal și payoutul prin oracle independent. Validarea exact-head și a pachetului instalabil urmează înainte de release; comparația fizică nativă nu a fost efectuată.

Battle Royale final rămâne exclus din această primă rută de pauză până la teste specifice; nu se extinde implicit eligibilitatea unui format netestat.

Revizia panoului admin a reprodus status playing în loc de sitting-out pentru un jucător cu indicatorul de pauză aplicat. seatRoster include acum același indicator ca vizualizarea mesei; test RED→GREEN în tournament-player-sitout-test. QA pentru primul commit rămâne istoric; release-ul cere repetare pe ultimul commit.
