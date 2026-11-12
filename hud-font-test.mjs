import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const [file,identity]of [['native-history-roboto.ttf','Roboto'],['native-history-roboto-italic.ttf','Roboto Italic'],['native-hud-roboto-bold.ttf','Roboto Bold'],['native-show-roboto-condensed-bold.ttf','Roboto Condensed Bold']]){
const font=readFileSync(new URL('./home-art/'+file,import.meta.url));
assert.equal(font.readUInt32BE(0),0x00010000);
const tables=new Map(Array.from({length:font.readUInt16BE(4)},(_,i)=>{const p=12+i*16;return [font.toString('ascii',p,p+4),{offset:font.readUInt32BE(p+8),size:font.readUInt32BE(p+12)}]}));
for(const name of ['head','hhea','maxp','cmap','glyf','loca','name']){const t=tables.get(name);assert.ok(t&&t.offset+t.size<=font.length,'Missing/bad font table '+name)}
assert.ok(font.readUInt16BE(tables.get('maxp').offset+4)>10,'HUD font needs digit glyphs');
const t=tables.get('name'),count=font.readUInt16BE(t.offset+2),base=t.offset+font.readUInt16BE(t.offset+4),names=[];
for(let i=0;i<count;i++){const p=t.offset+6+i*12,platform=font.readUInt16BE(p),n=font.readUInt16BE(p+8),start=base+font.readUInt16BE(p+10),bytes=font.subarray(start,start+n);names.push(platform===3?Buffer.from(bytes).swap16().toString('utf16le'):bytes.toString('latin1'))}
assert.ok(names.some(n=>n.includes(identity)),'Wrong source font');
const cmap=tables.get('cmap').offset;for(let i=0;i<font.readUInt16BE(cmap+2);i++){const p=cmap+font.readUInt32BE(cmap+8+i*8);if(font.readUInt16BE(p)!==4)continue;const n=font.readUInt16BE(p+6)/2;let last=-1;for(let j=0;j<n;j++){const end=font.readUInt16BE(p+14+2*j);assert.ok(end>last,'cmap end ranges must strictly increase');last=end}}
console.log('PASS native source font: TrueType bounds,glyph count,Unicode ranges and '+identity+' identity');
}
