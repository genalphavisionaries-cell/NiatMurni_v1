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

