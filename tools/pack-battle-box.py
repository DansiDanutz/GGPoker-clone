"""Preserve all native bounty SVG frames while deduplicating their definitions."""
import base64,hashlib,json,re,sys,xml.etree.ElementTree as ET
from pathlib import Path
source,swf,out=map(Path,sys.argv[1:]);ns='http://www.w3.org/2000/svg'
ET.register_namespace('',ns);ET.register_namespace('xlink','http://www.w3.org/1999/xlink');ET.register_namespace('ffdec','https://www.free-decompiler.com/flash')
definitions=[];lookup={};frames=[];records=[]
for index in range(1,286):
 p=source/(str(index)+'.svg');raw=p.read_bytes();root=ET.fromstring(raw)
 assert root.tag=='{'+ns+'}svg' and root.get('width')=='1330.5px' and root.get('height')=='1318.95px'
 assert len(root)==2 and root[0].tag=='{'+ns+'}g' and root[1].tag=='{'+ns+'}defs'
 assert root[0].get('transform')=='matrix(1.0, 0.0, 0.0, 1.0, 669.35, 1051.85)'
 for name in ['first','normal','normal_light','normal_fireworks']:assert len([e for e in root.iter()if e.get('id')==name])==1
 for e in root.iter():
  assert e.tag.rsplit('}',1)[-1] not in ['script','foreignObject','iframe','audio','video']
  for key,value in e.attrib.items():
   assert not key.rsplit('}',1)[-1].lower().startswith('on') and 'javascript:'not in value.lower() and '://'not in value
   if key.rsplit('}',1)[-1]=='href':assert value.startswith('#')or value.lower().startswith('data:image/png;base64,')
 refs=[]
 for child in root[1]:
  text=ET.tostring(child,encoding='unicode')
  if text not in lookup:lookup[text]=len(definitions);definitions.append(text)
  refs.append(lookup[text])
 assert [definitions[i]for i in refs]==[ET.tostring(c,encoding='unicode')for c in root[1]]
 frames.append({'body':ET.tostring(root[0],encoding='unicode'),'defs':refs});records.append({'frame':index,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
bitmaps=[];bitmap_ids={};pattern=re.compile(r'data:image/png;base64,[A-Za-z0-9+/=]+',re.I)
def intern(text):
 assert '__BATTLE_BITMAP_' not in text
 def replace(match):
  value=match.group()
  if value not in bitmap_ids:bitmap_ids[value]=len(bitmaps);bitmaps.append(value)
  return '__BATTLE_BITMAP_'+str(bitmap_ids[value])+'__'
 return pattern.sub(replace,text)
def expand(text):return re.sub(r'__BATTLE_BITMAP_(\d+)__',lambda m:bitmaps[int(m[1])],text)
packed_definitions=[intern(d)for d in definitions]
assert [expand(d)for d in packed_definitions]==definitions
for f in frames:
 original=f['body'];f['body']=intern(original);assert expand(f['body'])==original
for bitmap in bitmaps:
 assert base64.b64decode(bitmap.split(',',1)[1],validate=True).startswith(b'\x89PNG\r\n\x1a\n')
pack={'version':1,'frameMs':33,'width':1330.5,'height':1318.95,'origin':[669.35,1051.85],'bitmaps':bitmaps,'definitions':packed_definitions,'frames':frames};data=(json.dumps(pack,separators=(',',':'))+'\n').encode()
if out.exists():assert out.read_bytes()==data,'Preserve differing existing packed asset'
else:out.write_bytes(data)
assert json.loads(out.read_bytes())==pack
receipt={'method':'285 native sprite83 SVG frames; exact canonical body/definition strings and PNG data URLs, deduplicated only; frameMs from MovieClipBase caller','swf':str(swf),'swfSha256':hashlib.sha256(swf.read_bytes()).hexdigest(),'source':str(source),'frames':records,'packedBytes':len(data),'rawBytes':sum(r['bytes']for r in records),'uniqueDefinitions':len(definitions),'uniqueBitmaps':len(bitmaps),'bitmapEncodingValidated':True,'sha256':hashlib.sha256(data).hexdigest()}
(out.parent/'rea/battle-box-pack.json').write_text(json.dumps(receipt,indent=2)+'\n')
print('PASS285 native frames, original named layers/geometry, deduplicated definitions;',receipt['rawBytes'],'→',len(data),'bytes;',len(definitions),'definitions')
