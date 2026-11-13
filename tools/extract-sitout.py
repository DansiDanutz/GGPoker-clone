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

# Other Starling status glyphs and the desktop selector are separate atlas sources.
sprites=[]
for state,index in [(1,193),(2,194),(4,195),(8,196)]:
 f=frames[f'player_cell{index:04}'];assert not f['rotated'];r=f['frame'];x,y,w,h=(r[k]for k in ['x','y','w','h']);assert min(w,h)>0 and x+w<=image.width and y+h<=image.height
 expected=image.crop((x,y,x+w,y+h));dest=out/f'native-sitout-{state}.png';expected.save(dest)
 with Image.open(dest)as actual:assert actual.convert('RGBA').tobytes()==expected.convert('RGBA').tobytes()
 sprites.append({'frame':f'player_cell{index:04}','file':dest.name,'size':[w,h],'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
desktop=root/'after_lobby/desktop_table_assets';df=json.loads(desktop.with_suffix('.json').read_text(encoding='utf-8-sig'))['frames']
with Image.open(desktop.with_suffix('.png'))as di:
 for index,name in [(121,'base'),(366,'1'),(367,'2'),(368,'4'),(369,'8')]:
  f=df[f'table_menu{index:04}'];assert not f['rotated'];r=f['frame'];x,y,w,h=(r[k]for k in ['x','y','w','h']);assert min(w,h)>0 and x+w<=di.width and y+h<=di.height
  expected=di.crop((x,y,x+w,y+h)).convert('RGBA');dest=out/f'native-sitout-choice-{name}.png';expected.save(dest)
  with Image.open(dest)as actual:assert actual.convert('RGBA').tobytes()==expected.tobytes()
  sprites.append({'frame':f'table_menu{index:04}','file':dest.name,'size':[w,h],'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
report['sprites']=sprites;report['sources'].update({p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in [desktop.with_suffix('.png'),desktop.with_suffix('.json')]});(out/'rea/sitout-art.json').write_text(json.dumps(report,indent=2));print('PASS9 additional Sit Out glyph/selector crops: source-region RGBA equal')
