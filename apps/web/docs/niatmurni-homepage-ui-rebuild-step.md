# Niat Murni Homepage UI Rebuild (Correction Pass)

This step rebuilds the **public homepage UI** (marketing layout) to match the finalized NiATmurni homepage structure, using the existing CMS/public API plumbing.

Admin CMS UX rebuilding is intentionally **not** included here; this frontend is tolerant to missing CMS fields and falls back to sensible defaults.

## What changed (components/sections)

### Header
- Updated `apps/web/components/home/cms/CmsHeader.tsx`
- Adds/ensures a simple **language selector dropdown** (`BM`/`EN`) and the **hamburger icon** is visible on both desktop and mobile.
- Desktop menu shows **up to 3 top-level items** (with submenu support via existing navigation tree children rendering).
- Increased main menu typography for readability.

### Hero
- Updated `apps/web/components/home/cms/sections/HeroSection.tsx`
- Replaced the single background hero with a **full-screen carousel**:
  - Desktop/mobile images per slide
  - Auto-slide + manual arrows + dots
  - Overlay title/description + 2 CTA buttons
- **No booking popup** is included in this hero.

Additionally, corrected legacy fallback:
- Updated `apps/web/components/home/hero/HeroLayout.tsx` to remove the old booking/registration panel entirely.
- The legacy fallback hero now reuses the same clean CMS-style hero section UX (carousel + overlay + 2 CTAs) built from homepage settings.

Expected CMS shape (optional, best-effort):
- `homepage_sections[hero].extra_data.slides_json` (array of slides)
- Optional `extra_data.mobile_image_url` as a global mobile fallback

Fallback behavior:
- If `slides_json` is missing/empty, the hero uses:
  - `section.image_url` for desktop
  - `extra_data.mobile_image_url` if present, otherwise `section.image_url`
  - `section.title/subtitle/description` and `section.button_primary_*` / `section.button_secondary_*`

### Floating Quick Menu
- Added `apps/web/components/home/cms/FloatingQuickMenu.tsx`
- Appears on the CMS-driven homepage (via `CmsHomepageRenderer`)
- Bottom-centered, fixed, visible on desktop and mobile
- 4 shortcut items:
  - `/#classes`
  - `/#why_choose_us`
  - `/#testimonials`
  - `/#promotions`
Legacy correction:
- Removed the left vertical “booking rail” by removing the booking panel from the legacy `HeroLayout` fallback.

### Why Us
- Updated `apps/web/components/home/cms/sections/WhyChooseUsSection.tsx`
- Rebuilt to the requested **two-column layout**:
  - Left: **4 USP cards**
  - Right: **image/banner slider**

Expected CMS shape (optional):
- `extra_data.items_json` → USP cards (title/description)
- `extra_data.banner_images_json` → multiple banner images

Fallback behavior:
- Right banner uses `section.image_url` if `banner_images_json` is missing.
- If there are fewer than 4 USP items, only available cards render.

### Upcoming Classes (conversion-focused)
- Updated `apps/web/components/home/UpcomingClassesSection.tsx`
- Uses **live session data** (`fetchUpcomingClasses`) with demo fallback.
- New compact listing UI (denser, suitable for many upcoming classes):
  - Explicit labels: `Tarikh:`, `Masa:`, `Bahasa:`, `Mod Kelas:`, `Kekosongan:`
  - Seat quantity selector (compact) + `Daftar` button (still opens the cart popup)
  - Mobile shows **first 2 items**, then **Load More** (up to the same max set by the component)
  - Desktop shows a fuller list (no mobile-only limitation)

Interactive behavior added:
- Quantity selection per card
- Cart popup opens immediately on `Daftar`
- Mobile Load More toggles extra items

Fallback behavior:
- If GO API is unavailable (no live classes), uses existing `MOCK_HERO_CLASSES`.

### Trust & Reviews (Google-style UI)
- Updated `apps/web/components/home/cms/sections/TestimonialsSection.tsx`
- Adds UI structure:
  - Brand logo “carousel” strip (animated marquee)
  - Review summary block (rating/count)
  - Google-style testimonial cards

Expected CMS shape (optional):
- `extra_data.review_summary_json` (rating/count)
- `extra_data.brands_json` (brand labels)
- `extra_data.items_json` (testimonial cards: name/review/rating/date)

Fallback behavior:
- Uses defaults for summary rating/count and brand labels if missing.

### Promotions / Cross-selling
- Added `apps/web/components/home/cms/sections/PromotionsSection.tsx`
- Mapped from CMS key `homepage_sections[].section_key === "cta"` for now.
- Structure:
  - Top promo banner
  - Title + description
  - 3 promo cards (image/title/description/button/URL)

Expected CMS shape (optional):
- `cta.extra_data.promos_json` as an array of promo items

Fallback behavior:
- If promos are missing, it shows 3 placeholder promo cards with generic copy and gradient placeholders.

### Homepage section wiring
- Updated `apps/web/components/home/cms/CmsHomepageRenderer.tsx`
- Removed the old `faq` rendering from the CMS homepage flow.
- Replaced `CtaSection` rendering with `PromotionsSection`.
- Added `FloatingQuickMenu`.

## Data mapping summary (what frontend expects)

Hero (`section_key = "hero"`):
- `section.title/subtitle/description` (fallback overlay text)
- `section.button_primary_*` and `section.button_secondary_*` (CTA buttons)
- `section.image_url` (desktop background fallback)
- Optional: `extra_data.mobile_image_url`
- Optional: `extra_data.slides_json` (array for carousel)

Why Us (`section_key = "why_choose_us"` or `features`):
- `extra_data.items_json` for USP cards
- `section.image_url` and/or `extra_data.banner_images_json` for the right-side slider

Trust & Reviews (`section_key = "testimonials"`):
- `extra_data.items_json` for testimonial cards
- Optional: `extra_data.review_summary_json`
- Optional: `extra_data.brands_json`

Promotions (`section_key = "cta"` for now):
- Optional: `extra_data.promos_json` (array of 3 promo cards)

## What still needs later admin CMS UI support

To remove fallbacks and fully drive the UI from CMS, the later admin UX should ideally support:
- Hero carousel slides (desktop + mobile image URLs per slide) via `slides_json` / `mobile_image_url`
- Banner slider images via `banner_images_json`
- Trust/review summary via `review_summary_json` and brand logos via `brands_json`
- Promotions cards via `promos_json`

## Local verification

Run:

```bash
cd apps/web
npm run build
```

Then smoke test in the browser:
- Homepage: `/`
- Sections jump links in floating menu: `#classes`, `#why_choose_us`, `#testimonials`, `#promotions`

