# Frontend CMS — Step 1: Structured data foundation

This document describes the foundation for the public website CMS (homepage + global chrome). **Step 1 does not** change the live Next.js homepage, Filament CRUD, or API responses for the current `HomepageSetting` payload.

---

## 1. Current CMS / homepage state (before redesign wiring)

| Piece | Role |
|-------|------|
| **`homepage_settings` table** | Singleton row (`HomepageSetting` model). JSON-ish columns: `header_nav`, `footer_columns`, `hero`, `main_banners`, `why_choose`, `social_proof`, `site_name`, `logo_url`, etc. |
| **`GET /api/homepage-settings`** | `HomepageSettingsController` reads `HomepageSetting::singleton()`, resolves storage paths to URLs, returns camelCase JSON for the Next.js site. **Unchanged by Step 1.** |
| **`settings` table** | `Setting` model. Key/value text. Used for operational flags (`require_attendance`, `require_exam_pass`, `auto_issue_certificate`, …). |
| **`system_settings` table** | `SystemSetting` + `SettingsService` for typed/encrypted integration settings (Stripe, Zoom, etc.). **Not used** for this CMS feature. |
| **Filament** | Admin homepage/CMS editing (if any) targets the legacy `HomepageSetting` shape. **Step 1 adds no new Filament pages.** |

---

## 2. Chosen schema (Step 1)

### A–C. Global identity, theme, SEO → `settings` table

Stored as **string values** in `settings.key` / `settings.value`. Keys are defined in `App\Support\FrontendCmsSettingKeys` and seeded empty by `FrontendCmsFoundationSeeder`.

| Logical area | Storage key | Purpose |
|--------------|-------------|---------|
| **Site identity** | `cms_site_name` | Site name |
| | `cms_site_tagline` | Tagline (nullable in practice: empty string) |
| | `cms_logo_url` | Logo URL (e.g. Cloudinary) |
| | `cms_favicon_url` | Favicon URL |
| | `cms_primary_cta_label` | Header CTA label |
| | `cms_primary_cta_url` | Header CTA URL |
| **Theme** | `cms_theme_primary_color` | Primary brand color (hex/CSS) |
| | `cms_theme_secondary_color` | Secondary |
| | `cms_theme_accent_color` | Accent |
| | `cms_theme_background_color` | Page background |
| | `cms_theme_text_color` | Body text |
| | `cms_theme_header_background_color` | Header bar |
| | `cms_theme_footer_background_color` | Footer bar |
| **SEO** | `cms_seo_homepage_title` | Homepage `<title>` |
| | `cms_seo_homepage_description` | Homepage meta description |
| | `cms_seo_homepage_og_image_url` | Homepage OG image URL |
| | `cms_seo_default_title` | Fallback title sitewide |
| | `cms_seo_default_description` | Fallback meta description |

**Image URLs:** Intended to be full URLs (e.g. Cloudinary). No Laravel file uploads for these CMS fields in Step 1.

### D. Navigation → `site_navigation_items` table

| Column | Notes |
|--------|--------|
| `label` | Display text |
| `url` | Nullable (e.g. parent-only dropdown header) |
| `location` | `header` or `footer` (`SiteNavigationItem::LOCATION_*`) |
| `parent_id` | Self-FK for submenu |
| `sort_order` | Display order |
| `is_active` | |
| `open_in_new_tab` | |
| `is_button` | e.g. header CTA styling later |

**Model:** `App\Models\SiteNavigationItem` (`parent()`, `children()`).

### E. Homepage sections → `homepage_sections` table

| Column | Notes |
|--------|--------|
| `section_key` | Unique stable key (e.g. `hero`, `programs_strip`) |
| `name` | Admin-facing label |
| `is_active`, `sort_order` | |
| `title`, `subtitle`, `description` | |
| `image_url` | Cloudinary/full URL |
| Primary/secondary button label + URL | |
| `extra_data` | JSON for future flexible fields |

**Model:** `App\Models\HomepageSection`.

---

## 3. Files added / touched (Step 1)

- `app/Support/FrontendCmsSettingKeys.php` — key constants + `all()` labels
- `database/migrations/2026_03_31_120000_create_site_navigation_items_table.php`
- `database/migrations/2026_03_31_120001_create_homepage_sections_table.php`
- `app/Models/SiteNavigationItem.php`
- `app/Models/HomepageSection.php`
- `database/seeders/FrontendCmsFoundationSeeder.php`
- `docs/frontend-cms-step-1-foundation.md` (this file)

---

## 4. Backward compatibility

- Existing **`HomepageSetting`** and **`GET /api/homepage-settings`** behaviour is **unchanged**.
- New `settings` keys are additive (empty until seeder runs and admin fills values).
- New tables start **empty**; no data migration from `homepage_settings` in Step 1.

---

## 5. Commands (local)

```bash
cd apps/admin-laravel
php artisan migrate
php artisan db:seed --class=FrontendCmsFoundationSeeder
```

---

## 6. Next steps (later)

- Filament CRUD for `Setting` CMS keys (or grouped form), `SiteNavigationItem`, `HomepageSection`.
- Public API endpoint (or extend homepage-settings) merging legacy singleton + new CMS for Next.js.
- Next.js homepage redesign consuming structured data + theme/SEO.
