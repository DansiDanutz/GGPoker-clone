"""Recover named native tournament or Spin MP3s; private output, no playback."""
import hashlib
import json
from pathlib import Path
import struct
import sys
import zlib

assert len(sys.argv) in (3,4) and (len(sys.argv)==3 or sys.argv[3] in ('--spin','--insurance'))
source, destination = map(Path, sys.argv[1:3])
selected=[("TournamentFallResult",443520,3),("TournamentResultFT",488448,3),("TournamentResultITM",510336,3)] if len(sys.argv)==3 else [('SpinAndGoldSpin',192384,3),('SNGWheelStuckHigh',11520,3),('SNGWheelStuckLow',6912,3),('SngFireworks',46656,2),('SNGWheelOut',126720,3),('SngBigWin',472320,3),('SngWheelFrameEffect',82944,3),('SngWheelFrameLight',66816,3),('SngWheelBaseLight',208512,3)]
if len(sys.argv)==4 and sys.argv[3]=='--insurance':selected=[('SngInsuranceText',155520,3),('SngPrizeCheers',73728,3),('SngPrizeDaller',129024,3)]
raw = source.read_bytes()
assert raw[:3] in (b"CWS", b"FWS"), "Unsupported SWF compression"
data = raw[:8] + zlib.decompress(raw[8:]) if raw[:3] == b"CWS" else raw
assert len(data) == struct.unpack_from("<I", data, 4)[0], "Invalid SWF length"
pos = 8 + (5 + 4 * (data[8] >> 3) + 7) // 8 + 4
symbols, sounds = {}, {}
while pos < len(data):
    header = struct.unpack_from("<H", data, pos)[0]
    pos += 2
    kind, size = header >> 6, header & 63
    if size == 63:
        size = struct.unpack_from("<I", data, pos)[0]
        pos += 4
    assert pos + size <= len(data), "Truncated SWF tag"
    part = data[pos:pos + size]
    pos += size
    if kind == 76:
        offset = 2
        for _ in range(struct.unpack_from("<H", part)[0]):
            character = struct.unpack_from("<H", part, offset)[0]
            offset += 2
            end = part.index(0, offset)
            symbols[part[offset:end].decode()] = character
            offset = end + 1
    if kind == 14:
        sounds[struct.unpack_from("<H", part)[0]] = part
    if kind == 0:
        break
recovered = {}
for name, expected, expected_rate in selected:
    character = symbols["Sound" + name]
    sound = sounds[character]
    rate=(sound[2] >> 2) & 3
    assert sound[2] >> 4 == 2 and rate in (2,3) and (expected_rate is None or rate==expected_rate), "Expected native MP3 sample rate"
    samples = struct.unpack_from("<I", sound, 3)[0]
    assert samples > 0 and (expected is None or samples == expected), "Native sample count changed; review source"
    payload = sound[9:]
    assert len(payload) > 1000 and payload[0] == 255 and payload[1] & 224 == 224, "Missing MP3 sync"
    recovered[name] = (payload, {"character": character, "samples": samples, "sampleRate":(5512,11025,22050,44100)[rate], "seekSamples": struct.unpack_from("<h", sound, 7)[0], "bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest()})
destination.mkdir(exist_ok=False)
for name, (payload, _) in recovered.items():
    target = destination / (name + ".mp3")
    target.write_bytes(payload)
    assert target.read_bytes() == payload
receipt = {"sourceSha256": hashlib.sha256(raw).hexdigest(), "sounds": {name: record for name, (_, record) in recovered.items()}}
(destination / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n")
print("PASS "+str(len(selected))+" exact native MP3 payloads, named symbol mapping, native sample rates/counts and byte readback")
print(json.dumps(receipt['sounds']))
