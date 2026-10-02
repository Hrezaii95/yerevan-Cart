import {historyCopy,historicalSources} from '@/lib/historical';
import type {Locale} from '@/lib/model';
export function HistoricalContext({locale,quantity,onLoad}:{locale:Locale;quantity:number;onLoad:(quantity:2|4)=>void}){
 const t=historyCopy[locale];
 return <section className="historical-context"><span className="eyebrow">{t.label}</span><p>{t.intro}</p><div className="history-quantity"><strong>{t.quantity}</strong>{([2,4] as const).map(n=><button type="button" key={n} className="button outline" aria-pressed={quantity===n} onClick={()=>onLoad(n)}>{n}</button>)}</div><p className="warning-note">{t.notice}</p><details><summary>{t.evidence}</summary><p>{t.limits}</p><p>{t.weights}</p><p>{t.fx}</p><p>{t.transit}</p><p>{t.legacy}</p><strong>{t.sources}</strong><div className="history-links">{Object.entries(historicalSources).map(([name,url])=><a key={name} href={url} target="_blank" rel="noreferrer">{name==='product'?'JHT':name==='price'?'JHT · USD':name} ↗</a>)}</div></details></section>;
}
