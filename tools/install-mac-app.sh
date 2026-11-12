#!/bin/zsh
set -euo pipefail
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
app_dir="${PLAYGG_APP_DIR:-$HOME/Applications/PLAYGG Local.app}"
node_bin="$(command -v node)"
if [[ -e "$app_dir" ]]; then
  [[ "$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$app_dir/Contents/Info.plist")" == 'com.danslab.playgglocal.codex' ]] || exit 1
fi
mkdir -p "$app_dir/Contents/MacOS"
swiftc -swift-version 5 -parse-as-library "$project_dir/tools/playgg-mac.swift" -o "$app_dir/Contents/MacOS/PLAYGGLocal"
python3 - "$app_dir" "$project_dir" "$node_bin" <<'PY'
import pathlib,plistlib,sys
app,project,node=sys.argv[1:]
info={'CFBundleIdentifier':'com.danslab.playgglocal.codex','CFBundleName':'PLAYGG Local','CFBundleDisplayName':'PLAYGG Local','CFBundleExecutable':'PLAYGGLocal','CFBundlePackageType':'APPL','CFBundleVersion':'1','NSHighResolutionCapable':True,'NSAppTransportSecurity':{'NSAllowsLocalNetworking':True},'PokerURL':'http://127.0.0.1:18770/','PokerProject':project,'PokerNode':node,'PokerData':str(pathlib.Path.home()/'.local/share/playgg-owner')}
with open(pathlib.Path(app)/'Contents/Info.plist','wb') as f:plistlib.dump(info,f)
PY
codesign --force --sign - "$app_dir"
printf '%s\n' "$app_dir"
