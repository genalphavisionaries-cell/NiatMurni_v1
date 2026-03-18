# Frontend CMS — Step 3: Next.js consumption

## Old data flow

- **`getHomepageSettings()`** → `GET {ADMIN_API}/api/homepage-settings` → merges with `defaultHomepageSettings`.
- Used for hero copy (not the hero slider shell), why choose, social proof, footer text/logo, payment icons, etc.

## New data flow

- **`fetchPublicCms()`** → `GET {API_BASE}/api/public/cms`.
- API base: `NEXT_PUBLIC_ADMIN_API_URL` → `NEXT_PUBLIC_LARAVEL_API_URL` → `NEXT_PUBLIC_API_URL` (first defined, same as homepage-settings).
- **`mergePublicCmsForHome(settings, cms)`** combines CMS with legacy settings for the homepage only.

## Files

| File | Role |
|------|------|
| `lib/public-cms.ts` | Types, `fetchPublicCms()`, `cmsString()` helper |
| `lib/merge-public-cms.ts` | `mergePublicCmsForHome()`, `footerColumnsFromCms()` |
| `app/page.tsx` | Parallel fetch, `generateMetadata`, passes merged data to layout pieces |
| `components/home/hero/HeroHeader.tsx` | CMS nav tree or legacy flat nav; CMS primary CTA |
| `components/home/hero/HeroLayout.tsx` | Forwards nav + CTA props |
| `components/home/Footer.tsx` | Optional CMS footer columns + footer background colour |
| `components/home/cms/*` | (Step 4) Controlled section-key renderer + redesigned header/footer |

## What is wired

| Area | Behaviour |
|------|-----------|
| **SEO** | `generateMetadata`: homepage title/description/OG image/favicon from CMS when set; else defaults (`Niat Murni Academy`, KKM description). |
| **Header** | Logo + site name from CMS when `logo_url` / `site_name` set; else legacy API. Nav: if CMS **header** has usable items → tree (desktop + mobile); else legacy `headerNav`. Primary CTA from CMS when both label+URL set; else “Register” → `/#classes`. |
| **Theme** | Non-empty CMS colour fields exposed as CSS variables on homepage wrapper: `--cms-primary`, `--cms-secondary`, `--cms-accent`, `--cms-bg`, `--cms-text`, `--cms-header-bg`, `--cms-footer-bg`. (Visual use in components can come in a later redesign.) |
| **Footer** | If CMS **footer** nav produces columns → replaces hardcoded Quick Links block; else Quick Links unchanged. Footer background from CMS `footer_background_color` when set. |
| **Homepage sections** | Active CMS sections with title/description/image/buttons render in a simple band below existing blocks (no full redesign). |

## Fallback summary

- **CMS fetch fails or env missing:** `cms` is `null` → behaviour matches pre–Step 3 (legacy nav, default CTA, Quick Links, default metadata fields).
- **CMS partial:** Empty CMS strings are ignored; legacy values fill gaps.
- **Empty CMS navigation:** Falls back to `homepage-settings` `headerNav`; footer Quick Links unchanged.

## Commands

```bash
# Laravel
cd apps/admin-laravel && php artisan route:list | findstr public

# Next.js — set API URL
# .env.local: NEXT_PUBLIC_ADMIN_API_URL=https://your-laravel-origin
cd apps/web && npm run dev
```

## Not done yet (redesign)

- Full visual redesign using theme variables.
- Replacing hero slider / booking panel with CMS-driven layout.
- Using `site_tagline` prominently.
