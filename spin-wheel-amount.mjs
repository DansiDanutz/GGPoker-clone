// NewAmount.setKey stacks tapered bitmap-label bounds before its parent's 90° rotation and 32/56 scale.
// shortcut: normalized bounds omit unverified Flash subpixel auto-size offsets; calibrate before native pixel-parity claims.
export function spinWheelAmount(font,text){
 const fail=()=>{throw Error('Invalid native wheel amount or bitmap font')};
 if(font?.size!==56||!Array.isArray(font.glyphs)||!font.glyphs.length||font.glyphs.length>256||!Number.isInteger(font.common?.scaleW)||!Number.isInteger(font.common?.scaleH)||font.common.scaleW<1||font.common.scaleH<1||font.common.scaleW>4096||font.common.scaleH>4096||typeof text!=='string'||!text||text.length>64)fail();
 const glyphs=new Map();for(const g of font.glyphs){if(!g||!['id','x','y','width','height','xoffset','yoffset','xadvance'].every(k=>Number.isSafeInteger(g[k]))||g.id<0||g.id>0x10ffff||glyphs.has(g.id)||Math.min(g.x,g.y,g.width,g.height,g.xadvance)<0||g.x+g.width>font.common.scaleW||g.y+g.height>font.common.scaleH||Math.abs(g.xoffset)>4096||Math.abs(g.yoffset)>4096)fail();glyphs.set(g.id,g)}
 const tokens=text.match(/[^0-9,.]+|[0-9]|[,.]/g),base=tokens.length>10?.83:tokens.length>9?.92:1;let y=0;
 return tokens.map((token,index)=>{
  let advance=0;const draws=[];for(const char of token){const g=glyphs.get(char.codePointAt(0));if(!g||g.width===0||g.height===0)fail();draws.push({sourceX:g.x,sourceY:g.y,width:g.width,height:g.height,x:advance+g.xoffset,y:g.yoffset});advance+=g.xadvance}
  const left=Math.min(...draws.map(g=>g.x)),top=Math.min(...draws.map(g=>g.y)),width=Math.max(...draws.map(g=>g.x+g.width))-left,height=Math.max(...draws.map(g=>g.y+g.height))-top,scale=base-.01*index;
  const result={text:token,width,height,scale,x:-width*scale*(token==='1'?.7:token===','||token==='.'?2:.5),y,glyphs:draws.map(g=>({...g,x:g.x-left,y:g.y-top}))};y+=height*scale;return result;
 });
}
