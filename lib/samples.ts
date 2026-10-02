import type {Decision,Locale} from './model';
export function sample(locale:Locale):Decision {
 const names={en:['Four hotel-style pillows','Cotton comfort pillow','Microfiber everyday pillow','Down-alternative premium pillow','Supplier quote · freight pending'],ru:['Четыре подушки гостиничного типа','Подушка с хлопковым чехлом','Повседневная подушка из микрофибры','Премиальная подушка с искусственным пухом','Предложение поставщика · доставка не уточнена'],hy:['Չորս հյուրանոցային ոճի բարձ','Բամբակյա երեսով հարմարավետ բարձ','Միկրոֆիբրից ամենօրյա բարձ','Պրեմիում բարձ՝ արհեստական փետուրով','Մատակարարի առաջարկ · առաքումը ճշտվում է']}[locale];
 return {version:1,title:names[0],quantity:4,maxQuantity:4,budget:40000,maxDays:21,offers:[
 {id:'sample-local',name:names[1],seller:'Yerevan · example retailer',source:'local',unitPrice:4800,packSize:1,quoteQuantity:4,shipping:1000,fees:0,days:2,quality:'value',url:'',observedAt:'2026-10-02',notes:'',evidence:'sample'},
 {id:'sample-temu',name:names[2],seller:'Temu · example offer',source:'temu',unitPrice:2800,packSize:2,quoteQuantity:4,shipping:2500,fees:0,days:18,quality:'budget',url:'',observedAt:'2026-10-02',notes:'',evidence:'sample'},
 {id:'sample-premium',name:names[3],seller:'Alibaba · example supplier',source:'alibaba',unitPrice:5800,packSize:2,quoteQuantity:4,shipping:6500,fees:1500,days:14,quality:'premium',url:'',observedAt:'2026-10-02',notes:'',evidence:'sample'},
 {id:'sample-pending',name:names[4],seller:'Alibaba · example supplier',source:'alibaba',unitPrice:1800,packSize:2,quoteQuantity:4,shipping:null,fees:null,days:null,quality:'value',url:'',observedAt:'2026-10-02',notes:'',evidence:'sample'}]};
}
