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

### Laravel (Admin)

- Admin authentication & roles
- **Schema owner** — owns and runs migrations
- Filament admin UI
- Stripe webhook handling
- Zoom admin control

### Go API

- Booking lifecycle
- Attendance rules
- Certification logic
- State machine enforcement
- API authentication

**Rule:** Laravel owns schema and migrations. Go reads/writes the database only (no migrations).

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

- **Laravel** = schema owner; all migrations live in Laravel and are run by Laravel (e.g. `php artisan migrate --force` in Docker).
- **Go API** = reads and writes the database only; does **not** run or own migrations.
- **Supabase** = PostgreSQL only (use connection pooling where applicable).

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

- **Schema owner:** Laravel only.
- **Go:** No migrations; only reads/writes DB.
- **Stripe:** Webhook-driven transition to **Booking paid** → then verification eligible.
- **Zoom:** One meeting per class; attendance feeds certification.
- **State machines:** Booking, Class, Certificate as above.
- **Secrets:** Render env vars; never in repo.

Use this document as the main blueprint when implementing or reviewing features.
