import {readHotkeys,readHotkeyGroups} from './hotkey-bindings.mjs';
import {installHotkeySettings} from './hotkey-settings.mjs';
import {installAudio,audioChannels,readAudioChannel,audioPreviewChoices} from './table-audio.mjs';
import {readChipShuffle,createChipShuffle} from './chip-shuffle.mjs';
import {openingChoices,normalChoices,readBettingPreferences} from './betting-preferences.mjs';
import {setupSpin} from './spin-lobby.mjs';
import {updateElement,avatarSource,tableThemes,tableTheme,feltColours,feltColour,tableSurface,cardBacks,cardBack,cardFronts,cardFront,cards} from './felt.mjs';
const settingsWindow=new URLSearchParams(location.search).get('panel')==='settings';
const requirePlayer=new URLSearchParams(location.search).has('player'),identity=await fetch('/local/me');
const player=identity.ok?await identity.json():null,journey=!!player;
if(requirePlayer&&!player){location.replace('/launch.html');throw Error('Sign in locally')}
import {carouselIndex} from './playgg-carousel.mjs';
const $=id=>document.getElementById(id);
const parts=await (await fetch('/home-art/layout.json')).json(),audit=await (await fetch('/home-art/checks.json')).json();
const art='/home-art/',still=new URLSearchParams(location.search).has('still');let slide=6,collapsed=false,paused=false;
let spinUI;
const frame=$('stage'),feed=$('feed'),canvas=$('canvas');
function size(){const cash=!!$('spinPane')&&!$('spinPane').hidden||!$('profilePane').hidden||!$('chipSettings').hidden||!$('catalog').hidden&&['holdem','plo','shortdeck','aof','rush','tournaments'].includes($('catalog').dataset.mode);const scale=cash?innerWidth/1196:Math.min(innerWidth/1196,innerHeight/929);frame.style.transform='scale('+scale+')';frame.style.setProperty('--catalog-height',innerHeight/scale+'px')}size();addEventListener('resize',size);
function box(node,x,y,w,h){Object.assign(node.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'})}
const homePreferences=[['homeSound','river-muted',true],['homeHotkeys','river-hotkeys',false],['homeChips','river-chip-switch',false]];
for(const [id,key,inverted] of homePreferences){const input=$(id);input.checked=inverted?localStorage.getItem(key)!=='1':localStorage.getItem(key)==='1';input.onchange=()=>localStorage.setItem(key,String(Number(inverted?!input.checked:input.checked)))}
function closeHomeSettings(){$('homeSettings').hidden=true;$('settings').focus()}
const homeOpenBB=$('homeOpenBB');
homeOpenBB.checked=localStorage.getItem('river-open-bb')!=='0';homeOpenBB.disabled=!$('homeChips').checked;
homeOpenBB.onchange=()=>localStorage.setItem('river-open-bb',homeOpenBB.checked?'1':'0');
const saveChipSwitch=$('homeChips').onchange;
$('homeChips').onchange=()=>{saveChipSwitch();homeOpenBB.disabled=!$('homeChips').checked};
$('closeSettings').onclick=closeHomeSettings;
const settingsNames=['Betting options','Buy-in settings','Card Squeeze','Chip Shuffle','Device access','Hotkey','Language','Smart Focus','Sound','Switch Chip Display','Table Theme','Time Bank Card'];
const content=$('chipSettings').querySelector('.settingsContent'),chipOptions=document.createElement('div');chipOptions.id='chipOptions';
for(const child of [...content.children])if(!child.matches('.settingsConfirm,.settingsScope'))chipOptions.append(child);
content.prepend(chipOptions);
const bettingOptions=document.createElement('div');bettingOptions.id='bettingOptions';bettingOptions.hidden=true;
bettingOptions.innerHTML='<h2>Betting options</h2><p><label>Mouse Wheel <select id="wheelIncrease"><option value="1">Scroll up to increase</option><option value="0">Scroll up to decrease</option></select></label></p><p><label>Enter bet confirmation <select id="confirmBet"><option value="1">Always confirm</option><option value="0">Never confirm</option></select></label></p><p>These preferences apply to your local tables.</p>';
bettingOptions.querySelector('h2').textContent='Betting';
const unitLabel=document.createElement('label');unitLabel.innerHTML='Adjust bet size with <select id="wheelUnit"><option value="bb">Big Blind</option><option value="sb">Small Blind</option></select>';bettingOptions.insertBefore(unitLabel,bettingOptions.children[1]);
const bettingBase=document.createElement('div');bettingBase.id='bettingBase';
for(const id of ['wheelUnit','wheelIncrease','confirmBet']){const select=$(id)||bettingOptions.querySelector('#'+id),label=select.closest('label'),row=label.closest('p')||label;bettingBase.append(row);select.hidden=true;const buttons=document.createElement('span');buttons.className='bettingPreferenceButtons';buttons.setAttribute('role','group');buttons.setAttribute('aria-label',label.firstChild.textContent.trim());for(const option of select.options){const button=document.createElement('button');button.type='button';button.textContent=option.textContent;button.dataset.value=option.value;button.onclick=()=>{select.value=option.value;select.dispatchEvent(new Event('change'))};buttons.append(button)}label.append(buttons)}bettingOptions.append(bettingBase);bettingOptions.querySelector('p')?.remove();
const presetHeading=document.createElement('h3');presetHeading.textContent='Bet Amount Shortcut';bettingOptions.append(presetHeading);
const shortcutPreview=new Image();shortcutPreview.id='bettingShortcutPreview';shortcutPreview.src='/home-art/betting-shortcuts-preview.png';shortcutPreview.alt='Illustration of four bet amount shortcuts and the bet slider';bettingOptions.append(shortcutPreview);
const presetGrid=document.createElement('table');presetGrid.id='presetGrid';presetGrid.innerHTML='<thead><tr><th></th>'+[1,2,3,4].map(i=>'<th>Button '+i+'</th>').join('')+'</tr></thead>';
for(const [kind,title,choices]of [['opening','Opening Bet Size',openingChoices],['normal','Normal Bet Size',normalChoices]]){const row=document.createElement('tr'),heading=document.createElement('th');heading.textContent=title;row.append(heading);for(let i=0;i<4;i++){const cell=document.createElement('td'),select=document.createElement('select');select.id=kind+'Preset'+i;select.setAttribute('aria-label',title+' button '+(i+1));for(const value of choices)select.add(new Option(value==='pot'?'Pot':value==='max'?'Max':value+(kind==='opening'?'BB':'%'),String(value)));cell.append(select);row.append(cell)}presetGrid.append(row)}bettingOptions.append(presetGrid);
const rounding=document.createElement('label');rounding.className='roundingEvidence';rounding.innerHTML='<input id="dontRoundBlind" type="checkbox"> Don’t round to nearest blind';bettingOptions.append(rounding);
content.insertBefore(bettingOptions,content.querySelector('.settingsConfirm'));
function bettingDraft(){return {opening:[0,1,2,3].map(i=>{const v=$('openingPreset'+i).value;return v==='pot'?v:Number(v)}),normal:[0,1,2,3].map(i=>{const v=$('normalPreset'+i).value;return v==='max'?v:Number(v)}),unit:$('wheelUnit').value,dontRoundBlind:$('dontRoundBlind').checked}}

const squeezeOptions=document.createElement('div');squeezeOptions.id='squeezeOptions';squeezeOptions.hidden=true;
squeezeOptions.innerHTML='<h2>Card Squeeze <input id="squeezeEnabled" type="checkbox" aria-label="Enable Card Squeeze"></h2><div class="squeezeConfig"><p id="squeezeExplanation"></p><p>Open/Squeeze options and preference settings are not provided for board cards.</p><div class="squeezeGuide"><img src="/home-art/native-squeeze-guide-base.png" alt="Face-down hole cards in the Squeeze area"><span class="squeezeHero">Player 2<br><b>$50</b></span><span class="squeezeLeft">Player 3<br><b>$50</b></span><span class="squeezeRight">Player 1<br><b>$50</b></span><img src="/home-art/native-squeeze-guide-over.png" alt="Squeeze interaction illustration"></div></div>';
content.insertBefore(squeezeOptions,content.querySelector('.settingsConfirm'));
function renderSqueezeDraft(){const enabled=$('squeezeEnabled').checked;$('squeezeExplanation').textContent=enabled?'Hole cards are dealt face-down on the Squeeze area. You can squeeze these cards to open them for added excitement.':'Squeeze area is not shown and hole cards are dealt face-up.';squeezeOptions.querySelector('.squeezeGuide').hidden=!enabled}
$('squeezeEnabled').onchange=()=>{chipDraftTouched=true;renderSqueezeDraft();chipDraftChanged()};

const shuffleOptions=document.createElement('div');shuffleOptions.id='shuffleOptions';shuffleOptions.hidden=true;
shuffleOptions.innerHTML='<h2>Chip Shuffle <input id="shuffleEnabled" type="checkbox" aria-label="Enable Chip Shuffle"></h2><div class="shuffleConfig"><p>Choose your chip shuffling preferences.</p><label>Direction <select id="shuffleDirection"><option value="0">Scroll Up to Shuffle</option><option value="1">Scroll Down to Shuffle</option></select></label><label>Sensitivity <select id="shuffleSensitivity"><option value="0">Low</option><option value="1">Normal</option><option value="2">High</option></select></label><div class="shuffleSample"><strong>Press the button to enable chip shuffling</strong><img class="shuffleSampleBg" src="/home-art/native-shuffle-preview.png" alt="Native player preview"><div id="shufflePreview" role="img" aria-label="Chip Shuffle preview"><img id="shuffleAtlas" src="/home-art/native-chip-shuffle.png" alt="" hidden></div><button id="shuffleTest" type="button" aria-label="Test Chip Shuffle"><img src="/home-art/native-shuffle-control-enabled.png" alt=""></button><small>Test out your preferences here</small></div></div>';
content.insertBefore(shuffleOptions,content.querySelector('.settingsConfirm'));
for(const id of ['shuffleDirection','shuffleSensitivity']){const select=shuffleOptions.querySelector('#'+id);select.hidden=true;const group=document.createElement('span');group.className='shuffleChoices';for(const option of select.options){const button=document.createElement('button');button.type='button';button.textContent=option.textContent;button.dataset.value=option.value;button.onclick=()=>{select.value=option.value;select.dispatchEvent(new Event('change'))};group.append(button)}select.parentNode.append(group)}

function savedShuffle(){return readChipShuffle(localStorage.getItem('river-chip-shuffle'))}
function shuffleDraft(){return {enabled:$('shuffleEnabled').checked,direction:Number($('shuffleDirection').value),sensitivity:Number($('shuffleSensitivity').value)}}
const previewShuffleAudio=installAudio();
const shuffleController=createChipShuffle($('shufflePreview'),shuffleDraft,renderShuffleDraft,previewShuffleAudio);
function stopShufflePreview(){shuffleController.stop()}
function renderShuffleDraft(){const enabled=$('shuffleEnabled').checked;for(const id of ['shuffleDirection','shuffleSensitivity']){$(id).disabled=!enabled;for(const b of $(id).parentNode.querySelectorAll('button')){b.disabled=!enabled;b.setAttribute('aria-pressed',String(b.dataset.value===$(id).value))}}if(!enabled)stopShufflePreview();$('shuffleTest').disabled=!enabled||$('shufflePreview').dataset.active==='true';const icon=$('shuffleTest').querySelector('img'),src='/home-art/native-shuffle-control-'+($('shuffleTest').disabled?'disabled':'enabled')+'.png';if(icon.getAttribute('src')!==src)icon.src=src;$('shufflePreview').style.opacity=enabled?'1':'.3'}
$('shuffleTest').onclick=()=>shuffleController.start();
for(const id of ['shuffleEnabled','shuffleDirection','shuffleSensitivity'])$(id).onchange=()=>{chipDraftTouched=true;renderShuffleDraft();chipDraftChanged()};

const soundOptions=document.createElement('div');soundOptions.id='soundOptions';soundOptions.hidden=true;
soundOptions.innerHTML='<h2>Sound</h2><p><label>Master Volume <input id="masterVolume" type="range" min="0" max="100" step="1" aria-label="Master Volume"><output id="volumeValue"></output></label></p><p><label><input id="tableMuted" type="checkbox"> Mute all sound</label></p>';
for(const channel of audioChannels){const row=document.createElement('p');row.className='audioChannel';row.innerHTML='<label><input id="audio-'+channel.id+'-enabled" type="checkbox"> '+channel.label+'</label><input id="audio-'+channel.id+'-volume" type="range" min="0" max="100" step="1" aria-label="'+channel.label+' volume"><output id="audio-'+channel.id+'-value"></output>';soundOptions.append(row)}
let soundPreviewChannel=null,lastSoundPreview=null,soundPreviewRequest=0;
const soundPreviewStatus=document.createElement('p');soundPreviewStatus.setAttribute('role','status');soundPreviewStatus.id='soundPreviewStatus';soundOptions.append(soundPreviewStatus);
function stopSoundPreview(){soundPreviewRequest++;soundPreviewChannel=null;previewShuffleAudio.stopPreview();soundPreviewStatus.textContent=''}
for(const c of audioChannels){const b=document.createElement('button'),image=new Image();b.type='button';b.id='audio-'+c.id+'-preview';b.className='audioPreview';b.setAttribute('aria-label','Preview '+c.label);image.src='/home-art/native-sound-preview.png';image.alt='';b.append(image);soundOptions.querySelector('#audio-'+c.id+'-enabled').parentNode.after(b);b.onclick=async()=>{const volume=Number($('audio-'+c.id+'-volume').value);if($('tableMuted').checked||volume<=0)return;const request=++soundPreviewRequest,choices=audioPreviewChoices(c.id,lastSoundPreview),cue=choices[Math.floor(Math.random()*choices.length)];lastSoundPreview=cue;soundPreviewChannel=c.id;b.dataset.cue=cue;const current=()=>request===soundPreviewRequest&&soundPreviewChannel===c.id&&!soundOptions.hidden&&!$('chipSettings').hidden&&!$('tableMuted').checked;soundPreviewStatus.textContent='Preview: '+c.label;const started=await previewShuffleAudio.preview(cue,volume,current);if(!started&&current())soundPreviewStatus.textContent='Sound preview unavailable.'}}
const audioDraft=()=>audioChannels.map(c=>({enabled:$('audio-'+c.id+'-enabled').checked,volume:Number($('audio-'+c.id+'-volume').value)}));
const audioPreferenceKeys=audioChannels.flatMap(c=>['river-audio-'+c.id+'-volume','river-audio-'+c.id+'-enabled']);
content.insertBefore(soundOptions,content.querySelector('.settingsConfirm'));
const hotkeyOptions=document.createElement('div');hotkeyOptions.id='hotkeyOptions';hotkeyOptions.hidden=true;
hotkeyOptions.innerHTML='<h2>Hotkey</h2><p><label><input id="detailHotkeys" type="checkbox"> Use Hotkey</label></p><p><label><input id="showHotkeys" type="checkbox"> Display Hotkey on screen</label></p><dl><dt>F1</dt><dd>Fold</dd><dt>F2</dt><dd>Check / Call</dd><dt>F3</dt><dd>Bet / Raise</dd><dt>Ctrl+1–4</dt><dd>Button 1–4 (bet amount shortcut)</dd></dl><p>Actions follow available table controls. Disabled while typing or confirming a bet.</p>';
content.insertBefore(hotkeyOptions,content.querySelector('.settingsConfirm'));
const bindingSettings=installHotkeySettings(hotkeyOptions,()=>{chipDraftTouched=true;chipDraftChanged()});
const buyInOptions=document.createElement('div');buyInOptions.id='buyInOptions';buyInOptions.hidden=true;
buyInOptions.innerHTML=`<h2>Default Buy-In</h2><label class="buyInPreference"><span>Min <output id="buyInPercent">0%</output> Max</span><input id="defaultBuyIn" type="range" min="0" max="100" step="1" aria-label="Default Buy-In percentage"></label><p class="buyInMinimum">If your buy-in setting is lower than the table minimum, you will be seated with the lowest amount allowed.</p><label class="autoBuyInRow">Auto Buy-In <input id="autoBuyIn" type="checkbox"></label><div class="practiceFunding"><span>Default</span><strong>Practice chips</strong><small>Join seats your local player. Open remains spectator-only.</small></div><label class="autoTopUpRow">Auto Top-up <input id="autoTopUp" type="checkbox"></label><p class="topUpScope">Funding applies on the next hand after Ready. Local practice chips only.</p><div class="topUpRange"><div class="topUpTrack"><i></i><output id="topUpThresholdValue"></output><output id="topUpTargetValue"></output></div><input id="topUpThreshold" type="range" min="0" max="100" step="1" aria-label="Top-up threshold percentage"><input id="topUpTarget" type="range" min="20" max="100" step="1" aria-label="Top-up target percentage"></div><p id="topUpExplanation"></p>`;
content.insertBefore(buyInOptions,content.querySelector('.settingsConfirm'));
const themeOptions=document.createElement('div');themeOptions.id='themeOptions';themeOptions.tabIndex=-1;themeOptions.hidden=true;themeOptions.innerHTML='<h2>Table Theme</h2><div class="themeLayout"><div id="themeChoices" tabindex="-1" aria-label="Table backgrounds"></div><figure><img id="themePreview" alt="Selected table background"></figure></div>';
content.insertBefore(themeOptions,content.querySelector('.settingsConfirm'));
const themeSidebar=document.createElement('div');themeSidebar.className='themeSidebar';const backHeading=document.createElement('h3');backHeading.textContent='Card Back';const backChoices=document.createElement('div');backChoices.id='cardBackChoices';backChoices.setAttribute('aria-label','Card backs');themeSidebar.append(backHeading,backChoices,$('themeChoices'));themeOptions.querySelector('.themeLayout').prepend(themeSidebar);const backPreview=document.createElement('div');backPreview.className='themeBackPreview';backPreview.setAttribute('aria-label','Hidden-card appearance preview');backPreview.innerHTML='';themeOptions.querySelector('figure').append(backPreview);
const frontHeading=document.createElement('h3');frontHeading.textContent='Card Front';const frontChoices=document.createElement('div');frontChoices.id='cardFrontChoices';frontChoices.setAttribute('aria-label','Available card-front styles');themeSidebar.prepend(frontHeading,frontChoices);const facePreview=document.createElement('div');facePreview.className='themeFacePreview';facePreview.setAttribute('aria-label','Card-front preview');facePreview.append(...cards(['Tc','Jd','Qh']));themeOptions.querySelector('figure').append(facePreview);
const previewFigure=themeOptions.querySelector('figure'),previewFelt=document.createElementNS('http://www.w3.org/2000/svg','svg');previewFelt.classList.add('themePreviewFelt');previewFelt.setAttribute('viewBox','0 0 485 348');previewFelt.innerHTML='<polygon points="135,77 351,77 389,93 423,123 439,157 439,208 404,248 358,266 128,266 82,248 47,208 47,157 63,123 97,93"/>';previewFigure.insertBefore(previewFelt,backPreview);const previewFrame=new Image();previewFrame.src='/home-art/native-settings-table.png';previewFrame.className='themePreviewFrame';previewFrame.alt='';previewFigure.insertBefore(previewFrame,backPreview);
for(const [index,[x,y]] of [[279,70],[448,95],[458,275],[279,325],[99,275],[109,95]].entries()){const seat=document.createElement('div');seat.className='themePreviewSeat';seat.style.left=(x+3)+'px';seat.style.top=(y-20)+'px';const portrait=document.createElement('div');portrait.className='themePreviewPortrait';const mask=document.createElement('div');mask.className='themeSeatCards';const pair=document.createElement('div');pair.className='themeSeatCardPair';if(index===3){pair.classList.add('front');pair.append(...cards(['8h','9s']))}else for(let i=0;i<2;i++){const image=new Image();image.alt='Face-down preview card';image.dataset.back='';pair.append(image)}mask.append(pair);const name=document.createElement('span');name.className='themePreviewName';name.textContent='Player'+(index+1);const stack=document.createElement('span');stack.className='themePreviewStack';stack.textContent='$50';seat.append(portrait,mask,name,stack);backPreview.append(seat)}
for(const [name,x,y,label] of [['dealer',313,110,''],['small-blind',391,125,'$0.25'],['big-blind',393,224,'$0.50']]){const marker=document.createElement('div');marker.className='themePreviewMarker';marker.style.left=x+'px';marker.style.top=y+'px';const image=new Image();image.src='/home-art/native-settings-'+name+'.png';image.alt=name;marker.append(image,document.createTextNode(label));previewFigure.append(marker)}
const cardPickers=document.createElement('div');cardPickers.className='themeCardPickers';const frontPicker=document.createElement('details'),frontSummary=document.createElement('summary'),backPicker=document.createElement('details'),backSummary=document.createElement('summary');frontPicker.setAttribute('aria-label','Choose card front');backPicker.setAttribute('aria-label','Choose card back');frontSummary.append(cards(['2c'])[0]);frontSummary.append(document.createTextNode(' ▾'));const backSample=new Image();backSample.alt='Selected card back';backSummary.append(backSample,document.createTextNode(' ▾'));frontPicker.append(frontSummary,frontChoices);backPicker.append(backSummary,backChoices);for(const [heading,picker] of [[frontHeading,frontPicker],[backHeading,backPicker]]){const column=document.createElement('div');column.append(heading,picker);cardPickers.append(column)}themeSidebar.prepend(cardPickers);
let frontPreviewRequest=0;
function renderCardFrontDraft(){const front=cardFront(themeOptions.dataset.cardFront);for(const b of frontChoices.children)b.setAttribute('aria-pressed',String(b.dataset.cardFront===front.id));const request=++frontPreviewRequest,image=new Image();image.src=front.image;image.decode().then(()=>{if(request===frontPreviewRequest){previewFigure.style.setProperty('--front-preview-image','url("'+image.src+'")');frontSummary.style.setProperty('--front-preview-image','url("'+image.src+'")');facePreview.dataset.cardFront=front.id}}).catch(()=>{})}
for(const front of cardFronts){const b=document.createElement('button'),sample=cards(['2c'])[0];b.type='button';b.dataset.cardFront=front.id;b.setAttribute('aria-label',front.label);sample.style.backgroundImage='url("'+front.image+'")';b.append(sample);b.onclick=()=>{themeOptions.dataset.cardFront=front.id;chipDraftTouched=true;renderCardFrontDraft();frontPicker.open=false;chipDraftChanged()};frontChoices.append(b)}
let backPreviewRequest=0;
function renderCardBackDraft(){const back=cardBack(themeOptions.dataset.cardBack);for(const b of backChoices.children)b.setAttribute('aria-pressed',String(b.dataset.cardBack===back.id));const request=++backPreviewRequest,image=new Image();image.src=back.image;image.decode().then(()=>{if(request===backPreviewRequest){for(const img of backPreview.querySelectorAll('img[data-back]'))img.src=image.src;backSample.src=image.src;backPreview.dataset.cardBack=back.id}}).catch(()=>{})}
for(const back of cardBacks){const b=document.createElement('button'),img=new Image();b.type='button';b.dataset.cardBack=back.id;b.setAttribute('aria-label',back.label);img.loading='lazy';img.src=back.image;img.alt='';b.append(img);b.onclick=()=>{themeOptions.dataset.cardBack=back.id;chipDraftTouched=true;renderCardBackDraft();backPicker.open=false;chipDraftChanged()};backChoices.append(b)}

const feltHeading=document.createElement('h3');feltHeading.textContent='Felt';feltHeading.className='themeFeltHeading';const feltChoices=document.createElement('div');feltChoices.id='feltChoices';feltChoices.setAttribute('aria-label','Felt colours');themeSidebar.insertBefore(feltHeading,$('themeChoices'));themeSidebar.insertBefore(feltChoices,$('themeChoices'));const themeHeading=document.createElement('h3');themeHeading.textContent='Theme';themeHeading.className='themeBackgroundHeading';themeSidebar.insertBefore(themeHeading,$('themeChoices'));
for(const colour of feltColours){const b=document.createElement('button');b.type='button';b.dataset.feltColour=colour.id;b.setAttribute('aria-label',colour.label);b.style.background=colour.value===null?'conic-gradient(#247780,#a21420,#343434,#117f17,#247780)':'#'+colour.value.toString(16).padStart(6,'0');b.onclick=()=>{themeOptions.dataset.feltColour=colour.id;chipDraftTouched=true;renderThemeDraft();chipDraftChanged()};feltChoices.append(b)}
let themePreviewRequest=0;
function renderThemeDraft(){const surface=tableSurface(themeOptions.dataset.selected,themeOptions.dataset.feltColour),theme=surface.theme;for(const b of feltChoices.children)b.setAttribute('aria-pressed',String(b.dataset.feltColour===surface.colour.id));for(const b of $('themeChoices').children)b.setAttribute('aria-pressed',String(b.dataset.theme===(theme.id==='default'?'coloredbg-black':theme.id)));const request=++themePreviewRequest,image=new Image();image.src='/home-art/native-settings-'+(theme.id==='default'?'coloredbg-black':theme.id)+'.png';image.decode().then(()=>{if(request===themePreviewRequest){$('themePreview').src=image.src;previewFelt.style.fill='#'+(surface.colour.value??1146647).toString(16).padStart(6,'0');$('themePreview').dataset.theme=theme.id;$('themePreview').dataset.feltColour=surface.colour.id}}).catch(()=>{})}
for(const id of ["coloredbg-gray", "theme-himalayancliff", "coloredbg-black", "theme-ocean", "coloredbg-red", "theme-springblossom", "coloredbg-cooper", "theme-desert", "coloredbg-brown", "theme-summerbay", "coloredbg-green", "theme-amazon", "coloredbg-navy", "theme-frozen", "coloredbg-cobalt", "theme-coralreef", "coloredbg-chocobrown", "theme-western", "coloredbg-purple", "theme-neotokyo"]){const theme=tableTheme(id),b=document.createElement('button'),image=new Image();b.type='button';b.dataset.theme=theme.id;b.setAttribute('aria-label',theme.label);image.loading='lazy';image.src='/home-art/native-settings-thumb-'+theme.id+'.png';image.alt='';b.append(image,document.createTextNode(theme.label));b.onclick=()=>{themeOptions.dataset.selected=theme.id;chipDraftTouched=true;renderThemeDraft();chipDraftChanged()};$('themeChoices').append(b)}
function savedTopUp(){const threshold=Number(localStorage.getItem('river-topup-threshold')??100),target=Number(localStorage.getItem('river-topup-target')??100);return Number.isInteger(threshold)&&Number.isInteger(target)&&threshold>=0&&threshold<=target&&target>=20&&target<=100?{threshold,target}:{threshold:100,target:100}}
function savedBuyIn(){const v=Number(localStorage.getItem('river-default-buy-in'));return Number.isInteger(v)&&v>=0&&v<=100?v:0}
function savedVolume(){const raw=localStorage.getItem('river-volume'),v=raw===null?100:Number(raw);return Number.isInteger(v)&&v>=0&&v<=100?v:100}

function settingsPage(name){if(name!=='Sound')stopSoundPreview();squeezeOptions.hidden=name!=='Card Squeeze';$('chipSettings').setAttribute('aria-label',name+' settings');shuffleOptions.hidden=name!=='Chip Shuffle';if(name!=='Chip Shuffle')stopShufflePreview();themeOptions.hidden=name!=='Table Theme';buyInOptions.hidden=name!=='Buy-in settings';chipOptions.hidden=name!=='Switch Chip Display';bettingOptions.hidden=name!=='Betting options';soundOptions.hidden=name!=='Sound';hotkeyOptions.hidden=name!=='Hotkey';for(const b of $('settingsSidebar').children){if(b.textContent===name)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')}content.querySelector('.settingsScope').hidden=name!=='Switch Chip Display'}
for(const name of settingsNames){const b=document.createElement('button');b.textContent=name;b.disabled=!['Switch Chip Display','Betting options','Sound','Hotkey','Buy-in settings','Table Theme','Chip Shuffle','Card Squeeze'].includes(name);if(!b.disabled)b.onclick=()=>{settingsPage(name);$(name==='Card Squeeze'?'squeezeEnabled':name==='Chip Shuffle'?'shuffleEnabled':name==='Table Theme'?'themeOptions':name==='Buy-in settings'?'defaultBuyIn':name==='Betting options'?'wheelIncrease':name==='Sound'?'masterVolume':name==='Hotkey'?'detailHotkeys':'detailChipSwitch').focus()};$('settingsSidebar').append(b)}
const bettingPreferences=[['wheelIncrease','river-wheel-increase'],['confirmBet','river-confirm-bet']];
function readSettingsDraft(){for(const c of audioChannels){const saved=readAudioChannel(c.id);$('audio-'+c.id+'-volume').value=saved.volume;$('audio-'+c.id+'-enabled').checked=saved.enabled}$('squeezeEnabled').checked=localStorage.getItem('river-card-squeeze')!=='0';renderSqueezeDraft();const shuffle=savedShuffle();$('shuffleEnabled').checked=shuffle.enabled;$('shuffleDirection').value=shuffle.direction;$('shuffleSensitivity').value=shuffle.sensitivity;stopShufflePreview();renderShuffleDraft();themeOptions.dataset.feltColour=feltColour(localStorage.getItem('river-felt-colour')).id;themeOptions.dataset.cardFront=cardFront(localStorage.getItem('river-card-front')).id;renderCardFrontDraft();themeOptions.dataset.cardBack=cardBack(localStorage.getItem('river-card-back')).id;renderCardBackDraft();themeOptions.dataset.selected=tableTheme(localStorage.getItem('river-table-theme')).id;renderThemeDraft();const presets=readBettingPreferences(localStorage.getItem('river-bet-presets'));$('wheelUnit').value=presets.unit;$('dontRoundBlind').checked=presets.dontRoundBlind;for(const kind of ['opening','normal'])presets[kind].forEach((v,i)=>$(kind+'Preset'+i).value=String(v));$('topUpThreshold').value=savedTopUp().threshold;$('topUpTarget').value=savedTopUp().target;$('autoBuyIn').checked=localStorage.getItem('river-auto-buyin')==='1';$('autoTopUp').checked=localStorage.getItem('river-auto-topup')==='1';$('defaultBuyIn').value=savedBuyIn();$('detailHotkeys').checked=$('homeHotkeys').checked;$('showHotkeys').checked=localStorage.getItem('river-show-hotkeys')==='1';$('masterVolume').value=savedVolume();$('tableMuted').checked=!$('homeSound').checked;for(const [id,key] of bettingPreferences)$(id).value=localStorage.getItem(key)==='0'?'0':'1';bindingSettings.load()}
let chipDraftTouched=false;
function chipDraftChanged(){
 bindingSettings.enable();
 for(const id of ['wheelUnit','wheelIncrease','confirmBet']){const select=$(id);for(const button of select.parentNode.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.value===select.value))}
 const threshold=Number($('topUpThreshold').value),target=Number($('topUpTarget').value);$('topUpThreshold').disabled=$('topUpTarget').disabled=!$('autoTopUp').checked;$('topUpThresholdValue').textContent=threshold+'%';$('topUpTargetValue').textContent=target+'%';$('topUpThresholdValue').style.left=threshold+'%';$('topUpTargetValue').style.left=target+'%';$('topUpThresholdValue').parentNode.style.background='linear-gradient(to right,#c4a052 '+threshold+'%,#b95158 '+threshold+'% calc('+target+'% + 13px),#080808 calc('+target+'% + 13px))';$('topUpExplanation').textContent='If your chips drop below '+threshold+'% of maximum buy-in, your stack will be automatically topped up to '+target+'% of maximum buy-in.';
 $('buyInPercent').textContent=$('defaultBuyIn').value+'%';
 $('volumeValue').textContent=$('masterVolume').value+'%';for(const c of audioChannels){$('audio-'+c.id+'-value').textContent=$('audio-'+c.id+'-volume').value+'%';$('audio-'+c.id+'-volume').disabled=$('tableMuted').checked||!$('audio-'+c.id+'-enabled').checked;$('audio-'+c.id+'-enabled').disabled=$('tableMuted').checked;$('audio-'+c.id+'-preview').disabled=$('tableMuted').checked||Number($('audio-'+c.id+'-volume').value)===0}
 $('detailOpenBB').disabled=!$('detailChipSwitch').checked;
 $('chipPreviewAmount').textContent=$('detailChipSwitch').checked?'50 BB':'200 chips';
 $('applyChipSettings').disabled=JSON.stringify(bindingSettings.groups())===JSON.stringify(readHotkeyGroups(localStorage.getItem('river-hotkey-groups')))&&JSON.stringify(bindingSettings.read())===JSON.stringify(readHotkeys(localStorage.getItem('river-hotkey-bindings')))&&JSON.stringify(audioDraft())===JSON.stringify(audioChannels.map(c=>readAudioChannel(c.id)))&&$('squeezeEnabled').checked===(localStorage.getItem('river-card-squeeze')!=='0')&&JSON.stringify(shuffleDraft())===JSON.stringify(savedShuffle())&&themeOptions.dataset.feltColour===feltColour(localStorage.getItem('river-felt-colour')).id&&themeOptions.dataset.cardFront===cardFront(localStorage.getItem('river-card-front')).id&&themeOptions.dataset.cardBack===cardBack(localStorage.getItem('river-card-back')).id&&themeOptions.dataset.selected===tableTheme(localStorage.getItem('river-table-theme')).id&&JSON.stringify(bettingDraft())===JSON.stringify(readBettingPreferences(localStorage.getItem('river-bet-presets')))&&threshold===savedTopUp().threshold&&target===savedTopUp().target&&$('autoBuyIn').checked===(localStorage.getItem('river-auto-buyin')==='1')&&$('autoTopUp').checked===(localStorage.getItem('river-auto-topup')==='1')&&Number($('defaultBuyIn').value)===savedBuyIn()&&$('detailChipSwitch').checked===$('homeChips').checked&&$('detailOpenBB').checked===homeOpenBB.checked&&$('detailHotkeys').checked===$('homeHotkeys').checked&&$('showHotkeys').checked===(localStorage.getItem('river-show-hotkeys')==='1')&&Number($('masterVolume').value)===savedVolume()&&$('tableMuted').checked===!$('homeSound').checked&&bettingPreferences.every(([id,key])=>$(id).value===(localStorage.getItem(key)==='0'?'0':'1'));
}
function openChipSettings(){
 chipDraftTouched=false;settingsPage('Switch Chip Display');readSettingsDraft();$('homeSettings').hidden=true;$('chipSettings').hidden=false;
 for(const el of frame.children)if(el!==$('chipSettings'))el.inert=true;
 $('detailChipSwitch').checked=$('homeChips').checked;$('detailOpenBB').checked=homeOpenBB.checked;
 chipDraftChanged();size();$('detailChipSwitch').focus();
}
function closeChipSettings(){stopSoundPreview();stopShufflePreview();if(settingsWindow){window.close();return}$('chipSettings').hidden=true;for(const el of frame.children)el.inert=false;size();$('settings').focus()}
$('openChipSettings').onclick=$('openGameSettings').onclick=openChipSettings;
for(const c of audioChannels)for(const kind of ['volume','enabled'])$('audio-'+c.id+'-'+kind).oninput=()=>{chipDraftTouched=true;chipDraftChanged();if(soundPreviewChannel===c.id)previewShuffleAudio.updatePreview(Number($('audio-'+c.id+'-volume').value))};
for(const id of ['masterVolume','tableMuted','detailHotkeys','showHotkeys','defaultBuyIn','autoTopUp','autoBuyIn'])$(id).oninput=()=>{chipDraftTouched=true;chipDraftChanged();if(id==='tableMuted'&&$('tableMuted').checked)stopSoundPreview()};
for(const id of ['topUpThreshold','topUpTarget'])$(id).oninput=()=>{if(id==='topUpThreshold')$('topUpThreshold').value=Math.min(Number($('topUpThreshold').value),Number($('topUpTarget').value));else $('topUpTarget').value=Math.max(Number($('topUpTarget').value),Number($('topUpThreshold').value));chipDraftTouched=true;chipDraftChanged()};
for(const id of ['wheelUnit','dontRoundBlind',...[0,1,2,3].flatMap(i=>['openingPreset'+i,'normalPreset'+i])])$(id).onchange=()=>{chipDraftTouched=true;chipDraftChanged()};
for(const [id] of bettingPreferences)$(id).onchange=()=>{chipDraftTouched=true;chipDraftChanged()};
$('detailChipSwitch').onchange=$('detailOpenBB').onchange=()=>{chipDraftTouched=true;chipDraftChanged()};
$('applyChipSettings').onclick=()=>{
 localStorage.setItem('river-hotkey-bindings',JSON.stringify(bindingSettings.read()));localStorage.setItem('river-hotkey-groups',JSON.stringify(bindingSettings.groups()));
 localStorage.setItem('river-card-squeeze',$('squeezeEnabled').checked?'1':'0');
 localStorage.setItem('river-chip-shuffle',JSON.stringify(shuffleDraft()));
 localStorage.setItem('river-card-front',themeOptions.dataset.cardFront);
 localStorage.setItem('river-card-back',themeOptions.dataset.cardBack);
 localStorage.setItem('river-table-theme',themeOptions.dataset.selected);
 localStorage.setItem('river-felt-colour',themeOptions.dataset.feltColour);
 localStorage.setItem('river-bet-presets',JSON.stringify(bettingDraft()));
 localStorage.setItem('river-topup-threshold',$('topUpThreshold').value);localStorage.setItem('river-topup-target',$('topUpTarget').value);
 localStorage.setItem('river-auto-buyin',$('autoBuyIn').checked?'1':'0');localStorage.setItem('river-auto-topup',$('autoTopUp').checked?'1':'0');localStorage.setItem('river-default-buy-in',$('defaultBuyIn').value);
 $('homeHotkeys').checked=$('detailHotkeys').checked;$('homeHotkeys').onchange();localStorage.setItem('river-show-hotkeys',$('showHotkeys').checked?'1':'0');
 for(const [i,c]of audioChannels.entries()){const draft=audioDraft()[i];localStorage.setItem('river-audio-'+c.id+'-volume',String(draft.volume));localStorage.setItem('river-audio-'+c.id+'-enabled',draft.enabled?'1':'0')}
 localStorage.setItem('river-volume',$('masterVolume').value);$('homeSound').checked=!$('tableMuted').checked;$('homeSound').onchange();
 for(const [id,key] of bettingPreferences)localStorage.setItem(key,$(id).value);
 $('homeChips').checked=$('detailChipSwitch').checked;$('homeChips').onchange();
 homeOpenBB.checked=$('detailOpenBB').checked;homeOpenBB.onchange();closeChipSettings();
};
$('cancelChipSettings').onclick=$('closeChipSettings').onclick=closeChipSettings;
addEventListener('storage',e=>{
 if(e.storageArea!==localStorage||(e.key!==null&&![...audioPreferenceKeys,...homePreferences.map(p=>p[1]),'river-open-bb','river-volume','river-show-hotkeys','river-hotkey-bindings','river-hotkey-groups','river-default-buy-in','river-auto-topup','river-auto-buyin','river-topup-threshold','river-topup-target','river-bet-presets','river-chip-shuffle','river-card-squeeze','river-table-theme','river-felt-colour','river-card-back','river-card-front',...bettingPreferences.map(p=>p[1])].includes(e.key)))return;
 const clean=!chipDraftTouched;
 for(const [id,key,inverted] of homePreferences)$(id).checked=inverted?localStorage.getItem(key)!=='1':localStorage.getItem(key)==='1';
 homeOpenBB.checked=localStorage.getItem('river-open-bb')!=='0';homeOpenBB.disabled=!$('homeChips').checked;
 if(!$('chipSettings').hidden){
  if(clean){readSettingsDraft();$('detailChipSwitch').checked=$('homeChips').checked;$('detailOpenBB').checked=homeOpenBB.checked}
  chipDraftChanged();
 }
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('chipSettings').hidden){e.preventDefault();closeChipSettings()}});

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('homeSettings').hidden){e.preventDefault();closeHomeSettings()}});
document.addEventListener('click',e=>{if(!$('homeSettings').hidden&&!$('homeSettings').contains(e.target)&&!$('settings').contains(e.target))$('homeSettings').hidden=true});
function navigate(p){
 if(p.id==='spin'){spinUI.open();return}
 if(p.id==='settings'){$('homeSettings').hidden=!$('homeSettings').hidden;return}

 if(['holdem','plo','shortdeck','aof','rush','tournaments'].includes(p.id)){catalog(p.id);return}
 if(p.id==='poker'||p.id==='navhome'){spinUI?.close();$('catalog').hidden=true;size();feed.scrollTop=0;return}
 if(p.id==='collapse'){collapsed=!collapsed;for(const id of ['usd','pd','td','tickets'])$(id).hidden=collapsed,$(id).style.display=collapsed?'none':'';for(const id of ['collapse','cash','prop','rewards','promo'])$(id).style.transform=collapsed?'translateY(-137px)':'';return}
 if(p.id==='floatingAsk'||p.id==='ask'){ $('assistantPane').hidden=false;$('question').focus() }
}
for(const [i,name] of ['Tournaments','GGMillion$ Festival','PLO Series','Flip & Go Millionaire','GGMasters','WSOP Express','Spin & Gold','Mystery Battle Royale','Flip & Go'].entries()){
 const b=document.createElement('button');b.textContent=name;b.setAttribute('aria-label',name);b.disabled=i!==0&&i!==6;
 if(i===6)b.onclick=()=>spinUI.open();
 if(i===0){b.setAttribute('aria-current','page');b.onclick=()=>catalog('tournaments')}else b.title='Event format unavailable locally';$('tournamentTabs').append(b);
}
for(const p of parts){
 const input=['button','tab'].includes(p.mode);const e=document.createElement(input?'button':p.mode==='heading'?'h2':p.mode==='text'?'span':'img');
 e.id=p.id;e.className='piece '+p.mode+(p.id==='poker'?' active':'');
 const inf=p.y>=150&&p.x<1084&&p.id!=='floatingAsk';(inf?canvas:frame).append(e);
 box(e,p.x-(inf?5:0),p.y-(inf?150:0),p.w,p.h);
 if(input){e.type='button';e.setAttribute('aria-label',p.label);e.onclick=()=>navigate(p);
 if(!['spin','holdem','plo','shortdeck','aof','rush','tournaments','navhome','poker','collapse','floatingAsk','ask','settings'].includes(p.id)){e.disabled=true;e.title=(audit[p.id]?.note||'Destination unverified')+' · Unavailable locally'}}
 if(p.mode==='button'){const img=new Image();img.src=art+p.id+'.png';img.alt='';e.append(img)}
 else if(p.mode==='art'){e.src=art+(p.id==='logo'?'dangg-logo-512-transparent.png':p.id+'.png');e.alt=p.id==='logo'?'DanGG':p.label;if(p.id==='logo')e.style.objectFit='contain'}
 else e.textContent=p.label;
}
let requestedSlide=slide,promotionRequest=0,promotionLoading=false;
async function display(i){
 const target=carouselIndex(i),request=++promotionRequest,hero=$('hero').firstChild.cloneNode(false),edge=$('underlay').cloneNode(false);requestedSlide=target;promotionLoading=true;
 hero.src=art+(target===6?'hero':'slide-'+target)+'.png';edge.src=art+(target===6?'underlay':'edge-'+target)+'.png';
 try{
  await Promise.all([hero.decode(),edge.decode()]);if(request!==promotionRequest)return;
  slide=target;$('hero').replaceChildren(hero);$('underlay').replaceWith(edge);
  document.querySelectorAll('.dot').forEach((b,j)=>b.setAttribute('aria-pressed',String(slide===j)));
 }catch{}finally{if(request===promotionRequest){requestedSlide=slide;promotionLoading=false}}
}
function spot(name,x,y,w,h,cb,cls=''){const b=document.createElement('button');b.className='piece '+cls;b.setAttribute('aria-label',name);box(b,x-5,y-150,w,h);b.onclick=cb;canvas.append(b);return b}
for(let i=0;i<15;i++)spot('Promotion '+(i+1),386+i*20,425,16,18,()=>display(i),'dot');
spot('Previous promotion',10,280,40,78,()=>display(requestedSlide-1));spot('Next promotion',1028,280,40,78,()=>display(requestedSlide+1));
$('hero').onmouseenter=()=>paused=true;$('hero').onmouseleave=()=>paused=false;
if(!still)setInterval(()=>{if(!promotionLoading&&!paused&&!document.hidden&&$('assistantPane').hidden&&$('catalog').hidden&&(!$('spinPane')||$('spinPane').hidden)&&$('profilePane').hidden&&$('chipSettings').hidden)display(slide+1)},6000);
const extra=new Image();extra.src=art+'tv-lower.png';extra.alt='Continuation of the captured GGPoker.TV row';extra.className='piece';box(extra,0,779,1070,200);canvas.append(extra);
feed.onscroll=()=>{$('thumb').style.transform='translateY('+(feed.scrollTop/(canvas.offsetHeight-feed.clientHeight)*480)+'px)'};
const closeAsk=()=>{$('assistantPane').hidden=true;$('floatingAsk').focus()};$('closeAsk').onclick=closeAsk;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('assistantPane').hidden)closeAsk()});document.addEventListener('keydown',e=>{if(e.key==='F2'){e.preventDefault();location.href='/home-review.html'}});
display(6);

