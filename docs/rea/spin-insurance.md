# Spin insurance — recovered contract and implementation boundary

Current source status: optional practice terms,capital policies,atomic insured registration/refund/award and private wallet receipts are implemented and tested. Owner insurance fields,the insured Play Now button and native award presentation remain incomplete. Insurance remains disabled in the installedPR119release. The sections below separate recovered native evidence from successive local backend stages.

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

## Explicit practice terms — backend stage

The optional owner stake-rule property `insurance: {premium, payout}` now accepts only whole positive play credits up to1000000000for each value. Omission disables the terms; there are no default values and no native tariff is inferred. Parent rules already require local-practice mode. Revision retries,strict checkpoint/audit validation and private cloned reads include these terms.

Queued matches snapshot the server rule as queueInsurance and return a cloned insuranceTerms object. Later owner edits affect future revisions,not an already matched table. Snapshot terms are checked against the retained rule audit on restart. Tests cover invalid/extra/fractional terms,disable and retry,real HTTP save/restart/backup restoration,failed-save rollback,pending-rule edit rejection,old-match immutability and tampered snapshot rejection. Uninsured engine/payout and HTTP queue regressions pass.

This stage does not purchase insurance,charge a premium,add capital exposure or pay an award. The player insurance action remains disabled. Owner form controls and transactional pre-draw purchase/refund/award integration are required before enabling it or releasing this backend stage. No live owner terms or balances were changed.

## Operator capital ledger — backend stage

The bank model now supports version4insurance policies alongside the existing jackpot reservation,while retaining old checkpoints unchanged. A policy holds max(premium,payout)credits until cancellation or draw. This conservatively covers both refund and award,including owner terms where premium exceeds payout; unearned refundable premiums cannot fund another match. Cancellation removes the premium from net funds and releases its hold exactly once. Draw settlement uses the committed100M ticket and the three-player x2trigger,then releases the hold and records the award obligation once. Jackpot settlement must use that same draw.

The draw is locked even when no policies were bought,so a post-draw purchase cannot exploit an empty policy list. Up to three active account-bound policies are accepted per match. Funding audit arithmetic reconstructs premium/cancellation/award effects at their funding sequence,including retained100-event history. Reads clone records; changed identities,conflicting draws,malformed checkpoints,insufficient capital and unsafe total balances are rejected. Reservation lookup/grouping avoids nested per-policy history scans.

Tests exercise both stakes/all eight outcomes,mixed premiums/payouts,full refund coverage,capital shortage,repeat actions,draw locking with zero buyers,interleaved funding,cold reconstruction,retained audits,three-seat limits,corruption and safe-integer overflow. Existing jackpot reserve/settlement,real Hold’em payout and owner bank HTTP/backup regressions pass. These bank-side primitives are not yet connected to player wallet debit/credit or the registration API; no live financial changes occurred.

## Atomic registration and wallet integration — backend stage

The authenticated queue now accepts an optional boolean insurance choice,with false/omitted preserving existing uninsured requests. Premium and payout come only from the owner's snapshotted terms; client-supplied amounts are rejected. Operation identity binds the choice as well as account/stake/revision,so changing it on retry fails. Registration debits the buy-in and premium and reserves capital in the same rooms checkpoint. Pending cancellation refunds both once and releases the policy hold. The third entry commits its registration,one draw,insurance award credits and private table together. The server returns the insured account's own insurancePayout receipt. A retry returns committed state without another transfer.

Wallets retain separate insurance spent/refunded/award counters and premium/refund/payout receipts. Loader validation reconciles every insured entry with its bank policy,matching draw and wallet totals,and rejects orphan policies or credits without an award. Policy lookup uses an ID/account map rather than nested history scans. Premium receipts display negative amounts; refunds and payouts display positive amounts in the existing private transaction history.

The isolated engine test covers mixed buyers,cancelled buyers,choice conflicts,failed third-registration writes,insufficient player balance/capital,award-overflow rollback,tampered wallet totals,zero/nonzero insurance awards,two complete900-chip tournaments,total bank/wallet conservation and cold restart. HTTP tests cover authentication/origin/types,no client amounts,once-only retry and saved award recovery. The actual browser wallet test observes−2000premium,+2000refund once,+10000payout once and3000→10000→13000balances across three cold restarts.

The insured Play Now button and owner insurance fields have not yet been connected to these terms. Insurance is not enabled in the livePR119installation. Native payout graphics/delay and exact operator configuration remain unverified; the server currently commits the explicit practice award at draw independently of later optional presentation. Full insured browser registration-to-winner acceptance and release QA are still required.
