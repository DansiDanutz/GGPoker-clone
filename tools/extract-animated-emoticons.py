"""Pack FFDec timeline renders losslessly, retaining each sprite's original origin."""
import csv,hashlib,json,math,re,sys,xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image

assets,exports,out,module=map(Path,sys.argv[1:]);catalog={};records=[]
for family,base,count in [('dneg',1000,30),('greg',4000,45)]:
 source=assets/'after_lobby'/(family+'_emoticon.swf');folder=exports/family
 symbols={name:int(index)for index,name in csv.reader((folder/'symbols.csv').open(),delimiter=';')}
 for index in [*range(1,28),30]:
  identifier=base+index;symbol=family+'_'+str(identifier+99);character=symbols[symbol];name='DefineSprite_'+str(character)+'_'+symbol
  png=folder/'rendered'/name/'frames.png';svg=folder/'bounds'/name/'1.svg';root=ET.parse(svg).getroot();group=next(iter(root));matrix=list(map(float,re.findall(r'-?\d+(?:\.\d+)?',group.attrib['transform'])))
  assert matrix[:4]==[1,0,0,1];x,y=-matrix[4],-matrix[5]
  with Image.open(png)as image:
   w,h=image.size;assert image.n_frames==count;assert abs(w-float(root.attrib['width'][:-2]))<1 and abs(h-float(root.attrib['height'][:-2]))<1
   sheet=Image.new('RGBA',(w*10,h*math.ceil(count/10)));hashes=[];canvasHashes=[]
   for frame in range(count):
    image.seek(frame);rgba=image.convert('RGBA');hashes.append(hashlib.sha256(rgba.tobytes()).hexdigest());alpha=rgba.getchannel('A');opaque=Image.composite(rgba,Image.new('RGBA',rgba.size),alpha.point(lambda a:255 if a==255 else 0));opaque.putalpha(alpha);canvasHashes.append(hashlib.sha256(opaque.tobytes()).hexdigest());sheet.paste(rgba,((frame%10)*w,(frame//10)*h))
  dest=out/('native-emoticon-animation-'+str(identifier)+'.webp');sheet.save(dest,lossless=True,exact=True,method=6)
  with Image.open(dest)as decoded:assert decoded.convert('RGBA').tobytes()==sheet.tobytes(),identifier
  catalog[identifier]={'file':'/home-art/'+dest.name,'width':w,'height':h,'x':x,'y':y,'frames':count,'columns':10}
  records.append({'id':identifier,'symbol':symbol,'character':character,'source':str(source),'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'render':str(png),'renderSHA256':hashlib.sha256(png.read_bytes()).hexdigest(),'bounds':str(svg),'frameRGBA256':hashes,'canvasOpaqueRGBA256':canvasHashes,'sheet':dest.name,'sheetSHA256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'rgbaExact':True})
assert len(catalog)==56 and sum(item['frames']for item in catalog.values())==2100
module.write_text('// FFDec-rendered source timelines; origins are retained, physical AIR rendering remains unverified.\nexport const animationArt='+json.dumps(catalog,separators=(',',':'))+';\n')
(out/'rea/native-animated-emoticons.json').write_text(json.dumps({'method':'Static FFDec sprite renders, lossless packed RGBA; not native AIR execution','items':records,'runtime':catalog},indent=2)+'\n')
print('PASS56source timelines/2100frames:every decoded RGBA pixel retained;'+str(sum(item['bytes']for item in records))+'sheet bytes')
