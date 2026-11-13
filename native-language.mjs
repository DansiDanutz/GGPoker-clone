// Native stored language codes are exact; unknown preferences use English.
export function languageCode(raw,codes){return typeof raw==='string'&&codes.includes(raw)?raw:'en'}
// Callers render translations as text, never native markup or executable HTML.
export function languageText(strings,key,values=[]){const text=strings&&Object.hasOwn(strings,key)&&typeof strings[key]==='string'?strings[key]:key;return text.replace(/\{(\d+)\}/g,(token,index)=>Array.isArray(values)&&Object.hasOwn(values,index)&&['string','number'].includes(typeof values[index])?String(values[index]):token)}
export function languageCatalog(value,expected){
 if(!value||Array.isArray(value)||value.code!==expected||!value.strings||Array.isArray(value.strings)||typeof value.strings!=='object'||Object.values(value.strings).some(v=>typeof v!=='string'))throw Error('Invalid language catalog');
 return value.strings;
}

export function installTableLanguage(root,changed){
 let strings={},generation=0;
 const apply=()=>{let updated=false;for(const node of root.querySelectorAll('[data-native-label]')){if(!node.hasAttribute('data-native-fallback'))node.dataset.nativeFallback=node.textContent;const key=node.dataset.nativeLabel,text=Object.hasOwn(strings,key)?languageText(strings,key,(()=>{try{return JSON.parse(node.dataset.nativeValues||'[]')}catch{return []}})()):node.dataset.nativeFallback;if(node.textContent!==text){node.textContent=text;updated=true}}if(updated)changed?.()};
 const refresh=async()=>{const ticket=++generation;try{
  const manifestResponse=await fetch('/home-art/native-language-manifest.json');if(!manifestResponse.ok)throw Error('Language list unavailable');const manifest=await manifestResponse.json();if(!Array.isArray(manifest.languages)||!manifest.languages.length||manifest.languages.some(l=>!l||typeof l.code!=='string'||!/^[a-z]{2}(?:-[a-z]{2})?$/.test(l.code)))throw Error('Invalid language list');
  const code=languageCode(localStorage.getItem('river-language'),manifest.languages.map(l=>l.code)),response=await fetch('/home-art/native-language-'+code+'.json');if(!response.ok)throw Error('Language catalog unavailable');const next=languageCatalog(await response.json(),code);if(ticket!==generation)return false;strings=next;root.documentElement.lang=code;delete root.documentElement.dataset.nativeLanguageError;apply();return true;
 }catch(error){if(ticket===generation)root.documentElement.dataset.nativeLanguageError=error.message;return false}};
 const observer=new MutationObserver(apply);observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-native-label','data-native-values']});addEventListener('storage',event=>{if(event.key===null||event.key==='river-language')refresh()});apply();return {refresh,ready:refresh()};
}
