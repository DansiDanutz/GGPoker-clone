# Native straddle contract — REA evidence

Status: recovered client contract; local gameplay integration incomplete. No live game state changed.

## Observed behavior

Native English resources state: straddle starts at twice the last blind/ante; it is available at any position; once someone straddles, players may choose No Look All-In. This is a pre-hole-card-view decision, not an ordinary preflop raise. Do not substitute an UTG-only rule.

`OnAskingForStraddle` (4066) receives ActionId, Count and AmountToStraddle. It stores the action/count, displays the decision to a live funded local player, and marks every live funded playing player as having a straddle turn. This supports concurrent offers; it does not prove server arbitration or a timeout policy.

`DecideStraddle` (3137) sends Type and the current ask Count. Closing the decision UI sends No. The normal button sends Yes; the red button sends AllIn. The normal button is hidden when the supplied straddle amount is at least balance + committedAmount.

`OnStraddleDecided` (4067): No removes that player's indicator and hides their own decision UI. Yes/AllIn hides the decision UI and clears all straddle indicators; AllIn also marks straddleAllIn. It clears that player's time bank. It does not post the money itself.

`OnStraddleChanged` (4065) updates the persistent isOnStraddle toggle/badge and refreshes the menu. The toggle and the per-offer decision are distinct state.

Native table menu visibility requires a playing user, table straddle > 0 and more than two dealt players. Bomb-pot hands disable the action. The hotkey uses the same guard.

## Posting and action authority

`OnBlindsPosted` (4018) receives a vector of server-supplied blind records. For Straddle it replaces the player balance with the supplied balance, adds BlindAmount to committedAmount/current bets, records lastStraddlePlayer and marks a zero balance as straddleAllIn. MandatoryStraddle also records the last straddler and all-in flag, but does not trigger the optional-straddle balloon. Ante and Dead amounts instead go directly to the pot. Every posted blind is appended to action history, followed by call-amount refresh and postBlinds animation. Accepting a decision alone must therefore never debit chips twice.

`OnAskAction` receives SeatIndex, AvailableActionTypes, CallAmount, CommittedAmount, MinBetAmount, MaxBetAmount and ActionId from the server. It sets that explicit player's turn. No inspected callback derives the first actor or raise increment from lastStraddlePlayer. These rules remain a server-contract gap, not a client algorithm recovered by REA.

`OnHoleCards` (4012) separately handles a private Cards payload and DealtPlayers notification. It supports private cards arriving after the face-down dealing animation, then calls lookingAtHoleCards. This establishes separate dealing/reveal events; it does not prove that every straddle offer precedes the physical card animation. The local requirement is no private-card disclosure before the blind decision, not an invented animation order.

`PlayInfo.isStraddleEnabled` requires more than two dealt players and no bomb-pot hand. `isAllPlayersAllInStraddle` counts every playing player's straddleAllIn flag and passes the result into hole-card display data.

## Visual contract

Decision contents 580 × 296 native units. Green Straddle button at (22,186); red all-in button at (297,186). Heading at (19,19), 360 × 57, 36px bold. Explanation at (19,76), 360 × 65, 26px multiline. Information tooltip fades/slides over 0.2s. Physical pixel scale, seated captures and audio timing remain unverified.

## Required integration before enabling

Recover posting notification/action ordering, simultaneous-offer arbitration, repeated-offer Count progression, decline/timeout completion, maximum/restraddle rules and preflop actor selection. Implement an explicit pre-reveal phase with private cards withheld, authenticated versioned decisions and restart-safe pending offers. Test all declines, accepted straddle, no-look all-in, short stacks, disconnected players, side pots, chip conservation and reconnect privacy in isolated browser sessions. Do not expose a working-looking toggle until this contract is implemented.

## Source receipt

Selected classes exported headlessly from installed IronDesktop.swf (Game/51). Raw proprietary source remains in the private REA tools folder and is not included in this repository. SHA-256 of inspected exports:

```json
{
  "com/nsus/iron/table/services/callback/OnAskingForStraddle.as": "8e3adae6358ce2c2b443f2ce428c9a08a600c27adff351152053ef33d98db437",
  "com/nsus/iron/table/services/callback/OnStraddleDecided.as": "f411a105c266aa6dba9de696110d4e31b3107e8ea30708a67e849004a7f95da6",
  "com/nsus/iron/table/services/callback/OnStraddleChanged.as": "bfac521c2f663bbf93289b5168b03ac9b02f5fcdd98f34e93b88cf5d83c50cc7",
  "com/nsus/iron/table/services/request/DecideStraddle.as": "eac59190d7b4e9c74744245fe44724d1d2a707feeb49a1cfb38e3622728d04d0",
  "com/nsus/iron/table/stage/component/StraddleDecideView.as": "ff04a8291bb9d013b0fddd7294b1922b900e59c9133aa8d2620c2a1a76a1d5a5",
  "com/nsus/iron/table/view/component/gameinfo/GameInfoData.as": "e8c8bbb98c8d50a2f68aeb34e071474b673c89bb8624b88eb4974607527bbca3"
}
```

Additional inspected export hashes:

```json
{
  "com/nsus/iron/table/services/callback/OnBlindsPosted.as": "3facee6339a511c38bfe4617ad10e1e26ea9e3eb0b6f98234197767dea581905",
  "com/nsus/iron/table/services/callback/OnAskAction.as": "0e9fa3babc13849f2ecde3e6ee79d906c9ee08282e79920660a8abc841d76c10",
  "com/nsus/iron/table/services/callback/OnHoleCards.as": "45cd9d8f459aba7b015801376b8939bfa22dc877ba8bfda1f70708f269ec5175",
  "com/nsus/iron/table/vo/PlayInfo.as": "a5b68f058b1bb97d2e8f256e9638e9905b36cc49d6eb36161649462e7b36398a"
}
```
