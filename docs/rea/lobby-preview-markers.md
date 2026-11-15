# Native preview Dealer/SB/BB markers

TableViewComponent uses atlas frames lobby_preview0014/0015/0016. Exact existing PNG crops are reused, with decoded-RGBA readback; Dealer20×21, SB24×25 and BB24×25. The clone previously used a different dealer disc and approximate radial-gradient blind circles. Rendering now uses the native bitmaps while keeping accessible labels, actual room seat indices and dealer/blind rotation. [Source, atlas and pixel proof](lobby-preview-markers-source.json).

This does not establish absolute geometry. Native positions come from TablePreviewPositionData, multiplied by1.08; Dealer gets(+2,+2) before scaling, while bitmap sizes are not scaled. Existing percentage anchors and local seat rotation remain pending native parent-viewport calibration.

Validation: old installed runtime RED missing native marker projection; source browser GREEN all three rendered frame URLs/intrinsic dimensions, first-hand D0/SB1/BB2, next-hand D1/SB2/BB3, two hands720chips/payout/reconnect. No backend/schema/assets/dependencies changed. Final installed gate and live rollout pending.
