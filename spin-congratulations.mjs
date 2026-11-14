import {resultTextGlyphLayout} from './tournament-result.mjs';
import {prepareSpinPrizeRows,drawSpinPrizeRows} from './spin-congratulation-rows.mjs';
export function spinCongratulationFrameIndex(elapsedMs){const frame=Math.floor(elapsedMs*60/1000);if(!Number.isFinite(elapsedMs)||elapsedMs<0||!Number.isSafeInteger(frame))throw Error('Invalid congratulations elapsed time');return frame%240}
// shortcut: normalize bitmap bounds; native Flash subpixel auto-size translation still needs calibration.
export function spinCongratulationPrizeLayout(text,font){
 const layout=resultTextGlyphLayout(text,font,90);if(!layout)throw Error('Invalid native congratulations prize text');
 const left=Math.min(...layout.glyphs.map(g=>g.left)),top=Math.min(...layout.glyphs.map(g=>g.top)),width=Math.max(...layout.glyphs.map(g=>g.left+g.width))-left,height=Math.max(...layout.glyphs.map(g=>g.top+g.height))-top;
 return {...layout,width,height,x:(565-width)>>1,y:240,glyphs:layout.glyphs.map(g=>({...g,left:g.left-left,top:g.top-top}))};
}
async function loadPrizeFont(){
 const response=await fetch('/home-art/native-result-font.json',{signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('Native prize font unavailable');const font=await response.json();spinCongratulationPrizeLayout('0',font);
 const png=await fetch('/home-art/native-result-font.png',{signal:AbortSignal.timeout(5000)});if(!png.ok)throw Error('Native prize font image unavailable');const image=await createImageBitmap(await png.blob());if(image.width!==font.atlasSize[0]||image.height!==font.atlasSize[1]){image.close();throw Error('Native prize font dimensions changed')}return {font,image};
}
export async function loadSpinCongratulations(){
 const response=await fetch('/home-art/native-spin-congratulations.json',{signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('Native congratulations asset unavailable');const pack=await response.json();
 if(pack.version!==1||pack.fps!==60||pack.width!==1210.65||pack.height!==1233.5||JSON.stringify(pack.origin)!=='[328.95,331.75]'||!Array.isArray(pack.definitions)||!pack.definitions.length||!pack.definitions.every(d=>typeof d==='string')||!Array.isArray(pack.frames)||pack.frames.length!==240||!pack.frames.every(f=>typeof f?.body==='string'&&Array.isArray(f.defs)&&f.defs.every(i=>Number.isInteger(i)&&i>=0&&i<pack.definitions.length)))throw Error('Invalid native congratulations frame pack');
 let prizeAssets;
 return {async prize(text,values){const current=prizeAssets??=loadPrizeFont();let assets;try{assets=await current}catch(error){if(prizeAssets===current)prizeAssets=null;throw error}const layout=spinCongratulationPrizeLayout(text,assets.font),rows=values===undefined?null:await prepareSpinPrizeRows(values);return {image:assets.image,layout,rows}},async frame(index,chinese=false){
  if(!Number.isInteger(index)||index<0||index>=240||typeof chinese!=='boolean')throw Error('Invalid congratulations frame or language');const f=pack.frames[index],svg='<svg xmlns="http://www.w3.org/2000/svg" width="1210.65" height="1233.5">'+f.body+'<defs>'+f.defs.map(i=>pack.definitions[i]).join('')+'</defs></svg>',doc=new DOMParser().parseFromString(svg,'image/svg+xml');
  if(doc.querySelector('parsererror,script,foreignObject')||!doc.getElementById('text_en')||!doc.getElementById('text_ch'))throw Error('Invalid native congratulations SVG');doc.getElementById(chinese?'text_en':'text_ch').remove();
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(doc)],{type:'image/svg+xml'}));try{const image=new Image();image.src=url;await image.decode();return {image,origin:[328.95,331.75],width:1210.65,height:1233.5}}finally{URL.revokeObjectURL(url)}
 }};
}
// Prize text is explicit input; this renderer never chooses a reward or currency format.
export function drawSpinCongratulations(ctx,frame,pose,prize){
 if(!frame?.image||frame.width!==1210.65||frame.height!==1233.5||!pose||!['x','y','scale','alpha'].every(k=>Number.isFinite(pose[k]))||pose.scale<0||pose.scale>1||pose.alpha<0||pose.alpha>1)throw Error('Invalid congratulations frame pose');
 if(prize&&(!prize.image||!Array.isArray(prize.layout?.glyphs)))throw Error('Invalid native prize glyph image');
 ctx.save();try{ctx.translate(ctx.canvas.width/2-404+pose.x,176+pose.y);ctx.scale(pose.scale,pose.scale);ctx.globalAlpha*=pose.alpha;ctx.drawImage(frame.image,-328.95,-331.75,frame.width,frame.height);if(prize){const k=90/56,l=prize.layout;for(const g of l.glyphs)ctx.drawImage(prize.image,Math.round(g.x/k),Math.round(g.y/k),Math.round(g.width/k),Math.round(g.height/k),l.x+g.left,l.y+g.top,g.width,g.height);if(prize.rows)drawSpinPrizeRows(ctx,prize.rows)}}finally{ctx.restore()}
}
