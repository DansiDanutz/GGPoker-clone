from PIL import Image
from pathlib import Path
import struct,zipfile,json,io
p=Path.home()/'Library/Application Support/com.nsuslab.ncf.launcher.live.ggpcom/Game/assets/card'
raw=(p/'card.atf').read_bytes()
h=b'DDS '+struct.pack('<31I',124,0x81007,1024,2048,2097152,0,0,*([0]*11),32,4,int.from_bytes(b'DXT5','little'),0,0,0,0,0,4096,0,0,0,0)
atlas=Image.open(io.BytesIO(h+raw[20:20+2097152])).convert('RGBA')
frames=json.loads(zipfile.ZipFile(p/'card.zip').read('card.json'))['frames']
def frame(index):
 key=f'card{index:04d}'
 f=frames[key]['frame'];x,y,w,h=[f[k] for k in ['x','y','w','h']];return atlas.crop((x,y,x+w,y+h))
# Build the reference deck locally; no client artwork is committed.
dest=Path(__file__).resolve().parents[1]/'home-art'
out=Image.new('RGBA',(124*13,174*4))
for row,suit in enumerate([2,3,4,5]):
 for col in range(13):
  base=frame(0);card=base.crop(base.getbbox()).resize((124,174),Image.Resampling.LANCZOS)
  color='#be191e' if row in (1,2) else '#141414'
  for symbol,pos,box in [(6+col,(13,11),(49,45)),(suit,(13,59),(25,25)),(suit,(46,83),(70,66))]:
   mask=frame(symbol).getchannel('A')
   scale=min(box[0]/mask.width,box[1]/mask.height)
   mask=mask.resize((round(mask.width*scale),round(mask.height*scale)),Image.Resampling.LANCZOS)
   card.paste(Image.new('RGBA',mask.size,color),pos,mask)
  out.alpha_composite(card,(124*col,174*row))
out.save(dest/'local-card-faces.png')
frame(64).save(dest/'local-card-back.png')
