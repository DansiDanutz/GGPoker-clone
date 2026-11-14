"""Deduplicate native SVG definitions without changing frame geometry; keep raw exports private."""
import hashlib,json,sys,xml.etree.ElementTree as ET
from pathlib import Path
source,out=map(Path,sys.argv[1:]);ns='http://www.w3.org/2000/svg';link='http://www.w3.org/1999/xlink'
ET.register_namespace('',ns);ET.register_namespace('xlink',link);ET.register_namespace('ffdec','https://www.free-decompiler.com/flash')
definitions=[];lookup={};frames=[];records=[]
for index in range(1,271):
 p=source/(str(index)+'.svg');raw=p.read_bytes();root=ET.fromstring(raw);assert root.tag=='{'+ns+'}svg' and root.get('width')=='203.5px' and root.get('height')=='203.5px'
 assert len(root)==2 and root[0].tag=='{'+ns+'}g' and root[1].tag=='{'+ns+'}defs'
 assert root[0].get('transform')=='matrix(1.0, 0.0, 0.0, 1.0, 101.75, 101.8)'
 for e in root.iter():
  assert e.tag.rsplit('}',1)[-1]not in ['script','foreignObject','iframe','audio','video']
  for key,value in e.attrib.items():
   assert not key.rsplit('}',1)[-1].lower().startswith('on') and 'javascript:'not in value.lower() and '://'not in value
   if key.rsplit('}',1)[-1]=='href':assert value.startswith('#')or value.lower().startswith('data:image/png;base64,')
 refs=[]
 for child in root[1]:
  text=ET.tostring(child,encoding='unicode')
  if text not in lookup:lookup[text]=len(definitions);definitions.append(text)
  refs.append(lookup[text])
 body=ET.tostring(root[0],encoding='unicode');assert [definitions[i]for i in refs]==[ET.tostring(c,encoding='unicode')for c in root[1]]
 frames.append({'body':body,'defs':refs});records.append({'frame':index,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
pack={'version':1,'fps':30,'width':203.5,'height':203.5,'origin':[101.75,101.8],'definitions':definitions,'frames':frames};data=(json.dumps(pack,separators=(',',':'))+'\n').encode()
assert not out.exists()or out.read_bytes()==data,'Preserve differing existing packed asset';out.write_bytes(data);assert json.loads(out.read_bytes())==pack
receipt={'method':'270 native Insurance_Glow SVG frames; exact canonical body and definition strings, deduplicated only','source':str(source),'frames':records,'packedBytes':len(data),'rawBytes':sum(r['bytes']for r in records),'uniqueDefinitions':len(definitions),'sha256':hashlib.sha256(data).hexdigest()};report=out.parent/'rea/spin-insurance-glow-pack.json';report.write_text(json.dumps(receipt,indent=2)+'\n');print('PASS270 source SVG frames,native Insurance_Glow,exact geometry/deduplicated definitions;',receipt['rawBytes'],'→',len(data),'bytes;',len(definitions),'definitions')
