"""Extract only source-bound Helmet sprites from desktop and Starling atlases."""
import hashlib,json,runpy,sys,zipfile
from pathlib import Path
from PIL import Image
root,out=map(Path,sys.argv[1:]);decoder=runpy.run_path(str(Path(__file__).with_name('extract-starling-atf.py')));decoder['self_test']();records=[]
def crop(image,frames,key,name):
 f=frames[key];r=f['frame'];assert not f['rotated'];x,y,w,h=(r[k]for k in ['x','y','w','h']);assert min(w,h)>0 and x+w<=image.width and y+h<=image.height
 # Installed AtlasLoader/JsonTextureAtlas use frame only, ignoring inconsistent trim metadata.
 expected=image.crop((x,y,x+w,y+h)).convert('RGBA');dest=out/('native-helmet-'+name+'.png');expected.save(dest)
 with Image.open(dest)as actual:assert actual.convert('RGBA').tobytes()==expected.tobytes()
 records.append({'frame':key,'file':dest.name,'size':[w,h],'rgbaExact':True,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size})
desktop=root/'init_lobby/desktop_assets';frames=json.loads(desktop.with_suffix('.json').read_text(encoding='utf-8-sig'))['frames']
with Image.open(desktop.with_suffix('.png'))as image:
 for index,name in [(299,'entry'),(300,'entry-over'),(301,'entry-down'),(333,'normal'),(334,'selected'),(336,'all'),(337,'all-selected'),(338,'this'),(339,'this-selected'),(340,'arrow'),(341,'arrow-selected')]:crop(image,frames,f'table_popup{index:04d}',name)
source=root/'table_assets';atf=source/'table_assets_1.atf';archive=source/'table_assets_1.zip'
with zipfile.ZipFile(archive)as z:frames=json.loads(z.read('table_assets_1.json').decode('utf-8-sig'))['frames']
crop(decoder['decode_atf'](atf.read_bytes()),frames,'player_cell0071','player')
report={'sources':{p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in [desktop.with_suffix('.json'),desktop.with_suffix('.png'),atf,archive]},'sprites':records,'scope':'installed frame-only loaders; Starling player texture never substituted with desktop duplicate'}
(out/'rea/helmet-art.json').write_text(json.dumps(report,indent=2));print('PASS12nativeHelmet sprites:decoded RGBA equal to source regions;'+str(sum(r['bytes']for r in records))+' PNGbytes')
