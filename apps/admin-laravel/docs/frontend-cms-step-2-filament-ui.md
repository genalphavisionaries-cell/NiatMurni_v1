# Frontend CMS — Step 2: Filament admin UI

Admin UI for managing structured public-site CMS data. **The Next.js public site is not wired to this data yet** — the live homepage still uses `GET /api/homepage-settings` and `HomepageSetting`.

---

## 1. What was added

| Item | Location | Purpose |
|------|----------|---------|
| **Website settings** (page) | Filament → **CMS** → *Website settings* | Global identity, theme colours, SEO strings in `settings` table |
| **Navigation** (resource) | Filament → **CMS** → *Navigation* | `site_navigation_items` rows (header/footer, submenus) |
| **Homepage sections** (resource) | Filament → **CMS** → *Homepage sections* | `homepage_sections` rows |

Navigation group **CMS** (sort order: Website settings → Navigation → Homepage sections).

---

## 2. Website settings page

**Class:** `App\Filament\Pages\ManageFrontendCmsSettings`  
**View:** `resources/views/filament/pages/manage-frontend-cms-settings.blade.php`

Reads/writes the `settings` table using keys from `App\Support\FrontendCmsSettingKeys`:

- **Site identity:** `cms_site_name`, `cms_site_tagline`, `cms_logo_url`, `cms_favicon_url`, `cms_primary_cta_label`, `cms_primary_cta_url`
- **Theme:** `cms_theme_primary_color`, … (7 colour fields via Filament ColorPicker; stored as hex strings)
- **SEO:** `cms_seo_homepage_title`, `cms_seo_homepage_description`, `cms_seo_homepage_og_image_url`, `cms_seo_default_title`, `cms_seo_default_description`

Image-related fields use **URL text inputs** only (no uploads). Helper text reminds admins to use full URLs (e.g. Cloudinary).

Save uses **Save settings** in the page header (same pattern as System Settings).

---

## 3. Navigation resource

**Class:** `App\Filament\Resources\SiteNavigationItemResource`

- **Location:** Header vs footer (required).
- **Submenu under:** Optional parent — only **top-level** items in the **same** location are listed. One level of nesting only.
- **Sort order**, **Active**, **Open in new tab**, **Style as button**.

**Business rules** (enforced on `SiteNavigationItem` model `saving`):

- `location` must be `header` or `footer`.
- If `parent_id` is set: parent must exist, same `location`, and parent must be top-level (`parent_id` null). Cannot parent self.

List table: sort order, label, location badge, parent label, URL preview, active/button flags. Default query orders by location, then top-level before children, then `sort_order`.

---

## 4. Homepage sections resource

**Class:** `App\Filament\Resources\HomepageSectionResource`

- **Section key:** Unique, immutable after create (regex: starts with letter/number, then `a-z`, `0-9`, `_`, `-`).
- **Admin name**, **active**, **sort order**.
- **Content:** title, subtitle, description, **image URL** (text, no upload).
- **Primary/secondary** button label + URL.
- **Extra data:** Key/value repeater; values stored as strings; empty rows removed → `null` in DB when empty.

---

## 5. What is *not* done yet (next steps)

- Public API merging these sources for Next.js.
- Replacing or extending `HomepageSettingsController` output.
- Homepage redesign consuming structured sections, theme, and navigation.

---

## 6. Local commands

```bash
cd apps/admin-laravel
composer install
php artisan migrate
php artisan db:seed --class=FrontendCmsFoundationSeeder   # if CMS setting keys missing
```

Then open **Admin → CMS** in the browser.
