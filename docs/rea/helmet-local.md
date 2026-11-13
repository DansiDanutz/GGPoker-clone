# Helmet: contract nativ și fundament local

## Stadiu

Există acum un fundament de server testat pentru starea Helmet per jucător. Nu există încă butonul,selectorul de scope sau grafica Helmet în aplicația locală. Această fișă nu declară funcționalitatea vizuală completă și nu confundă Helmet cu moderarea de către admin.

## Contractul recuperat din client

HelmetModePopup are340×265;alegerile sunt140×120la24/50și177/50. Activarea selectează This table implicit. Confirmarea emite CHAT_MUTE_STATE_UPDATE cu isPutOnHelmet și isAll. UpdateChatMuteStateCommand trimite schimbarea fie către masa curentă,fie către controllerul global. SetChatMuteAllTableCommand folosește sendToTables(SET_CHAT_MUTE);RestChatMuteAllTableCommand folosește sendToTables(CHAT_MUTE_RESET). Comenzile per masă cer updatePlayerProfile numai dacă există propriul jucător.

Globalul putOnHelmetMode este inițial false,iar setterul inspectat atribuie câmpul și cheamă readyToSave(). Există deci un hook de salvare a preferinței;nu rezultă doar din acesta o regulă dovedită pentru mese viitoare sau restaurarea după restartul operatorului. UpdateChatMuteTableCountCommand numără fațadele cu tableInfo.isUserChatMute și notifică mesele deschise.

Acestea sunt surse statice FFDec din clientul instalat. Providerul REA pentru SWF a fost respins;nu pretindem executarea lui sau recuperarea backendului operatorului.

## API local implementat

POST /api/rooms/{room}/helmet primește muted:boolean și opțional version valid numeric. Identifică locul din Bearer token;pentru un loc asociat unui cont cere și sesiunea locală a aceluiași cont. Corpul nu permite alegerea altui seat,scope global sau câmpuri necunoscute. GET este respins,iar ruta reutilizează limitele JSON și protecția de origine ale API-ului local.

Comanda setează explicit starea dorită,nu inversează orbește. Repetarea aceleiași stări nu crește versiunea și nu produce o a doua schimbare. Răspunsurile state/watch expun helmets:boolean[] în ordinea locurilor;nu expun tokenuri sau date private suplimentare. Identitatea înlocuită nu poate modifica noul ocupant.

În starea Helmet activă,serverul local refuză mesajele și reacțiile proprii. Alți jucători pot conversa. Dezactivarea Helmet nu înlătură o interdicție de chat impusă de admin. Aceasta este o regulă explicită a serverului local,nu o afirmație despre transportul privat al operatorului.

Starea per loc este salvată atomic împreună cu camera și supraviețuiește restartului local. O eroare la scriere reîncarcă starea confirmată anterior. Un loc nou începe fără Helmet;aplicarea unei eventuale preferințe globale la intrare nu este încă implementată. Checkpointurile cu helmet de alt tip decât boolean sunt respinse.

## Dovezi și ce rămâne

room-helmet-test.mjs verifică token/cont,payload strict,idempotence,flaguri publice,izolarea chatului,distincția față de admin,mâna neschimbată,rollback,restart,înlocuire și conservarea240jetoanelor la o plată reală. helmet-http-test.mjs exercită serverul temporar prin HTTP cu două conturi,origine/corp/metodă,logout,restart și reluarea chatului.

Urmează conectarea frontendului,selectorul This table/All open tables,răspunsurile parțial eșuate între ferestre,filtrarea vizuală și grafica nativă. Nu este făcută o instalare live a backendului pentru această fundație ascunsă;runtime-ul utilizatorului rămâne neatins până la integrarea controlului. Geometria/timingul nativ fizic și comportamentul operatorului la eroare sau restart rămân neobservate.
