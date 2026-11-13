"""Extract the source-bound default Starling cash Sit Out glyph."""
import hashlib,json,runpy,sys,zipfile
from pathlib import Path
from PIL import Image
root,out=map(Path,sys.argv[1:]);decoder=runpy.run_path(str(Path(__file__).with_name('extract-starling-atf.py')));decoder['self_test']()
atf=root/'table_assets/table_assets_1.atf';archive=atf.with_suffix('.zip')
with zipfile.ZipFile(archive)as z:frames=json.loads(z.read('table_assets_1.json').decode('utf-8-sig'))['frames']
f=frames['player_cell0192'];assert not f['rotated'];r=f['frame'];x,y,w,h=(r[k]for k in ['x','y','w','h']);image=decoder['decode_atf'](atf.read_bytes());assert min(w,h)>0 and x+w<=image.width and y+h<=image.height
crop=image.crop((x,y,x+w,y+h)).convert('RGBA');dest=out/'native-sitout-default.png';crop.save(dest)
with Image.open(dest)as actual:assert actual.convert('RGBA').tobytes()==crop.tobytes()
report={'source':'Starling player_cell0192; PlayerSitOutUI3D default state','sources':{p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in [atf,archive]},'file':dest.name,'size':[w,h],'rgbaExact':True,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}
(out/'rea/sitout-art.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
