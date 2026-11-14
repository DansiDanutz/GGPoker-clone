import {spinWheelPrizeEffect} from './spin-wheel-prize-effect.mjs';
import {spinWheelAmount} from './spin-wheel-amount.mjs';
const dimensions={base:[360,360],stone:[387,387],arrow:[66,90],symbol:[148,148],fontImage:[245,261],effect:[150,173]};
export async function loadSpinWheelArt(){
 const names=['native-spin-wheel-0.png','native-spin-wheel-2.png','native-spin-wheel-3.png','native-spin-wheel-4.png','native-spin-wheel-font.png','native-spin-wheel-7.png','native-spin-wheel-font.json'];
 const results=await Promise.allSettled(names.map(async name=>{const r=await fetch('/home-art/'+name,{signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('Native wheel asset unavailable: '+name);return name.endsWith('.json')?r.json():createImageBitmap(await r.blob())}));
 const close=()=>{for(const r of results)if(r.status==='fulfilled')r.value?.close?.()};
 const failed=results.find(r=>r.status==='rejected');if(failed){close();throw failed.reason}
 const art=Object.fromEntries([...Object.keys(dimensions),'font'].map((key,i)=>[key,results[i].value]));
 try{for(const [key,[w,h]]of Object.entries(dimensions))if(art[key].width!==w||art[key].height!==h)throw Error('Native wheel image dimensions changed');spinWheelAmount(art.font,'1')}catch(error){close();throw error}return art;
}
export function drawSpinWheel(ctx,art,labels,pose){
 if(!Array.isArray(labels)||labels.length!==8||!Number.isFinite(pose?.wheel)||!Number.isFinite(pose?.arrow)||pose.wheelAlpha!==undefined&&(!Number.isFinite(pose.wheelAlpha)||pose.wheelAlpha<0||pose.wheelAlpha>1)||pose.wheelOffsetY!==undefined&&!Number.isFinite(pose.wheelOffsetY))throw Error('Provide eight explicit wheel labels and a valid pose');
 const effect=pose.highlight?spinWheelPrizeEffect(pose.targetIndex,pose.prizeElapsed):null;
 const amounts=labels.map(label=>spinWheelAmount(art.font,label));for(const [key,[w,h]]of Object.entries(dimensions))if(art[key]?.width!==w||art[key]?.height!==h)throw Error('Native wheel image dimensions changed');
 ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.save();
 try{
  ctx.globalAlpha*=pose.wheelAlpha??1;ctx.translate(ctx.canvas.width/2-404,176+(pose.wheelOffsetY??0));ctx.scale(2.1,2.1);ctx.save();ctx.translate(193.5,193.5);ctx.rotate(pose.wheel*Math.PI/180);ctx.drawImage(art.base,-180,-180);
  ctx.save();ctx.scale(.5,.5);
  for(const [slot,tokens]of amounts.entries()){
   ctx.save();ctx.rotate((45*slot-67.5)*Math.PI/180);ctx.translate(300,0);ctx.rotate(Math.PI/2);ctx.scale(32/56,32/56);
   for(const token of tokens){ctx.save();ctx.translate(token.x,token.y);ctx.scale(token.scale,token.scale);for(const g of token.glyphs)ctx.drawImage(art.fontImage,g.sourceX,g.sourceY,g.width,g.height,g.x,g.y,g.width,g.height);ctx.restore()}ctx.restore();
  }
  ctx.restore();if(effect){ctx.save();ctx.rotate(effect.rotation*Math.PI/180);ctx.translate(0,-85);ctx.scale(effect.scale,effect.scale);ctx.globalAlpha*=effect.alpha;ctx.drawImage(art.effect,-76,-86.5);ctx.restore()}ctx.restore();ctx.drawImage(art.symbol,156.5,156.5,74,74);ctx.drawImage(art.stone,0,0);ctx.translate(193.5,13.5);ctx.rotate(pose.arrow*Math.PI/180);ctx.drawImage(art.arrow,-16.5,-14,33,45);
 }finally{ctx.restore()}
}
