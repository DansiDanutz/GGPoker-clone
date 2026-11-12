"""Extract native desktop GlobalButton/WindowCloseButton sprites, not Starling ATF."""
from pathlib import Path
import json,hashlib
from PIL import Image
source=Path('/Users/davidai/Library/Application Support/com.nsuslab.ncf.launcher.live.ggpcom/Game/assets/init_lobby')
out=Path(__file__).resolve().parent.parent/'home-art'
atlas=json.loads((source/'desktop_assets.json').read_text('utf-8-sig'))
image=Image.open(source/'desktop_assets.png').convert('RGBA')
frames={'shadow':20,'green-up':21,'green-down':23,'gray-up':27,'gray-down':29,'close-up':6,'close-over':7,'close-down':8}
report={'source':'StageAssets desktop common atlas, distinct from Starling Assets.current','sourceHashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [source/'desktop_assets.json',source/'desktop_assets.png']},'sprites':{}}
for name,index in frames.items():
 key=f'common{index:04d}';frame=atlas['frames'][key];assert not frame['rotated'];r=frame['frame'];x,y,w,h=(r[k] for k in ['x','y','w','h']);assert min(x,y)>=0 and x+w<=image.width and y+h<=image.height
 crop=image.crop((x,y,x+w,y+h));target=out/f'native-note-button-{name}.png';crop.save(target)
 with Image.open(target) as decoded:assert decoded.convert('RGBA').tobytes()==crop.tobytes()
 report['sprites'][name]={'key':key,'rect':[x,y,w,h],'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
# Native disabled ColorMatrix averages channels equally, unlike CSS grayscale.
with Image.open(out/'native-note-button-gray-up.png') as original:
 disabled=original.convert('RGBA');disabled.putdata([(round((r+g+b)/3),)*3+(a,) for r,g,b,a in disabled.get_flattened_data()])
 target=out/'native-note-button-gray-disabled.png';disabled.save(target)
 with Image.open(target) as decoded:
  assert all(r==g==b for r,g,b,a in decoded.convert('RGBA').get_flattened_data())
  assert decoded.getchannel('A').tobytes()==original.getchannel('A').tobytes()
 report['disabled']={'source':'gray-up','matrix':'equal RGB average; alpha unchanged','sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
with Image.open(out/'native-note-button-shadow.png') as shadow:
 assert all(r==g==b for r,g,b,a in shadow.convert('RGBA').get_flattened_data()),'Disabled shadow also needs equal-average tint'
classes=Path('/Users/davidai/Sandbox/rea-tools/player-source/scripts')
names=['com/nsus/iron/components/display/button/GlobalButton.as','com/nsus/iron/components/display/button/ButtonColor.as','com/nsus/iron/components/display/button/LabelButton.as','com/nsus/iron/components/display/window/WindowCloseButton.as','com/nsus/iron/table/view/popup/PopupBase.as']
report['classHashes']={name:hashlib.sha256((classes/name).read_bytes()).hexdigest() for name in names if (classes/name).exists()}
report['limits']=['Full native popup border and injected small logo not recovered','Equal-average disabled tint uses rounded8-bit output; native GPU rounding unverified','Native foreground comparison/AA unverified; no window activated']
hud={}
for name,key in [('swatch','lobby_popup0362'),('label','lobby_popup0366'),('no-history','lobby_popup0368')]:
 r=atlas['frames'][key]['frame'];crop=image.crop((r['x'],r['y'],r['x']+r['w'],r['y']+r['h']));target=out/f'native-hud-{name}.png';crop.save(target)
 with Image.open(target) as decoded:assert decoded.convert('RGBA').tobytes()==crop.tobytes()
 hud[name]={'key':key,'rect':r,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
with Image.open(out/'native-hud-swatch.png') as sourceSwatch:
 sourceSwatch=sourceSwatch.convert('RGBA');assert sourceSwatch.size==(24,20)
 assert all((r,g,b)==(255,255,255) for r,g,b,a in sourceSwatch.get_flattened_data() if a),'CSS tint assumes white source RGB'
 selected=Image.new('RGBA',(24,24));selected.paste(sourceSwatch.crop((0,0,24,10)),(0,0));selected.paste(sourceSwatch.crop((0,10,24,11)).resize((24,5),Image.Resampling.NEAREST),(0,10));selected.paste(sourceSwatch.crop((0,11,24,20)),(0,15))
 assert selected.crop((0,0,24,10)).tobytes()==sourceSwatch.crop((0,0,24,10)).tobytes()
 assert selected.crop((0,15,24,24)).tobytes()==sourceSwatch.crop((0,11,24,20)).tobytes()
 target=out/'native-hud-swatch-selected.png';selected.save(target);hud['swatchSelected']={'method':'24x20 to24x24 native centered1x1 slice9; fixed10top/9bottom','sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
with Image.open(out/'native-hud-label.png') as small:
 small=small.convert('RGBA');assert small.size==(14,14);assert all((r,g,b)==(255,255,255) for r,g,b,a in small.get_flattened_data() if a)
 expanded=Image.new('RGBA',(88,25));sx=[0,7,8,14];tx=[0,7,82,88];ty=[0,7,19,25]
 for y in range(3):
  for x in range(3):expanded.paste(small.crop((sx[x],sx[y],sx[x+1],sx[y+1])).resize((tx[x+1]-tx[x],ty[y+1]-ty[y]),Image.Resampling.NEAREST),(tx[x],ty[y]))
 assert expanded.crop((0,0,7,7)).tobytes()==small.crop((0,0,7,7)).tobytes();assert expanded.crop((82,19,88,25)).tobytes()==small.crop((8,8,14,14)).tobytes()
 target=out/'native-hud-label-expanded.png';expanded.save(target);hud['labelExpanded']={'method':'14x14 to88x25 centered1x1 slice9,7top/left,6bottom/right','sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
report['hudSprites']=hud
miniSource=source.parent/'after_lobby';miniAtlas=json.loads((miniSource/'table_card.json').read_text('utf-8-sig'))['frames'];miniImage=Image.open(miniSource/'table_card.png').convert('RGBA');mini={}
for style,offset in [('default',0),('classic',60)]:
 sheet=Image.new('RGBA',(46*13,66*4));tiles=[]
 for suit in range(4):
  for rank in range(13):
   f=miniAtlas[f'desktop_table_smallcard{offset+suit*13+rank:04d}'];assert not f['rotated'];r=f['frame'];assert (r['w'],r['h'])==(46,66);tile=miniImage.crop((r['x'],r['y'],r['x']+46,r['y']+66));sheet.paste(tile,(rank*46,suit*66));tiles.append(tile)
 assert len({tile.tobytes() for tile in tiles})==52
 target=out/f'native-hud-mini-{style}.png';sheet.save(target)
 with Image.open(target) as decoded:
  for i,tile in enumerate(tiles):assert decoded.crop((i%13*46,i//13*66,i%13*46+46,i//13*66+66)).tobytes()==tile.tobytes()
 mini[style]={'offset':offset,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'bytes':target.stat().st_size}
f=miniAtlas['desktop_table_smallcard0118'];assert not f['rotated'];r=f['frame'];assert (r['w'],r['h'])==(49,66);back=miniImage.crop((r['x'],r['y'],r['x']+49,r['y']+66));target=out/'native-hud-mini-back.png';back.save(target)
with Image.open(target) as decoded:assert decoded.convert('RGBA').tobytes()==back.tobytes()
report['miniCards']={'cell':[46,66],'rankOrder':'23456789TJQKA','suitOrder':'cdhs','sourceHashes':{name:hashlib.sha256((miniSource/name).read_bytes()).hexdigest() for name in ['table_card.json','table_card.png']},'sheets':mini}
tableSource=source.parent/'after_lobby';tableAtlas=json.loads((tableSource/'desktop_table_assets.json').read_text('utf-8-sig'))['frames'];tableImage=Image.open(tableSource/'desktop_table_assets.png').convert('RGBA')
for name,index in [('up',103),('face',106)]+[(f'suit-{suit}',107+i) for i,suit in enumerate('cdhs')]+[(f'rank-{rank}',111+i) for i,rank in enumerate('23456789TJQKA')]:
 f=tableAtlas[f'table{index:04d}'];assert not f['rotated'];r=f['frame'];crop=tableImage.crop((r['x'],r['y'],r['x']+r['w'],r['y']+r['h']));target=out/f'native-show-{name}.png';crop.save(target)
 with Image.open(target) as decoded:assert decoded.convert('RGBA').tobytes()==crop.tobytes()
f=atlas['frames']['lobby_option0378'];assert not f['rotated'];r=f['frame'];crop=image.crop((r['x'],r['y'],r['x']+r['w'],r['y']+r['h']));target=out/'native-sound-preview.png';crop.save(target)
with Image.open(target) as decoded:assert decoded.convert('RGBA').tobytes()==crop.tobytes()
report['soundPreview']={'key':'lobby_option0378','size':[r['w'],r['h']],'nativeScale':.5,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
(out/'rea/native-note-button-art.json').write_text(json.dumps(report,indent=2)+'\n')
print('PASS8 original desktop note-button sprites: PNG pixels equal atlas crops')
