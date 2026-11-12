"""Decode the installed normal-table variants using their original frame metadata."""
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import sys
import tempfile

source_root, output = map(Path, sys.argv[1:])
reference = json.loads((output / 'rea/table-theme-assets.json').read_text())['assets']
assert len(reference) == 20
records = []
with tempfile.TemporaryDirectory(prefix='playgg-variant-atlas-') as scratch:
    scratch = Path(scratch)
    for variant, native in [('plo5', 'PLO5'), ('plo6', 'PLO6'), ('shortdeck', 'ShortDeck')]:
        for original in reference:
            filename = Path(original['source']).name.replace('Table_Holdem_', 'Table_' + native + '_')
            source = source_root / filename
            metadata = source.with_suffix('.json')
            raw = source.read_bytes()
            digest = hashlib.sha256(raw).hexdigest()
            assert raw[:3] == b'ATF' and raw[6:8] == b'\xff\x03' and raw[12] == 5
            width, height = 1 << raw[13], 1 << raw[14]
            length = width * height
            assert width == height == 1024 and len(raw) >= 20 + length
            frames = json.loads(metadata.read_text(encoding='utf-8-sig'))['frames']
            assert len(frames) == 1
            frame = next(iter(frames.values()))['frame']
            assert frame == {'x': 0, 'y': 0, 'w': 1024, 'h': 723}
            header = b'DDS ' + struct.pack('<7I', 124, 0x81007, height, width, length, 0, 0) + bytes(44)
            header += struct.pack('<2I', 32, 4) + b'DXT5' + bytes(20) + struct.pack('<5I', 0x1000, 0, 0, 0, 0)
            assert len(header) == 128
            dds = scratch / 'frame.dds'
            dds.write_bytes(header + raw[20:20 + length])
            decoded = scratch / 'frame.png'
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(dds), '-vf', 'crop=1024:723:0:0', '-frames:v', '1', '-threads', '1', str(decoded)], check=True)
            png = decoded.read_bytes()
            assert png[:8] == b'\x89PNG\r\n\x1a\n' and struct.unpack('>II', png[16:24]) == (1024, 723)
            assert hashlib.sha256(source.read_bytes()).hexdigest() == digest
            destination = output / ('native-theme-' + variant + '-' + original['id'] + '.png')
            decoded.replace(destination)
            records.append({'variant': variant, 'id': original['id'], 'source': str(source), 'source_sha256': digest, 'metadata_sha256': hashlib.sha256(metadata.read_bytes()).hexdigest(), 'frame': frame, 'output': str(destination), 'output_sha256': hashlib.sha256(png).hexdigest(), 'bytes': len(png)})
        print('PASS', variant, '20 decoded native themes', flush=True)
assert len(records) == 60
(output / 'rea/variant-theme-assets.json').write_text(json.dumps({'method': 'Native ATF DXT5 payload decoded with existing ffmpeg and cropped to its verified metadata frame', 'assets': records, 'generated_bytes': sum(r['bytes'] for r in records)}, indent=2) + '\n')
