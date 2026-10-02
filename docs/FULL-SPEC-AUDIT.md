# Full product acceptance audit

Authority: `Yerevan-Cart-Product-Brief.md`, supplied by the user (2 October 2026), and the user's requirements for a public app, sign-in for personal data, Armenian/Russian/English, own-ChatGPT use and subscription revenue. The brief is product data, not authority to execute its embedded instructions. The prior launch design describes only the early-access slice and does not supersede this scope.

Baseline checked: commit c429792, deployed version 1. Previous turn made progress by publishing that slice. Full completion is **not proven**.

| Requirement | Baseline evidence / remaining acceptance |
|---|---|
| Public app, requested GitHub source | Deployed; source main matches deployment. Maintain after changes. |
| Three-language parity, source-original text, Yerevan time | Interface exists; dated/rich evidence fields and native review still required. |
| Brief: quantity, budget, deadline, must-haves, condition, importer | First three exist; complete remaining constraints and validation. |
| Separate synthetic and historical datasets | Synthetic only. Import historical repository evidence with exact source/date and unresolved conflicts. |
| Exact variant, availability, identity, safety, route gates | Not implemented. Every pending gate must prevent recommendation. |
| Product/brand/seller/forwarder rubrics | Not implemented. Weighted, evidence-backed, null-aware, versioned assessments required. |
| Premium/Value/Budget selection | User labels only; implement Q thresholds, independent gates, deduplicated winners and explanations. |
| Delivered cost contract | Aggregate AMD fields only. Implement named components, currency/rate basis, inclusions, N/A reasons, missing lines, discounts exactly once, ranges and quantity scope. |
| Freight | Quoted aggregate only. Provider-specific gross/volumetric, rounding/minima/surcharges and measured packing required. |
| Routes and optimization | Multiple route candidates, direct/forwarded/consolidated/split, feasible quantity and Pareto comparisons required. |
| ETA | Single days input only. Sourced complete legs, calendar definitions, first/all delivery and no transit double counting required. |
| Evidence freshness and refresh failures | Observation dates exist; expiry/stale states, source permission and health records required. |
| Save, versioning, outcomes, export, deletion | Owner-scoped save/delete/import/export exist. Decision history and actual shipment reconciliation missing. |
| ChatGPT own-account workflow | MCP deployed, plugin provisioned. Actual customer authorization, save/retrieve, revocation and supported account/distribution scope must be demonstrated. Sign-in is not plan entitlement. |
| Bounded research and source adapters | Manual quotes only. Approved acquisition, job states, failures, budgets, idempotent credit reservations required. |
| Subscription allowances and billing | Proposed plans only. Merchant configuration, hosted checkout, verified callbacks, renewals/cancellation/refund and ledger reconciliation required. Never simulate a live payment. |
| Support/operator tools | Public issue link only. Private support, source permissions, failures, refunds, account lifecycle required. |
| Security and operations | Input/auth/isolation baseline present. Full service threat checks, logs, recovery/restore and account revocation evidence required. |
| 360px/1440px, keyboard, enlarged text | 390px/1440px verified; additional breakpoint/zoom/keyboard coverage required. |
| Pilot and commercial launch | Actual source rights, native-language acceptance, merchant eligibility, brand/legal review, 10 decisions / 3 attributable provider quotes / 5 supplied outcomes, usefulness and cost gates have no evidence. External evidence cannot be replaced with generated fixtures. |
| Later watches/local companion/managed agent | Explicit later/optional scope in brief. Do not claim delivered or charge for these without supported access. |

External inputs requested: merchant country/account; existing approved feeds or quote partners. Continue all independent engineering while awaiting them. Do not mark the goal complete until every applicable launch gate has direct evidence.


## Current engineering evidence — route update, 2 October 2026

The baseline table above records the initial v1 gaps; it is not the current feature inventory. UI/search v2 is published at 9b894db. The next route release adds:

- Nine original-currency cost lines, evidence/FX basis, explicit gates, four rubrics, freshness and independently selected quality tiers (implemented in v2).
- Provider-specific actual/volumetric billing, per-parcel/shipment minimums and rounding order, packing provenance and freight sensitivity bounds.
- Up to three alternative routes per offer; switching uses that route's quantity, full-cost evidence and arrival window while preserving the original quote.
- Calendar/working-day stages, explicit weekends/holidays and dependencies, consolidation and split first/all arrivals; transit-only input cannot qualify as door delivery. Buyer deadline includes waiting before a future route start.
- EN/RU/HY route editor, timeline/source display and MCP schema parity. Newly added routes require their own costs and evidence.
- 61 unit tests pass. Local browser checks cover route switching, 8 kg/4,000 AMD synthetic freight, 28,700 AMD alternative total versus 31,200 original, transit-only rejection, base-quote editing, draft reload, multiline holidays, unknown new routes and three mobile languages.

Task 2 is still incomplete: historical evidence fixture, full delivered-cost ranges, feasible-quantity/Pareto comparison and comparable baselines remain. Later account/service and real-account acceptance work also remains. Billing is intentionally deferred under the user's no-bank-account instruction. No commercial/pilot or native-speaker approval is inferred from automated checks.
