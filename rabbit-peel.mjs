// NewRabbit3D: x is linear140t, y is cubic50t³ from the top-left corner.
export function rabbitPeel(t){
 if(!Number.isFinite(t)||t<0||t>1)throw Error('Invalid Rabbit peel');const x=Math.max(.1,140*t),y=Math.max(.1,50*t*t*t),limit=(x*x+y*y)/2,polygon=[[-366,-486],[488,-486],[488,648],[-366,648]],clipped=[];
 for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],da=a[0]*x+a[1]*y-limit,db=b[0]*x+b[1]*y-limit;if(da>=0)clipped.push(a);if((da>=0)!==(db>=0)){const k=da/(da-db);clipped.push([a[0]+k*(b[0]-a[0]),a[1]+k*(b[1]-a[1])])}}
 const c=(x*x-y*y)/(x*x+y*y),s=2*x*y/(x*x+y*y);return {x,y,polygon:clipped,matrix:[-c,-s,-s,c,x,y]};
}
