# Yerevan Cart launch design

The user approved building and publishing the ChatGPT-first product in Hrezaii95/yerevan-Cart and selected public access with sign-in for personal records. Proceed through implementation and deployment without another approval round.

Build a responsive Armenian/Russian/English comparison workspace. Anonymous visitors may calculate with illustrative or manually entered offers. Signed-in users save, list, reopen, and delete their own decisions in D1. Sites supplies trusted identity and a remote MCP boundary, allowing the same calculation and storage service to be called from ChatGPT. No platform-funded inference.

Costs are in AMD at the comparison boundary. Imported quotes retain source, observation date, provenance, units and conversion notes. Unknown shipping is null and cannot win a complete-price ranking. Pack count rounds up only within the user's maximum quantity. Budget and maximum delivery days are hard gates. Quality tiers are user/supplier descriptions, not fabricated scores.

Visual direction: a crisp navy sidebar, spacious white workspace, cobalt actions and mint value highlights. The first viewport contains an editable brief and comparison controls. Source health, plans, ChatGPT setup and saved comparisons are reachable views. Sample data remains visibly marked. No false live marketplace search, completed payment, connection or certificate claims.

Launch dependencies: payment acquiring and marketplace permissions are not configured. Present a free preview and proposed paid plans without checkout. Support user-supplied authorized quotes now; no network requests to arbitrary imported URLs. Public MCP discovery contains no private data; calculation/storage calls require authenticated user identity. Personal records are always owner-scoped. Limits: 20 offers per decision, 100 decisions per account, 100 KB request body. Mutations require same-origin browser requests or authenticated MCP calls. Public read-only calculation is local.

Completion: working production URL, source pushed to requested GitHub repository, deterministic tests, TypeScript/build pass, independent review, browser verification of language/quantity/detail/import/save flows where authentication is available. Document untested external account/marketplace/payment dependencies.
