# Hold’em Table/Group header — source and same-size capture

Status: implementation candidate; release QA is separate. Scope is the ordinary no-promotion Hold’em catalog. Table rows, independent native-derived ordering, selected room, waiting/admission, wallet and game engine are unchanged.

## Source and observed reference

Thirteen freshly recovered classes are identified in [cash-header-source.json](cash-header-source.json). HoldemLobby constructs NewListHeader810x24 for Table and Group. NewTableTitleItem uses getLabel with Roboto enabled, size12 and boldfalse; the label is y1/height24 and centered in its cell. Its divider starts at cell-width,y6 and is1x12. Source group widths133/223/150/157/147 sum810. Table widths176/206/110/116/52/52/52/48 sum812: the final text cell extends two units beyond the810-unit background. The previous46-unit normalization was not the literal header contract; row data anchors are unchanged.

NewListHeader emits CLICK, but the inspected GameLobbyTableView/GroupView/NormalCashGameLobby do not bind it to a sort command. These passive labels must not acquire invented sort arrows or wallet actions. Existing Table/Group order and actual row keyboard/Enter/double-click controls remain connected.

The source literal palette is51/128/64 gray(fill/label/divider), while the retained real native1200x963 image measures58/138/73. Its fill probe is30,310; every divider at x196/402/512/628/680/732/784,y310 is73. Solid caption pixels have dominant138. Applying only the literal source palette produced a RED measured background comparison51 versus58. The candidate therefore uses the measured palette for this component, with source-derived font and geometry. This is a direct local header calibration, not a global color transform or proof of the loaded module/capture pipeline. Group colors follow the same source component; no new native Group capture was made.

## Local change

The previous header inherited bold Arial12, fill56, text170 and dividers69. The candidate reuses the existing original regular Roboto asset, uses the measured palette, restores the source label/divider positions and final48-unit Table header cell, and binds the ten heading keys to the existing native language catalog. Mounted header cells survive list refresh. Other game catalogs and artwork are untouched; no new image, font, package or backend setting is introduced.

The label wrapper mirrors the source cell/label split. Long localized captions retain the current safe ellipsis fallback; complete native autoScale/textfield/AA equivalence remains unverified. English keys match the shipped native catalog; Romanian labels are checked through real language reload and later list polling. This does not establish every-language raster parity.

## Verification boundaries

The installed previous release first failed the header color assertion. A separate raw-PNG gate then caught the source-versus-capture color discrepancy before publication. Browser checks cover Table and Group styles, all column positions, label offsets, dividers at1200x963 and900x700, passive pointer clicks without ordering/debit, mounted-node retention and actual Romanian labels across refresh. Header inspection restores its own earlier focus before continuing unrelated row keyboard tests; this is fixture cleanup, not a production focus-policy change. The older right-edge assertion was corrected from830 to832 to reflect the recovered48-unit final cell; tolerances were not loosened.

The existing full fixture also requires actual Table/Group selection, arrows/no wrap, Enter/double click to real rooms, spectator no-seat/no-token/no-debit, Group advanced preferences, transactional two-window funding/retry, private HUD/notes, one human/five computers, two hands, independently computed payouts,720-chip conservation,reconnect/restart and cross-room balances. Gameplay uses temporary servers/profiles/data and muted headless Chrome; the live owner is not used for QA.

The preserved original and candidate are both1200x963. Local comparison HTML keeps them at identical zoom; raw account/player imagery stays private under.git/danslab-qa. Different table data/promotions/avatars are not treated as a whole-screen pixel error score. Full font metrics, parent/corner raster, native Group capture, color pipeline, animations/sound and whole-app parity remain incomplete. The original native client stays stopped because of its previously observed self-activation.

### Text-compositor follow-up

Fresh Label/STextField/TrueTypeCompositor/LabelModel inspection explains why copying a24px CSS linebox is not equivalent to the native24px label box. Native rendering crops textures using textWidth/textHeight plus four gutter pixels, uses pixel grid fitting and integer center placement. Six bounded browser-leading probes19–24px were captured without changing source font12 or labelbox24. The nearest22px leading reduces header-region mean absolute channel error from4.8074 to3.5528;21 and22 rasterize identically in this fixture, so22 retains the closer original leading. This is header-specific measured browser calibration, not a newly claimed native constant or full compositor reconstruction. Font AA/metrics and more than2500 changed pixels in the810x24 header remain; physical1:1 is not established. The60 unoccluded fill probes match exactly. Raw probes/metrics remain private under.git/danslab-qa.
