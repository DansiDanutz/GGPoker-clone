> Ediție publică a fișei funcționale. `native-source` este un prefix logic pentru exporturile AS3 păstrate local. Fișierele de dovezi JSON menționate sunt private; nu sunt incluse aici. Secțiunile istorice se citesc împreună cu actualizările finale.

# Controalele dinamice ale administratorului

Aceste controale sunt create de lobby.mjs din datele serverului; nu apar în inventarul static al celor149de controale HTML. Sunt funcții independente ale administratorului local. Nu avem dovezi despre aspectul sau funcționarea panoului privat al operatorului GGPoker.

## Pe fiecare masă

| Control | Declanșare și rezultat real | Limite |
|---|---|---|
| Edit | Încarcă în formular ID-ul, numele, stackul, blindurile, modul și opțiunile salvate. Cheia owner din formular este păstrată. | Nu salvează singur modificările. |
| Duplicate | Apelează încărcarea din Edit, pregătește alt ID cu sufix aleator și numele «copy». | Masa este creată numai la trimiterea formularului. |
| Manage chat | Deschide secțiunea «Chat · numele mesei» și cere lista participanților umani prin GET/api/owner-chat?table=ID. | Nu modifică participarea la joc. Eroarea golește lista afișată și prezintă mesajul. |
| Mute / Unmute | Trimite POST/api/owner-chat cu tableId,seat,subject și noua valoare muted. Lista și eticheta butonului sunt refăcute după răspuns. | Afectează textul și reacțiile, nu pariurile. subject leagă operația de identitatea țintă și evită aplicarea ei unui înlocuitor doar pe baza locului. |

Lista de chat arată numele, dacă este cont local sau loc guest și starea Muted/Chat enabled. Pe durata cererii se blochează butoanele de moderare; chatBusy previne cererile concurente din aceeași pagină. Dacă moderarea s-a salvat dar auditul nu s-a scris, apare mesajul distinct «Moderation saved, but audit could not be written.» — interfața nu ascunde salvarea și nu declară audit complet.

## Pe fiecare arhivă de backup

Rândul arată createdAt, dimensiunea rotunjită înKiB și ID-ul arhivei, apoi patru butoane. Etichetele accesibile includ ID-ul arhivei, astfel încât două rânduri să nu fie confundate.

| Control | Traseu | Rezultat |
|---|---|---|
| Verify integrity | POST/api/owner-backups/ID | Prezintă numărul fișierelor verificate; nu restaurează date. |
| Download backup | GET/api/owner-backups/ID | Creează un BlobJSON și pornește descărcarea playgg-backup-ID.json; ancora temporară este eliminată, iar URL-ulBlob este revocat după1secundă. |
| Restore backup | Deschide confirmRestore după citirea arhivei | Nu înlocuiește date până la confirmarea exactă descrisă mai jos. |
| Delete backup | Deschide confirmDeleteBackup | Nu șterge arhiva la primul click. |

backupOperation serializează operațiile în aceeași pagină prin backupBusy, dezactivează butoanele secțiunii, afișează Working…, apoi reactivează controalele în finally. Lista goală afișează No backups yet. Descărcarea începută nu înseamnă că utilizatorul a salvat efectiv fișierul pe disc.

## Fereastra Restore local backup

Este un element dialog nativHTML deschis cu showModal, nu o imagine. Titlul, descrierea, ID-ul în element code, câmpul de confirmare, Restore local state, Cancel și mesajul role=status sunt create dinamic. Focusul inițial este pe câmpul de confirmare. Descrierea enumeră tabelele, conturile, sesiunile, notele și starea jocului care vor fi înlocuite; avertizează despre backupul de salvare și necesitatea terminării mâinilor active.

Butonul de restaurare rămâne dezactivat până când câmpul conține exact ID-ul arhivei. La pornirea cererii POST/api/owner-backups/ID/restore, inputul și cele două butoane se blochează. Escape nu închide dialogul cât timp operația este pending. Cancel înainte de cerere închide și elimină dialogul fără restaurare.

La succes, mesajul include ID-ul restaurat și rescueId. Interfața reîncarcă mesele și arhivele, golește afișarea auditului, resetează formularul păstrând cheia owner și cere selectarea unei mese pentru editare. Dacă restaurarea a fost confirmată de server dar reîmprospătareaUI eșuează, mesajul spune «State restored; refresh this page to reload the owner console.» Butonul de restaurare rămâne blocat, prevenind repetarea accidentală a operației deja efectuate.

În caz de rețea fără răspuns sau503, rezultatul poate fi incert: dialogul permite numai închiderea și cere reconectare/inspectare înainte de repetare. Pentru alte erori confirmate poate reda formularul și rescueId, dacă există. Aceasta este separarea explicită dintre «operația a eșuat» și «rezultatul nu a putut fi confirmat».

## Fereastra Delete local backup

Are titlu, descrierea arhivei exacte, câmp Confirm deletion ID, Delete archive, Cancel și role=status. Explică faptul că operația privește numai arhiva, nu tabelele, conturile sau jocul curent. Focusul este pe input. Confirmarea cere potrivirea exactă a ID-ului și trimite DELETE/api/owner-backups/ID cu confirm în corp.

Pe durata cererii inputul și butoanele sunt blocate, iar Escape este prevenit. Succesul reîncarcă lista și închide dialogul. După o eroare de rețea sau5xx, interfața cere verificarea listei înainte de repetare. Nu transformă automat o eroare de afișare de după ștergere într-o a doua ștergere.

## Aspect și dovezi

Controalele descrise sunt elementeHTML vii: button,input,dialog,span,li și mesaje text. Rândurile sunt reconstruite prin replaceChildren, etichetele folosesc textContent, iar confirmările folosesc showModal și role=status. Nu există o captură a administratorului privat original pentru a stabili o geometrie1:1. Descrierea aceasta documentează comportamentul și structura implementării locale; nu atribuie stilului local proveniență nativă.

Surse principale: GGPoker/lobby.mjs, funcțiile showBackups,confirmDeleteBackup,confirmRestore,backupOperation și manageChat; server.mjs și owner-backup.mjs/owner-restore.mjs aplică regulile serverului local. Registrul static este complementar. Verificarea curentă a ferestrelor de backup este consemnată separat după executarea testului --backup, fără operații asupra datelor live.
