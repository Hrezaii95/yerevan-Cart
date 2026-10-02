import {test} from 'node:test';import assert from 'node:assert/strict';import * as samples from '../lib/samples.ts';
function old(){const d=samples.sample('en');for(const o of d.offers)delete o.evaluation;d.offers[1].shipping=2500;return d}
test('untouched deployed demo upgrades to corrected free-shipping fixture',()=>{const d=old();const next=samples.upgradeOriginalSample(d);assert.equal(next.offers[1].shipping,0);assert.ok(next.offers[1].evaluation)});
test('upgrading demo never resets user edits or reviewed evidence',()=>{const d=old();d.budget=12345;assert.deepEqual(samples.upgradeOriginalSample(d),d);const e=samples.sample('en');e.offers[0].notes='my review';assert.deepEqual(samples.upgradeOriginalSample(e),e)});
