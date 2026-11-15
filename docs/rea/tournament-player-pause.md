# Pauza jucătorului în turnee și Spin — investigație REA

Stare: contractul clientului nativ identificat; comportamentul local al pauzei jucătorului NU este încă implementat. Pauza administrativă a turneului există separat și nu este echivalentă. Versiunea activă rămâne PR217; aceasta a extins numai pauza cash la Short Deck.

## Ce confirmă sursele originale

Hashurile celor zece surse FFDec sunt în `tournament-player-pause-source.json`. Analiză statică; nici AIR, nici serverul privat nu au fost executate.

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
