export const hotkeyActions=Object.freeze([
 ['fold','Fold',[112]],['call','Check / Call',[113]],['raise','Bet / Raise',[114]],
 ...[1,2,3,4].map(i=>['preset'+i,'Select amount '+i,[17,48+i]]),
 ['allIn','All-In',[]],...[1,2,3,4].map(i=>['bet'+i,'Select amount and bet '+i,[]]),
 ['newHand','New hand',[]],['toggleUnits','Switch chip display',[]],['sitOut','Sit out next hand',[]],['sitOutAllCash','Sit out all cash game tables on next hand',[]],['rabbit','Rabbit Hunt',[]],['timeBank','Time bank',[]],['lastHands','Hand history',[]],['addChips','Add Chips',[]],
 ['runItOnce','Run It Once',[]],['runItTwice','Run It Twice',[]],['runItThreeTimes','Run It Three Times',[]],
 ['showLeft','Show left card',[]],['showRight','Show right card',[]],['showAll','Show all cards',[]]
].map(([id,label,keys])=>Object.freeze({id,label,keys:Object.freeze(keys)})));
const names={8:'Backspace',9:'Tab',13:'Enter',15:'Cmd',16:'Shift',17:'Ctrl',18:'Alt',27:'Escape',32:'Space',33:'PageUp',34:'PageDown',35:'End',36:'Home',37:'Left',38:'Up',39:'Right',40:'Down',45:'Insert',46:'Delete'};
for(let i=48;i<=90;i++)if(i<=57||i>=65)names[i]=String.fromCharCode(i);for(let i=112;i<=135;i++)names[i]='F'+(i-111);
const modifiers=[15,16,17,18],defaults=()=>Object.fromEntries(hotkeyActions.map(a=>[a.id,[...a.keys]]));
function valid(keys){return Array.isArray(keys)&&keys.length<=5&&new Set(keys).size===keys.length&&keys.every(k=>Number.isInteger(k)&&names[k])&&(!keys.length||keys.filter(k=>!modifiers.includes(k)).length===1)}
export function keyCodes(event){
 if(event.isComposing)return null;const key=event.key===' '?'Space':event.key?.replace(/^Arrow/,'');const code=event.keyCode||Number(Object.keys(names).find(k=>names[k].toUpperCase()===key?.toUpperCase()));if(!names[code]||modifiers.includes(code))return null;
 return [...(event.metaKey?[15]:[]),...(event.shiftKey?[16]:[]),...(event.ctrlKey?[17]:[]),...(event.altKey?[18]:[]),code].sort((a,b)=>a-b);
}
export const keyCaption=keys=>keys.length?keys.map(k=>names[k]).join('+'):'Unassigned';
export function readHotkeys(raw){
 const result=defaults();if(raw==null||raw==='')return result;
 try{const saved=JSON.parse(raw);if(!saved||typeof saved!=='object'||Array.isArray(saved)||Object.keys(saved).some(id=>!hotkeyActions.some(a=>a.id===id)))return result;for(const [id,keys]of Object.entries(saved)){if(!valid(keys))return defaults();result[id]=[...keys].sort((a,b)=>a-b)}const used=new Set();for(const keys of Object.values(result))if(keys.length){const code=keys.join(',');if(used.has(code))return defaults();used.add(code)}return result}catch{return result}
}
export function assignHotkey(bindings,id,keys,replace=false){
 if(!hotkeyActions.some(a=>a.id===id)||!valid(keys))throw Error('Choose a supported key combination');const result=structuredClone(bindings),next=[...keys].sort((a,b)=>a-b),conflict=next.length&&hotkeyActions.find(a=>a.id!==id&&result[a.id]?.join(',')===next.join(','));if(conflict&&!replace)throw Object.assign(Error('Key already assigned to '+conflict.label),{conflict:conflict.id});if(conflict)result[conflict.id]=[];result[id]=next;return result;
}

export const hotkeyGroup=id=>(id.startsWith("show")||["runItOnce","runItTwice","runItThreeTimes"].includes(id))?"options":["toggleUnits","sitOut","sitOutAllCash","rabbit","timeBank","lastHands","addChips"].includes(id)?"functions":"table";
export function readHotkeyGroups(raw){const result={table:true,functions:true,options:true};try{const saved=JSON.parse(raw);if(saved&&typeof saved==="object"&&!Array.isArray(saved))for(const id of Object.keys(result))if(typeof saved[id]==="boolean")result[id]=saved[id]}catch{}return result}
