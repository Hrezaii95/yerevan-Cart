/** Versioned policy from Product Brief §§6–7. Scores are rubrics, never probabilities. */
export const costKinds = ['goods', 'origin', 'handling', 'freight', 'insurance', 'tax', 'lastMile', 'payment', 'discount'] as const;
export type CostKind = typeof costKinds[number];
export const gateKinds = ['fit', 'variant', 'availability', 'sellerIdentity', 'route', 'safety', 'sellerEvidence', 'routeEvidence'] as const;
export type GateKind = typeof gateKinds[number];
export const rubrics = {
  product: {fit: 40, materials: 25, durability: 15, safety: 10, warranty: 10},
  brand: {independent: 30, history: 25, authenticity: 25, regionalSupport: 20},
  seller: {identity: 25, itemProof: 25, outcomes: 20, terms: 20, consistency: 10},
  forwarder: {outcomes: 25, handling: 25, claims: 20, quote: 20, tracking: 10},
} as const;
export type AssessmentKind = keyof typeof rubrics;
export type Evidence = {reference: string; observedAt: string};
export type CostLine = {kind: CostKind; status: 'known'|'included'|'notApplicable'|'unknown'; amount: number|null; amountHigh?:number; currency: string; rate: number|null; rateEvidence: Evidence|null; evidence: Evidence|null; reason: string; includedIn: CostKind|null};
export type Gate = {status: 'pass'|'pending'|'fail'; reason: string; evidence: Evidence|null};
export type Rating = {applicable: boolean; rating: number|null; reason: string; evidence: Evidence|null};
export type Evaluation = {version: 1; reviewRequired?: boolean; validUntil: string|null; gates: Record<GateKind, Gate>; costs: CostLine[]; assessments: Partial<Record<AssessmentKind, Record<string, Rating>>>};
export type Assessment = {score: number|null; covered: number; applicable: number; confidence: 'insufficient'|'partial'|'supported'};

