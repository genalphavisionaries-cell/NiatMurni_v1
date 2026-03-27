# Niat Murni v1 - Technical Baseline (Current State)

Last updated: 2026-03-27  
Purpose: canonical reference for current active architecture, route boundaries, modules, and auth flows.  
Scope: current finalized code state only.

---

## 1) System Overview

This repository is a monorepo. The currently active production web experience is built around:

- `apps/web` - Next.js frontend (public site + admin UI + participant/tutor portals)
- `apps/admin-laravel` - Laravel backend API + auth + CMS data source + business services

Other folders (e.g. `services/core-go`, `apps/web-next`) exist in repo history/structure but are not the primary active web app used by `apps/web` for the current stage.

---

## 2) Active Technology Stack

### Frontend (`apps/web`)
- Next.js App Router (`next@15`)
- React (`react@19`)
- TypeScript
- Tailwind CSS
- Static export mode enabled (`output: "export"` in `apps/web/next.config.ts`)
- API access via fetch clients:
  - `apps/web/lib/api.ts`
  - `apps/web/lib/admin-api.ts`
  - `apps/web/lib/participant-api.ts`
  - `apps/web/lib/public-cms.ts`

### Backend (`apps/admin-laravel`)
- Laravel 11
- Sanctum (token auth + cookie bridging)
- Eloquent ORM
- Stripe SDK (`stripe/stripe-php`)
- Filament package present in backend app

---

## 3) Environment and Domains

Current documented canonical web/admin URL:
- `https://niatmurniacademy.com`
- Admin UI path: `https://niatmurniacademy.com/admin`

