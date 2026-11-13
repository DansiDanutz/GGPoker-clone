"""Compose source NewDealMeInButton at full progress for local unlimited sit-out."""
import hashlib,json,sys
from pathlib import Path
from PIL import Image,ImageChops
root,out=map(Path,sys.argv[1:]);atlas=root/'after_lobby/desktop_table_assets';frames=json.loads(atlas.with_suffix('.json').read_text(encoding='utf-8-sig'))['frames'];image=Image.open(atlas.with_suffix('.png')).convert('RGBA')
def crop(i):
 f=frames[f'table_menu{i:04}'];assert not f['rotated'];r=f['frame'];x,y,w,h=(r[k]for k in ['x','y','w','h']);assert min(w,h)>0 and x+w<=image.width and y+h<=image.height;return image.crop((x,y,x+w,y+h))
a={i:crop(i)for i in range(127,134)};assert a[127].size==(270,90) and a[130].size==(20,80) and a[131].size==(260,80)
records=[]
for name,base,gauge,hover in [('up',127,128,False),('over',127,128,True),('down',132,133,False)]:
 result=a[base].copy();layer=Image.new('RGBA',result.size);layer.paste(a[gauge].crop((5,1,265,81)),(5,1));result.alpha_composite(layer)
 if hover:result.alpha_composite(a[129])
 light=Image.new('RGBA',result.size);light.alpha_composite(a[130],(245,0));mask=Image.new('L',result.size);mask.paste(a[131].getchannel('A'),(5,1));light.putalpha(ImageChops.multiply(light.getchannel('A'),mask));result.alpha_composite(light)
 dest=out/f'native-deal-me-in-{name}.png';result.save(dest)
 with Image.open(dest)as saved:assert saved.convert('RGBA').tobytes()==result.tobytes()
 records.append({'file':dest.name,'size':list(result.size),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
(out/'rea/deal-me-in-art.json').write_text(json.dumps({'source':'NewDealMeInButton:table_menu127..133; gauge progress1 (no local expiry)','sprites':records,'sources':{p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in [atlas.with_suffix('.json'),atlas.with_suffix('.png')]}},indent=2));print('PASS3 Deal Me In states: source layers, rectangle/alpha masks, full progress and PNG roundtrip')
