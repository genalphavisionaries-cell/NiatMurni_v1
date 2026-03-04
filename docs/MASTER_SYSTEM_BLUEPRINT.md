# Niat Murni Platform — Master System Blueprint v2.0

**Source:** NiatMurni_Master_System_Blueprint_v2.pdf  
**Purpose:** Single source of truth and main reference for project development.

---

## 1. System Overview

**Objective:** Build a **compliance-grade KKM Food Handler Training platform** with:

- **Online & physical classes**
- **Identity verification**
- **Attendance enforcement**
- **QR certificate issuance**
- **Corporate booking**
- **Audit logging**
- **Stripe payments**
- **Zoom integration**

---

## 2. Final Architecture

| Layer | Technology | Role |
|-------|------------|------|
| **DNS** | Cloudflare | DNS |
| **App hosting** | Render | Laravel Admin + Go API |
| **Database** | Supabase | PostgreSQL |
| **Payments** | Stripe | Payments & invoicing |
| **Live sessions** | Zoom | Live class sessions |

**Flow:** Cloudflare (DNS) → Render (Laravel Admin + Go API) → Supabase PostgreSQL.

---

## 3. Service Responsibilities

**Strict split:** frontend and automation call **Go** for all business operations. **Laravel** is limited to admin, auth, CMS, and schema.

### Laravel — only these four areas

| Area | Responsibility |
|------|----------------|
| **Admin panel** | Filament UI; manage programs, sessions, participants, employers, bookings, certificates, audit logs. All admin reads/writes go through Go API. |
| **Authentication** | Admin login, sessions, roles (no participant auth). |
| **CMS** | Homepage and marketing content (e.g. homepage settings API consumed by Next.js). |
| **Migrations** | Schema owner; all migrations live in Laravel and are run by Laravel. Go does **not** run migrations. |

Laravel does **not** handle: classes, bookings, payments, registrations, or certificates. Those are implemented in Go.

### Go API — business logic and data

| Area | Responsibility |
|------|----------------|
| **Classes** | List upcoming, get by ID; class session data. |
| **Bookings** | Create, get status; booking lifecycle and state machine. |
| **Payments** | Stripe Checkout session creation, webhooks that transition booking to paid. |
| **Registrations** | Public registration: find-or-create participant, create booking, return payment redirect URL. |
| **Certificates** | Issuance, QR verification, revocation; certificate state. |
| **Attendance** | Rules, recording, eligibility for certification. |
| **API auth** | Token or other auth for non-public Go endpoints. |

**Rule:** Laravel owns schema and migrations only. Go reads/writes the database for all business data (no migrations). Next.js calls **Go** for classes, bookings, registration, and payment flows; Next.js calls **Laravel** only for admin login and CMS (e.g. homepage settings).

---

### 3A. Ideal API responsibilities (platform contract)

**Go API (core platform)** — Next.js and admin read business data from here:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/classes/upcoming` | List upcoming classes (public). |
| GET | `/classes/:id` | Get class by ID. |
| POST | `/bookings` | Create booking (e.g. from registration). |
| GET | `/bookings/:id` | Get booking status. |
| POST | `/payments` | Create payment session (e.g. Stripe Checkout); returns redirect URL. |
| POST | `/certificate/generate` | Generate certificate (admin or post-verification). |

This is the **platform API**. All class, booking, payment, and certificate flows go through Go. (Current Go routes may use `/public/classes/upcoming`; align to `/classes/upcoming` when convenient.)

**Laravel CMS API** — internal admin only (admin panel uses these):

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/homepage-settings` | Read homepage CMS. |
| POST | `/admin/homepage-settings` | Save homepage CMS. |
| GET | `/admin/testimonials` | Read testimonials. |
| POST | `/admin/testimonials` | Save testimonials. |
| GET | `/admin/banners` | Read banners. |
| POST | `/admin/banners` | Save banners. |

Admin panel writes CMS data to Laravel; for business data (classes, bookings, etc.) the admin panel calls the **Go API** (read-only from admin).

---

### 3B. Database ownership (recommended)

**Option A (recommended):** split by domain to avoid migration conflicts.

| Owner | Tables | Notes |
|-------|--------|-------|
| **Go** | `classes`, `class_sessions`, `bookings`, `payments`, `participants`, `programs`, `certificates`, `attendance_records`, `verification_records`, `audit_logs`, etc. | Business tables; Go runs migrations for these (or a shared migration source). |
| **Laravel** | `homepage_settings`, `testimonials`, `banners`, `users`, `sessions`, `cache`, etc. | CMS and admin-only tables; Laravel runs migrations for these. |

This keeps CMS changes in Laravel and business schema in Go (or a single owner per table set), avoiding conflicts. If you keep a single schema owner (Laravel) for now, document that as the current state and Option A as the target.

---

### 3C. Frontend API usage

**Next.js** should call:

- **GO_API_BASE_URL** for: classes, booking, payment, certificate.
  - Example: `GET /classes/upcoming`, `GET /classes/:id`, `POST /bookings`, `GET /bookings/:id`, `POST /payments`, `POST /certificate/generate` (as applicable).
- **Laravel** only for: homepage content, testimonials, banners (CMS).
  - Example: `GET /api/homepage-settings` → Laravel (or `GET /admin/homepage-settings` if behind admin auth and exposed for frontend).

**Admin panel** data flow:

- **Writes CMS data** → Laravel → Postgres (homepage_settings, testimonials, banners).
- **Reads business data** → Go API (e.g. view classes, view bookings).
- Example: “View classes” → call Go API; “Edit homepage” → write Laravel DB.

