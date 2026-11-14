# Spin de practică — masă Hold’em și decontare din motor

## Stadiu și proveniență

Implementarea sursă conectează înscrierile finanțate și rezultatul Spin la o masă cu3locuri. Folosește motorul Hold’em,side-poturile,eliminările și rendererul3-Max existente. Pozițiile recuperate prin REA/FFDec sunt descrise în three-max-layout.md; regulile observate ale premiilor/blindurilor sunt în spin-configuratie-nativa.md. Nu s-a măsurat o comparație fizică AIR cu această masă în aceeași mână.

Este încă un flux intern de practică: nu există intrare Spin publică din lobby și nici roată randată. Butoanele Play Now rămân dezactivate. Capturile și informațiile native nu stabilesc configurația exactă per multiplicator; regulile folosite în teste sunt explicit local-practice.

## Crearea și identitatea mesei

startSpinTable cere un rezultat salvat,trei înscrieri finanțate și reguli explicite pentru durata acțiunii,secundele unui card gratuit și limita cardurilor pe acțiune. Nu alege valori implicite native. Testele folosesc12/15/1,unde15secunde/card este o regulă sintetică de practică. Un rezultat configurat noDealing nu pornește o masă de cărți; ramura respectivă rămâne de implementat.

Masa și matchul folosesc același ID,cu verificare de coliziune și limită de camere. Crearea repetată cu aceleași reguli nu modifică fișierul; alte reguli sunt respinse. Legăturile match→room și room→match sunt păstrate și validate la încărcare. Sunt verificate conturile,configurația,moneda premiului,fisele și coerența decontării.

Numai cele trei conturi înscrise pot intra prin API-ul existent al mesei. Comparația identității este insensibilă la majuscule pentru Spin; numele vizibil vine din sesiunea autentificată. Intrarea în masă nu debitează din nou miza: entryCost intern este0,iar prizePool este premiul selectat,nu suma intrărilor din freezeout. Nu sunt create flaguri de finanțare cash sau de intrare în turneu obișnuit.

Participanții sunt fixați după extragere. Fill bots,Start cash,Leave/End practice și eliminarea locului nu pot schimba lotul acestui match. UI-ul nu oferă retragerea unei înscrieri deja decise. Recuperarea locului folosește autentificarea și tokenul existent. Politica viitoare de abandon/descalificare și computerele Spin rămân deschise.

## Motor,blinduri și timp

A treia intrare pornește o mână reală. Fisele inițiale și numărul cardurilor sunt cele din configurația explicită pentru rezultatul ales. Rămân3locuri și după eliminare; toate perspectivele folosesc grila3-Max comună. Mesajul local spune că miza este deja păstrată,nu «Free entry» sau că fiecare loc adaugă0la premiu.

Fiecare deal folosește spinBlindLevel cu timpul de început și numărul mâinilor deja jucate. Sunt păstrate26niveluri și progresia în minute sau mâini,după rezultat. Pentru unitatea hands,UI-ul afișează intervalul de mâini; pentru minutes afișează următorul timp aplicabil numai unei mâini noi. Timerul serverului procesează și aceste camere private,nu doar mesele din catalogul ownerului.

## Clasament și plată atomică

record/eliminationPlaces produc locurile finale din mâinile jucate. Pentru o masă conectată,settleSpin refuză orice ordine diferită sau o decontare înaintea câștigătorului real. Wrapperul aceleiași cereri de act/tick ia clasamentul motorului și actualizează banca,portofelele,matchul și ultima mână într-o singură scriere. Nu există tranzacție imbricată și nici plată separată care să poată rămâne după anularea mâinii.

Snapshotul protejează toate operațiile unei camere Spin. O eroare de plată sau de scriere restabilește întreaga stare; retry/restart nu plătesc încă o dată. Checkerul de încărcare respinge camera fără match,configurația ori poolul schimbat,participanți străini,fise neconservate și clasament/plată necorelate. Helperul sintetic neconectat păstrează testele financiare independente,dar nu poate suprascrie clasamentul unei mese conectate.

## Verificare executată

spin-table-test.mjs a trecut:trei conturi,refuz pentru cont străin/guest,creare idempotentă și rollback,refuz decontare anticipată,apeluri reale de pariere până la câștigător,900fise,clasament unic și100milioane în premii. Suma bancă+portofele rămâne200030000. Fiecare act este verificat și cu scriere eșuată; overflow-ul unei plăți restabilește inclusiv ultima acțiune. Reîncărcarea în timpul jocului și după premiu nu dublează debitarea sau plata. Un al doilea matchX2 joacă o mână fără all-in,apoi timerul trece la blind15/30 după61secunde; nivelul se păstrează după reîncărcare.

network-browser-test.mjs --spin-table a trecut în trei contexte Chrome headless/mute izolate. Conturile sunt create prin loginul local; numai pregătirea matchului este făcută direct în model,cât serverul temporar este oprit. Intrarea și pariurile folosesc controalele reale ale paginii,cu mouse. Fiecare payout este recalculat separat din cărți și contribuții,cu oracle-ul existent. Sunt verificate3locuri,900fise,clasamentul motorului,premiile private și conservarea băncii. Serverul este repornit după prima acțiune și după turneu; cărțile private,locurile și soldurile se păstrează.

Regresia --tournament --event-seats=3 a trecut pentru toate rotațiile la850/1196px,ancore native avatar/cărți/pariuri/dealer,chat/emoticoane,plăți,eliminări și restart. Acesta este suport pentru reutilizarea rendererului comun; nu dovedește skinul/fundalul Spin sau pixelii AIR. Testele de model Spin/portofele/restore existente trec de asemenea.

## Ce rămâne

Intrarea completă Home→Spin→cantitate→match,configurarea ownerului,roata și resursele native specifice,ramura noDealing,computerele,politica de abandon și configurația nativă efectivă rămân incomplete. Nu sunt verificate temporizarea fizică a animațiilor/sunetului,compararea pixelilor la aceeași stare sau toate variantele native. Nu au fost schimbate date ori fonduri Spin live în aceste teste.
