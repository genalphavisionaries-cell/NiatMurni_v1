# Frontend CMS — Step 4: CMS-driven homepage redesign

## Goal

Rebuild the public homepage UI to be **CMS-driven** using a **controlled `section_key` renderer** (not a page builder), while keeping safe fallbacks to the legacy homepage settings.

## Supported section keys (Step 4)

These `homepage_sections.section_key` values are recognized:

- `hero`
- `features` (alias of `why_choose_us`)
- `why_choose_us`
- `programs` (controlled: renders the existing “Upcoming classes” block for now)
- `testimonials`
- `faq`
- `cta`
- `contact` (controlled: renders the existing contact block for now)

Unknown keys are ignored.

## How section keys map to React components

Main renderer: `components/home/cms/CmsHomepageRenderer.tsx`

| section_key | Component | Notes |
|------------|-----------|------|
| `hero` | `components/home/cms/sections/HeroSection.tsx` | Title/subtitle/image/buttons + optional badges via `extra_data` |
| `why_choose_us` | `components/home/cms/sections/WhyChooseUsSection.tsx` | Cards list via `extra_data.items_json` |
| `features` | `components/home/cms/sections/WhyChooseUsSection.tsx` | Treated as alias to `why_choose_us` |
| `programs` | (controlled) `components/home/UpcomingClassesSection.tsx` | Temporary integration (not arbitrary rendering) |
| `testimonials` | `components/home/cms/sections/TestimonialsSection.tsx` | Grid via `extra_data.items_json` |
| `faq` | `components/home/cms/sections/FaqSection.tsx` | Accordion via `extra_data.items_json` |
| `cta` | `components/home/cms/sections/CtaSection.tsx` | Simple CTA block |
| `contact` | (controlled) `components/home/ContactSection.tsx` | Temporary integration |

## Data expectations per section

### `hero`

- **Uses**:
  - `title` (fallback: `site.site_tagline`, else a safe default)
  - `subtitle` / `description`
  - `image_url` (optional; becomes background)
  - `button_primary_label` / `button_primary_url` (fallback: `site.primary_cta_label/url`)
  - `button_secondary_label` / `button_secondary_url` (optional)
- **Optional `extra_data`**:
  - `overlay_opacity`: number (default 0.25)
  - `badges_json`: JSON array like `[{"label":"KKM recognised"},{"label":"Online / Physical"}]`

### `why_choose_us` / `features`

- **Uses**: `title`, `subtitle` or `description`
- **Optional `extra_data`**:
  - `items_json`: JSON array like:
    ```json
    [
      {"title":"KKM-recognised","description":"Recognised training for food handlers."},
      {"title":"Fast & practical","description":"Clear steps, real examples."}
    ]
    ```

### `testimonials`

- **Uses**: `title`, `subtitle` or `description`
- **Optional `extra_data`**:
  - `items_json`: JSON array like:
    ```json
    [
      {"name":"Aina","review":"Very clear and helpful","rating":5,"date":"Mac 2025"}
    ]
    ```

### `faq`

- **Uses**: `title`, `subtitle` or `description`
- **Optional `extra_data`**:
  - `items_json`: JSON array like:
    ```json
    [
      {"question":"How long is the course?","answer":"Typically 3 hours."}
    ]
    ```

### `cta`

- **Uses**: `title`, `subtitle`/`description`, `button_primary_label/url`
- **Optional `extra_data`**:
  - `background_color`: CSS color string (fallback uses `--cms-footer-bg`)

## Header/footer redesign (Step 4)

- **Header**: `components/home/cms/CmsHeader.tsx`
  - CMS-driven `logo_url`, `site_name`
  - CMS-driven header navigation tree (dropdowns)
  - CMS-driven primary CTA (label/url)
  - Responsive mobile menu
  - Uses theme vars: `--cms-header-bg` + `--cms-primary`

- **Footer**: `components/home/cms/CmsFooter.tsx`
  - CMS-driven footer navigation columns (from CMS footer nav tree)
  - Uses CMS footer background (`--cms-footer-bg` or `theme.footer_background_color`)
  - **Fallbacks**:
    - Description currently uses legacy `homepage-settings.footerDescription` (until dedicated CMS footer text fields are added).
    - Bottom/legal uses legacy `footerBottom` when present; else a safe default.

## Theme usage

Theme variables are already exposed on the homepage wrapper via `mergePublicCmsForHome()`:

- `--cms-primary` used for primary CTA buttons
- `--cms-header-bg` used for header background
- `--cms-footer-bg` / `theme.footer_background_color` used for footer background

We intentionally do **not** force every element to use custom colors.

## Fallback behavior

- If CMS fetch fails or CMS is empty: homepage continues to render the legacy layout as before.
- If CMS is present but missing key sections:
  - missing `why_choose_us`/`features` → legacy `WhyChooseSection`
  - missing `testimonials` → legacy `SocialProofSection`
  - missing `programs` → legacy promo + upcoming classes blocks
- No “empty” sections render if required data is missing.

## What remains for later refinement

- Add dedicated CMS fields for footer text/copyright (currently uses legacy fallback).
- Add controlled components for `about`, `stats`, and a proper CMS-driven `programs` section (instead of reusing `UpcomingClassesSection`).
- Optional: refine typography/spacing further once CMS content is populated.

