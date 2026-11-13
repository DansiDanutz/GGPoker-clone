"""Retain native free TimeBankChipButton/counter pixels privately."""
from pathlib import Path
import json,hashlib
from PIL import Image
source=Path('/Users/davidai/Library/Application Support/com.nsuslab.ncf.launcher.live.ggpcom/Game/assets/after_lobby')
out=Path(__file__).resolve().parent.parent/'home-art'
atlas=json.loads((source/'desktop_table_assets.json').read_text('utf-8-sig'))['frames'];image=Image.open(source/'desktop_table_assets.png').convert('RGBA');report={'sources':{str(source/name):hashlib.sha256((source/name).read_bytes()).hexdigest()for name in ['desktop_table_assets.json','desktop_table_assets.png']},'sprites':{}}
for name,index,size in [('free',399,(120,94)),('disabled',408,(120,94)),('counter',405,(60,60)),('reserved',415,(35,36))]:
 f=atlas[f'table{index:04d}'];assert not f['rotated'];r=f['frame'];x,y,w,h=(r[k]for k in ['x','y','w','h']);assert (w,h)==size and x+w<=image.width and y+h<=image.height
 crop=image.crop((x,y,x+w,y+h));target=out/f'native-time-card-{name}.png';crop.save(target)
 with Image.open(target)as check:assert check.convert('RGBA').tobytes()==crop.tobytes()
 report['sprites'][name]={'index':index,'rect':[x,y,w,h],'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
(out/'rea/time-card-art.json').write_text(json.dumps(report,indent=2));print('PASS native free/disabled120x94 andcounter60x60/reservation35x36 exact atlas pixel roundtrip')
