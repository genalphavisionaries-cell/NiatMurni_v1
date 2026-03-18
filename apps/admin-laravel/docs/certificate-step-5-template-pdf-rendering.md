# Certificate Step 5: Template-based PDF rendering

This document describes how certificate PDF generation was switched to use the certificate template system, with a safe legacy fallback.

---

## Overview

- **Template-aware rendering:** When a certificate has an associated template (or an active template exists), the PDF is generated from template-managed content (subtitle, body, footer, assets, alignment, font sizes, visibility toggles).
- **Legacy fallback:** If no usable template exists, or template rendering fails, the original Blade view `certificates.template` is used so existing issuance is never broken.

---

## Placeholder value mapping

Placeholders are built by `App\Services\CertificatePlaceholderService::buildPlaceholders(Certificate $certificate, ?CertificateTemplate $template)`.

| Placeholder | Source | Notes |
|-------------|--------|--------|
| `{participant_name}` | `participant.full_name` | Participant model. Fallback: `—`. |
| `{participant_identity_no}` | `participant.nric_passport` | **Participant identity field:** `Participant.nric_passport` (NRIC or Passport; full value, not masked). Fallback: `—`. |
| `{program_name}` | `booking.classSession.program.name` | Program name. Fallback: `—`. |
| `{attendance_date}` | See below | **Attendance date:** First of: `classSession.starts_at`, then `booking.completed_at`, then `certificate.issued_at`. Formatted as `d M Y` (e.g. 14 Mar 2026). Fallback: `—`. |
| `{completion_status}` | Fixed | Always `"Attended & Passed"`. |
| `{tutor_name}` | `classSession.tutor.user.name` | Tutor’s linked User name. Fallback: `—`. |
| `{tutor_registration_number}` | `tutor.registration_number` | From Tutor model. Fallback: `—`. |
| `{issue_date}` | `certificate.issued_at` | Formatted `d M Y`. Fallback: `—`. |
| `{certificate_no}` | `certificate.certificate_number` | e.g. NM-2026-0001. Fallback: `—`. |
| `{verification_url}` | See below | **Verification URL:** `config('app.url')` + `certificate.qr_code`. `qr_code` is stored as path like `/certificate/verify/{uuid}`. Same pattern as existing PDF QR and verification page. |
| `{organization_name}` | `template.organization_name` | From certificate template; empty if no template. |
| `{organization_registration_no}` | `template.organization_registration_no` | From certificate template; empty if no template. |

**Assumptions / limitations:**

- Participant identity is taken from `Participant.nric_passport` only (single field for NRIC/Passport).
- Attendance date prefers class session `starts_at`; if booking has no class session or session has no date, `booking.completed_at` then `certificate.issued_at` is used.
- Tutor name comes from `Tutor->user->name`; if the tutor or user is missing, `—` is used.
- Organization fields are only filled when a template is passed; they are not sourced from elsewhere.

---

## Template selection

In `CertificatePdfService::generatePdf()`:

1. **Certificate’s template:** If `certificate.certificate_template_id` is set, that template is loaded. If it exists, it is used.
2. **Active template:** If the certificate has no template or the referenced template was deleted, `CertificateTemplate::where('is_active', true)->first()` is used.
3. **Legacy:** If no template is found (null), the legacy Blade view is used.

So: **certificate’s template → active template → legacy.**

---

## When fallback to legacy happens

- **No template:** Neither the certificate’s template nor an active template exists.
- **Template rendering failure:** Any exception during template-managed view rendering or PDF generation (e.g. missing data, broken asset) is caught; the service then generates the PDF with the legacy view and the same QR data.

Legacy view receives: `certificate_number`, `participant_name`, `issued_at`, `qr_image_base64`. No template fields are used.

---

## Participant / tutor / session fields used

- **Participant identity:** `Participant.nric_passport`.
- **Participant name:** `Participant.full_name`.
- **Attendance date:** `ClassSession.starts_at` (formatted), else `Booking.completed_at`, else `Certificate.issued_at`.
- **Tutor name:** `ClassSession.tutor.user.name` (User model `name`).
- **Tutor registration number:** `Tutor.registration_number`.
- **Program name:** `ClassSession.program.name`.

Relations loaded for placeholder building: `booking.participant`, `booking.classSession.program`, `booking.classSession.tutor.user`.

---

## Verification URL

- **Built as:** `rtrim(config('app.url'), '/') . $certificate->qr_code`.
- **Stored:** On issue, `qr_code` is set to `/certificate/verify/{verification_token}` (see Step 4). So the full URL is e.g. `https://niatmurniacademy.com/certificate/verify/{uuid}`.
- **Usage:** Same URL is used for the QR code image and for the `{verification_url}` placeholder.

---

## Template-based view and assets

- **View:** `resources/views/certificates/template-managed.blade.php`.
- **Legacy view:** `resources/views/certificates/template.blade.php` (unchanged; used for fallback).

Template-managed view uses:

- Template: subtitle, body_content, footer_text, organization_details, alignment and font size settings, visibility toggles (show_logo, show_left_signature, show_right_signature).
- Placeholders in body/footer are replaced before rendering via `CertificatePlaceholderService::replacePlaceholders()`.
- Images (logo, background, signatures) are passed as **data URIs** (base64) from `CertificatePdfService::imageToDataUri()`, which reads from `Storage::disk('public')`. No file paths are passed to the view, so Dompdf does not depend on server paths.
- PDF paper size and orientation come from the template: `page_size` (default A4), `orientation` (default portrait).

---

## Files touched

- **New:** `app/Services/CertificatePlaceholderService.php` – builds placeholder map and verification URL; replaces placeholders in text.
- **Updated:** `app/Services/CertificatePdfService.php` – template resolution, template-managed vs legacy branch, try/catch fallback, image-to-data-URI, paper/orientation.
- **New:** `resources/views/certificates/template-managed.blade.php` – template-driven certificate layout for Dompdf.
- **Unchanged:** `resources/views/certificates/template.blade.php` – legacy view for fallback.
- **New:** `docs/certificate-step-5-template-pdf-rendering.md` – this document.

---

## Local commands to run

```bash
cd apps/admin-laravel
composer install
php artisan route:list
php artisan tinker
# In tinker: create a booking with participant and class session, then issue certificate and open PDF from storage.
```

Optional: run tests if you have feature/unit tests for certificate PDF generation.

---

## What to test in admin before production

1. **Legacy path (no template):** Deactivate all certificate templates. Issue a certificate for an eligible booking. Confirm PDF is generated and matches the previous simple layout (certificate number, participant name, issue date, QR).
2. **Template path:** Activate a certificate template; set body/footer with placeholders (e.g. `{participant_name}`, `{program_name}`, `{attendance_date}`, `{tutor_name}`, `{certificate_no}`). Issue a certificate. Confirm PDF uses template layout and placeholders are replaced correctly; participant identity (NRIC/Passport) and tutor registration number appear where used.
3. **Assets:** In the template, set logo and/or background and/or signatures. Issue again; confirm images appear in the PDF.
4. **Fallback on error:** Optionally break something (e.g. temporarily remove a required relation) and confirm PDF still generates via legacy view.
5. **Reissue:** Reissue a certificate; confirm the new PDF uses the template (or legacy if no template) and has a new certificate number and verification URL.
6. **Verification:** Open the verification URL (or scan QR) and confirm the public verification page shows the certificate as valid.

After that, you can safely push to production.
