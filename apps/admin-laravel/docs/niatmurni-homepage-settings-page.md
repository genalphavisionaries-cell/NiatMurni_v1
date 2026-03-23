# Homepage Settings — Filament Admin Page

**Page class:** `App\Filament\Pages\ManageHomepageSettings`
**View:** `resources/views/filament/pages/manage-homepage-settings.blade.php`
**Navigation:** CMS → Homepage Settings (sort order 2)
**URL:** `/admin/manage-homepage-settings`

---

## Overview

This page gives non-technical admins a single tabbed interface to manage all six homepage sections of the Niat Murni Academy public site. Each tab maps to a `homepage_sections` database row identified by a `section_key`.

All data is stored in the `homepage_sections` table. Simple scalars (title, description, buttons) use the table's dedicated columns. Complex or repeatable data (slides, USP cards, testimonials, etc.) is stored as JSON in the `extra_data` column.

---

## Tab → section_key mapping

| Tab label            | `section_key`        | DB sort_order |
|----------------------|----------------------|---------------|
| Hero                 | `hero`               | 1             |
| Floating Quick Menu  | `floating_quick_menu`| 2             |
| Why Us               | `why_us`             | 3             |
| Upcoming Classes     | `upcoming_classes`   | 4             |
| Trust & Reviews      | `trust_reviews`      | 5             |
| Promotions           | `promotions`         | 6             |

Records are created automatically on first load via `HomepageSection::firstOrCreate`.

---

## Data structures per section

### 1. Hero (`section_key = hero`)

**Direct columns:**

| Column                   | Value                        |
|--------------------------|------------------------------|
| `is_active`              | bool — section enabled       |
| `title`                  | Heading text                 |
| `description`            | Subheading / description     |
| `button_primary_label`   | CTA button 1 text            |
| `button_primary_url`     | CTA button 1 URL             |
| `button_secondary_label` | CTA button 2 text            |
| `button_secondary_url`   | CTA button 2 URL             |

**`extra_data` JSON structure:**

```json
{
  "button_primary_enabled": true,
  "button_secondary_enabled": false,
  "text_color": "#ffffff",
  "text_align": "center",
  "overlay_opacity": 0.5,
  "autoplay": true,
  "autoplay_interval": 5000,
  "show_arrows": true,
  "show_dots": true,
  "slides": [
    {
      "desktop_image_url": "https://…",
      "mobile_image_url": "https://…",
      "alt_text": "Slide description",
      "enabled": true
    }
  ]
}
```

---

### 2. Floating Quick Menu (`section_key = floating_quick_menu`)

**Direct columns:** `is_active`

**`extra_data` JSON structure:**

```json
{
  "items": [
    {
      "icon": "📅",
      "label": "Daftar Kelas",
      "url": "/#classes",
      "enabled": true
    }
  ]
}
```

Max 4 items (enforced by Filament repeater `maxItems`).

---

### 3. Why Us (`section_key = why_us`)

**Direct columns:** `is_active`, `title`, `description`

**`extra_data` JSON structure:**

```json
{
  "description_line_2": "Optional second description line.",
  "usp_items": [
    {
      "icon": "✅",
      "title": "KKM Certified",
      "description": "All courses are accredited.",
      "enabled": true
    }
  ],
  "banner_slides": [
    {
      "desktop_image_url": "https://…",
      "mobile_image_url": "https://…",
      "alt_text": "Banner slide",
      "enabled": true
    }
  ]
}
```

---

### 4. Upcoming Classes (`section_key = upcoming_classes`)

**Direct columns:** `is_active`, `title`, `description`

> ⚠️ **Important:** This tab controls section appearance and behaviour settings only. Actual class listings come exclusively from live `class_sessions` data. No manual class cards are entered here.

**`extra_data` JSON structure:**

```json
{
  "mobile_load_more_text": "Load More",
  "empty_state_text": "Tiada kelas dijadualkan buat masa ini.",
  "full_listing_button_text": "Pilih Kelas Lain",
  "full_listing_button_url": "/#classes",
  "show_full_listing_button": true,
  "desktop_initial_count": 21,
  "desktop_load_more_count": 10,
  "mobile_initial_count": 10,
  "mobile_load_more_count": 6,
  "show_availability": true,
  "show_quantity_selector": true,
  "enable_load_more": true
}
```

