# UI Navigation & Logic Audit
_Audit date: 2024-05-15_

## Dashboard Entry Surfaces
| Element | Location | Interaction coverage | Status | Gaps / Next action |
| --- | --- | --- | --- | --- |
| Welcome + Autopilot banners | [app/dashboard/page.tsx](app/dashboard/page.tsx) | `router.push` links to `/dashboard/today` and `/dashboard/settings` ensure CTAs move users into the run sheet and setup flow. | Green | None. Copy already warns before dismissal; no additional guardrails required. |
| Recommended Action cards | [app/dashboard/page.tsx](app/dashboard/page.tsx) | Each card renders as `<a href="...">`, so navigation is immediate even without JS. | Green | Consider analytics hook to record clicks if needed. |
| Outcome playbooks | [app/dashboard/page.tsx](app/dashboard/page.tsx) | `navigateTo(playbook.href)` wires to leads, invoices, automations, wellness, etc. Buttons are disabled only when no href present. | Green | None. |
| Stat cards | [app/dashboard/page.tsx](app/dashboard/page.tsx) | Mixed behavior: some cards open modals via `handleMetricClick`, others go straight to filtered routes. | Green | Modal close buttons + overlay already implemented; no action. |
| Quick action row | [app/dashboard/page.tsx](app/dashboard/page.tsx) | Each card calls `navigateTo('/dashboard/<section>')`. | Green | None. |
| Activity feed + directives | [app/dashboard/page.tsx](app/dashboard/page.tsx) | CTA buttons use `navigateTo(signalDirective.href)` and lead table rows pass `href` down to `LeadCard`/`LeadRow`. | Green | None. |
| Drill-down modals | [app/dashboard/page.tsx](app/dashboard/page.tsx) | Modal CTA buttons use `router.push`/`window.location.href` to open the relevant section after closing overlays. | Green | Consider consolidating navigation helper to avoid mixing router/window. |

## Sidebar & Route Protection
- Navigation list plus feature gating live in [app/dashboard/layout.tsx](app/dashboard/layout.tsx).
- `navLinks` array omits items the current user lacks permission for; permissions pulled from `getCurrentUserPermissions()`.
- `routePermissionMap` reroutes unauthorized hits back to `/dashboard` and persists `accessDeniedMessage` so the dashboard header can display why access was blocked.
- POS storefront mode, kiosk locking, and keyboard shortcuts are already guarded to avoid interaction conflicts.

## Feature Module Spot Checks
| Module | Location | Primary controls | Status | Notes |
| --- | --- | --- | --- | --- |
| Inbox | [app/dashboard/inbox/page.tsx](app/dashboard/inbox/page.tsx) | Quick filters, platform selectors, reply drawers, AI toggle. Local storage queues keep message actions consistent. | Green | Toast + storage plumbing in place; ready for backend swap. |
| Leads | [app/dashboard/leads/page.tsx](app/dashboard/leads/page.tsx) | Filter chips, search box, CRUD modals, comment threads. Every CTA updates local storage for persistence. | Green | Add analytics instrumentation when real API ships. |
| Automations | [app/dashboard/automations/page.tsx](app/dashboard/automations/page.tsx) | Create/edit modals, run/test buttons, AI permission guard before executing sequences. | Green | `executeAutomation` already returns telemetry; expand logging later. |
| Point of Sale | [app/dashboard/pos/page.tsx](app/dashboard/pos/page.tsx) | Catalog picker, cart controls, payment modal, storefront mode toggle. Every button updates cart state or calls commerce helpers. | Green | Need QA for edge cases (stock depletion, receipt printing) once connected to live data. |

## Outstanding / Partial Areas
| Area | Evidence | Status | Follow-up |
| --- | --- | --- | --- |
| Content Studio publish to calendar | [app/dashboard/content-studio/page.tsx](app/dashboard/content-studio/page.tsx#L882) | TODO marker notes calendar persistence not wired. | Add storage/API call plus success toast. |
| Finance expense save | [app/dashboard/finance/page.tsx](app/dashboard/finance/page.tsx#L1997) | TODO indicates expenses are not persisted yet. | Implement storage (similar to revenue entries) or wire to backend. |
| Settings "Coming Soon" block | [app/dashboard/settings/page.tsx](app/dashboard/settings/page.tsx#L1036-L1044) | Panel deliberately inert. | Replace placeholder once rollout plan lands; document scope creep until then. |

## Recommended Next Steps
1. Keep this audit synced by updating the table whenever a new dashboard control ships.
2. Instrument CTA clicks (A/B tests, funnel tracking) once analytics framework is confirmed.
3. Close the outstanding TODOs so every surface listed above either performs an action or is explicitly flagged as deliberate placeholder.
