import assert from 'node:assert/strict';
const {tournamentResult}=await import('./tournament-result.mjs');
assert.equal(typeof tournamentResult,'function');
const s={me:0,names:['Alice','Bob','Carol'],settings:{name:'Local final'},tournamentEntryPaid:true,tournament:{startedAt:160000,actualStartedAt:100000,finishedAt:null,eliminatedAt:[165000,null,null],out:[2,null,null],finishes:[3,null,null],winner:null,pool:111,entry:37,prizeShares:[70,30],prizes:null}};
const before=JSON.stringify(s),zero=tournamentResult(s,'room');assert.equal(zero.place,3);assert.equal(zero.prize,0);assert.equal(zero.completedAt,165000);assert.equal(zero.elapsedSeconds,65);assert.equal(zero.startedAt,100000,'Use actual start, not the pause-adjusted blind clock');assert.equal(zero.walletCredited,false);assert.equal(JSON.stringify(s),before);
const paid=structuredClone(s);paid.me=1;paid.tournament.out=[2,4,null];paid.tournament.finishes=[3,2,null];paid.tournament.eliminatedAt[1]=170000;const pending=tournamentResult(paid,'room');assert.equal(pending.place,2);assert.equal(pending.prize,33);assert.equal(pending.settled,false);assert.equal(pending.walletCredited,false);
paid.tournament.winner=2;paid.tournament.finishes=[3,2,1];paid.tournament.prizes=[0,33,78];paid.tournament.finishedAt=175000;paid.tournament.walletSettled=true;const settled=tournamentResult(paid,'room');assert.equal(settled.prize,33);assert.equal(settled.walletCredited,true);assert.equal(settled.key,pending.key,'Settlement updates the same result');
paid.me=2;const winner=tournamentResult(paid,'room');assert.equal(winner.won,true);assert.equal(winner.completedAt,175000);assert.equal(winner.prize,78);
assert.equal(tournamentResult({...paid,me:null},'room'),null);assert.equal(tournamentResult({...paid,tournament:null},'room'),null);assert.equal(tournamentResult({...paid,me:7},'room'),null);assert.equal(tournamentResult({...s,me:1},'room'),null);
const invalid=structuredClone(paid);invalid.tournament.prizes=[0,33,99];assert.equal(tournamentResult(invalid,'room'),null,'Inconsistent prizes cannot become a displayed award');
const swapped=structuredClone(paid);swapped.tournament.prizes=[0,78,33];assert.equal(tournamentResult(swapped,'room'),null,'Conserved but misassigned prizes cannot become displayed awards');
const legacy=structuredClone(s);delete legacy.tournament.actualStartedAt;delete legacy.tournament.eliminatedAt;const unknown=tournamentResult(legacy,'room');assert.equal(unknown.startedAt,null);assert.equal(unknown.elapsedSeconds,null,'Unknown historical timing never becomes1970 or the blind schedule');
console.log('PASS tournament result model: own-only eligibility,zero/pending/settled awards,111-credit conservation,actual timing,stable key,legacy uncertainty and immutable reads');

// Minimal DOM verifies lifecycle; pixel rendering still requires Chrome verification.
class Node{
 constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.hidden=false;this.open=false}
 append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node)}}
 setAttribute(key,value){this[key]=value}
 getAttribute(key){return this[key]??null}
 showModal(){this.open=true}
 close(){this.open=false}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this)}
 querySelector(selector){const cls=selector.slice(1);for(const node of this.children){if(node.className===cls)return node;const child=node.querySelector(selector);if(child)return child}return null}
}
const listeners={},body=new Node('body');globalThis.document={body,visibilityState:'visible',createElement:tag=>new Node(tag),addEventListener:(name,fn)=>listeners[name]=fn};
const {installTournamentResult}=await import('./tournament-result.mjs'),settings=new Node('section');let context={state:paid,room:'room',token:'private',animating:true},histories=0;
const sounds=[];let stopped=0;const play=(names,current)=>{const sound={names,current};sounds.push(sound);return new Promise(resolve=>sound.resolve=()=>resolve(()=>stopped++))};
const ui=installTournamentResult(settings,()=>context,()=>histories++,value=>'/avatar-'+value,play);ui.refresh();assert.equal(body.children.length,0,'Reward waits for chip movement');
context.animating=false;ui.refresh();let popup=body.children[0];assert.ok(popup.open);assert.equal(popup.querySelector('.resultAvatar').getAttribute('src'),'/avatar-0');assert.equal(popup.querySelector('.resultPrize').textContent,'78 play credits');ui.refresh();assert.equal(body.children[0],popup,'Polling preserves the same window');
context.animating=true;ui.refresh();assert.equal(body.children.length,0,'Later chip movement also clears an open result');context.animating=false;ui.refresh();popup=body.children[0];
popup.querySelector('.resultClose').onclick();ui.refresh();assert.equal(body.children.length,0,'Close survives polling');settings.children[0].onclick();popup=body.children[0];popup.querySelector('.resultLastHand').onclick();assert.equal(histories,1);assert.equal(body.children.length,0);
settings.children[0].onclick();context.token='replacement';context.state=null;ui.refresh();assert.equal(body.children.length,0,'Identity loss clears private results');assert.equal(settings.children[0].hidden,true);
context={state:paid,room:'room',token:'replacement',animating:false};document.visibilityState='hidden';ui.refresh();assert.equal(body.children.length,0);document.visibilityState='visible';listeners.visibilitychange();assert.ok(body.children[0].open);
console.log('PASS result window lifecycle: chip-animation gate,stable polling,close,reopen,last-hand callback,identity cleanup and hidden-page deferral');

assert.ok(sounds.every(s=>s.names[0]==='TournamentResultFT'));const oldSound=sounds[0];assert.equal(oldSound.current(),false,'Closed window invalidates pending decode');oldSound.resolve();await Promise.resolve();assert.equal(stopped,1,'Late decoded source is stopped');const liveSound=sounds.at(-1);assert.equal(liveSound.current(),true);liveSound.resolve();await Promise.resolve();body.children[0].querySelector('.resultClose').onclick();assert.equal(stopped,2,'Close stops current reward audio');console.log('PASS reward audio lifecycle: winner cue,late-decode guard and active-source stop');

context.state=s;ui.refresh();assert.equal(sounds.at(-1).names[0],'TournamentFallResult');body.children[0].querySelector('.resultClose').onclick();context.state={...paid,me:1};ui.refresh();assert.equal(sounds.at(-1).names[0],'TournamentResultITM');body.children[0].querySelector('.resultClose').onclick();console.log('PASS reward cue mapping: zero award elimination and paid-place ITM');

const {resultFileName}=await import('./tournament-result.mjs');assert.equal(resultFileName({title:'Local final',place:2},new Date('2026-11-14T12:07:00Z')),'2026-11-14_ 12-07_PM_Local final_2.png');assert.equal(resultFileName({title:'A/B:Game',place:1},new Date('2026-11-14T00:02:00Z')),'2026-11-14_ 12-02_AM_A_B_Game_1.png');assert.throws(()=>resultFileName({place:0}),/Invalid result export/);console.log('PASS native UTC result filenames:noon,midnight,rank and local filename sanitization');
