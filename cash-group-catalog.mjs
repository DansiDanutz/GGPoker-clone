// Local type identity comes from the same normalized rules as Group funding.
export function cashGroupCatalog(tables){
 const groups=new Map(),rows=[];
 for(const table of tables){
  const key=typeof table.groupId==='string'&&/^[a-f0-9]{64}$/.test(table.groupId)?table.groupId:null,group=key&&groups.get(key);
  if(!group){const row={...table,members:[table]};rows.push(row);if(key)groups.set(key,row);continue}
  const members=[...group.members,table],occupied=Number.isInteger(group.occupied)&&Number.isInteger(table.occupied)?group.occupied+table.occupied:null;
  if(!group.open&&table.open)Object.assign(group,table);
  group.members=members;group.occupied=occupied;
 }
 return rows.sort(cashRuleOrder);
}

// Native Tables/TableGroups + MathUtil: descending comparable rules in one practice currency/type.
// shortcut: operator featured/password/timed/currency/index branches need actual metadata before mapping.
function cashRuleOrder(a,b){return (b.blind-a.blind)||((b.minBuyIn??b.stack)-(a.minBuyIn??a.stack))||((b.ante??0)-(a.ante??0))||(b.capacity-a.capacity)||0}
export function cashTableCatalog(tables){return [...tables].sort((a,b)=>cashRuleOrder(a,b)||(Number.isInteger(a.occupied)&&Number.isInteger(b.occupied)?b.occupied-a.occupied:0))}

// Native game-level information describes the active catalog, not a picked player/table.
export function cashGameInformation(tables){
 if(!tables.length)return [];
 const numbers=key=>[...new Set(tables.map(key))].sort((a,b)=>a-b).join(' / ');
 const rows=[
  {key:'MobileCurrencyTitle',title:'Currency',value:'Play money'},
  {key:'MobileMissionGameType',title:'Game Type',value:'Hold’em',valueKey:'CategoryHoldem'},
  {key:'TableMax',title:'Table Max',value:numbers(t=>t.capacity)},
  {key:'LabelBlinds',title:'Blinds',value:tables.some(t=>t.ante>0)?'SB, BB, Ante':'SB, BB'},
  {key:'TimeToAct',title:'Time to Act',value:numbers(t=>t.actionSeconds??90)+' seconds'},
  {key:'MinimumPlayersForDealing',title:'Minimum Players for Dealing',value:'2 Players',valueKey:'MobileTwoPlayers',explanation:'Dealing will only start when minimum number of players are met',explanationKey:'DealingWillOnlyStartWhen'}
 ];
 const unique=values=>[...new Set(values)],clocks=[],cards=tables.filter(t=>t.timeChipCount>0);
 if(tables.some(t=>t.timeBankSeconds>0)||!cards.length){
  const banks=unique(tables.map(t=>t.timeBankSeconds||0)).sort((a,b)=>a-b);
  clocks.push({key:'MobileTimeBank',title:'Time Bank',value:banks.map(n=>n?n+' seconds':'Off').join(' / '),...(banks.length===1&&banks[0]===0?{valueKey:'TableOptionAnimationOff'}:{})});
 }
 if(cards.length)clocks.push({key:'TimeBankCard',title:'Time Bank Card',value:unique(tables.map(t=>t.timeChipCount||0)).sort((a,b)=>a-b).map(n=>n?n+' '+(n===1?'card':'cards'):'Off').join(' / '),explanation:unique(cards.map(t=>t.timeChipCount+' '+(t.timeChipCount===1?'card':'cards')+' per seating, '+t.freeTimeChipSecondsPerUnit+' seconds per card, max '+t.maxTimeChipsPerAction+' per turn')).join('; ')});
 rows.splice(5,0,...clocks);
 const multiple=unique(tables.map(t=>t.rimt===true)).sort();
 rows.push({key:'MultipleDealing',title:'Multiple Dealing',paragraph:2,icon:'native-cash-game-info-multiple.png',value:multiple.map(on=>on?'On':'Off').join(' / '),...(multiple.length===1?{valueKey:multiple[0]?'TableOptionAnimationOn':'TableOptionAnimationOff'}:{})});
 return rows;
}
