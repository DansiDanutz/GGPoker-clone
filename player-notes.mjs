import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,renameSync} from 'node:fs';
export const reportTypes=Object.freeze({1:'Offensive nickname / avatar',3:'Chip dumping',4:'Bonus abuse',5:'Collusion',6:'Bum hunting',7:'Suspicious play',8:'Bots',9:'Real-time assistance'});
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
export function saveHandReport(notes,owner,room,hand,command,now){
 const fail=(status,message)=>{throw Object.assign(Error(message),{status})};
 if(!command||typeof command!=='object'||Array.isArray(command)||!Number.isSafeInteger(command.number)||!Number.isInteger(command.category)||!Object.hasOwn(reportTypes,command.category)||typeof command.detail!=='string'||command.detail.length>1000||!Array.isArray(command.seats)||!command.seats.length||new Set(command.seats).size!==command.seats.length)fail(400,'Choose hand, players, category and at most1000 detail characters');
 if(!hand?.canReport)fail(409,'Report requires a participating hand started within30 hours');if(hand.mode==='tournament'&&command.category===6)fail(400,'Bum hunting category is unavailable for tournaments');
 if(!command.seats.every(i=>Number.isInteger(i)&&i>=0&&i<hand.names.length&&i!==hand.viewerSeat&&hand.dealtSeats[i]&&hand.names[i]))fail(400,'Choose other players from this hand');
 const seats=[...command.seats].sort((a,b)=>a-b),detail=command.detail.replace(/\r\n?/g,'\n'),category=command.category,id=createHash('sha256').update(JSON.stringify([owner,room,hand.startedAt,hand.number,category,seats,detail])).digest('hex');
 return notes.saveReport({id,owner,room,number:hand.number,startedAt:hand.startedAt,at:now,reporter:hand.names[hand.viewerSeat],seats,category,detail,status:'open',reviewNote:'',hand});
}
export function savePlayerReport(notes,owner,event,reporter,reported,command,now){
 if(typeof command?.detail!=='string')throw Object.assign(Error('Use at most1000 report detail characters'),{status:400});
 const category=command.category,detail=command.detail.replace(/\r\n?/g,'\n'),id=createHash('sha256').update(JSON.stringify([owner,event.id,reported,category,detail])).digest('hex');
 return notes.saveReport({kind:'profile',id,owner,event:event.id,eventName:event.name,at:now,reporter,reported,category,detail,status:'open',reviewNote:''});
}
function cleanReport(row){
 const invalid=()=>{throw Object.assign(Error('Invalid local report'),{status:400})};
 if(row?.kind==='profile'){
  if(Object.keys(row).sort().join(',')!=='at,category,detail,event,eventName,id,kind,owner,reported,reporter,reviewNote,status'||!['id','owner'].every(k=>typeof row[k]==='string'&&/^[a-f0-9]{64}$/.test(row[k]))||typeof row.event!=='string'||!/^[a-z0-9-]{1,40}$/.test(row.event)||typeof row.eventName!=='string'||!row.eventName.trim()||row.eventName.length>60||!Number.isSafeInteger(row.at)||row.at<0||!['reporter','reported'].every(k=>typeof row[k]==='string'&&/^[a-z0-9][a-z0-9_-]{1,19}$/.test(row[k]))||row.reporter===row.reported||!Number.isInteger(row.category)||!Object.hasOwn(reportTypes,row.category)||row.category===6||typeof row.detail!=='string'||row.detail.length>1000||row.detail.includes('\r')||!['open','reviewed'].includes(row.status)||typeof row.reviewNote!=='string'||row.reviewNote.length>1000)invalid();
  const id=createHash('sha256').update(JSON.stringify([row.owner,row.event,row.reported,row.category,row.detail])).digest('hex');if(row.id!==id)invalid();return structuredClone(row);
 }
 if(row?.kind!==undefined)invalid();

 if(!row||!['id','owner'].every(k=>typeof row[k]==='string'&&/^[a-f0-9]{64}$/.test(row[k]))||typeof row.room!=='string'||!/^[a-f0-9]{48}$/.test(row.room)||!['number','startedAt','at'].every(k=>Number.isSafeInteger(row[k])&&row[k]>=0)||typeof row.reporter!=='string'||row.reporter.length>24||!Number.isInteger(row.category)||!Object.hasOwn(reportTypes,row.category)||!Array.isArray(row.seats)||!row.seats.length||row.seats.length>8||new Set(row.seats).size!==row.seats.length||!row.seats.every(i=>Number.isInteger(i)&&i>=0&&i<9)||!['open','reviewed'].includes(row.status)||typeof row.detail!=='string'||row.detail.length>1000||typeof row.reviewNote!=='string'||row.reviewNote.length>1000||!row.hand||row.hand.number!==row.number||!Array.isArray(row.hand.names)||!Array.isArray(row.hand.cards))invalid();
 return structuredClone(row);
}
export function openNotes(file){
 let notes=new Map(),labels=new Map(),reports=new Map();
 try{const saved=JSON.parse(readFileSync(file,'utf8'));if(saved.version!==1||!Array.isArray(saved.notes)||saved.labels!==undefined&&!Array.isArray(saved.labels)||saved.reports!==undefined&&!Array.isArray(saved.reports))throw Error('Invalid private note store');for(const row of saved.notes){const id=key(row.owner,row.target);if(notes.has(id))throw Error('Duplicate private note');notes.set(id,clean(row))}for(const row of saved.labels||[]){key(row.owner,row.owner);if(labels.has(row.owner))throw Error('Duplicate private labels');labels.set(row.owner,cleanLabels(row.titles))}for(const row of saved.reports||[]){const report=cleanReport(row);if(reports.has(report.id))throw Error('Duplicate report');reports.set(report.id,report)}}catch(e){if(e.code!=='ENOENT')throw e}
 function commit(next,nextLabels,nextReports=reports){
  const rows=[...next].map(([id,note])=>{const [owner,target]=id.split(':');return {owner,target,...note}}),labelRows=[...nextLabels].map(([owner,titles])=>({owner,titles}));
  writeFileSync(file+'.tmp',JSON.stringify({version:1,notes:rows,...(labelRows.length?{labels:labelRows}:{}),...(nextReports.size?{reports:[...nextReports.values()]}:{})}),{mode:0o600});renameSync(file+'.tmp',file);notes=next;labels=nextLabels;reports=nextReports;
 }
 return {getReports(){return structuredClone([...reports.values()].map(row=>({...row,categoryLabel:reportTypes[row.category]})))},saveReport(value){
  const report=cleanReport(value),prior=reports.get(report.id);if(prior)return {id:prior.id,status:prior.status};
  const next=new Map(reports);next.set(report.id,report);commit(notes,labels,next);return {id:report.id,status:report.status};
 },reviewReport(id,body){
  if(!body||!['open','reviewed'].includes(body.status)||typeof body.note!=='string'||body.note.length>1000)throw Object.assign(Error('Choose review state and a note of at most1000 characters'),{status:400});
  const prior=reports.get(id);if(!prior)throw Object.assign(Error('Report not found'),{status:404});
  const next=new Map(reports);next.set(id,{...prior,status:body.status,reviewNote:body.note});commit(notes,labels,next);return {id,status:body.status};
 },get(owner,target){return {...(notes.get(key(owner,target))||{text:'',color:10})}},set(owner,target,value){
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
