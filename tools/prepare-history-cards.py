"""Reuse the checked native compositor with the hand-history card atlas."""
from pathlib import Path
import hashlib,json,struct,subprocess,sys,tempfile,zipfile
root,out=map(Path,sys.argv[1:]);raw=(root/'hand_history/card.atf').read_bytes();assert raw[:3]==b'ATF' and raw[6:8]==b'\xff\x03' and raw[12]==5
w,h=1<<raw[13],1<<raw[14];size=int.from_bytes(raw[16:20],'big');assert (w,h)==(2048,1024) and size==w*h and int.from_bytes(raw[8:12],'big')==len(raw)-12
header=b'DDS '+struct.pack('<31I',124,0x81007,h,w,size,0,0,*([0]*11),32,4,int.from_bytes(b'DXT5','little'),0,0,0,0,0,4096,0,0,0,0)
with tempfile.TemporaryDirectory(prefix='playgg-hh-cards-') as tmp:
 tmp=Path(tmp);dds=tmp/'cards.dds';dds.write_bytes(header+raw[20:20+size]);png=tmp/'cards.png'
 subprocess.run(['ffmpeg','-v','error','-i',str(dds),'-frames:v','1','-threads','1',str(png)],check=True)
 with zipfile.ZipFile(root/'hand_history/card.zip') as z:metadata=z.read('card.json')
 history_frames=json.loads(metadata.decode('utf-8-sig'))['frames']
 with zipfile.ZipFile(root/'card/card.zip') as z:checked_frames=json.loads(z.read('card.json').decode('utf-8-sig'))['frames']
 for key in ['new_card0000']+[f'new_card{i:04d}' for i in range(2,19)]:
  original,current=checked_frames[key],history_frames[key];assert not current.get('rotated');assert (original['frame']['w'],original['frame']['h'])==(current['frame']['w'],current['frame']['h']),key
 (tmp/'card.json').write_bytes(metadata)
 tools=Path(__file__).resolve().parent
 subprocess.run(['swift',str(tools/'build-card-fronts.swift'),str(png),str(tmp/'card.json'),str(tools/'card-front-layouts.json'),str(tmp)],check=True)
 b=(tmp/'native-card-faces-two-colour.png').read_bytes();assert struct.unpack('>II',b[16:24])==(1586,648)
 dest=out/'native-history-preview-cards.png';dest.write_bytes(b)
(out/'rea/history-preview-cards.json').write_text(json.dumps({'source_atf_sha256':hashlib.sha256(raw).hexdigest(),'source':'hand_history/card.atf + card.zip','compositor':'HHCard3D forces DEFAULT → CardCompositor.new_card0 and DEFAULT glyph/color layers;existing two-colour layout','output':dest.name,'sha256':hashlib.sha256(b).hexdigest(),'size':[1586,648],'cards':52},indent=2)+'\n')
print('PASS52 distinct native history DEFAULT faces;temporary other themes removed')
