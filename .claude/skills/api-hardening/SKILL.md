---
name: api-hardening
description: Security and backend conventions for the GuardNG Express + MongoDB API — auth/JWT rules, role enforcement, validation, AI proxying via OpenRouter, media limits, deployment hygiene. Use when touching anything in server/, auth flows, or AI endpoints.
---

# GuardNG API hardening (Express + MongoDB)

Safety-critical app: reports can identify users to hostile actors. The API
(`server/`) is the single security boundary — the client is untrusted.

## Non-negotiables (already implemented — keep them true)

1. **Every route except `/api/auth/*` and `/api/health` requires a JWT**
   (`requireAuth`). Auth middleware re-reads the user from Mongo on each
   request so deactivation and role changes apply immediately.
2. **Role checks server-side only** (`requireRole`). Citizens: own incidents
   only. Agencies: read incidents + change `status` only. Admins: user CRUD.
   Never trust a role claim from the client.
3. **Self-signup can only create `citizen` or `agency`** — admin accounts
   come from the seed script or another admin.
4. **Anonymous reports**: `toClientIncident` strips `userId` for non-admin,
   non-owner viewers. Any new serializer must preserve this.
5. **Secrets live in env vars on the server** (`JWT_SECRET`,
   `OPENROUTER_API_KEY`, `MONGODB_URI`). Nothing secret in `VITE_*` — those
   are public by definition. `JWT_SECRET` is mandatory in production
   (`assertConfig` throws).
6. **Validation at the boundary**: enum-check type/severity/status, length-cap
   strings (description ≤ 5000), numeric-bound lat/lng. Mongoose schema
   enums are the second line of defense, not the first.
7. **Rate limits**: `/api/auth` 30/15min, `/api/ai` 30/5min per IP. New
   expensive or abusable endpoints get their own limiter.
8. **Media**: 5MB cap, image/* and audio/* only, stored in GridFS,
   authenticated reads. Clients compress before upload (offline-first-data).

## AI via OpenRouter (server-side only)

- One helper: `server/src/lib/openrouter.ts` — plain fetch to the
  OpenAI-compatible endpoint, 30s timeout, model fallback via the `models`
  array (`anthropic/claude-haiku-4.5` → `openai/gpt-4o-mini` →
  `meta-llama/llama-3.3-70b-instruct`). Change models by editing
  `config.models` / `OPENROUTER_MODEL` env — never add a model SDK.
- AI failures return **503** and clients degrade gracefully (manual category
  selection, canned chat fallback). AI must never block report submission.
- News is RSS aggregation (`lib/news.ts`), cached 6h in Mongo, stale-served
  on failure. No LLM in the retrieval path.

## Adding an endpoint — checklist

- [ ] `requireAuth` (+ `requireRole` if not citizen-safe)
- [ ] Validate and length-cap every body/query field before use
- [ ] Bound every list query (`limit`, max 200–500) and add an index for its sort/filter
- [ ] Serialize through an explicit `toClient*` function — never return raw docs
      (passwordHash and internal fields must be unmappable, not just omitted)
- [ ] No PII in `console.error`/logs (no phone numbers, no precise coordinates)
- [ ] Errors return `{ error: "human readable" }`; 500s hide internals
- [ ] Audit-log mutations that affect other users (Log model)

## Operations

- MongoDB Atlas: enable IP allowlist or VPC peering; daily backups; choose a
  region close to users (AWS `eu-west-2`/`af-south-1` beat US regions for
  Nigeria latency).
- Run `npm run typecheck` in `server/` before committing; deploy via the
  provided Dockerfile (`node:22-alpine`, runs as non-root `node` user).
- Rotate `JWT_SECRET` only with a planned forced re-login; rotate the
  OpenRouter key freely (server restart picks it up).
- Indexes: `incidents` has `userId` and `timestamp`; add compound indexes
  when new query patterns appear — check with `.explain()` not vibes.
