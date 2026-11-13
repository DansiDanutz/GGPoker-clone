# Meniul emoji — inventar nativ, implementare incompletă

TableEmoticonList construiește un viewport296×510. Fundalul are alpha0,9,culoare723981,cu linii sus/dreapta de1px culoare2960685. Sliderul primește înălțimea viewport−50; scrollbarul are lățime8 la x290,y1. Taburile sunt poziționate la y=height−48.

Lista este sortată după idx. La lățime296,împărțirea întreagă la66 produce4coloane,cu pas66 pe ambele axe. Containerul este centrat din lățimea efectiv ocupată; înălțimea sursei sliderului este actualizată după ultimul element. Clickul emite exact RECOMMAND_EMOTICON_SELECT cu index și avatarName.

Există filtre și un traseu separat pentru avatar emoji, cu filtrul10000,AvatarEmojiManager/AvatarEmojiSet și context junket. Lista reacționează la schimbarea limbii și încărcarea seturilor avatar. Acestea nu sunt echivalente cu cele trei butoane locale Angry/Listening/Laughing.

Rămân de trasat EmoticonItem/EmoticonTab,datele fiecărui filtru,corespondența idx→resursă/etichetă și transformarea selecției în trimitere. Nu numim meniul local1-la-1 înaintea acestor dovezi și a comportamentului implementat. Exportul este static FFDec fallback în fluxul REA,nu execuție nativă REA.
