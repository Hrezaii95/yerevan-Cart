'use client';
import {useState, type FormEvent} from 'react';
import {emptyEvaluation, gateKinds, rubrics, validateEvaluation, type AssessmentKind, type CostLine, type Evaluation, type Evidence, type Rating} from '@/lib/evaluation';
import {evaluationCopy, type EvaluationWords} from '@/lib/evaluation-copy';
import type {Locale} from '@/lib/model';

function EvidenceFields({value,onChange,t}:{value:Evidence|null;onChange:(v:Evidence|null)=>void;t:EvaluationWords}) {
 const set=(key:keyof Evidence,v:string)=>{const next={reference:'',observedAt:'',...value,[key]:v};onChange(next.reference||next.observedAt?next:null)};
 return <div className="evidence-fields"><label>{t.reference}<input maxLength={1000} value={value?.reference??''} onChange={e=>set('reference',e.target.value)}/></label><label>{t.date}<input type="date" value={value?.observedAt??''} onChange={e=>set('observedAt',e.target.value)}/></label></div>;
}
export function EvaluationEditor({value,locale,onSave}:{value:Evaluation|undefined;locale:Locale;onSave:(e:Evaluation)=>void}) {
 const [draft,setDraft]=useState<Evaluation>(()=>structuredClone(value??emptyEvaluation()));
 const [error,setError]=useState(false);
 const t=evaluationCopy[locale];
 function cost(index:number,update:Partial<CostLine>){setDraft(d=>({...d,costs:d.costs.map((c,i)=>i===index?{...c,...update}:c)}))}
 function rating(kind:AssessmentKind,key:string,update:Partial<Rating>){setDraft(d=>({...d,assessments:{...d.assessments,[kind]:{...Object.fromEntries(Object.keys(rubrics[kind]).map(k=>[k,{applicable:true,rating:null,evidence:null,reason:''}])),...d.assessments[kind],[key]:{applicable:true,rating:null,evidence:null,reason:'',...d.assessments[kind]?.[key],...update}}}}))}
 function submit(e:FormEvent){e.preventDefault();try{onSave(validateEvaluation(draft));setError(false)}catch{setError(true)}}
 return <form className="evaluation-form" onSubmit={submit}>
  <p className="muted">{t.intro}</p>{draft.reviewRequired&&<p role="status" className="warning-note">{t.editWarning}</p>}
  <label>{t.validUntil}<input type="date" value={draft.validUntil??''} onChange={e=>setDraft(d=>({...d,validUntil:e.target.value||null}))}/></label>
  <section><h3>{t.costs}</h3><p className="small muted">{t.costNotice}</p>
   {draft.costs.map((line,index)=><details key={line.kind} className="evidence-section"><summary>{t.costNames[line.kind]} <span>{t[line.status]}</span></summary><div className="evidence-section-body">
    <div className="form-grid"><label>{t.status}<select value={line.status} onChange={e=>{const status=e.target.value as CostLine['status'];cost(index,{status,amount:null,includedIn:null})}}>{(['unknown','known','included','notApplicable'] as const).filter(s=>line.kind==='goods'?s==='known'||s==='unknown':line.kind==='discount'?s!=='included':true).map(s=><option value={s} key={s}>{t[s]}</option>)}</select></label>
    {line.status==='known'&&<><label>{t.amount}<input type="number" step="0.01" min={0} max={1e9} value={line.amount??''} onChange={e=>cost(index,{amount:e.target.value===''?null:Number(e.target.value)})} required/></label><label>{t.currency}<input pattern="[A-Z]{3}" maxLength={3} value={line.currency} onChange={e=>{const currency=e.target.value.toUpperCase();cost(index,{currency,rate:currency==='AMD'?1:null,rateEvidence:null})}} required/></label><label>{t.rate}<input type="number" step="0.000001" min="0.000001" max={1e6} disabled={line.currency==='AMD'} value={line.rate??''} onChange={e=>cost(index,{rate:e.target.value===''?null:Number(e.target.value)})} required/></label></>}
    {line.status==='included'&&<label>{t.includedIn}<select value={line.includedIn??''} onChange={e=>cost(index,{includedIn:e.target.value as CostLine['includedIn']})} required><option value="">—</option>{draft.costs.filter(c=>c.kind!==line.kind&&c.kind!=='discount'&&c.status==='known').map(c=><option key={c.kind} value={c.kind}>{t.costNames[c.kind]}</option>)}</select></label>}</div>
    {line.status==='known'&&line.currency!=='AMD'&&<fieldset><legend>{t.fxReference}</legend><EvidenceFields value={line.rateEvidence} onChange={rateEvidence=>cost(index,{rateEvidence})} t={t}/></fieldset>}
    <label>{t.reason}<textarea rows={2} maxLength={600} value={line.reason} onChange={e=>cost(index,{reason:e.target.value})}/></label>
    <EvidenceFields value={line.evidence} onChange={evidence=>cost(index,{evidence})} t={t}/>
   </div></details>)}
  </section>
  <section><h3>{t.gates}</h3>{gateKinds.map(key=>{const gate=draft.gates[key];const update=(patch:Partial<typeof gate>)=>setDraft(d=>({...d,gates:{...d.gates,[key]:{...d.gates[key],...patch}}}));return <details key={key} className="evidence-section"><summary>{t.gateNames[key]} <span>{t[gate.status]}</span></summary><div className="evidence-section-body"><label>{t.status}<select value={gate.status} onChange={e=>update({status:e.target.value as typeof gate.status})}>{(['pending','pass','fail'] as const).map(s=><option value={s} key={s}>{t[s]}</option>)}</select></label><label>{t.reason}<textarea rows={2} maxLength={600} value={gate.reason} onChange={e=>update({reason:e.target.value})}/></label><EvidenceFields value={gate.evidence} onChange={evidence=>update({evidence})} t={t}/></div></details>})}</section>
  <section><h3>{t.assessments}</h3>{(Object.keys(rubrics) as AssessmentKind[]).map(kind=><details key={kind} className="evidence-section"><summary>{t.assessmentNames[kind]}</summary><div className="evidence-section-body">{Object.entries(rubrics[kind]).map(([key,weight])=>{const row=draft.assessments[kind]?.[key];return <fieldset key={key}><legend>{t.dimensions[key as keyof typeof t.dimensions]} · {weight}%</legend><div className="form-grid"><label>{t.applicable}<select value={row?.applicable===false?'no':'yes'} onChange={e=>rating(kind,key,{applicable:e.target.value==='yes',rating:null})}><option value="yes">{t.applicable}</option><option value="no">{t.notApplicable}</option></select></label>{row?.applicable!==false&&<label>{t.rating}<input type="number" min={0} max={5} step="0.1" value={row?.rating??''} placeholder={t.unknown} onChange={e=>rating(kind,key,{rating:e.target.value===''?null:Number(e.target.value)})}/></label>}</div><label>{t.reason}<textarea rows={2} maxLength={600} value={row?.reason??''} onChange={e=>rating(kind,key,{reason:e.target.value})}/></label><EvidenceFields value={row?.evidence??null} onChange={evidence=>rating(kind,key,{evidence})} t={t}/></fieldset>})}</div></details>)}</section>
  {error&&<p role="alert" className="error-text">{t.invalid}</p>}
  <button className="button primary" type="submit">{t.save}</button>
 </form>;
}

