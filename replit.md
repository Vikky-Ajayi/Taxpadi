# TaxPay

WhatsApp-style AI tax assistant for Nigerian individuals and freelancers. Upload a bank statement, get your taxes calculated to the Nigeria Tax Act 2025, chat with an AI advisor, and pay securely.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/taxpay run dev` — run the React frontend (port 18753, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (artifacts/api-server, port 8080)
- Frontend: React + Vite + Tailwind (artifacts/taxpay, port 18753)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — all Drizzle table definitions (users, statements, transactions, tax_calculations, chat_messages, payments, filing_sessions)
- `lib/api-spec/openapi.yaml` — OpenAPI 3.1 spec (source of truth for types)
- `lib/api-client-react/src/generated/` — Orval-generated React Query hooks + Zod schemas
- `artifacts/api-server/src/routes/` — all Express route handlers
- `artifacts/api-server/src/lib/` — tax-engine.ts (Nigeria Tax Act 2025), classifier.ts, auth.ts
- `artifacts/taxpay/src/` — React frontend (App.tsx, pages/, components/)

## Architecture decisions

- **Deterministic tax engine**: `lib/tax-engine.ts` implements the Nigeria Tax Act 2025 brackets and reliefs entirely in code — no LLM for tax math, ever.
- **Auth**: Custom HMAC-JWT using `SESSION_SECRET` env var + SHA256 salted password hashing (no bcrypt dependency).
- **Contract-first**: OpenAPI spec drives both Zod server validation and React Query client hooks via Orval codegen.
- **Drizzle date() quirk**: `date()` columns use `string` type for `$inferInsert`. When passing values, use an `any` cast to avoid Drizzle 0.45 overload resolution issues with fresh object literals.
- **Groq chat**: Chat route calls Groq LLM for conversational guidance only; tax arithmetic is always computed by the tax engine first, then summarized by the LLM.

## Product

- **Statement Upload**: Parse CSV/text bank statements, auto-classify transactions, extract income/expenses
- **Tax Dashboard**: Nigeria Tax Act 2025 annual tax calculation with breakdown by relief, bracket, and due date
- **AI Chat**: WhatsApp-style chat with an AI tax advisor (Groq-powered)
- **Payments**: Virtual account generation via Nomba sandbox for tax payments
- **TaxPro Max Filing**: Guided filing wizard for FIRS submission

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any `lib/db` schema change, run `pnpm run typecheck:libs` before checking artifact types.
- Frontend workflow is managed by the artifact system — use `restart_workflow "artifacts/taxpay: web"` not `configureWorkflow`.
- The `date()` Drizzle column's `$inferInsert` type is `string`, not `Date`. Do not pass `new Date(...)` for insert values.
- Proxy routes all traffic through port 80 — use `localhost:80/api/...` for curl tests, never hit port 8080 directly.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- `GROQ_API_KEY` env var not yet set — chat route has a graceful fallback message until it is added
