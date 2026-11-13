> Ediție publică a fișei funcționale. `native-source` este un prefix logic pentru exporturile AS3 păstrate local. Fișierele de dovezi JSON menționate sunt private; nu sunt incluse aici. Secțiunile istorice se citesc împreună cu actualizările finale.

# Spin & Gold — configurație și limitele reconstrucției

## Ce există local

Lobby-ul oferă informații, structura blindurilor, premiile și explicația asigurării pentru3-Max play-money. engine/spin.mjs modelează rezultatele observate pentru5000/10000, distribuția premiilor și creșterea blindurilor după minute sau mâini. startingChips și timeBankCards rămân null intenționat. Nu există un flux Spin complet de matchmaking, roată, masă și rezultat în serverul local. Nu prezentăm lobby-ul informativ drept joc implementat.

## De unde primește clientul configurația

`tagSpinAndGoldTypeInfo` are TypeList, MultiplierSetList, ChallengeTypeList și InsuranceInfoList. Fiecare tagSitAndGoType leagă SitAndGoTypeIndex de MultiplierSetId, BlindStructureSetId și PrizeStructureSetId; include Currency, BuyIn, TicketTemplateId, TableType, BuyInGroup, CompleteBonusInfo, WinUpTo, CurrentPlayingCount și IsInsuranceAllowed. Acestea sunt structuri de protocol, nu valori recuperate dintr-o sesiune activă. Prezența unui câmp nu demonstrează că acel tip este activ pentru contul sau regiunea utilizatorului.

Un set de multiplicatori conține Id, Description și SitAndGoMultiplierInfoList. Fiecare element are Multiplier, IsBigPrize, NoDealing și PrizeType. Semantica completă NoDealing trebuie urmărită la consumatori înainte de a permite o mână locală pentru orice rezultat. IsInsuranceAllowed este permisiune declarată, nu dovada unei asigurări implementate local.

## Ordinea sectoarelor roții

SpinAndGoldMultiplierSetInfo alocă opt poziții. setMultiplierSet mapează elementele primite în pozițiile[6,2,4,0,1,5,3,7] și actualizează maximul observat. Ramura separată setWheelSegment pentru WSOP folosește[7,3,1,5,0,2,4,6], resetează maximul la1 și synchronizează elemente de tip WsopExpressSpinAndGoldWheelItem. Aceste ramuri nu sunt interschimbabile. Ordinea vizuală nu este ordinea probabilităților, iar o animație a roții nu trebuie să determine independent premiul. Durata, accelerația și oprirea roții nu sunt stabilite de această clasă.

## Valori implicite versus date active

SpinAndGoldBlindStructure declară mulX2=1, mulX3=2, mulX4=2, mulX5=3, mulX10=10, mulX50AndX100=15, jackpots=20, plus smallBlind și bigBlind din constructor. Numele proprietăților singure nu stabilește unitatea pentru fiecare categorie; capturile și consumatorii sunt necesari. SpinAndGoldMultiplierTemplate conține tabele implicite pentru mai multe buy-in-uri și un traseu WSOP separat. Nu transferăm automat o tabelă implicită într-o monedă sau într-un play-money tier cu altă scală. Modelul local păstrează rezultatele deja documentate din capturile native.

## Callback și backend

OnSpinAndGoldMultiplierDecidedBulk înregistrează mesajul2537, dar metoda onDispatch din această clasă este goală. Aceasta nu dovedește că aplicația nu tratează rezultatul în altă parte și nu justifică generarea unui rezultat aleator separat în fiecare browser. O implementare locală completă necesită un rezultat autoritativ persistat, aceeași configurație pentru toți participanții, recuperare după restart și un singur premiu contabilizat. Acestea sunt cerințe pentru backendul independent, nu afirmații despre codul privat al operatorului.

## Ce trebuie demonstrat înainte de activare

Trebuie stabilite: stackul inițial pentru multiplicator, rezerva de timp, traseul NoDealing, configurația3-Max corectă, politica locală de intrare și finanțare play-money, roata și animațiile, trei sesiuni izolate până la câștigător, premiile și restartul. Nu utilizăm contul real și nu inventăm valori pentru a declara paritate.

Sursele sunt exporturi statice FFDec din SWF-ul instalat; REA a respins formatul nativ. Hashurile și verificările sunt în verificare-spin-configuratie.json.

## Încărcare, sincronizare și limitele căutării NoDealing

