import {spinWheelFrameLight} from './spin-wheel-light.mjs';
import {spinWheelGlow} from './spin-wheel-glow.mjs';
import {spinWheelPrizeEffect} from './spin-wheel-prize-effect.mjs';
import {spinWheelAmount} from './spin-wheel-amount.mjs';
const dimensions={base:[360,360],stone:[387,387],arrow:[66,90],symbol:[148,148],fontImage:[245,261],effect:[150,173],glow:[134,134],glitter:[150,150],light:[130,113],frameMask:[122,159],ringMask:[181,180]};
export async function loadSpinWheelArt(){
 const names=['native-spin-wheel-0.png','native-spin-wheel-2.png','native-spin-wheel-3.png','native-spin-wheel-4.png','native-spin-wheel-font.png','native-spin-wheel-7.png','native-spin-wheel-9.png','native-spin-wheel-10.png','native-spin-wheel-5.png','native-spin-wheel-6.png','native-spin-wheel-1.png','native-spin-wheel-font.json'];
 const results=await Promise.allSettled(names.map(async name=>{const r=await fetch('/home-art/'+name,{signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('Native wheel asset unavailable: '+name);return name.endsWith('.json')?r.json():createImageBitmap(await r.blob())}));
 const close=()=>{for(const r of results)if(r.status==='fulfilled')r.value?.close?.()};
 const failed=results.find(r=>r.status==='rejected');if(failed){close();throw failed.reason}
 const art=Object.fromEntries([...Object.keys(dimensions),'font'].map((key,i)=>[key,results[i].value]));
 try{for(const [key,[w,h]]of Object.entries(dimensions))if(art[key].width!==w||art[key].height!==h)throw Error('Native wheel image dimensions changed');spinWheelAmount(art.font,'1')}catch(error){close();throw error}return art;
}
export function drawSpinWheel(ctx,art,labels,pose){
 if(!Array.isArray(labels)||labels.length!==8||!Number.isFinite(pose?.wheel)||!Number.isFinite(pose?.arrow)||pose.wheelAlpha!==undefined&&(!Number.isFinite(pose.wheelAlpha)||pose.wheelAlpha<0||pose.wheelAlpha>1)||pose.wheelOffsetY!==undefined&&!Number.isFinite(pose.wheelOffsetY))throw Error('Provide eight explicit wheel labels and a valid pose');
 const glow=pose.glow?spinWheelGlow(pose.prizeElapsed,pose.phase==='exit'?pose.prizeElapsed-9500:null):null;
 const light=pose.frameLight?spinWheelFrameLight(pose.targetIndex,pose.frameLight.elapsedMs,pose.frameLight.delaySeconds):null;
 const sparkles=pose.sparkles??[];if(!Array.isArray(sparkles)||sparkles.some(p=>!p||!['x','y','scale','alpha'].every(k=>Number.isFinite(p[k]))||p.scale<.1||p.scale>2.5||p.alpha<0||p.alpha>1||!Number.isInteger(p.color)||p.color<0||p.color>=16777215))throw Error('Invalid native sparkle pose');
 if(pose.waitLights&&!['base','ring'].every(k=>{const p=pose.waitLights[k];return p&&['x','y','alpha'].every(n=>Number.isFinite(p[n]))&&p.alpha>=0&&p.alpha<=1}))throw Error('Invalid native wait light pose');
 const effect=pose.highlight?spinWheelPrizeEffect(pose.targetIndex,pose.prizeElapsed):null;
 const amounts=labels.map(label=>spinWheelAmount(art.font,label));for(const [key,[w,h]]of Object.entries(dimensions))if(art[key]?.width!==w||art[key]?.height!==h)throw Error('Native wheel image dimensions changed');
 function drawWait(kind){const p=pose.waitLights?.[kind];if(!p)return;const layer=art.waitLightLayer??=new OffscreenCanvas(362,360),m=layer.getContext('2d');m.clearRect(0,0,362,360);m.globalCompositeOperation='source-over';m.save();if(kind==='base'){m.beginPath();m.arc(180,180,180,0,Math.PI*2);m.clip()}m.translate(p.x,p.y);m.rotate(135*Math.PI/180);m.drawImage(art.light,0,0,360,kind==='base'?150:200);m.restore();if(kind==='ring'){m.globalCompositeOperation='destination-in';m.drawImage(art.ringMask,0,0,362,360)}ctx.save();ctx.globalAlpha*=p.alpha;ctx.drawImage(layer,13.5,13.5);ctx.restore()}
 ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.save();
 try{
  if(glow){ctx.save();ctx.translate(ctx.canvas.width/2-404,176);ctx.save();ctx.translate(406,glow.y);ctx.rotate(glow.rotation*Math.PI/180);ctx.globalAlpha*=glow.glow.alpha;ctx.drawImage(art.glow,glow.glow.x,glow.glow.y,glow.glow.size,glow.glow.size);ctx.restore();if(glow.glitter.visible){ctx.globalAlpha*=glow.glitter.alpha;ctx.drawImage(art.glitter,glow.glitter.x,glow.glitter.y,glow.glitter.size,glow.glitter.size)}ctx.restore()}
  ctx.globalAlpha*=pose.wheelAlpha??1;ctx.translate(ctx.canvas.width/2-404,176+(pose.wheelOffsetY??0));ctx.scale(2.1,2.1);ctx.save();ctx.translate(193.5,193.5);ctx.rotate(pose.wheel*Math.PI/180);ctx.drawImage(art.base,-180,-180);
  ctx.save();ctx.scale(.5,.5);
  for(const [slot,tokens]of amounts.entries()){
   ctx.save();ctx.rotate((45*slot-67.5)*Math.PI/180);ctx.translate(300,0);ctx.rotate(Math.PI/2);ctx.scale(32/56,32/56);
   for(const token of tokens){ctx.save();ctx.translate(token.x,token.y);ctx.scale(token.scale,token.scale);for(const g of token.glyphs)ctx.drawImage(art.fontImage,g.sourceX,g.sourceY,g.width,g.height,g.x,g.y,g.width,g.height);ctx.restore()}ctx.restore();
  }
  ctx.restore();if(light){const layer=art.frameLightLayer??=new OffscreenCanvas(122,159),mask=layer.getContext('2d');mask.clearRect(0,0,122,159);mask.globalCompositeOperation='source-over';mask.drawImage(art.light,0,light.y+159,122,80);mask.globalCompositeOperation='destination-in';mask.drawImage(art.frameMask,0,0);ctx.save();ctx.rotate(light.rotation*Math.PI/180);ctx.globalAlpha*=light.alpha;ctx.drawImage(layer,-61,-159);ctx.restore()}if(effect){ctx.save();ctx.rotate(effect.rotation*Math.PI/180);ctx.translate(0,-85);ctx.scale(effect.scale,effect.scale);ctx.globalAlpha*=effect.alpha;ctx.drawImage(art.effect,-76,-86.5);ctx.restore()}ctx.restore();drawWait('base');ctx.drawImage(art.symbol,156.5,156.5,74,74);ctx.drawImage(art.stone,0,0);drawWait('ring');ctx.translate(193.5,13.5);ctx.rotate(pose.arrow*Math.PI/180);ctx.drawImage(art.arrow,-16.5,-14,33,45);
 }finally{ctx.restore()}
 for(const p of sparkles){const layer=art.sparkleLayer??=new OffscreenCanvas(150,150),tint=layer.getContext('2d');tint.clearRect(0,0,150,150);tint.globalCompositeOperation='source-over';tint.drawImage(art.glitter,0,0);tint.globalCompositeOperation='source-in';tint.fillStyle='#'+p.color.toString(16).padStart(6,'0');tint.fillRect(0,0,150,150);ctx.save();try{ctx.translate(ctx.canvas.width/2-404+p.x,176+p.y);ctx.scale(p.scale,p.scale);ctx.globalAlpha*=p.alpha;ctx.drawImage(layer,-75,-75)}finally{ctx.restore()}}
}
