# Safe Cleanup Preparation Plan

## 1. Summary

This document identifies potentially unnecessary, duplicated, conflicting, legacy, or risky parts of the system **without deleting or modifying code**.

Key themes found:
- Go runtime still exists in `services/core-go`, while frontend runtime has moved to Laravel public APIs.
- Next `/admin` shell and Laravel Filament both operate in overlapping `/admin` URL space.
- Stripe and settings logic have duplicate/conflicting implementations.
- Several Next admin pages are placeholders/bridge pages and should be reviewed before long-term retention.
- Some public/admin API routes expose high-risk behavior and should be secured/disabled first (not deleted).

---

## 2. Go-Related Items

| Item | File Path(s) | Status | Classification | Risk | Reason |
|---|---|---|---|---|---|
| Active frontend class/booking API client (Laravel public API now) | `apps/web/lib/api.ts`, `apps/web-next/lib/api.ts` | Used | MUST KEEP | Low | Current runtime clients for homepage/classes/booking flows. |
| Laravel replacements for former Go public endpoints | `apps/admin-laravel/routes/api.php`, `apps/admin-laravel/app/Http/Controllers/Api/PublicController.php` | Used | MUST KEEP | Medium | New source of truth for frontend public flows. |
| Go service routes and handlers for classes/bookings | `services/core-go/internal/server/server.go`, `services/core-go/internal/handlers/classes.go`, `services/core-go/internal/handlers/bookings.go`, `services/core-go/internal/repository/class.go` | Legacy runtime present | SHOULD DISABLE FIRST | Medium | Still valid code/service, but no active frontend call chain found after Laravel migration. Disable traffic first, then delete if no dependencies. |
| Go env vars in examples | `apps/web/.env.example`, `apps/web-next/.env.example`, `apps/admin-laravel/.env.example`, `services/core-go/.env.example` | Legacy config | SAFE TO DELETE (later) | Low | `NEXT_PUBLIC_GO_API_URL` and `GO_API_BASE_URL` appear as legacy examples; not read in active frontend path. |
| Go endpoint contract docs | `contracts/api/openapi.yaml`, `docs/ARCHITECTURE_SPLIT.md`, `docs/MASTER_SYSTEM_BLUEPRINT.md`, `docs/DEPLOYMENT_OVERVIEW.md`, `apps/admin-laravel/README.md` | Legacy docs | UNKNOWN / NEED REVIEW | Low | Might still be required as historical architecture docs. Review before removal. |

### Safe Action
- **Now:** keep Laravel public API path as active path; block or de-route Go traffic at gateway/environment (disable-first).
- **Later:** after logs confirm no Go calls for 1-2 release cycles, remove Go env vars and optionally archive/remove `services/core-go`.

---

## 3. Next Admin Placeholders

### 3.1 `/admin/*` routes in `apps/web/app/admin`

