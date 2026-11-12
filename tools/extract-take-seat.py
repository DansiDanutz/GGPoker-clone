"""Original PlayerTakeSeat3D textures; decode with existing ffmpeg only."""
from pathlib import Path
import hashlib,json,struct,subprocess,sys,tempfile,zipfile
root,out=map(Path,sys.argv[1:]);raw=(root/'table_assets_1.atf').read_bytes()
assert raw[:3]==b'ATF' and raw[6:8]==b'\xff\x02' and raw[12]==5
assert int.from_bytes(raw[8:12],'big')==len(raw)-12
w,h=1<<raw[13],1<<raw[14];length=int.from_bytes(raw[16:20],'big');assert length==w*h
header=b'DDS '+struct.pack('<31I',124,0x81007,h,w,length,0,0,*([0]*11),32,4,int.from_bytes(b'DXT5','little'),0,0,0,0,0,4096,0,0,0,0)
with zipfile.ZipFile(root/'table_assets_1.zip') as z:frames=json.loads(z.read('table_assets_1.json').decode('utf-8-sig'))['frames']
records=[]
def run(args):return subprocess.run(['ffmpeg','-v','error',*args],check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
with tempfile.TemporaryDirectory(prefix='take-seat-')as tmp:
 dds=Path(tmp)/'atlas.dds';dds.write_bytes(header+raw[20:20+length])
 for index,name in [(0,'base'),(3,'glow'),(21,'arrow')]:
  key=f'player_cell{index:04d}';meta=frames[key];assert not meta['rotated'];r=meta['frame'];x,y,cw,ch=[r[k]for k in ['x','y','w','h']];crop=f'crop={cw}:{ch}:{x}:{y}';dest=out/f'native-take-seat-{name}.png'
  run(['-y','-i',str(dds),'-vf',crop,'-frames:v','1','-pix_fmt','rgba','-threads','1',str(dest)])
  expected=run(['-i',str(dds),'-vf',crop,'-frames:v','1','-pix_fmt','rgba','-threads','1','-f','rawvideo','pipe:1'])
  actual=run(['-i',str(dest),'-frames:v','1','-pix_fmt','rgba','-threads','1','-f','rawvideo','pipe:1']);assert expected==actual
  records.append({'key':key,'frame':r,'file':dest.name,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
(out/'rea/take-seat-art.json').write_text(json.dumps({'atlas_sha256':hashlib.sha256(raw).hexdigest(),'sprites':records},indent=2))
print('PASS three native Take Seat crops, decoded RGBA identical')