SpinAndGold.setTypeData primește GetSitAndGoTypeListResponse: încarcă TypeList împreună cu MultiplierSetList, apoi asigurări, activarea provocărilor și ChallengeTypeList. setTypeList reconstruiește lista, sincronizează fiecare SpinAndGoldType, leagă multiplierSetInfo prin MultiplierSetId, copiază sectoarele și maximul, înregistrează bonusuri și sortează lista. Există o ramură de sortare suplimentară pentru brandul2Ace; nu o aplicăm automat PLAYGG.RO.

setMultiplierSet reconstruiește dicționarul de seturi și stochează separat Multiplier→PrizeType. În aceste metode nu este copiat NoDealing. Căutarea în exporturile păstrate player-source și spin-source a găsit NoDealing în declarația și deserializarea protocolului, nu un consumator de joc. Aceasta este o căutare limitată la corpusul exportat, nu dovada că proprietatea nu este folosită în întregul SWF. Nu decidem încă ce rezultat elimină împărțirea cărților.

SpinAndGoldType.sync păstrează moneda și buy-in-ul originale; buyinAmount și buyinAmountOnlyPayout convertesc spre USD când moneda nu este GPD. Excepția GPD contează: o valoare numerică dintr-un șablon monetar nu poate fi transferată automat către miza play-money.

## Informații native și aspectul listei de blinduri

SpinAndGoldTabInfoPage.setData afișează Hold’em, buy-in formatat în monedă,300–1000fise prin SnGStartingChipsValue,3-Max sau6-Max, start când sunt înregistrați participanții, interval1–3minute sau10–20 mâini și12secunde de acțiune. addTimeBankCell este apelat aici cu limite1și4; în modul fără carduri folosește10–30secunde. Sunt intervale de prezentare, nu tabelul exact per multiplicator. Asigurarea are și un guard de cont hideSpinAndGoldInsurance; textul explică restituirea buy-in-ului laX2, respectivX4 pentru6-Max, fără a demonstra că asigurarea este disponibilă pe orice tip.

În fereastra de informații a unei intrări concrete, BlindList.setEntry citește firstBlindStructure sau nivelul de pornire efectiv și schimbă antetul între Hands și Minutes după blindUpPolicyIsCountType. Antetul are320×24, trei coloane de106 unități; rândurile au320×22, text13, poziții x0/106/212. Rezerva folosește timeChipCount în carduri dacă useTimeBankChip; altfel convertește timeBank din milisecunde în secunde și adaugă «+» pentru nivelurile care au prev. Butonul/seleția unui nivel poate deci afișa suplimentul acelui nivel, nu numai rezerva inițială. Pentru că timeChipCount poate lipsi, codul afișează0 carduri, nu inventează o rezervă.

## Reverificare locală

spin-test.mjs trece pentru cele două mize observate: suma frecvențelor100milioane, toate granițele rezultatelor și premiilor,26niveluri, tranziții după minute/mâini, cap final și intrări invalide. network-browser-test.mjs --spin-info trece în browser izolat: cele două mize, cantitate de la1la4, taburi DOM,8 rânduri de premii,26de blinduri, focus/inert/Escape, explicația asigurării și Play Now dezactivat fără înregistrare. La viewport1200×957, testul verifică fereastra locală la x275/y233,643×523, raportată la geometria capturii păstrate; aceasta nu dovedește fiecare pixel nativ. Nu s-a creat un turneu Spin și nu s-au mutat fise în masa live.

## Proveniența exactă a stackului și rezervei

TourneyEntry.startingChips returnează configuration.StartingChips. configuration este tagTourneyTableConfiguration, iar StartingChips este deserializat din mesaj prin AlphaProtocolReader.readLong; TimeBankType este citit ca enumerare și MaxTimeChipCount ca întreg. TourneyBlindStructure.sync primește Timebank, Duration, TimeChipCount și HandCount1 din tagTourneyBlindStructureItem. Astfel sursa valorilor concrete este protocolul, nu intervalul generic din textul ferestrei. Nu avem încă un mesaj activ salvat care să asocieze valorile cu fiecare multiplicator.

Căutarea suplimentară a inspectat342fișiere JSON/XML/TXT independente din Game/assets sub limita12MB și nu a găsit cheile exacte StartingChips,TimeChipCount,NoDealing,BetMuckConditionRank. Dicționarul mare de traduceri a fost exclus din această căutare de chei, fiind deja analizat separat pentru texte. Arhivele și resursele binare nu sunt acoperite de acest rezultat negativ. Rezultatul căutării și limita sunt consemnate în verificare-spin-resurse.json.
