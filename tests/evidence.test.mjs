import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as model from '../lib/model.ts';

import {evaluatedOffer,decision} from './fixtures.mjs';
import {sample} from '../lib/samples.ts';
const run=(offer=evaluatedOffer(),asOf='2026-10-02')=>model.calculate(model.validateDecision(decision(offer)),asOf)[0];

test('validated evidence survives import and a sourced full cost qualifies',()=>{const r=run();assert.equal(r.total,9000);assert.equal(r.qualityScore,80);assert.equal(r.effectivePerNeededPiece,3000);assert.equal(r.eligible,true);assert.equal(r.offer.evaluation.validUntil,'2026-10-10')});
test('legacy aggregate cannot prove full delivered cost or qualify',()=>{const o=evaluatedOffer();delete o.evaluation;const r=run(o);assert.equal(r.eligible,false);assert.equal(r.total,null);assert.equal(r.subtotal,9000)});
test('wrong variant fails even when cheapest',()=>{const o=evaluatedOffer();o.evaluation.gates.variant.status='fail';assert.equal(run(o).eligible,false)});
test('pending gate cannot recommend, with explicit evidence reason',()=>{const o=evaluatedOffer();o.evaluation.gates.safety.status='pending';assert.ok(run(o).reasons.includes('evidence'))});
test('unknown named cost cannot be replaced by legacy zero fees',()=>{const o=evaluatedOffer();o.evaluation.costs.find(x=>x.kind==='tax').status='unknown';assert.equal(run(o).total,null)});
test('inclusions count a charge only once',()=>{const o=evaluatedOffer();Object.assign(o.evaluation.costs.find(x=>x.kind==='lastMile'),{status:'included',includedIn:'freight'});assert.equal(run(o).total,9000)});
test('reject duplicate cost categories and circular/unresolved inclusions',()=>{const o=evaluatedOffer();o.evaluation.costs.push(o.evaluation.costs[0]);assert.throws(()=>model.validateDecision(decision(o)));const b=evaluatedOffer();Object.assign(b.evaluation.costs[1],{status:'included',includedIn:'handling'});assert.throws(()=>model.validateDecision(decision(b)))});
test('a confirmed discount is deducted once and cannot exceed cash charges',()=>{const o=evaluatedOffer();Object.assign(o.evaluation.costs.at(-1),{status:'known',amount:500});assert.equal(run(o).total,8500);o.evaluation.costs.at(-1).amount=10000;assert.equal(run(o).total,null)});
test('FX retains original amounts and dated conversion evidence',()=>{const o=evaluatedOffer();Object.assign(o.evaluation.costs[0],{currency:'USD',amount:20,rate:400});assert.equal(run(o).total,9000);assert.equal(run(o).offer.evaluation.costs[0].amount,20)});
test('expired or future-dated evidence is provisional',()=>{assert.equal(run(undefined,'2026-10-11').eligible,false);assert.equal(run(undefined,'2026-10-01').eligible,false)});
test('null required ratings yield null score; N/A needs a recorded reason',()=>{const o=evaluatedOffer();o.evaluation.assessments.product.fit.rating=null;assert.equal(run(o).qualityScore,null);assert.equal(run(o).eligible,false);const b=evaluatedOffer();Object.assign(b.evaluation.assessments.product.warranty,{applicable:false,rating:null,reason:''});assert.throws(()=>model.validateDecision(decision(b)))});
test('not-applicable dimensions renormalize; brand absence does not reject OEM',()=>{const o=evaluatedOffer();Object.assign(o.evaluation.assessments.product.warranty,{applicable:false,rating:null});delete o.evaluation.assessments.brand;assert.equal(run(o).qualityScore,80);assert.equal(run(o).eligible,true)});
test('evidence-based tiers ignore source and user category labels',()=>{assert.equal(typeof model.selectTiers,'function');const o=evaluatedOffer({source:'temu',quality:'budget'});for(const row of Object.values(o.evaluation.assessments.product))row.rating=5;const d=model.validateDecision(decision(o));const tiers=model.selectTiers(model.calculate(d,'2026-10-02'));assert.deepEqual(tiers,{premium:'one',value:'one',budget:'one'})});
test('editing quantity invalidates itemized order quote',()=>{const d=model.validateDecision(decision());d.quantity=8;d.maxQuantity=8;const r=model.calculate(d,'2026-10-02')[0];assert.equal(r.total,null);assert.equal(r.eligible,false)});
test('synthetic examples demonstrate independent tiers and preserve totals across languages',()=>{for(const locale of ['en','ru','hy']){const results=model.calculate(model.validateDecision(sample(locale)),'2026-10-02');assert.deepEqual(results.map(r=>r.total),[20200,11200,31200,null]);assert.deepEqual(model.selectTiers(results),{premium:'sample-premium',value:'sample-local',budget:'sample-temu'});assert.ok(results.every(r=>r.offer.evidence==='sample'))}});
test('changing quote terms retains evidence but requires review; category label is metadata',()=>{assert.equal(typeof model.reviseOffer,'function');const old=evaluatedOffer();const changed=model.reviseOffer(old,{...old,unitPrice:3000});assert.deepEqual(changed.evaluation.costs,old.evaluation.costs);assert.equal(changed.evaluation.reviewRequired,true);assert.equal(run(changed).total,null);assert.equal(run(changed).eligible,false);assert.equal(run(model.reviseOffer(old,{...old,quality:'premium'})).eligible,true)});


