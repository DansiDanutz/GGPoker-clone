import assert from 'node:assert/strict';
globalThis.Image=class{};
globalThis.addEventListener=()=>{};globalThis.document={querySelector:()=>null};globalThis.localStorage={getItem:()=>null};
const {holeCardLayout}=await import('./felt.mjs');
for(const count of [2,4,5,6]){
 const p=holeCardLayout(count),radius=count>=5?250:400,step=(count>=5?17:10)/(count/2),width=122*1.1*(count>2?.84:1),height=162*1.1*(count>2?.84:1);
 assert.equal(p.cards.length,count);assert.equal(p.lift,count===2?60.5:33);assert.equal(p.foldLift,count===2?38.5:11);
 for(const [i,c]of p.cards.entries()){
  const angle=step*(i-(count-1)/2),a=angle*Math.PI/180;
  assert.ok(Math.abs(c.x+width/2-1.1*radius*Math.sin(a))<1e-9);assert.ok(Math.abs(c.y+height/2-(30+1.1*radius*(1-Math.cos(a))+(count===2?27.5:0)))<1e-9);assert.equal(c.angle,angle);assert.equal(c.width,width);assert.equal(c.height,height);assert.ok(Math.abs(c.focusX-30*width/122*Math.sin(a))<1e-9);assert.ok(Math.abs(c.focusY+30*width/122*Math.cos(a))<1e-9);
 }
 assert.ok(Math.abs(p.cards[0].x+p.cards.at(-1).x+width)<1e-9);
}
for(const count of [0,1,3,7,2.5,'2',null])assert.throws(()=>holeCardLayout(count));
console.log('PASS native2/4/5/6 fan geometry, scale, symmetric rotation, open/fold elevation, native focus pivot and invalid counts');
