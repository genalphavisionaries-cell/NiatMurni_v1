# n8n

Event-driven automation: WhatsApp, email, reminders. Core API publishes events; n8n consumes via webhook and sends messages only (no business state changes).

- **Webhook URL (local):** `http://localhost:5678/webhook/niatmurni/events`
- **Event catalog:** `contracts/events/event_catalog.md`

## Workflows

Export workflows here as JSON (exclude secrets). Use `workflows/` for versioned flow definitions.
