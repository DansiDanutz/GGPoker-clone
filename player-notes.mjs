import {readFileSync,writeFileSync,renameSync} from 'node:fs';
export const noteColors=['#00B050','#269CFF','#7030AA','#7AFFE8','#862C08','#96FA3E','#FF0000','#FF8121','#FFC7D2','#FFFF00','#FFFFFF'];
const fail=()=>{throw Object.assign(Error('Use at most 1000 characters and an available color'),{status:400})};
function clean(note){
 if(!note||typeof note.text!=='string'||!Number.isInteger(note.color)||note.color<0||note.color>=noteColors.length)fail();
 const text=note.text.replace(/\r\n?/g,'\n');if(text.length>1000)fail();return {text,color:note.color};
}
const key=(owner,target)=>{if(!/^[a-f0-9]{64}$/.test(owner)||!/^[a-f0-9]{64}$/.test(target))fail();return owner+':'+target};
function cleanLabels(titles){
 if(!Array.isArray(titles)||titles.length!==10||[...titles].some(t=>typeof t!=='string'||t.length>20||/[\r\n]/.test(t)))throw Object.assign(Error('Use ten single-line label titles, each at most20 characters'),{status:400});return [...titles];
}
export function openNotes(file){
 let notes=new Map(),labels=new Map();
 try{const saved=JSON.parse(readFileSync(file,'utf8'));if(saved.version!==1||!Array.isArray(saved.notes)||saved.labels!==undefined&&!Array.isArray(saved.labels))throw Error('Invalid private note store');for(const row of saved.notes){const id=key(row.owner,row.target);if(notes.has(id))throw Error('Duplicate private note');notes.set(id,clean(row))}for(const row of saved.labels||[]){key(row.owner,row.owner);if(labels.has(row.owner))throw Error('Duplicate private labels');labels.set(row.owner,cleanLabels(row.titles))}}catch(e){if(e.code!=='ENOENT')throw e}
 function commit(next,nextLabels){
  const rows=[...next].map(([id,note])=>{const [owner,target]=id.split(':');return {owner,target,...note}}),labelRows=[...nextLabels].map(([owner,titles])=>({owner,titles}));
  writeFileSync(file+'.tmp',JSON.stringify({version:1,notes:rows,...(labelRows.length?{labels:labelRows}:{})}),{mode:0o600});renameSync(file+'.tmp',file);notes=next;labels=nextLabels;
 }
 return {get(owner,target){return {...(notes.get(key(owner,target))||{text:'',color:10})}},set(owner,target,value){
  const id=key(owner,target),note=clean(value),previous=notes.get(id)||{text:'',color:10};if(previous.text===note.text&&previous.color===note.color)return false;
  const next=new Map(notes);if(note.text||note.color!==10)next.set(id,note);else next.delete(id);commit(next,labels);return true;
 },getLabels(owner){key(owner,owner);return [...(labels.get(owner)||Array(10).fill(''))]},setLabels(owner,value){
  key(owner,owner);const titles=cleanLabels(value);if(JSON.stringify(labels.get(owner)||Array(10).fill(''))===JSON.stringify(titles))return false;
  const next=new Map(labels);if(titles.some(Boolean))next.set(owner,titles);else next.delete(owner);commit(notes,next);return true;
 }};
}

export function saveNoteLabels(notes,owner,body){
if(body.labels!==undefined||body.labelChanges!==undefined){
      if(body.seat!==undefined||body.labels!==undefined&&body.labelChanges!==undefined)noteError('Save label titles separately from a player note');
      let labels=body.labels;
      if(body.labelChanges!==undefined){
        if(!Array.isArray(body.labelChanges)||!body.labelChanges.length||body.labelChanges.length>10)noteError('Choose label title changes');
        labels=notes.getLabels(owner);const seen=new Set();
        for(const change of body.labelChanges){if(!change||!Number.isInteger(change.color)||change.color<0||change.color>=10||seen.has(change.color))noteError('Choose unique label colors');seen.add(change.color);labels[change.color]=change.title}
      }
      notes.setLabels(owner,labels);
    }
}
const noteError=message=>{throw Object.assign(Error(message),{status:400})};
