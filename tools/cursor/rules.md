# Cursor Rules — Niat Murni Platform

## Non-negotiable boundaries
- Go Core is the only service that writes to Postgres.
- Next.js and Laravel call Go APIs. No direct DB connections.
- n8n triggers messages only; never sets booking/class/cert states.

## Integrity rules
- After class start: "Move" blocked. Only Admin Transfer creates new booking and preserves history.
- Verification resets on Move/Transfer.
- Admin overrides require reason and are fully audited.

## Code style
- Prefer explicit enums for states.
- All externally triggered handlers (Stripe/Zoom/provider) must be idempotent.
- Any new feature must include tests and docs/contract updates.
