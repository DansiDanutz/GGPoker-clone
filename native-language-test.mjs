import assert from 'node:assert/strict';import {languageCode,languageText,languageCatalog,languageNotice,languageSlice,languageFitSize,languageFitHeight} from './native-language.mjs';
const codes=['en','ro'];for(const raw of [null,undefined,'','RO','ro-RO','../ro','__proto__',{},['ro']])assert.equal(languageCode(raw,codes),'en');assert.equal(languageCode('ro',codes),'ro');const strings=languageCatalog({code:'ro',strings:{ButtonReJoin:'Dă-mi cărți',blank:'',markup:'<b>Text</b>'}},'ro');assert.equal(languageText(strings,'ButtonReJoin'),'Dă-mi cărți');assert.equal(languageText(strings,'blank'),'');assert.equal(languageText(strings,'missing'),'missing');assert.equal(languageText(strings,'toString'),'toString');assert.equal(languageText(strings,'markup'),'<b>Text</b>');for(const value of [null,[],{code:'en',strings:{}},{code:'ro',strings:[]},{code:'ro',strings:{bad:1}}])assert.throws(()=>languageCatalog(value,'ro'),/Invalid language catalog/);console.log('PASS native language foundation: exact supported codes, English preference fallback, Unicode, empty-string preservation, own-key lookup, text-only values and catalog validation');

if(process.argv.includes('--native')){const {readFileSync}=await import('node:fs'),{createHash}=await import('node:crypto'),sha=data=>createHash('sha256').update(data).digest('hex'),manifest=JSON.parse(readFileSync(new URL('./home-art/native-language-manifest.json',import.meta.url)));assert.equal(manifest.languages.length,28);for(const [path,expected]of Object.entries(manifest.sources))assert.equal(sha(readFileSync(path)),expected,'Native source identity');const codes=manifest.languages.map(l=>l.code);assert.equal(new Set(codes).size,codes.length);for(const {code,keys,sha256}of manifest.languages){assert.equal(languageCode(code,codes),code);assert.equal(sha(readFileSync(new URL('./home-art/native-language-'+code+'.json',import.meta.url))),sha256);const strings=languageCatalog(JSON.parse(readFileSync(new URL('./home-art/native-language-'+code+'.json',import.meta.url))),code);assert.equal(Object.keys(strings).length,keys);const lines=languageNotice(strings,'RushStageEndType22',[2]);if(code==='pl')assert.equal(lines,null,'Literal native cutoff must not misrepresent a custom event');else{assert.equal(lines.length,2);assert.ok(lines[1].includes('2'));assert.ok(!lines.join('').includes('<font'))}}const ro=languageCatalog(JSON.parse(readFileSync(new URL('./home-art/native-language-ro.json',import.meta.url))),'ro');assert.equal(languageText(ro,'ButtonReJoin'),'Dă-mi cărți');console.log('PASS28 extracted native language catalogs: schema/counts,exact codes and Romanian lookup; brand-enabled language list remains unverified')}

assert.equal(languageText({S:'{0} to {1}, again {0}'},'S',['A','5']),'A to 5, again A');assert.equal(languageText({S:'{0} / {9}'},'S',['$&']),'$& / {9}');assert.equal(languageText({S:'{0}'},'S',[]),'{0}');console.log('PASS native indexed template values: repeated positions, literal replacement values and missing-position preservation');

const notice="<font color='#999999' size='32'>Etapa Rush s-a încheiat</font>\n <font color='#FFFFFF' size='28'>Primii {0} jucători.</font>";
assert.deepEqual(languageNotice({N:notice},'N',[2]),['Etapa Rush s-a încheiat','Primii 2 jucători.']);
for(const text of [undefined,'plain','<img src=x>','<font>x</font><font><script>bad</script></font>',"<font>x</font><font>Top 8</font>",notice+'<script>x</script>'])assert.equal(languageNotice({N:text},'N',[2]),null);
assert.equal(languageNotice({N:notice},'N',['<img>']),null);
console.log('PASS structured notice text: two source font blocks, actual indexed value, malformed/markup/literal-cutoff rejection without HTML execution');

assert.equal(languageNotice({N:notice},'N',{}),null);assert.equal(languageNotice({N:notice},'N',[null]),null);

// LabelModel.slice checks full width including four TextField gutter pixels, then appends two literal dots.
const measure=text=>text.length*6+4;
assert.equal(languageSlice('Players',46,measure),'Players');
assert.equal(languageSlice('Players',45,measure),'Play..');
assert.equal(languageSlice('Players',16,measure),'..');
assert.equal(languageSlice('',4,measure),'');
assert.equal(languageSlice('Ab😀C',28,measure),'Ab..','Native slicing uses UTF-16 substr positions');
assert.equal(languageSlice('Players',0,measure),'Players','Native zero width disables autoSlice');
assert.equal(languageSlice('<b>Players</b>',28,measure),'<b..','Treat labels as literal text');
console.log('PASS native single-line slicing: exact fit, four-pixel gutter, two dots, empty, zero-width, UTF-16 and text-only values');

const advance=(text,size)=>text.length*size/2;assert.equal(languageFitSize('123456',50,16,advance),15);assert.equal(languageFitSize('12',50,16,advance),16);assert.equal(languageFitSize('123456',1,16,advance),5);assert.equal(languageFitSize('123456',0,16,advance),16);assert.equal(languageFitSize('',20,16,advance),16);console.log('PASS native single-line autoScale: four-pixel gutter, integer decrement, five-pixel floor, short-text reset and hidden/empty labels');

assert.equal(languageFitHeight(14,32,n=>n*3),10);assert.equal(languageFitHeight(14,32,n=>n*2),14);assert.equal(languageFitHeight(14,1,n=>n*3),5);assert.equal(languageFitHeight(14,0,n=>n*3),14);assert.equal(languageFitHeight(14,32,n=>n>=12?40:30),11);console.log('PASS local multiline height fit:whole-pixel decrement,short-text reset,five-pixel floor,hidden-size bypass and wrap discontinuity');
