"""Extract DesktopNotice's desktop player_cell0100 frame without guessed trimming."""
import hashlib,json,sys
from pathlib import Path
from PIL import Image
root,out=map(Path,sys.argv[1:]);source=root/'after_lobby/desktop_table_assets';atlas=source.with_suffix('.png');metadata=source.with_suffix('.json')
f=json.loads(metadata.read_text(encoding='utf-8-sig'))['frames']['player_cell0100'];assert not f['rotated'];r=f['frame'];x,y,w,h=[r[k]for k in ['x','y','w','h']]
with Image.open(atlas)as image:
 assert min(w,h)>0 and x+w<=image.width and y+h<=image.height
 crop=image.crop((x,y,x+w,y+h)).convert('RGBA')
dest=out/'native-tournament-notice.png';crop.save(dest)
with Image.open(dest)as actual:assert actual.convert('RGBA').tobytes()==crop.tobytes()
report={'frame':'player_cell0100','size':[w,h],'file':dest.name,'rgbaExact':True,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'sources':{str(p):hashlib.sha256(p.read_bytes()).hexdigest()for p in [atlas,metadata]}}
(out/'rea/tournament-notice-art.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
