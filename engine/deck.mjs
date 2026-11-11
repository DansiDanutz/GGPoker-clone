export function shuffleDeck(){
 const deck=[...'23456789TJQKA'].flatMap(r=>[...'cdhs'].map(s=>r+s));
 for(let i=51;i;i--){const n=i+1,limit=2**32-2**32%n;let x;do{x=crypto.getRandomValues(new Uint32Array(1))[0]}while(x>=limit);let j=x%n;[deck[i],deck[j]]=[deck[j],deck[i]]}
 return deck;
}
