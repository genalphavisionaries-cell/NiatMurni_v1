# Niat Murni — KKM Food Handling Course Platform (Monorepo)

**Purpose:** Automation-first platform to sell, register, conduct and certify KKM Food Handling training (online + physical), with compliance-grade identity, attendance and certificate verification.

**Prepared:** 2026-03-02

## Golden Rules (Non‑Negotiable)
1. **Go Core is the source of truth** for business state (identity, bookings, classes, verification, attendance, questionnaires, certificates, shipments, audit logs).
2. **Next.js and Laravel never write to Postgres directly for business data.** They call Go APIs for classes, bookings, payments, registrations, certificates. Laravel only writes to Postgres for schema (migrations) and admin auth/sessions.
3. **Laravel handles only:** Admin panel, Authentication (admin), CMS, Migrations. **Go handles:** Classes, Bookings, Payments, Registrations, Certificates (and attendance, state machines).
4. **n8n / WhatsApp automations never decide eligibility or mutate business truth.** They only send messages and report delivery outcomes.
5. **Every admin override requires:** who + when + reason (audit logged).
6. **After class start:** “Move” is blocked. Only **Admin Transfer** creates a new booking (preserves history). Verification resets on move/transfer.

## Repo Layout
- `apps/web-next` — public site + participant portal + trainer portal (Next.js)
- `apps/admin-laravel` — internal Ops/Finance admin (Laravel + Filament) calling Go APIs
- `services/core-go` — core API + worker (Go), owns Postgres and all business truth
- `services/n8n` — workflow definitions and README (n8n runs via Docker)
- `contracts/` — OpenAPI + event catalog + enums (authoritative contracts)
- `docs/` — specs and planning docs (Modules 1–3 frozen here)
- `infra/` — local dev stack (Postgres, Redis, n8n)

## Build Order
See: `tools/cursor/checklists/module_build_order.md`

## Getting Started (Local Dev)
1. Start infra:
   - `docker compose -f infra/docker-compose.yml up -d`
2. Start Go API:
   - `cd services/core-go && cp .env.example .env`
   - `go run ./cmd/api`
3. Start Next.js:
   - `cd apps/web-next && cp .env.example .env.local`
   - `npm install && npm run dev`

> Laravel admin can be added after Go + Web are running.

## Cursor / AI
Start with: `tools/cursor/prompts/00_system_prompt.md`
