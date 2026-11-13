"""Retain source language catalog and exact key-present/English fallback dictionaries locally."""
import hashlib,json,re,sys
from pathlib import Path
assets,source,out=map(Path,sys.argv[1:]);table=assets/'languages/string_table.json';definition=source/'com/nsus/iron/helper/Language.as';raw=definition.read_text();strings=json.loads(table.read_text(encoding='utf-8-sig'))
definitions=dict(re.findall(r'public static const ([A-Z_]+):Language = new Language\("([a-z-]+)"',raw));supported=re.search(r'return \[(EN,ID,[A-Z_,]+)\];',raw);assert supported,'Native supported-language order missing'
codes=[definitions[name]for name in supported[1].split(',')];assert len(codes)==len(set(codes)) and 'en'in codes and 'ro'in codes
languages=[]
for code in codes:
 assert re.fullmatch('[a-z]{2}(?:-[a-z]{2})?',code);catalog={};fallback=0
 for key,row in strings.items():
  value=row[code]if code in row else row.get('en');fallback+=code not in row
  if isinstance(value,str):catalog[key]=value
  else:assert value is None,(key,code,type(value))
 dest=out/f'native-language-{code}.json';text=json.dumps({'code':code,'strings':catalog},ensure_ascii=False,separators=(',',':'));dest.write_text(text)
 check=json.loads(dest.read_text());assert check['strings']==catalog and all(check['strings'][key]==(row[code]if code in row else row.get('en'))for key,row in strings.items()if isinstance(row.get(code,row.get('en')),str))
 labelKey='MobileLang_'+('zh-cn_single_line'if code=='zh-cn'else code);label=strings.get(labelKey,{}).get(code,strings.get(labelKey,{}).get('en',code));languages.append({'code':code,'label':label,'keys':len(catalog),'englishFallbacks':fallback,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
manifest={'evidence':'Language.as supported order; brand-specific languageSupport not observed','sources':{str(p):hashlib.sha256(p.read_bytes()).hexdigest()for p in [table,definition]},'languages':languages};(out/'native-language-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));assert json.loads((out/'native-language-ro.json').read_text())['strings']['ButtonReJoin']=='Dă-mi cărți';print('PASS '+str(len(codes))+' native language catalogs: exact native key-presence fallback, Romanian, Unicode and JSON roundtrip; '+str(sum((out/f'native-language-{code}.json').stat().st_size for code in codes))+' bytes')
