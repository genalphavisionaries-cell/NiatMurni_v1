# PR Checklist
- [ ] Business logic lives in core-go (not Next/Laravel)
- [ ] OpenAPI updated (if endpoints changed)
- [ ] Events updated (if new events)
- [ ] Idempotency ensured for webhooks/handlers
- [ ] Audit logs written for admin overrides
- [ ] Tests added (happy path + 2 edge cases)
