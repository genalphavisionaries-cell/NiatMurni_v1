# Architecture: Laravel vs Go

**Source of truth:** [MASTER_SYSTEM_BLUEPRINT.md](./MASTER_SYSTEM_BLUEPRINT.md) §3 and §3A–3D.

---

## 1. Laravel — only these

| Responsibility | Notes |
|----------------|--------|
| **Admin panel** | Filament UI; homepage builder, testimonials, banners, branding, settings. |
| **Authentication** | Admin login and sessions only (no participant auth). |
| **CMS** | Homepage content, testimonials, banners. Admin panel reads/writes these via Laravel; Next.js reads via Laravel CMS API. |
| **Migrations** | For CMS/admin tables only (Option A). See §6 in blueprint. |

Laravel does **not** implement: classes, bookings, payments, registrations, certificates. Those live in Go.

---

## 2. Go API — platform (business logic)

| Responsibility | Notes |
|----------------|--------|
| **Classes** | List upcoming, get by ID. |
| **Bookings** | Create, get status; state machine. |
| **Payments** | Create payment session (Stripe Checkout), webhooks → booking paid. |
| **Registrations** | Find-or-create participant, create booking, return payment URL (or call POST /bookings + POST /payments). |
| **Certificates** | Generate, QR verification, revocation. |
| **Attendance** | Rules, recording, certification eligibility. |

---

## 3. Ideal API endpoints

**Go (platform API)** — Next.js and admin call these for business data:

- `GET  /classes/upcoming`
- `GET  /classes/:id`
- `POST /bookings`
- `GET  /bookings/:id`
- `POST /payments`
- `POST /certificate/generate`

**Laravel CMS API** — admin panel only (internal):

- `GET  /admin/homepage-settings` · `POST /admin/homepage-settings`
- `GET  /admin/testimonials` · `POST /admin/testimonials`
- `GET  /admin/banners` · `POST /admin/banners`

(Next.js may call a **public** CMS endpoint such as `GET /api/homepage-settings` for homepage content; that is still Laravel.)

---

## 4. Database ownership (Option A recommended)

| Owner   | Tables |
|---------|--------|
| **Go**  | classes, class_sessions, bookings, payments, participants, programs, certificates, attendance_records, verification_records, audit_logs, etc. |
| **Laravel** | homepage_settings, testimonials, banners, users, sessions, cache, etc. |

Prevents migration conflicts: each service owns and migrates only its tables.

---

## 5. Frontend API usage

**Next.js** should call:

- **GO_API_BASE_URL** for: classes, booking, payment, certificate (everything in §3 Go list).
- **Laravel** only for: homepage content, testimonials, banners (e.g. `GET /api/homepage-settings`).

---

## 6. Admin panel data flow

- **Writes CMS data** → Laravel → Postgres (homepage_settings, testimonials, banners).
- **Reads business data** → Go API (view classes, view bookings, etc.).
- Example: *View classes* → call Go API; *Edit homepage* → write Laravel DB.

---

## 7. Security (optional)

Frontend currently calls Go and Laravel directly. Optional later: put an **API Gateway** in front so Next.js talks only to the gateway, and the gateway routes to Go and Laravel.

---

## 8. Final architecture diagram

```
Browser
   │
Next.js (Public Website)
   │
   ├── Go API
   │      Classes · Booking · Payments · Certificates
   │
   └── Laravel CMS
          Admin Panel (Filament)
          Homepage Builder · Testimonials · Branding · Settings
   │
   ▼
Postgres
```

Admin UI: **Laravel + Filament** (already in use) for dashboard, tables, forms, uploads, filters, tabs.

---

## Migration note

If registration or Stripe webhooks are still in Laravel, treat them as legacy. Target: Go exposes POST /bookings and POST /payments (and optionally a combined register flow); Next.js calls Go only for classes, booking, payment, certificate. See `apps/web/lib/api.ts` to switch registration to Go when the Go endpoint is available.
