import {calculate,validateDecision,type Decision,type Result} from './model.ts';
import {yerevanDate} from './evaluation.ts';
export type Option={id:string;offerId:string;routeId:string|undefined;quantity:number;result:Result;dominated:boolean;dominatedBy:string[]};
/** Enumerate supplied quantity quotes only. Never interpolate a tariff or invent a larger order quote. */
export function compareOptions(d:Decision,asOf=yerevanDate()):Option[]{
 try{validateDecision(d)}catch{return []}
 const options:Option[]=d.offers.flatMap(offer=>[undefined,...offer.routes??[]].map(route=>{
  const quantity=route?.quoteQuantity??offer.quoteQuantity??Math.ceil(d.quantity/offer.packSize)*offer.packSize;
  const variant={...offer,selectedRouteId:route?.id,purchaseQuantity:quantity};
  const result=calculate({...d,offers:[variant]},asOf)[0];
  return {id:JSON.stringify([offer.id,route?.id??null,quantity]),offerId:offer.id,routeId:route?.id,quantity,result,dominated:false,dominatedBy:[]};
 })).filter(o=>!!o.result);
 for(const a of options){if(!a.result.eligible)continue;for(const b of options){
  if(a===b||!b.result.eligible||a.quantity!==b.quantity)continue;
  const x=a.result,y=b.result;
  // Intervals must not overlap in a way that reverses the cost comparison.
  if(y.total!<=x.totalLow!&&y.qualityScore!>=x.qualityScore!&&y.offer.days!<=x.offer.days!&&(y.total!<x.totalLow!||y.qualityScore!>x.qualityScore!||y.offer.days!<x.offer.days!))a.dominatedBy.push(b.id);
 }a.dominated=a.dominatedBy.length>0;}
 return options;
}
export function applyOption(d:Decision,option:Pick<Option,'offerId'|'routeId'|'quantity'>):Decision{
 const offer=d.offers.find(o=>o.id===option.offerId),route=offer?.routes?.find(r=>r.id===option.routeId);
 if(!offer||option.routeId&&!route||option.quantity!==(route?.quoteQuantity??offer.quoteQuantity))throw new Error('invalid');
 return validateDecision({...d,offers:d.offers.map(o=>o.id===option.offerId?{...o,selectedRouteId:option.routeId,purchaseQuantity:option.quantity}:o)});
}
/** Deliberately narrow: no savings claim across different items, quantities or evidence snapshots. */
export function comparableSavings(current:Option,baseline:Option|undefined):{low:number;high:number}|null{
 if(!baseline||current.id===baseline.id||current.offerId!==baseline.offerId||current.quantity!==baseline.quantity)return null;
 const a=current.result,b=baseline.result;
 if(!a.eligible||!b.eligible||a.total===null||a.totalLow===null||b.total===null||b.totalLow===null||!a.evaluation||!b.evaluation)return null;
 const dates=(r:Result)=>[r.offer.observedAt,...r.evaluation!.lines.flatMap(c=>[c.evidence?.observedAt??'',c.rateEvidence?.observedAt??''])].join('|');
 if(dates(a)!==dates(b))return null;
 const low=Math.round((b.totalLow-a.total)*100)/100,high=Math.round((b.total-a.totalLow)*100)/100;
 return low>0?{low,high}:null;
}
