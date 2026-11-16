import {cards,element} from './felt.mjs';
import {rabbitPeel} from './rabbit-peel.mjs';
let nextClip=0;
export function rabbitCover(){
 const ns='http://www.w3.org/2000/svg',make=name=>document.createElementNS(ns,name),svg=make('svg'),defs=make('defs'),clip=make('clipPath'),polygon=make('polygon'),group=make('g');svg.setAttribute('viewBox','0 0 122 162');svg.setAttribute('aria-hidden','true');clip.id='rabbit-clip-'+(++nextClip);clip.append(polygon);defs.append(clip);group.setAttribute('clip-path','url(#'+clip.id+')');
 const image=(name,x,y,w,h)=>{const n=make('image');n.setAttribute('href','/home-art/native-rabbit-'+name+'.png');for(const [key,value]of Object.entries({x,y,width:w,height:h}))n.setAttribute(key,String(value));return n};
 group.append(image('cover',0,0,122,162));const icon=image('icon',22.5,12,77,138);icon.classList.add('nativeRabbitIcon');group.append(icon);const fold=image('fold',0,0,122,162);group.append(fold);svg.append(defs,group);
 const paint=t=>{const f=rabbitPeel(t);polygon.setAttribute('points',f.polygon.map(p=>p.join(',')).join(' '));fold.setAttribute('transform','matrix('+f.matrix.join(' ')+')');svg.dataset.peel=String(t);if(t>0)icon.classList.remove('nativeRabbitIcon')};paint(0);return {svg,paint};
}
export function installRabbitView(parent,getState,reveal,playCues,onOpened=()=>{}){
 const layer=element('div','nativeRabbitLayer');parent.append(layer);const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');motionPreference.addEventListener('change',event=>{if(event.matches)finishMotion?.()});let key='',previous=null,timer,raf=0,generation=0,busy=false,opened=false,finishMotion=null;
 const stop=()=>{generation++;clearTimeout(timer);cancelAnimationFrame(raf);finishMotion=null};
 return {get opened(){return opened},update(){
  const state=getState(),g=state?.hand,available=!!(g?.canRabbit||g?.rabbitCards),next=available?JSON.stringify([state.number,state.me,g.board,g.rabbitCards]):'';
  const button=layer.querySelector('button');if(button)button.disabled=busy||!!document.querySelector('.award');
  if(next===key)return;const animate=!!(previous?.number===state?.number&&previous.canRabbit&&g?.rabbitCards);previous=state?{number:state.number,canRabbit:!!g?.canRabbit}:null;key=next;stop();opened=false;layer.replaceChildren();if(!available)return;
  if(g.canRabbit){const control=element('button','nativeRabbitCover');control.type='button';control.style.setProperty('--rabbit-slot',g.board.length);control.setAttribute('aria-label','Reveal Rabbit cards: remaining board only');control.disabled=busy||!!document.querySelector('.award');control.append(rabbitCover().svg);control.onclick=async()=>{if(busy)return;busy=true;control.disabled=true;try{await reveal(state.number)}finally{busy=false;if(control.isConnected)control.disabled=!!document.querySelector('.award')}};layer.append(control);return}
  const nodes=cards(g.rabbitCards),covers=[];for(const [i,node]of nodes.entries()){node.classList.add('nativeRabbitFace');node.style.setProperty('--rabbit-slot',g.board.length+i);node.dataset.rabbitCard=g.rabbitCards[i];const c=rabbitCover();c.svg.classList.add('nativeRabbitPeel');node.append(c.svg);covers.push(c);layer.append(node);if(animate&&!motionPreference.matches)node.animate([{transform:'translateX('+(-i*144/17)+'cqw)'},{transform:'translateX(0)'}],{duration:300,easing:'cubic-bezier(.3333333333,1,.6666666667,1)'})}
  if(!animate||motionPreference.matches){covers.forEach(c=>c.paint(1));opened=true;onOpened();if(animate){const version=generation;playCues([nodes.length===1?'RabbitCard':'RabbitCardDouble'],()=>getState()?.number===state.number&&layer.isConnected&&version===generation)}return}
  const version=generation,number=state.number;let sounded=false;
  const sound=()=>{if(sounded)return;sounded=true;playCues([nodes.length===1?'RabbitCard':'RabbitCardDouble'],()=>getState()?.number===number&&layer.isConnected&&version===generation)};
  const complete=()=>{clearTimeout(timer);cancelAnimationFrame(raf);for(const node of nodes)for(const animation of node.getAnimations())animation.finish();covers.forEach(c=>c.paint(1));opened=true;finishMotion=null;onOpened()};
  finishMotion=()=>{sound();complete()};
  timer=setTimeout(()=>{if(version!==generation)return;sound();const start=performance.now(),tick=now=>{if(version!==generation)return;const t=motionPreference.matches?1:Math.min(1,(now-start)/200);covers.forEach(c=>c.paint(t));if(t<1)raf=requestAnimationFrame(tick);else complete()};raf=requestAnimationFrame(tick)},300);
 }};
}
