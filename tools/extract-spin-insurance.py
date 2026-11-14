"""Extract exact private desktop insurance glyphs; preserve existing outputs."""
import hashlib,io,json,sys
from pathlib import Path
from PIL import Image
root,out=map(Path,sys.argv[1:]);atlas=root/'after_lobby/desktop_table_assets.png';metadata=atlas.with_suffix('.json')
assert out.is_dir() and (out/'rea').is_dir()
frames=json.loads(metadata.read_text(encoding='utf-8-sig'))['frames'];records=[]
def save(path,data):
 assert not path.exists()or path.read_bytes()==data,'Preserve differing output: '+str(path)
 path.write_bytes(data);assert path.read_bytes()==data
with Image.open(atlas)as image:
 for index,name in [(138,'text-ko'),(139,'highlight-ko'),(140,'text-en'),(141,'highlight-en'),(142,'text-zh'),(143,'highlight-zh'),(144,'plus'),(145,'coin')]:
  key=f'player_cell{index:04}';f=frames[key];assert f['rotated'] is False
  r=f['frame'];x,y,w,h=(r[k]for k in ['x','y','w','h']);assert all(type(v)is int for v in [x,y,w,h])and min(x,y)>=0 and min(w,h)>0 and x+w<=image.width and y+h<=image.height
  expected=image.crop((x,y,x+w,y+h)).convert('RGBA');buffer=io.BytesIO();expected.save(buffer,format='PNG');data=buffer.getvalue();dest=out/('native-spin-insurance-'+name+'.png');save(dest,data)
  with Image.open(dest)as actual:assert actual.convert('RGBA').tobytes()==expected.tobytes() and actual.size==(w,h)
  records.append({'file':dest.name,'frame':key,'size':[w,h],'rgbaExact':True,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
report={'method':'StageAssets desktop frame-only loader, no synthetic trim padding','sources':{str(p):hashlib.sha256(p.read_bytes()).hexdigest()for p in [atlas,metadata]},'files':records}
save(out/'rea/spin-insurance-art.json',(json.dumps(report,indent=2)+'\n').encode())
print('PASS8 exact desktop insurance glyphs,RGBA readback,preserved outputs;',sum(r['bytes']for r in records),'asset bytes')
