# Certificate Step 4: Issuance lifecycle

This document describes the certificate issuance lifecycle logic and admin actions added in Step 4. **The actual PDF rendering still uses the legacy Blade template;** template-based rendering is not switched yet.

---

## Eligibility rule

A booking is **eligible** for certificate issuance when:

1. **Attendance:** If the system setting `require_attendance` is true, `booking.attendance_status` must be `'present'`. If the setting is false, attendance is not required for eligibility.
2. **Exam:** If the system setting `require_exam_pass` is true, `booking.exam_passed` must be `true`. If the setting is false, exam is not required.

So the effective rule is: **Attended + Passed** when the relevant settings are enabled. Settings are read from the `settings` table (keys `require_attendance`, `require_exam_pass`). The same rule is used for manual issue in Filament and for any auto-issue on completion (e.g. API or observer).

---

## Manual issuance (Issue Certificate)

- **Where:** Filament → **Bookings** table → row action **Issue Certificate**.
- **When shown:** Only when the booking is eligible and has **no** active (non-revoked) certificate.
- **Behavior:**
  - Creates a **new** certificate record with a new `certificate_number` and `verification_token`.
  - Sets `qr_code` to `/certificate/verify/{token}`.
  - Sets `issued_at`, `status = 'issued'`.
  - If an **active certificate template** exists (`CertificateTemplate::where('is_active', true)->first()`), stores its `id` in `certificate_template_id` and its `name` in `template_name_snapshot`. Otherwise both are stored as `null` (fallback for continuity).
  - Generates the PDF using the **existing** Blade-based flow (`CertificatePdfService`). No template-based rendering yet.
- **Duplicate prevention:** The service refuses to issue if the booking already has an active certificate (same booking, status ≠ revoked). Only one active certificate per booking.

---

## Revoke

- **Where:** Filament → **Certificates** table → row action **Revoke Certificate**.
- **When shown:** Only when the certificate status is not already `revoked`.
- **Behavior:**
  - Sets `status = 'revoked'` and `revoked_at = now()`.
  - **Does not** delete the record or clear `pdf_path`. The record is kept for audit/history.
- **Effect:** The booking’s “active” certificate (used for display/verification) becomes the next non-revoked certificate, if any. If this was the only one, the booking has no active certificate until a new one is issued or reissued.

---

## Reissue

- **Where:**
  - Filament → **Bookings** table → row action **Reissue Certificate** (when the booking already has an active certificate).
  - Filament → **Certificates** table → row action **Reissue Certificate** (when the certificate is not revoked).
- **Behavior:**
  1. **Revoke** the current certificate (set `status = 'revoked'`, `revoked_at = now()`). Record and PDF are kept.
  2. **Create a new** certificate for the same booking:
     - New `certificate_number`.
     - New `verification_token` and `qr_code`.
     - New `issued_at`, `status = 'issued'`.
     - Again captures `certificate_template_id` and `template_name_snapshot` from the current active template (or null).
  3. Generate a **new** PDF with the existing Blade flow and store it under the new certificate.
- **No overwrite:** The old certificate row is never updated with the new number or token; it stays revoked in history.

---

## Certificate numbers and tokens

- **Issue:** Each new certificate gets a unique number (`NM-YYYY-NNNN`) and a new UUID `verification_token`. The QR code path is `/certificate/verify/{token}`.
- **Reissue:** The **new** certificate gets a **new** number and **new** token. The old certificate keeps its old number and token; verification for the old token can return “revoked”.
- **Revoke:** Number and token of the revoked certificate are unchanged; they remain in the database for audit and verification (e.g. “revoked” status).

---

## Active template: required or optional

- **Optional for this step.** If there is **no** active certificate template (`is_active = true`), issuance and reissue still run:
  - `certificate_template_id` and `template_name_snapshot` are stored as `null`.
  - PDF is still generated with the **legacy Blade template**.
- When template-based PDF is introduced later, you can then require an active template for issue if desired; the snapshot columns are already in place.

---

## What remains unchanged

- **PDF engine:** `CertificatePdfService` still uses the fixed Blade view `certificates.template`. No template-based layout or placeholder rendering yet.
- **Public verification:** Verification routes and pages are unchanged.
- **Routing/domain/admin path:** No changes.

---

## Service layer

- **`CertificateLifecycleService`** (new):
  - `isEligibleForCertificate(Booking)`
  - `getActiveCertificateForBooking(Booking)`
  - `issueCertificateForBooking(bookingId)` — eligibility + duplicate check, then delegates to `CertificateService`.
  - `revokeCertificate(Certificate)`
  - `reissueCertificate(Certificate)` — revoke current, then issue new via `CertificateService`.
- **`CertificateService`** (updated):
  - `issueCertificate(bookingId, ?templateId, ?templateName)` — creates certificate (with optional template snapshot), generates PDF. No eligibility or duplicate check; caller’s responsibility.
- **`CertificatePdfService`** — unchanged; still Blade-only.

---

## Duplicate active certificates

- **Prevention:** Before creating a new certificate, the lifecycle service checks that the booking has **no** active certificate (`status != 'revoked'`). If one exists, `issueCertificateForBooking` throws and no second active certificate is created.
- **Booking relationship:** `Booking` has `certificates()` (all) and `certificate()` (the single active one: non-revoked, latest by id). So “active certificate” is uniquely defined per booking.

---

## Template snapshot

- On **issue** and **reissue**, the code loads `CertificateTemplate::where('is_active', true)->first()`. If present, it stores:
  - `certificate_template_id` = template id
  - `template_name_snapshot` = template name
- If no active template, both are stored as `null`. PDF generation does not yet use these; they are for future template-based rendering and for display in admin.
