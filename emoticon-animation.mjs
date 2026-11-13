export function advanceEmoticon(current,total,ticks){
 if(!Number.isFinite(current)||current<1||!Number.isInteger(current*2)||!Number.isInteger(total)||total<1||!Number.isInteger(ticks)||ticks<0)throw new RangeError('Invalid emoticon clock');
 if(!ticks)return {current,frame:1};
 if(current+.5>total){current=1;ticks--}
 current=1+(((current-1)*2+ticks)%(2*total-1))/2;
 // shortcut: AIR gotoAndStop(0) is locally clamped to1; verify this boundary against native execution.
 return {current,frame:Math.max(1,Math.round(current%total))};
}
const phases=new WeakMap();
export function animateEmoticon(node,art,display,reduced,elapsed){
 const seat=node.parentElement;display.motion??={initial:phases.get(seat)??1,started:performance.now()-elapsed};
 node.style.backgroundImage='url("'+art.file+'")';node.style.backgroundSize=(art.columns*100)+'% '+(Math.ceil(art.frames/art.columns)*100)+'%';
 for(const [key,value]of Object.entries({left:art.x-100,top:art.y-99,width:art.width,height:art.height}))node.style[key]='calc('+value+'*var(--seat-scale)/17*1cqw)';
 function paint(frame){const i=frame-1;node.dataset.frame=frame;node.style.backgroundPosition='calc('+(-(i%art.columns)*art.width)+'*var(--seat-scale)/17*1cqw) calc('+(-Math.floor(i/art.columns)*art.height)+'*var(--seat-scale)/17*1cqw)'}
 paint(1);
 function tick(){if(!node.isConnected||display.dismissed)return;if(!reduced.matches){const next=advanceEmoticon(display.motion.initial,art.frames,Math.floor((performance.now()-display.motion.started)*60/1000));phases.set(seat,next.current);paint(next.frame)}requestAnimationFrame(tick)}
 requestAnimationFrame(tick);
}
