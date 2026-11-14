// Public lobby preview: derive markers from the dealt hand, never return private game fields.
export function previewTable(table,names,game,occupied){
 const dealt=game.hands.flatMap((cards,i)=>cards.length?[i]:[]),small=dealt.length===2?game.button:Array.from({length:names.length},(_,i)=>(game.button+i+1)%names.length).find(i=>dealt.includes(i));
 return {table,maxPlayers:names.length,players:names.flatMap((name,seat)=>occupied[seat]?[{name,seat,chips:game.stacks[seat],position:seat===game.button?'dealer':seat===small?'small-blind':seat===game.bigBlindSeat?'big-blind':null}]:[])};
}
