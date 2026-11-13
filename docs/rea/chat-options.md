# Opțiuni de chat — More și intrarea Helmet

## Dovezi și limite de acoperire

Analiza este statică FFDec, fallback în fluxul REA pentru SWF; nu este execuție AIR observată. Clase: ChatSender/ChatSetting, TableChat, ChatOptionPanel/ChatMuteCell și Button. Căile și hashurile sunt păstrate în raportul local. Constructorul nativ are trei opțiuni: AutoTranslate, HelmetMode și MobileObserverChat. Versiunea locală implementează More, Helmet și Observer Chat; spectatorii autentificați au trimitere și moderare reale. Traducerea rămâne neimplementată, fără buton fictiv. Contractul complet local este în observer-chat.md.

Panoul complet al mesei native nemute are trei rânduri la y20/50/80, înălțime124. Observatorul nu are Helmet; Helmet activ ascunde rândul spectatorilor. Local există două rânduri funcționale la y20/50 și un panou94 pentru participantul nemute; observatorul sau participantul cu Helmet are un singur rând în64px. Aceasta este o diferență rămasă față de panoul complet nativ, nu o potrivire1-la-1 declarată.

## Butonul More

ChatSetting folosește table_popup0418 normal,0419 hover/down și0420 selectat. Toate au24×24. ChatSetting.align pune controalele vizibile la pas30; containerul ChatSetting este la(12,45) în composer. Cu numai Emoji și More disponibile local, More este la(42,45). Poziția completă cu SnapCam/Giphy prezente va trebui comparată când acele funcții vor exista. Emoji și More se exclud reciproc; selectarea More nu șterge draftul.

## Rândul Helmet

ChatMuteCell are24px înălțime. Iconul este table_popup0443 activ/0444 inactiv,20×20 la(14,2). Eticheta Helmet Mode are13px, fontul implicit Roboto Condensed, x40, lățime160. Starea On/Off are13px, lățime50, x=width−83 și aliniere dreapta. Săgeata0342 normal/0343 over este6×11, la(width−26,7). Când Helmet este activ, check() păstrează state=over, deci săgeata0343 rămâne selectată. Eticheta este#fff activ/#666 inactiv, iar starea#ccc/#999. Textele EN sunt verificate în dicționarul instalat.

Clickul rândului emite CHAT_MUTE_UPDATE cu starea inversă, TableChat resetează composerul prin initChatView și transmite semnalul. Local se deschide selectorul existent This/All; draftul se golește fără a fi trimis. Cancel nu schimbă serverul; confirmarea folosește validarea/sincronizarea existentă și păstrează separarea de mute administrativ. More și rândul rămân utilizabile când Helmet blochează inputul, astfel încât utilizatorul poate reveni la chat.

## Aspect și animație

Fundalul mesei este#2a2a2a. Linia de jos este albă cu alpha0,1, x12 și lățimewidth−24. ChatOptionPanel.show face tween200ms cu Ease.easeInBack pentru poziție și alpha; hide folosește100ms. Implementarea folosește61mostre ale formulei, cu capete exacte și alpha limitată la0…1. La inversarea unei animații, punctul inițial este transformarea/alpha afișată curent, evitând săritura la clickuri rapide. Reduced-motion elimină/anulează tranziția fără panou rămas blocat. Escape închide meniul și întoarce focusul la More, inclusiv când focusul este în afara formularului. Nodurile rândului nu sunt reconstruite la polling.

## Verificare și lucru rămas

Fixture-ul Helmet folosește pointer real pe rând, verifică geometria/sprite-urile/fontul, eșantioanele animației, întreruperea/reduced-motion, Escape, excluderea Emoji, draftul și Cancel. Verifică accesul cu Helmet activ, apoi confirmarea din chat și scopul All fără comenzi duplicate, o mână240jetoane și restart. Fallbackul fără modulul de emoticoane păstrează controalele legacy și un More în fluxul formularului.

Rămân: traducere automată reală, toate cele trei rânduri și dimensiunea panoului complet, SnapCam/Giphy, comparație fizică AIR/WKWebView și temporizare/sunet native. Chatul spectatorilor extinde protocolul local existent; nu este un protocol operator recuperat și nu include un motor de traducere.
