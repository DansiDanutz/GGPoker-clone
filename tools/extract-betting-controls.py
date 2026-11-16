"""Recover native betting radio/checkbox sprites; verify existing radio art unchanged."""
from pathlib import Path
from PIL import Image
import sys,json,hashlib
assets,existing,out,report=map(Path,sys.argv[1:]);source=assets/'init_lobby/desktop_assets';frames=json.loads(source.with_suffix('.json').read_text('utf-8-sig'))['frames'];out.mkdir(parents=True,exist_ok=True);rows=[]
with Image.open(source.with_suffix('.png')) as image:
 for index,name,reuse in [(345,'native-language-toggle-mark.png',True),(346,'native-language-toggle-off.png',True),(347,'native-language-toggle-on.png',True),(350,'native-language-toggle-disabled.png',True),(348,'native-betting-checkbox-off.png',False),(349,'native-betting-checkbox-on.png',False)]:
  item=frames[f'lobby_option{index:04}'];assert not item['rotated'];x,y,w,h=(item['frame'][k]for k in ['x','y','w','h']);crop=image.crop((x,y,x+w,y+h)).convert('RGBA');target=(existing if reuse else out)/name
  if not reuse:assert not target.exists();crop.save(target)
  with Image.open(target) as actual:assert actual.convert('RGBA').tobytes()==crop.tobytes()
  rows.append({'index':index,'file':name,'rect':[x,y,w,h],'reused':reuse,'rgbaExact':True,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
report.write_text(json.dumps({'method':'Exact frame-only decoded RGBA readback against installed native atlas','sources':{str(p):hashlib.sha256(p.read_bytes()).hexdigest()for p in [source.with_suffix('.json'),source.with_suffix('.png')]},'files':rows},indent=2)+'\n');print('PASS six native sprites; four reused, two checkbox crops totaling'+str(sum(r['bytes']for r in rows if not r['reused']))+'bytes')
