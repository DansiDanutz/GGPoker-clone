import {randomInt} from 'node:crypto';
export function validCashGroupPreferences(x){return !!(x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===4&&['stack','style','speed'].every(k=>Number.isInteger(x[k])&&x[k]>=0&&x[k]<=2)&&Number.isInteger(x.location)&&x.location>=0&&x.location<=1)}
export function rankCashGroupTables(rows,preferences){
 if(preferences===undefined)return [...rows];if(!validCashGroupPreferences(preferences))throw Object.assign(Error('Choose valid table preferences'),{status:400});
 // Local policy: measured values and equal-weight normalized distances; native private matching thresholds are unknown.
 const criteria=['stack','style','speed'].map(key=>{const values=rows.map(r=>r.metrics[key]).filter(Number.isFinite).sort((a,b)=>a-b),middle=values.length? (values[Math.floor((values.length-1)/2)]+values[Math.floor(values.length/2)])/2:0;return {key,values,middle,span:values.length?values.at(-1)-values[0]:0}});
 return rows.map((row,index)=>({row,index,tie:preferences.location===0?randomInt(2147483648):index,score:criteria.reduce((sum,{key,values,middle,span})=>{if(!values.length)return sum;const value=row.metrics[key];if(!Number.isFinite(value))return sum+2;if(!span)return sum;return sum+(preferences[key]===0?(value-values[0])/span:preferences[key]===2?(values.at(-1)-value)/span:Math.abs(value-middle)/span)},0)})).sort((a,b)=>a.score-b.score||a.tie-b.tie||a.index-b.index).map(r=>r.row);
}
