import type {Decision,Locale,Offer} from './model';
import {emptyEvaluation,rubrics,type Evaluation} from './evaluation.ts';
import type {DeliveryRoute,DeliveryLeg} from './shipping.ts';
export function sample(locale:Locale):Decision {
 const names={en:['Four hotel-style pillows','Cotton comfort pillow','Microfiber everyday pillow','Down-alternative premium pillow','Supplier quote · freight pending'],ru:['Четыре подушки гостиничного типа','Подушка с хлопковым чехлом','Повседневная подушка из микрофибры','Премиальная подушка с искусственным пухом','Предложение поставщика · доставка не уточнена'],hy:['Չորս հյուրանոցային ոճի բարձ','Բամբակյա երեսով հարմարավետ բարձ','Միկրոֆիբրից ամենօրյա բարձ','Պրեմիում բարձ՝ արհեստական փետուրով','Մատակարարի առաջարկ · առաքումը ճշտվում է']}[locale];
 const d:Decision = {version:1,title:names[0],quantity:4,maxQuantity:4,budget:40000,maxDays:21,offers:[
 {id:'sample-local',name:names[1],seller:'Yerevan · example retailer',source:'local',unitPrice:4800,packSize:1,quoteQuantity:4,shipping:1000,fees:0,days:2,quality:'value',url:'',observedAt:'2026-10-02',notes:'',evidence:'sample'},
 {id:'sample-temu',name:names[2],seller:'Temu · example offer',source:'temu',unitPrice:2800,packSize:2,quoteQuantity:4,shipping:0,fees:0,days:18,quality:'budget',url:'',observedAt:'2026-10-02',notes:'',evidence:'sample'},
 {id:'sample-premium',name:names[3],seller:'Alibaba · example supplier',source:'alibaba',unitPrice:5800,packSize:2,quoteQuantity:4,shipping:6500,fees:1500,days:14,quality:'premium',url:'',observedAt:'2026-10-02',notes:'',evidence:'sample'},
 {id:'sample-pending',name:names[4],seller:'Alibaba · example supplier',source:'alibaba',unitPrice:1800,packSize:2,quoteQuantity:4,shipping:null,fees:null,days:null,quality:'value',url:'',observedAt:'2026-10-02',notes:'',evidence:'sample'}]};
 d.offers=d.offers.map(o=>({...o,evaluation:illustrativeEvaluation(o)}));
 d.offers[2].routes=illustrativeRoutes(d.offers[2],locale);return d;
}

// Upgrade only the exact untouched v1 fixture. Any user change preserves the draft.
export function upgradeOriginalSample(d:Decision):Decision {
 if(d.offers.some(o=>o.evaluation)||d.offers.length!==4)return d;
 for(const locale of ['en','ru','hy'] as const){
  const next=sample(locale),old=structuredClone(next);
  for(const o of old.offers){delete o.evaluation;delete o.routes;}
  old.offers[1].shipping=2500;
  const sameBrief=(['title','quantity','maxQuantity','budget','maxDays'] as const).every(k=>d[k]===old[k]);
  if(sameBrief&&old.offers.every((o,i)=>Object.entries(o).every(([key,value])=>d.offers[i][key as keyof Offer]===value)))return next;
 }
 return d;
}

function illustrativeRoutes(offer:Offer,locale:Locale):DeliveryRoute[]{
 const labels={en:['Forwarded delivery · example','Transit-only quote · example'],ru:['Через посредника · пример','Только перевозка · пример'],hy:['Միջնորդով առաքում · օրինակ','Միայն փոխադրում · օրինակ']}[locale];
 const evidence={reference:'SYNTHETIC demonstration fixture; not a provider quote',observedAt:'2026-10-02'};
 const evaluation=structuredClone(offer.evaluation!);evaluation.costs.find(c=>c.kind==='freight')!.amount=4000;
 const stages=['readiness','origin','warehouse','departure','transit','customs','lastMile'] as const;
 const legs:DeliveryLeg[]=stages.map((stage,i)=>({id:stage,stage,dependsOn:i?[stages[i-1]]:[],minDays:stage==='transit'?4:1,maxDays:stage==='transit'?6:1,calendar:{kind:'calendar',weekend:[],holidays:[],reference:'Synthetic calendar-day example'},evidence}));
 const route:DeliveryRoute={id:'sample-forwarded',label:labels[0],provider:'Example carrier',warehouseReference:'Synthetic receiving reference',quoteQuantity:4,evaluation,freight:{version:1,basis:'maximum',scope:'parcel',sequence:'minimumThenRound',volumeMethod:'divisor',factor:5000,stepKg:1,minimumKg:0,minimumCharge:0,rateLow:500,rateHigh:500,surcharge:0,currency:'AMD',confirmed:true,evidence,validUntil:'2026-10-09',parcels:[{count:2,grossKg:3.5,lengthCm:43,widthCm:27,heightCm:15,measurement:'quoted'}]},arrival:{version:1,kind:'forwarded',scope:'door',startDate:'2026-10-02',validUntil:'2026-10-09',legs}};
 return [route,{...structuredClone(route),id:'sample-transit',label:labels[1],arrival:{...route.arrival!,scope:'transit',legs:[{...legs[4],dependsOn:[]}]}}];
}

function illustrativeEvaluation(offer:Offer):Evaluation {
 const e=emptyEvaluation();
 const evidence={reference:'SYNTHETIC demonstration fixture; not a seller quote or verified claim',observedAt:'2026-10-02'};
 e.validUntil='2026-10-09';
 const pending=offer.id==='sample-pending';
 for(const key of Object.keys(e.gates) as (keyof typeof e.gates)[])e.gates[key]={status:pending?'pending':'pass',reason:'Illustrative policy case only',evidence};
 e.costs=e.costs.map(c=>{
  const amount=c.kind==='goods'?offer.unitPrice*4:c.kind==='freight'?offer.shipping:c.kind==='tax'?offer.fees:null;
  const known=c.kind==='goods'||(c.kind==='freight'&&offer.shipping!==null)||(c.kind==='tax'&&offer.fees!==null);
  const unknown=pending&&(c.kind==='freight'||c.kind==='tax');
  return {...c,status:known?'known':unknown?'unknown':'notApplicable',amount:known?amount:null,reason:'Synthetic whole-order cost allocation',evidence};
 });
 const rating=offer.id==='sample-premium'?4.6:offer.id==='sample-temu'?3.2:4;
 if(!pending)e.assessments.product=Object.fromEntries(Object.keys(rubrics.product).map(k=>[k,{applicable:true,rating,reason:'Illustrative rating; not market evidence',evidence}]));
 return e;
}

