// PlayerSpinAndGoldInsurance source timings; presentation never changes wallet credit.
export function spinInsuranceMotion(elapsedMs,coinStartRotation,coinEndRotation){
 if(!Number.isFinite(elapsedMs)||elapsedMs<0||![coinStartRotation,coinEndRotation].every(n=>Number.isFinite(n)&&n>=-90&&n<=90))throw Error('Invalid insurance motion');
 const clamp=n=>Math.max(0,Math.min(1,n)),out=n=>1-(1-clamp(n))**3;
 const textUp=out(elapsedMs/500),coin=clamp((elapsedMs-2000)/800)**3,amountUp=out((elapsedMs-3200)/500),highlight=clamp(((elapsedMs%2000)-500)/1500);
 return {
  text:{visible:elapsedMs<2500,scale:.1+1.1*textUp,alpha:elapsedMs<2000?textUp:1-out((elapsedMs-2000)/500),y:-65,highlight:elapsedMs>=2500?0:highlight<.5?4*highlight**3:1-(-2*highlight+2)**3/2},
  coin:{visible:elapsedMs>=2000&&elapsedMs<2800,scale:.7,y:-170+170*coin,alpha:1-coin,rotation:coinStartRotation+(coinEndRotation-coinStartRotation)*coin},
  amount:{visible:elapsedMs>=3200&&elapsedMs<5200,y:-95*amountUp,alpha:elapsedMs<4700?amountUp:1-out((elapsedMs-4700)/500)},
  done:elapsedMs>=5200
 };
}
