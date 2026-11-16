"""Recover three source-indexed sidebar skins and verify exact frame RGBA."""
from pathlib import Path
from PIL import Image
import hashlib,json,sys
assets,out,report=map(Path,sys.argv[1:]);source=assets/'init_lobby/desktop_assets';frames=json.loads(source.with_suffix('.json').read_text('utf-8-sig'))['frames'];out.mkdir(parents=True,exist_ok=True);rows=[]
with Image.open(source.with_suffix('.png'))as image:
 for index,state in [(977,'up'),(978,'down'),(979,'selected')]:
  item=frames[f'lobby{index:04}'];assert not item['rotated'];x,y,w,h=(item['frame'][k]for k in ['x','y','w','h']);assert(w,h)==(10,10);crop=image.crop((x,y,x+w,y+h)).convert('RGBA');target=out/f'native-settings-tab-{state}.png';assert not target.exists();crop.save(target)
  with Image.open(target)as actual:assert actual.convert('RGBA').tobytes()==crop.tobytes()
  rows.append({'index':index,'file':target.name,'rect':[x,y,w,h],'rgbaExact':True,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
report.write_text(json.dumps({'method':'Exact frame-only decoded RGBA readback; no atlas trim reconstruction or color transform','sources':{str(p):hashlib.sha256(p.read_bytes()).hexdigest()for p in [source.with_suffix('.json'),source.with_suffix('.png')]},'files':rows},indent=2)+'\n');print('PASS three native settings tab crops:'+str(sum(r['bytes']for r in rows))+'bytes')
