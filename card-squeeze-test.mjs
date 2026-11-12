import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {openRooms} from './rooms.mjs';
import {cardOrdinal,squeezeWheelFrame,squeezeDragFrame,drawSqueeze,createSqueezeMotion} from './card-squeeze.mjs';
assert.equal(cardOrdinal('2c'),0);assert.equal(cardOrdinal('2s'),3);assert.equal(cardOrdinal('As'),51);
assert.deepEqual([... '23456789TJQKA'].flatMap(r=>[...'cdhs'].map(s=>cardOrdinal(r+s))),Array.from({length:52},(_,i)=>i));
for(const card of ['1c','10h','as','2x',null])assert.throws(()=>cardOrdinal(card));
assert.deepEqual([squeezeWheelFrame(0,1),squeezeWheelFrame(0,-1),squeezeWheelFrame(57,1),squeezeWheelFrame(60,0)],[6,0,60,60]);
assert.equal(squeezeDragFrame(0,0,-200),52);assert.equal(squeezeDragFrame(46,0,-1),46);assert.equal(squeezeDragFrame(0,0,-400),60);
assert.equal(squeezeDragFrame(0,0,0),1,'Native active drag starts at frame1');
const saved={raf:globalThis.requestAnimationFrame,cancel:globalThis.cancelAnimationFrame,performance:globalThis.performance};let time=0,id=0,callbacks=new Map();
globalThis.requestAnimationFrame=f=>{callbacks.set(++id,f);return id};globalThis.cancelAnimationFrame=id=>callbacks.delete(id);globalThis.performance={now:()=>time};
const advance=ms=>{time+=ms;const pending=[...callbacks.values()];callbacks.clear();for(const f of pending)f(time)};
try{
 let completed=0,painted=-1;let motion=createSqueezeMotion(f=>painted=f,()=>completed++);
 motion.wheel(1);motion.wheel(1);advance(100);assert.equal(motion.frame,12,'Rapid wheel events accumulate their target');motion.dispose();motion=createSqueezeMotion(f=>painted=f,()=>completed++);
 motion.wheel(1);advance(50);assert.equal(painted,3);advance(50);assert.equal(motion.frame,6);motion.release();advance(200);assert.equal(motion.frame,0);assert.equal(completed,0);
 motion.drag(0,-100);motion.release(true);advance(200);assert.equal(motion.frame,15,'Mouse-up inside retains the native15-frame peek');motion.release(false);advance(200);assert.equal(motion.frame,0,'Leaving the squeeze area closes a partial peek');
 let anchored=false;motion.press(()=>anchored=true);advance(99);assert.equal(anchored,false);advance(1);assert.equal(anchored,true);assert.equal(motion.frame,15,'Press prepares frame15 before establishing drag origin');
 motion.release(false);advance(200);anchored=false;motion.press(()=>anchored=true);motion.release(false);advance(200);assert.equal(anchored,false,'Release before press animation finishes cancels its drag origin');
 motion.hover();advance(100);assert.equal(motion.frame,15);motion.drag(0,-200);assert.equal(motion.frame,52);motion.drag(0,-1);assert.equal(motion.frame,52,'Drag must not close a partially revealed card');motion.release();advance(80);assert.equal(completed,1);assert.equal(motion.closed,true);motion.open();advance(1000);assert.equal(completed,1);
 motion=createSqueezeMotion(()=>{},()=>completed++);motion.open();advance(600);assert.equal(motion.frame,60);assert.equal(completed,1,'Open retains the final frame for 500ms');advance(499);assert.equal(completed,1);advance(1);assert.equal(completed,2);
 motion=createSqueezeMotion(()=>{},()=>completed++);motion.open();motion.dispose();advance(2000);assert.equal(completed,2,'Unmount must cancel stale completion');assert.equal(callbacks.size,0);
}finally{globalThis.requestAnimationFrame=saved.raf;globalThis.cancelAnimationFrame=saved.cancel;globalThis.performance=saved.performance}
const data=JSON.parse(readFileSync('home-art/native-squeeze-holdem.json'));const calls=[];const ctx=new Proxy({}, {get:(_,key)=>(...args)=>calls.push([key,...args])});const images={frames:Array.from({length:61},(_,frame)=>({frame})),inner:{atlas:true}};
for(let frame=0;frame<=60;frame++){calls.length=0;drawSqueeze(ctx,data,images,['2c','As'],frame);assert.deepEqual(calls.find(c=>c[0]==='translate'),['translate',80,117]);assert.equal(calls.filter(c=>c[0]==='drawImage').length,1+data.slots.filter(s=>s.transforms[frame].visible).length)}
calls.length=0;drawSqueeze(ctx,data,images,['2c','As'],60);assert.ok(calls.some(c=>c[0]==='drawImage'&&c[1].atlas&&c[2]===data.glyphs[51].x&&c[3]===data.glyphs[51].y));
for(const frame of [-1,61,1.5])assert.throws(()=>drawSqueeze(ctx,data,images,['2c','As'],frame));assert.throws(()=>drawSqueeze(ctx,data,images,['2c','2c'],0));
for(const [format,count]of [['plo',4],['plo5',5],['plo6',6]]){const native=JSON.parse(readFileSync('home-art/native-squeeze-'+format+'.json')),cards=['2c','As','Kh','Qd','Jh','Ts'].slice(0,count);assert.equal(native.slots.length,count);for(let frame=0;frame<=60;frame++){calls.length=0;drawSqueeze(ctx,native,images,cards,frame);assert.equal(calls.filter(c=>c[0]==='drawImage').length,1+native.slots.filter(s=>s.transforms[frame].visible).length)}assert.throws(()=>drawSqueeze(ctx,native,images,cards.slice(1),60),'Reject wrong hole-card count')}
console.log('PASS native squeeze:52 ordinals, Mac wheel, cubic monotonic drag, all61 compositor frames, actual glyph slots and invalid inputs');

