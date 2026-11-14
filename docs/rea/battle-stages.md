# Battle Royale stage configuration — recovered contract

This is a static contract recovered from the installed client, not a claim that local Battle matches the native rules. Source identities are bound in `battle-stage-source.json`. No native account interaction occurred.

## Configuration and navigation

`BattleRoyaleType` receives a preset and passes its `StageList` to `BattleRoyaleStageInfo.setStages`. Non-null entries are indexed by `StageId`, not their position in the vector. The getters select stages1,2,3 explicitly. Actual preset values are supplied by the service and have not been observed here. No fixed nine-player final is established by this contract.

| Native field / getter | Recovered meaning | Local coverage / gap |
|---|---|---|
| StageId / StageType | Stage identity and declared mode | Local Rush → qualification → final phases exist; native mode mapping remains unverified |
| TableSize / getStageTableSize(id) | Seats at one table, separate from event population | Current final2–6 seats; independent per-stage native table sizes not supported |
| MaximumPlayers | Population limit for the selected stage | Local event capacity and finalSeats exist; native stage2 cutoff is not independently configurable |
| stage1MaximumPlayers / rushStagePlayer | Stage1 MaximumPlayers | Local event capacity is owner-defined, not a captured native preset |
| round1SurviveToTopPlayers | Stage2 MaximumPlayers | Local top(finalSeats−1) direct plus shootout is an explicit local policy, not proven native qualification |
| stage3MaximumPlayers / finalStagePlayer | Stage3 MaximumPlayers | The HUD literal /9 cannot establish this field or TableSize |
| DurationMinutes | Per-stage minute limit | Local Rush milliseconds only; native stage2/3 minute limits missing |
| DurationHands | Per-stage hand limit | Stage2 hand-based end condition missing locally |
| isStage2LimitHandMode | True when stage2 DurationHands>0 and DurationMinutes==0 | Native branch is explicit; no corresponding configurable local branch |
| StageEndTime | Server-provided stage deadline | Local start/duration deadline exists; no service-provided deadline reconciliation |
| UseChessClock / ChessClock | Declared clock use and allowance | General local clocks exist but are not wired to Battle stage presets; stage3 display divides ChessClock by60 |
| UseChessClockFromPreviousRound | Carry-clock flag | Missing Battle carry-over policy |
| BettingDuration / SandGlassDuration | Declared betting/sandglass durations | Field identity is known; effective native timer semantics and units are not established by declaration alone |
| TimeChipCount | Declared stage time-chip inventory | General local time chips do not establish Battle stage support |
| ChessClockBlindUpHandCount | Declared clock/blind hand-count setting | Effective native rule and local implementation missing |
| StartBlindLevel / getStartBlindLevel(id) | Per-stage starting level, getter fallback1 | Local single starting blind; independent stage level missing |
| StartBlindBBMultiplier / getStartBlindBBMultiplier(id) | Decimal per-stage multiplier, getter fallback0 | Native application formula and local support missing |

The getter fallback for missing MaximumPlayers/TableSize/durations is0; a missing stage is not evidence of a real zero-player event. `isStage2LimitHandMode` assumes stage2 exists and accesses its fields directly. Do not import malformed service data using that assumption in the independent backend.

## What must be proved before changing the engine

1. Obtain actual public/native preset values without joining or funding a real-money game; otherwise retain explicit unknown values.
2. Recover the stage-type mapping and callers that apply table size, clocks, blind level and multiplier. A protocol field alone is insufficient to infer its execution semantics.
3. Keep event population, advancing population and per-table seat count separate in validation, saved state and admin controls.
4. Add independent tests for stage boundaries, active-hand completion, clock carry-over, qualification, chip conservation and exactly-once prizes after restart before claiming parity.

Current local configuration and settlements remain unchanged. Physical native layout, animation and sound timing also remain unverified.
