import {validateRoute,inspectRoute,type DeliveryRoute} from './shipping.ts';
import {validateEvaluation,evaluate,yerevanDate,type Evaluation} from './evaluation.ts';
export type Locale = 'en'|'hy'|'ru';
export type Offer = {purchaseQuantity?:number;routes?:DeliveryRoute[];selectedRouteId?:string;evaluation?:Evaluation;id:string;name:string;seller:string;source:'local'|'alibaba'|'temu'|'other';unitPrice:number;packSize:number;quoteQuantity?:number;shipping:number|null;fees:number|null;days:number|null;quality:'premium'|'value'|'budget';url:string;observedAt:string;notes:string;evidence:'sample'|'user'|'quote'|'historical'};
export type Decision = {version:1;context?:'historical-pillows-2026-10-01';title:string;quantity:number;maxQuantity:number;budget:number;maxDays:number;offers:Offer[]};
export type Result = {route:ReturnType<typeof inspectRoute>|null;qualityScore:number|null;effectivePerNeededPiece:number|null;evaluation:ReturnType<typeof evaluate>|null;offer:Offer;quantity:number;goods:number;subtotalLow:number;subtotal:number;totalLow:number|null;total:number|null;perPiece:number|null;eligible:boolean;reasons:('quantity'|'incomplete'|'budget'|'deadline'|'evidence'|'expired'|'quality')[]};
export function hasFreeDelivery(r:Result){return r.total!==null&&!r.reasons.includes('expired')&&!!r.evaluation&&r.evaluation.lines.filter(l=>['origin','handling','freight','lastMile'].includes(l.kind)).every(l=>l.status==='notApplicable'||(l.status==='known'&&l.amd===0&&l.amdHigh===0));}
const object=(x:unknown):Record<string,unknown>=>{if(!x||typeof x!=='object'||Array.isArray(x))throw new Error('invalid');return x as Record<string,unknown>};
const str=(x:unknown,max:number)=>{if(typeof x!=='string'||x.length>max)throw new Error('invalid');return x.trim()};
const num=(x:unknown,min:number,max:number,integer=false)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max||(integer&&!Number.isInteger(x)))throw new Error('invalid');return x};
const choice=<T extends string>(x:unknown,values:readonly T[]):T=>{if(typeof x!=='string'||!values.includes(x as T))throw new Error('invalid');return x as T};
export function validateDecision(input:unknown):Decision {
 const d=object(input); if(d.version!==1)throw new Error('invalid');
 const title=str(d.title,180);if(!title)throw new Error('invalid');
 const quantity=num(d.quantity,1,10000,true),maxQuantity=num(d.maxQuantity,quantity,10000,true);
 if(!Array.isArray(d.offers)||d.offers.length>20)throw new Error('invalid');
 const ids=new Set<string>();
 const offers=d.offers.map((v):Offer=>{const o=object(v),id=str(o.id,80),name=str(o.name,180),seller=str(o.seller,120);if(!id||!name||!seller||ids.has(id))throw new Error('invalid');ids.add(id);
 const url=str(o.url,2000);if(url){let u:URL;try{u=new URL(url)}catch{throw new Error('invalid')};if(u.protocol!=='https:'||u.username||u.password||u.hostname==='localhost'||u.hostname.endsWith('.local')||/^[\d.]+$/.test(u.hostname)||u.hostname.includes(':'))throw new Error('invalid')}
 const observedAt=str(o.observedAt,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(observedAt)||!Number.isFinite(Date.parse(observedAt))||new Date(observedAt).toISOString().slice(0,10)!==observedAt)throw new Error('invalid');
 const routes=o.routes===undefined?undefined:Array.isArray(o.routes)&&o.routes.length<=3?o.routes.map(validateRoute):(()=>{throw new Error('invalid')})();const selectedRouteId=o.selectedRouteId===undefined?undefined:str(o.selectedRouteId,80);if(routes&&new Set(routes.map(r=>r.id)).size!==routes.length||selectedRouteId&&!routes?.some(r=>r.id===selectedRouteId))throw new Error('invalid');
 return {...(o.purchaseQuantity===undefined?{}:{purchaseQuantity:num(o.purchaseQuantity,1,10000,true)}),...(routes?{routes}:{}),...(selectedRouteId?{selectedRouteId}:{}),...(o.evaluation===undefined?{}:{evaluation:validateEvaluation(o.evaluation)}),id,name,seller,quoteQuantity:o.quoteQuantity===undefined?Math.ceil(quantity/num(o.packSize,1,10000,true))*num(o.packSize,1,10000,true):num(o.quoteQuantity,1,10000,true),source:choice(o.source,['local','alibaba','temu','other']),unitPrice:num(o.unitPrice,0,100000000),packSize:num(o.packSize,1,10000,true),shipping:o.shipping===null?null:num(o.shipping,0,100000000),fees:o.fees===null?null:num(o.fees,0,100000000),days:o.days===null?null:num(o.days,0,365,true),quality:choice(o.quality,['premium','value','budget']),url,observedAt,notes:str(o.notes,3000),evidence:choice(o.evidence,['sample','user','quote','historical'])};});
 if(d.context!==undefined&&d.context!=='historical-pillows-2026-10-01')throw new Error('invalid');
 return {version:1,...(d.context?{context:d.context as Decision['context']}:{}),title,quantity,maxQuantity,budget:num(d.budget,1,1000000000),maxDays:num(d.maxDays,1,365,true),offers};
}
export function calculate(d:Decision, asOf=yerevanDate()):Result[] {
 if(!d.title.trim()||d.title.length>180||d.maxDays>365||d.budget>1e9||d.maxQuantity>10000||d.maxQuantity<d.quantity||!Number.isInteger(d.quantity)||d.quantity<1||d.quantity>10000||!Number.isInteger(d.maxQuantity)||d.maxQuantity<1||!Number.isFinite(d.budget)||d.budget<=0||!Number.isInteger(d.maxDays)||d.maxDays<1)return [];
 return d.offers.map(baseOffer=>{
  const selected=baseOffer.routes?.find(r=>r.id===baseOffer.selectedRouteId);
  const route=selected?inspectRoute(selected,asOf):null;
  const offer=selected?{...baseOffer,evaluation:selected.evaluation,quoteQuantity:selected.quoteQuantity,days:route!.days}:baseOffer;
  const quantity=offer.purchaseQuantity??Math.ceil(d.quantity/offer.packSize)*offer.packSize;
  const aggregateGoods=Math.round(offer.unitPrice*quantity*100)/100;
  const quantityChanged=offer.quoteQuantity===undefined||offer.quoteQuantity!==quantity;
  const evaluation=offer.evaluation?evaluate(offer.evaluation,asOf):null;
  const quotedGoods=evaluation?.lines.find(c=>c.kind==='goods')?.amd;
  const goods=quantityChanged?aggregateGoods:quotedGoods??aggregateGoods;
  const subtotal=quantityChanged?goods:evaluation?.subtotal??Math.round((goods+(offer.shipping??0)+(offer.fees??0))*100)/100;
  const total=quantityChanged||route?.missing.some(x=>x==='freight'||x==='warehouse')?null:evaluation?.total??null;
  const totalLow=total===null?null:evaluation?.totalLow??total;const subtotalLow=quantityChanged?goods:evaluation?.subtotalLow??subtotal;
  const reasons:Result['reasons']=[];
  if(quantity>d.maxQuantity||quantity<d.quantity||quantity%offer.packSize!==0)reasons.push('quantity');
  if(total===null)reasons.push('incomplete');
  if(total!==null&&total>d.budget)reasons.push('budget');
  if(offer.days===null||offer.days>d.maxDays)reasons.push('deadline');
  if(!evaluation?.gatesPass||route&&route.missing.length)reasons.push('evidence');
  if(!evaluation?.fresh || offer.observedAt>asOf)reasons.push('expired');
  const qualityScore=evaluation?.qualityScore??null;
  if(qualityScore===null||qualityScore<60)reasons.push('quality');
  return {route,offer,quantity,goods,subtotalLow,subtotal,totalLow,total,qualityScore,evaluation,effectivePerNeededPiece:total===null?null:total/d.quantity,perPiece:total===null?null:total/quantity,eligible:reasons.length===0,reasons};
 });
}
export function selectTiers(results:Result[]):Record<'premium'|'value'|'budget',string|null> {
 const eligible=results.filter(r=>r.eligible&&r.total!==null&&r.qualityScore!==null);
 const cheapest=(a:Result,b:Result)=>a.total!-b.total! || a.offer.id.localeCompare(b.offer.id);
 return {
  premium:eligible.filter(r=>r.qualityScore!>=85).sort((a,b)=>b.qualityScore!-a.qualityScore!||cheapest(a,b))[0]?.offer.id??null,
  value:eligible.filter(r=>r.qualityScore!>=70).sort(cheapest)[0]?.offer.id??null,
  budget:eligible.filter(r=>r.qualityScore!>=60).sort(cheapest)[0]?.offer.id??null,
 };
}
export function reviseOffer(previous:Offer|null,next:Offer):Offer {
 if (!previous) return next;
 const changed=(['name','seller','source','unitPrice','packSize','quoteQuantity','shipping','fees','days','url','observedAt'] as const).some(k=>previous[k]!==next[k]);
 return {...next,...(previous.purchaseQuantity===undefined?{}:{purchaseQuantity:previous.purchaseQuantity}),...(previous.evaluation?{evaluation:{...previous.evaluation,reviewRequired:changed||previous.evaluation.reviewRequired===true}}:{}),...(previous.routes?{routes:previous.routes.map(r=>({...r,evaluation:{...r.evaluation,reviewRequired:changed||r.evaluation.reviewRequired===true}}))}:{}),...(previous.selectedRouteId?{selectedRouteId:previous.selectedRouteId}:{})};
}