| Route | File Path | Type | Classification | Risk | Reason |
|---|---|---|---|---|---|
| `/admin/login` | `apps/web/app/admin/login/page.tsx` | Real UI | MUST KEEP | Medium | Active login path for Next admin shell. |
| `/admin/programs` | `apps/web/app/admin/programs/page.tsx` | Real UI | MUST KEEP | Medium | Uses real admin APIs. |
| `/admin/classes` | `apps/web/app/admin/classes/page.tsx` | Real UI | MUST KEEP | Medium | Uses real admin APIs. |
| `/admin/tutors` | `apps/web/app/admin/tutors/page.tsx` | Real UI | MUST KEEP | Medium | Uses real admin APIs. |
| `/admin/participants` | `apps/web/app/admin/participants/page.tsx` | Real UI | MUST KEEP | Medium | Uses real admin APIs. |
| `/admin/bookings` | `apps/web/app/admin/bookings/page.tsx` | Real UI | MUST KEEP | Medium | Uses real admin APIs. |
| `/admin/cms/homepage` | `apps/web/app/admin/cms/homepage/page.tsx` | Real UI | MUST KEEP | Medium | Writes via Laravel admin CMS endpoint. |
| `/admin` | `apps/web/app/admin/page.tsx` | Mixed/placeholder dashboard | SHOULD DISABLE FIRST | Low | Placeholder fallback behavior noted; keep until admin ownership decision complete. |
| `/admin/payments` | `apps/web/app/admin/payments/page.tsx` | Placeholder | SHOULD DISABLE FIRST | Low | Explicit placeholder text referencing Go API. |
| `/admin/certificates` | `apps/web/app/admin/certificates/page.tsx` | Placeholder | SHOULD DISABLE FIRST | Low | Explicit placeholder text referencing Go API. |
| `/admin/settings/system` | `apps/web/app/admin/settings/system/page.tsx` | Placeholder | SHOULD DISABLE FIRST | Low | Explicit placeholder page. |
| `/admin/cms`, `/admin/cms/testimonials`, `/admin/cms/logos`, `/admin/cms/footer`, `/admin/settings` | `apps/web/app/admin/cms/*`, `apps/web/app/admin/settings/page.tsx` | Hub/placeholder | SHOULD DISABLE FIRST | Low | Either index hub or explicitly incomplete. |
| `/admin/users`, `/admin/settings/users` | `apps/web/app/admin/users/page.tsx`, `apps/web/app/admin/settings/users/page.tsx` | Redirect-only bridge | SHOULD DISABLE FIRST | Medium | Client redirect bridge to Filament; fragile with same-origin route ownership. |

### 3.2 Admin ownership conflict

| Item | File Path(s) | Classification | Risk | Reason |
|---|---|---|---|---|
| Next middleware protects `/admin*` while Filament panel is also at `/admin` | `apps/web/middleware.ts`, `apps/admin-laravel/app/Providers/Filament/AdminPanelProvider.php` | UNKNOWN / NEED REVIEW | High | Dual ownership of `/admin` can cause loops/routing ambiguity by environment. |

### Safe Action
- **Now:** decide one owner for `/admin` per environment (Next shell vs Filament) and feature-flag/route-gate the other.
- **Later:** remove bridge and placeholder pages once ownership is finalized and verified in production routing.

---

## 4. Duplicate Logic

| Item | File Path(s) | Classification | Risk | Reason |
|---|---|---|---|---|
| Duplicate `StripeService` class definitions in same file | `apps/admin-laravel/app/Services/StripeService.php` | SHOULD DISABLE FIRST | High | Two `class StripeService` declarations with different logic in one file is conflicting and unsafe. |
| Multiple Stripe webhook handlers/routes | `apps/admin-laravel/routes/web.php`, `apps/admin-laravel/routes/api.php`, `apps/admin-laravel/app/Http/Controllers/StripeWebhookController.php`, `apps/admin-laravel/app/Http/Controllers/Api/StripeWebhookController.php` | SHOULD DISABLE FIRST | High | Two webhook endpoints/handlers with divergent behavior create drift/duplication risk. |
| Dual settings systems (`settings` and `system_settings`) | `apps/admin-laravel/app/Models/Setting.php`, `apps/admin-laravel/app/Models/SystemSetting.php`, migrations `2026_03_23_130000_create_system_settings_table.php`, `2026_03_26_000000_create_settings_table.php`, `2026_03_27_000000_restructure_settings_for_groups.php` | UNKNOWN / NEED REVIEW | High | Both stores still exist; fallback logic can hide divergence. |
| Two settings services + fallback helper | `apps/admin-laravel/app/Services/SettingService.php`, `apps/admin-laravel/app/Services/SettingsService.php`, `apps/admin-laravel/app/Support/helpers.php` | SHOULD DISABLE FIRST | High | `setting()` reads `settings` then silently falls back to `system_settings`; can mask stale/conflicting values. |
| Public CMS/homepage overlap | `apps/admin-laravel/app/Http/Controllers/Api/PublicCmsController.php`, `apps/admin-laravel/app/Http/Controllers/Api/HomepageSettingsController.php`, `apps/web/lib/public-cms.ts`, `apps/web/lib/homepage-settings.ts`, `apps/web/lib/merge-public-cms.ts` | MUST KEEP (transitional) | Medium | Deliberate compatibility path exists; not safe to remove without frontend contract migration. |

