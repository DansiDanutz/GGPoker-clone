import assert from 'node:assert/strict';import {deflateSync} from 'node:zlib';import {avatarImage} from './avatar-image.mjs';
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0});
function chunk(type,data){const b=Buffer.alloc(data.length+12);b.writeUInt32BE(data.length);b.write(type,4);data.copy(b,8);let crc=0xffffffff;for(const byte of b.subarray(4,b.length-4))crc=crcTable[(crc^byte)&255]^(crc>>>8);b.writeUInt32BE((crc^0xffffffff)>>>0,b.length-4);return b}
const header=Buffer.alloc(13);header.writeUInt32BE(256);header.writeUInt32BE(256,4);header[8]=8;header[9]=6;
export const png=Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',deflateSync(Buffer.alloc(256*1025))),chunk('IEND',Buffer.alloc(0))]);export const image='data:image/png;base64,'+png.toString('base64');
assert.equal(avatarImage(image).png,png.toString('base64'));assert.match(avatarImage(image).hash,/^[a-f0-9]{64}$/);
const damaged=Buffer.from(png);damaged[20]^=1;
for(const value of [null,7,'data:image/svg+xml;base64,PHN2Zz4=',image+' ',image.slice(0,-4),'data:image/png;base64,'+damaged.toString('base64'),'data:image/png;base64,'+Buffer.concat([png,Buffer.from('x')]).toString('base64')])assert.throws(()=>avatarImage(value),e=>e.status===400);
const pack=(h,pixels)=>'data:image/png;base64,'+Buffer.concat([png.subarray(0,8),chunk('IHDR',h),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]).toString('base64');
const wrongSize=Buffer.from(header);wrongSize.writeUInt32BE(255);assert.throws(()=>avatarImage(pack(wrongSize,Buffer.alloc(256*1025))),e=>e.status===400);const badFilter=Buffer.alloc(256*1025);badFilter[0]=5;assert.throws(()=>avatarImage(pack(header,badFilter)),e=>e.status===400);assert.throws(()=>avatarImage(pack(header,Buffer.alloc(256*1025+1))),e=>e.status===400);
const metadata=Buffer.concat([png.subarray(0,33),chunk('eXIf',Buffer.from('private metadata is removed')),png.subarray(33)]);assert.deepEqual(avatarImage('data:image/png;base64,'+metadata.toString('base64')),avatarImage(image));
console.log('PASS avatar PNG validation: dimensions, checksum, compressed scanline bounds, type, truncation, base64 and trailing-data guards');
