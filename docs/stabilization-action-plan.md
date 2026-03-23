# Niat Murni v1 — Stabilization Action Plan

**Date:** 2026-03-23  
**Based on:** Forensic Technical Audit (same date)  
**Audience:** Non-technical founder + development team  
**Scope:** Minimum work needed to make the current system safe and coherent — no rebuilds, no architecture rewrites yet.

---

## How to read this plan

Each task is tagged:

- **Complexity:** Low = 1 day or less · Medium = 2–4 days · High = 5+ days
- **Risk if ignored:** What could happen in production if this is skipped
- **Files involved:** Exact starting points for a developer

---

## CATEGORY 1 — Must Fix Now (Security & Stability Blockers)

These must be resolved **before** any new feature work and **before** any public traffic reaches the app.

---

### 1.1 — Secure the exposed admin + finance API routes

**Why it matters:**
Right now, anyone who knows the URL can trigger a refund, mark a booking complete, or read all finance data. There is no login check on these routes. This is a critical production security hole.

**Specific problem (from code):**
In `apps/admin-laravel/routes/api.php`, these routes sit **outside** the `auth:sanctum` group and are fully public:

```
POST /api/admin/bookings/{bookingId}/refund    ← no auth
POST /api/admin/bookings/{bookingId}/complete  ← no auth
GET  /api/admin/finance/revenue-timeline       ← no auth
GET  /api/admin/finance/refund-timeline        ← no auth
GET  /api/admin/finance/tutor-payout-timeline  ← no auth
```

**Files involved:**
- `apps/admin-laravel/routes/api.php` (lines 27–37)

**Fix:** Move all five routes inside the existing `auth:sanctum` group (lines 50–81) — 5 lines of code.

**Risk if ignored:** Any person, bot, or competitor can issue refunds, complete bookings, or scrape all revenue data without logging in.

**Complexity:** Low

---

### 1.2 — Remove duplicate Stripe webhook

**Why it matters:**
There are two different Stripe webhook controllers registered on two different URLs. If both receive the same event, Stripe could process a payment twice (double-issue a certificate, double-confirm a booking, etc.).

**Specific problem:**
- `routes/api.php` line 25: `POST /api/webhooks/stripe` → `Api\StripeWebhookController`
- `routes/web.php` line 17: `POST /webhooks/stripe` → `StripeWebhookController` (different class)

Both do different things. Stripe can only be pointed at one.

**Files involved:**
- `apps/admin-laravel/routes/api.php`
- `apps/admin-laravel/routes/web.php`
- `apps/admin-laravel/app/Http/Controllers/Api/StripeWebhookController.php`
- `apps/admin-laravel/app/Http/Controllers/StripeWebhookController.php`

**Fix:** Decide which controller is current (the Api version is more complete), disable the other route, and document the chosen webhook URL in the Stripe dashboard.

**Risk if ignored:** Duplicate payment processing or missed payment events; inconsistent certificate issuance.

**Complexity:** Low

---

### 1.3 — Document and lock the environment variable checklist

**Why it matters:**
The app will silently break (empty class lists, failed payments, no CMS) if the wrong env vars are set or missing at deployment. Developers and DevOps need a single source of truth.

**Specific problem:**
Multiple frontend variables with overlapping names:
- `NEXT_PUBLIC_LARAVEL_API_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_ADMIN_API_URL`
- `NEXT_PUBLIC_GO_API_URL`
- `NEXT_PUBLIC_FILAMENT_BASE_URL`

Each is checked in different files. A missing one silently returns empty data rather than throwing an error.

**Files involved:**
- `apps/web/.env.example` (update to match all five vars + describe each)
- `apps/admin-laravel/.env.example` (add MAIL_* if email is needed; confirm all Stripe keys)
- Create: `docs/environment-setup.md` — one page linking both `.env.example` files with plain-English descriptions

**Risk if ignored:** Fresh deployment works in dev but is broken in production; debugging takes days.

**Complexity:** Low

---

### 1.4 — Clarify and protect the public class data path

**Why it matters:**
The public website uses `NEXT_PUBLIC_GO_API_URL` to show upcoming classes. The Go service (`services/core-go`) is a separate app that needs its own deployment and database. If it is not running, the homepage class list is silently empty. Visitors see nothing and assume there are no classes.

**Specific problem:**
- `apps/web/lib/api.ts` lines 31 and 43: `fetchUpcomingClasses` and `fetchClass` call `GO_API_URL`
- If `NEXT_PUBLIC_GO_API_URL` is not set, both functions return empty silently
- Laravel has its own `class_sessions` table and API — but Next.js does not use it for public class browsing

**Files involved:**
- `apps/web/lib/api.ts`
- `apps/web/.env.example`
- `apps/web/components/home/UpcomingClassesSection.tsx`

**Fix (minimal):** Either (a) confirm Go is deployed and set the env var, or (b) add a visible fallback/error message so the founder can see immediately when classes are not loading.

**Risk if ignored:** The most important public-facing feature (seeing available classes) is invisible to visitors with no error shown.

**Complexity:** Low (env + message) to Medium (switching to Laravel classes API)

