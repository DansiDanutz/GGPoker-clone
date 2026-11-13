"""Extract source-bound ChatSetting/ChatMuteCell sprites with exact RGBA checks."""
from pathlib import Path
from PIL import Image
import json,hashlib,sys
assets,out=map(Path,sys.argv[1:]);source=assets/'init_lobby/desktop_assets';frames=json.loads(source.with_suffix('.json').read_text(encoding='utf-8-sig'))['frames'];records=[]
with Image.open(source.with_suffix('.png'))as atlas:
 for index,name in [(418,'more'),(419,'more-over'),(420,'more-selected'),(443,'helmet-on'),(444,'helmet-off'),(342,'arrow'),(343,'arrow-over')]:
  key=f'table_popup{index:04}';frame=frames[key];assert not frame['rotated'];x,y,w,h=(frame['frame'][k]for k in ['x','y','w','h']);expected=atlas.crop((x,y,x+w,y+h)).convert('RGBA');dest=out/('native-chat-option-'+name+'.png');expected.save(dest)
  with Image.open(dest)as actual:assert actual.convert('RGBA').tobytes()==expected.tobytes()
  records.append({'frame':key,'file':dest.name,'size':[w,h],'rgbaExact':True,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
(out/'rea/chat-options-art.json').write_text(json.dumps({'method':'Frame-only installed atlas loader;ChatSetting/ChatMuteCell source','sources':{str(p):hashlib.sha256(p.read_bytes()).hexdigest()for p in [source.with_suffix('.json'),source.with_suffix('.png')]},'sprites':records},indent=2)+'\n')
print('PASS7native chat-option crops:exact decoded RGBA;'+str(sum(r['bytes']for r in records))+'bytes;'+str([r['size']for r in records]))
