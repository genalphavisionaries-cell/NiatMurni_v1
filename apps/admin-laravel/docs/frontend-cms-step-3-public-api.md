# Frontend CMS — Step 3: Public API

## Old vs new data flow

| Before | After (Step 3) |
|--------|----------------|
| Next.js calls **`GET /api/homepage-settings`** only | Still available unchanged. Next.js **also** calls **`GET /api/public/cms`** on the homepage. |
| Single `HomepageSetting` JSON (hero, banners, legacy nav, etc.) | New endpoint returns **structured** site/theme/SEO settings, **navigation trees**, and **homepage_sections** rows. |

## Endpoint chosen

**New route:** `GET /api/public/cms`  
**Name:** `api.public.cms`  
**Controller:** `App\Http\Controllers\Api\PublicCmsController`

**Why not extend `/api/homepage-settings`?**  
The legacy payload is a different shape (camelCase, hero/banners/social_proof). Merging both into one response would bloat the contract and risk breaking existing consumers. A dedicated endpoint keeps the structured CMS contract clear and leaves the legacy endpoint stable.

## Payload shape

```json
{
  "site": {
    "site_name", "site_tagline", "logo_url", "favicon_url",
    "primary_cta_label", "primary_cta_url"
  },
  "theme": {
    "primary_color", "secondary_color", "accent_color",
    "background_color", "text_color",
    "header_background_color", "footer_background_color"
  },
  "seo": {
    "homepage_seo_title", "homepage_seo_description", "homepage_og_image_url",
    "default_seo_title", "default_seo_description"
  },
  "navigation": {
    "header": [ { "id", "label", "url", "open_in_new_tab", "is_button", "children": [ ... ] } ],
    "footer": [ ... ]
  },
  "homepage_sections": [
    {
      "section_key", "name", "sort_order",
      "title", "subtitle", "description", "image_url",
      "button_primary_label", "button_primary_url",
      "button_secondary_label", "button_secondary_url",
      "extra_data"
    }
  ]
}
```

- **Navigation:** Only **active** items. Trees built in memory (roots = `parent_id` null, children nested). One level of children supported (matches Filament rules).
- **Homepage sections:** Only **`is_active`**, ordered by **`sort_order`**.

## Data sources

- **site / theme / seo:** `settings` table keys from `FrontendCmsSettingKeys`.
- **navigation:** `site_navigation_items`.
- **homepage_sections:** `homepage_sections`.

## Fallback behaviour (API)

Empty strings in `settings` are returned as `""`. The frontend merges with legacy homepage-settings and defaults.

## Local check

```bash
curl -s http://localhost:8000/api/public/cms | jq .
```

## Next steps

- Broader use of theme CSS variables across the site.
- Deprecate duplicate fields in `HomepageSetting` once the public site fully migrates.