---

## CATEGORY 2 — Must Finish Next (Incomplete Core Features)

These tasks are needed for the product to function for real users. Safe to start after Category 1 is done.

---

### 2.1 — Connect registration flow end-to-end

**Why it matters:**
A visitor can click "Register" on the class detail page. This calls `POST /api/register` → Laravel → Stripe checkout. But:
- Class detail data comes from **Go**
- Registration goes to **Laravel**
- The `class_session_id` must exist in **Laravel's** `class_sessions` table for the booking to save

If Go and Laravel hold different class session data, registration will fail with "class not found" errors.

**Files involved:**
- `apps/admin-laravel/app/Http/Controllers/Api/RegisterForClassController.php`
- `apps/admin-laravel/routes/api.php` (line 19)
- `apps/web/lib/api.ts` (lines 58–73)
- `apps/web/app/class/[id]/register/page.tsx`

**Fix:** Verify that class sessions created in **Filament** (Laravel) are the same ones shown to users (from Go or Laravel). If they differ, pick one source for the public class list and registration — they must match.

**Risk if ignored:** Users attempt to register, payment fails, bookings are lost, founder has no revenue.

**Complexity:** Medium

---

### 2.2 — Wire the participant portal (login, certificates, profile)

**Why it matters:**
The participant portal exists in the frontend (`app/participant/**`) and the API (`/api/participant/*`) exists in Laravel. But it has not been confirmed working end-to-end. Participants are the primary product customers.

**Files involved:**
- `apps/web/app/participant/login/page.tsx`
- `apps/web/app/participant/certificates/page.tsx`
- `apps/web/lib/participant-api.ts`
- `apps/admin-laravel/app/Http/Controllers/Api/ParticipantAuthController.php`
- `apps/admin-laravel/app/Http/Controllers/Api/ParticipantCertificatesController.php`

**Fix:** Run through the login → view certificates → download flow manually with a test participant and confirm it works.

**Risk if ignored:** Participants cannot access their certificates after completing courses — core product value is broken.

**Complexity:** Medium

---

### 2.3 — Consolidate the admin "System Settings" story

**Why it matters:**
There are currently two separate settings tables in the database:
1. `settings` — used by Filament System Settings page (the real, working one)
2. `system_settings` — created by a migration but not connected to anything useful

There is also a Next.js admin page (`app/admin/settings/system/page.tsx`) that is a placeholder with no data.

This creates confusion about which settings are "real" and where admins should go.

**Files involved:**
- `apps/admin-laravel/database/migrations/2026_03_23_130000_create_system_settings_table.php`
- `apps/admin-laravel/app/Models/SystemSetting.php`
- `apps/web/app/admin/settings/system/page.tsx`
- `apps/admin-laravel/app/Filament/Pages/SystemSettings.php`

**Fix:** Keep the Filament System Settings page (it is the real implementation). Remove or document the `SystemSetting` model as deprecated. Update the Next.js placeholder page to redirect to Filament.

**Risk if ignored:** Future developers (or the founder) will be unsure which settings page to use, creating duplicate or conflicting configuration.

**Complexity:** Low

---

### 2.4 — Confirm certificate issuance and verification works

**Why it matters:**
Certificates are a core deliverable of the platform (food handling certification). The certificate lifecycle code exists but has not been confirmed end-to-end.

**Specific concern:** The `settingAsBool('require_attendance')` in `AdminBookingCompletionController` reads from `settings` using a legacy key lookup. If the migration to grouped settings broke this lookup, certificates will either never issue or always issue (wrong).

**Files involved:**
- `apps/admin-laravel/app/Http/Controllers/Admin/AdminBookingCompletionController.php`
- `apps/admin-laravel/app/Services/CertificateLifecycleService.php`
- `apps/admin-laravel/app/Http/Controllers/Api/CertificateVerificationController.php`
- `apps/admin-laravel/database/migrations/2026_03_27_000000_restructure_settings_for_groups.php`

**Fix:** Manually test: complete a booking → confirm certificate is issued → verify via `/api/certificate/verify/{token}`.

**Risk if ignored:** Customers complete courses and receive no certificate, or the wrong people receive certificates.

**Complexity:** Medium

---

### 2.5 — Add MAIL_* env vars and confirm the welcome/booking email pathway

**Why it matters:**
The System Settings page has SMTP fields, and the codebase references email notifications for bookings and certificates. If mail is not configured, no confirmation emails are sent.

**Files involved:**
- `apps/admin-laravel/.env.example` (MAIL_* vars likely missing)
- `apps/admin-laravel/config/system_settings.php` (email group)
- `apps/admin-laravel/app/Filament/Pages/SystemSettings.php` (Email tab)

**Fix:** Add `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS` to `.env.example` with clear comments. Confirm at least one transactional email (booking confirmation) actually fires.

**Risk if ignored:** Users register, pay, and receive no confirmation email. Trust in the platform is lost.

**Complexity:** Low (configuration) to Medium (if email templates need building)

---

## CATEGORY 3 — Can Defer (Important But Not Blocking)

These are real problems but will not cause immediate breakage or revenue loss.

---

