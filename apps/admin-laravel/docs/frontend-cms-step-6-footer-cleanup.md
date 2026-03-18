# Frontend CMS — Step 6: Footer / global cleanup

## 1. Legacy dependencies (before Step 6)

User-facing footer/global pieces that were **not** CMS-managed:

| Area | Behavior |
|------|----------|
| **Legal links** (Privacy, Terms, Refund) | Hardcoded in `Footer.tsx` / `CmsFooter.tsx` |
| **Login links** (participant / corporate / tutor) | Hardcoded in legacy `Footer.tsx`; absent from CMS redesign footer |
| **Payment row** | Always shown; headline fixed (“Guaranteed Safe…”); Stripe line fixed |
| **SSL / trust** | Badge URL from **legacy** `homepage-settings` (`footerSslBadgeUrl`); caption fixed |
| **Quick Links** (legacy path) | Still fallback when CMS footer nav empty — unchanged in Step 6 |

## 2. New CMS controls (minimal)

### Navigation (Site navigation items)

| Location | Purpose |
|----------|---------|
| **Footer — legal** (`footer_legal`) | Flat list: legal strip links (order = sort order) |
| **Footer — login** (`footer_login`) | Flat list: login portal buttons |

Top-level only; `parent_id` is ignored for these locations.

### Settings (`Manage Frontend CMS Settings` → **Footer payment & trust**)

| Setting key | Purpose |
|-------------|---------|
| `cms_footer_show_payment_card` | `0` = hide white payment card; empty/other = show |
| `cms_footer_payment_headline` | Headline above payment icons (fallback if empty) |
| `cms_footer_ssl_badge_url` | Image URL for SSL/trust badge |
| `cms_footer_ssl_caption` | Text under badge (fallback if empty) |

Payment **method icons** are still from legacy homepage settings (`paymentMethodIcons`) — not duplicated in CMS.

## 3. Admin: how to manage

1. **Legal / login links**  
   **CMS → Site navigation items** → create items with location **Footer — legal** or **Footer — login**.  
   Set label + URL; order via sort order.

2. **Payment card & SSL**  
   **CMS → Frontend CMS settings** (Filament) → section **Footer payment & trust**.

3. **Seeder**  
   New keys are created by `FrontendCmsFoundationSeeder` (runs `firstOrCreate` per key in `FrontendCmsSettingKeys::all()`).

## 4. Public API changes (`GET /api/public/cms`)

- **`footer`** now includes:  
  `show_payment_card` (boolean), `payment_headline`, `ssl_badge_url`, `ssl_caption` (plus existing `description`, `bottom_text`).
- **`navigation.footer_legal`**, **`navigation.footer_login`**: arrays of nav nodes (same shape as header items: `id`, `label`, `url`, `open_in_new_tab`, `is_button`, `children: []`).

## 5. Fallback behavior (Next.js)

- Empty **footer_legal** → default Privacy / Terms / Refund links.  
- Empty **footer_login** → default three login buttons.  
- **Show payment card**: hidden only when API sends `show_payment_card: false`.  
- **Headline / SSL caption**: CMS value, else hardcoded defaults.  
- **SSL badge URL**: CMS value, else legacy `footerSslBadgeUrl` from homepage settings, else positiveSSL-style fallback block (unchanged).

## 6. What remains legacy

- **Quick Links** column when CMS footer nav tree is empty.  
- **Payment icon URLs** per method (VISA, etc.) from homepage settings.  
- **Footer logo**, **footer columns** (non-CMS tree), **Berdaftar di Malaysia** line when intro not from CMS — unchanged.  
- **`GET /api/homepage-settings`** still used for merges and icon paths.

## Related files (Laravel)

- `app/Http/Controllers/Api/PublicCmsController.php`
- `app/Support/FrontendCmsSettingKeys.php`
- `app/Filament/Pages/ManageFrontendCmsSettings.php`
- `app/Filament/Resources/SiteNavigationItemResource.php`
- `app/Models/SiteNavigationItem.php` (`LOCATION_FOOTER_LEGAL`, `LOCATION_FOOTER_LOGIN`)
