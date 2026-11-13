# Local code installation outside iCloud

## Problem and scope

Cold iCloud-backed JavaScript previously stalled Home readiness even after the graphics moved outside Documents. The application now supports deployment as a small verified runtime installation. This does not change native UI behavior or establish native macOS packaging/pixel parity.

`python3 tools/install-local-runtime.py DESTINATION --inventory` derives the literal local module/page/style graph starting at `server.mjs`. The server public-file allowlist and local-only entry pages seed browser assets; relative references include nested paths and query/fragment variants. Every copied file must be tracked. The installer never copies `.git`, tests, account/room data, owner keys, backups or reference artwork just because they exist in the checkout.

Without `--inventory`, installation requires a clean committed source tree and a new destination outside the checkout and Documents/Desktop/iCloud. It bounds code to16MiB and requires10GiB remaining disk headroom. Source symlinks, missing dependencies and escaping paths fail. A private staging directory receives exact copies; SHA256 and source HEAD/cleanliness are checked before an atomic rename. The mode700 release and mode600 files contain `runtime-manifest.json` with the source commit and every file hash. Existing releases are never overwritten; failure removes only the tool's own staging directory.

This graph is intended for the current literal module paths and explicit server allowlist. A newly introduced computed dependency must be declared in that graph and exercised by installed-runtime acceptance tests. This is code installation, not dependency downloading or a second Git checkout.

## Verification

The installer fixture verifies dependency selection, nested imports/query URLs, hashes, private permissions, data/test/Git exclusion, dirty/overwrite/checkout/escape rejection, and a Node launch after moving its temporary source away. A Node permission probe explicitly confirms source reads are denied.

`POKER_RUNTIME_DIR=DESTINATION POKER_REFERENCE_ART_DIR=INSTALLED_ART node network-browser-test.mjs --bots` starts the backend from the installed directory. This test mode enables Node filesystem restrictions allowing installed code/art, native sound assets and temporary test data, while excluding the source checkout. The ordinary launcher keeps its existing permissions. Additional installed tests cover tournament registration/payout and Rush wallet/reconnect. All browser/data profiles remain ephemeral.

## Live deployment and subsequent changes

After commit-bound QA and merge, switch only the existing own LaunchAgent's server argument and working directory to the verified release. Keep the Node executable, port, data directory, artwork directory, logs and all other configuration unchanged. Back up the old plist and saved data first; require idle cash/tournament/Rush state, including embedded funded pools. Wait for unload before bootstrap. Startup failure restores the prior plist/service. Verify HTTP modules against the release manifest, catalog, capability headers and unchanged saved data.

The live app is then pinned to that installation: editing or merging the checkout alone does not update it. Each later code change requires a new clean committed release, installed-runtime QA and a guarded service switch. Keep prior releases/configuration backups available for recovery. Reference artwork remains in its existing nonsynced directory; player data remains in the existing owner directory. The source checkout is preserved for development.

Native binary packaging, physical graphics/audio comparison and the remaining FEATURES workflows are still open.
