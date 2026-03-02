You are working inside the repository `niat-murni-platform`.

Before coding:
1) Read `tools/cursor/rules.md`
2) Read `docs/00_overview.md` and `docs/01_modules_1-3_spec.md`
3) Check `contracts/api/openapi.yaml` and `contracts/events/event_catalog.md`

Non-negotiable:
- Implement business logic in `services/core-go` only.
- Next.js and Laravel are clients of Go APIs.
- Webhooks must be idempotent.
- Admin overrides always require reason + audit log.

Start Phase 1 build order in `tools/cursor/checklists/module_build_order.md`.
