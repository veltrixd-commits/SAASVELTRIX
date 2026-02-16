# UniLife Launch Playbook

## 1. Navigation & Logic Coverage Plan

| Surface | Primary Entry | Guard Rails | Test Notes |
| --- | --- | --- | --- |
| Marketing funnel | `/`, `/pricing`, `/signup` | CTA buttons must carry `selectedPlan` via `localStorage`; hero banners auto-scroll to signup. | Click-test every CTA in desktop/mobile, confirm `localStorage.selectedPlan` updates.
| Auth | `/signup`, `/verify-signup`, `/login` | New "remember device" flag must persist through pending verification payload and trusted-device store. | Validate happy path plus expired token, duplicate device/email, and remembered-device quick login.
| Onboarding | `/onboarding/*` | User type determines required sections (business details, product setup, automations, billing, tour). | For each user type, walk the wizard ensuring `onboardingStep` updates and resume works after refresh.
| Dashboard | `/dashboard`, `/dashboard/*` | RBAC gating via `lib/accessControl.ts`; employees with pending approvals must be redirected to `/waiting-approval`. | Run smoke test on top-level nav plus widget loaders; confirm `getPostLoginRoute` returns correct path.
| POS/Commerce flows | `/dashboard/pos`, `/dashboard/orders`, `/dashboard/products/[id]` | Real-time totals rely on `lib/commerceData.ts`; ensure we seed demo products per tenant. | Add Cypress script to walk POS order, edit, and invoice email scenarios.
| Inbox & Automations | `/dashboard/inbox`, `/dashboard/automations` | Messaging state held in `lib/messaging`; ensure OAuth secrets exist before enabling social connectors. | Mock provider tokens locally, then flip `ENABLE_*` flags for final verification.
| Wellness & Today views | `/dashboard/today`, `/dashboard/wellness` | Requires demo wellness guardrails; keep fallbacks for missing wearable data. | Confirm cards render even when `wellnessScore` undefined.
| Admin utilities | `/dashboard/settings`, `/dashboard/performance` | Settings expose API keys; hide values unless `userType === 'business'`. | Manual QA for toggle persistence via `localStorage`.

## 2. Layout Fix List (Pricing, Tour, etc.)

1. **Pricing tiers (`app/pricing/page.tsx`)**
   - Align CTA stack vertically on mobile with `gap-4` and full-width buttons.
   - Rebalance gradient backgrounds to match dashboard blues; move testimonial card below plans on small screens.
   - Add sticky plan switcher for annual/monthly toggle when viewport > 1024px.
2. **Product tour (`app/dashboard/tour/page.tsx`)**
   - Replace paragraph wall in finale slide with three-column summary chips.
   - Add Lottie-backed animation to hero slide (place assets in `public/tour/` and lazy load).
   - Ensure audio transcript matches on-screen copy (currently capitalisation differs).
3. **Onboarding wizard (`app/onboarding/*`)**
   - Standardize header height and progress pill across steps; use CSS variable `--wizard-accent` tied to user type.
   - Move "skip" buttons into footer bar with secondary tone; log skip events via `console.table` for now.
4. **Dashboard nav (`app/dashboard/layout.tsx`)**
   - Introduce hover intent delay for mega menu, remove redundant icons on nested links.
   - Add "Back to Today" floating pill on scroll for better orientation.

## 3. End-to-End Roadmap

**Phase 0 – Environment Hardening (Today)**
- Lock `EMAIL_TRANSPORT_MODE=smtp` and load real SMTP creds in Vercel + local `.env`.
- Double-check OAuth + Stripe secrets against `.env.example` before next deploy.

**Phase 1 – Auth & Onboarding Polish (Week 1)**
- Ship remembered-device experience (done) and add analytics events for opt-ins.
- Finish onboarding QA matrix per user type; capture issues in `/docs/onboarding-report.md` (new file).

**Phase 2 – UX Refinements (Week 2)**
- Implement layout fixes above, prioritising pricing + tour; add responsive screenshots to `DEMO_GUIDE.md`.
- Stagger dashboard animations and ensure dark-mode parity.

**Phase 3 – Data & Payments (Week 3)**
- Connect live Postgres + Prisma migrations; backfill demo tenant data with `prisma/seed.ts`.
- Run Stripe test payments, confirm webhook handling in `/app/api/finance/*`.

**Phase 4 – Launch Ops (Week 4)**
- Trigger final Vercel prod deploy, run `npm run lint` + `npm run build` gates.
- Execute go-live checklist in `DEPLOYMENT_CHECKLIST.md`, capture sign-off in README changelog.

> Keep this playbook close during QA; it maps 1:1 with the remaining tracker items and ensures stakeholders know what "done" means for launch.