### 3.1 — Retire or document the parallel Next.js admin

**Why it matters:**
Two admin interfaces exist: **Filament** (Laravel, full-featured) and the **Next.js static admin** (`apps/web/app/admin/**`). This creates confusion about where to manage data. The Next.js admin is not feature-complete (payments = placeholder, system settings = placeholder).

**Files involved:**
- `apps/web/app/admin/**`
- `apps/web/lib/admin-api.ts`

**Defer until:** A clear product decision is made on which admin is the long-term primary for each function.

**Risk if deferred:** Wasted development effort on the wrong interface; admin confusion for the team.

**Complexity:** High (if reconciling both), Low (if documenting which to use when)

---

### 3.2 — Fix `apps/web-next` parallel frontend

**Why it matters:**
There is a second Next.js app at `apps/web-next` that appears to be an experimental copy. It should either be promoted to the main frontend or deleted.

**Files involved:**
- `apps/web-next/` (entire directory)

**Risk if deferred:** Development effort split between two frontends; bugs fixed in one but not the other.

**Complexity:** Low (delete) to High (if it contains unique features)

---

### 3.3 — Decommission unused models and orphan code

**Why it matters:**
Several models exist with no clear integration: `DemandRequest`, `Shipment`, `ClassQuestionnaire`, `QuestionBank`, `QuestionBankItem`. These are in the codebase but have no Filament resources or active APIs.

**Files involved:**
- `apps/admin-laravel/app/Models/DemandRequest.php`
- `apps/admin-laravel/app/Models/Shipment.php`
- `apps/admin-laravel/app/Models/ClassQuestionnaire.php`
- `apps/admin-laravel/app/Models/QuestionBank.php`
- `apps/admin-laravel/app/Models/QuestionBankItem.php`

**Risk if deferred:** No runtime risk. Code confusion and increased maintenance overhead over time.

**Complexity:** Low

---

### 3.4 — Add basic automated tests for critical paths

**Why it matters:**
There are zero automated tests in the project. Every deployment is a manual gamble. The three highest-risk flows that need a test first: (1) registration + payment redirect, (2) booking completion + certificate issuance, (3) admin login + access control.

**Files involved:**
- New: `apps/admin-laravel/tests/Feature/RegistrationTest.php`
- New: `apps/admin-laravel/tests/Feature/CertificateTest.php`
- New: `apps/admin-laravel/tests/Feature/AdminAuthTest.php`

**Risk if deferred:** Silent regressions in every future change. High maintenance cost. Hard to onboard new developers.

**Complexity:** Medium

---

### 3.5 — Update `docs/ARCHITECTURE_SPLIT.md` to reflect current reality

**Why it matters:**
The architecture doc says "Laravel does NOT implement classes, bookings, payments" — but the codebase does all of these in Laravel. Any new developer or contractor will be misled into building in the wrong place.

**Files involved:**
- `docs/ARCHITECTURE_SPLIT.md`

**Risk if deferred:** Developer confusion, wasted effort, conflicting implementations.

**Complexity:** Low (documentation only)

---

## Recommended Next 10 Development Tasks (in order)

These are the safest sequence of tasks to run, from highest urgency to lowest, without needing a rebuild or major rethink.

| # | Task | Category | Complexity | Why now |
|---|------|----------|------------|---------|
| 1 | Secure the 5 unprotected admin/finance API routes (add auth:sanctum) | 1.1 | Low | Critical security — must be first |
| 2 | Consolidate Stripe webhook to one controller and one URL | 1.2 | Low | Prevents payment processing errors |
| 3 | Update `.env.example` files (both web + Laravel) and write `docs/environment-setup.md` | 1.3 | Low | Prevents silent deployment failures |
| 4 | Fix or display error for empty class list (Go API not set) | 1.4 | Low | Visitors see empty homepage otherwise |
| 5 | Verify registration → Stripe checkout → booking saved end-to-end (manual test + fix) | 2.1 | Medium | Core revenue flow |
| 6 | Verify participant login → view certificate → download (manual test + fix) | 2.2 | Medium | Core product value delivery |
| 7 | Verify booking complete → certificate issued → `/api/certificate/verify/{token}` returns valid data | 2.4 | Medium | Certificate delivery is the product outcome |
| 8 | Deprecate `system_settings` table and `SystemSetting` model; update Next.js placeholder page | 2.3 | Low | Clean up duplicate settings confusion |
| 9 | Configure mail env vars and confirm booking confirmation email sends | 2.5 | Low–Medium | User trust + communication |
| 10 | Update `docs/ARCHITECTURE_SPLIT.md` to document current actual reality | 3.5 | Low | Prevents future developer confusion |

---

## What NOT to do right now

The following actions are **explicitly deferred** until the above is stable:

- **No architecture split** (deciding Go vs Laravel as source of truth) — defer until system is stable
- **No rebuild of the Next.js admin** — confirm Filament is primary first
- **No new features** (Zoom, questionnaires, payout processing) — these depend on stable base
- **No schema redesign** — work with current migrations

---

*This plan was produced from a static code audit. A developer should verify each item against the live environment before finalizing priorities.*