Main frontend API base variables used in `apps/web`:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_LARAVEL_API_URL`
- `NEXT_PUBLIC_ADMIN_API_URL` (used by CMS/public settings fetching path selection)

Key references:
- `apps/web/.env.example`
- `apps/web/lib/public-cms.ts`
- `apps/web/lib/api.ts`
- `apps/admin-laravel/README.md`

---

## 4) Route Namespace Separation (Current)

### Public site
- Namespace: `/*`
- Examples:
  - `/`
  - `/class/[id]`
  - `/class/[id]/register`
  - `/booking/[id]`
  - `/privacy`, `/terms`, `/refund`

### Admin
- Namespace: `/admin/*`
- Examples:
  - `/admin`
  - `/admin/login`
  - `/admin/programs`
  - `/admin/classes`
  - `/admin/bookings`
  - `/admin/payments`
  - `/admin/cms/*`
  - `/admin/settings/*`

### Participant portal (current route family)
- Namespace: `/participant/*`
- Examples:
  - `/participant`
  - `/participant/login`
  - `/participant/courses`
  - `/participant/certificates`
  - `/participant/profile`
  - `/participant/support`

### Tutor portal
- Namespace: `/tutor/*`
- Examples:
  - `/tutor`
  - `/tutor/classes`
  - `/tutor/students`
  - `/tutor/attendance`
  - `/tutor/materials`
  - `/tutor/profile`

---

## 5) Frontend Layout Boundaries

### Admin layout
- `apps/web/app/admin/layout.tsx`
- `apps/web/app/admin/AdminLayoutClient.tsx`
- Header/nav component:
  - `apps/web/components/admin/AdminTwoTierHeader.tsx`

### Participant/Tutor dashboard shell
- `apps/web/components/dashboard/DashboardLayout.tsx`
- Used by:
  - `apps/web/app/participant/layout.tsx`
  - `apps/web/app/tutor/layout.tsx`

### Public shell
- `apps/web/components/public/PublicSiteShell.tsx`

---

## 6) Authentication Model (Current)

## Frontend middleware behavior
- File: `apps/web/middleware.ts`
- Current matcher protects admin routes:
  - `/admin`
  - `/admin/(except login)`
- Checks cookie: `admin_session` (`apps/web/lib/auth.ts`)
- Redirects unauthenticated admin access to `/admin/login?redirect=...`

Note: participant/tutor route protection is currently handled by page/layout logic and API auth checks, not a dedicated `/participant` middleware matcher in current code.

## Backend auth mechanisms
- Sanctum is active for protected API groups.
- Cookie-to-bearer bridge middleware:
  - `apps/admin-laravel/app/Http/Middleware/SanctumTokenFromCookie.php`
  - Reads `admin_token` or `participant_token` and injects Authorization header.

## Admin auth endpoints
- `POST /api/admin/login`
- `POST /api/admin/logout` (protected)
- `GET /api/admin/me` (protected)

## Participant auth endpoints (current active)
- `POST /api/participant/login`
- `POST /api/participant/logout` (protected)
- `GET /api/participant/me` (protected)

Key routes file:
- `apps/admin-laravel/routes/api.php`

---

## 7) Backend API Structure (Current)

### Public API area
- `/api/public/cms`
- `/api/public/settings`
- `/api/public/classes/upcoming`
- `/api/public/classes/{id}`
- `/api/public/bookings/{id}`
- `/api/homepage-settings`
- `/api/settings/{group}`

### Booking/payment area
- `/api/reservations`
- `/api/payments/checkout`
- `/api/payments/manual/upload-receipt`
- `/api/payments/manual/submit`
- `/api/bookings/{id}/manual-payment`
- `/api/webhooks/stripe`

### Certificate area
- `/api/certificate/verify/{token}`
- `/api/certificate/download/{token}`

### Admin protected API namespace
- Prefix: `/api/admin/*`
- Guard: `auth:sanctum` + `EnsureAdminAccess`
- Includes modules:
  - dashboard
  - settings
  - bookings
  - finance/payments/vouchers
  - programs
  - class sessions + attendance
  - tutors
  - participants
  - employers
  - CMS
  - users

---

## 8) Homepage and CMS Rendering Flow

Homepage entry:
- `apps/web/app/page.tsx`

Data loading:
- Legacy homepage settings from `getHomepageSettings()`
- Structured CMS payload from `fetchPublicCms()`

Merge and render:
- `mergePublicCmsForHome(...)` merges context and navigation/footer fields
- If CMS redesign sections exist, homepage uses:
  - `CmsHeader`
  - `CmsHomepageRenderer`
  - `CmsFooter`
- Otherwise, it falls back to legacy home sections.

Important files:
- `apps/web/lib/public-cms.ts`
- `apps/web/lib/merge-public-cms.ts`
- `apps/web/components/home/cms/CmsHomepageRenderer.tsx`
- `apps/web/components/home/CmsHeader.tsx`
- `apps/web/components/home/CmsFooter.tsx`

---

## 9) Functional Module Map

### Public-facing modules
- Hero + homepage content
- Class listing and class detail
- Registration page
- Booking detail page
- CMS-driven content blocks and footer/header

### Admin modules
- Dashboard analytics overview
- Programs
- Class sessions
- Bookings
- Payments + delivery config
- Vouchers
- Tutors
- Participants
- CMS editors (homepage/header/footer/testimonials/logos)
- Users
- Settings

### Participant modules (current family under `/participant`)
- Login
- Dashboard home
- Courses
- Certificates
- Profile
- Support

### Tutor modules
- Dashboard home
- Classes
- Students
- Attendance
- Materials
- Profile

---

## 10) User Accounts and Identity Model

### Known seeded/admin bootstrap accounts (documented in code/docs)
- `admin@niatmurniacademy.com`
- `admin@niatmurni.my` (legacy)

References:
- `apps/admin-laravel/database/seeders/AdminUserSeeder.php`
- `apps/admin-laravel/routes/console.php`
- `apps/admin-laravel/README.md`

### Runtime user model
- Core auth user table/model: `apps/admin-laravel/app/Models/User.php`
- Role-based identity currently includes:
  - admin
  - participant
  - tutor (trainer)

### Participant linkage
- Participant profile links to user via `participants.user_id`
- Model: `apps/admin-laravel/app/Models/Participant.php`

Note: Full live list of registered users/participants is database state and not stored in git.

---

## 11) Important Operational Commands

From repo root (frontend build):
- `npm run build` inside `apps/web`

Laravel side (examples):
- `php artisan migrate`
- `php artisan db:seed`
- `php artisan admin:ensure-admin` (see backend docs/console commands)

---

## 12) Baseline Rules for Future Changes

Use this document as baseline guardrails:

- Keep route namespaces clearly separated (`/admin`, `/participant`, `/tutor`, public).
- Do not mix layout components across namespaces.
- Preserve CMS fetch + merge flow in homepage unless explicitly redesigning architecture.
- Any auth/middleware change must be documented with:
  - intended route scope
  - cookie/token used
  - redirect behavior
- For major changes, append a dated section below instead of overwriting baseline.

---

## 13) Change Log Seed (for next commits)

Use this template for future updates:

```
## [YYYY-MM-DD] Change Summary
- Scope:
- Routes affected:
- Files affected:
- Auth impact:
- CMS impact:
- Migration required:
- Rollback plan:
```

---

## 14) Admin Panel UI - Detailed Structure

Admin UI is implemented in Next.js under `apps/web/app/admin/*`.

### Shell and navigation
- Root admin layout:
  - `apps/web/app/admin/layout.tsx`
  - `apps/web/app/admin/AdminLayoutClient.tsx`
- Two-tier admin header (dark top bar + module nav + profile/logout):
  - `apps/web/components/admin/AdminTwoTierHeader.tsx`
- Nav source (role/module-aware):
  - `apps/web/components/dashboard/dashboard-config.tsx`

### Admin route modules (UI)
- Dashboard: `/admin` -> `apps/web/app/admin/page.tsx`
- Programs: `/admin/programs`
- Classes: `/admin/classes`
- Bookings: `/admin/bookings`, `/admin/bookings/[id]`
- Tutors: `/admin/tutors`
- Participants: `/admin/participants`
- Certificates: `/admin/certificates`
- Payments: `/admin/payments`
- Finance vouchers: `/admin/finance/vouchers`
- CMS:
  - `/admin/cms`
  - `/admin/cms/homepage`
  - `/admin/cms/header`
  - `/admin/cms/footer`
  - `/admin/cms/testimonials`
  - `/admin/cms/logos`
- Settings:
  - `/admin/settings`
  - `/admin/settings/profile`
  - `/admin/settings/system`
  - `/admin/settings/users` (redirect helper to `/admin/users`)
- User management: `/admin/users`

### Admin UI API client
- `apps/web/lib/admin-api.ts`
- All admin page data/actions call Laravel `/api/admin/*` endpoints.

---

## 15) Backend - Detailed Module Map

Laravel backend is in `apps/admin-laravel`.

### Core API route groups
- Public/general: `/api/public/*`, `/api/settings/*`, `/api/homepage-settings`
- Commerce flow: `/api/reservations`, `/api/payments/*`, `/api/webhooks/stripe`
- Certificates: `/api/certificate/*`
- Admin auth: `/api/admin/login`, `/api/admin/forgot-password`, `/api/admin/reset-password`
- Participant auth/data: `/api/participant/*`
- Admin protected namespace: `/api/admin/*` + middleware:
  - `auth:sanctum`
  - `EnsureAdminAccess`
  - `module:*` scoped middleware inside admin group

### Important backend modules/controllers (active)
- Admin auth/profile/settings:
  - `Api/AdminAuthController.php`
  - `Api/Admin/AdminSettingsController.php`
- Commerce and operations:
  - `Api/ReservationController.php`
  - `Api/PaymentController.php`
  - `Api/ManualPaymentController.php`
  - `Api/StripeWebhookController.php`
  - `Admin/AdminRefundController.php`
  - `Admin/AdminBookingCompletionController.php`
- Admin business modules:
  - Programs, Class sessions, Attendance
  - Bookings + BookingAdmin actions
  - Tutors, Participants, Employers
  - Payments, Vouchers, Finance reporting
  - CMS homepage/testimonials
  - Users

Primary route source:
- `apps/admin-laravel/routes/api.php`

---

## 16) Authentication - Detailed Flow

### Admin login flow
1. Frontend page `/admin/login` posts credentials via `adminApi.login(...)`.
2. Backend `AdminAuthController@login` validates + checks access.
3. Backend issues Sanctum token and sets:
   - `admin_token` (HttpOnly, secure cookie)
   - `admin_session` (non-HttpOnly flag cookie for frontend middleware/UI checks)
4. Admin requests to protected API use Sanctum with token from cookie bridge.

Files:
- `apps/web/app/admin/login/page.tsx`
- `apps/web/lib/admin-api.ts`
- `apps/admin-laravel/app/Http/Controllers/Api/AdminAuthController.php`
- `apps/admin-laravel/app/Http/Middleware/SanctumTokenFromCookie.php`

### Admin authorization enforcement
- API access gate:
  - `apps/admin-laravel/app/Http/Middleware/EnsureAdminAccess.php`
- User-level role/module helpers:
  - `apps/admin-laravel/app/Models/User.php`

### Participant login flow (current active path family)
1. Frontend `/participant/login` calls participant API login client.
2. Backend validates participant user and sets participant auth cookies.
3. Protected participant endpoints are under `auth:sanctum` in `/api/participant/*`.

Files:
- `apps/web/app/participant/login/page.tsx`
- `apps/web/lib/participant-api.ts`
- `apps/admin-laravel/app/Http/Controllers/Api/ParticipantAuthController.php`

---

## 17) Users, Roles, and Accounts

### Current user model
- Main auth model: `apps/admin-laravel/app/Models/User.php`
- Key identity fields:
  - `role`
  - `admin_role`
  - `module_access`
  - `is_active`
- Relationships:
  - `participants()`
  - `tutor()`
  - `userModules()`
  - `auditLogs()`

### Role families in current code
- `admin`
- `participant`
- `tutor` (trainer)

### Admin bootstrap accounts (seeded/documented)
- `admin@niatmurniacademy.com`
- `admin@niatmurni.my` (legacy)

References:
- `apps/admin-laravel/database/seeders/AdminUserSeeder.php`
- `apps/admin-laravel/routes/console.php`
- `apps/admin-laravel/README.md`

### Registered user list
- Full live registered accounts are runtime database state (not stored in git).
- To audit current users, query DB directly (e.g. `users`, `participants`, `tutors`).

---

## 18) Database Setup and Schema Baseline

### Connection strategy
- Config file: `apps/admin-laravel/config/database.php`
- Supported:
  - SQLite (local default in `.env.example`)
  - PostgreSQL (`pgsql`) for production
- PostgreSQL defaults:
  - db: `niatmurni`
  - port: `5432`
  - `sslmode` configurable (`DB_SSLMODE`)

### Local `.env.example` baseline
- `DB_CONNECTION=sqlite`
- `DB_DATABASE=database/database.sqlite`
- Optional production-style PostgreSQL examples included in comments.

File:
- `apps/admin-laravel/.env.example`

### Core schema domains (from migrations)
- Identity/auth: users, password reset tokens, personal access tokens, sessions
- Organization: employers, tutors, participants
- Learning ops: programs, class sessions, bookings, attendance records
- Commerce: reservations, payments, vouchers, tutor earnings
- Certificates: certificate templates, certificates, verification linkage
- CMS/settings: settings tables, site navigation, homepage sections, homepage settings
- Platform ops: cache, system health, user modules, audit-related entities

Migration directory:
- `apps/admin-laravel/database/migrations`

### Expected setup sequence (new environment)
1. Configure DB/env values.
2. Run migrations: `php artisan migrate`
3. Seed admin users if needed: `php artisan db:seed`
4. Ensure admin account command if required: `php artisan admin:ensure-admin`

---

## 19) Functional Logic Baseline (Core Flows)

This section describes active business logic paths in current code.

### A) Reservation and booking creation logic

Primary entrypoint:
- `POST /api/reservations`
- Controller: `apps/admin-laravel/app/Http/Controllers/Api/ReservationController.php`

Current logic:
1. Validates checkout payload (`class_session_id`, `seat_count`, participant identity/contact, delivery fields).
2. Resolves participant by `identity_no` (`nric_passport`) using `firstOrCreate`, then updates profile fields.
3. Calls `ReservationService::reserveSeats(...)`.
4. Creates/gets a booking via `firstOrCreate(['reservation_id' => ...])` with pending payment defaults.
5. Returns:
   - `reservation_id`
   - `booking_id`
   - `total_amount`
   - `expires_at`

Service behavior:
- `apps/admin-laravel/app/Services/ReservationService.php`
- Capacity protection:
  - checks existing booked seats (non-cancelled)
  - checks active unexpired reservations
  - blocks over-capacity reservation
- Seat policy:
  - min 1, max 3 seats per reservation
- Reservation snapshot:
  - stores full checkout snapshot (`full_name`, `identity_no`, phone/email, company, delivery fields, calculated totals)
- Reservation expiry:
  - active reservation expires in 24 hours
- Conversion to booking:
  - `convertReservationToBooking()` requires reserved + unexpired status
  - creates booking and marks reservation as converted state

---

### B) Payment and checkout logic

Primary checkout creation:
- `POST /api/payments/checkout`
- Service: `PaymentService::createCheckoutForReservation()`
- File: `apps/admin-laravel/app/Services/PaymentService.php`

Current checkout logic:
1. Logs checkout initiation.
2. Loads reservation and validates:
   - reservation exists
   - status is `reserved`
   - not expired
3. Resolves amount from reservation total (fallback to class session price cents).
4. Creates Stripe checkout session through `StripeService::createCheckoutSessionForAmount(...)`.
5. Passes metadata:
   - `reservation_id`
   - `booking_id` (if pre-created)
   - `program_id`
   - `session_id` / `product_id` (session public id fallback)
6. Returns checkout URL + reservation metadata.

Stripe success handling:
- `PaymentService::handleSuccessfulPayment(...)`
- Idempotency rules:
  - checks existing payment by provider payment id
  - checks existing paid payment on converted booking
- If needed converts reservation to booking.
- Creates payment record (`provider=stripe`, `status=paid`, `paid_at`).
- Marks booking `status=confirmed`.
- Creates tutor earning if payout config exists and no prior earning record.

Stripe failure handling:
- `PaymentService::handleFailedPayment(...)`
- Idempotent no-duplicate failure behavior.
- Cancels reservation if still reserved.

Manual payment approval handling:
- `PaymentService::handleManualPayment(...)`
- Idempotent if already paid.
- Converts reservation to booking (or uses converted booking).
- Updates/creates manual payment as paid.
- Marks booking confirmed.
- Creates tutor earning where applicable.

---

### C) Refund logic

Canonical refund path:
- `PaymentService::handleRefund($bookingId)`
- File: `apps/admin-laravel/app/Services/PaymentService.php`

Flow:
1. Logs refund initiation.
2. DB transaction + lock booking/payment.
3. Finds latest Stripe payment for booking.
4. Idempotent return if payment already refunded (also ensures booking status refunded).
5. Calls Stripe refund via `StripeService::refund($booking)`.
6. Updates:
   - payment status -> `refunded`
   - refund timestamps/amount
   - booking status -> `refunded`
   - tutor earnings for booking -> `cancelled`
7. Logs success/failure.

Legacy adapter:
- `RefundService::refundBooking()` now delegates to `PaymentService::handleRefund()`.
- File: `apps/admin-laravel/app/Services/RefundService.php`

---

### D) Certificate issuance, reissue, and verification logic

Lifecycle service:
- `apps/admin-laravel/app/Services/CertificateLifecycleService.php`

Eligibility logic:
- `isEligibleForCertificate(Booking $booking)` checks system settings:
  - `require_attendance`
  - `require_exam_pass`
- Booking must satisfy configured attendance/exam requirements.

Issue logic:
- `issueCertificateForBooking($bookingId)`:
  - validates eligibility
  - prevents duplicate active certificate
  - attaches active certificate template snapshot if available
  - issues via `CertificateService`

Reissue logic:
- `reissueCertificate($certificate)`:
  - revokes current cert
  - issues a new certificate record/token
  - keeps historical audit trail

Revoke logic:
- `revokeCertificate($certificate)`:
  - marks certificate `revoked` with timestamp

Verification/download endpoints:
- Verify:
  - `/api/certificate/verify/{token}`
  - plus web verify paths under Laravel web routes for public verification pages
- Download:
  - `/api/certificate/download/{token}`

---

### E) Admin module access logic

API access:
- Protected admin API requires:
  - `auth:sanctum`
  - `EnsureAdminAccess`
  - optional `module:*` middleware by route group

User model helpers:
- `apps/admin-laravel/app/Models/User.php`
- `canAccessAdmin()`, `hasModuleAccess()`, `resolvedModules()`
- Current code comments indicate temporary broad allow for active users while RBAC finalization is pending.

UI filtering:
- `apps/web/components/admin/AdminTwoTierHeader.tsx`
- Filters visible nav items based on user module access + admin role.



