const width=1330.5,height=1318.95,origin=[669.35,1051.85];
export function battleBoxType(boxQuality,effectLevel){if(!Number.isSafeInteger(boxQuality)||boxQuality<0||!Number.isSafeInteger(effectLevel)||effectLevel<0)throw Error('Invalid bounty presentation metadata');return boxQuality>0?4:effectLevel===3?3:effectLevel===2?2:1}
// Nominal source clock; live Flash sampling and operator speed overrides remain unverified.
export function battleBoxPose(elapsed,type){
 if(!Number.isFinite(elapsed)||elapsed<0||!Number.isInteger(type)||type<1||type>4)throw Error('Invalid bounty presentation time or type');const raw=Math.floor(elapsed/33),end=type===4?285:169,opened=raw>=16;
 return {frame:Math.max(1,Math.min(end,raw))-1,amountVisible:raw>=(type===4?205:121),complete:elapsed>=end*33+1000,winnersAlpha:Math.min(1,elapsed/500),lightAlpha:type===1?.3:1,layers:{first:opened&&type===4,normal:opened&&type!==4,normal_light:opened&&type!==4,normal_fireworks:opened&&type===3}};
}
// This renderer accepts explicit native presentation metadata; it never chooses a bounty or a box grade from its amount.
export async function loadBattleBox(){
 const response=await fetch('/home-art/native-battle-box.json',{signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Native bounty box artwork unavailable');const pack=await response.json();
 if(pack.version!==1||pack.frameMs!==33||pack.width!==width||pack.height!==height||JSON.stringify(pack.origin)!==JSON.stringify(origin)||!Array.isArray(pack.bitmaps)||!pack.bitmaps.length||!pack.bitmaps.every(v=>typeof v==='string'&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/i.test(v))||!Array.isArray(pack.definitions)||!pack.definitions.every(v=>typeof v==='string')||!Array.isArray(pack.frames)||pack.frames.length!==285||!pack.frames.every(f=>typeof f?.body==='string'&&Array.isArray(f.defs)&&f.defs.every(i=>Number.isInteger(i)&&i>=0&&i<pack.definitions.length)))throw Error('Invalid native bounty frame pack');
 const expand=text=>text.replace(/__BATTLE_BITMAP_(\d+)__/g,(_,id)=>{const value=pack.bitmaps[Number(id)];if(!value)throw Error('Missing native bounty bitmap');return value});
 return {async frame(index,type){
  const pose=battleBoxPose((index+1)*33,type);if(!Number.isInteger(index)||index<0||index>=(type===4?285:169))throw Error('Invalid native bounty frame');const f=pack.frames[index],svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'">'+expand(f.body)+'<defs>'+f.defs.map(i=>expand(pack.definitions[i])).join('')+'</defs></svg>',doc=new DOMParser().parseFromString(svg,'image/svg+xml');
  if(doc.querySelector('parsererror,script,foreignObject'))throw Error('Invalid native bounty SVG');for(const [name,visible]of Object.entries(pose.layers)){const layer=doc.getElementById(name);if(!layer)throw Error('Missing native bounty layer');if(!visible)layer.setAttribute('display','none');if(name==='normal_light')layer.setAttribute('opacity',String(pose.lightAlpha))}
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(doc)],{type:'image/svg+xml'}));try{const image=new Image();image.src=url;await image.decode();return {image,width,height,origin:[...origin]}}finally{URL.revokeObjectURL(url)}
 }};
}
