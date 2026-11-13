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


// The shipped short-deck rank table places flush above full house and A6789 last among straights.
export function rankShortDeck5(cards){
 if(!Array.isArray(cards)||cards.some(c=>!/^([6-9TJQKA])[cdhs]$/.test(c)))throw new TypeError('Short deck uses six through ace');
 const rank=rank5(cards);
 if(rank[0]===5)rank[0]=6;
 else if(rank[0]===6)rank[0]=5;
 const wheel=cards.map(c=>c[0]).sort().join('')==='6789A';
 if(wheel)return cards.every(c=>c[1]===cards[0][1])?[8,9]:[4,9];
 return rank;
}

export function bestShortDeck(cards){
 if(!Array.isArray(cards)||cards.length<5||cards.length>7||new Set(cards).size!==cards.length||cards.some(c=>!/^([6-9TJQKA])[cdhs]$/.test(c)))throw new TypeError('Five to seven distinct short-deck cards required');
 let high=null;
 for(let a=0;a<cards.length-4;a++)for(let b=a+1;b<cards.length-3;b++)
  for(let c=b+1;c<cards.length-2;c++)for(let d=c+1;d<cards.length-1;d++)for(let e=d+1;e<cards.length;e++){
   const rank=rankShortDeck5([cards[a],cards[b],cards[c],cards[d],cards[e]]);
   const different=high?rank.findIndex((n,i)=>n!==high[i]):-1;
   if(!high||(different>=0&&rank[different]>high[different]))high=rank;
  }
 return high;
}

// NewHandVO: equal-ranked selections prefer the greatest rank/suit ordinal sum.
export function bestFiveFocus(hole,board,shortDeck=false){
 const all=[...(Array.isArray(hole)?hole:[]),...(Array.isArray(board)?board:[])];
 if(!Array.isArray(hole)||![2,4,5,6].includes(hole.length)||!Array.isArray(board)||![3,4,5].includes(board.length)||typeof shortDeck!=='boolean'||shortDeck&&hole.length!==2||new Set(all).size!==all.length||!all.every(c=>typeof c==='string'&&(shortDeck?/^[6-9TJQKA][cdhs]$/:/^[2-9TJQKA][cdhs]$/).test(c)))throw new TypeError('Distinct complete hole cards and three to five board cards required');
 let high=null;
 const consider=(holes,boards)=>{
  const cards=[...holes.map(i=>hole[i]),...boards.map(i=>board[i])],rank=shortDeck?rankShortDeck5(cards):rank5(cards),ordinal=cards.reduce((sum,c)=>sum+faces.indexOf(c[0])*4+'chds'.indexOf(c[1]),0),difference=high?rank.findIndex((n,i)=>n!==high.rank[i]):-1;
  if(!high||difference>=0&&rank[difference]>high.rank[difference]||difference===-1&&ordinal>high.ordinal)high={rank,ordinal,hole:holes,board:boards};
 };
 if(hole.length>2){
  for(let a=0;a<hole.length-1;a++)for(let b=a+1;b<hole.length;b++)
   for(let c=0;c<board.length-2;c++)for(let d=c+1;d<board.length-1;d++)for(let e=d+1;e<board.length;e++)consider([a,b],[c,d,e]);
 }else if(board.length===3){
  consider([0,1],[0,1,2]);
 }else if(board.length===4){
  for(let q=5;q>=0;q--){const indices=all.map((_,i)=>i).filter(i=>i!==q);consider(indices.filter(i=>i<2),indices.filter(i=>i>=2).map(i=>i-2))}
 }else{
  // Preserve the native exclusion order when both rank and ordinal sum tie.
  for(let q=6;q>0;q--)for(let w=q-1;w>=0;w--){const indices=all.map((_,i)=>i).filter(i=>i!==q&&i!==w);consider(indices.filter(i=>i<2),indices.filter(i=>i>=2).map(i=>i-2))}
 }
 return {hole:high.hole,board:high.board};
}

// Retained HandDraw client masks; this is a display hint, never a payout rule.
export function handDraw(hole,board){
 if(!Array.isArray(hole)||hole.length!==2||!Array.isArray(board)||![3,4].includes(board.length))return '';
 const all=[...hole,...board];if(new Set(all).size!==all.length||!all.every(c=>typeof c==='string'&&/^[2-9TJQKA][cdhs]$/.test(c)))return '';
 const position=c=>c[0]==='A'?(1|1<<13):1<<(faces.indexOf(c[0])+1),ranks=all.reduce((n,c)=>n|position(c),0),suits=[...'cdhs'].map(suit=>all.filter(c=>c[1]===suit)),suitMasks=suits.map(list=>list.reduce((n,c)=>n|position(c),0));
 // The native source tests exactly four/five suits, including its six-suit-card quirk.
 const flush=suits.some(list=>list.length===5)?'made':suits.some(list=>list.length===4)?'draw':'';let suited=false;
 const sameSuit=mask=>suitMasks.some(suit=>{const indices=Array.from({length:14},(_,i)=>i).filter(i=>((suit&mask)&(1<<i))!==0);return indices.some((n,i)=>i>=3&&n-indices[i-3]<=4)});
 const matches=(indices,span,checkSuit=false,shift=true)=>{const base=indices.reduce((n,i)=>n|1<<i,0);for(let offset=0;offset<(shift?15-span:1);offset++){const mask=base<<offset;if((ranks&mask)===mask){if(checkSuit&&sameSuit(mask))suited=true;return true}}return false};
 let straight=matches([0,1,2,3,4],5)?'made':'';
 if(!straight&&matches([1,2,3,4],6,!!flush))straight='OpenEndedStraightDraw';
 if(!straight||straight==='OpenEndedStraightDraw')for(const [mask,span]of [[[0,2,3,4,6],7],[[0,1,3,4,6,7],8]])if(matches(mask,span,!!flush)&&!straight)straight='DoubleGutshotStraightDraw';
 if(!straight||['OpenEndedStraightDraw','DoubleGutshotStraightDraw'].includes(straight))for(const [mask,span,shift]of [[[0,1,2,4],5,true],[[0,1,3,4],5,true],[[0,2,3,4],5,true],[[0,1,2,3],4,false],[[10,11,12,13],4,false]])if(matches(mask,span,!!flush,shift)&&!straight)straight='GutshotStraightDraw';
 if(suited)straight=sameSuit([9,10,11,12,13].reduce((n,i)=>n|1<<i,0))?'RoyalStraightFlushDraw':'StraightFlushDraw';
 if(!flush)return straight==='made'?'':straight;
 if(flush==='made')return ['StraightFlushDraw','RoyalStraightFlushDraw'].includes(straight)?straight:'';
 if(['StraightFlushDraw','RoyalStraightFlushDraw'].includes(straight))return straight;
 return ['OpenEndedStraightDraw','DoubleGutshotStraightDraw','GutshotStraightDraw'].includes(straight)?'FlushDraw'+straight:'FlushDraw';
}
