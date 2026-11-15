const family='PlayGGNativePrizeRows',style='700 30px "'+family+'"';let fontPromise;
export function spinPrizeRowsLayout(values,measure){
 if(!Array.isArray(values)||!values.length||values.length>6||Array.from(values).some(v=>typeof v!=='string'||!v||v.length>64)||typeof measure!=='function')throw Error('Invalid Spin prize rows');
 const rows=values.map((value,i)=>{const title=['1st','2nd','3rd','4th','5th','6th'][i],a=measure(title),b=measure(value);for(const m of [a,b])if(!m||!['width','height','baseline'].every(k=>Number.isFinite(m[k]))||m.width<=0||m.height<=0||m.baseline<0||m.baseline>m.height)throw Error('Invalid native prize-row metrics');return {title,value,width:a.width+5+b.width,height:Math.max(a.height,b.height),valueX:a.width+5,titleBaseline:a.baseline,valueBaseline:b.baseline,y:0}});
 const split=rows.length>3,left=rows.slice(0,split&&rows.length===4?2:3),right=rows.slice(left.length),firstWidth=Math.max(...left.map(r=>r.width));
 for(const group of [left,right])for(const [i,row]of group.entries()){row.x=group===right?firstWidth+14:0;row.y=i*(group[0].height+5)}
 const width=firstWidth+(split?14+Math.max(...right.map(r=>r.width)):0);return {x:(565-width)>>1,y:split?330:350,width,rows,...(split?{divider:{x:firstWidth+5,y:10,width:4,height:rows.length===4?68:110}}:{})};
}
async function loadFont(){
 const responses=await Promise.all([fetch('/home-art/native-spin-prize-row-font.json',{signal:AbortSignal.timeout(5000)}),fetch('/home-art/native-show-roboto-condensed-bold.ttf',{signal:AbortSignal.timeout(5000)})]);if(responses.some(r=>!r.ok))throw Error('Native prize-row font unavailable');const [meta,bytes]=await Promise.all([responses[0].json(),responses[1].arrayBuffer()]);
 if(meta?.family!=='Roboto Condensed Bold'||!Array.isArray(meta.codepoints)||!meta.codepoints.length||meta.codepoints.length>4096||meta.codepoints.some(c=>!Number.isInteger(c)||c<0||c>1114111)||new Set(meta.codepoints).size!==meta.codepoints.length||typeof meta.sha256!=='string')throw Error('Invalid native prize-row font metadata');
 const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');if(sha!==meta.sha256)throw Error('Native prize-row font hash changed');const face=await new FontFace(family,bytes,{weight:'700'}).load();document.fonts.add(face);return new Set(meta.codepoints);
}
export async function prepareSpinPrizeRows(values){
 const current=fontPromise??=loadFont();let supported;try{supported=await current}catch(error){if(fontPromise===current)fontPromise=null;throw error}
 const ctx=document.createElement('canvas').getContext('2d');ctx.font=style;ctx.fontKerning='normal';
 // shortcut: Flash uses textWidth/textHeight+4; native outlines are exact, browser metric/grid-fit parity still needs calibration.
 const layout=spinPrizeRowsLayout(values,text=>{if([...text].some(c=>!supported.has(c.codePointAt(0))))throw Error('Unsupported native prize-row glyph');const m=ctx.measureText(text);return {width:Math.ceil(m.width+4),height:Math.ceil(m.fontBoundingBoxAscent+m.fontBoundingBoxDescent+4),baseline:m.fontBoundingBoxAscent+2}});return {...layout,font:style};
}
export function drawSpinPrizeRows(ctx,layout){
 ctx.save();try{ctx.font=layout.font;ctx.fontKerning='normal';ctx.textBaseline='alphabetic';if(layout.divider){const d=layout.divider;ctx.fillStyle='#333333';ctx.fillRect(layout.x+d.x,layout.y+d.y,d.width,d.height)}for(const row of layout.rows){ctx.fillStyle='#ffffff';ctx.fillText(row.title,layout.x+row.x+2,layout.y+row.y+row.titleBaseline);ctx.fillStyle='#efe592';ctx.fillText(row.value,layout.x+row.x+row.valueX+2,layout.y+row.y+row.valueBaseline)}}finally{ctx.restore()}
}
