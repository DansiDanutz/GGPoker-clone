# Spin & Gold registration, runtime configuration and funding

## Verified local state

spin-lobby.mjs is currently informational: two observed play-money stakes5000/10000,quantity1–4,Info/Blind Structure/Payout/insurance help. Both Play Now controls are disabled. engine/spin.mjs contains eight observed100M-frequency outcomes and26blind levels,with minute- orhand-based progression. startingChips/timeBankCards remain null. This is not a playable Spin implementation.

## Native static evidence

Selected IronDesktop classes were recovered with FFDec; retained sources are private Sandbox artifacts. This is static native Flash analysis,not an observed server response ornative execution.

- RegisterSpinAndGoldCommand validates platform/table restrictions andpasses SelectSpinAndGoldType to the tourney request layer.
- RegisterSitAndGoRequest carries TourneyType,SitAndGoTypeIndex,Count,InsuranceId,TicketIds,AutoActionFlags. The response has aResult andper-registration ResultList. Each result can contain Result,SitAndGoId,BriefInfo,BuyingInsuranceId,SubCode,Description. Partial failures therefore need individual handling rather than assuming one batch result covers all games.
- tagSpinAndGoldTypeInfo groups TypeList,MultiplierSetList,ChallengeTypeList,InsuranceInfoList. tagSitAndGoType references MultiplierSetId,BlindStructureSetId,PrizeStructureSetId,TableType andBuyIn; these references do not contain the actual game stack.
- SpinAndGoldType.sync copies operator-provided stake/type configuration. SpinAndGoldMultiplierSetInfo maps received multipliers to wheel slots with indices[6,2,4,0,1,5,3,7]. These are display positions,not random outcome probabilities.
- SpinAndGoldTabInfoPage deliberately shows the starting-chip range andmultiplier-dependent time bank; these are not per-multiplier assignments.
- TourneyEntry.startingChips directly returns configuration.StartingChips. setConfiguration receives tagTourneyTableConfiguration. That structure includes StartingChips,TimeBankType,MaxTimeChipCount,TimeBetting,TimeAddBetting andgame/table limits.
- TourneyEntry.useTimeBankChip compares configuration.TimeBankType with ETimeBankType.TimeChip. tagTourneyBlindStructureItem carries Level,ButtonBlind,SmallBlind,BigBlind,Ante,Timebank,TimeChipCount,Duration,HandCount1. Time-bank inventory andblind progression must use effective per-game/per-level data.
- tagSitAndGoInsuranceInfo carries InsuranceId,Multiplier,InsuranceBuyingRateAsBuyIn,InsurancePayoutRateAsBuyIn,Currency,AwardType,Delay. A prose insurance explanation does not establish the fee orreimbursement configuration.

No exact multiplier→StartingChips/card-count mapping orinsurance rates were recovered in this pass. Do not substitute arbitrary values orclaim the generic300–1000/1–4ranges establish them. The server-defined per-game configuration remains a separate input.

## Funding requirement proved from the observed model

An ordinary three-player freezeout cannot serve as Spin simply by changing its title. Three5000entries contribute15000; the prize pool is5000×multiplier:

| Multiplier | Prize | Operator balance change |
|---|---:|---:|
|20000|100000000|-99985000|
|100|500000|-485000|
|50|250000|-235000|
|10|50000|-35000|
|5|25000|-10000|
|4|20000|-5000|
|3|15000|0|
|2|10000|5000|

The10000stake doubles all these amounts. Every source-model payout row sums to its prize pool. Frequencies sum exactly100000000. Weighted multiplier in this captured local model is2.79; this is model arithmetic,not a claim about any real-money operator return.

A local operator bank must account for the difference. Existing ordinary tournament settlement distributes the entry pool anddoes not provide this bank. Spin needs explicit play-credit capitalization/reservations andatomic bank/wallet/prize accounting; it must not silently mint a jackpot orreroll an unaffordable result.

## Implementation obligations

1. Retain verified per-multiplier runtime configuration as authoritative input. Reject incomplete configuration before charging a player; do not fill unknown native values with guessed defaults. An owner-defined practice configuration must be labeled as a local rule,not native evidence.
2. Keep player debits,queue membership,operator reservations andmatch creation in the existing atomic persisted room/wallet transaction boundary. Failed writes restore the whole operation. Owner bank capitalization requires owner authorization andan audit record.
3. Register authenticated players with per-request/per-game identities; implement cancellation/refund exactly once,reload/restart recovery,andthree distinct participants orauthorized computer seats. Handle quantity requests andpartial errors individually.
4. Reserve sufficient operator exposure before taking entries. Draw one server-side ticket from the full100Mdomain andpersist it once; never change probability selection based on affordability orreplay. Release unused reserves atomically.
5. A matched game uses the actual outcome configuration,weighted payout,source minute/hand blind schedule andtime-bank policy. Reuse the existing Holdem/side-pot/elimination machinery,without confusing chip stacks withwallet prizes.
6. Before crediting,verify unique finishing places andthat player prizes equal the selected pool. Player+operator+escrow totals reconcile,with no duplicate settlement after retries orrestart.
7. Verify three separate browser sessions,optional computers,registration cancellation,insufficient player/operator funds,write rollback,wheel/result persistence,a full hand/tournament,payout andcold restart. Compare native source-backed game surfaces at equal size; physical runtime parity remains unproven until measured.

These are reconstruction requirements andlocal accounting design,not a claim about the private native administration system. No live credits were charged andno native account/game was used during this static pass.

## Verification in this pass

node spin-test.mjs PASS: both stakes,all eight weighted outcomes andboundary tickets,26blind levels,minute/hand transitions,final cap andinvalid inputs; unresolved configuration stays unset. A separate Node assertion pass recomputed the100Mfrequency total,all prize sums andthe operator deltas above. No new backend/UI functionality is claimed here.
