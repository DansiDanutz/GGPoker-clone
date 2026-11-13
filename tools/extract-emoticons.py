"""Copy native three-family table art and crop its exact desktop menu/history frames."""
from pathlib import Path
import hashlib,json,sys,shutil
from PIL import Image
root,out=map(Path,sys.argv[1:]);source=root/'after_lobby/desktop_table_assets';frames=json.loads(source.with_suffix('.json').read_text(encoding='utf-8-sig'))['frames'];records=[]
with Image.open(source.with_suffix('.png'))as atlas:
 for index in [base+n for base in [0,1000,4000] for n in [*range(1,28),30]]:
  original=root/'emoticon'/(str(index)+'.png');full=out/('native-emoticon-'+str(index)+'.png');shutil.copyfile(original,full);assert original.read_bytes()==full.read_bytes()
  with Image.open(full)as image:assert image.size==(200,200)
  key='emoticon'+str(index-1).zfill(4);f=frames[key];r=f['frame'];assert not f['rotated'];x,y,w,h=(r[k]for k in ['x','y','w','h']);expected=atlas.crop((x,y,x+w,y+h)).convert('RGBA');thumb=out/('native-emoticon-thumb-'+str(index)+'.png');expected.save(thumb)
  with Image.open(thumb)as actual:assert actual.convert('RGBA').tobytes()==expected.tobytes()
  records.append({'id':index,'frame':key,'thumbSize':[w,h],'full':full.name,'thumb':thumb.name,'fullOriginal':str(original),'fullSHA256':hashlib.sha256(full.read_bytes()).hexdigest(),'thumbSHA256':hashlib.sha256(thumb.read_bytes()).hexdigest(),'bytes':full.stat().st_size+thumb.stat().st_size,'rgbaExact':True})
controls=[]
def control(atlas,frames,key,name):
 f=frames[key];r=f['frame'];assert not f['rotated'];x,y,w,h=(r[k]for k in ['x','y','w','h']);expected=atlas.crop((x,y,x+w,y+h)).convert('RGBA');dest=out/('native-emoticon-'+name+'.png');expected.save(dest)
 with Image.open(dest)as actual:assert actual.convert('RGBA').tobytes()==expected.tobytes()
 controls.append({'frame':key,'file':dest.name,'size':[w,h],'bytes':dest.stat().st_size,'rgbaExact':True,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
with Image.open(source.with_suffix('.png'))as atlas:
 for index,name in [(173,'category'),(175,'dneg-category'),(382,'greg-category')]:control(atlas,frames,'table_menu'+str(index).zfill(4),name)
chat=root/'init_lobby/desktop_assets';chatFrames=json.loads(chat.with_suffix('.json').read_text(encoding='utf-8-sig'))['frames']
with Image.open(chat.with_suffix('.png'))as atlas:
 for index,name in [(415,'open'),(416,'open-over'),(417,'open-selected'),(421,'send-disabled'),(422,'send'),(423,'send-over'),(424,'send-down')]:control(atlas,chatFrames,'table_popup'+str(index).zfill(4),name)
report={'method':'Native EmoticonItem uses StageAssets.getEmoticon(idx-1); EmoticonImage uses original idx.png; frame-only loader, no inconsistent trim metadata','atlas':{str(p):hashlib.sha256(p.read_bytes()).hexdigest()for p in[source.with_suffix('.json'),source.with_suffix('.png')]},'items':records,'controls':controls,'chatAtlas':{str(p):hashlib.sha256(p.read_bytes()).hexdigest()for p in[chat.with_suffix('.json'),chat.with_suffix('.png')]}};(out/'rea/native-emoticon-art.json').write_text(json.dumps(report,indent=2)+'\n');print('PASS84native full PNGs byteexact +84menu/history crops RGBAexact;'+str(sum(r['bytes']for r in records+controls))+'bytes')
