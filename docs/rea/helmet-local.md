# Helmet: contract nativ și fundament local

## Stadiu

Fundamentul de server din PR #36 este conectat acum la un selector local This table/All open tables,la chat și la grafica Helmet. Integrarea este verificată în medii temporare;instalarea pe runtime-ul utilizatorului este înregistrată separat după gate-ul de publicare. Nu este o declarație de paritate vizuală integrală și nu confundă Helmet cu moderarea de către admin.

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

În etapa PR #36,frontendul,selectorul între ferestre,filtrarea și grafica nu erau conectate;integrarea lor este descrisă mai jos. Acea etapă nu a repornit runtime-ul utilizatorului. Geometria/timingul nativ fizic și comportamentul operatorului la eroare sau restart rămân neobservate.


## Integrare frontend și coordonare între ferestre

Table settings și fereastra de chat deschid același selector340×265,cu alegerile140×120la24/50și177/50. Alegerea activă este dezactivată,ca în sursă. Textele EN provin din PutHelmetOnThisTable,PutHelmetOnAllTables,TakeHelmetOffThisTable și TakeHelmetAllThisTables. OK aplică explicit starea dorită;Cancel/Escape nu trimit o comandă. Popupul rămâne deschis pentru o eroare parțială,cu posibilitate de retry;acest feedback este local și nu este atribuit operatorului. Chrome-ul ferestrei,titlul,footerul și text antialiasing nu au comparație nativă fizică.

Fiecare fereastră eligibilă înregistrează ID-ul ei,contul,camera,rolul principal/chat și momentul înregistrării;niciun token de loc. BroadcastChannel transmite comanda și primește confirmări de la reprezentanții meselor;nu transmite tokenuri de loc. All open tables folosește ferestrele înregistrate ale aceluiași cont,nu toate camerele în care contul are un loc. Camerele nedeschise și alte conturi rămân neschimbate. La eșec într-o fereastră sau lipsă de confirmare în5secunde,nu raportăm succes global;stările deja aplicate nu sunt inversate în tăcere. Retry este sigur prin API-ul idempotent. Închiderea normală/navigation/pagehide elimină înregistrarea;page-cache suspendat este înregistrat din nou la revenire. O oprire neașteptată poate lăsa o înregistrare neconfirmată,raportată ca eroare,nu ca succes.

This table funcționează și pentru un loc local de practică;All open tables cere un cont local. Rush nu are încă backend Helmet:controlul local rămâne ascuns acolo,iar o fereastră Rush înregistrată raportează explicit că nu poate confirma o comandă globală. Nu deducem aplicarea la mese viitoare din preferința globală nativă;această versiune adresează numai ferestrele înregistrate la momentul comenzii.

Cu Helmet activ,lista de chat este ascunsă,inputul este dezactivat și nu se adaugă reacții noi pe masă. Reacția proprie curentă este eliminată;reacțiile celorlalți deja montate își termină durata. Evenimentele suprimate nu sunt reluate la dezactivare. Pariurile și acțiunile mâinii rămân disponibile. O comandă locală așteaptă cel mult5secunde eliberarea cererii curente și are timeout de rețea5secunde,cu eroare/retry în locul unui busy permanent.

## Grafica și transformările verificate

Sunt extrase12imagini originale,37230bytes PNG. Selectorul și intrarea folosesc table_popup299/300/301,333/334,336–341 din init_lobby/desktop_assets. Casca jucătorului folosește exclusiv Starling player_cell0071din table_assets_1.atf,236×164. Imaginea are scale0.8în containerul1.1;poziția față de centrul jucătorului este−103/−130înaintea scalei locului. Intrarea de200ms folosește polinomul Ease.easeInBack cu1.70158;ieșirea de200ms folosește Ease.linear,defaultul confirmat al Tween. Reconectarea afișează starea finală,fără replay;reduced-motion anulează tranzițiile.

AtlasLoader și JsonTextureAtlas citesc dreptunghiul frame,nu sourceSize/spriteSourceSize. Unele metadate trim sunt inconsecvente;nu sunt folosite pentru a inventa dimensiuni. tools/extract-helmet.py refolosește decodorul ATF existent și verifică RGBA decodat pentru fiecare crop;receiptul și imaginile rămân în pachetul privat local. Comparația GPU/AA și sunetul/timingul fizic rămân neobservate.

## Teste suplimentare

helmet-scope-test.mjs verifică scope-ul,izolarea conturilor,lipsa tokenurilor în registry/mesaje,eroarea unui peer,confirmarea lipsă,eliminarea identității și cleanup. network-browser-test.mjs --helmet deschide două mese ale unui cont și o sesiune a altui cont,verifică geometria/artwork-ul,Cancel/This/All,camera nedeschisă,filtrarea chatului,reacțiile,o eroare de peer și retry. Joacă apoi o mână cu două sesiuni separate,verifică independent240jetoane și păstrarea nodului Helmet,apoi restartul fără replay. --bots --helmet-unavailable verifică și fallback-ul temporar când runtime-ul vechi nu servește încă modulul,până la instalarea backendului compatibil.


## O singură comandă per masă, inclusiv chatul detașat

Coordonarea grupează ferestrele după cont și cameră. Pentru fiecare altă cameră alege fereastra principală;dacă există mai multe,preferă înregistrarea principală mai nouă. Dacă nu există una principală,chatul înregistrat poate reprezenta masa. Camera de origine este aplicată local o singură dată,indiferent dacă utilizatorul a pornit comanda din masă sau din chat. Confirmarea nu mai depinde redundant de chatul aceleiași mese. Alegerea este implementare locală care urmează identitatea per TableFacade din sursa nativă;nu este un protocol recuperat al operatorului.

Popupul Helmet este exceptat explicit de la regula care ascunde conținutul mesei în fereastra de chat;selectorul poate fi văzut și utilizat și acolo. Testul de browser păstrează deschis chatul celeilalte mese și îl configurează să respingă orice comandă redundantă:All trebuie totuși să reușească,cu zero cereri în acel chat. Apoi pornește All din chat și verifică zero cereri redundante în fereastra principală a camerei de origine,starea reală a serverului și popup vizibil. Testele pure includ fallback la chat,înregistrare principală veche,conturi distincte și confirmarea lipsă. O înregistrare rămasă singură după un crash este în continuare raportată ca neconfirmată,nu eliminată în tăcere.
