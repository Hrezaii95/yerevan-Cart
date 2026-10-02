'use client';
import {ExternalLink,Plus,Search,ArrowUpRight} from 'lucide-react';
import type {Locale} from '@/lib/model';
import {sourceSearchLinks,type SearchResponse,type SearchHit} from '@/lib/search';
import {searchCopy} from '@/lib/search-copy';
import {ProductVisual} from './product-visual';
export function SearchResults({locale,query,data,busy,error,onAdd,onRetry}:{locale:Locale;query:string;data:SearchResponse|null;busy:boolean;error:string;onAdd:(hit:SearchHit)=>void;onRetry:()=>void}){
 const c=searchCopy[locale];
 return <section className="discovery" aria-busy={busy} aria-label={c.results}>
 <div className="discovery-heading"><div><span className="eyebrow">{c.live}</span><h2>{c.results}{data&&<> <span className="count">{data.results.length}</span></>}</h2>{data&&<p>“{data.query}” · {c.checked} {new Date(data.observedAt).toLocaleString(locale,{timeZone:'Asia/Yerevan'})}</p>}</div></div>
 {busy?<div className="search-loading" role="status"><span className="search-spinner"/>{c.searching}<div className="skeleton-grid">{[0,1,2].map(i=><div key={i}/>)}</div></div>:error?<div className="search-message" role="alert"><p>{error==='limit'?c.limit:c.failed}</p><button className="button outline" onClick={onRetry}>{c.retry}</button></div>:data&&!data.results.length?<div className="empty-state"><Search size={34}/><h2>{c.empty}</h2><p>{c.emptyBody}</p></div>:data?<><p className="search-context">{c.note}</p><div className="search-grid">{data.results.map((hit,i)=><article className="search-product" key={hit.url}><a href={hit.url} target="_blank" rel="noreferrer"><ProductVisual key={hit.image} name={hit.title} image={hit.image} variant={i} label={c.illustration}/></a><div className="search-product-body"><span className="store-domain">{hit.domain}<ArrowUpRight size={14}/></span><h3><a href={hit.url} target="_blank" rel="noreferrer">{hit.title}</a></h3>{hit.description&&<p className="search-description">{hit.description}</p>}<span className="quote-pending">{c.lead}</span><div className="search-card-actions"><a className="button outline" href={hit.url} target="_blank" rel="noreferrer">{c.open}<ExternalLink size={14}/></a><button className="button primary" onClick={()=>onAdd(hit)}><Plus size={15}/>{c.add}</button></div></div></article>)}</div></>:null}
 <div className="direct-search"><strong>{c.direct}</strong>{sourceSearchLinks(query).map(l=><a key={l.name} href={l.url} target="_blank" rel="noreferrer">{l.name}<ExternalLink size={14}/></a>)}</div>
 </section>;
}
