export function spinInsuranceGlowFrameIndex(elapsedMs){
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw Error('Invalid insurance glow time');
 // StageMovieClip advances by one per enterFrame; the root SWF declares60Hz, not the asset's30Hz.
 const updates=Math.floor(elapsedMs*60/1000);if(updates>=270)return null;const frame=(1+updates)%270;
 // shortcut: suppress the ambiguous terminal gotoAndStop(0); verify AIR boundary behavior before terminal-parity claims.
 return frame===0?null:frame-1;
}
export async function loadSpinInsuranceGlow(){
 const response=await fetch('/home-art/native-spin-insurance-glow.json',{signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('Native insurance glow unavailable');const pack=await response.json();
 if(pack.version!==1||pack.fps!==30||pack.width!==203.5||pack.height!==203.5||JSON.stringify(pack.origin)!=='[101.75,101.8]'||!Array.isArray(pack.definitions)||!pack.definitions.length||!pack.definitions.every(d=>typeof d==='string')||!Array.isArray(pack.frames)||pack.frames.length!==270||!pack.frames.every(f=>typeof f?.body==='string'&&Array.isArray(f.defs)&&f.defs.every(i=>Number.isInteger(i)&&i>=0&&i<pack.definitions.length)))throw Error('Invalid insurance glow pack');
 return {async frame(index){
  if(!Number.isInteger(index)||index<0||index>=270)throw Error('Invalid insurance glow frame');const f=pack.frames[index],svg='<svg xmlns="http://www.w3.org/2000/svg" width="203.5" height="203.5">'+f.body+'<defs>'+f.defs.map(i=>pack.definitions[i]).join('')+'</defs></svg>',doc=new DOMParser().parseFromString(svg,'image/svg+xml');
  if(doc.querySelector('parsererror,script,foreignObject,iframe,audio,video'))throw Error('Invalid insurance glow SVG');
  for(const node of doc.querySelectorAll('*'))for(const a of node.attributes){if(a.namespaceURI==='http://www.w3.org/2000/xmlns/'){if(!['http://www.w3.org/2000/svg','http://www.w3.org/1999/xlink','https://www.free-decompiler.com/flash'].includes(a.value))throw Error('Invalid SVG namespace');continue}const v=a.value.toLowerCase();if(a.localName.toLowerCase().startsWith('on')||v.includes('javascript:')||v.includes('://')||a.localName==='href'&&!v.startsWith('#')&&!v.startsWith('data:image/png;base64,'))throw Error('Unsafe insurance glow SVG')}
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(doc)],{type:'image/svg+xml'}));try{const image=new Image();image.src=url;await image.decode();return image}finally{URL.revokeObjectURL(url)}
 }};
}
export function drawSpinInsuranceGlow(ctx,image,x,y,elapsedMs){
 const index=spinInsuranceGlowFrameIndex(elapsedMs);if(!Number.isFinite(x)||!Number.isFinite(y)||!image||image.width!==204||image.height!==204)throw Error('Invalid insurance glow pose');if(index===null)return;
 ctx.save();try{ctx.translate(x,y);ctx.scale(2,2);ctx.drawImage(image,-101.75,-101.8,203.5,203.5)}finally{ctx.restore()}
}
