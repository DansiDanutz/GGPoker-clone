import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
// JPEXS includes U+FFFF in a real range as well as the mandatory format4 sentinel.
const [source,destination]=process.argv.slice(2);assert.ok(source&&destination,'Provide exported source.ttf and destination.ttf');
const b=readFileSync(source);assert.equal(b.readUInt32BE(0),0x00010000);
const tables=new Map(Array.from({length:b.readUInt16BE(4)},(_,i)=>{const p=12+i*16;return [b.toString('ascii',p,p+4),{record:p,offset:b.readUInt32BE(p+8),length:b.readUInt32BE(p+12)}]}));
const cmap=tables.get('cmap'),head=tables.get('head');assert.ok(cmap&&head);
let repaired=0;for(let i=0;i<b.readUInt16BE(cmap.offset+2);i++){
 const p=cmap.offset+b.readUInt32BE(cmap.offset+8+i*8);if(b.readUInt16BE(p)!==4)continue;
 const n=b.readUInt16BE(p+6)/2;assert.ok(n>=2);const end=p+14+2*(n-2),lastStart=p+16+2*n+2*(n-1);
 assert.equal(b.readUInt16BE(end+2),65535);assert.equal(b.readUInt16BE(lastStart),65535);
 if(b.readUInt16BE(end)===65535){assert.ok(b.readUInt16BE(p+16+2*n+2*(n-2))<65535);b.writeUInt16BE(65534,end);repaired++}
}
assert.equal(repaired,1,'Expected one JPEXS duplicate sentinel range');
const sum=(start,length)=>{let total=0;for(let p=start;p<start+length;p+=4){let word=0;for(let i=0;i<4;i++)word=word*256+(p+i<start+length?b[p+i]:0);total=(total+word)>>>0}return total};
b.writeUInt32BE(0,head.offset+8);for(const t of tables.values())b.writeUInt32BE(sum(t.offset,t.length),t.record+4);
b.writeUInt32BE((0xb1b0afba-sum(0,b.length))>>>0,head.offset+8);assert.equal(sum(0,b.length),0xb1b0afba);
writeFileSync(destination,b);console.log('Prepared source HUD font: removed overlapping U+FFFF range and rebuilt SFNT checksums');
