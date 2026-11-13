"""Extract retained Rabbit art/audio from the installed client; no network or execution."""
import hashlib,json,runpy,struct,zlib,zipfile
from pathlib import Path
from PIL import Image
root=Path('/Users/davidai/Library/Application Support/com.nsuslab.ncf.launcher.live.ggpcom/Game');out=Path(__file__).resolve().parent.parent/'home-art';decoder=runpy.run_path(str(Path(__file__).with_name('extract-starling-atf.py')));decoder['self_test']();atlas=root/'assets/card/card.atf';archive=atlas.with_suffix('.zip');image=decoder['decode_atf'](atlas.read_bytes())
with zipfile.ZipFile(archive)as z:frames=json.loads(z.read('card.json').decode('utf-8-sig'))['frames']
report={'sources':{},'sprites':[],'sounds':[]}
for key,name,size in [('new_card0000','base',(122,162)),('card0041','icon',(77,138))]:
 f=frames[key];assert not f['rotated'];r=f['frame'];x,y,w,h=[r[k]for k in ['x','y','w','h']];assert (w,h)==size and min(x,y)>=0 and x+w<=image.width and y+h<=image.height;crop=image.crop((x,y,x+w,y+h)).convert('RGBA');dest=out/f'native-rabbit-{name}.png';crop.save(dest)
 with Image.open(dest)as check:assert check.convert('RGBA').tobytes()==crop.tobytes()
 report['sprites'].append({'frame':key,'size':size,'rgbaExact':True,'file':dest.name,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
 # Starling multiplies source RGB by the native tint; alpha is retained.
 if name=='base':
  for tint,label in [(0x172924,'cover'),(0xab9091,'fold')]:
   rgb=[(tint>>shift)&255 for shift in [16,8,0]];channels=crop.split();colored=Image.merge('RGBA',tuple(channels[i].point([round(v*rgb[i]/255)for v in range(256)])for i in range(3))+(channels[3],));target=out/f'native-rabbit-{label}.png';colored.save(target);assert colored.getchannel('A').tobytes()==crop.getchannel('A').tobytes();report['sprites'].append({'derivedFrom':key,'tint':hex(tint),'size':size,'alphaExact':True,'file':target.name,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
swf=root/'51/IronDesktop.swf';packed=swf.read_bytes();assert packed[:3]in[b'FWS',b'CWS'];raw=packed if packed[:3]==b'FWS'else b'FWS'+packed[3:8]+zlib.decompress(packed[8:]);assert len(raw)==struct.unpack_from('<I',raw,4)[0];pos=8+(5+4*(raw[8]>>3)+7)//8+4;symbols={};sounds={}
while pos<len(raw):
 code=struct.unpack_from('<H',raw,pos)[0];pos+=2;kind,size=code>>6,code&63
 if size==63:size=struct.unpack_from('<I',raw,pos)[0];pos+=4
 assert pos+size<=len(raw)
 if kind==14:sounds[struct.unpack_from('<H',raw,pos)[0]]=(pos,size)
 if kind==76:
  count=struct.unpack_from('<H',raw,pos)[0];p=pos+2
  for _ in range(count):
   ident=struct.unpack_from('<H',raw,p)[0];p+=2;end=raw.index(b'\0',p,pos+size);symbols[raw[p:end].decode('utf-8')]=ident;p=end+1
 pos+=size
 if kind==0:break
for name in ['RabbitCard','RabbitCardDouble']:
 ident=symbols['Sound'+name];start,size=sounds[ident];flags=raw[start+2];assert flags>>4==2 and (flags>>2)&3==3;samples=struct.unpack_from('<I',raw,start+3)[0];seek=struct.unpack_from('<h',raw,start+7)[0];mp3=raw[start+9:start+size];assert samples>0 and mp3[0]==255 and mp3[1]&224==224;target=out/(name+'.mp3');target.write_bytes(mp3);report['sounds'].append({'symbol':'Sound'+name,'id':ident,'file':target.name,'samples':samples,'rate':44100,'seekSamples':seek,'bytes':len(mp3),'sha256':hashlib.sha256(mp3).hexdigest()})
for p in [atlas,archive,swf]:report['sources'][str(p)]=hashlib.sha256(p.read_bytes()).hexdigest()
(out/'rea/rabbit-art.json').write_text(json.dumps(report,indent=2));print(json.dumps({'result':'PASS','sprites':report['sprites'],'sounds':report['sounds']}))
