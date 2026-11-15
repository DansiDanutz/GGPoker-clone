# Oferta automată Get Chips la intrarea în pauză

## Dovada nativă

REA/FFDec: `OnSitOut.onDispatch`, callback4009, din Game51. Identitatea sursei, protocolului și SWF este păstrată în [sitout-callback-source.json](sitout-callback-source.json). Refolosim exportul selectiv existent, fără AIR, cont real sau o nouă captură fizică.

Handlerul ignoră player necunoscut și rushSession. Reține dacă statusul anterior era SittingOut, apoi aplică notificarea de pauză. Numai pentru propriul player, prima tranziție, fără `playInfo.isCatchUpOrPaused` și fără tournament entry, pe masă normală Hold’em/Omaha, emite OPEN_GET_CHIPS dacă balance este strict sub4×buttonBlind sau, fără buttonBlind, sub2×bigBlind. Nu trimite implicit o cumpărare ori o revenire. Game51 TableInfo.isHoldem include SixPlusHoldem.

Această ofertă are pragul default explicit din OnSitOut; nu deducem din ea override-ul dealMeInMin/thirdBlind folosit de requestul SitIn, nici momentul de pauză decis de serverul privat.

## Implementarea locală

`network.mjs` verifică tranziția aplicată în `applyState`, pentru aceeași identitate proprie așezată și cu `sitOutSupported` cash pe ambele stări. Primul snapshot, observatorul, chatul separat, turneul și Rush nu produc oferta. Nu cere ca celelalte locuri să fie identice: alt player poate pleca în aceeași actualizare. Folosește soldul public al propriului loc și returnMinimum (2BB/4buttonBlind în configurația locală actuală), apoi reutilizează `openAddChips` și toate gardurile dialogului existent: sold de wallet verificat, pendingAdd, ready, identitate, mână și submit explicit. Nu adaugă endpoint, persistență, debit ori schemă nouă.

Anularea păstrează pauza și portofelul. Pollingul și reloadul nu simulează o nouă tranziție; oferta nu reapare. Butonul Deal Me In poate redeschide manual dialogul dacă pragul nu este îndeplinit. Confirmarea explicită păstrează mecanismul existent de fonduri pending pentru mâna următoare.

## RED → GREEN și gate

`node network-browser-test.mjs --cash-return-funding --cash-auto-get-chips` a eșuat înaintea implementării, așteptând dialogul automat. Extensia intră în browser înainte ca pauza să fie aplicată, verifică absența ofertei înaintea tranziției, apoi dialogul automat, Escape fără debit, lipsa replay-ului la polling/reload, revenirea manuală și un singur debit explicit. Mâna curentă rămâne identică; mâna următoare primește stackul finanțat. Scenariul rulează și cu `--shortdeck`: ordinary4→16/refill12/table268; Short Deck12→120/refill108/table468. Regresia `--cash-sitout --cash-sitout-account` verifică faptul că un loc finanțat în pauză nu primește această ofertă.

Stare: integrat și activ local prin PR225, merge0f3d75c7a7a7fd73bff30c83543598f4954f58c8, sursă2c14216b8f11ecf376ff9850a0fcfdc9873686e9. Cele19verificări exact-head au trecut:14pe sursă, patru scenarii instalabile și review cu11identități native. Fără comparație fizică nouă a popupului nativ, catch-up AIR sau timing de server. Pauza locală rămâne next-deal; Next Blind rămâne dezactivat până la o dovadă adecvată.

## Activare

Runtime121fișiere/1405875bytes în `/Users/davidai/.local/share/playgg-runtime/auto-get-chips-2c14216`, art1330refolosit. Rollout idle PID99734→52129; backup `pr225-pjumusv2`. Toate cele șase fișiere owner/15496bytes identice, fără QA de gameplay pe live. `network.mjs` servit este identic cu pachetul verificat. Evidence `.git/danslab-qa/pr225-evidence.json` și `pr225-live.json`.
