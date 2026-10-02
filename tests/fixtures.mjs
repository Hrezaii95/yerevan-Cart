const evidence={reference:'Seller quote Q-123, exact variant and four pieces',observedAt:'2026-10-02'};
const kinds=['goods','origin','handling','freight','insurance','tax','lastMile','payment','discount'];
export function evaluatedOffer(overrides={}) {
 const dimensions={product:['fit','materials','durability','safety','warranty'],brand:['independent','history','authenticity','regionalSupport'],seller:['identity','itemProof','outcomes','terms','consistency'],forwarder:['outcomes','handling','claims','quote','tracking']};
 const assessment=Object.fromEntries(Object.entries(dimensions).map(([key,ids])=>[key,Object.fromEntries(ids.map(id=>[id,{rating:4,applicable:true,reason:'Documented selected-item evidence',evidence}]))]));
 const gates=Object.fromEntries(['fit','variant','availability','sellerIdentity','route','safety','sellerEvidence','routeEvidence'].map(key=>[key,{status:'pass',reason:'Confirmed for selected quantity and variant',evidence}]));
 const costs=kinds.map(kind=>({kind,status:kind==='goods'||kind==='freight'?'known':'notApplicable',amount:kind==='goods'?8000:kind==='freight'?1000:null,currency:'AMD',rate:1,rateEvidence:evidence,evidence,reason:'Written quote itemization',includedIn:null}));
 return {id:'one',name:'Pillow',seller:'Supplier',source:'local',unitPrice:2000,packSize:2,quoteQuantity:4,shipping:1000,fees:0,days:3,quality:'value',url:'https://example.com/product',observedAt:'2026-10-02',notes:'',evidence:'quote',evaluation:{version:1,validUntil:'2026-10-10',gates,costs,assessments:assessment},...overrides};
}
export const decision=(offer=evaluatedOffer())=>({version:1,title:'Four pillows',quantity:3,maxQuantity:4,budget:20000,maxDays:14,offers:[offer]});

