export function spinCongratulationFrameIndex(elapsedMs){const frame=Math.floor(elapsedMs*60/1000);if(!Number.isFinite(elapsedMs)||elapsedMs<0||!Number.isSafeInteger(frame))throw Error('Invalid congratulations elapsed time');return frame%240}
export async function loadSpinCongratulations(){
 const response=await fetch('/home-art/native-spin-congratulations.json',{signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('Native congratulations asset unavailable');const pack=await response.json();
 if(pack.version!==1||pack.fps!==60||pack.width!==1210.65||pack.height!==1233.5||JSON.stringify(pack.origin)!=='[328.95,331.75]'||!Array.isArray(pack.definitions)||!pack.definitions.length||!pack.definitions.every(d=>typeof d==='string')||!Array.isArray(pack.frames)||pack.frames.length!==240||!pack.frames.every(f=>typeof f?.body==='string'&&Array.isArray(f.defs)&&f.defs.every(i=>Number.isInteger(i)&&i>=0&&i<pack.definitions.length)))throw Error('Invalid native congratulations frame pack');
 return {async frame(index,chinese=false){
  if(!Number.isInteger(index)||index<0||index>=240||typeof chinese!=='boolean')throw Error('Invalid congratulations frame or language');const f=pack.frames[index],svg='<svg xmlns="http://www.w3.org/2000/svg" width="1210.65" height="1233.5">'+f.body+'<defs>'+f.defs.map(i=>pack.definitions[i]).join('')+'</defs></svg>',doc=new DOMParser().parseFromString(svg,'image/svg+xml');
  if(doc.querySelector('parsererror,script,foreignObject')||!doc.getElementById('text_en')||!doc.getElementById('text_ch'))throw Error('Invalid native congratulations SVG');doc.getElementById(chinese?'text_en':'text_ch').remove();
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(doc)],{type:'image/svg+xml'}));try{const image=new Image();image.src=url;await image.decode();return {image,origin:[328.95,331.75],width:1210.65,height:1233.5}}finally{URL.revokeObjectURL(url)}
 }};
}
// Native graphic/caption timeline only; dynamic prize labels are composed separately.
export function drawSpinCongratulations(ctx,frame,pose){
 if(!frame?.image||frame.width!==1210.65||frame.height!==1233.5||!pose||!['x','y','scale','alpha'].every(k=>Number.isFinite(pose[k]))||pose.scale<0||pose.scale>1||pose.alpha<0||pose.alpha>1)throw Error('Invalid congratulations frame pose');
 ctx.save();try{ctx.translate(ctx.canvas.width/2-404+pose.x,176+pose.y);ctx.scale(pose.scale,pose.scale);ctx.globalAlpha*=pose.alpha;ctx.drawImage(frame.image,-328.95,-331.75,frame.width,frame.height)}finally{ctx.restore()}
}
