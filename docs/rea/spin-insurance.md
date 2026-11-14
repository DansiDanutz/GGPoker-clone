# Spin insurance — recovered contract and implementation boundary

This is static evidence from the installed IronDesktop SWF and selected FFDec exports under the REA workflow. It does not claim an observed native purchase,operator configuration or a local insurance implementation. Source paths and SHA256 digests are retained privately in `.git/danslab-qa/spin-insurance-source.json`. No native account action or real payment was performed.

## Selection and visible quote

SpinAndGold.setInsuranceInfo indexes supplied insurance definitions by multiplier. getInsuranceInfoByMaxPlayer selects multiplier2 for ordinary three-player tables and4 for six-player tables. tagSitAndGoInsuranceInfo contains InsuranceId,Multiplier,Buying/PayoutRateAsBuyIn,Currency,AwardType and Delay; their presence does not establish current effective values.

SpinAndGoldWheelView.InsuranceView.setBuyinAmount displays a price equal to the entry buy-in B and a headline amount2B for3-Max or4B for6-Max. The ordinary wheel view positions this insurance panel at viewportWidth−400/y750. SpinAndGoldWheelView3D hides it when an existing buying-insurance ID is positive or the account's hide-insurance preference is set. Its click carries the entry buy-in and payment-priority flags into SitAndGoInsuranceData.

SpinInsurancePopup uses a300×230viewport. The title occupies x24/y55/252×21; premium and payout rows are centered at y91 and131. Labels use16px text and3px gaps; a green110×37OK button submits,while close cancels. The popup tests available T-dollar balance first,then ordinary balance,and disables OK when the quote cannot be covered. Its displayed payout is buy-in times the supplied insurance multiplier. These are UI quote/balance semantics; they do not prove backend premium or award-rate interpretation or a corresponding local play-credit configuration.

## Purchase and authoritative award

The table SetSitAndGoInsuranceCommand binds the tournament ID. The lobby command sends that ID,the insurance definition ID and payment-priority flags to the server. It does not locally debit a wallet or decide an insurance result. SuccessSitAndGoInsuranceCommand records BuyingInsuranceId from a successful response and hides the offer; failure does not invent a successful purchase.

OnSitAndGoInsurancePayout receives an explicit list of recipient user IDs and Award.AwardedMoney values. It converts InsuranceInfo.Delay seconds to milliseconds and forwards the award presentation unless the account hides it. The hide preference suppresses presentation; this callback is not evidence that financial entitlement is removed. Local implementation must distinguish committed wallet credit from optional/replayed presentation.

## Award presentation recovered from source

PlayerSpinAndGoldInsurance uses the Insurance_Glow timeline from spinandgold_animation at scale2. Text grows0.1→1.2andalpha0→1over500ms cubicOut,holds1500ms,then fades500ms. Coin motion begins after2000ms,uses player_cell atlas145and container scale0.7,then falls from y−170to0while fading over800ms cubicIn. The amount starts after text completion plus700ms,moves to y−95with500ms cubicOut,holds1000ms,then fades500ms. It uses the NEW_SPINANDGOLD_FONT at40px and player_cell atlas144plus sign. Exact timeline extraction,coordinates in each native seat and physical timing remain unverified.

## Required local financial boundary

The current local queue commits its draw when the third registration arrives. Queue responses and seated room state expose the resulting multiplier before the presentation ends. Therefore a new insurance purchase during the local waiting/spin scene would reveal the risk before purchase. The safe implementation must bind insurance selection and debit to the registration operation before draw,retain them across retries,and reject post-draw changes. This follows from current local state disclosure; it is not a claim about the native server's internal sequence.

A complete local implementation needs explicit owner practice insurance terms,server-side entitlement and adequate reserved operator capital,atomic fee/registration/refund rules,exactly-once award credit and failure/restart tests. It must not accept client-supplied winner/payout or derive a financial award solely from the help text or displayed quote. Existing uninsured registrations must remain compatible.

## Still unknown

Effective operator rates and IDs,play-money eligibility,purchase deadlines,partial batch failure/refund behavior and exact native payment settlement are unresolved. Native server financial behavior is not recovered from these client classes. Local insurance remains disabled until its explicit practice contract and transaction tests exist.
