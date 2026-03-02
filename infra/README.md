# Local infra

Start Postgres, Redis, and n8n:

```bash
docker compose -f infra/docker-compose.yml up -d
```

- **Postgres:** localhost:5432, user `postgres`, password `postgres`, db `niatmurni`
- **Redis:** localhost:6379
- **n8n:** http://localhost:5678

Go Core API owns schema; use `services/core-go/migrations` for schema changes.