---

### 3D. Final architecture (recommended)

```
Browser
   │
Next.js (Public Website)
   │
   ├── Go API (core platform)
   │      Classes
   │      Booking
   │      Payments
   │      Certificates
   │
   └── Laravel CMS
   │      Admin Panel (Filament)
   │      Homepage Builder
   │      Testimonials
   │      Branding
   │      Settings
   │
   ▼
Postgres
```

Optional later: **API Gateway** in front of Go and Laravel for a single entry point (Next.js → Gateway → Go / Laravel). Not required for initial launch.

**Admin UI:** Use **Laravel + Filament** for the admin panel (dashboard, tables, forms, uploads, filters, tabs, modern layout). The codebase already uses Filament.

---

## 4. Stripe Module

**Scope:** Checkout Sessions, Payment Links, Invoices, Webhooks, Refunds.

**Webhooks (minimum):**

- `payment_intent.succeeded`
- `invoice.paid`

**Flow:**

1. User registers → **Booking pending**
2. Stripe Checkout (or Payment Link) → payment
3. Webhook confirms payment → **Booking paid**
4. Booking becomes **eligible for verification**

---

## 5. Zoom Module

**Scope:**

- Auto meeting creation (per class)
- Store meeting ID (and join URL)
- Attendance retrieval
- Webhook support (optional)

**Flow:**

1. Admin creates class → **Zoom meeting generated**
2. Meeting ID/link stored and shown to participants
3. **Attendance validated** (join/leave or Zoom report)
4. **Certification eligibility** based on attendance

---

## 6. Database Rule

**Recommended (Option A):** Go owns business tables; Laravel owns CMS tables. See §3B. This prevents migration conflicts (each service migrates only its own tables).

**Current alternative:** Single schema owner (Laravel) for all tables; Go only reads/writes. Acceptable but riskier when both services evolve schema.

- **Supabase** = PostgreSQL only (use connection pooling where applicable).
- If using Option A: Laravel runs migrations only for CMS/admin tables; Go (or a shared migration repo) runs migrations for business tables.

---

## 7. Core Models

| Model | Purpose |
|-------|---------|
| **Users** | Admin / auth (Laravel); may link to employers or participants where needed |
| **Employers** | Corporate accounts; can book for employees |
| **Participants** | Trainees; identity, bookings, verification, certificates |
| **Programs** | Course definition (e.g. KKM Food Handler) |
| **ClassSessions** | Scheduled class instances (date, time, mode, Zoom meeting, etc.) |
| **Bookings** | Participant + class + payment state; links to verification & certificate |
| **VerificationRecords** | Identity verification (e.g. selfie + ID) per booking |
| **AttendanceRecords** | Per-participant attendance per class (from Zoom or manual) |
| **Certificates** | Issued credential; QR verification; revocable |
| **AuditLogs** | Immutable log of admin actions, overrides, revocations |

---

## 8. State Machines

### Booking

`pending` → `reserved` → `paid` → `verified` → `completed` → `certified`

### Class (ClassSession)

`scheduled` → `ongoing` → `completed` → `archived`

### Certificate

`issued` → `revoked`

---

## 9. Deployment

### Laravel (e.g. Render Docker)

- Cache config, routes, views (e.g. `config:cache`, `route:cache`, `view:cache`).
- Run **migrate --force** before starting the app (e.g. in entrypoint before supervisord).
- Stripe & Zoom credentials (and other secrets) in **Render environment variables**, not in repo.

### Go API (e.g. Render)

- On startup: check **DB** and **Redis** connectivity; fail fast if unavailable.
- Then start HTTP server (and workers if any).
- Use same env for Stripe/Zoom/DB/Redis as configured in Render.

---

## 10. Build Phases

| Phase | Focus |
|-------|--------|
| **Phase 1** | Schema (migrations, core tables in Laravel) |
| **Phase 2** | Admin (Filament, roles, auth, basic CRUD) |
| **Phase 3** | API (Go: booking lifecycle, auth, state machines) |
| **Phase 4** | Stripe (Checkout, webhooks, booking paid flow) |
| **Phase 5** | Zoom (meeting creation, attendance retrieval) |
| **Phase 6** | Certificates (issuance, QR, revocation, audit) |
| **Phase 7** | Frontend (public site, participant portal, etc.) |

---

## Quick Reference

- **Laravel:** Admin panel, Authentication, CMS, Migrations (CMS tables only in Option A). No classes, bookings, payments, registrations, or certificates.
- **Go:** Platform API: classes, bookings, payments, certificates (§3A). Option A: Go owns business tables; Laravel owns CMS tables (§3B).
- **Next.js:** GO_API_BASE_URL for classes/booking/payment/certificate; Laravel only for homepage, testimonials, banners (§3C).
- **Admin:** Writes CMS → Laravel DB; reads business data → Go API (§3C, §3D).
- **Stripe:** Checkout and webhooks that set booking to paid → implemented in Go.
- **Zoom:** One meeting per class; attendance feeds certification (Go).
- **State machines:** Booking, Class, Certificate as above.
- **Secrets:** Render env vars; never in repo.
- **API Gateway:** Optional later; not required for launch.

**Migration note:** If Laravel still exposes registration or Stripe webhooks, treat as legacy; move to Go so Laravel keeps only admin, auth, CMS, and migrations. See docs/ARCHITECTURE_SPLIT.md.

Use this document as the main blueprint when implementing or reviewing features.