### Safe Action
- **Now:** introduce owner mapping document (single source per domain: payments, webhooks, settings, CMS payloads), then disable non-owner paths behind flags.
- **Later:** delete deprecated duplicates once logs show zero usage and parity tests pass.

---

## 5. Dead Code Candidates

| Item | File Path(s) | Classification | Risk | Reason |
|---|---|---|---|---|
| Hidden hero slider kept only via hidden mount | `apps/web/components/home/hero/HeroLayout.tsx`, `apps/web/components/home/hero/HeroSlider.tsx` | SHOULD DISABLE FIRST | Low | `HeroSlider` rendered inside `className="hidden"` with comment indicating retention to avoid removal surprises. |
| Next admin placeholders with no backend integration | `apps/web/app/admin/payments/page.tsx`, `apps/web/app/admin/certificates/page.tsx`, `apps/web/app/admin/settings/system/page.tsx`, `apps/web/app/admin/cms/testimonials/page.tsx`, `apps/web/app/admin/cms/logos/page.tsx`, `apps/web/app/admin/cms/footer/page.tsx` | SHOULD DISABLE FIRST | Low | Explicit placeholder content or TODO state. |
| Legacy `/verify/{qrToken}` certificate route surface | `apps/admin-laravel/routes/web.php`, `apps/admin-laravel/app/Http/Controllers/CertificateVerifyController.php` | UNKNOWN / NEED REVIEW | Medium | Coexists with `/certificate/verify/{token}` and `/api/certificate/verify/{token}`; potential contract duplication. |
| Go env examples in web apps | `apps/web/.env.example`, `apps/web-next/.env.example` | SAFE TO DELETE (later) | Low | Legacy env keys retained; no active runtime reads detected. |

---

## 6. Risky Routes

| Route | File Path | Classification | Risk | Reason |
|---|---|---|---|---|
| `POST /api/admin/bookings/{bookingId}/refund` | `apps/admin-laravel/routes/api.php` | SHOULD DISABLE FIRST | High | Public mutation route (comment says temporary), no auth guard at route level. |
| `POST /api/admin/bookings/{bookingId}/complete` | `apps/admin-laravel/routes/api.php` | SHOULD DISABLE FIRST | High | Public mutation route without auth middleware. |
| `GET /api/admin/finance/revenue-timeline` | `apps/admin-laravel/routes/api.php` | SHOULD DISABLE FIRST | High | Public finance metrics exposure. |
| `GET /api/admin/finance/refund-timeline` | `apps/admin-laravel/routes/api.php` | SHOULD DISABLE FIRST | High | Public finance metrics exposure. |
| `GET /api/admin/finance/tutor-payout-timeline` | `apps/admin-laravel/routes/api.php` | SHOULD DISABLE FIRST | High | Public finance metrics exposure. |
| `GET /api/public/bookings/{id}` | `apps/admin-laravel/routes/api.php`, `apps/admin-laravel/app/Http/Controllers/Api/PublicController.php` | UNKNOWN / NEED REVIEW | High | Public numeric ID lookup currently returns participant contact fields; needs access pattern hardening. |
| `GET /api/public/classes/{id}` | `apps/admin-laravel/routes/api.php`, `apps/admin-laravel/app/Http/Controllers/Api/PublicController.php` | UNKNOWN / NEED REVIEW | Medium | Returns `zoom_join_url` publicly; likely should be enrollment-gated. |
| `POST /webhooks/stripe` and `POST /api/webhooks/stripe` | `apps/admin-laravel/routes/web.php`, `apps/admin-laravel/routes/api.php` | SHOULD DISABLE FIRST | High | Duplicate webhook ingestion surfaces with different handlers. |

