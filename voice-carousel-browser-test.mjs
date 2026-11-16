import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {voicePacks} from './voice-packs.mjs';

const directory=mkdtempSync(join(tmpdir(),'voice-carousel-')),profile=join(directory,'chrome');
const images=new Map(voicePacks.map(pack=>['/home-art/'+pack.image,readFileSync('/Users/davidai/Library/Application Support/com.nsuslab.ncf.launcher.live.ggpcom/Game/assets/action_voice/'+pack.image.split('/').at(-1))]));
const html='<!doctype html><div id="carousel"></div><script type="module">import {installVoiceCarousel}from"/voice-carousel.mjs";window.changes=[];window.carousel=installVoiceCarousel(document.querySelector("#carousel"),{text:key=>key,onchange:id=>changes.push(id)});window.ready=true;</script>';
const server=createServer((req,res)=>{
 if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end(html)}
 else if(images.has(req.url)){res.setHeader('Content-Type','image/png');res.end(images.get(req.url))}
 else if(['/voice-carousel.mjs','/voice-packs.mjs'].includes(req.url)){res.setHeader('Content-Type','text/javascript');res.end(readFileSync(new URL('.'+req.url,import.meta.url)))}
 else{res.statusCode=404;res.end()}
});
let chrome,ws;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(fn){for(let i=0;i<200;i++){const result=await fn();if(result)return result;await delay(50)}throw Error('Timed out: '+fn)}
try{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 chrome=spawn(process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless','--mute-audio','--disable-extensions','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
 const address=await until(()=>{try{return readFileSync(join(profile,'DevToolsActivePort'),'utf8').trim().split('\n')}catch{return null}});
 ws=new WebSocket('ws://127.0.0.1:'+address[0]+address[1]);await once(ws,'open');
 let sequence=0;const pending=new Map();
 ws.onmessage=event=>{const response=JSON.parse(event.data);if(!response.id)return;const callback=pending.get(response.id);pending.delete(response.id);if(response.error)callback.reject(Error(response.error.message));else callback.resolve(response.result)};
 function cmd(method,params={},sessionId){return new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params,sessionId}))})}
 const {targetId}=await cmd('Target.createTarget',{url:'about:blank'}),{sessionId}=await cmd('Target.attachToTarget',{targetId,flatten:true});
 const run=async expression=>{const response=await cmd('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);if(response.exceptionDetails)throw Error(JSON.stringify(response.exceptionDetails));return response.result.value};
 await cmd('Page.navigate',{url:'http://127.0.0.1:'+server.address().port},sessionId);await until(()=>run('window.ready'));
 await until(()=>run('[...document.images].every(image=>image.complete&&image.naturalWidth>0)'));
 const metrics=await run(`(()=>{const host=document.querySelector('#carousel').getBoundingClientRect();return [...document.querySelectorAll('[data-voice]')].map(button=>{const r=button.getBoundingClientRect();return{id:button.dataset.voice,x:r.x-host.x+r.width/2,y:r.y-host.y+r.height/2,width:r.width,pressed:button.getAttribute('aria-pressed'),dim:Number(button.querySelector('.voiceDim').style.opacity)}})})()`);
 assert.equal(metrics.length,14);assert.deepEqual(metrics[0],{id:'VDaniel',x:374,y:62,width:120,pressed:'true',dim:0});
 assert.equal(metrics[1].x,505);assert.equal(metrics[1].width,72);assert.equal(metrics[13].x,243);assert.equal(metrics[7].dim,.6);
 assert.equal(await run(`document.querySelector('[data-voice="VAva"]').tabIndex`),-1);
 await run(`document.querySelector('[aria-label="Next voice"]').click()`);await delay(240);assert.equal(await run('carousel.value'),'VDoyle');
 await run(`document.querySelector('[aria-label="Previous voice"]').click()`);await delay(240);assert.equal(await run('carousel.value'),'VDaniel');
 await run(`document.querySelector('[data-voice="VSophia"]').click()`);await delay(240);assert.equal(await run('carousel.value'),'VSophia');
 assert.deepEqual(await run('changes'),['VDoyle','VDaniel','VSophia']);
 await run(`carousel.setSelected('VMichael')`);assert.equal(await run('carousel.value'),'VMichael');assert.equal(await run('changes.length'),3);
 await run(`document.querySelector('[aria-label="Next voice"]').click()`);await delay(240);assert.equal(await run('carousel.value'),'VDaniel');
 const point=await run(`(()=>{const r=document.querySelector('[data-voice="VDaniel"]').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 const mouse=async(type,x,y,buttons=0)=>cmd('Input.dispatchMouseEvent',{type,x,y,button:type==='mouseMoved'?'none':'left',buttons,clickCount:type==='mouseMoved'?0:1},sessionId);
 await mouse('mousePressed',point.x,point.y,1);await mouse('mouseMoved',point.x-110,point.y,1);await mouse('mouseReleased',point.x-110,point.y);await delay(240);
 assert.equal(await run('carousel.value'),'VDoyle');assert.equal(await run('changes.length'),5);
 await run(`document.querySelector('[aria-label="Next voice"]').focus()`);await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'},sessionId);await cmd('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);await delay(240);assert.equal(await run('carousel.value'),'VGreg');
 await run(`carousel.setSelected('VDaniel');document.querySelector('#carousel').style.transform='scale(.5)';document.querySelector('#carousel').style.transformOrigin='top left'`);
 const scaled=await run(`(()=>{const r=document.querySelector('[data-voice="VDaniel"]').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 const before=await run('changes.length');await mouse('mousePressed',scaled.x,scaled.y,1);await mouse('mouseMoved',scaled.x-55,scaled.y,1);await mouse('mouseReleased',scaled.x-55,scaled.y);await delay(240);assert.equal(await run('carousel.value'),'VDoyle');assert.equal(await run('changes.length'),before+1);
 await run(`carousel.destroy();window.dispatchEvent(new PointerEvent('pointerup',{pointerId:1,clientX:5}))`);assert.equal(await run(`document.querySelector('#carousel').children.length`),0);
 console.log('PASS headless actual DOM:14 exact native portraits,center/side geometry,dim cap,arrows,side selection,wrap,110px drag,keyboard button activation,non-notifying reset and teardown');
}finally{
 if(ws&&ws.readyState===WebSocket.OPEN){const closed=once(ws,'close');ws.close();await closed}
 if(chrome&&chrome.exitCode===null&&chrome.signalCode===null){const ended=once(chrome,'exit');chrome.kill();await ended}
 await new Promise(resolve=>server.close(resolve));rmSync(directory,{recursive:true,force:true});
}
