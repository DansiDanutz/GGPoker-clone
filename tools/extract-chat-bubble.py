"""Extract the two desktop ChatBox textures using the installed frame-only loader rule."""
import json,hashlib,sys
from pathlib import Path
from PIL import Image
root,out=map(Path,sys.argv[1:]);source=root/'after_lobby/desktop_table_assets';frames=json.loads(source.with_suffix('.json').read_text(encoding='utf-8-sig'))['frames'];records=[]
with Image.open(source.with_suffix('.png'))as atlas:
 for index,name in [(23,'box'),(24,'shadow')]:
  key='player_cell'+str(index).zfill(4);f=frames[key];r=f['frame'];assert not f['rotated'];x,y,w,h=(r[k]for k in ['x','y','w','h']);assert(w,h)==(178,100);expected=atlas.crop((x,y,x+w,y+h)).convert('RGBA');dest=out/('native-chat-'+name+'.png');expected.save(dest)
  with Image.open(dest)as actual:assert actual.convert('RGBA').tobytes()==expected.tobytes()
  records.append({'frame':key,'file':dest.name,'size':[w,h],'slice':[89,50,1,1],'rgbaExact':True,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
report={'method':'ChatBox StageAssets desktop bitmap frame; applySlice9Grid DisplayObject1x1; inconsistent trim metadata ignored by installed loader','sources':{str(p):hashlib.sha256(p.read_bytes()).hexdigest()for p in[source.with_suffix('.json'),source.with_suffix('.png')]},'sprites':records};(out/'rea/chat-bubble-art.json').write_text(json.dumps(report,indent=2)+'\n');print('PASS2nativeChatBox sprites: exact decoded RGBA;'+str(sum(r['bytes']for r in records))+'PNGbytes')
