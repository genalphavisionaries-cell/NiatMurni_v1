# Frontend CMS — Step 7: Public layout consistency

## Shared shell: `PublicSiteShell`

**File:** `components/public/PublicSiteShell.tsx`

Server component that, on each request:

1. Loads **`getHomepageSettings()`** + **`fetchPublicCms()`** (same as homepage).
2. Builds context via **`mergePublicCmsForHome`** → theme CSS variables, header nav, CTA, footer columns.
3. Renders:
   - **`CmsHeader`** (CMS tree or legacy header nav + primary CTA)
   - **`<main>`** with configurable classes (default: `min-h-[60vh] flex-1 bg-stone-50`) wrapping **children**
   - **`CmsFooter`** when CMS API succeeds, else legacy **`Footer`** with homepage settings only

No new API routes or middleware changes.

## Pages using the shared layout

| Route | Notes |
|-------|--------|
| `/booking/[id]` | Booking status; inner page bar + content unchanged |
| `/class/[id]` | Class detail + register CTA |
| `/class/[id]/register` | Registration form; Stripe redirect unchanged |
| `/privacy` | Placeholder policy copy (footer link target) |
| `/terms` | Placeholder terms copy |
| `/refund` | Placeholder refund copy |

Client components under booking/class no longer use a top-level `<main>` (avoid duplicate `<main>`); behavior and links are preserved.

## Pages intentionally unchanged

| Area | Reason |
|------|--------|
| **`/`** (home) | Already has full CMS vs legacy homepage logic |
| **`/admin/**`** | Separate admin shell (`admin/layout.tsx`) |
| **`/participant/**`** | Portal layout + auth flows |
| **`/tutor/**`** | Tutor portal layout |
| **`/admin/login`**, **`/participant/login`** | Focused login UIs, not marketing shell |

## Remaining inconsistency (later)

- Policy pages are static placeholders until CMS-managed legal pages exist.
- Class/booking inner chrome still uses amber accents; could align with `--cms-primary` later.
- Other public URLs (if added) should wrap with **`PublicSiteShell`** the same way.

## Local verification

```bash
cd apps/web
npm run build
```

Smoke-test: open `/class/1`, `/booking/1`, `/privacy` — expect site header/footer matching homepage when CMS is configured.