let catalogRequest=0;
function catalog(mode){
 spinUI?.close();
 const request=++catalogRequest;$('viewSwitch').hidden=false;$('groups').hidden=false;
 const tournament=mode==='tournaments',pane=$('catalog'),list=$('groups'),detailsRoot=$('details');pane.dataset.mode=mode;pane.hidden=false;size();list.replaceChildren();
 $('joinTable').hidden=true;$('takeSeat').textContent='Join table';pane.removeAttribute('data-view');$('catalogName').textContent=tournament?'Tournaments':mode==='plo'?'PLO':mode==='shortdeck'?'Short Deck · local rules':mode==='aof'?'All-In or Fold':'Hold’em';
 $('eventSearchLabel').hidden=!tournament;
 if(mode==='rush'){rushCatalog(request);return}
 if(!tournament){cashCatalog(request,mode);return}
 const eventLink=room=>'network.html?mode=tournament&from=home'+(journey?'&player':'')+'#'+room;
 const cell=text=>{const el=document.createElement('span');el.textContent=text;return el};
 let category='all';
 $('buyinRange').hidden=true;$('minBuyin').value=$('maxBuyin').value='';$('buyinError').textContent='';
 $('allBuyins').setAttribute('aria-pressed','true');$('customBuyins').setAttribute('aria-pressed','false');
 const resetBuyins=()=>{$('buyinRange').hidden=true;$('minBuyin').value=$('maxBuyin').value='';$('allBuyins').setAttribute('aria-pressed','true');$('customBuyins').setAttribute('aria-pressed','false');show(current)};
 $('allBuyins').onclick=$('resetEventFilter').onclick=resetBuyins;
 $('customBuyins').onclick=()=>{$('buyinRange').hidden=false;$('allBuyins').setAttribute('aria-pressed','false');$('customBuyins').setAttribute('aria-pressed','true');$('minBuyin').focus();show(current)};
 $('minBuyin').oninput=$('maxBuyin').oninput=()=>show(current);
 $('eventCategories').replaceChildren(...['All','GGMillion$ Festival','PLO Series','Flip & Go Millionaire','Daily Guarantee','Bounty Hunters','Zodiac','PLO','GGMillion$','High Rollers'].map(name=>{
  const b=document.createElement('button');b.textContent=name;b.disabled=!['All','PLO'].includes(name);b.setAttribute('aria-pressed',String(name==='All'));
  if(!b.disabled)b.onclick=()=>{category=name==='All'?'all':'plo';for(const el of b.parentNode.children)el.setAttribute('aria-pressed',String(el===b));show(current)};
  else b.title='Event category unavailable locally';return b;
 }));
 let sort=0,direction=1;
 const headings=['Start','Event Name','Buy-in','Players','Prize'];
 $('columns').replaceChildren(...headings.map((label,i)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{direction=sort===i?-direction:1;sort=i;show(current)};return b}));
 let selected=rooms[2],previous='',current=[];
 $('eventSearch').value='';$('eventSearch').oninput=()=>show(current);
 function show(events){
  const details=detailsRoot.cloneNode(false),nextList=list.cloneNode(false);
  const focused=list.contains(document.activeElement)?document.activeElement.getAttribute('data-room'):null;
  current=events;const query=$('eventSearch').value.trim().toLocaleLowerCase();
  const custom=!$('buyinRange').hidden,min=$('minBuyin').value===''?0:Number($('minBuyin').value),max=$('maxBuyin').value===''?Infinity:Number($('maxBuyin').value);
  const invalid=custom&&(!$('minBuyin').validity.valid||!$('maxBuyin').validity.valid||min>max);
  $('buyinError').textContent=invalid?'Enter a valid buy-in range. Minimum cannot exceed maximum.':'';
  events=events.filter(t=>!invalid&&(category==='all'||t.variant==='plo')&&(!custom||(25>=min&&25<=max)));
  events=events.filter(t=>[t.name,...(t.seats||[]).map(p=>p?.name||'')].some(text=>text.toLocaleLowerCase().includes(query)));
  const value=t=>sort===0?(t.startsAt||0):sort===1?t.name:sort===2?25:sort===3?t.occupied??-1:(t.occupied??-1)*25;
  events.sort((a,b)=>direction*(typeof value(a)==='string'?value(a).localeCompare(value(b)):value(a)-value(b)));
  [...$('columns').children].forEach((b,i)=>{b.textContent=headings[i]+(sort===i?(direction===1?' ▲':' ▼'):'');b.setAttribute('aria-label','Sort by '+headings[i])});
  if(!events.length){nextList.replaceChildren(cell('No matching tournaments'));details.textContent='';$('takeSeat').removeAttribute('href');$('takeSeat').textContent='Select a tournament';$('eventLobby').removeAttribute('href');updateElement(list,nextList);updateElement(detailsRoot,details);return}
  if(!events.some(t=>t.room===selected))selected=events[0].room;
  nextList.replaceChildren(...events.map(t=>{
   const row=document.createElement('button'),started=t.hand>0,closed=!t.open||t.cancelled,available=!closed&&!started;
   row.dataset.room=t.room;row.setAttribute('aria-label',t.name);row.setAttribute('aria-pressed',String(t.room===selected));
   row.append(...[t.cancelled?'Cancelled':started?'Started':closed?'Closed':t.startsAt?new Date(t.startsAt).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'On registration',t.name,'25',t.occupied==null?'—':t.occupied+'/'+(t.capacity||4),t.occupied==null?'—':String(t.occupied*25)].map(cell));
   row.onclick=()=>{selected=t.room;show(current)};
   if(selected===t.room){details.replaceChildren();
    const title=document.createElement('strong');title.textContent=t.name;details.append(title);
    const fields=[['Start',t.startsAt?new Date(t.startsAt).toLocaleString()+' · minimum '+Math.max(2,(t.prizeShares||[100]).length)+' players':'At '+(t.capacity||4)+' registrations'],['Buy-in','25 play credits'],['Players',t.occupied==null?'—':t.occupied+' / '+(t.capacity||4)],['Prize',t.occupied==null?'—':t.occupied*25+' play credits'],['Starting chips',String(t.stack||100)],['Blinds',(t.currentBlind||t.blind||4)/2+' / '+(t.currentBlind||t.blind||4)+(t.currentAnte||t.ante?' · Ante '+(t.currentAnte||t.ante):'')],['Format',(t.variant==='plo'?'Pot-limit Omaha':'No-limit Hold’em')+' · freezeout · no rebuys'],['Payout',(t.prizeShares||[100]).length===1?'Winner takes the pool':t.prizeShares.map((n,i)=>(i+1)+': '+n+'%').join(' · ')]];
    fields.push(['Blind levels',t.levelSeconds?t.levelSeconds+' seconds · new hands only':'Server default · new hands only']);
    const dl=document.createElement('dl');for(const [label,value] of fields){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;dl.append(dt,dd)}details.append(dl);
    $('eventLobby').href=eventLink(t.room);
    $('takeSeat').textContent=t.cancelled?'Event cancelled':closed?'Registration closed':started?'Open tournament':'Register';if(available||started)$('takeSeat').href=eventLink(t.room);else $('takeSeat').removeAttribute('href')}
   return row;
  }));
  updateElement(list,nextList);updateElement(detailsRoot,details);
  if(focused)[...list.children].find(row=>row.dataset.room===focused)?.focus();
 }
 const standard={room:rooms[2],name:'Four-player freezeout',open:true};show([standard]);
 async function refresh(){if(request!==catalogRequest||pane.hidden)return;
  try{const response=await fetch('/api/hosted',{cache:'no-store'});if(!response.ok)throw Error();const events=(await response.json()).filter(t=>t.mode==='tournament');
   const publicState=await fetch('/api/rooms/'+rooms[2]+'/watch',{cache:'no-store'});if(publicState.ok){const state=await publicState.json();standard.occupied=state.names.filter(Boolean).length;standard.hand=state.number||0;standard.currentBlind=state.hand?.blind||4}
   if(request!==catalogRequest||pane.hidden)return;const signature=JSON.stringify([standard,...events]);if(signature!==previous){previous=signature;show([standard,...events])}
  }catch{}if(request===catalogRequest&&!pane.hidden)setTimeout(refresh,2000)
 }refresh();
}
function rushCatalog(request){
 const node=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;return e};
 $('catalogName').textContent='Rush & Cash';$('viewSwitch').hidden=true;
 $('columns').replaceChildren(...['Promotion','Games','Stakes','Buy-in','Players','Pros','Hands / hr','Action'].map(x=>node('span',x)));
 $('details').textContent='Quick fold moves your uncommitted chips to five available opponents. Six waiting players are required. No Cash Drops.';
 let filter='all',selected='holdem',populations={};
 const label=kind=>kind==='plo'?'PLO':'Hold’em';
 const href=kind=>journey?'network.html?player&from=home&view=rush&pool='+kind:'launch.html';
 function render(){
  const preview=$('preview').cloneNode(false),groups=$('groups').cloneNode(false);
  preview.replaceChildren(node('p','Local play-money pool · '+label(selected)));
  $('takeSeat').textContent='Open '+label(selected)+' Rush';$('takeSeat').href=href(selected);$('takeSeat').removeAttribute('aria-disabled');
  groups.replaceChildren(...['holdem','plo'].filter(kind=>filter==='all'||filter===kind).map(kind=>{
   const row=node('button','');row.setAttribute('aria-label','Local Rush '+label(kind)+' pool');row.setAttribute('aria-pressed',String(kind===selected));
   row.append(...['—',label(kind),'2 / 4','200',populations[kind]??'—','—','—','Join'].map(x=>node('span',x)));
   row.onclick=()=>location.assign(href(kind));return row;
  }));
  updateElement($('preview'),preview);updateElement($('groups'),groups);
 }
 $('ploFilters').replaceChildren(...['All','Hold’em','PLO'].map((text,i)=>{const b=node('button',text);b.setAttribute('aria-pressed',String(i===0));b.onclick=()=>{filter=['all','holdem','plo'][i];selected=filter==='plo'?'plo':'holdem';for(const el of b.parentNode.children)el.setAttribute('aria-pressed',String(el===b));render()};return b}));
 $('groups').hidden=false;render();
 async function refresh(){
  if(request!==catalogRequest||$('catalog').hidden)return;
  await Promise.all(['holdem','plo'].map(async kind=>{try{const r=await fetch('/api/rush/'+kind+'/state');if(r.ok)populations[kind]=(await r.json()).population}catch{}}));
  if(request!==catalogRequest||$('catalog').hidden)return;
  render();setTimeout(refresh,2000);
 }
 refresh();
}
function cashCatalog(request,mode){
 const pane=$('catalog'),list=$('groups'),previewRoot=$('preview'),join=$('takeSeat');
 const joinHref=t=>{const url=new URL(t.href,location.href);if(journey&&localStorage.getItem('river-auto-buyin')==='1')url.searchParams.set('autojoin','1');return url.href};
 const rows=[];
 let view='group',selected=0,filter='all',hosted=[];
 function node(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e}
 function render(){
  const preview=previewRoot.cloneNode(false),nextList=list.cloneNode(false),columns=$('columns').cloneNode(false);
  const group=view==='group',t=rows[selected],stakes=t&&(mode==='shortdeck'?t.blind+' ('+t.blind+')':t.blind/2+' / '+t.blind);
  pane.dataset.view=view;$('groupView').setAttribute('aria-pressed',String(group));$('tableView').setAttribute('aria-pressed',String(!group));
  columns.replaceChildren(...(group?['Promotion',mode==='plo'?'Games':'Table Size','Stakes','Buy-in','Players','Action']:['Table Name','Stakes','Buy-in','Players','Wait','AvgPot','VPIP%','H/hr']).map(x=>node('span',x)));
  if(!group&&mode==='aof')columns.replaceChildren(...['Table Name','Games','Stakes','Buy-in','Players','Wait','AvgPot','All-in %','H/hr'].map(x=>node('span',x)));
  if(group&&mode==='shortdeck')columns.replaceChildren(...['Promotion','Stakes','Buy-in','Players','Action'].map(x=>node('span',x)));
  updateElement($('columns'),columns);
  nextList.replaceChildren(...rows.map((r,i)=>{const b=node('button',''),n=r.occupied,stake=mode==='shortdeck'?r.blind+' ('+r.blind+')':r.blind/2+' / '+r.blind,stack=r.minBuyIn!==undefined&&r.minBuyIn!==r.maxBuyIn?r.minBuyIn+'–'+r.maxBuyIn:r.stack??'30–100';
   const cells=group?[r.name,mode==='plo'?r.mode.toUpperCase().replace(/(\d)/,'-$1'):(r.capacity||4)+'-Max',stake,stack,n===null?'—':n+'/'+(r.capacity||4),r.open?'Join':'Closed']:[r.name,stake,stack,n===null?'—':n+'/'+(r.capacity||4),'—',r.avgPot??'—',r.vpip==null?'—':r.vpip+'%','—'];
   if(group&&mode==='shortdeck')cells.splice(1,1);
   if(mode==='aof'){if(group)cells[1]='Hold’em';else{cells.splice(1,0,'Hold’em');cells[7]=r.allInPercent==null?'—':r.allInPercent+'%'}}

   b.setAttribute('aria-label',r.name);b.setAttribute('aria-pressed',String(i===selected));b.append(...cells.map((x,j)=>{
    if(!group&&mode!=='aof'&&j===3&&Number.isInteger(n)){
      const seats=node('span','','seatBlocks'),capacity=r.capacity||6;
      seats.setAttribute('role','img');seats.setAttribute('aria-label',n+' of '+capacity+' seats occupied');seats.title=n+' / '+capacity+' players';
      for(let seat=0;seat<capacity;seat++){const block=node('i','',seat<n?'filled':'');block.setAttribute('aria-hidden','true');seats.append(block)}return seats;
    }
    return node('span',x,j===0?'chip':group&&j===(mode==='shortdeck'?4:5)?'rowAction':'');
   }));
   b.onclick=e=>{selected=i;render();list.children[i].focus();if(e.target.classList.contains('rowAction')&&r.open)location.assign(joinHref(r))};return b}));
  updateElement(list,nextList);
  if(!t){updateElement(previewRoot,preview);$('details').textContent='No matching hosted tables';join.removeAttribute('href');$('joinTable').hidden=true;join.textContent='No table selected';return}
  if(group){const line=(...v)=>{const e=node('div','','line');e.append(...v.map(x=>node('span',x)));preview.append(e)};
   line('Player','Seat','Chips');if(t.seats){t.seats.forEach((p,i)=>{if(p)line(p.name,i+1,p.stack)});if(!t.occupied)line('No players seated','—','—')}else line('Occupied seats',t.occupied??'—','—');
  }else{preview.append(node('div',(t.minBuyIn!==undefined&&t.minBuyIn!==t.maxBuyIn?'Buy-in Range\n'+t.minBuyIn+'–'+t.maxBuyIn:'Buy-in\n'+t.stack)+' chips','oval'));const nativePreview=mode==='holdem'&&t.capacity===6,positions=nativePreview?[[50,85.7],[17.6,64.2],[18.4,34],[50,9.2],[83.3,33.7],[83.7,64.4]]:t.capacity===6?[[50,85],[18,65],[18,34],[50,17],[82,34],[82,65]]:[[50,85],[19,50],[50,17],[81,50]];positions.forEach(([x,y],i)=>{const name=t.seats?(t.seats[i]?.name||'Open seat'):'Seat '+(i+1),s=node('span',nativePreview?'':name,'seatlabel');if(t.seats?.[i]){
 if(t.capacity===6){const avatar=node('span','','previewAvatar');avatar.setAttribute('role','img');avatar.setAttribute('aria-label','Avatar for '+t.seats[i].name);if(Number.isInteger(t.seats[i].avatar)||typeof t.seats[i].avatar==='string'){avatar.style.backgroundImage='url('+avatarSource(t.seats[i].avatar)+')';avatar.style.backgroundSize='cover';avatar.style.backgroundPosition='center'}else avatar.style.backgroundPosition=(i*20)+'% center';s.prepend(avatar)}
 if(!nativePreview)s.append(node('small',t.seats[i].stack+' chips'))}if(nativePreview){const plate=node('span','','previewPlate'),label=node('span',name,'previewName');label.title=name;plate.append(label);if(t.seats?.[i])plate.append(node('small',t.seats[i].stack+' chips'));s.append(plate)}s.style.left=x+'%';s.style.top=y+'%';preview.append(s)})}
  if(!group&&mode==='holdem'&&t.positions){const spots=[[50,68.5],[35.6,64.2],[36.8,42.6],[50,26.4],[63.2,42.6],[64.4,64.2]];for(const [key,label]of [['dealer','D'],['smallBlind','SB'],['bigBlind','BB']]){const seat=t.positions[key];if(!Number.isInteger(seat)||!spots[seat])continue;const marker=node('span',label,'previewPosition '+(key==='dealer'?'dealerPosition':'blindPosition'));marker.dataset.seat=seat;marker.setAttribute('role','img');marker.setAttribute('aria-label',(key==='dealer'?'Dealer':key==='smallBlind'?'Small blind':'Big blind')+' · '+(t.seats?.[seat]?.name||'Seat '+(seat+1)));marker.style.left=spots[seat][0]+'%';marker.style.top=spots[seat][1]+'%';if(key==='smallBlind'&&seat===t.positions.dealer)marker.style.left=(spots[seat][0]+10)+'%';preview.append(marker)}}
  updateElement(previewRoot,preview);
  $('details').textContent=t.name+' · '+stakes+' · practice chips';join.textContent=!group?'Open':t.open?'Join Table':'Registration closed';if(t.open||!group)join.href=group?joinHref(t):t.href;else join.removeAttribute('href');const seatLink=$('joinTable');seatLink.hidden=group;seatLink.textContent=t.open?'Join':'Registration closed';join.onclick=()=>{if(group&&t.open)join.href=joinHref(t)};seatLink.onclick=()=>{if(t.open)seatLink.href=joinHref(t)};if(t.open){seatLink.href=joinHref(t);seatLink.removeAttribute('aria-disabled')}else{seatLink.removeAttribute('href');seatLink.setAttribute('aria-disabled','true')}
 }
 $('groupView').onclick=()=>{view='group';render()};$('tableView').onclick=()=>{view='table';render()};render();
 let previous='';
 function applyRows(){const href=rows[selected]?.href,focused=list.contains(document.activeElement);
  rows.splice(0,Infinity,...hosted.filter(t=>filter==='all'||filter===t.mode));
  selected=Math.max(0,rows.findIndex(t=>t.href===href));render();if(focused)list.children[selected]?.focus();
 }
 const filterKeys=mode==='aof'?['all','aof','aof-omaha']:['all','plo','plo5','plo6'];
 const filterLabels=mode==='aof'?['All','Hold’em','Omaha']:['All','PLO','PLO-5','PLO-6'];
 if(mode==='plo'||mode==='aof')$('ploFilters').replaceChildren(...filterKeys.map((key,i)=>{const b=node('button',filterLabels[i]);b.setAttribute('aria-pressed',String(i===0));b.onclick=()=>{filter=key;for(const el of b.parentNode.children)el.setAttribute('aria-pressed',String(el===b));applyRows()};return b}));
 async function refreshHosted(){
  if(request!==catalogRequest||pane.hidden)return;
  try{
   const response=await fetch('/api/hosted',{cache:'no-store'});if(!response.ok)throw Error();
   const data=(await response.json()).filter(t=>mode==='plo'?t.mode?.startsWith('plo'):['shortdeck','aof'].includes(mode)?t.mode===mode:!t.mode||t.mode==='cash'),signature=JSON.stringify(data);
   if(request!==catalogRequest||pane.hidden)return;
   if(signature!==previous){previous=signature;
    hosted=data.map(t=>({...t,name:t.name+' · hosted',href:'network.html?from=home'+(mode!=='holdem'?'&view='+mode:'')+(journey?'&player':'')+'#'+t.room}));
    applyRows()}
  }catch{}
  if(request===catalogRequest&&!pane.hidden)setTimeout(refreshHosted,2000)
 }
 refreshHosted();
}
const rooms=['d74983a3281b02c65ce8715c9e6600356c035f54a14bb7ca', 'bc9c9277c42598faae8affefcd3e332a46b566fb9a1ba6a9', '45add5bb98852529e4eb46d22d857d554134930491462f62'];
const entryView=new URLSearchParams(location.search).get('view');if(['holdem','plo','shortdeck','aof','rush','tournaments'].includes(entryView))catalog(entryView);

