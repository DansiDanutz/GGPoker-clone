"""Extract selected original history textures with installed ffmpeg; no Pillow needed."""
from pathlib import Path
import hashlib,json,struct,subprocess,sys,tempfile,zipfile
root,out=map(Path,sys.argv[1:]);source=root/'hand_history/hh_assets.atf';raw=source.read_bytes()
assert raw[:3]==b'ATF' and raw[6:8]==b'\xff\x02' and raw[12]==5
assert int.from_bytes(raw[8:12],'big')==len(raw)-12
w,h=1<<raw[13],1<<raw[14];assert (w,h)==(2048,1024)
length=int.from_bytes(raw[16:20],'big');assert length==w*h and len(raw)>=20+length
header=b'DDS '+struct.pack('<31I',124,0x81007,h,w,length,0,0,*([0]*11),32,4,int.from_bytes(b'DXT5','little'),0,0,0,0,0,4096,0,0,0,0)
with zipfile.ZipFile(root/'hand_history/hh_assets.zip') as z:frames=json.loads(z.read('hh_assets.json').decode('utf-8-sig'))['frames']
records=[]
def run(args):return subprocess.run(['ffmpeg','-v','error',*args],check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
with tempfile.TemporaryDirectory(prefix='playgg-hh-atlas-') as tmp:
 dds=Path(tmp)/'hh.dds';dds.write_bytes(header+raw[20:20+length])
 for index,name in [(35,'dealer'),(31,'avatar-frame'),(32,'plate'),(226,'note-border'),(276,'win'),(2,'action-header-blinds'),(311,'action-header-street'),(3,'action-divider'),(210,'action-arrow'),(212,'action-arrow-shadow'),(4,'action-avatar-bg'),(6,'action-avatar-frame'),('slice0210','action-bubble'),('slice0211','action-bubble-shadow'),('slice0191','action-role-tag'),('slice0192','action-anonymous-avatar'),('slice0190','action-summary-bg')]:
  key=f'hand_history{index:04d}' if isinstance(index,int) else index;meta=frames[key];assert not meta.get('rotated');r=meta['frame'];x,y,cw,ch=[r[k]for k in ['x','y','w','h']];assert 0<=x<x+cw<=w and 0<=y<y+ch<=h
  dest=out/('native-history-preview-'+name+'.png');crop=f'crop={cw}:{ch}:{x}:{y}'
  run(['-y','-i',str(dds),'-vf',crop,'-frames:v','1','-pix_fmt','rgba','-threads','1',str(dest)])
  expected=run(['-i',str(dds),'-vf',crop,'-frames:v','1','-pix_fmt','rgba','-threads','1','-f','rawvideo','pipe:1'])
  actual=run(['-i',str(dest),'-frames:v','1','-pix_fmt','rgba','-threads','1','-f','rawvideo','pipe:1'])
  assert expected==actual and len(actual)==cw*ch*4
  records.append({'key':key,'frame':r,'file':dest.name,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()});print('PASS native history crop',key,cw,ch,'RGBA unchanged',flush=True)
  colors=[0xfed158] if name in ['action-bubble','action-arrow'] else [0,6122294,3364411,4008221,2511447,2897745,7362322,2039583,7741472] if name in ['action-role-tag','action-anonymous-avatar'] else []
  for color in colors:
   tinted=bytearray(expected);rgb=[color>>16&255,color>>8&255,color&255]
   for pixel in range(0,len(tinted),4):
    for channel in range(3):tinted[pixel+channel]=(tinted[pixel+channel]*rgb[channel]+127)//255
    if name=='action-anonymous-avatar':tinted[pixel+3]=(tinted[pixel+3]+1)//2
   rawfile=Path(tmp)/'tinted.rgba';rawfile.write_bytes(tinted);target=out/f'native-history-preview-{name}-{color:06x}.png'
   run(['-y','-f','rawvideo','-pixel_format','rgba','-video_size',f'{cw}x{ch}','-i',str(rawfile),'-frames:v','1','-threads','1',str(target)])
   check=run(['-i',str(target),'-frames:v','1','-pix_fmt','rgba','-threads','1','-f','rawvideo','pipe:1']);assert check==tinted
   records.append({'key':key,'tint':f'{color:06x}','alpha':.5 if name=='action-anonymous-avatar' else 1,'file':target.name,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
   print('PASS native multiplicative tint',name,f'{color:06x}','RGBA checked',flush=True)

backgrounds={}
for variant,index in [('holdem',0),('shortdeck',44),('plo',1),('plo5',116),('plo6',142),('rush-holdem',33),('rush-plo',54),('aof',2)]:
 background=root/f'hand_history_tables/HHTable_{index}.png';b=background.read_bytes();assert b[:8]==b'\x89PNG\r\n\x1a\n' and struct.unpack('>II',b[16:24])==(640,460)
 dest=out/f'native-history-preview-{variant}.png';dest.write_bytes(b);assert dest.read_bytes()==b
 backgrounds[variant]={'source':str(background),'sha256':hashlib.sha256(b).hexdigest(),'size':[640,460]}
(out/'rea/history-preview-assets.json').write_text(json.dumps({'atlas_sha256':hashlib.sha256(raw).hexdigest(),'sprites':records,'background':backgrounds['holdem'],'backgrounds':backgrounds,'preparationOnly':True},indent=2)+'\n')
print('PASS original640x460 Holdem/ShortDeck/Omaha4/5/6 backgrounds;asset preparation only')
