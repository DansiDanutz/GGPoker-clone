// One UI step per poll; requests observe state, all player actions use controls.
(async()=>{
 const $=s=>document.querySelector(s), phase=window.nativePhase;
 if(phase==='owner'){
  if(!document.querySelector('form')?.onsubmit)return;
  if(!window.nativeSubmitted){window.nativeSubmitted=true;$('#key').value=window.nativeKey;$('#id').value='native-hand';$('#name').value='Native hand';$('#stack').value='120';$('#cardSqueeze').checked=true;document.querySelector('form').requestSubmit()}
  if($('#result').textContent.includes('Saved')){
   if(!window.nativeBackupMade){window.nativeBackupMade=true;$('#createBackup').click();return}
   if($('#backupStatus').textContent.startsWith('Backup created:')&&!window.nativeBackupVerified){window.nativeBackupVerified=true;$('#backupList button').click();return}
   if($('#backupStatus').textContent.startsWith('Integrity verified:'))window.nativeResult={next:'lobby'};
  }
 }else if(phase==='lobby'){
  if(!$('#holdem')?.onclick)return;
  if(!window.nativeCustomStarted){window.nativeCustomStarted=true;$('#profile').click();const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle='#318da8';ctx.fillRect(0,0,64,64);const bytes=Uint8Array.from(atob(canvas.toDataURL('image/png').split(',')[1]),c=>c.charCodeAt(0)),transfer=new DataTransfer();transfer.items.add(new File([bytes],'native-avatar.png',{type:'image/png'}));const file=$('input[type=file]');file.files=transfer.files;file.dispatchEvent(new Event('change',{bubbles:true}));return}
  if($('#profileError')?.textContent&&!$('#profileError').textContent.startsWith('Preview only')){const bytes=Uint8Array.from(atob($('#profilePreview').src.split(',')[1]),c=>c.charCodeAt(0)),view=new DataView(bytes.buffer),chunks=[];for(let i=8;i+12<=bytes.length;){const size=view.getUint32(i);chunks.push([String.fromCharCode(...bytes.slice(i+4,i+8)),size]);i+=12+size}throw Error('Native avatar: '+$('#profileError').textContent+' · IHDR '+JSON.stringify([...bytes.slice(16,29)])+' · '+JSON.stringify(chunks))}
  if(!$('#profilePane').hidden){if(!window.nativeCustomApplied&&$('#profilePreview').src.startsWith('data:image/png')&&!$('#applyAvatar').disabled){window.nativeCustomApplied=true;$('#applyAvatar').click()}return}
  if(!window.nativeCustomApplied||!$('.localProfileAvatar').style.backgroundImage.includes('/local/avatar-images/'))return;
  if(!window.nativeSpinChecked){window.nativeSpinChecked=true;$('#spin').click();if($('#spinPane').hidden)throw Error('Native Spin information pane did not open');$('button[aria-label="Information for 10,000 Spin"]').click();[...document.querySelectorAll('#spinInfoTabs button')].find(b=>b.textContent==='Payout').click();if(document.querySelectorAll('#spinInfoBody tbody tr').length!==8||$('#spinInfoBody tbody tr').children[1].textContent!=='100,000,000')throw Error('Native Spin payout table mismatch');[...document.querySelectorAll('#spinInfoTabs button')].find(b=>b.textContent==='Blind Structure').click();if(document.querySelectorAll('#spinInfoBody tbody tr').length!==26)throw Error('Native Spin blind table mismatch');$('#closeSpinInfo').click();if(!$('#spinOverlay').hidden||$('#spinPane').inert)throw Error('Native Spin modal failed to release focus')}
  $('#holdem').click();window.nativeResult={next:'list'};
 }else if(phase==='list'){
  const row=$('#groups button[aria-label="Native hand · hosted"]');if(!row)return;
  $('#tableView').click();row.click();$('#takeSeat').click();
 }else if(phase==='hand'){
  if(!$('#invite')?.value)return;
  if(!$('#join').hidden){if($('#join').onsubmit&&!window.nativeJoined){window.nativeJoined=true;$('#join').requestSubmit()}return}
  const id=location.hash.slice(1),r=await fetch('/api/rooms/'+id+'/state',{headers:{Authorization:'Bearer '+sessionStorage.getItem('river-seat:'+id)}}),s=await r.json();
  if(window.nativeAudioStarts===undefined){
   window.nativeAudioStarts=0;window.nativeAudioSignal={decodedPeak:0,renderPeak:0,polls:0,shuffleStarts:0};
   const start=AudioBufferSourceNode.prototype.start;
   AudioBufferSourceNode.prototype.start=function(...args){
    if(this.buffer?.duration>0){if(Math.abs((args[2]||0)-9216/44100)<.001)window.nativeAudioSignal.shuffleStarts++;window.nativeAudioStarts++;for(let channel=0;channel<this.buffer.numberOfChannels;channel++)for(const sample of this.buffer.getChannelData(channel))window.nativeAudioSignal.decodedPeak=Math.max(window.nativeAudioSignal.decodedPeak,Math.abs(sample))}
    return start.apply(this,args);
   };
   const createGain=AudioContext.prototype.createGain;
   AudioContext.prototype.createGain=function(...args){
    const ctx=this,gain=createGain.apply(ctx,args),analyser=ctx.createAnalyser(),connect=gain.connect;analyser.fftSize=2048;
    gain.connect=function(destination,...rest){if(destination===ctx.destination){analyser.connect(destination);return connect.call(gain,analyser,...rest)}return connect.call(gain,destination,...rest)};
    window.nativeAudioAnalyser=analyser;if(!window.nativeShuffleMeter)window.nativeShuffleMeter=setInterval(()=>{const samples=new Float32Array(2048);analyser.getFloatTimeDomainData(samples);for(const sample of samples)window.nativeAudioSignal.renderPeak=Math.max(window.nativeAudioSignal.renderPeak,Math.abs(sample))},10);return gain;
   };
  }
  if(window.nativeAudioAnalyser){const signal=new Float32Array(2048);window.nativeAudioAnalyser.getFloatTimeDomainData(signal);window.nativeAudioSignal.polls++;for(const sample of signal)window.nativeAudioSignal.renderPeak=Math.max(window.nativeAudioSignal.renderPeak,Math.abs(sample))}

  if(!window.nativePopupGuardsChecked){for(const [url,name] of [['http://127.0.0.1:1/network.html?panel=chat','wrong-origin'],['/lobby.html?panel=chat','wrong-path'],['/network.html?panel=other','wrong-panel'],['/playgg.html?panel=chat','wrong-settings-panel'],['/network.html?panel=settings','wrong-settings-path']])if(window.open(url,'native-qa-'+name))throw Error('Native popup boundary accepted '+name);window.nativePopupGuardsChecked=true}
  if(!window.nativeChatRequested){window.nativeChatRequested=true;const open=window.open;window.open=function(...args){return window.nativeChatWindow=open.apply(this,args)};$('#openChat').click();window.open=open;return}
  if(!window.nativeChatVerified){const chat=window.nativeChatWindow;if(!chat||chat.closed)throw Error('Native chat window did not open');if(!chat.document.querySelector('#chatForm')?.onsubmit||chat.document.querySelector('#chatForm').hidden||chat.document.querySelector('#chatText').disabled)return;chat.document.querySelector('#chatText').value='Native detached chat';chat.document.querySelector('#chatForm').requestSubmit();window.nativeChatVerified=true;return}
  if(!window.nativeChatClosed){if(!$('#chatMessages').textContent.includes('Native detached chat'))return;window.nativeChatWindow.close();window.nativeChatClosed=true}
  if(!window.nativeSettingsRequested){window.nativeSettingsRequested=true;const open=window.open;window.open=function(...args){return window.nativeSettingsWindow=open.apply(this,args)};$('#tableSettings').open=true;$('#tableGameSettings').click();window.open=open;return}
  if(!window.nativeSettingsVerified){const settings=window.nativeSettingsWindow;if(!settings||settings.closed)throw Error('Native Game Settings window did not open');const d=settings.document;if(!d.querySelector('#applyChipSettings')?.onclick||d.querySelector('#chipSettings').hidden)return;if(settings.document.title!=='Game Settings')throw Error('Native Game Settings title mismatch');if(!d.querySelector('#shuffleAtlas')?.complete||d.querySelector('#shuffleAtlas').naturalWidth!==2320)return;if(!window.nativeShufflePreviewVerified){[...d.querySelectorAll('#settingsSidebar button')].find(b=>b.textContent==='Chip Shuffle').click();d.querySelector('#shuffleTest').click();d.querySelector('#shufflePreview').dispatchEvent(new settings.WheelEvent('wheel',{deltaY:-1,cancelable:true}));if(d.querySelector('#shufflePreview').dataset.frame!=='52')throw Error('Native Chip Shuffle wheel frame mismatch');window.nativeShufflePreviewVerified=true;return;}[...d.querySelectorAll('#settingsSidebar button')].find(b=>b.textContent==='Betting options').click();d.querySelector('#dontRoundBlind').click();d.querySelector('#applyChipSettings').click();window.nativeSettingsVerified=true;return}
  if(!window.nativeSettingsWindow.closed)return;
  if(JSON.parse(localStorage.getItem('river-bet-presets')).dontRoundBlind!==false)throw Error('Native detached setting did not update table preferences');
  if(!window.nativeFrontSelected){window.nativeFrontSelected=true;$('#feltColour').value='cyan';$('#feltColour').dispatchEvent(new Event('change'));$('#cardFront').value='four-colour';$('#cardFront').dispatchEvent(new Event('change'));return}
  if(document.documentElement.dataset.cardFront!=='four-colour'||$('.felt').dataset.feltColour!=='cyan')return;
  if(!window.nativeSeatShuffleStarted){if($('#shuffleChips').disabled)return;window.nativeSeatShuffleStarted=true;$('#tableSettings').open=true;$('#shuffleChips').click();$('#tableSettings').open=false;return}
  if(!window.nativeSeatShuffleVerified){const art=$('.chipShuffleArt:not(.remoteShuffle)');if(art?.dataset.active!=='true')throw Error('Native seated shuffle did not start');art.dispatchEvent(new WheelEvent('wheel',{deltaY:-1,cancelable:true}));if(Number(art.dataset.frame)<=37)throw Error('Native seated shuffle wheel did not move');window.nativeSeatShuffleVerified=true;}

  if(!window.nativeAudioSignal.shuffleStarts||!window.nativeAudioSignal.renderPeak)return;
  if(!s.hand){[...document.querySelectorAll('#actions button')].find(b=>/^Fill empty/.test(b.textContent))?.click();return}
  if(!window.nativeSqueezeVerified){const panel=$('.cardSqueeze');if(window.nativeSqueezeOpening&&!panel)window.nativeSqueezeVerified=true;else{if(!panel||panel.getAttribute('aria-busy')!=='false')return;if(!window.nativeSqueezeOpening){if(getComputedStyle($('.s0>.cards')).visibility!=='hidden'||getComputedStyle($('#actions')).visibility!=='hidden')throw Error('Native squeeze did not conceal cards/actions');window.nativeSqueezeOpening=true;panel.querySelector('button').click()}return}}
  if(!getComputedStyle($('.s0 .card')).backgroundImage.includes('native-card-faces-four-colour'))throw Error('Native four-colour appearance not rendered');
  if(typeof s.avatars[s.me]!=='string'||!document.querySelector('.seat[data-seat=\"'+s.me+'\"] .portrait').style.backgroundImage.includes('/local/avatar-images/'))throw Error('Native custom avatar did not follow account into seat');
  if(s.names.filter(Boolean).length!==6)throw Error('Expected six players');
  if(!window.nativeMounted){window.nativeMounted=[...document.querySelectorAll('.seat')].map(seat=>({seat,portrait:seat.querySelector('.portrait'),card:seat.querySelector('.card')}))}
  else for(const [i,mounted] of window.nativeMounted.entries()){const seat=document.querySelectorAll('.seat')[i];if(seat!==mounted.seat||seat.querySelector('.portrait')!==mounted.portrait||mounted.card&&seat.querySelector('.card')!==mounted.card)throw Error('Native table remounted seat/avatar/dealt card at '+i)}
  if(!s.hand.end&&s.hand.turn!==s.me&&!$('#reservedActions').hidden){const b=$('#reservedActions button:not([hidden])'),r=b.getBoundingClientRect(),f=$('.felt').getBoundingClientRect(),scale=f.width/1700;if(Math.abs(r.width-204*scale)>.2||Math.abs(r.x-f.x-1035*scale)>.2||r.bottom>innerHeight||!getComputedStyle(b).borderImageSource.includes('native-reserved-background.png'))throw Error('Native reserved artwork/position/bounds mismatch');window.nativeReservedArtVerified=true}
  if(!s.hand.end){if(s.hand.turn===s.me)[...document.querySelectorAll('#actions button')].find(b=>/^(Check|Call)/.test(b.textContent))?.click();return}
  if(!window.nativeReservedArtVerified)throw Error('Native reserve controls were not observed');
  if(!window.nativeAudioStarts)throw Error('Native WebKit did not start any decoded table audio');
  if(!(window.nativeAudioSignal.decodedPeak>0&&window.nativeAudioSignal.renderPeak>0))throw Error('Native audio signal not established: '+JSON.stringify(window.nativeAudioSignal));
  if(document.querySelectorAll('.seat .card').length!==12||!$('.award'))return;
  for(const seat of document.querySelectorAll('.seat')){const cards=seat.querySelector('.cards'),plate=seat.querySelector('.plate');if(cards&&cards.getBoundingClientRect().bottom>plate.getBoundingClientRect().top+1)throw Error('Cards overlap nickname at seat '+seat.dataset.seat)}
  window.nativeResult={next:'settled',state:s,url:location.href,audioStarts:window.nativeAudioStarts,audioSignal:window.nativeAudioSignal};
 }else if(phase==='recover'){
  if(!$('#invite')?.value)return;
  if(!$('#join').hidden){if($('#join').onsubmit&&!window.nativeJoined){window.nativeJoined=true;$('#join').requestSubmit()}return}
  const id=location.hash.slice(1),r=await fetch('/api/rooms/'+id+'/state',{headers:{Authorization:'Bearer '+sessionStorage.getItem('river-seat:'+id)}}),s=await r.json();
  if(localStorage.getItem('river-felt-colour:'+location.hash.slice(1))!=='cyan')throw Error('Felt preference lost on native relaunch');if(localStorage.getItem('river-card-front')!=='four-colour')throw Error('Card-front preference lost on native relaunch');if(document.documentElement.dataset.cardFront!=='four-colour'||$('.felt').dataset.feltColour!=='cyan')return;
  if(s.hand?.end&&s.me===0)window.nativeResult={next:'recovered',state:s};
 }
})().catch(e=>window.nativeResult={error:e.message});
