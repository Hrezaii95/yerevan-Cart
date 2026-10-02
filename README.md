# Yerevan Cart

A public Armenian/Russian/English shopping comparison workspace for delivery to Yerevan. Built with React, TypeScript, Vinext and Cloudflare D1 through Sites.

## Live app

[Open Yerevan Cart](https://yerevan-cart.rezaiixhossein.chatgpt.site)

## What works

- Editable purchase brief, quantity packs, budget/deadline gates and deterministic AMD totals.
- Unknown shipping or fees prevent complete-price recommendations. Changing purchased quantity invalidates existing freight unless its coverage is explicitly reconfirmed.
- Manual offers with source URLs, quote dates, notes and original-currency/conversion evidence.
- English, Armenian and Russian navigation, forms, states, plan copy and seller drafts.
- JSON import/export and temporary tab drafts that survive sign-in. Personal saved decisions use cloud D1 storage, not localStorage.
- Sign-in through the hosting platform; owner-scoped save, list, reopen and delete operations.
- Stateless MCP endpoint at `/mcp`, with `list_shopping_decisions` and `compare_and_save`. Both personal tools require hosting-verified identity. Supply a stable decision UUID on saves for retry safety.

## Explicit launch limits

This is a functioning early-access app, not a verified commercial marketplace service. Example offers are synthetic. There are no live Alibaba/List.am/Temu catalogue integrations, automated purchasing, seller messaging, payment collection or paid entitlements. Proposed subscriptions are labeled unavailable. Website sign-in does not grant external plan-funded inference or prove an MCP connection. The connection panel records actual successful authenticated tool calls. Public plugin distribution and external-customer eligibility require separate validation. Native Armenian/Russian copy review remains outstanding.

## Run locally

Use Node >=22.13.0 with a valid writable TEMP/TMP directory, then `npm ci`. The platform starter's normal commands are `npm run dev`, `npm run build`, `npm run db:generate` and `npm start`. Tests: `node --test tests/*.test.mjs` on Node 24 (native TypeScript stripping). Typecheck: `npx tsc --noEmit`.

If your Windows TEMP/TMP refers to a disconnected drive, set them to an existing project-local temporary directory in the current shell before starting Node/npm. Do not change global configuration. This environment required that workaround; the app code does not depend on it.

Generate migrations after changing `db/schema.ts`, build once, then apply the new migration locally with:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_nostalgic_bullseye.sql
```

Apply each migration once. Sites applies production migrations during publication. Local preview uses an explicitly simulated account; production identity is supplied by the hosting dispatcher. Never deploy behind a proxy that permits callers to spoof the trusted `oai-authenticated-user-*` headers.

## Source and deployment

GitHub is the requested source mirror. `.openai/hosting.json` binds the deployment project and logical D1/MCP capabilities; it contains no secret. Sites also maintains its required provider source repository. Publish exact committed source, package `dist`, save a version, deploy and verify its terminal status. Keep credentials out of files, Git and browser bundles.

Decisions are capped at 100/account, 20 offers/decision and 100 KB/request. Prepared queries enforce ownership, and browser mutations require a matching Origin. Imported URLs are validated but never fetched server-side.

See `docs/superpowers/specs/2026-10-02-launch-design.md` and the matching plan for scope and release gates.
