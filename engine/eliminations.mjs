// Returns newly eliminated seats from highest to lowest finishing position.
export function eliminationPlaces(before,after,button){
 if(!Array.isArray(before)||!Array.isArray(after)||before.length!==after.length||before.length<2||before.length>9||![...before,...after].every(n=>Number.isSafeInteger(n)&&n>=0)||!Number.isInteger(button)||button<0||button>=before.length)throw Error('Invalid tournament stacks or button');
 const remaining=after.filter(n=>n>0).length;
 const distance=i=>(i-button+before.length-1)%before.length;
 return before.flatMap((n,i)=>n>0&&after[i]===0?[i]:[]).sort((a,b)=>before[b]-before[a]||distance(a)-distance(b)).map((seat,i)=>({seat,place:remaining+i+1}));
}