const dir=mkdtempSync(join(tmpdir(),'card-squeeze-'));try{const room=openRooms(join(dir,'rooms.json')),id='e'.repeat(48),table={name:'Squeeze',stack:120,blind:4,open:true,cardSqueeze:true};const a=room(id,'join',null,{name:'A'},table),b=room(id,'join',null,{name:'B'},table);let s=room(id,'state',a.issued,{},table);s=room(id,'start',a.issued,{version:s.version},table);assert.equal(s.hand.squeezeActivated,true,'Host flag must reach hand activation');assert.equal(s.settings.cardSqueeze,true);assert.deepEqual(s.hand.cards.map(Boolean),[true,false,false,false,false,false]);assert.equal(room(id,'watch',null,{},table).hand.cards.every(c=>c===null),true)}finally{rmSync(dir,{recursive:true,force:true})}

for(const [mode,count]of [['plo',4],['plo5',5],['plo6',6]]){const dir=mkdtempSync(join(tmpdir(),'squeeze-'+mode+'-'));try{const room=openRooms(join(dir,'rooms.json')),id='f'.repeat(48),table={name:'Squeeze '+mode,mode,stack:120,blind:4,open:true,cardSqueeze:true};const a=room(id,'join',null,{name:'A'},table);room(id,'join',null,{name:'B'},table);let s=room(id,'state',a.issued,{},table);s=room(id,'start',a.issued,{version:s.version},table);assert.equal(s.hand.squeezeActivated,true);assert.equal(s.hand.cards[s.me].length,count);assert.equal(s.hand.cards.filter(Boolean).length,1);assert.ok(room(id,'watch',null,{},table).hand.cards.every(c=>c===null))}finally{rmSync(dir,{recursive:true,force:true})}}
console.log('PASS Omaha squeeze: all183 native compositor frames,4/5/6 slots, count validation, owner activation and private views');

{const dir=mkdtempSync(join(tmpdir(),'squeeze-plo-event-'));try{const room=openRooms(join(dir,'rooms.json')),id='d'.repeat(48),table={name:'Squeeze PLO event',mode:'tournament',variant:'plo',stack:100,blind:4,open:true,cardSqueeze:true};let token;for(let i=0;i<4;i++){const s=room(id,'join',null,{name:'Event'+i},table);if(i===0)token=s.issued}const s=room(id,'state',token,{},table);assert.equal(s.hand.squeezeActivated,true);assert.equal(s.hand.cards[s.me].length,4);assert.equal(s.hand.cards.filter(Boolean).length,1);assert.equal(s.hand.stacks.reduce((a,b)=>a+b,0)+s.hand.committed.reduce((a,b)=>a+b,0),400);assert.deepEqual(openRooms(join(dir,'rooms.json'))(id,'state',token,{},table).hand,s.hand)}finally{rmSync(dir,{recursive:true,force:true})}}
console.log('PASS PLO tournament squeeze: four registrations, four private cards,400 chips and persisted hand');
