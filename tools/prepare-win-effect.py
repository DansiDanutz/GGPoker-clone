"""Preserve native rendered pixels; set the shipped runtime's one-shot frame clock."""
from pathlib import Path
import binascii
import shutil
import struct
import sys

source, final, output = map(Path, sys.argv[1:])
data = source.read_bytes()
assert data[:8] == b'\x89PNG\r\n\x1a\n'
chunks = []
pos = 8
while pos < len(data):
    size = struct.unpack_from('>I', data, pos)[0]
    kind, payload = data[pos + 4:pos + 8], data[pos + 8:pos + 8 + size]
    assert binascii.crc32(kind + payload) & 0xffffffff == struct.unpack_from('>I', data, pos + 8 + size)[0]
    chunks.append([kind, payload])
    pos += size + 12
assert pos == len(data) and chunks[-1][0] == b'IEND'
control = next(c for c in chunks if c[0] == b'acTL')
assert struct.unpack('>II', control[1]) == (46, 0)
control[1] = struct.pack('>II', 46, 1)
frames = [c for c in chunks if c[0] == b'fcTL']
assert len(frames) == 46
for frame in frames:
    fields = list(struct.unpack('>IIIIIHHBB', frame[1]))
    assert fields[1:5] == [729, 622, 0, 0]
    fields[5:7] = [333, 10000]
    if frame is frames[-1]:
        fields[7] = 0
    frame[1] = struct.pack('>IIIIIHHBB', *fields)
result = data[:8] + b''.join(struct.pack('>I', len(payload)) + kind + payload + struct.pack('>I', binascii.crc32(kind + payload) & 0xffffffff) for kind, payload in chunks)
assert struct.unpack('>II', final.read_bytes()[16:24]) == (729, 622)
(output / 'native-win-effect.png').write_bytes(result)
shutil.copyfile(final, output / 'native-win-final.png')
print('PASS native WIN:46 frames,33.3ms,one play,last frame retained; pixel payloads unchanged')
