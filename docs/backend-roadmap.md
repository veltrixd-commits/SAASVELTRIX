# Backend Execution Plan

## 1. Data Layer Blueprint
- **Database**: PostgreSQL via Prisma; keep existing 20+ models as canonical source of truth.
- **Tenancy**: All tables reference `tenantId`; enforce cascading deletes plus row-level filtering in every query helper.
- **Read/Write Helpers**:
  - Create `lib/db` submodules (e.g., `lib/db/leads.ts`, `lib/db/automations.ts`) exposing typed functions. Each helper receives `{ tenantId, userId }`.
  - Centralize pagination + filtering logic (status, source, search) for leads, automations, conversations, invoices.
- **Migrations**: Use `prisma migrate dev` for local and `prisma migrate deploy` for prod. Add npm scripts (`db:migrate`, `db:deploy`, `db:seed`).
- **Seed Strategy**: Move demo data into `prisma/seed.ts` seeded per tenant for predictable previews.
- **Caching**: Reserve Redis integration (optional) for automation locks / rate limiting.

## 2. API Surface & Ownership
- **Auth** (`/api/auth/*`): NextAuth w/ Credentials provider hitting Prisma. Tokens include `tenantId`, `role`.
- **Leads** (`/api/leads`, `/api/leads/[id]`): CRUD wired to db helpers, plus activity + conversations expansions.
- **Messaging** (`/api/messages/send`): Accepts outbound payload, dispatches to unified messaging service, records Message + Conversation updates.
- **Automations** (`/api/automations`, `/api/automations/[id]/execute`): Manage definitions, queue executions via job runner (Upstash QStash or Vercel cron).
- **Finance / POS / Wellness**: Expose `/api/finance/*`, `/api/wellness/*` backed by Prisma models (Invoices, WellnessMetrics, etc.).
- **Webhook Receivers**: Validate signatures, normalize payloads into shared ingest function that upserts leads + activities asynchronously.

## 3. Auth & RBAC Hardening
- Adopt NextAuth session with JWT strategy. Store hashed passwords (bcrypt) via Prisma middleware.
- Implement `lib/accessControl.ts` server helpers to assert `role >= requiredRole` before route logic.
- Add middleware that injects `tenantId` + `role` onto `request` for API handlers.

## 4. Automation & Background Jobs
- **Job Runner**: Use Vercel Cron for scheduled tasks plus background queue (e.g., `@upstash/qstash`) for async automation steps.
- **Runtime**: `lib/automationRuntime.ts` loads automation definition, evaluates triggers, executes actions (send message, tag, notify, wait, webhook call).
- **Persistence**: Record each run in `AutomationRun` with status + error payload for observability.

## 5. Analytics & Export
- Extend CTA analytics local store into persistent `AnalyticsEvent` rows via `/api/analytics/cta` endpoint.
- Shipping `GET /api/analytics/cta/export` returning CSV/JSON filtered by date range + surface.

## 6. Deployment Configuration
- Target Vercel (app + API routes). Use external PostgreSQL (Neon/Supabase) + Upstash Redis.
- Document env vars in `.env.example` with descriptions (database, JWT secret, provider tokens, queue secrets).
- Provide `deploy-prepare.ps1` steps plus GitHub Actions sample for tests + lint + migrate deploy.

## 7. Execution Order
1. Finalize Prisma schema & migrations.
2. Wire auth + session + RBAC.
3. Replace mock data in UI with API-backed SWR/fetchers.
4. Implement automation runtime + messaging providers.
5. Add analytics export + observability (logging, metrics).
6. Document deployment + runbooks.
