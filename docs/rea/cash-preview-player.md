# Hold’em preview: original player information plates

REA recovered PreviewPlayerInfo as an internal class in PreviewPlayerCell. The local ordinary six-seat Hold’em Table View now uses its existing exact atlas image,64×46,centered at avatar center+(0,30). In the local50px avatar box this means plate top32. The name sits at top14; an authenticated own name uses top13,orange#ff8932,bold italic. Normal local peers use white as resolved by AccountType,not the constructor’s gray placeholder. Both rows use native Roboto10; actual practice balances use gray#ccc and grouped numbers without a literal “chips” suffix or operator dollars.

Own identity comes from the existing authenticated preview metadata. It is never inferred from a shared nickname. Existing HUD clicks,seat reservation,waiting,admission and wallet actions are retained. The original64×46 background was already installed,so no artwork was duplicated. Other variants retain their existing renderer.

A RED browser run measured the legacy60×30 panel. New browser assertions inspect actual peer and own panels,background,position,font,color and balance,then exercise private HUD notes,seat admission and the complete two-hand/payout/reconnect journey,all passing in the source run. A1200×963 source capture was inspected. The native plate’s transparent edge can touch a blind marker; the visibility check now measures actual text glyph bounds rather than treating the transparent rectangle as text. Exact-head release checks remain pending until recorded.

This is not full native parity. Existing parent/seat percentage anchors,12pxCSS linebox,exact native textfield metrics and truncation remain unverified. Table-preview note markers,country data,heat HUD and operator partner/subscriber account styles remain separate work. No original client launch or real-money interaction was used.

[Original source identities and exact crop receipt](cash-preview-player-source.json).