if(journey){
 $('signOut').hidden=false;$('signOut').onclick=async()=>{try{const r=await fetch('/local/logout',{method:'POST'});if(!r.ok)throw Error('Could not sign out');for(const key of Object.keys(sessionStorage))if(key.startsWith('river-seat:'))sessionStorage.removeItem(key);location.assign('/launch.html')}catch(error){$('signOutError').textContent=error.message}};
}
const avatar=document.createElement('span'),nickname=document.createElement('span');avatar.className='localProfileAvatar';avatar.style.backgroundImage='url('+avatarSource(player?.avatar)+')';avatar.setAttribute('aria-hidden','true');nickname.textContent=player?.name||'Guest';nickname.className='localProfileName';
$('profile').replaceChildren(avatar,nickname);$('profile').classList.add('localProfile');
$('usd').replaceChildren(document.createTextNode('Play money'));for(const id of ['pd','td','tickets'])$(id).replaceChildren();
$('online').textContent='Local club';
$('usd').setAttribute('aria-label','Local play-money mode');
if(!journey){$('profile').disabled=false;$('profile').setAttribute('aria-label','Sign in locally');$('profile').onclick=()=>location.assign('/launch.html');$('signOut').hidden=false;$('signOut').textContent='Sign in locally';$('signOut').onclick=()=>location.assign('/launch.html')}

