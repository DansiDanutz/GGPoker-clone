# Localized betting caption readability

The rendered Romanian AskWhenEnterBet caption measured54px tall against32px source row spacing,overlapping the preceding caption. This is reproduced by geometric acceptance,not inferred from source alone. The previous forced18px CSS line-height was an approximation.

REA traces ChooseItem:206px word-wrapped/multiline Roboto14 title,height0,center−2+(24−height)/2. Label converts height0 to vertical autoSize; STextField passes100000px compositor height. Therefore source autoScale does not establish a32px native height constraint. Original Romanian physical typography remains unverified and is not invented. The shipped font reports Roboto Regular,1024unitsPerEm,hhea1056/−261/170; these SFNT/browser metrics are not AIR calibration.

A local readability safeguard marks only the three betting row captions. It retains full catalog text,206px column and32px row positions,uses browser natural line-height and decreases14px in integer steps until the actual wrapped box fits32px,with the existing native-style five-pixel floor. Short text resets to14. This height constraint is explicitly local,not claimed as exact native behavior. Other labels retain existing single-line fitting.

Existing translation handling rechecks on locale,font,resize and visibility changes,including a page translated while hidden. Drafts,focused inputs,full accessible label text and prepared bets remain unchanged. Styles are measured synchronously within the update before paint; no polling/timer or new dependency is added.

Acceptance:RED54px Romanian caption;pure decrement/reset/floor/zero-height/wrap-discontinuity cases;actual Romanian full-text nonoverlap and≤32px;English reset after hidden-page locale switch;full settings/preset/Enter/restart and two-hand payout regression before publication. Physical native typography,animation/audio and whole-app parity remain incomplete.
