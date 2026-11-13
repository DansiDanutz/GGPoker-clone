"""Extract OptionViewToggleButton sprites from the installed desktop atlas."""
from pathlib import Path
import hashlib,json
from PIL import Image
source=Path('/Users/davidai/Library/Application Support/com.nsuslab.ncf.launcher.live.ggpcom/Game/assets/init_lobby')
out=Path(__file__).resolve().parent.parent/'home-art'
atlas=json.loads((source/'desktop_assets.json').read_text('utf-8-sig'))
image=Image.open(source/'desktop_assets.png').convert('RGBA')
report={'sources':{str(source/name):hashlib.sha256((source/name).read_bytes()).hexdigest()for name in ['desktop_assets.json','desktop_assets.png']},'sprites':{},'scale9':[9,9,2,2],'control':[241,24],'iconPosition':[12,6],'runtimeObserved':False}
for name,index,size in [('mark',345,12),('off',346,20),('on',347,20),('disabled',350,20)]:
 frame=atlas['frames'][f'lobby_option{index:04d}'];assert not frame['rotated'];r=frame['frame'];x,y,w,h=(r[k]for k in ['x','y','w','h']);assert w==h==size and min(x,y)>=0 and x+w<=image.width and y+h<=image.height
 crop=image.crop((x,y,x+w,y+h));target=out/f'native-language-toggle-{name}.png';crop.save(target)
 with Image.open(target)as check:assert check.convert('RGBA').tobytes()==crop.tobytes()
 report['sprites'][name]={'index':index,'rect':[x,y,w,h],'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
(out/'rea/language-toggle-art.json').write_text(json.dumps(report,indent=2))
print('PASS four native toggle sprites: exact atlas pixel roundtrip,12px mark,20px nine-slice backgrounds')
