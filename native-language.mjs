// Native stored language codes are exact; unknown preferences use English.
export function languageCode(raw,codes){return typeof raw==='string'&&codes.includes(raw)?raw:'en'}
// Callers render translations as text, never native markup or executable HTML.
export function languageText(strings,key){return strings&&Object.hasOwn(strings,key)&&typeof strings[key]==='string'?strings[key]:key}
export function languageCatalog(value,expected){
 if(!value||Array.isArray(value)||value.code!==expected||!value.strings||Array.isArray(value.strings)||typeof value.strings!=='object'||Object.values(value.strings).some(v=>typeof v!=='string'))throw Error('Invalid language catalog');
 return value.strings;
}
