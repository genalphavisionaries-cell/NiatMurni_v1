# core-go (Go Core API + Worker)

This service owns Postgres and all business state (single source of truth).

## Run locally

1. **Start infra** (Postgres + Redis):
   ```bash
   docker compose -f ../../infra/docker-compose.yml up -d
   ```
2. **Set env** (required: `DB_DSN`, `REDIS_URL`):
   ```bash
   cp .env.example .env
   # Edit .env if needed; default DSN/Redis point at localhost.
   ```
3. **Run the API** (fails if DB or Redis unreachable):
   ```bash
   go run ./cmd/api
   ```
   Server listens on `:8080`. `GET /healthz` returns `ok`.

## Worker (later)
```bash
go run ./cmd/worker
```

## Key Rules
- Every admin override requires reason (audit logged).
- Stripe webhooks must be idempotent.
- After class start: Move blocked; Transfer creates a new booking.
