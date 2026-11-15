# Short Deck cash — Sit Out și revenire

## Dovezi și reguli

Sursele FFDec păstrate corespund Game51: SWF și TableInfo coincid cu hashurile receiptului anterior de aplicabilitate. TableInfo identifică SixPlusHoldem și folosește buttonBlind pentru stakes; headerul/meniul și comenzile cash globale nu îl exclud. TableMenu3D recunoaște explicit SIX_PLUS_HOLDEM între jocurile cash pentru chip controls. Hashurile sunt în shortdeck-sitout-source.json. Este analiză statică REA/fallback FFDec, nu execuție AIR sau cont real.

Engine-ul local existent cu36cărți, ante per jucător activ și blind egal pe buton rămâne neschimbat. Alocarea forțată nativă exactă nu este certificată. Revenirea păstrează pragul local2×blind configurat, nu îl declară regulă a operatorului Short Deck nativ. Nu se inventează datorii de blind, penalizări sau timpul de pauză.

## Comportament local

Pauza cerută din header, setări sau shortcut nu schimbă mâna în curs. Din mâna următoare, locul este omis de la cărți, ante, blindul pe buton și alegerile dealerului, iar soldul se păstrează. Avatarul/glyph-ul și stările Smoking/Restroom/Drink/Recharge folosesc controalele cash existente. Anularea în timpul unei mâini deja începute rezervă revenirea abia la distribuirea următoare și elimină starea pauzei atunci.

Comanda globală cash include acum și Short Deck; revenirea/funding-ul și cashout-ul păstrează aceleași granițe de cont/Origin/token și tranzacție. Cinci computere continuă fără Ready de la gazda în pauză. Mesele cu mai puțin de doi jucători activi nu distribuie o mână.

cashSitOut este folosit și de Rabbit Hunt. Testul a reprodus activarea neintenționată Rabbit după lărgirea categoriei; Rabbit are acum o condiție independentă care păstrează indisponibilitatea Short Deck până la verificarea acelui flux. Remove Chips/Push Seat și alte opt-in-uri nu sunt activate prin această schimbare.

## Verificări candidat

RED sitOutSupported lipsea, apoi RED Rabbit apărea neintenționat. GREEN verifică trei mâini cu profiluri finanțate: ante/button4, opening8/4/4, pauză fără acțiune,128jetoane păstrate, opening0/8/4 în pauză, revenire cu două cărți6–A și rotație fizică de buton, status, global pause/return între două mese, failed-save rollback, restart și payout/cashout cu total30.000credite. Testul separat cu cinci computere confirmă mai multe mâini fără gazdă și revenirea cu soldul păstrat după cold restart.

Browserul --cash-sitout --cash-sitout-account --cash-sitout-menu --shortdeck a trecut meniul, geometria la două dimensiuni, pointer/keyboard/Escape, state/restart/503retry, header/hotkeys/global scope/glyph-uri și Deal Me In; openingul8/4/4/4/4/4, lipsa ante-ului în pauză și payout-ul sunt verificate independent. Browserul --shortdeck --bots --hosted a trecut un jucător+cinci computere, două mâini, showdown, payout independent, reconectare și release.

Testul generic de apăsare F2 presupunea Call cu sumă. Sursa ActionButton confirmă y34+14=48 pentru Check fără sumă, iar Call păstrează28/71. Aserțiunea folosește acum due din starea legală a serverului; nu s-a redesenat panoul pentru a satisface o presupunere greșită a testului. Existing Short Deck evaluator1404clase/sidepot și Rabbit/Hold’em/Rush au trecut regresiile. Candidatul nu este încă activat; paritatea fizică nativă și next-blind rămân incomplete.
