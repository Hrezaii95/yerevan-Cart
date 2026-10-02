import type {Decision,Locale,Offer} from './model';
import {emptyEvaluation,rubrics,type Evaluation} from './evaluation.ts';
export function sample(locale:Locale):Decision {
 const names={en:['Four hotel-style pillows','Cotton comfort pillow','Microfiber everyday pillow','Down-alternative premium pillow','Supplier quote · freight pending'],ru:['Четыре подушки гостиничного типа','Подушка с хлопковым чехлом','Повседневная подушка из микрофибры','Премиальная подушка с искусственным пухом','Предложение поставщика · доставка не уточнена'],hy:['Չորս հյուրանոցային ոճի բարձ','Բամբակյա երեսով հարմարավետ բարձ','Միկրոֆիբրից ամենօրյա բարձ','Պրեմիում բարձ՝ արհեստական փետուրով','Մատակարարի առաջարկ · առաքումը ճշտվում է']}[locale];
 const d:Decision = {version:1,title:names[0],quantity:4,maxQuantity:4,budget:40000,maxDays:21,offers:[
 {id:'sample-local',name:names[1],seller:'Yerevan · example retailer',source:'local',unitPrice:4800,packSize:1,quoteQuantity:4,shipping:1000,fees:0,days:2,quality:'value',url:'',observedAt:'2026-10-02',notes:'',evidence:'sample'},
 {id:'sample-temu',name:names[2],seller:'Temu · example offer',source:'temu',unitPrice:2800,packSize:2,quoteQuantity:4,shipping:0,fees:0,days:18,quality:'budget',url:'',observedAt:'2026-10-02',notes:'',evidence:'sample'},
 {id:'sample-premium',name:names[3],seller:'Alibaba · example supplier',source:'alibaba',unitPrice:5800,packSize:2,quoteQuantity:4,shipping:6500,fees:1500,days:14,quality:'premium',url:'',observedAt:'2026-10-02',notes:'',evidence:'sample'},
 {id:'sample-pending',name:names[4],seller:'Alibaba · example supplier',source:'alibaba',unitPrice:1800,packSize:2,quoteQuantity:4,shipping:null,fees:null,days:null,quality:'value',url:'',observedAt:'2026-10-02',notes:'',evidence:'sample'}]};
 d.offers=d.offers.map(o=>({...o,evaluation:illustrativeEvaluation(o)}));return d;
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