let selectedAvatar=player?.avatar||0,avatarSaving=false,pendingAvatar=null,avatarCategory='All',avatarUploadRequest=0;
function renderProfile(){
 $('profilePreview').src=pendingAvatar||avatarSource(selectedAvatar);$('profileCaption').textContent=player?.name||'';$('profileNickname').value=player?.name||'';
 for(const b of $('avatarChoices').querySelectorAll('[data-avatar]')){b.disabled=avatarSaving;b.setAttribute('aria-pressed',String(Number(b.dataset.avatar)===selectedAvatar))}
 uploadAvatar.disabled=avatarSaving;customChoice.hidden=!pendingAvatar&&!player?.customAvatar;customChoice.disabled=avatarSaving;customChoice.querySelector('img').src=pendingAvatar||player?.customAvatar||avatarSource(0);customChoice.setAttribute('aria-pressed',String(!!pendingAvatar||selectedAvatar===player?.customAvatar));for(const b of $('avatarChoices').querySelectorAll('[data-avatar]'))b.hidden=avatarCategory==='Custom';for(const b of $('avatarCategories').children)b.setAttribute('aria-pressed',String(b.textContent===avatarCategory));
 $('applyAvatar').disabled=avatarSaving||!pendingAvatar&&selectedAvatar===(player?.avatar||0);
}
function openProfile(){
 if(!player){location.assign('/launch.html');return}
 $('homeSettings').hidden=true;$('profilePane').hidden=false;for(const el of frame.children)if(el!==$('profilePane'))el.inert=true;
 pendingAvatar=null;selectedAvatar=player.avatar||0;$('profileError').textContent='';renderProfile();size();$('closeProfile').focus();
}
function closeProfile(){avatarUploadRequest++;pendingAvatar=null;$('profilePane').hidden=true;for(const el of frame.children)el.inert=false;size();$('profile').focus()}
for(const name of ['GGPass Account','My Action Voice','My Game Profile','My Wallet','Verify ID','Transaction History','Message','Redeem Coupons','Current Stakers','Sellers you follow','PokerCraft','Responsible Gaming']){
 const b=document.createElement('button');b.textContent=name;b.disabled=name!=='My Game Profile';if(!b.disabled){b.setAttribute('aria-current','page');b.onclick=()=>$('profileNickname').focus()}$('profileSidebar').append(b);
}
for(const name of ['All','Custom','Poker Players','Ocean Characters','Lucky Charm','Gaming Gods','History']){
 const b=document.createElement('button');b.textContent=name;b.disabled=!['All','Custom'].includes(name);b.setAttribute('aria-pressed',String(name==='All'));if(!b.disabled)b.onclick=()=>{avatarCategory=name;renderProfile();$('avatarChoices').scrollTo(0,0)};$('avatarCategories').append(b);
}
const uploadAvatar=document.createElement('button');uploadAvatar.type='button';uploadAvatar.innerHTML='<img src="/home-art/avatar-upload.png" alt="">Upload Image';$('avatarChoices').append(uploadAvatar);
const avatarFile=document.createElement('input');avatarFile.type='file';avatarFile.accept='image/png,image/jpeg,image/webp';avatarFile.hidden=true;avatarFile.setAttribute('aria-label','Custom avatar file');$('avatarChoices').append(avatarFile);
uploadAvatar.onclick=()=>{if(!avatarSaving)avatarFile.click()};
avatarFile.onchange=async()=>{
 const file=avatarFile.files[0];avatarFile.value='';if(!file)return;const request=++avatarUploadRequest;
 try{if(file.size>5*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Choose a PNG, JPEG or WebP image up to 5 MiB');
  const url=URL.createObjectURL(file),image=new Image();try{image.src=url;await image.decode();if(image.naturalWidth>8192||image.naturalHeight>8192)throw Error('Image dimensions exceed 8192 pixels');const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const side=Math.min(image.naturalWidth,image.naturalHeight);canvas.getContext('2d').drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,0,0,256,256);if(request!==avatarUploadRequest||$('profilePane').hidden)return;pendingAvatar=canvas.toDataURL('image/png');selectedAvatar='custom';$('profileError').textContent='Preview only · Apply to save';renderProfile()}finally{URL.revokeObjectURL(url)}
 }catch(error){if(request===avatarUploadRequest)$('profileError').textContent=error.message}
};

