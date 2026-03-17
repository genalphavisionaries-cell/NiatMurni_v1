# Certificate template – Step 1: data foundation

This document describes **Step 1 only**: the data foundation for certificate template management and historical certificate safety. **Current PDF generation is not switched** to the new system yet.

---

## Current (old) system vs new target system

### Current system

- **PDF generation:** Dompdf via `CertificatePdfService::generatePdf()`.
- **Template:** Single Blade view `resources/views/certificates/template.blade.php` with fixed layout and variables (`certificate_number`, `participant_name`, `issued_at`, `qr_image_base64`).
- **Certificates table:** Stores `booking_id`, `certificate_number`, `issued_at`, `qr_code`, `verification_token`, `pdf_path`, `status`, `revoked_at`. No template reference, no snapshot of content.
- **Certificate templates table:** Existed with `id`, `name`, `html_content` (longText), `is_active` (default true), `timestamps`. **Not used** by the current generation flow.

### New target system (foundation only)

- **Templates:** Structured, placeholder-based rows in `certificate_templates` with content sections, layout, typography, assets, and signatory fields.
- **Certificates:** When a certificate is issued (later step), it will store `certificate_template_id` and `template_name_snapshot` so that already-issued certificates remain correct after template edits.
- **Placeholders:** A fixed set of allowed placeholders (e.g. `{participant_name}`, `{issue_date}`) replaced at render time; no arbitrary HTML or drag-and-drop in phase 1.

---

## Fields added

### certificate_templates (evolved)

| Field | Type | Notes |
|-------|------|--------|
| `code` | string, nullable, unique | Machine identifier for the template |
| `subtitle` | string, nullable | |
| `body_content` | text, nullable | Main body; may contain placeholders |
| `footer_text` | text, nullable | Footer; may contain placeholders |
| `html_content` | longText, nullable | **Deprecated.** Kept for backward compatibility; new templates should use body_content / structured fields. |
| `page_size` | string, nullable, default A4 | |
| `orientation` | string, nullable | e.g. portrait / landscape |
| `title_alignment`, `subtitle_alignment`, `body_alignment`, `footer_alignment` | string, nullable | |
| `title_font_size`, `subtitle_font_size`, `body_font_size`, `footer_font_size` | unsignedSmallInteger, nullable | |
| `show_logo`, `show_left_signature`, `show_right_signature` | boolean, default true | |
| `content_top_offset`, `content_bottom_offset` | unsignedSmallInteger, nullable | |
| `background_image_path`, `logo_path`, `left_signature_image_path`, `right_signature_image_path` | string, nullable | |
| `organization_name`, `organization_details` | string/text, nullable | |
| `left_signatory_name`, `left_signatory_title`, `right_signatory_name`, `right_signatory_title` | string, nullable | |
| `is_active` | boolean | Default for **new** records is `false` (set in model `$attributes`). Existing DB default unchanged. |

### tutors

| Field | Type | Notes |
|-------|------|--------|
| `registration_number` | string, nullable | For certificate signatory / license ID display. No UI wired yet. |

### certificates

| Field | Type | Notes |
|-------|------|--------|
| `certificate_template_id` | foreignId, nullable | FK to `certificate_templates.id`, `nullOnDelete`. |
| `template_name_snapshot` | string, nullable | Snapshot of template name at issue time for history. |

Existing certificate rows are **not** backfilled; they remain `NULL` for both new columns.

---

## Allowed placeholders (phase 1)

Defined in `App\Support\CertificateTemplatePlaceholders`:

| Placeholder | Label | Description |
|-------------|--------|-------------|
| `{participant_name}` | Participant name | Full name of the participant who completed the program. |
| `{program_name}` | Program name | Name of the program/class the certificate is for. |
| `{tutor_name}` | Tutor / trainer name | Name of the tutor assigned to the class session. |
| `{tutor_registration_number}` | Tutor registration / license number | From tutor profile. |
| `{issue_date}` | Certificate issue date | Date the certificate was issued (formatted). |
| `{certificate_no}` | Certificate number | Unique number (e.g. NM-2026-0001). |

Use these **exact** strings in template `body_content` / `footer_text`; they will be replaced at render time when generation is wired to the new system.

---

## Why controlled placeholders instead of drag-and-drop

- **Safety:** No arbitrary HTML or scripts; reduces XSS and layout breakage.
- **Predictability:** Only known placeholders are replaced; behaviour is easy to test and document.
- **Phase 1 scope:** Keeps the first release simple and maintainable; richer editing can come later.

---

## Why certificate snapshot / history foundation is needed

- Templates will be **edited** over time (wording, layout, signatories).
- Already-issued certificates must **not** change when a template is updated; they are historical records.
- Storing `certificate_template_id` plus `template_name_snapshot` (and in future steps, optionally more snapshot data) allows:
  - Knowing which template was used for each certificate.
  - Displaying “Template: …” in admin without relying on the current template content.
  - Future-proofing for “re-render from snapshot” or “store rendered PDF only” strategies without changing past behaviour.

---

## Current generation flow is NOT switched yet

- `CertificatePdfService` still uses the fixed Blade view `certificates.template`.
- No code reads from `certificate_templates` for PDF generation.
- No code sets `certificate_template_id` or `template_name_snapshot` when issuing certificates.
- This step only adds the **data foundation** (tables, models, placeholders contract). Wiring generation to templates and snapshots is a later step.

---

## Backward compatibility decisions

1. **certificate_templates.html_content**  
   Kept as **nullable**. Old rows retain existing content; new templates can leave it null and use `body_content` / structured fields. Deprecated in favour of the new structure.

2. **certificate_templates.is_active**  
   DB default left as-is. New template records get `is_active => false` via the model `$attributes` so only explicitly activated templates are used once generation is wired.

3. **certificates table**  
   New columns are **nullable**; no backfill. Existing certificates are unchanged and remain valid.

4. **certificate_template_id FK**  
   `nullOnDelete()` so if a template is deleted, existing certificates keep their snapshot and are not cascade-deleted.

5. **Evolve migration**  
   Does not use `->change()` for `html_content` in `down()` to avoid requiring `doctrine/dbal`. Rollback only drops the new columns; `html_content` stays nullable.

---

## Migrations created

1. `2026_03_29_000001_evolve_certificate_templates_for_placeholder_system.php` – adds all new columns to `certificate_templates`; makes `html_content` nullable.
2. `2026_03_29_000002_add_registration_number_to_tutors.php` – adds `registration_number` to `tutors`.
3. `2026_03_29_000003_add_template_snapshot_to_certificates.php` – adds `certificate_template_id` (FK) and `template_name_snapshot` to `certificates`.

Run in order. Reverse order for rollback.

---

## Manual commands to run locally

```bash
cd apps/admin-laravel
php artisan migrate
```

If the evolve migration fails on `html_content->nullable()->change()` (e.g. on SQLite without doctrine/dbal), install:

```bash
composer require doctrine/dbal
```

then run `php artisan migrate` again.

---

## Production care

- Run migrations during a low-traffic window.
- Certificates table is only extended with nullable columns and one optional FK; existing rows are untouched.
- No changes to routing, domain, or admin path; no subdomain work.
