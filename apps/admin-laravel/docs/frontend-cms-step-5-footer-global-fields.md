# Frontend CMS — Step 5: Footer & global site fields

## Purpose

Move footer intro text, copyright line, contact details, and social links from legacy homepage-settings / hardcoded defaults into **Website settings** (`settings` table), exposed on **`GET /api/public/cms`**.

## New setting keys (`FrontendCmsSettingKeys`)

| Key constant | DB key | Admin label |
|--------------|--------|-------------|
| `FOOTER_DESCRIPTION` | `cms_footer_description` | Footer intro text |
| `FOOTER_BOTTOM_TEXT` | `cms_footer_bottom_text` | Copyright / bottom line |
| `CONTACT_EMAIL` | `cms_contact_email` | Contact email |
| `CONTACT_PHONE` | `cms_contact_phone` | Contact phone |
| `CONTACT_ADDRESS` | `cms_contact_address` | Address (optional) |
| `SOCIAL_FACEBOOK_URL` | `cms_social_facebook_url` | Facebook page URL |
| `SOCIAL_INSTAGRAM_URL` | `cms_social_instagram_url` | Instagram URL |
| `SOCIAL_LINKEDIN_URL` | `cms_social_linkedin_url` | LinkedIn URL |

Values are plain strings (textarea where noted). Empty string = unset.

## Where admins edit

**Filament → CMS → Website settings** (`ManageFrontendCmsSettings`)

New section: **Footer & contact** (below SEO).

## Public API (`PublicCmsController`)

`GET /api/public/cms` response now includes:

```json
{
  "footer": {
    "description": "",
    "bottom_text": ""
  },
  "contact": {
    "email": "",
    "phone": "",
    "address": ""
  },
  "social": {
    "facebook_url": "",
    "instagram_url": "",
    "linkedin_url": ""
  }
}
```

Existing keys (`site`, `theme`, `seo`, `navigation`, `homepage_sections`) are unchanged.

## Seeding new keys

On existing installs, run once so rows exist:

```bash
cd apps/admin-laravel
php artisan db:seed --class=Database\\Seeders\\FrontendCmsFoundationSeeder
```

(`firstOrCreate` — safe; does not overwrite filled values.)

## Legacy behaviour

- Homepage-settings API and DB are **unchanged**.
- Next.js uses CMS values first; if blank, falls back to legacy homepage-settings where documented in the web Step 5 doc.
