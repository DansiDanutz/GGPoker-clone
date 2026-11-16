# Multi-run retained history — REA contract

The server already retained every completed RIMT board, decision and per-pot/per-run allocation. The preview used only the first board, and each winner's ranked summary incorrectly used that first board even when their chips came from another run. A red test against installed source65d2e86 reproduced the missing nine-card shared-flop three-run preview.

## Recovered source

Nine freshly selected classes were exported headlessly from installed Game/51/IronDesktop.swf, SHA2562bf08ebadf070b588feae5d0b8823629aed2e109a126e3bf4ae6ae363c1c32a1. [Source identities](history-runouts-source.json) record exact bytes/hashes. No native client was launched. The actual loaded native module path remains unproven.

HandHistorySettingData gives the six-seat community anchor320,305. CommunityCard3D uses pivot118,82.5, three rows spaced42, cards61x81 and column pitch59. Card3D defaults to centered C alignment; coordinates must therefore describe card centers, not top-left corners. A normal first center202,222.5 stays unchanged. Multiple boards scale the whole group0.9 and move its anchor up15(two) or25(three). First centers become213.8,215.75 or213.8,205.75; subsequent columns add53.1 and rows37.8, with54.9x72.9 faces. Source flat lengths10/7/6 for two and15/9/7 for three identify shared prefixes0/3/4. The common prefix appears once in row0; later rows contain only their own suffix.

HandHistory.getPreviewPlayerUsedHoleCard returns true for all non-Omaha hole indices. Used-hole filtering is an Omaha-specific preview rule; ranked winning summaries are separate. This corrects the local Holdem/ShortDeck preview's inappropriate best-five dimming, while preserving folded-card paint and Omaha exact-two selection.

HandHistory.makeSummaryVo visits every winning board and computes that winner's five cards on that board. RIMT retains repeated combinations. Summary3D splits the flat sequence into groups of five with separators: two lines at #9a9a9a/#343434, three-unit gaps,22x32 cards and ten-unit board-card offset. The local summary now chooses only runs whose actual allocation pays that seat; it never ranks an awarded second/third run against board0.

## Local integration and validation

The existing felt/history/card/PNG components are reused. No backend endpoint, engine dealing, payout, wallet or data schema is changed. Optional runout metadata accepts the existing local cash Holdem format, one-to-three complete boards and matching decision count. Board0 must equal the played board, a multi-run prefix must be0/3/4, and suffix/private-card identities must stay distinct. Invalid/unsupported metadata produces no native preview rather than a misleading first-board-only graphic. A single run retains the normal unscaled board. The viewer's historical seat rotation is unchanged.

Unit tests cover two/three runs at preflop/flop/turn, native centers/scales/counts, one shared prefix, malformed card/count/format/privacy guards, single-run compatibility, immutable inputs/accounting, per-awarded-run summary selection and ties. Existing history, Rabbit, Omaha and RIMT engine/room checks remain required. The hosted browser fixture now genuinely calls/checks to the requested flop/turn before going all-in; previously combining hosted and shared flags incorrectly stayed preflop. No shared-count assertion was waived.

Hosted browser checks exercise the owner form, real seats/start/bets/choices, all run cards and exact geometry in history, both disclosed Holdem faces, winner summaries, decodable PNG and actual process restart. They preserve the final rooms checkpoint byte-for-byte while reading history. Captures are local only. Whole-app physical pixels, native runtime timing/audio and unsupported formats are not established by these tests.

## Released verification — PR277

Merged60b50fa4391dbbb7d88adc9b4afce86b1a32672e, tested85495fb0063f965126ea1229b95d6d9d027fad5a. All20 exact-head checks passed:130 runtime/source identities,nine native classes and original SWF,syntax/diff,eleven logic/room/history suites,three actual owner-form hosted RIMT hands(preflop3/flop3/turn2) and Rabbit browser regression. Each RIMT journey checks per-stage payouts,104pot/70return/290conservation,private roles,history geometry/awarded summaries,PNG and cold restart with an unchanged room checkpoint. Three-run flop/preflop renders were inspected; merged Git tree equals the tested tree.

LivePID78777, runtime130files1512064logicalbytes,127verified immutable hardlinks plus116060newcode/stylebytes; existing1387artfiles reused. All6ownerfiles15496bytes stayed byte-identical through guarded idle rollout. Backup `/Users/davidai/.local/state/playgg-rollouts/pr277-pnmpy5sd`. No live gameplay write or foreground/speaker action. QA logs/receipt live under `.git/danslab-qa/pr277-*`; root Markdown report and GOAL checkpoint updated. Full app goal remains active and incomplete.
