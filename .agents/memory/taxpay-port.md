---
name: TaxPay Replit port
description: Key decisions and gotchas from porting TaxPay (Nigerian tax filing app) from Vercel to Replit pnpm workspace
---

# TaxPay port decisions

## Auth token wiring
The shared API client (`lib/api-client-react/src/custom-fetch.ts`) uses `_authTokenGetter` to inject `Authorization: Bearer` headers. This getter is NOT automatically configured — it must be registered explicitly in the app.

**Fix applied:** In `artifacts/taxpay/src/lib/auth.tsx`, `AuthProvider` now calls `setAuthTokenGetter(() => localStorage.getItem("taxpay_token"))` in a `useEffect` on mount.

**Why:** Without this, `useGetMe` (and all protected API calls) send no auth header, get 401, and immediately trigger `logout()` — locking users out of all authenticated flows.

**How to apply:** Any new artifact (mobile, etc.) that uses the shared API client and needs bearer auth must also call `setAuthTokenGetter` at startup.

## CORS fix
Removed `production: ["https://taxmata.vercel.app"]` CORS restriction from `artifacts/api-server/src/app.ts`. Replaced with `origin: true` — Replit's shared proxy handles routing, so no origin restriction is needed in development or production.

## Environment secrets
- `SESSION_SECRET` — already in workspace secrets; used by `lib/auth.ts` in api-server for JWT signing/verification
- `GROQ_API_KEY` — needed for AI chat features (not yet set; chat routes will fail without it)
- `WHATSAPP_VERIFY_TOKEN` — needed for WhatsApp webhook (not yet set; webhook route will reject)

## DB schema
Full schema pushed successfully via `pnpm --filter @workspace/db run push`. Tables: users, statements, transactions, tax_calculations, payments, chat_messages, filing_sessions.

## App overview
TaxPay is a Nigerian AI-powered tax filing service. Stack: React+Vite+Wouter frontend, Express backend, PostgreSQL via Drizzle, JWT auth (custom HMAC, no external deps), Groq AI for chat.