---

## 7. Safe-To-Delete List (After Verification)

These are candidates with lowest coupling, but still remove only after staging verification:

1. Legacy Go env keys in example files:
   - `apps/web/.env.example` (`NEXT_PUBLIC_GO_API_URL`)
   - `apps/web-next/.env.example` (`NEXT_PUBLIC_GO_API_URL`)
   - `apps/admin-laravel/.env.example` (`GO_API_BASE_URL`)
2. Deprecated docs that are no longer part of active architecture (only after docs owner review):
   - `contracts/api/openapi.yaml` (if replaced by Laravel contract docs)

---

## 8. Disable-First List

1. Public admin mutation/finance routes in `apps/admin-laravel/routes/api.php`
2. One of duplicate Stripe webhook entry points
3. Redirect bridge routes in Next admin:
   - `apps/web/app/admin/users/page.tsx`
   - `apps/web/app/admin/settings/users/page.tsx`
4. Placeholder Next admin pages (payments/certificates/system settings/CMS placeholders)
5. Hidden legacy hero slider usage
6. Go service traffic path (disable at routing level before code deletion)

---

## 9. Must-Keep List

1. Active frontend API clients:
   - `apps/web/lib/api.ts`
   - `apps/web-next/lib/api.ts`
2. Laravel public API replacements:
   - `apps/admin-laravel/app/Http/Controllers/Api/PublicController.php`
   - public routes in `apps/admin-laravel/routes/api.php`
3. Active Next admin pages backed by real APIs:
   - login, programs, classes, tutors, participants, bookings, cms/homepage
4. Transitional CMS merge path until formal contract consolidation:
   - `apps/web/lib/public-cms.ts`
   - `apps/web/lib/homepage-settings.ts`
   - `apps/web/lib/merge-public-cms.ts`

---

## 10. Step-by-Step Cleanup Execution Plan

### Phase 0 - Freeze and Baseline (No deletion)
1. Record current route map and traffic logs for:
   - `/api/public/*`
   - `/api/admin/*`
   - `/webhooks/stripe` and `/api/webhooks/stripe`
2. Add temporary observability tags for candidate routes/components.

### Phase 1 - Security First (Disable before delete)
1. Protect or disable public admin mutation/finance routes.
2. Choose a single Stripe webhook endpoint; keep one active, make the other return explicit deprecation response.
3. Review public booking/class detail response exposure (`email/phone`, `zoom_join_url`), then gate or reduce fields.

### Phase 2 - Ownership Consolidation
1. Decide canonical `/admin` owner per environment:
   - Next admin shell, or
   - Laravel Filament
2. Gate non-canonical admin routes with feature flags.
3. Keep bridge pages only while migration is active.

### Phase 3 - Legacy and Placeholder Reduction
1. Disable placeholder Next admin routes from navigation/routing first.
2. Deprecate hidden hero slider and unused visual fallback components after visual regression checks.
3. Disable Go service ingress paths in infrastructure while monitoring for missed callers.

### Phase 4 - Deletion Window
1. After 1-2 release cycles with zero usage:
   - remove Go env example keys
   - remove disabled placeholder routes/components
   - archive or remove Go service code if no dependencies remain
2. Remove duplicate settings/webhook implementations only after parity test checklist passes.

### Verification Checklist Before Any Deletion
1. Homepage, classes, class detail, registration, booking confirmation still pass.
2. Admin login + core CRUD flows still pass.
3. Stripe payment and webhook processing pass end-to-end.
4. No 404/redirect-loop on `/admin` routes in production topology.
5. No external clients depend on deprecated routes (validated by logs).

---

## Classification Legend

- **SAFE TO DELETE**: low coupling and low risk once verified in staging.
- **SHOULD DISABLE FIRST**: can break runtime/security; disable and monitor before deletion.
- **MUST KEEP**: currently used in active runtime paths.
- **UNKNOWN / NEED REVIEW**: insufficient certainty or cross-team dependency likely.
