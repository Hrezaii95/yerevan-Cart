export type SearchSource='all'|'local'|'temu'|'alibaba';
export type SearchHit={url:string;title:string;description:string;image:string|null;domain:string};
export type SearchResponse={query:string;results:SearchHit[];observedAt:string;cached:boolean};
export const usageCleanupSQL="DELETE FROM search_usage WHERE (id LIKE 'visitor:%' AND id<?) OR (id LIKE 'day:%' AND id<?) OR (id LIKE 'month:%' AND id<?)";
export function validateSearch(input:unknown){
 const b=input as Record<string,unknown>;
 if(!b||typeof b.query!=='string'||!b.query.trim()||b.query.length>180)throw new Error('invalid');
 const locale=b.locale??'en',source=b.source??'all';
 if(!['en','ru','hy'].includes(String(locale))||!['all','local','temu','alibaba'].includes(String(source)))throw new Error('invalid');
 return {query:b.query.trim().replace(/\s+/g,' '),locale:String(locale),source:source as SearchSource};
}
export function providerQuery(query:string,source:SearchSource){return `${query} ${source==='temu'?'site:temu.com':source==='alibaba'?'site:alibaba.com':source==='local'?'buy price site:am':'buy Armenia Yerevan price'}`;}
function https(value:unknown){if(typeof value!=='string'||value.length>2000)return null;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!/^(localhost|127\.|0\.|10\.|192\.168\.|\[)/i.test(u.hostname)?u.href:null}catch{return null}}
export function normalizeResults(data:{web?:unknown[];images?:unknown[]}):SearchHit[]{
 const items=new Map<string,SearchHit>();
 for(const raw of [...(Array.isArray(data.web)?data.web:[]),...(Array.isArray(data.images)?data.images:[])]){
  if(!raw||typeof raw!=='object')continue;const row=raw as Record<string,unknown>,url=https(row.url);
  if(!url||typeof row.title!=='string'||!row.title.trim())continue;
  const existing=items.get(url),image=https(row.imageUrl);
  if(existing){if(image&&!existing.image)existing.image=image;continue;}
  items.set(url,{url,title:row.title.slice(0,180),description:typeof row.description==='string'?row.description.slice(0,700):'',image,domain:new URL(url).hostname.replace(/^www\./,'')});
 }
 return [...items.values()].sort((a,b)=>Number(!!b.image)-Number(!!a.image)).slice(0,12);
}
export function sourceSearchLinks(query:string){const q=encodeURIComponent(query);return [{name:'Temu',url:`https://www.temu.com/search_result.html?search_key=${q}`},{name:'Alibaba',url:`https://www.alibaba.com/trade/search?SearchText=${q}`},{name:'List.am',url:`https://www.list.am/category?q=${q}`}];}
