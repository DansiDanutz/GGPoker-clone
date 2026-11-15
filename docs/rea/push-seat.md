# Push Seat — contract recuperat

Analiză statică a SWF-ului instalat, prin export FFDec selectiv în fluxul REA. Nu au fost trimise comenzi contului real. Hashurile surselor sunt în push-seat-source.json. Această fișă nu declară funcția implementată local.

## Acces și selecție

TableMenu3D afișează iconul table_menu327 dacă isUserPlaying(), !playInfo.isCatchUp și userPlayer.pushSeatRemainHandCount > 0. TablePlayer și OnPushSeatItemEarned stochează valoarea primită de la server minus1. Nu rezultă din acest cod cum se câștigă dreptul sau când îl consumă serverul.

TableMediator transmite numărul rămas, jucătorii și rezervările către PushSeatsView. Panoul ascunde propriul loc și orice loc rezervat; celelalte locuri, inclusiv cele ocupate, au selector. Selecția transmite indexul vizual prin SELECT_PUSH_SEAT și închide panoul. Clickul pe fundal închide fără comandă. Indexul trimis este locul fizic: PlayInfo.addPlayer indexează vectorul prin seatIndex, iar getPlayers/getReservedPlayers întorc vectorii fără reordonare. TableSetting.getPlayerPosition rotește numai coordonatele prin (seatIndex−userSeatIndex+N)%N. Requestul păstrează indexul fizic, nu indexul poziției desenate; PushSeatButton.seatIndex separat nu este folosit de SelectPushSeatCommand.

## Geometrie și animație

Fundal negru alpha0,5 de la y30 până la marginea de jos. Titlul PushSeatSelecting:32px alb bold, centrat la viewport.width/2 și viewport.height/3,5, lățime jumătate de viewport. Fiecare buton este centrat pe getPlayerPosition(index). Bitmapul table348 formează butonul; săgeata table349 este centrată într-un container la92/82. Containerul oscilează y82→102→82, câte700ms Ease.easeInOut; hide/reset opresc tweenul.

Caseta informativă este ancorată la10px de dreapta/jos: table350 nine-patch680×208, rect10/10/10/10; table351144×208; table352 la33/56. PushSeatInfo:31px alb, x168/y17/lățime490, multiline. Throwablesexpire:26px, culoare11776947, x168/y147/lățime490, parametrizat cu numărul rămas. Textele localizate și pixelii acestor resurse trebuie recuperați separat.

## Cerere, eroare și confirmări

SelectPushSeatCommand apelează reservePushSeat(index). ReservePushSeat trimite cererea3180 cu SelectedSeatIndex; schema include TableId/UserId. La trimitere salvează playInfo.isPlaying și contorul, apoi setează temporar contorul la0 pentru a retrage controlul. La orice rezultat diferit de Success restaurează contorul. ErrorAlreadyReserved/ErrorInvalidSeatIndex afișează PUSH_SEAT_OTHER_PLAYER_RESERVED; ErrorPushSeatNotAllowedReservedSeat afișează PUSH_SEAT_RESERVE_TO_RESERVED_SEAT. Success afișează PUSH_SEAT_RESERVE_COMPLETE numai dacă jucătorul era în joc la trimitere.

Callback4132 OnPushSeatReserved înregistrează SeatIndex/ReservedPlayerId și actualizează selectorii. Callback4133 elimină rezervarea și actualizează selectorii. Callback4134 OnPushSeatChanged setează pushSeatChanging din Start; la final afișează PUSH_SEAT_COMPLETE cu PushSeatNickName. Callback4131 actualizează dreptul rămas. O confirmare de rezervare nu dovedește că mutarea s-a executat.

## Obligații pentru implementarea locală

Rămân necunoscute arbitrarea serverului, acordarea/expirarea dreptului, ordinea și redistribuirea ocupanților, momentul mutării față de mână și tratamentul blindurilor. Nu înlocuim această funcție prin schimbarea CSS a avatarului sau prin evacuarea altui jucător. Implementarea va necesita politică locală explicită, autentificare, rezervare atomică, confirmare separată, conservarea soldurilor/tokenurilor și istoriei mâinii, rollback/restart și două cereri concurente către același loc. Backendul operatorului nu este recuperat din aceste clase.

## Actualizarea ocupanților

OnTakeSeat folosește NotifyTableTakeSeatParameter și actualizează PlayInfo prin addPlayer la seatIndex. Când pushSeatChanging este activ, suprimă ramuri obișnuite de intrare: verificarea inițială a utilizatorului, unele efecte/mesaje, revenirea globală Sit In și avertizarea Mandatory VPIP. Actualizează selectorii Push Seat după intrare. OnLeaveSeat elimină jucătorul după ID și delegă prezentarea către TableMediator.leaveSeat; nu conține algoritmul de redistribuire. Aceste observații confirmă că schimbarea este orchestrată prin evenimente server, nu prin permutarea locală a imaginilor. Nu dovedesc ordinea tranzacției sau politica blindurilor.
