# core-go (Go Core API + Worker)

This service owns Postgres and all business state (single source of truth).

## Run (local)
```bash
cp .env.example .env
go run ./cmd/api
```

## Worker (later)
```bash
go run ./cmd/worker
```

## Key Rules
- Every admin override requires reason (audit logged).
- Stripe webhooks must be idempotent.
- After class start: Move blocked; Transfer creates a new booking.
