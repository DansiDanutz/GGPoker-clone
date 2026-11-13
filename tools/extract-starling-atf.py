"""Decode the installed Starling atlas, distinct from StageAssets desktop textures."""
import hashlib
import json
from pathlib import Path
import struct
import sys
import zipfile
from PIL import Image


def decode_atf(data):
    if len(data) < 16 or data[:3] != b'ATF' or (data[6] != 255 or data[7] not in (2,3)) or data[12] != 5:
        raise ValueError('Expected ATF v2/v3 raw DXT5 alpha texture')
    if int.from_bytes(data[8:12], 'big') != len(data) - 12:
        raise ValueError('Invalid ATF declared length')
    width, height = 1 << data[13], 1 << data[14]
    if width > 8192 or height > 8192 or not data[15]:
        raise ValueError('Invalid ATF dimensions or mip count')
    offset, pixels = 16, None
    for level in range(data[15]):
        for plane in range(4 if data[7] == 3 else 3):
            if offset + 4 > len(data):
                raise ValueError('Truncated ATF plane header')
            size = int.from_bytes(data[offset:offset + 4], 'big')
            offset += 4
            if offset + size > len(data):
                raise ValueError('Truncated ATF plane')
            if level == 0 and plane == 0:
                expected = ((width + 3) // 4) * ((height + 3) // 4) * 16
                if size != expected:
                    raise ValueError('Invalid DXT5 base-level size')
                pixels = data[offset:offset + size]
            offset += size
    if offset != len(data):
        raise ValueError('Unexpected ATF trailing bytes')
    return Image.frombytes('RGBA', (width, height), pixels, 'bcn', (3, 'DXT5'))


def self_test():
    def texture(block):
        body = bytes([5, 2, 2, 1]) + len(block).to_bytes(4, 'big') + block + bytes(8)
        return b'ATF\0\0\0\xff\x02' + len(body).to_bytes(4, 'big') + body
    white = bytes([255, 0]) + bytes(6) + struct.pack('<HHI', 65535, 0, 0)
    assert decode_atf(texture(white)).tobytes() == bytes([255, 255, 255, 255])*16
    v3=bytearray(texture(white)+bytes(4));v3[7]=3;v3[8:12]=(len(v3)-12).to_bytes(4,'big')
    assert decode_atf(bytes(v3)).tobytes() == bytes([255, 255, 255, 255])*16
    clear = bytes([0, 255]) + bytes(6) + struct.pack('<HHI', 0, 65535, 0)
    assert decode_atf(texture(clear)).tobytes() == bytes(64)
    red = bytes([255, 0]) + bytes(6) + struct.pack('<HHI', 0xf800, 0, 0)
    assert decode_atf(texture(red)).tobytes() == bytes([255, 0, 0, 255])*16
    half_alpha = bytes([128, 0]) + bytes(6) + struct.pack('<HHI', 65535, 0, 0)
    assert decode_atf(texture(half_alpha)).tobytes() == bytes([255, 255, 255, 128])*16
    def declared_length(data):
        return data[:8] + (len(data)-12).to_bytes(4, 'big') + data[12:]
    for bad in [declared_length(bytes(v3[:-4])),b'', texture(white)[:-1], texture(white)[:12] + bytes([4]) + texture(white)[13:], texture(white) + b'x', declared_length(texture(white)[:30]), declared_length(texture(white)[:-4])]:
        try:
            decode_atf(bad)
        except ValueError:
            pass
        else:
            raise AssertionError('Invalid ATF accepted')


def extract(source, output):
    atf = source / 'table_assets_1.atf'
    archive = source / 'table_assets_1.zip'
    with zipfile.ZipFile(archive) as z:
        atlas = json.loads(z.read('table_assets_1.json').decode('utf-8-sig'))
    image = decode_atf(atf.read_bytes())
    if image.size != (atlas['meta']['size']['w'], atlas['meta']['size']['h']):
        raise ValueError('Atlas dimensions do not match ATF')
    frames = {'player-ring': 'player_cell0001', 'player-label': 'player_cell0002',
              'aof-dealer': 'player_cell0022', 'pot-label': 'table0049',
              'turn-glow': 'player_cell0004', 'time-bank': 'player_cell0107', 'time-bank-down': 'player_cell0108'}
    frames.update({f'clock-digit-{i}': f'chess_clock{i:04d}' for i in range(11)})
    frames.update({'limit-bg': 'player_cell0102', 'limit-red': 'player_cell0104', 'limit-pointer': 'player_cell0105'})
    frames.update({'player-note-color': 'player_cell0165', 'player-note-text': 'player_cell0164'})
    frames['player-hud-bg'] = 'player_cell0099'
    frames['game-clock'] = 'player_cell0190'
    frames['game-clock-reconnecting'] = 'player_cell0191'
    denominations = [500000000000, 100000000000, 25000000000, 5000000000, 1000000000,
                     500000000, 100000000, 25000000, 5000000, 1000000, 500000,
                     100000, 25000, 5000, 1000, 250, 50, 10]
    frames.update({f'play-chip-{value}': f'table{380+i:04d}' for i, value in enumerate(denominations)})
    report = {'scope': 'Starling Assets.current table atlas; not StageAssets desktop_table_assets',
              'source_sha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in [atf, archive]},
              'references': ['https://raw.githubusercontent.com/Gamua/Starling-Framework/master/starling/src/starling/textures/AtfData.as', 'Installed Pillow DdsImagePlugin.py DXT5 n=3 mapping'],
              'size': image.size, 'decoder': f'Pillow {Image.__version__} BC3/DXT5, base mip', 'sprites': {}}
    for name, key in frames.items():
        frame = atlas['frames'][key]
        r = frame['frame']
        x, y, w, h = (r[k] for k in ['x', 'y', 'w', 'h'])
        if frame['rotated'] or min(x, y) < 0 or min(w, h) <= 0 or x+w > image.width or y+h > image.height:
            raise ValueError(f'Unsupported atlas frame: {key}')
        if name.startswith('play-chip-') and (w, h) != (36, 35):
            raise ValueError('Chip frame does not belong to the expected Starling atlas')
        crop = image.crop((x, y, x+w, y+h))
        path = output / f'native-reserved-{name}.png'
        crop.save(path)
        if name.startswith('player-note-'):
            colors = ['00B050','269CFF','7030AA','7AFFE8','862C08','96FA3E','FF0000','FF8121','FFC7D2','FFFF00','FFFFFF']
            for index, color in enumerate(colors):
                channels = crop.convert('RGBA').split()
                factors = [int(color[n:n+2], 16) for n in (0,2,4)]
                tinted = Image.merge('RGBA', tuple(channels[n].point(lambda v, factor=factors[n]: v*factor//255) for n in range(3)) + (channels[3],))
                target = output / f'native-reserved-{name}-{index}.png'
                tinted.save(target)
                with Image.open(target) as decoded:
                    assert decoded.convert('RGBA').tobytes() == tinted.tobytes()
                assert tinted.getchannel('A').tobytes() == channels[3].tobytes()

        if name.startswith('clock-digit-'):
            red, green, blue, alpha = crop.convert('RGBA').split()
            Image.merge('RGBA', (red, green.point(lambda v: v*46//255), blue.point(lambda v: v*46//255), alpha)).save(output / f'native-reserved-{name}-hot.png')
        with Image.open(path) as decoded:
            assert decoded.convert('RGBA').tobytes() == crop.tobytes(), name
        report['sprites'][name] = {'frame': key, 'rect': [x, y, w, h], 'bytes': path.stat().st_size,
                                  'rgba_sha256': hashlib.sha256(crop.tobytes()).hexdigest(),
                                  'png_sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
    # Native applySlice9Grid(14x10) gives(7,5,0,0): the stretched center samples the seam.
    with Image.open(output / 'native-reserved-limit-bg.png') as source_bg:
        bg = source_bg.convert('RGBA')
        assert bg.size == (14, 10)
        expanded = Image.new('RGBA', (168, 10))
        expanded.paste(bg.crop((0, 0, 7, 10)), (0, 0))
        seam = Image.blend(bg.crop((6, 0, 7, 10)), bg.crop((7, 0, 8, 10)), .5)
        expanded.paste(seam.resize((154, 10)), (7, 0))
        expanded.paste(bg.crop((7, 0, 14, 10)), (161, 0))
        assert expanded.crop((0, 0, 7, 10)).tobytes() == bg.crop((0, 0, 7, 10)).tobytes()
        assert expanded.crop((161, 0, 168, 10)).tobytes() == bg.crop((7, 0, 14, 10)).tobytes()
        expanded.save(output / 'native-reserved-limit-bg-expanded.png')
        report['limit_scale9'] = {'grid': [7, 5, 0, 0], 'size': [168, 10], 'center': 'Bilinear seam sampling; native GPU byte rounding remains unverified'}
    # PlayerTurnEffect3D TYPE_URGENCY color 0xff7f7f multiplies RGB, preserving alpha.
    with Image.open(output / 'native-reserved-turn-glow.png') as glow:
        rgba = glow.convert('RGBA')
        red, green, blue, alpha = rgba.split()
        tinted = Image.merge('RGBA', (red, green.point(lambda v: v*127//255),
                                     blue.point(lambda v: v*127//255), alpha))
        target = output / 'native-reserved-turn-glow-urgent.png'
        tinted.save(target)
        with Image.open(target) as decoded:
            assert decoded.convert('RGBA').tobytes() == tinted.tobytes()
        assert tinted.getchannel('A').tobytes() == rgba.getchannel('A').tobytes()
        report['turn_urgency'] = {'color': '0xff7f7f', 'alpha': 'unchanged',
                                 'png_sha256': hashlib.sha256(target.read_bytes()).hexdigest()}
    (output / 'rea/starling-atlas-extraction.json').write_text(json.dumps(report, indent=2)+'\n')
    print(f'PASS {len(frames)} Starling sprites: decoded PNG pixels equal ATF base-mip crops')


if __name__ == '__main__':
    self_test()
    if sys.argv[1:] == ['--self-test']:
        print('PASS ATF/BC3 opaque, transparent, color and malformed-input tests')
    elif len(sys.argv) == 3:
        extract(Path(sys.argv[1]), Path(sys.argv[2]))
    else:
        raise SystemExit('Usage: extract-starling-atf.py --self-test | SOURCE_DIRECTORY OUTPUT_DIRECTORY')
