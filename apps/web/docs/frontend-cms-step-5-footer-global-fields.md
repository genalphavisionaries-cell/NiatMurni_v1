# Frontend CMS — Step 5: Footer & global fields (Next.js)

## What was still legacy / hardcoded (before Step 5)

| Location | Before |
|----------|--------|
| **CmsFooter** | Footer intro: legacy `homepage-settings.footerDescription` or hardcoded Malay default. Bottom line: legacy `footerBottom` or `© YEAR name`. “Berdaftar di Malaysia” hardcoded when using fallback intro. |
| **Footer** (legacy homepage layout) | Intro from `footerDescription`; bottom strip hardcoded `© 2026 …`; same Malay line. No CMS contact/social. |
| **ContactSection** | Hardcoded `info@niatmurniacademy.com`. |

## After Step 5

### CMS payload (`GET /api/public/cms`)

- **`footer.description`** → footer intro (textarea in admin).
- **`footer.bottom_text`** → copyright / bottom line (supports line breaks).
- **`contact.email` / `phone` / `address`** → footer contact block + homepage contact section (email/phone).
- **`social.*_url`** → footer text links (Facebook, Instagram, LinkedIn).

Types: `PublicCmsFooterBlock`, `PublicCmsContactBlock`, `PublicCmsSocialBlock` in `lib/public-cms.ts`. Missing API fields are normalised to empty strings.

### Components

| Component | Behaviour |
|-----------|-----------|
| **CmsFooter** | Uses CMS `footer` / `contact` / `social` first. Fallback intro → legacy `footerDescription` → default Malay paragraph. Fallback bottom → legacy `footerBottom` → `© YEAR siteName`. “Berdaftar di Malaysia” only when intro is **not** from CMS. |
| **Footer** | When `cmsGlobal` is passed (CMS fetch OK), same priority for intro + bottom; contact + social in brand column. |
| **ContactSection** | When rendered from CMS homepage (`contact` section key), uses `cms.contact.email` / `phone`; email falls back to `info@niatmurniacademy.com` if blank. |

### `app/page.tsx`

- CMS redesign path: `CmsFooter` receives `cms.footer`, `cms.contact`, `cms.social` plus legacy fallbacks.
- Legacy hero path: `Footer` gets `cmsGlobal={…}` when CMS is available so footer text/contact/social still CMS-driven without requiring homepage section keys.

## Remaining legacy / hardcoded

- **Legal links** (Privacy, Terms, Refund): still fixed paths in footer components.
- **Payment icons, login links, SSL badge** (legacy `Footer` only): still from homepage-settings / hardcoded layout.
- **Default intro paragraph** when CMS + legacy description both empty (CmsFooter).
- **Default contact email** in ContactSection when CMS email empty.
- **Site name** in default copyright line when `footer.bottom_text` empty.

## Local commands

```bash
# Laravel — seed new setting keys (once per env)
cd apps/admin-laravel
php artisan db:seed --class=Database\\Seeders\\FrontendCmsFoundationSeeder

# Next.js
cd apps/web
npm run build
```

## Suggested next steps

- Optional CMS fields for legal link URLs or labels.
- Dedicated footer logo URL in CMS (currently uses main `logo_url`).
- Wire payment/login blocks to CMS only if product needs it.
