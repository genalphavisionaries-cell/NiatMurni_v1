# Certificate template – Step 3: placeholder contract & template data

This step finalizes the **placeholder contract** and ensures the `certificate_templates` table has the fields needed for the locked product behaviour. **PDF generation and issuance flow are not changed yet.**

---

## Final locked placeholder list

Defined in `App\Support\CertificateTemplatePlaceholders` (`PLACEHOLDERS`, `LABELS`, `DESCRIPTIONS`):

| Placeholder | Label | Description |
|-------------|-------|-------------|
| `{participant_name}` | Participant name | Full name of the participant who completed the program. |
| `{participant_identity_no}` | NRIC / Passport number | Participant’s full NRIC or Passport number (not masked). |
| `{program_name}` | Program name | Name of the program/class the certificate is for. |
| `{attendance_date}` | Attendance / session date | Date the participant attended the class/session. |
| `{completion_status}` | Completion status | Text describing completion, e.g. “Attended & Passed”. |
| `{tutor_name}` | Tutor / trainer name | Name of the tutor/trainer assigned to the class session. |
| `{tutor_registration_number}` | Tutor registration / license number | From the tutor profile `registration_number`. |
| `{issue_date}` | Certificate issue date | Date the certificate was issued (formatted). |
| `{certificate_no}` | Certificate number | Unique certificate number (e.g. `NM-2026-0001`). |
| `{verification_url}` | Verification URL | Full URL where the certificate can be verified online. |
| `{organization_name}` | Organization / academy name | Official name of the academy/organization issuing the certificate. |
| `{organization_registration_no}` | Organization registration number | Company/academy registration number as registered with authorities. |

Templates may use these placeholders inside `body_content` and `footer_text`. Other strings are treated as literal text.

---

## Dynamic vs static values

**Dynamic, auto-generated at issue time**

These will be filled automatically from booking, participant, class session, tutor, and system data (in a later step when generation is wired to templates):

- `{participant_name}` – from participant model (e.g. `full_name`).
- `{participant_identity_no}` – from participant model (e.g. `nric_passport`), **not masked** on the certificate.
- `{program_name}` – from the program attached to the class session.
- `{attendance_date}` – from the class session date (e.g. `starts_at`).
- `{completion_status}` – derived from business rules (e.g. attended & passed).
- `{tutor_name}` – from the tutor assigned to the class session.
- `{tutor_registration_number}` – from `tutors.registration_number`.
- `{issue_date}` – from `certificates.issued_at`.
- `{certificate_no}` – from `certificates.certificate_number`.
- `{verification_url}` – constructed from `config('app.url')` + verification path/token.

**Static, template-managed**

These are managed inside each certificate template row and are not computed from bookings:

- `{organization_name}` – backed by `certificate_templates.organization_name`.
- `{organization_registration_no}` – backed by `certificate_templates.organization_registration_no`.

Admins can also manage static wording and layout via:

- `subtitle`, `body_content`, `footer_text`
- `organization_details`
- logo/background/signature images
- layout/typography/alignment/visibility fields added in step 1.

---

## Full NRIC / Passport on certificate

- The placeholder `{participant_identity_no}` is explicitly defined to use the **full** NRIC or Passport ID (no masking).
- Verification APIs and public verification pages may continue to show masked IDs, but the **certificate PDF itself** will use the full identity string when this placeholder is present.
- It is the template author’s responsibility to decide whether to include `{participant_identity_no}` in `body_content` or `footer_text`.

---

## Template fields vs product requirements

The product requirements for static template-managed data are:

- Certificate title / subtitle / body / footer wording.
- Company/academy name.
- Company registration number.
- Company details/address.
- Logo.
- Signature blocks.

These are supported by the following `certificate_templates` columns (after step 1 and this step):

| Requirement | Column(s) |
|------------|-----------|
| Certificate title | `name` (template name, used as title), `subtitle` |
| Main body wording | `body_content` (with placeholders) |
| Footer text | `footer_text` (with placeholders) |
| Company / academy name | `organization_name` |
| Company registration number | `organization_registration_no` (added in this step) |
| Company details / address | `organization_details` |
| Logo | `logo_path` (+ `show_logo`) |
| Signature blocks | `left_signatory_*`, `right_signatory_*`, `left_signature_image_path`, `right_signature_image_path`, visibility toggles |

Only **`organization_registration_no`** was missing and is now added via a backward-safe migration.

---

## Migrations in this step

**File:** `database/migrations/2026_03_30_000000_add_organization_registration_no_to_certificate_templates.php`

- Adds `organization_registration_no` (string, nullable) to `certificate_templates`, placed after `organization_name`.
- Down method drops the column only.
- No existing data is modified.

---

## Backward compatibility

- The placeholder expansion is purely **additive**; existing templates are unaffected until they start using the new placeholders.
- The new DB column `organization_registration_no` is **nullable** and has no default; existing rows remain valid.
- The `CertificateTemplate` model now includes `organization_registration_no` in `$fillable`; no behaviour changes unless admins edit templates.
- PDF generation still uses the old Blade view and does **not** read from `certificate_templates` yet.

---

## What’s next (future steps)

Not part of this step, but planned directions:

1. Wire certificate issuance and reissue flows to:
   - Create new `Certificate` with new `certificate_number` and `verification_token` on reissue.
   - Mark old certificates revoked, retaining history.
   - Capture `certificate_template_id` and snapshots when issuing.
2. Switch `CertificatePdfService` to:
   - Load the active `CertificateTemplate`.
   - Apply placeholders using the contract defined here.
   - Render the layout using the template-controlled assets and typography.
3. Carefully update verification pages and download endpoints to respect the new snapshot logic while keeping old certificates valid.

For now, this step only locks down the placeholder contract and data shape; the runtime behaviour remains on the existing Blade-based implementation.

