import {env} from 'cloudflare:workers';
import {database} from '@/lib/store';
import {readBody,sameOrigin} from '@/lib/http';
import {normalizeResults,providerQuery,validateSearch,usageCleanupSQL} from '@/lib/search';

const headers={'Cache-Control':'no-store'};
async function digest(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('');}
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'forbidden'},{status:403,headers});
 let input:ReturnType<typeof validateSearch>;
 try{input=validateSearch(await readBody(request));}catch{return Response.json({error:'invalid'},{status:400,headers});}
 const key=env.FIRECRAWL_API_KEY;
 if(!key)return Response.json({error:'unavailable'},{status:503,headers});
 try{
  const db=database(),now=new Date(),day=now.toISOString().slice(0,10);
  const cacheKey=await digest(JSON.stringify(input));
  const cached=await db.prepare('SELECT payload FROM search_cache WHERE id=? AND expires>?').bind(cacheKey,now.toISOString()).first<{payload:string}>();
  if(cached)return Response.json({...JSON.parse(cached.payload),cached:true},{headers});
  // Quotas are reserved atomically before the paid call; failed calls still consume a slot.
  // A hard monthly cap protects the owner's account even if visitor identities rotate.
  const visitor=await digest(day+':'+(request.headers.get('cf-connecting-ip')??'shared-preview'));
  for(const [id,limit] of [[`visitor:${day}:${visitor}`,10],[`day:${day}`,40],[`month:${day.slice(0,7)}`,150]] as const){
   const r=await db.prepare('INSERT INTO search_usage(id,used) VALUES(?,1) ON CONFLICT(id) DO UPDATE SET used=used+1 WHERE used<?').bind(id,limit).run();
   if(!r.meta.changes)return Response.json({error:'limit'},{status:429,headers:{...headers,'Retry-After':'3600'}});
  }
  const upstream=await fetch('https://api.firecrawl.dev/v2/search',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({query:providerQuery(input.query,input.source),limit:5,sources:['web','images'],safe:true,timeout:25000,domainTools:false,excludeDomains:['pinterest.com','facebook.com','instagram.com','youtube.com']}),signal:AbortSignal.timeout(30000)});
  if(!upstream.ok)throw new Error('provider');
  const data=await upstream.json() as {success?:boolean;data?:{web?:unknown[];images?:unknown[]}};
  if(!data.success||!data.data)throw new Error('provider');
  const response={query:input.query,results:normalizeResults(data.data),observedAt:now.toISOString(),cached:false};
  await db.prepare('INSERT INTO search_cache(id,payload,expires) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,expires=excluded.expires').bind(cacheKey,JSON.stringify(response),new Date(now.getTime()+12*3600000).toISOString()).run();
  await db.batch([db.prepare('DELETE FROM search_cache WHERE expires<?').bind(now.toISOString()),db.prepare(usageCleanupSQL).bind(`visitor:${day}:`,`day:${day}`,`month:${day.slice(0,7)}`)]);
  return Response.json(response,{headers});
 }catch{return Response.json({error:'unavailable'},{status:503,headers});}
}
