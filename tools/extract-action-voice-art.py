"""Copy exact original Action Voice atlas regions; no painted substitutes."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('destination', type=Path)
args = parser.parse_args()
base = Path.home() / 'Library/Application Support/com.nsuslab.ncf.launcher.live.ggpcom/Game/assets/init_lobby'
mapping = {
    'native-action-voice-edge.png': 'lobby_option0394',
    'native-action-voice-button.png': 'lobby_option0395',
    'native-action-voice-button-active.png': 'lobby_option0396',
    'native-action-voice-speaker.png': 'lobby_option0185',
    'native-action-voice-speaker-muted.png': 'lobby_option0186',
    'native-action-voice-volume-balloon.png': 'lobby_option0187',
}
digest = lambda data: hashlib.sha256(data).hexdigest()
metadata = base / 'desktop_assets.json'
texture = base / 'desktop_assets.png'
frames = json.loads(metadata.read_text('utf-8-sig'))['frames']
atlas = Image.open(texture).convert('RGBA')
args.destination.mkdir(parents=True, exist_ok=True)
receipt = {'sources': {str(p): digest(p.read_bytes()) for p in [metadata, texture]}, 'files': []}
for filename, key in mapping.items():
    rect = frames[key]['frame']
    x, y, width, height = (rect[k] for k in ['x', 'y', 'w', 'h'])
    image = atlas.crop((x, y, x + width, y + height))
    output = args.destination / filename
    image.save(output)
    assert Image.open(output).convert('RGBA').tobytes() == image.tobytes()
    receipt['files'].append({'file': filename, 'frame': key, 'rect': [x, y, width, height], 'bytes': output.stat().st_size, 'sha256': digest(output.read_bytes())})
(args.destination / 'action-voice-art-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
print('PASS six exact RGBA Action Voice regions;', sum(row['bytes'] for row in receipt['files']), 'PNG bytes')
