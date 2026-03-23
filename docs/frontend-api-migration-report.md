# Frontend API Migration Report (Go -> Laravel)

## Scope

Frontend API usage was scanned across:
- `apps/web`
- `apps/web-next`

UI/layout/component structure was not changed. Only data source endpoints were updated.

## Step 1-2: API Inventory and Classification

| File | Current Endpoint | Purpose | Classification |
|---|---|---|---|
| `apps/web/lib/api.ts` | `${GO_API_URL}/public/classes/upcoming` | Homepage and class list data (upcoming classes) | Go-based (replaced) |
| `apps/web/lib/api.ts` | `${GO_API_URL}/classes/${id}` | Class detail data | Go-based (replaced) |
| `apps/web/lib/api.ts` | `${GO_API_URL}/bookings/${id}` | Booking confirmation/status data | Go-based (replaced) |
| `apps/web/lib/api.ts` | `${LARAVEL_API_URL}/api/register` | Registration + payment redirect | Laravel-based (kept) |
| `apps/web-next/lib/api.ts` | `${GO_API}/public/classes/upcoming` | Homepage and classes list | Go-based (replaced) |
| `apps/web-next/lib/api.ts` | `${GO_API}/classes/${id}` | Class detail | Go-based (replaced) |
| `apps/web-next/lib/api.ts` | `${GO_API}/bookings/${bookingId}` | Booking confirmation/status | Go-based (replaced) |
| `apps/web-next/lib/api.ts` | `${LARAVEL_API}/api/register` | Registration + payment redirect | Laravel-based (kept) |
| `apps/web/lib/public-cms.ts` | `/api/public/cms` | Public homepage CMS data | Laravel-based (keep) |
| `apps/web/lib/homepage-settings.ts` | `/api/homepage-settings` | Legacy homepage settings payload | Laravel-based (keep) |
| `apps/web/lib/admin-api.ts` | `/api/admin/*` | Admin classes/sessions/bookings/participants/etc | Laravel-based (keep) |
| `apps/web/lib/participant-api.ts` | `/api/participant/*` | Participant auth/profile/certificates | Laravel-based (keep) |

## Step 3: Go -> Laravel Endpoint Mapping

| Go Endpoint | Laravel Target Used in Frontend | Backend Route Status |
|---|---|---|
| `/public/classes/upcoming` | `/api/public/classes/upcoming` | Missing backend API (not found in `apps/admin-laravel/routes/api.php`) |
| `/classes/{id}` | `/api/public/classes/{id}` | Missing backend API (not found in `apps/admin-laravel/routes/api.php`) |
| `/bookings/{id}` | `/api/public/bookings/{id}` | Missing backend API (not found in `apps/admin-laravel/routes/api.php`) |
| (already Laravel) `/api/register` | `/api/register` | Exists (kept) |

## Step 4: Frontend Replacements Implemented

### Updated files
- `apps/web/lib/api.ts`
- `apps/web-next/lib/api.ts`

### Changes applied
- Replaced all Go URL usage (`NEXT_PUBLIC_GO_API_URL`) with Laravel base URL usage.
- Switched endpoint calls to Laravel public API targets:
  - `/api/public/classes/upcoming`
  - `/api/public/classes/{id}`
  - `/api/public/bookings/{id}`
- Kept registration endpoint on Laravel (`/api/register`).
- Added minimal response normalization so existing UI data consumers still receive expected shapes, even if Laravel returns:
  - direct object/list
  - `{ data: ... }`
  - `{ classes: ... }` (for compatibility)

## Step 5: Temporary Fallbacks

When Laravel public endpoints are not ready:
- Class and booking fetchers return safe fallbacks (`[]` or `null`).
- Console warning is emitted with clear marker:
  - `[backend missing] Laravel API ... is unavailable`

No UI structure changes were introduced for fallback behavior.

## Step 6: Flow Verification (Laravel-only source paths)

These flows now call Laravel endpoints only from frontend:
- Homepage upcoming classes:
  - `apps/web/components/home/UpcomingClassesSection.tsx` -> `apps/web/lib/api.ts`
  - `apps/web-next/app/(public)/page.tsx` -> `apps/web-next/lib/api.ts`
- Classes listing:
  - `apps/web/app/participant/page.tsx`
  - `apps/web/app/participant/courses/page.tsx`
  - `apps/web/app/tutor/classes/page.tsx`
  - `apps/web/app/admin/page.tsx`
- Class detail:
  - `apps/web/app/class/[id]/ClassDetailClient.tsx`
  - `apps/web-next/app/(public)/classes/[id]/page.tsx`
- Registration:
  - `apps/web/app/class/[id]/register/RegisterClient.tsx` -> `/api/register`
  - `apps/web-next/app/(public)/classes/[id]/register/page.tsx` -> `/api/register`
- Booking confirmation:
  - `apps/web/app/booking/[id]/BookingClient.tsx`
  - `apps/web-next/app/(public)/my-booking/page.tsx`

## Missing Backend APIs

- `GET /api/public/classes/upcoming`
- `GET /api/public/classes/{id}`
- `GET /api/public/bookings/{id}`

## Risks

- Public class and booking pages will show empty/not found states until missing Laravel endpoints are implemented.
- If Laravel response contracts differ substantially from current assumptions, additional adapter logic may be needed.
- Admin endpoints exist for class sessions/bookings, but they are auth-protected and not suitable as public-flow replacements.
