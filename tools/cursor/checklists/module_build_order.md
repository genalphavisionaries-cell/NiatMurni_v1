# Build Order (Do not skip)

## Phase 1 — Conversion + Paid Booking
1) Core DB schema (Program, ClassSession, Participant, Employer, Booking, AuditLog)
2) Go Core: auth + RBAC skeleton
3) Go Core: class listing endpoints
4) Next.js: public pages + schedule widget
5) Stripe Checkout + webhook -> booking.paid

## Phase 2 — Compliance Core
6) Verification upload + review UI
7) Questionnaire engine + trainer controls
8) Attendance evidence (Zoom join/leave import + checkpoints)

## Phase 3 — Certificates + Tracking
9) Certificate generation + verification page
10) Revocation + audit
11) Shipment workflow + EasyParcel tracking sync

## Phase 4 — Corporate Experience
12) Corporate accounts, roster, bulk registration tools, status export.
13) Employer approval workflow for self-registered employees.

## Phase 5 — Operational Excellence
14) Module 4 dashboards + KPIs + hardening.
