export const openingChoices=[2,2.5,3,3.5,4,4.5,5,'pot'];
export const normalChoices=[33,50,66,75,80,90,100,'max'];
export function reservedChoices(p){if(!p)return [];if(p.aof)return p.acted?[]:['fold','allin'];if(p.rush&&p.bigBlindOption)return [];return p.due>0?(p.rush?['call']:['fold','call']):p.foldEnabled?(!p.acted?['check-fold','check']:p.reservedCheck?['check-fold']:[]):[]}
export function resolveReservedAction(selection,state){
 const empty={selection:null,action:null},g=state?.hand,p=g?.preAction;
 if(!selection||!p||g.end||selection.number!==state.number||selection.seat!==state.me||!(p.aof?['fold','allin']:['fold','check-fold','check','call']).includes(selection.kind))return empty;
 if(selection.kind==='call'&&(selection.call!==p.call||p.call===0)||selection.kind==='check'&&p.due>0)return empty;
 if(p.rush&&selection.kind==='check-fold'&&p.due>0)return {selection:null,action:'quick-fold'};
 if(selection.kind==='check-fold'&&p.due>0)selection={...selection,kind:'fold'};
 if(g.turn!==state.me)return {selection,action:null};
 const action=selection.kind==='check-fold'?(p.due?'fold':'check'):selection.kind;
 if(action==='fold'&&!p.due&&!p.aof)return empty;
 if(action==='check'&&selection.retain){const history=g.history?.length??0;return {selection:{...selection,checkedHistory:history},action:selection.checkedHistory===history?null:action}}
 return {selection:null,action};
}
export function readBettingPreferences(raw){
 const defaults={opening:[2,3,4,'pot'],normal:[33,50,75,100],unit:'bb',dontRoundBlind:true};
 try{const p=JSON.parse(raw);if(!p||p.dontRoundBlind!==undefined&&typeof p.dontRoundBlind!=='boolean'||!['bb','sb'].includes(p.unit)||!Array.isArray(p.opening)||p.opening.length!==4||!p.opening.every(v=>openingChoices.includes(v))||!Array.isArray(p.normal)||p.normal.length!==4||!p.normal.every(v=>normalChoices.includes(v)))return defaults;return {opening:[...p.opening],normal:[...p.normal],unit:p.unit,dontRoundBlind:p.dontRoundBlind??true}}catch{return defaults}
}
export function betShortcuts(g,o,seat,p){
 const price=g.bets[seat]+o.due,pot=o.pot??g.committed.reduce((a,b)=>a+b,0),opening=!g.board.length&&price===g.blind;
 return (opening?p.opening:p.normal).map(value=>{
  const unit=p.dontRoundBlind===false?(g.variant==='shortdeck'?Math.ceil(g.blind/20)*10:g.blind/2):1;
  // Native BettingUI bypasses rounding for opening shortcuts and Pot/Max.
  const target=value==='max'?o.max:value==='pot'?price+pot+o.due:opening?Math.floor(value*g.blind):Math.ceil((price+(pot+o.due)*value/100)/unit)*unit;
  return {label:value==='pot'?'Pot':value==='max'?'Max':value+(opening?'BB':'%'),target:Math.max(o.min,Math.min(o.max,target))}
 });
}

export function betIncrement(blind,unit,variant){return variant==='shortdeck'||unit!=='sb'?blind:blind/2}
export function snapBetAmount(value,min,max,step){
 if(value<=min)return min;if(value>=max)return max;
 return Math.max(min,Math.min(max,step>0?Math.round(value/step)*step:value));
}
export function wheelBetAmount(value,direction,min,max,step){
 const remainder=value%step,delta=direction?(remainder>0?(direction>0?step-remainder:-remainder):Math.sign(direction)*step):0;
 return Math.max(min,Math.min(max,value+delta));
}

export function bbValue(chips,blind){return Math.round(Number((chips/blind*10).toFixed(5)))/10}
export function chipsFromBetInput(text,factor){
 if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text))return null;
 const value=Number(text)*factor,whole=Math.round(value);
 return Number.isSafeInteger(whole)&&Math.abs(value-whole)<1e-7?whole:null;
}
