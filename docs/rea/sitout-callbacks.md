# Sit Out: confirmarea serverului, Next Blind și pragul de revenire

Investigație REA din Game51, prin FFDec headless: patru clase exportate selectiv, completate cu surse păstrate și hashul SWF. Receipt: sitout-callback-source.json. Nu au fost folosite AIR, contul real, T3 sau difuzoarele.

## Cerere și confirmare sunt distincte

SitOutHelper.sitOutNextBlind selectează o rezervă cu SitOutNextBlind; pentru turneu/Spin alege SIT_OUT_NEXT_BLIND_ALL_TABLES. Controllerul trimite3128/SetAutoActionFlags și mapează flagurile de turneu separat. Numele și ramura de meniu nu stabilesc singure dacă declanșarea este înainte de SB, BB ori după o contribuție obligatorie.

OnSitOut(4009) primește PlayerId, Balance, KickOutTime, TriggerType și GlobalWaitingSeconds. Setează status SittingOut și soldul din notificare, pornește prezentarea prin mediator și ignoră ruta dacă există rushSession. TriggerType are UserAction/TimeOut/Forced/Disconnect; nu codifică o graniță de blind. OnBlindsPosted(4018) aplică sumele/dead/ante/straddle din payloadul serverului; în metoda citită nu există decizia pentru Next Blind.

OnTourneySitOut(4038) primește PlayerId și IsSitOut. Dacă indicatorul este identic, returnează fără reexecutarea tranziției. Altfel actualizează isSitOutOnTourney și mediatorul; la revenire șterge sitOutReserved. Mesajul nu conține SB/BB sau un timestamp care ar fixa semantica Next Blind. Nu atribuim protocolului o politică nedovedită.

Prin urmare Next Blind rămâne dezactivat. Următoarea verificare trebuie să găsească o dovadă suplimentară de eligibilitate/ordine a evenimentelor; nu îl activăm printr-o simplă verificare a poziției BB din motorul local.

## Descoperire aplicabilă: revenirea Short Deck

TableInfo.isHoldem include atât Holdem cât și SixPlusHoldem. hasButtonBlind înseamnă buttonBlind>0. dealMeInMin folosește override-ul dealMeIn pozitiv când există; implicit preferă4×buttonBlind, apoi2×thirdBlind, altfel2×bigBlind.

SitIn.onRequest(3108), pentru un utilizator deja în pauză, normal cash Hold’em/Omaha fără tournament entry, compară soldul cu dealMeInMin. Sub prag deschide OPEN_GET_CHIPS; altfel trimite sitIn. Acesta este un gate al clientului recuperat din sursă, nu o certificare a tuturor regulilor serverului privat. OnSitOut(4009) are suplimentar o ofertă automată Get Chips pentru sold mic, cu guarduri privind prima tranziție, catch-up și tournament entry; acea ofertă automată nu este adăugată prin această corecție.

Modelul local Short Deck folosește settings.blind drept live button blind. Candidatul corectează returnMinimum de la2×blind la4×blind numai pentru shortdeck; la blind4 rezultă16, nu8. Hold’em/Omaha obișnuit păstrează2BB. Nu sunt introduse override-uri de operator sau jocuri cu third blind, iar pool-urile Rush își păstrează finanțarea distinctă.

Pragul este comun cererii directe, revenirii globale cash și all-games și flagului privat returnFundingRequired. Cererea blocată nu mută bani și nu schimbă mâna. Pending Add Chips confirmat se ia în calcul, iar revenirea rămâne la următorul deal local.

## Verificare și limite

cash-return-funding-test --shortdeck a reprodus RED8versus16. Testul de model folosește un sold15 și o finanțare explicită1, verifică restartul pending-ului, revenirea all-games la exact16, cărțile mâinii următoare și30000total wallet+table. Limita de buy-in mică este fixture direct de model, nu o configurație Short Deck nou expusă ownerului.

Scenariul browser --cash-return-funding --shortdeck folosește configurația owner existentă cu buy-in fix120, joacă o mână reală care lasă12, apoi verifică Get Chips, Escape fără debit, restart și refill explicit108 până la buy-in-ul120 al mesei; mâna următoare și totalul468 sunt verificate. Nu relaxăm validarea ownerului pentru a face testul să treacă. Pragul clientului de revenire și suma minimă de refill a mesei sunt concepte distincte.

Candidatul trebuie validat exact-head și în pachetul instalabil înainte de activare. Politica serverului privat, oferta automată la intrarea în pauză, timerul de kick-out, next-blind și comparația fizică pixeli/animații/sunet rămân neimplementate sau neverificate. OnSitOut dublează viteza timerului când există waiting players, dar nu deducem din acest client durata ori politica serverului.
