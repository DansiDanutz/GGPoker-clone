#!/bin/zsh
set -euo pipefail
if [[ "${PLAYGG_ALLOW_FOREGROUND_QA:-0}" != 1 ]]; then
  print -u2 "Visible Mac QA disabled: keep working in the background. Run only after an explicit foreground-test request, with PLAYGG_ALLOW_FOREGROUND_QA=1."
  exit 2
fi
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
qa_root="$(mktemp -d /tmp/playgg-mac-qa.XXXXXX)"
qa_id="com.danslab.playgglocal.qa.$(uuidgen | tr -d '-')"
qa_app="$qa_root/PLAYGG QA.app"
node_bin="$(command -v node)"
qa_port="$($node_bin --input-type=module -e 'import net from "node:net";const s=net.createServer();s.listen(0,"127.0.0.1",()=>{process.stdout.write(String(s.address().port));s.close()})')"
cleanup() {
  if [[ -f "$qa_root/backend.pid" ]]; then
    local qa_pid="$(cat "$qa_root/backend.pid")"
    if [[ "$(lsof -tiTCP:"$qa_port" -sTCP:LISTEN 2>/dev/null)" == "$qa_pid" ]]; then kill -TERM "$qa_pid" 2>/dev/null || true; fi
  fi
  rm -rf "$qa_root"
  for item in "$HOME/Library/WebKit/$qa_id" "$HOME/Library/Caches/$qa_id" "$HOME/Library/HTTPStorages/$qa_id"; do rm -rf "$item"; done
}
trap cleanup EXIT
mkdir -p "$qa_app/Contents/MacOS"
swiftc -swift-version 5 -parse-as-library -DPLAYGG_QA "$project_dir/tools/playgg-mac.swift" "$project_dir/tools/playgg-mac-test.swift" -o "$qa_app/Contents/MacOS/PLAYGGNativeQA"
python3 - "$qa_app" "$qa_id" <<'PY'
import pathlib,plistlib,sys
with open(pathlib.Path(sys.argv[1])/'Contents/Info.plist','wb') as f:
    plistlib.dump({'CFBundleIdentifier':sys.argv[2],'CFBundleName':'PLAYGG Native QA','CFBundleExecutable':'PLAYGGNativeQA','CFBundlePackageType':'APPL','NSAppTransportSecurity':{'NSAllowsLocalNetworking':True}},f)
PY
codesign --force --sign - "$qa_app"
audio_ok=1
for stage in first second; do
  if [[ "$stage" == first && "${PLAYGG_AUDIO_PROBE:-0}" == 1 ]]; then
    "$qa_app/Contents/MacOS/PLAYGGNativeQA" "$qa_root" "http://127.0.0.1:$qa_port/" "$project_dir" "$node_bin" "$stage" &
    qa_pid=$!
    for attempt in {1..100}; do [[ -f "$qa_root/audio-ready" ]] && break; kill -0 "$qa_pid" 2>/dev/null || break; sleep 0.1; done
    swift "$project_dir/tools/native-audio-probe.swift" "$qa_id" > "$qa_root/audio.log" 2>&1 &
    audio_pid=$!
    wait "$qa_pid"
    wait "$audio_pid"
    cat "$qa_root/audio.log"
    python3 - "$qa_root/audio.log" "$project_dir/home-art/rea/local-webkit-audio-meter.json" <<'PYTHON' || audio_ok=0
import pathlib,re,sys,json,datetime
text=pathlib.Path(sys.argv[1]).read_text();m=re.search(r'frames=(\d+) peak=([0-9.eE+-]+)',text)
assert m,'Audio meter did not return a measurement'
result={'captured_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'frames':int(m[1]),'peak':float(m[2]),'scope':'Exact isolated native QA app bundle; no audio samples retained','status':'observed-nonzero' if int(m[1])>0 and float(m[2])>0 else 'unverified-silent-attribution','limitation':'A zero parent-app tap does not distinguish silent playback from WebKit helper attribution. Physical speaker playback and native reference timing remain unverified.'}
pathlib.Path(sys.argv[2]).write_text(json.dumps(result,indent=2)+'\n')
assert result['status']=='observed-nonzero','UNVERIFIED: no nonzero app-attributed audio was observed'
print('PASS native app-attributed audio: nonzero PCM measured without retaining samples')
PYTHON
  else
    "$qa_app/Contents/MacOS/PLAYGGNativeQA" "$qa_root" "http://127.0.0.1:$qa_port/" "$project_dir" "$node_bin" "$stage"
  fi
done

"$node_bin" "$project_dir/tools/native-hand-verify.mjs" "$qa_root"

[[ "$audio_ok" == 1 ]]
