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
 // Native TableGroups.sortFunc + MathUtil.compareNumber: descending within comparable Hold’em rules.
 // shortcut: local groups share one practice currency/type; operator featured/password/currency gates require actual metadata.
 return rows.sort((a,b)=>(b.blind-a.blind)||((b.minBuyIn??b.stack)-(a.minBuyIn??a.stack))||((b.ante??0)-(a.ante??0))||(b.capacity-a.capacity)||0);
}
