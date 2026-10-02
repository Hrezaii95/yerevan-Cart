import {date,yerevanDate,validateEvaluation,type Evidence} from './evaluation.ts';
export type Parcel={count:number;grossKg:number|null;lengthCm:number|null;widthCm:number|null;heightCm:number|null;measurement:'measured'|'quoted'|'assumed'};
export type FreightPlan={version:1;basis:'actual'|'volumetric'|'maximum';scope:'parcel'|'shipment';sequence:'minimumThenRound'|'roundThenMinimum';volumeMethod:'divisor'|'density';factor:number|null;stepKg:number|null;minimumKg:number|null;minimumCharge:number|null;rateLow:number|null;rateHigh:number|null;surcharge:number|null;currency:string;confirmed:boolean;evidence:Evidence|null;validUntil:string|null;parcels:Parcel[]};
export const deliveryStages=['readiness','origin','warehouse','departure','transit','customs','lastMile','door'] as const;
export type DeliveryStage=typeof deliveryStages[number];
export type DeliveryLeg={id:string;stage:DeliveryStage;dependsOn:string[];minDays:number|null;maxDays:number|null;calendar:{kind:'calendar'|'working';weekend:number[];holidays:string[];reference:string};evidence:Evidence|null};
export type ArrivalPlan={version:1;kind:'local'|'direct'|'forwarded'|'consolidated'|'split';scope:'door'|'transit';startDate:string;validUntil:string|null;legs:DeliveryLeg[]};
function invalid():never{throw new Error('invalid')}
const object=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:invalid();
const text=(v:unknown,max=1000)=>typeof v==='string'&&v.length<=max?v.trim():invalid();
const member=<T extends string>(v:unknown,items:readonly T[]):T=>typeof v==='string'&&items.includes(v as T)?v as T:invalid();
function number(v:unknown,max:number,min=0,integer=false){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max||(integer&&!Number.isInteger(v)))invalid();return v;}
const nullable=(v:unknown,max:number,min=0,integer=false)=>v===null?null:number(v,max,min,integer);
function evidence(v:unknown):Evidence|null{if(v===null)return null;const e=object(v),reference=text(e.reference);if(!reference)invalid();return {reference,observedAt:date(e.observedAt)};}
export function validateFreight(input:unknown):FreightPlan{
 const f=object(input);if(f.version!==1||typeof f.confirmed!=='boolean'||!Array.isArray(f.parcels)||!f.parcels.length||f.parcels.length>20)invalid();
 const currency=text(f.currency,3);if(!/^[A-Z]{3}$/.test(currency))invalid();
 const p:FreightPlan={version:1,basis:member(f.basis,['actual','volumetric','maximum']),scope:member(f.scope,['parcel','shipment']),sequence:member(f.sequence,['minimumThenRound','roundThenMinimum']),volumeMethod:member(f.volumeMethod,['divisor','density']),factor:nullable(f.factor,1e7,.000001),stepKg:nullable(f.stepKg,1e4,.000001),minimumKg:nullable(f.minimumKg,1e5),minimumCharge:nullable(f.minimumCharge,1e9),rateLow:nullable(f.rateLow,1e9),rateHigh:nullable(f.rateHigh,1e9),surcharge:nullable(f.surcharge,1e9),currency,confirmed:f.confirmed,evidence:evidence(f.evidence),validUntil:f.validUntil===null?null:date(f.validUntil),parcels:f.parcels.map(raw=>{const x=object(raw);return {count:number(x.count,10000,1,true),grossKg:nullable(x.grossKg,1e5),lengthCm:nullable(x.lengthCm,1e5,.001),widthCm:nullable(x.widthCm,1e5,.001),heightCm:nullable(x.heightCm,1e5,.001),measurement:member(x.measurement,['measured','quoted','assumed'])}})};
 if(p.rateLow!==null&&p.rateHigh!==null&&p.rateLow>p.rateHigh)invalid();return p;
}
export function freightQuote(input:FreightPlan,asOf=yerevanDate()){
 const f=validateFreight(input),missing:string[]=[];
 if(!f.confirmed||!f.evidence)missing.push('rule');
 if(!f.validUntil||f.validUntil<asOf||!!f.evidence&&f.evidence.observedAt>asOf)missing.push('freshness');
 if(f.parcels.some(p=>p.measurement==='assumed'))missing.push('measurement');
 const needGross=f.basis!=='volumetric',needVolume=f.basis!=='actual';
 const packingMissing=f.parcels.some(p=>needGross&&p.grossKg===null||needVolume&&(p.lengthCm===null||p.widthCm===null||p.heightCm===null))||needVolume&&f.factor===null;
 if(packingMissing)missing.push('packing');
 const rulesMissing=[f.stepKg,f.minimumKg,f.minimumCharge,f.rateLow,f.rateHigh,f.surcharge].some(v=>v===null);
 if(rulesMissing)missing.push('rule');
 const parcels=f.parcels.map(p=>({...p,volumeKg:p.lengthCm!==null&&p.widthCm!==null&&p.heightCm!==null&&f.factor!==null?(f.volumeMethod==='divisor'?p.lengthCm*p.widthCm*p.heightCm/f.factor:p.lengthCm*p.widthCm*p.heightCm/1e6*f.factor):null}));
 const grossKg=parcels.every(p=>p.grossKg!==null)?parcels.reduce((n,p)=>n+p.count*p.grossKg!,0):null;
 const volumeKg=parcels.every(p=>p.volumeKg!==null)?parcels.reduce((n,p)=>n+p.count*p.volumeKg!,0):null;
 let billableKg:number|null=null,low:number|null=null,high:number|null=null;
 if(!packingMissing&&!rulesMissing){
  const basis=(a:number|null,v:number|null)=>f.basis==='actual'?a!:f.basis==='volumetric'?v!:Math.max(a!,v!);
  const round=(kg:number)=>Math.ceil(kg/f.stepKg!-1e-9)*f.stepKg!;
  const weight=(kg:number)=>f.sequence==='minimumThenRound'?round(Math.max(kg,f.minimumKg!)):Math.max(round(kg),f.minimumKg!);
  const units=f.scope==='shipment'?[{count:1,weight:weight(basis(grossKg,volumeKg))}]:parcels.map(p=>({count:p.count,weight:weight(basis(p.grossKg,p.volumeKg))}));
  billableKg=Math.round(units.reduce((n,p)=>n+p.weight*p.count,0)*1e6)/1e6;
  const charge=(rate:number)=>Math.round((units.reduce((n,p)=>n+p.count*Math.max(f.minimumCharge!,p.weight*rate),0)+f.surcharge!)*100)/100;
  low=charge(f.rateLow!);high=charge(f.rateHigh!);
  if(!Number.isSafeInteger(Math.round(high*100))||!Number.isSafeInteger(Math.round(billableKg*1e6))){missing.push('bounds');billableKg=null;low=null;high=null;}
 }
 return {grossKg,volumeKg,billableKg,low,high,currency:f.currency,parcels,complete:missing.length===0&&low!==null,missing:[...new Set(missing)],evidence:f.evidence};
}
export function validateArrival(input:unknown):ArrivalPlan{
 const a=object(input);if(a.version!==1||!Array.isArray(a.legs)||a.legs.length<1||a.legs.length>24)invalid();
 const p:ArrivalPlan={version:1,kind:member(a.kind,['local','direct','forwarded','consolidated','split']),scope:member(a.scope,['door','transit']),startDate:date(a.startDate),validUntil:a.validUntil===null?null:date(a.validUntil),legs:a.legs.map(raw=>{
  const l=object(raw),c=object(l.calendar),id=text(l.id,80);if(!/^[a-zA-Z0-9-]{1,80}$/.test(id)||!Array.isArray(l.dependsOn)||l.dependsOn.length>24||!Array.isArray(c.weekend)||!Array.isArray(c.holidays)||c.holidays.length>366)invalid();
  const leg:DeliveryLeg={id,stage:member(l.stage,deliveryStages),dependsOn:l.dependsOn.map(v=>text(v,80)),minDays:nullable(l.minDays,365,0,true),maxDays:nullable(l.maxDays,365,0,true),calendar:{kind:member(c.kind,['calendar','working']),weekend:c.weekend.map(v=>number(v,6,0,true)),holidays:c.holidays.map(date),reference:text(c.reference)},evidence:evidence(l.evidence)};
  if((leg.minDays===null)!==(leg.maxDays===null)||leg.minDays!==null&&leg.minDays>leg.maxDays!||new Set(leg.dependsOn).size!==leg.dependsOn.length||new Set(leg.calendar.weekend).size!==leg.calendar.weekend.length||leg.calendar.weekend.length===7)invalid();return leg;
 })};
 const ids=new Set(p.legs.map(l=>l.id));if(ids.size!==p.legs.length||p.legs.some(l=>l.dependsOn.some(id=>!ids.has(id))))invalid();
 const visiting=new Set<string>(),done=new Set<string>();function visit(id:string){if(visiting.has(id))invalid();if(done.has(id))return;visiting.add(id);for(const dep of p.legs.find(l=>l.id===id)!.dependsOn)visit(dep);visiting.delete(id);done.add(id)}for(const id of ids)visit(id);
 // A whole-order checkout window already includes stages; never add those stages again.
 if(p.legs.some(l=>l.stage==='door')&&p.legs.some(l=>l.stage!=='door'||l.dependsOn.length))invalid();
 return p;
}
function plusDays(start:string,days:number,calendar:DeliveryLeg['calendar']){const d=new Date(start+'T12:00:00Z');let remaining=days;while(remaining>0){d.setUTCDate(d.getUTCDate()+1);const day=d.toISOString().slice(0,10);if(calendar.kind==='calendar'||!calendar.weekend.includes(d.getUTCDay())&&!calendar.holidays.includes(day))remaining--;}return d.toISOString().slice(0,10);}
export function arrivalWindow(input:ArrivalPlan,asOf=yerevanDate()){
 const p=validateArrival(input),missing:string[]=[];
 if(p.scope==='transit')missing.push('transitOnly');
 if(!p.validUntil||p.validUntil<asOf||p.startDate<asOf||p.legs.some(l=>l.evidence&&l.evidence.observedAt>asOf))missing.push('freshness');
 const cache=new Map<string,{id:string;stage:DeliveryStage;earliest:string|null;latest:string|null;coverage:Set<string>}>();
 function solve(id:string):ReturnType<typeof cache.get>{if(cache.has(id))return cache.get(id);const l=p.legs.find(x=>x.id===id)!,parents=l.dependsOn.map(dep=>solve(dep)!);
  const covered=parents.length?new Set([...parents[0].coverage].filter(stage=>parents.every(x=>x.coverage.has(stage)))):new Set<string>();covered.add(l.stage);
  let earliest:string|null=null,latest:string|null=null;
  if(l.minDays===null||!l.evidence||!l.calendar.reference||parents.some(x=>!x.earliest||!x.latest))missing.push(l.stage);
  else {earliest=plusDays(parents.length?parents.map(x=>x.earliest!).sort().at(-1)!:p.startDate,l.minDays,l.calendar);latest=plusDays(parents.length?parents.map(x=>x.latest!).sort().at(-1)!:p.startDate,l.maxDays!,l.calendar)}
  const r={id,stage:l.stage,earliest,latest,coverage:covered};cache.set(id,r);return r;
 }
 const legs=p.legs.map(l=>solve(l.id)!);const terminals=legs.filter(l=>!p.legs.some(x=>x.dependsOn.includes(l.id)));
 const required=p.kind==='local'?['readiness','lastMile']:p.kind==='direct'?['readiness','origin','transit','customs','lastMile']:['readiness','origin','warehouse','departure','transit','customs','lastMile'];
 for(const t of terminals)if(!t.coverage.has('door'))for(const stage of required)if(!t.coverage.has(stage))missing.push(stage);
 if(p.kind!=='split'&&p.kind!=='consolidated'&&terminals.length!==1)missing.push('branches');
 const complete=missing.length===0&&terminals.every(l=>l.earliest&&l.latest);
 return {complete,missing:[...new Set(missing)],earliest:complete?terminals.map(l=>l.earliest!).sort().at(-1)!:null,latest:complete?terminals.map(l=>l.latest!).sort().at(-1)!:null,firstEarliest:complete?terminals.map(l=>l.earliest!).sort()[0]:null,firstLatest:complete?terminals.map(l=>l.latest!).sort()[0]:null,legs:legs.map(({coverage,...l})=>l)};
}

