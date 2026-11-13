# Free TimeBankCard on owner-hosted local tables

## Native evidence

ETimeBankType separates TimeBank,GameClock andTimeChip. ReserveTimeBank sends Normal for a free toggle reservation and Immediately for direct TimeChip activation; DisableGameClockLimit is a different action. Requests carry ActionId and IsPaidAction. TablePlayer separates free remaining inventory,available count and paid usability. TimeBankInfo reads TimeChipCount,FreeTimeChipSecondsPerUnit,MaxTimeChipsPerAction and paid values from the incoming table configuration. Concrete PLAYGG.RO defaults and server-side grant/refill/deadline policy were not observed.

TimeBankChip displays the free button in the final5000ms of ExtraTime and during TimeBank,subject to usability and optional urgent-only configuration. The count comes from freeTimeChipRemainCount. TimeBankChipButton uses desktop table399/free,408/disabled and405/counter. These are120×94,120×94 and60×60; TIME uses NTime,size36,color#27282d,y20; the counter begins(82,45). The extractor retains exact decoded pixels with assertions. The local control uses those source graphics and logical sizes. Its position beside the own seat and own-seat scale are provisional local integration,not a same-size native runtime match; counter font baseline and physical raster remain unverified.

## Local owner policy and implementation

Admin can configure0–100 free cards per seating,1–300 seconds per card and1–10 cards per action. Zero disables cards. Cards and the continuous GameClock pool are mutually exclusive. These are explicit local controls/bounds,not claims about operator defaults. Occupied-table settings cannot change. Create/Edit/Duplicate preserve the settings; card duration/limit inputs are disabled while cards are off. A server capability header hides this configuration on an older running backend,preventing a misleading save that silently drops unknown fields.

The local manual policy adds the configured duration to the current deadline. A card may be used in the final5seconds of the base action; after the first card,the remaining allowed cards can be used during its extended time. This corresponds to the native visible phase gates,but the exact native server deadline arithmetic is not proven. Inventory is granted once per seating and has no automatic refill. Existing paid actions and free toggle/automatic reservation remain rejected; no wallet or wager is charged. The four native automatic-preference options are still an open feature,not a working settings page.

The existing time-bank operation binds actor and action ID. Manual cards additionally require the current per-action sequence; retrying an accepted sequence is idempotent and cannot decrement or extend twice. Future/fractional/stale/foreign requests,reached per-turn limits and exhausted inventories are rejected. Inventory and action counters persist with the room. Invalid actions or failed writes retain prior state; save rollback includes consumed count,sequence and deadline. Cards do not reset on action/hand changes or reload/restart. Taking a new seat starts a new local seating grant.

Only the seated player receives their inventory field; spectators receive none. The private completed-hand journal records accepted time-card-used events (seat,street,action boundary,sequence,duration),without copying remaining inventories into other players’ reports. Existing clock-limit-disabled events remain separate.

The button operates on actual room state,displays the count and respects the cap/disabled source artwork. The Time Bank hotkey invokes the same enabled control,with existing Functions/global/typing guards. Stats displays TimeBankCard plus the numeric inventory,not a fabricated continuous pool. Native NTime caption translation is fitted to the button width. Paid price tags,reservation ticks and paid animations are not fabricated.

## Verification

- game-clock-test: finite count,per-action cap,actor/action/sequence identity,idempotent retries,deadline addition,exhaustion/no refill and restart-compatible state; existing GameClock cases unchanged.
- time-card-room-test: auth,early/foreign/paid/toggle/fractional/stale rejection,failed-save rollback,invalid-action safety,private inventory,completed journal,720-chip full hand and next-hand/reopen carryover.
- network-browser-test --time-cards: owner form and invalid settings/occupied lock,six isolated player browsers,native-art pointer activation followed by the actual T shortcut,two exact7-second extensions,one decrement per sequence,disabled per-turn cap,Stats,reload/server restart,preserved catalog config,full hand with actual browser action clicks and independent720-chip payout,next-hand/restart inventory and stale-ID rejection.

Early browser checks caught two fixture/integration issues: polling did not yet compare the new canUseTimeCard flag,so the final-five-second control never appeared; the native button inherited the global86px minimum width. Both are fixed in the shared refresh gate and explicit control CSS. A test initially treated fixed-position betting buttons as hidden through offsetParent; it now checks actual client rectangles. No gameplay assertion was removed.

## Remaining scope

Native automatic reservation rules/settings,refills,paid cards,disconnection phases,operator policies,TimeChip event/usage animation and native control placement/physical sound/font timing remain open. The local manual free-card journey is functional; it is not complete TimeBankCard or full application1:1 parity.
