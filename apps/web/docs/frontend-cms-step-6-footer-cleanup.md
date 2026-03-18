# Frontend CMS — Step 6: Footer / global cleanup (Next.js)

## Legacy dependencies addressed

| Element | Before | After |
|---------|--------|--------|
| Legal strip | Hardcoded | CMS **`navigation.footer_legal`**; empty → same defaults as before |
| Login buttons (legacy footer) | Hardcoded | CMS **`navigation.footer_login`**; empty → defaults |
| Login + payment (CMS redesign footer) | Missing / hardcoded legal only | Same CMS lists + payment/trust block |
| Payment card visibility | Always on | CMS **`footer.show_payment_card`** (hide when `false`) |
| Payment headline | Fixed copy | CMS **`footer.payment_headline`** + default |
| SSL badge | Homepage settings only | CMS **`footer.ssl_badge_url`** → then **`footerSslBadgeUrl`** → fallback UI |
| SSL caption | Fixed | CMS **`footer.ssl_caption`** + default |

## Types & normalization (`lib/public-cms.ts`)

- **`PublicCmsFooterBlock`**: `show_payment_card`, `payment_headline`, `ssl_badge_url`, `ssl_caption`.
- **`navigation`**: `footer_legal`, `footer_login` (arrays of `PublicCmsNavItem`).
- **`normalizeCmsPayload`**: fills missing nav keys; normalizes `show_payment_card` from bool / `"0"` / `"false"`.

## Merge helper (`lib/merge-public-cms.ts`)

- **`cmsFlatNavToLinks(items)`** — maps flat CMS nav to `NavLink[]` for footer UI.

## Components

- **`Footer.tsx`** (legacy homepage path): receives `cmsGlobal.legalLinks`, `cmsGlobal.loginLinks` when CMS loads; uses `footer.*` for payment/SSL. Grid becomes 3 columns when payment card hidden.
- **`CmsFooter.tsx`**: props `legalLinks`, `loginLinks`, `paymentMethodIcons`, `legacyFooterSslBadgeUrl`; login row + optional payment card + bottom legal + SSL strip.

## **`app/page.tsx`**

- Passes `cmsFlatNavToLinks(cms.navigation.footer_legal|footer_login)` into both footers when CMS is available.

## Still legacy / unchanged

- Quick Links when no CMS footer column tree.  
- Payment SVG URLs via `settings.paymentMethodIcons`.  
- `fetchPublicCms()` failure → full footer fallbacks (no `cmsGlobal` on legacy path).  
- No routing or middleware changes.

## Suggested local commands

```bash
# Laravel — ensure CMS setting rows exist
cd apps/admin-laravel
php artisan db:seed --class=FrontendCmsFoundationSeeder

# Web — verify build
cd apps/web
npm run build
```