for(const [id,name] of [[1,'Andrew'],[2,'Barry'],[3,'Billy'],[4,'Brian'],[5,'Danny'],[6,'Elizabeth'],[0,'Default']]){
 const b=document.createElement('button'),image=new Image(),label=document.createElement('span');b.dataset.avatar=id;b.setAttribute('aria-label','Choose '+name);image.src='/home-art/avatar-'+id+'.png';image.alt='';label.textContent=name;b.append(image,label);b.onclick=()=>{avatarUploadRequest++;pendingAvatar=null;selectedAvatar=id;renderProfile()};$('avatarChoices').append(b);
}
const customChoice=document.createElement('button');customChoice.type='button';customChoice.hidden=true;customChoice.setAttribute('aria-label','Choose custom avatar');customChoice.innerHTML='<img alt="">Custom';customChoice.onclick=()=>{avatarUploadRequest++;if(!pendingAvatar)selectedAvatar=player.customAvatar;renderProfile()};$('avatarChoices').append(customChoice);
$('closeProfile').onclick=closeProfile;
$('profileGameSettings').onclick=()=>{closeProfile();openChipSettings()};
$('profileSignOut').onclick=()=>$('signOut').onclick();
$('applyAvatar').onclick=async()=>{
 if(avatarSaving)return;avatarUploadRequest++;avatarSaving=true;renderProfile();
 $('applyAvatar').disabled=true;$('profileError').textContent='';
 try{const r=await fetch('/local/avatar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pendingAvatar?{image:pendingAvatar}:{avatar:selectedAvatar===player?.customAvatar?'custom':selectedAvatar})}),data=await r.json();if(!r.ok)throw Error(data.error);
  player.avatar=data.avatar;player.customAvatar=data.customAvatar;pendingAvatar=null;selectedAvatar=data.avatar;document.querySelector('.localProfileAvatar').style.backgroundImage='url('+avatarSource(data.avatar)+')';localStorage.setItem('river-avatar-change',crypto.randomUUID());if(!$('profilePane').hidden)closeProfile();
 }catch(error){$('profileError').textContent=error.message}finally{avatarSaving=false;renderProfile()}
};
addEventListener('storage',async e=>{if(e.storageArea!==localStorage||e.key!=='river-avatar-change'||!player)return;try{const r=await fetch('/local/me');if(!r.ok)return;const data=await r.json();if(data.name!==player.name){location.reload();return}const clean=selectedAvatar===(player.avatar||0);player.avatar=data.avatar;player.customAvatar=data.customAvatar;document.querySelector('.localProfileAvatar').style.backgroundImage='url('+avatarSource(data.avatar)+')';if(clean&&!pendingAvatar)selectedAvatar=data.avatar;renderProfile()}catch{}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('profilePane').hidden){e.preventDefault();closeProfile()}});
if(player){$('profile').disabled=false;$('profile').onclick=openProfile;const myPage=$('chipSettings').querySelector('.settingsTabs button');myPage.disabled=false;myPage.onclick=()=>{closeChipSettings();openProfile()}}

spinUI=setupSpin(frame,()=>{catalogRequest++;$('catalog').hidden=true;size()});if(entryView==='spin')spinUI.open();

if(settingsWindow){document.title='Game Settings';openChipSettings()}

addEventListener('pagehide',stopSoundPreview);
