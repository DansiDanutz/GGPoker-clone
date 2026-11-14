# Spin insurance — recovered contract and implementation boundary

Current release status: [PR #120](https://github.com/DansiDanutz/GGPoker-clone/pull/120) is merged at `28d5cb370ad2a229bd3cbf779046edfd35f881ca`. The local installation runs tested source `6f18424c9734844847bcffced97614e456844458`. Explicit owner terms, insured registration, cancellation, refund, award and native-source seated presentation are available. Existing live terms and balances were preserved; insurance requires an owner's explicit future configuration. Physical native pixel/audio parity and effective callback delay remain incomplete. The native visibility gate is account/brand-derived, not a player preference; see the correction below. The sections below retain successive historical stages; this release statement supersedes their unreleased status notes.

This is static evidence from the installed IronDesktop SWF and selected FFDec exports under the REA workflow. It does not claim an observed native purchase,operator configuration or a local insurance implementation. Source paths and SHA256 digests are retained privately in `.git/danslab-qa/spin-insurance-source.json`. No native account action or real payment was performed.

## Selection and visible quote

SpinAndGold.setInsuranceInfo indexes supplied insurance definitions by multiplier. getInsuranceInfoByMaxPlayer selects multiplier2 for ordinary three-player tables and4 for six-player tables. tagSitAndGoInsuranceInfo contains InsuranceId,Multiplier,Buying/PayoutRateAsBuyIn,Currency,AwardType and Delay; their presence does not establish current effective values.

SpinAndGoldWheelView.InsuranceView.setBuyinAmount displays a price equal to the entry buy-in B and a headline amount2B for3-Max or4B for6-Max. The ordinary wheel view positions this insurance panel at viewportWidth−400/y750. SpinAndGoldWheelView3D hides it when an existing buying-insurance ID is positive or the account/brand visibility gate is set. Its click carries the entry buy-in and payment-priority flags into SitAndGoInsuranceData.

SpinInsurancePopup uses a300×230viewport. The title occupies x24/y55/252×21; premium and payout rows are centered at y91 and131. Labels use16px text and3px gaps; a green110×37OK button submits,while close cancels. The popup tests available T-dollar balance first,then ordinary balance,and disables OK when the quote cannot be covered. Its displayed payout is buy-in times the supplied insurance multiplier. These are UI quote/balance semantics; they do not prove backend premium or award-rate interpretation or a corresponding local play-credit configuration.

## Purchase and authoritative award

The table SetSitAndGoInsuranceCommand binds the tournament ID. The lobby command sends that ID,the insurance definition ID and payment-priority flags to the server. It does not locally debit a wallet or decide an insurance result. SuccessSitAndGoInsuranceCommand records BuyingInsuranceId from a successful response and hides the offer; failure does not invent a successful purchase.

OnSitAndGoInsurancePayout receives an explicit list of recipient user IDs and Award.AwardedMoney values. It converts InsuranceInfo.Delay seconds to milliseconds and forwards the award presentation unless the account hides it. The account/brand visibility gate suppresses presentation; this callback is not evidence that financial entitlement is removed. Local implementation must distinguish committed wallet credit from optional/replayed presentation.

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


## Owner and player controls — source branch, not released

The owner form enables optional insurance separately per stake, with blank premium/payout fields and no inferred tariff. Saved terms restore after restart; disabling the checkbox removes them from subsequent revisions. The player sees the explicit extra premium, x2 payout and total per-game entry price before choosing insured Play Now. Pending batches preserve their insurance choice, stake, revision and operation IDs across reloads; the opposite purchase mode stays disabled until recovery finishes. Account changes isolate saved requests, and malformed storage disables registration rather than submitting guessed requests.

The three-browser insured journey exercises cancellation, lost-reply retry, account switching, malformed-storage recovery, one-to-four registration, actual table opening/seating, wheel, tournament winner, independent payouts and restart. It verifies six premium charges and five refunds for the batch fixture, plus conserved operator/player funds. Owner browser coverage checks blank defaults, per-stake separation, save/restart and disable.

A structured server rejection `spin_rules_changed` distinguishes an uncommitted stale operation from an uncertain network failure. Prior committed operation lookup runs first, so retrying an already paid entry remains idempotent. On this rejection the client clears only its unchanged saved batch, refreshes terms and requires another explicit purchase. Changed storage is preserved for review; this guard is not an atomic cross-tab lock. HTTP and normal stale-term browser tests verify no charge, no registration, a fresh operation after review and one refund.

These source changes are not enabled in the live PR119 installation. Native award graphics/delay, full physical comparison and commit-bound installed-release QA remain pending. Historical stage sections above describe their respective earlier implementation boundaries.


## Insurance motion interpreter — not yet rendered

`spin-insurance-motion.mjs` reconstructs the selected PlayerSpinAndGoldInsurance tweens and the recovered Ease cubic functions. Text grows/fades at0–500/2000–2500ms; the coin falls/fades at2000–2800ms; amount motion starts at3200ms, reaches−95at3700ms and fades4700–5200ms. Text stays at y−65, coin scale0.7; its caller supplies two explicit random rotations within±90degrees. The text-highlight sweep repeats a500ms delay followed by1500ms cubic ease-in/out. Completion is terminal at5200ms. The function accepts elapsed presentation time only and performs no award, random draw or wallet transfer.

Boundary/halfway/invalid-input tests pass, including cubic interpolation and terminal stability. Floating-point scale comparisons use tolerance rather than rounding native interpolation. This is a pure motion interpreter, not a rendered award: Insurance_Glow timeline, language-specific atlas text, plus/coin glyphs,40px amount rendering, sound cues, seat coordinates and server presentation/replay synchronization remain to be connected. No live installation was changed.


## Exact desktop insurance glyph extraction

`tools/extract-spin-insurance.py` selects desktop atlas player_cell0138–0145: Korean text/highlight, English text/highlight, Chinese text/highlight, plus and coin. The StageAssets desktop frame-only loading rule is preserved; repeated699×227trim/source metadata is not used to enlarge glyphs. English text is180×22,its highlight176×18; plus60×56and coin50×50. Native HighlightText places the highlight at its own origin rather than synthesizing the metadata's two-pixel inset.

Extraction with the existing Homebrew Python3.14/Pillow succeeded twice, verifying every output RGBA byte and refusing differing preexisting output. Eight private assets total33624bytes; source and output hashes are retained in ignored home-art/rea/spin-insurance-art.json. The default system Python lacked Pillow; the installed interpreter was reused without adding dependencies. Glyph extraction does not establish rendered seat placement or complete the Insurance_Glow timeline, amount font or audio. No native GUI, speakers or live owner data were used.


## Insurance_Glow timeline recovery

Read-only SWF tag inspection identifies Insurance_Glow as sprite14with270frames, frame label start at1and end at270. The75360-byte installed spinandgold_animation.swf declares30fps; English and Chinese text movie clips are separate sprites11and6with170frames,not the atlas HighlightText component used by the selected player extension. The glow export bounds are203.5×203.5and its exported origin is101.75/101.8. Parent PlayerSpinAndGoldInsurance applies scale2.

Selected frames1/135/270were exported first, then all270frames with the installed FFDec. `tools/pack-spin-insurance-glow.py` checks complete numbered frames,fixed dimensions/origin,local-only embedded image references and exact canonical body/definition retention. It rejects scripts,event attributes and external links. Two packing runs produced identical bytes:11697047raw SVG bytes→11552190packed bytes,264unique definitions. This effect deduplicates poorly; no lossy raster conversion was substituted. Outputs and per-frame hashes remain private under Sandbox/home-art,about23.3MB total including keyframes and manifests. No dependencies or GUI were started.

The SWF's declared full duration is9seconds,but the parent's allComplete/reset stops the glow when the text/coin/amount chain finishes at5200ms. A renderer must respect parent cancellation rather than independently looping the full270frames. Actual StageMovieClip scheduler cadence and native physical timing are not proved merely by the SWF frame-rate field. These frames are recovered but not yet rendered in the player table; amount font/audio and presentation acknowledgement/replay integration remain open.


## Browser glow renderer checkpoint

`spin-insurance-glow.mjs` validates and decodes the private270-frame pack, draws with the source101.75/101.8origin and scale2, and exposes a nonlooping30fps index terminated by the parent's5200ms completion. The server explicitly serves this module. The isolated muted headless test decoded all270frames,observed49115visible pixels at its sampled peak,distinct start/middle hashes and matching empty first/last poses. Index boundaries0/5199/5200ms return0/155/null; after completion no pixels are drawn and the canvas transform remains unchanged. Invalid frame indices and injected SVG script content are rejected. SVG namespace declarations are validated separately from external resource references,including FFDec's inert metadata namespace.

This test proves native exported SVG browser decoding and the declared source geometry/cut-off,not pixel equality with a live Mac rendering. The module is not yet attached to the player award scene; native StageMovieClip playback cadence,amount/coin/text compositing,audio and replay synchronization remain open. No live owner writes or deployment occurred.


## Native text, coin and amount browser compositor

`spin-insurance-render.mjs` loads the exact language-specific text/highlight,coin/plus and existing newspinandgold bitmap font. The shared bitmap layout now accepts the required40pxsize alongside its existing32/90pxcallers. Source placement is retained:text centered at y−65,highlight alpha0.4through a100×50mask rotated135degrees,coin centered/scaled0.7,and amount centered with half-size plus at x−20and integer vertical centering. Amount mesh-bound normalization retains the existing explicit Flash subpixel calibration limitation.

The real muted headless browser test checks all three language widths180/145/80,visible text/coin/amount poses and zero drawing at completion. Sampled counts for English are5296/5019/5970/0at1000/2400/4000/5200ms. Unsupported amount glyphs preserve the previous canvas; injected font503fails cleanly; canvas transforms remain unchanged. Existing90pxcongratulation/32pxresult layout regression passes. Assets are disposed on failed load; dimensions and supported language are validated. No wallet code runs in this renderer.

This is the source-data compositor rather than an observed native screenshot comparison. The native source applies deg2rad before assigning the Flash Sprite coin rotation; the motion interpreter accepts explicit numeric endpoints and does not silently choose a physical rotation convention. A scene must preserve the source conversion instead of assuming±90Sprite degrees. Sound,player-seat extension placement and authoritative presentation/replay wiring remain pending; no live deployment occurred.


## Native audio and combined animation checkpoint

Recovered SoundItem mapping pins SNG_INSURANCE_TEXT→SoundSngInsuranceText,SNG_WHEEL_PRIZE_CHEERS→SoundSngPrizeCheers,and SOUND_SNG_PRIZE_DOLLAR→SoundSngPrizeDaller(the native spelling). The extractor's insurance mode verifies155520/73728/129024samples at44100Hzand original MP3 sync. Exact payload sizes are49371/23405/40960bytes. A second isolated extraction matched the installed private working assets byte-for-byte; temporary verification output was removed by its own context manager. Native payloads remain uncommitted.

`spin-insurance-presentation.mjs` combines source motion with once-only sound thresholds0/2000/3200ms,delta validation and cancellation. Existing audio effects routing,master/channel mute and sample-duration caps are reused. Server audio paths enumerate only these additional names and load their private snapshots. Preloading uses the existing authorized audio context. The full muted browser scene test ran314RAFdraws,observed59415visible pixels,emitted the three source cues and observed exactly three real WebAudio source starts. Final canvas was empty and its transform unchanged. No speakers played.

Threshold/retry/cancellation/invalid-delta and sample-cap tests pass,as do existing channel,volume,wheel and table-audio regressions. This combined scene is an isolated browser acceptance harness,not yet the player-table award integration. Per-seat attachment,authoritative award presentation metadata,delay/replay acknowledgement and restart behavior remain required. Physical native cadence/audio parity is unverified. Source components are pushed but not merged/deployed.


## Player-table award integration — source branch

New Spin rooms snapshot account-bound positive insurance awards from the committed x2draw and insured registrations. Checkpoint reconstruction compares those awards with the authoritative entry/terms and rejects altered recipients or amounts. Seated state maps awards to current seat numbers without exposing wallet balances/account identifiers; anonymous observers receive no award list. Older rooms without the optional snapshot preserve their existing presentation lifecycle. Presentation completion accepts no client amount and performs no transfer.

The existing wheel scene now follows its completed wheel with the insurance scene before calling the persisted spin-ready completion. All three completed accounts are still required before the first hand and action clock start. Asset failure uses the existing explicit Retry; once completion is saved,reload does not replay the scene. Pending presentation can replay after reconnect without crediting again. The local sequence is explicitly wheel→insurance→ready; the native operator's callback Delay/configuration has not been recovered and is not inferred from this practice ordering.

Placement is derived from retained PlayerCell3D/PlayerExtension/PlayerPosition/Preset/ThreeRingSetting sources. The insurance extension uses its own seat's−50yoffset at scale1.1and other seats' default+60at scale1; the extension owner is the absolute table player position. Existing three-seat coordinates are reused via callback,with seat rotation around the signed-in player. Private source digests are retained in Git QA metadata. Coin endpoints preserve the source deg2rad conversion before Flash Sprite rotation assignment. Source-native interpolation and geometry remain distinct from physically measured parity.

The authenticated public insured browser journey passed registration/cancel/open/take-seat/wheel/actual actions/winner,payout oracle,900-chip conservation and cold restarts. A deterministic x2fixture with two insured and one uninsured account observed both seat awards and no first hand during animation,restarted the server/browser mid-award,then completed the tournament with each insurance credit appearing once. A separate run injected completion503and a lost successful response; retry recovered without reloading wheel assets,then completed payouts/restarts. Engine tests reject forged saved awards and client completion amounts and retain wallet/bank conservation. No live owner state was changed. This source stage is not yet merged/deployed; full installed commit-bound QA,physical pixel/audio comparison,effective native callback delay remain open. The previously described hide preference was subsequently identified as an account/brand gate, not a user control.


## Released PR120 — 2026-11-14

Commit-bound installed QA passed 60 checks: 43 regression groups, 13 HTTP/browser journeys, runtime and art byte/hash verification, syntax checks across all 72 modules, and a trust-boundary review. The candidate contains 81 runtime files and 1,224 private art files. The stored QA pass was checked immediately before merging the expected head. GitHub Codex review on that exact source head completed without findings. Greptile did not review because its trial had ended; no Greptile approval is claimed.

The guarded idle rollout installed runtime `insurance-6f18424` and matching private art, backed up the previous service plist and six owner files, and restarted PID 92125 to 57516. All six owner files, totaling 15,496 bytes, remained byte-identical after startup and later HTTP checks. Player, owner and table catalog endpoints returned HTTP 200. No live gameplay or financial configuration was written. Private QA/live receipts reside in Git metadata. The merge tree equals the tested source tree. This release adds insurance; the full GGPoker reconstruction remains incomplete.


## REA correction: visibility is a brand/account gate, not a preference

A further selected export of `com.nsus.iron.vo.Account` establishes that `hideSpinAndGoldInsurance` is a getter returning the OR of `isOlybetLTUser` and the Danske Spil brand flag. No setter is present in that class. `isOlybetLTUser` itself requires the Olybet brand and either Lithuanian residence or its Olybet country field. The extracted method reads a client-access-country boolean but does not use it in the return expression; that unused local must not be mistaken for another active condition.

Combined with the previously recovered wheel, information-page and payout callback consumers, this establishes a brand/account visibility restriction. It does not establish a configurable Game Settings toggle. Earlier references in this investigation and its checkpoint notes to a “hide preference” were an incorrect interpretation and are superseded here. No such toggle was added locally. The independent local practice app continues to offer insurance only when explicitly configured by its owner; no native account or brand policy was changed.

The export completed with installed FFDec and the exact getter/no-setter assertion passed. Source SHA256 and the bounded finding are retained privately in `.git/danslab-qa/spin-insurance-account-gate.json`. This is static client evidence, not runtime confirmation of a particular real account's flags. It does not alter financial eligibility or prove effective operator tariffs/delay.


## Silent recovery of an interrupted award

The retained TableMediator method `setSpinAndGoldInsurance` gives sound permission only to its first non-null award and only when `playInfo.isCatchUp` is false. Other seat animations still run. The notification command forwards immediately to this method; no animation delay is applied there. The callback's Delay field affects the tourney start-time calculations already described above; it must not be assumed to be an animation-start offset. Effective operator values and callback arrival relative to the wheel remain unknown.

The local presentation model now accepts an explicit boolean sound policy. The table scene marks that it began presenting a particular room/seat in sessionStorage. A pending replay in that same session continues the graphics silently; the marker neither completes the server barrier nor credits funds. This is the local interrupted-presentation equivalent of native catch-up, not a claim that native catch-up detection uses browser storage. Saved server completion still suppresses the entire replay. Fresh displays retain one shared set of sound cues across all winning seats.

Pure tests cover the false/true sound policy and invalid arguments. Muted browser animation tests each ran 314 frames with the same 59,415 sampled visible pixels: fresh presentation emitted three cues and three WebAudio sources; silent recovery emitted none. The actual mixed-insurance table restarted during its award, recovered with sound disabled, played through to a winner, and passed independent payouts, 900-chip conservation and once-only wallet/bank accounting. Audio-volume/mute regressions also passed. This source follow-up awaits its own installed commit-bound release gate; live PR120 was unchanged during these tests.
