// Explicit local practice credits; native operator rates are not inferred from the client quote.
export function spinInsuranceTerms(value){
 if(value===undefined)return undefined;
 if(!value||Array.isArray(value)||Object.keys(value).length!==2||Object.keys(value).some(k=>!['premium','payout'].includes(k))||![value.premium,value.payout].every(n=>Number.isSafeInteger(n)&&n>=1&&n<=1000000000))throw Object.assign(Error('Provide explicit whole-credit insurance premium and payout from1 to1000000000'),{status:400});
 return {premium:value.premium,payout:value.payout};
}
