// Five-card scores compare category first, then tie-breakers from high to low.
const faces='23456789TJQKA';
export function rank5(cards){
 if(!Array.isArray(cards)||cards.length!==5||new Set(cards).size!==5||!cards.every(c=>typeof c==='string'&&/^[2-9TJQKA][cdhs]$/.test(c))) throw new TypeError('Five distinct cards required');
 const ranks=cards.map(c=>faces.indexOf(c[0])+2).sort((a,b)=>b-a);
 const counts=new Map();for(const r of ranks)counts.set(r,(counts.get(r)||0)+1);
 const groups=[...counts].sort((a,b)=>b[1]-a[1]||b[0]-a[0]);
 const ties=groups.map(([rank])=>rank), flush=cards.every(c=>c[1]===cards[0][1]);
 const straight=counts.size===5?(ranks[0]-ranks[4]===4?ranks[0]:ranks.join(',')==='14,5,4,3,2'?5:0):0;
 if(flush&&straight)return [8,straight];
 if(groups[0][1]===4)return [7,...ties];
 if(groups[0][1]===3&&groups[1][1]===2)return [6,...ties];
 if(flush)return [5,...ranks];
 if(straight)return [4,straight];
 if(groups[0][1]===3)return [3,...ties];
 if(groups[0][1]===2)return [groups[1][1]===2?2:1,...ties];
 return [0,...ranks];
}
