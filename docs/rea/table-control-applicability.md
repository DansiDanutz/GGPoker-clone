# Native table controls: applicability and Remove Chips contract

## Evidence scope

This is selective static REA/FFDec investigation of the installed Game/51 client. All thirteen selected classes were freshly exported together, headlessly, using the existing Java/FFDec installation. The SWF SHA-256 was checked before and after export and remained unchanged; all thirteen exports match the previously retained source bytes. Artifact identity and inspected source hashes are retained in `table-control-applicability-source.json`; no proprietary source contents or account credentials are committed. The original app was not activated and no real-account command was sent.

## Join similar table is conditional

TableMenu3D initializes the control hidden. It enables visibility only for a signed-in user under Brand.isNoOpponentSelection, outside tournaments/Rush/Spin, when the user is not playing and the table is not VIP junket. Brand defines that predicate as German user OR 2Ace brand. The PLAYGG.RO display alias instead requires a GGPRO account on GGPCOM. These facts do not establish the current original account's German-user predicate; they do establish that the control is not universally required on every PLAYGG.RO screen.

The command forwards a table-info object through JOIN_SIMILAR_TABLE. It does not contain a recovered matchmaking allocation algorithm. Do not add a universal matching button or silently select/debit a different local table based only on this source route.

## Remove Chips has separate immediate and automatic operations

Visibility requires the table-type EnableRemoveChips permission and applicable player/menu state. TopupCommand opens the remove-chips popup only for a seated player at an enabled table. TableHelper derives the removable excess from balance minus minBuyIn; AoF uses minRemoveChip instead. A native raw-unit threshold determines whether the maximum is positive. This raw threshold is not evidence that the local play-chip minimum must be ten.

The popup starts from the available maximum, displays the current balance and supports a separate automatic reduction choice. Ordinary tables enumerate multiples of ten big blinds from the rounded minimum buy-in to the rounded maximum, capped at200BB, plus Off. The effective blind is buttonBlind when positive, otherwise bigBlind. A zero saved target derives a default rounded upward from last buy-in or minimum buy-in. AoF exposes a separate automatic toggle; it must not be treated as the same ordinary-table dropdown.

Confirming the popup creates a BalanceVO containing the selected immediate amount and SendRemoveChipData containing finalBB/isAutoCheck and table/game identity. SetAofAutoRemoveChipOptionCommand sends the immediate CashOut, saves the target/automatic preference and broadcasts the option. CashOut request3123 sends a transaction with table ID, amount and session date; it ignores amounts below the native raw threshold. Its inspected response handler is empty, so it does not establish local debit authority or settlement timing.

SetRemoveChips request3505 is distinct: it sends AutoRemoveChipsToBB and RemoveChipsToBB clamped to at least ceil(minBuyIn/effectiveBlind). AutoRemoveChipCommand applies matching table-group options and automatic-action flags. The immediate cash-out amount and persistent target are different values and must not be charged twice.

## Local implementation requirements

Remove Chips is not yet enabled locally. Before enabling it, define explicit owner opt-in and whole-play-chip policy; retain seat/account authentication, strict versioned requests, bounds and idempotent operation receipts. Any between-hand application is an independent local policy until native scheduling is established. Preserve current hand contributions, payout/WIN presentation and historical results; atomically credit the wallet with the actual reduction. A complete flow needs manual amount, cancel, optional automatic target, insufficient excess, simultaneous actions, failed-write rollback, reconnect/restart, separate sessions and chip-plus-wallet conservation. AoF and Rush need their own evidence and eligibility rules.

The local feature must not present a working-looking native control until these paths and real game-state changes are tested. Static source geometry and dispatch routes are not proof of native runtime or private server behavior.


## Coverage reconciliation

`table-control-local-coverage.json` records eight traced controls with links to their implementation documents. The central47-entry table-control catalog now uses these scoped statuses for Join Similar, Remove Chips, cash Sit Out, chip shuffle, Rush Auto Fold, chat, emoji and Helmet. Updating a status does not certify native pixel/audio parity or upgrade other formats/unknown controls by inference. Push Seat remains a recovered contract requiring a real server-side seat transaction; it is not counted as implemented merely because its graphics or selectors are known.
