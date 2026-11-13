# Private local runtime artwork

Observed failure: iCloud dataless graphics in the Documents checkout could stall reads and occupy browser connections, interrupting Home/login/table readiness. Asynchronous reads keep the server event loop responsive, but cannot make an evicted image resident. This is a deployment issue, not evidence of native feature parity.

`tools/install-local-art.py DESTINATION --inventory` reports the bounded runtime set without copying. Without `--inventory`, it creates a new private snapshot outside Documents/Desktop/iCloud and the checkout. It includes native runtime sprites/catalogs, source-referenced assets, Home layout artwork, carousel edges/slides, avatars and local audio. Comparative `observed-*` captures are excluded unless explicitly referenced by runtime source. No models, dependencies or full source checkout are copied.

The installer refuses existing destinations, symlinked source assets, more than256MiB and less than10GiB remaining headroom. It resolves destination symlinks, copies into a mode700 staging directory, checks source/destination SHA256, writes a private manifest and atomically renames the completed directory. Failure removes only its own staging directory. A new version uses a new destination; existing installations are preserved.

Set `POKER_REFERENCE_ART_DIR` in the existing local server environment to the completed snapshot. `/home-art/` and the existing locally extracted audio cues use it. Native audio cues previously loaded directly from the installed Mac app retain that source. HTML and JavaScript remain in the checkout. Missing snapshot artwork returns404 without silently mixing versions. Existing path allowlists, local-only gate and shared-mode denial remain in force. User-uploaded avatars and all room/profile/wallet state retain their existing data directory.

Verification: installed-art HTTP fixture checks exact PNG/JSON/font/audio bytes, absent-file behavior, path/method guards and shared-mode denial. The FIFO regression checks that delayed graphics cannot block session/game APIs. The installer fixture checks runtime selection, capture exclusion, private permissions, hashes, existing-destination refusal and resolved checkout-path refusal.

Changing the live server environment still requires the existing idle/data-preserving restart guard and an unchanged-data receipt. Source files and the original Mac app are preserved. A packaged snapshot must be refreshed after artwork changes; this is not automatic iCloud pinning or a complete offline copy of the application.
