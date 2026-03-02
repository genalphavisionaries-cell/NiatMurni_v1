# Overview

## Big Picture
This platform is a **compliance-grade certification factory**:
- Public discovery -> booking -> payment
- Pre-class identity verification (selfie + ID)
- Attendance evidence + periodic checkpoints (questionnaires)
- Trainer compliance confirmation + admin completion push
- Certificate issuance (QR + public verification)
- Optional physical certificate postage tracking

## Modules (Frozen)
- Module 1: Public Website & Discovery
- Module 2: Booking, Identity, Compliance Core
- Module 3: Class Lifecycle & Trainer Assignment
- Module 4+: Ops/Finance analytics, reporting, payouts, detailed KKM exports (later)

## Ownership
- Go Core owns business truth + Postgres.
- Next.js and Laravel are clients of Go APIs.
- n8n/WhatsApp is orchestration only.

See also:
- `docs/01_modules_1-3_spec.md`
- `contracts/api/openapi.yaml`
- `contracts/events/event_catalog.md`
