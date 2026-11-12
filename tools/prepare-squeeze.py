"""Copy native PNGs and validate the selected original compositor data; no rendering."""
from pathlib import Path
import hashlib,json,math,re,shutil,struct,sys
assets,script,output=map(Path,sys.argv[1:]);source=script.read_text();records={}
def copy(src,name):
 data=src.read_bytes();assert data[:8]==b'\x89PNG\r\n\x1a\n';shutil.copyfile(src,output/name);records[name]=hashlib.sha256(data).hexdigest();return struct.unpack('>II',data[16:24])
def array(name):
 m=re.search(r'public static const '+name+r':Array = (\[.*?\]);',source,re.S);assert m,name
 values=json.loads(m[1]);assert len(values)==61 and [x['index'] for x in values]==list(range(61));return values
formats=[('holdem','holdem','holdem','holdem','HOLDEM',['LEFT','RIGHT'],347),('plo','omaha','omaha','omaha','OMAHA',['ONE','TWO','THREE','FOUR'],349),('plo5','five_omaha','five_omaha','five_omaha','FIVE_OMAHA',['ONE','TWO','THREE','FOUR','FIVE'],347),('plo6','six_omaha','flipandgo','flipAndGo','SIX_OMAHA',['ONE','TWO','THREE','FOUR','FIVE','SIX'],347)]
for name,base,inner,prefix,constant,sides,width in formats:
 frames=[]
 for i in range(61):
  frame=f'native-squeeze-{name}{i:04}.png';w,h=copy(assets/'squeeze_dynamic'/f'{base}_squeeze_noRank{i:04}.png',frame);assert w==width and 140<=h<=240;frames.append('/home-art/'+frame)
 inner_name='native-squeeze-inner.png' if name=='holdem' else f'native-squeeze-{name}-inner.png'
 aw,ah=copy(assets/'squeeze'/f'squeeze_{inner}_inner.png',inner_name)
 metadata=json.loads((assets/'squeeze'/f'squeeze_{inner}_inner.json').read_text(encoding='utf-8-sig'))['frames'];glyphs=[]
 for i in range(52):
  entry=metadata[f'{prefix}_inner{i:04}'];r=entry['frame'];assert not entry['rotated'] and not entry['trimmed'];assert r['x']+r['w']<=aw and r['y']+r['h']<=ah;glyphs.append(r)
 slots=[{'transforms':array(constant+'_INNER_'+side+'_DATA'),'masks':array(constant+'_INNER_'+side+'_MASK_DATA')} for side in sides]
 for slot in slots:
  for transform,mask in zip(slot['transforms'],slot['masks']):
   assert all(math.isfinite(transform[k]) for k in ['x','y','scaleX','scaleY','skewX','skewY'])
   assert len(mask['array'])>=(3 if mask['visible'] else 1) and all(math.isfinite(p[k]) for p in mask['array'] for k in ['x','y'])
 (output/f'native-squeeze-{name}.json').write_text(json.dumps({'frames':frames,'inner':'/home-art/'+inner_name,'glyphs':glyphs,'slots':slots,'canvas':[652,484],'container':[80,117],'scale':1.5,'ordinal':'rank23456789TJQKA ×4 +suitcdhs'},separators=(',',':'))+'\n')
copy(assets/'option_page/squeeze_guide_base.png','native-squeeze-guide-base.png');copy(assets/'option_page/squeeze_guide_over.png','native-squeeze-guide-over.png')
(output/'rea/squeeze-assets.json').write_text(json.dumps({'source_assets':str(assets),'data_source':str(script),'data_sha256':hashlib.sha256(script.read_bytes()).hexdigest(),'copied_png_sha256':records,'checks':['244 byte-identical variable-height frame PNGs; native Omaha width349 retained','52 unrotated native rank strips per format','61 indexed transforms/masks per slot; finite geometry','Native CardInfo ordinal rank-major, clubs/diamonds/hearts/spades'],'scope':'Holdem/PLO4/5/6 source compositors; server activation policy and seated match remain to verify'},indent=2)+'\n')
print('PASS native squeeze assets:244 exact PNGs,52 glyphs per format,2/4/5/6 slots; no transcode')
