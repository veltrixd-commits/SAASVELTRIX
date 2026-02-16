# Navigation & Interaction Logic Map

> Use this map as a QA checklist. Every button, tab, and hero card listed below links to a concrete route or handler inside the project so you can confirm nothing is orphaned or decorative-only.

## Marketing + Auth

| Surface | Element | Action/Logic | Source |
| --- | --- | --- | --- |
| Landing hero | Primary CTA buttons | Persist `selectedPlan` in `localStorage` then `router.push('/signup')`. | `app/page.tsx`
| Pricing cards | `Select Plan` button on each tier | Apply plan label → `setSelectedPlan` → go to `/signup`. | `app/pricing/page.tsx`
| Signup form | `Create Account` | Runs `handleSubmit` → `/api/auth/send-signup-verification` with `rememberDevice`. | `app/signup/page.tsx`
| Signup form | `Continue with Google / Apple` | Validates form context → sends verification payload → same API. | `app/signup/page.tsx`
| Signup verify | Success CTA | Auto-routes to onboarding or waiting approval once verification completes. | `app/verify-signup/page.tsx`
| Login | `Remember me` checkbox | Persists trusted device fingerprint + enables quick dashboard jump. | `app/login/page.tsx`
| Login | "Go to dashboard" pill | Appears when device fingerprint trusted; bypasses form completely. | `app/login/page.tsx`

## Onboarding Flow

| Step | Buttons / Tabs | Logic |
| --- | --- | --- |
| `/onboarding/business-details` | `Next`, `Save & Exit` | Updates `onboardingStep` via `lib/auth.updateAccount`. |
| `/onboarding/product-setup` | Product cards, `Add Product` button | Calls `lib/demoData` helpers, persists to account products array. |
| `/onboarding/automation-preferences` | Toggle grid | Writes preference map to `automationPreferences`. |
| `/onboarding/billing` | Plan tiles + `Skip` | Captures `billingInfo` or sets `billingSkipped`. |
| `/onboarding/tour` | Next/back controls | Drives `tourStarted`/`tourSkipped`; completed flows to `/dashboard`. |

## Dashboard Navigation

See [app/dashboard/layout.tsx](app/dashboard/layout.tsx) for canonical nav list. Every link uses `<a href>` with a concrete route defined under `app/dashboard/*`:

- Main: Today, Dashboard
- Personal OS: Productivity, Ideas, Wellness, Performance, Content Studio, Personal Budget
- Business: Inbox, Leads, Conversations, Products, POS, Delivery, Finance Centre, Invoices, Automations, Pipelines, Analytics, Scheduler
- Settings: Settings root (subtabs render inside page component)

Permission guardrails live in the `routePermissionMap` inside the layout so unauthorized users are bumped back to `/dashboard` with an inline alert stored in `localStorage.accessDeniedMessage`.

## Cards, Tabs, and Buttons (Representative Sample)

| Page | Component | Logic |
| --- | --- | --- |
| `/dashboard/today` | Autopilot cards (`Start Day`, `Launch Autopilot`) | Toggle state machine in `components/AIChatbot` + autopilot runtime. |
| `/dashboard/inbox` | Channel tabs | Filter dataset from `lib/messaging` per provider; actions open reply drawer. |
| `/dashboard/finance` | KPI cards | Pulls demo ledger via `lib/commerceData`; `Send Statement` hits `/api/finance/send-document`. |
| `/dashboard/pos` | `Launch Storefront` toggle | Broadcasts `pos-storefront-mode-change` custom event and stores preference in `localStorage`. |
| `/dashboard/products/[id]` | Action buttons (`Edit`, `Duplicate`, `Sync`) | Each calls handler in page component that updates product list in `lib/demoData`. |
| `/dashboard/settings` | Tabs (Profile, Integrations, Notifications, Billing) | Controlled by component state; each tab writes to `localStorage` or invokes relevant API (Stripe, OAuth placeholders). |
| `/dashboard/content-studio` | Template cards (`Schedule`, `Send to Studio`) | Opens modal + writes draft to `lib/demoData`. |
| `/dashboard/tour` | Slide nav dots + CTA button | drives `activeSlide` state; completion routes to `/dashboard/today`. |

## QA Checklist

1. Load `http://localhost:3000/pricing` → select each plan → confirm `/signup` banner reflects plan title.
2. Complete signup with `Remember device` checked → verification email API returns success even without SMTP (console fallback) → after login the dashboard pill appears.
3. Iterate through sidebar links; for each, ensure `usePathname()` highlight updates and the page renders without missing data errors.
4. Trigger finance email endpoints via `/dashboard/finance` and verify `/api/finance/email-status` reports `{ ready: true }` with `mode: 'console'` when SMTP creds are absent.
5. In POS view toggle storefront mode and refresh; kiosk overlay should persist because the custom storage event fires.

Document any missing logic directly in this file so the checklist remains living documentation.
