export function prizeAmounts(pool,shares){
 if(!Number.isSafeInteger(pool)||pool<0||!Array.isArray(shares)||shares.length<1||shares.length>9||!shares.every(n=>Number.isInteger(n)&&n>0&&n<=100)||shares.reduce((a,b)=>a+b,0)!==100)throw Error('Invalid prize shares');
 const units=shares.map(n=>BigInt(pool)*BigInt(n)),prizes=units.map(n=>Number(n/100n));
 const order=shares.map((_,i)=>i).sort((a,b)=>Number(units[b]%100n-units[a]%100n)||a-b);
 const remainder=pool-prizes.reduce((a,b)=>a+b,0);
 for(let i=0;i<remainder;i++)prizes[order[i]]++;
 return prizes;
}
