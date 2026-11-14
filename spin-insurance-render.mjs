import {resultTextGlyphLayout} from './tournament-result.mjs';
export function spinInsuranceAmountLayout(text,font){
 const l=resultTextGlyphLayout(text,font,40);if(!l)throw Error('Invalid insurance amount glyphs');
 // shortcut: native bitmap mesh bounds are normalized; Flash subpixel auto-size still needs calibration.
 const left=Math.min(...l.glyphs.map(g=>g.left)),top=Math.min(...l.glyphs.map(g=>g.top)),width=Math.max(...l.glyphs.map(g=>g.left+g.width))-left,height=Math.max(...l.glyphs.map(g=>g.top+g.height))-top;
 return {...l,width,height,glyphs:l.glyphs.map(g=>({...g,left:g.left-left,top:g.top-top}))};
}
export async function loadSpinInsuranceArt(language='en'){
 if(!['en','ko','zh'].includes(language))throw Error('Invalid insurance language');const art={};
 try{
  for(const [name,file]of [['text','native-spin-insurance-text-'+language+'.png'],['highlight','native-spin-insurance-highlight-'+language+'.png'],['coin','native-spin-insurance-coin.png'],['plus','native-spin-insurance-plus.png'],['fontImage','native-result-font.png']]){const r=await fetch('/home-art/'+file,{signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('Native insurance image unavailable');art[name]=await createImageBitmap(await r.blob())}
  const r=await fetch('/home-art/native-result-font.json',{signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('Native insurance font unavailable');art.font=await r.json();spinInsuranceAmountLayout('0',art.font);
  const dimensions={en:[180,22,176,18],ko:[145,34,145,31],zh:[80,38,76,34]}[language];if([art.text.width,art.text.height,art.highlight.width,art.highlight.height].some((v,i)=>v!==dimensions[i]))throw Error('Native insurance text dimensions changed');
  if(art.coin.width!==50||art.coin.height!==50||art.plus.width!==60||art.plus.height!==56||art.fontImage.width!==art.font.atlasSize[0]||art.fontImage.height!==art.font.atlasSize[1])throw Error('Native insurance dimensions changed');
  return art;
 }catch(error){for(const image of Object.values(art))image?.close?.();throw error}
}
export function drawSpinInsurance(ctx,art,text,pose,x,y){
 const l=spinInsuranceAmountLayout(text,art.font);if(![x,y].every(Number.isFinite)||!pose||!['text','coin','amount'].every(k=>pose[k]&&typeof pose[k].visible==='boolean'&&Number.isFinite(pose[k].alpha)&&pose[k].alpha>=0&&pose[k].alpha<=1)||![pose.text.scale,pose.text.y,pose.text.highlight,pose.coin.scale,pose.coin.y,pose.coin.rotation,pose.amount.y].every(Number.isFinite)||pose.text.scale<0||pose.text.scale>1.21||pose.coin.scale<=0||pose.coin.scale>1||pose.text.highlight<0||pose.text.highlight>1)throw Error('Invalid insurance pose');
 ctx.save();try{ctx.translate(x,y);
  if(pose.text.visible){ctx.save();ctx.translate(0,pose.text.y);ctx.scale(pose.text.scale,pose.text.scale);ctx.globalAlpha*=pose.text.alpha;ctx.translate(-art.text.width/2,-art.text.height/2);ctx.drawImage(art.text,0,0);ctx.save();ctx.beginPath();const shift=(art.text.width+100)*pose.text.highlight;ctx.translate(shift,0);ctx.rotate(135*Math.PI/180);ctx.rect(0,0,100,50);ctx.clip();ctx.rotate(-135*Math.PI/180);ctx.translate(-shift,0);ctx.globalAlpha*=.4;ctx.drawImage(art.highlight,0,0);ctx.restore();ctx.restore()}
  if(pose.coin.visible){ctx.save();ctx.translate(0,pose.coin.y);ctx.scale(pose.coin.scale,pose.coin.scale);ctx.rotate(pose.coin.rotation*Math.PI/180);ctx.globalAlpha*=pose.coin.alpha;ctx.drawImage(art.coin,-25,-25);ctx.restore()}
  if(pose.amount.visible){ctx.save();ctx.translate(-l.width/2,pose.amount.y);ctx.globalAlpha*=pose.amount.alpha;ctx.drawImage(art.plus,-20,(l.height-28)>>1,30,28);const k=40/56;for(const g of l.glyphs)ctx.drawImage(art.fontImage,Math.round(g.x/k),Math.round(g.y/k),Math.round(g.width/k),Math.round(g.height/k),g.left,g.top,g.width,g.height);ctx.restore()}
 }finally{ctx.restore()}
}
