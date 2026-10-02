# Full product implementation plan

Use Superpowers executing-plans and TDD. User explicitly requested continued implementation until the full specification is satisfied. No repeat design approval is required. Each task ends with an independent code review and relevant tests; publish completed application improvements with exact source provenance.

Spec: ../../../FULL-SPEC-AUDIT.md, tracing the user's original Product Brief §§1–13. The original brief, not the initial demo design, governs.

Global constraints: no fabricated quotes/rights/paid entitlements; no own-plan token proxy; unknown costs and pending gates cannot recommend; account-bound writes; parity in all three languages; preserve earlier records and source provenance.

1. Evidence and cost qualification: add validated named cost lines, FX basis, inclusions/N/A, source records, explicit gates, quote validity, weighted assessments and tier selection. Integrate import, persistence, MCP and web editing/display; retain legacy records as provisional. Test totals, duplicate/inclusion errors, wrong variants, expired quotes, null ratings, thresholds and source-independent ranking. Expected: new regressions fail before implementation and all tests/typecheck/build pass afterward.
2. Freight, route and ETA engine: provider rules/packing; exact scope and ranges; direct/forwarded/consolidated/split routes; sourced calendar legs, optimization and baseline comparability. Add historical evidence without inventing missing legs or prices.
3. Research and account service: versioned briefs/results/outcomes, source capability/permission health, idempotent bounded jobs, entitlement/usage reservation ledger, operator/support and deletion/revocation. Expose the same service through localized UI and narrow ChatGPT tools.
4. Subscription integration: choose from the actual merchant's supported provider; implement authenticated hosted checkout and verified lifecycle callbacks, reconciliation and test mode. Enable real payments only after actual merchant setup and tested renew/cancel/refund gates.
5. End-to-end and release: live own-account connect/call/save/retrieve/revoke; account isolation; 30 multilingual decision cases; 360px/desktop/zoom/keyboard; source outages; backup/restore. Run and retain actual pilot/commercial evidence and native review; publish final state only when all gates hold.

Shared interfaces: Tasks 2–3 consume Task 1's versioned evidence contract; Task 4 consumes Task 3's ledger and owner identity; Task 5 tests all contracts. Keep old records readable, but never infer missing proof from old aggregate fields.