**Frontend defaults (hardcoded fallback):** If the section record or a field is missing, the frontend falls back to these exact values. Once the admin saves here, the DB values take precedence.

---

### 5. Trust & Reviews (`section_key = trust_reviews`)

**Direct columns:** `is_active`, `title`, `description`

**`extra_data` JSON structure:**

```json
{
  "review_summary": {
    "enabled": true,
    "platform_label": "Google Reviews",
    "rating_value": 4.8,
    "review_count": 2500,
    "review_count_text": "ulasan",
    "button_text": "Lihat Semua Ulasan",
    "button_url": "https://www.google.com/search?q=Niat+Murni+Academy+reviews"
  },
  "brand_logos": [
    {
      "company_name": "KKM",
      "image_url": "",
      "alt_text": "KKM logo",
      "enabled": true
    }
  ],
  "testimonials": [
    {
      "reviewer_name": "Ika Azlan",
      "avatar_url": "",
      "initial": "I",
      "rating": 5,
      "review_date_text": "Februari 2025",
      "review_text": "Terbaik dan sangat mudah faham.",
      "source_label": "Google",
      "enabled": true
    }
  ]
}
```

---

### 6. Promotions (`section_key = promotions`)

**Direct columns:** `is_active`, `title`, `description`

**`extra_data` JSON structure:**

```json
{
  "top_banner": {
    "enabled": false,
    "desktop_image_url": "https://…",
    "mobile_image_url": "https://…",
    "alt_text": "Promo banner",
    "link_url": "https://…"
  },
  "promo_cards": [
    {
      "title": "Kursus Asas",
      "description": "Sesuai untuk semua pekerja makanan.",
      "image_url": "https://…",
      "mobile_image_url": "https://…",
      "alt_text": "Card image",
      "button_text": "Daftar Sekarang",
      "link_url": "/#classes",
      "open_in_new_tab": false,
      "enabled": true
    }
  ]
}
```

---

## Frontend consumption

The frontend reads `homepage_sections` via the public CMS API at `GET /api/public/cms`. The `PublicCmsController` maps this data and the Next.js frontend reads it in:

- `apps/web/lib/public-cms.ts` — types + normalisation
- `apps/web/components/home/cms/CmsHomepageRenderer.tsx` — section rendering
- `apps/web/components/home/cms/sections/HeroSection.tsx` — hero slides & buttons
- `apps/web/components/home/cms/sections/WhyChooseUsSection.tsx` — USP cards & banner
- `apps/web/components/home/cms/sections/TestimonialsSection.tsx` — reviews & brands
- `apps/web/components/home/cms/sections/PromotionsSection.tsx` — promo cards
- `apps/web/components/home/UpcomingClassesSection.tsx` — live class listing

The frontend uses `extra_data` keys directly via `parseJsonSafe` and `extraString` helpers. If a key is missing, defaults are used so the site always renders safely.

---

## How repeater item ordering works

Repeater items are stored in array order. The admin can drag to reorder. The `array_values()` call in `persistSection()` re-indexes arrays before saving so there are no stale Filament UUID keys in the DB.

---

## Migration

No new migration is required. This page uses the existing `homepage_sections` table created by:

```
database/migrations/2026_03_31_120001_create_homepage_sections_table.php
```

Records are created on-demand by `firstOrCreate` — no seeder is required for the page to function.

---

## Admin setup checklist

After deploying, visit `/admin` and navigate to **CMS → Homepage Settings**:

1. Open the **Hero** tab → add slides with Cloudinary image URLs
2. Open the **Floating Quick Menu** tab → add up to 4 shortcut items
3. Open the **Why Us** tab → add USP items and banner slides
4. Open the **Upcoming Classes** tab → adjust display settings as needed
5. Open the **Trust & Reviews** tab → add testimonials and brand logos; set the Google rating values
6. Open the **Promotions** tab → add promo cards and optionally enable the top banner
7. Click **Save all homepage settings**

---

## What should be built next

1. **Header Settings** tab — logo, nav links, CTA button
2. **Footer Settings** tab — description, columns, legal links
3. **Brand Settings** tab — colours, fonts, favicon
4. Frontend wiring to consume per-section `extra_data` fields (e.g. hero slides, USP items) from the API instead of hardcoded defaults