function invalid(): never {throw new Error('invalid');}
const obj = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : invalid();
const text = (v: unknown, max = 600): string => typeof v === 'string' && v.length <= max ? v.trim() : invalid();
const number = (v: unknown, max: number): number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max ? v : invalid();
function member<T extends string>(v: unknown, allowed: readonly T[]): T {return typeof v === 'string' && allowed.includes(v as T) ? v as T : invalid();}
export function date(v: unknown): string {
  const s = text(v, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || !Number.isFinite(Date.parse(s)) || new Date(s).toISOString().slice(0,10) !== s) invalid();
  return s;
}
export function yerevanDate(now = new Date()): string {return new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Yerevan',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
function evidence(v: unknown): Evidence|null {
  if (v === null) return null;
  const e = obj(v), reference = text(e.reference, 1000);
  if (!reference) invalid();
  return {reference, observedAt: date(e.observedAt)};
}
export function validateEvaluation(input: unknown): Evaluation {
  const e = obj(input);
  if (e.version !== 1) invalid();
  const rawGates = obj(e.gates);
  const gates = Object.fromEntries(gateKinds.map(key => {
    const g = obj(rawGates[key]);
    const out: Gate = {status: member(g.status, ['pass','pending','fail']), reason:text(g.reason), evidence:evidence(g.evidence)};
    if (out.status !== 'pending' && (!out.evidence || !out.reason)) invalid();
    return [key, out];
  })) as Evaluation['gates'];
  if (!Array.isArray(e.costs) || e.costs.length !== costKinds.length) invalid();
  const costs = e.costs.map((raw): CostLine => {
    const c = obj(raw);
    const line: CostLine = {kind:member(c.kind,costKinds),status:member(c.status,['known','included','notApplicable','unknown']),amount:c.amount===null?null:number(c.amount,1e9),currency:text(c.currency,3),rate:c.rate===null?null:number(c.rate,1e6),rateEvidence:evidence(c.rateEvidence),evidence:evidence(c.evidence),reason:text(c.reason),includedIn:c.includedIn===null?null:member(c.includedIn,costKinds)};
    if(c.amountHigh!==undefined)line.amountHigh=number(c.amountHigh,1e9);
    if (!/^[A-Z]{3}$/.test(line.currency)) invalid();
    if (line.status !== 'unknown' && (!line.reason || !line.evidence)) invalid();
    if (line.status === 'known') {
      if (line.amount === null || line.rate === null || line.rate <= 0 || (line.currency === 'AMD' && line.rate !== 1) || (line.currency !== 'AMD' && !line.rateEvidence)) invalid();
      // Monetary precision is explicit; avoid accepting values silently rounded during import.
      if (Math.abs(line.amount*100-Math.round(line.amount*100)) > 1e-5 || Math.abs(line.rate*1e6-Math.round(line.rate*1e6)) > 1e-4) invalid();
          if(line.amountHigh!==undefined&&(line.amountHigh<line.amount||Math.abs(line.amountHigh*100-Math.round(line.amountHigh*100))>1e-5))invalid();
    } else if (line.amount !== null||line.amountHigh!==undefined) invalid();
    if ((line.status === 'included') !== (line.includedIn !== null)) invalid();
    if (line.kind === 'goods' && !['known','unknown'].includes(line.status)) invalid();
    if (line.kind === 'discount' && line.status === 'included') invalid();
    return line;
  });
  if (new Set(costs.map(c=>c.kind)).size !== costKinds.length) invalid();
  for (const c of costs) if (c.status === 'included') {
    const target = costs.find(t=>t.kind===c.includedIn);
    if (!target || target === c || target.kind === 'discount' || target.status !== 'known') invalid();
  }
  const assessments: Evaluation['assessments'] = {};
  const rawAssessments = obj(e.assessments);
  for (const kind of Object.keys(rubrics) as AssessmentKind[]) {
    if (rawAssessments[kind] === undefined) continue;
    const raw = obj(rawAssessments[kind]);
    assessments[kind] = Object.fromEntries(Object.keys(rubrics[kind]).map(key=> {
      const r = obj(raw[key]);
      if (typeof r.applicable !== 'boolean') invalid();
      const rating: Rating = {applicable:r.applicable, rating:r.rating===null?null:number(r.rating,5), reason:text(r.reason), evidence:evidence(r.evidence)};
      if ((!rating.applicable || rating.rating !== null) && (!rating.reason || !rating.evidence)) invalid();
      if (!rating.applicable && rating.rating !== null) invalid();
      return [key,rating];
    }));
  }
  if (e.reviewRequired !== undefined && typeof e.reviewRequired !== 'boolean') invalid();
  return {version:1, reviewRequired:e.reviewRequired===true, validUntil:e.validUntil===null?null:date(e.validUntil), gates, costs, assessments};
}
export function assess(kind: AssessmentKind, rows: Record<string,Rating>|undefined): Assessment {
  let applicable = 0, covered = 0, weight = 0, value = 0;
  for (const [key,w] of Object.entries(rubrics[kind])) {
    const r = rows?.[key];
    if (r && !r.applicable) continue;
    applicable++;
    if (r?.rating !== null && r?.rating !== undefined && r.evidence && r.reason) {covered++; weight+=w; value+=w*r.rating/5;}
  }
  const score = weight && covered===applicable ? Math.round(10000*value/weight)/100 : null;
  return {score, covered, applicable, confidence:!covered?'insufficient':covered===applicable?'supported':'partial'};
}
function amdMinor(c: CostLine,high=false): number {
  // Amount has two decimal places and rate six. Multiply in integers, then round half up to AMD cents.
  const amount = BigInt(Math.round((high?(c.amountHigh??c.amount!):c.amount!)*100)), rate = BigInt(Math.round(c.rate!*1e6));
  return Number((amount*rate+500000n)/1000000n);
}
export function evaluate(e: Evaluation, asOf: string) {
  const assessments = Object.fromEntries((Object.keys(rubrics) as AssessmentKind[]).map(k=>[k,assess(k,e.assessments[k])])) as Record<AssessmentKind,Assessment>;
  const lines = e.costs.map(c=>({...c,amd:c.status==='known'?amdMinor(c)/100:c.status==='unknown'?null:0,amdHigh:c.status==='known'?amdMinor(c,true)/100:c.status==='unknown'?null:0}));
  const gross = lines.filter(c=>c.kind!=='discount').reduce((n,c)=>n+(c.amd===null?0:Math.round(c.amd*100)),0);
  const grossHigh = lines.filter(c=>c.kind!=='discount').reduce((n,c)=>n+(c.amdHigh===null?0:Math.round(c.amdHigh*100)),0);
  const discountLine=lines.find(c=>c.kind==='discount');
  const discount = Math.round((discountLine?.amd??0)*100),discountHigh=Math.round((discountLine?.amdHigh??0)*100);
  const complete = !lines.some(c=>c.amd===null) && discountHigh<=gross && Number.isSafeInteger(grossHigh)&&Number.isSafeInteger(discountHigh);
  const subtotalLow = Math.max(0,gross-discountHigh)/100,subtotal=Math.max(0,grossHigh-discount)/100;
  const allEvidence = [...e.costs.flatMap(c=>[c.evidence,c.rateEvidence]),...Object.values(e.gates).map(g=>g.evidence),...Object.values(e.assessments).flatMap(rows=>Object.values(rows).map(r=>r.evidence))];
  const fresh = !!e.validUntil && e.validUntil>=asOf && !allEvidence.some(v=>v && v.observedAt>asOf);
  const gatesPass = !e.reviewRequired && Object.values(e.gates).every(g=>g.status==='pass' && g.evidence && g.reason);
  return {lines,subtotalLow,subtotal,totalLow:complete&&!e.reviewRequired?subtotalLow:null,total:complete&&!e.reviewRequired?subtotal:null,assessments,fresh,gatesPass,qualityScore:assessments.product.score};
}

/** Empty evidence is deliberately pending. It never upgrades old aggregates into proof. */
export function emptyEvaluation(): Evaluation {
  return {version:1,validUntil:null,gates:Object.fromEntries(gateKinds.map(k=>[k,{status:'pending',reason:'',evidence:null}])) as Evaluation['gates'],costs:costKinds.map(kind=>({kind,status:'unknown',amount:null,currency:'AMD',rate:1,rateEvidence:null,evidence:null,reason:'',includedIn:null})),assessments:{}};
}