export type DeliveryRoute={id:string;label:string;provider:string;warehouseReference:string;quoteQuantity:number;freight:FreightPlan|null;arrival:ArrivalPlan|null;evaluation:import('./evaluation.ts').Evaluation};

export function validateRoute(input:unknown):DeliveryRoute {
 const r=object(input),id=text(r.id,80),label=text(r.label,180),provider=text(r.provider,120);
 if(!/^[a-zA-Z0-9-]{1,80}$/.test(id)||!label||!provider)invalid();
 return {id,label,provider,warehouseReference:text(r.warehouseReference),quoteQuantity:number(r.quoteQuantity,10000,1,true),freight:r.freight===null?null:validateFreight(r.freight),arrival:r.arrival===null?null:validateArrival(r.arrival),evaluation:validateEvaluation(r.evaluation)};
}
export function inspectRoute(route:DeliveryRoute,asOf=yerevanDate()){
 const freight=route.freight?freightQuote(route.freight,asOf):null,arrival=route.arrival?arrivalWindow(route.arrival,asOf):null;
 const missing:string[]=[];
 if(!arrival?.complete)missing.push('arrival');
 if(route.arrival&&['forwarded','consolidated'].includes(route.arrival.kind)&&!route.warehouseReference)missing.push('warehouse');
 if(freight){const line=route.evaluation.costs.find(l=>l.kind==='freight');if(!freight.complete||freight.low!==freight.high||line?.status!=='known'||line.currency!==freight.currency||line.amount!==freight.low)missing.push('freight');}
 const days=arrival?.complete&&arrival.latest?Math.round((Date.parse(arrival.latest)-Date.parse(asOf))/86400000):null;
 return {route,freight,arrival,days,missing};
}
