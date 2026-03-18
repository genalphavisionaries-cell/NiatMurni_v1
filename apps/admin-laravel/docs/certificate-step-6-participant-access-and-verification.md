# Certificate Step 6: Participant certificate access and verification alignment

This document describes participant-facing certificate access and the aligned verification page/API contract.

---

## 1. Where participant accesses certificates

- **Participant portal (Next.js):** `apps/web`
  - **Certificates page:** `/participant/certificates`
  - **Login page:** `/participant/login` (for participants who have a linked user account)
- **Sidebar:** Participant dashboard already had a “Certificates” link to `/participant/certificates`; the page now loads the certificate list from the Laravel API when the participant is logged in.

Participant certificate **download** reuses the existing public endpoint:  
`GET /api/certificate/download/{token}`  
The participant certificates API returns a `download_url` for each certificate (full URL to this endpoint with the certificate’s `verification_token`). Clicking “Download PDF” opens that URL and the browser receives the PDF.

---

## 2. Valid vs revoked certificates

- **Participant certificate list:** Only **valid** (non-revoked) certificates are shown.  
  The backend uses the `Booking::certificate()` relation, which is defined as the single active certificate per booking (`status != 'revoked'`, latest by id). So:
  - Revoked certificates never appear in the participant’s list.
  - If a certificate was reissued, the booking’s `certificate()` relation is the new one; the participant sees and downloads only the current valid certificate.
- **Verification page/API:** For a given verification token, the certificate is always looked up and returned. The response includes `status: 'valid'` or `status: 'revoked'`. The verification page shows a clear “VALID” or “REVOKED” state and, when revoked, shows revoked date and reason (if present).
- **Download:** The public download endpoint serves the PDF for any certificate (including revoked) by token. In the participant portal, only valid certificates are listed and linked, so participants do not get a link to download a revoked certificate from the UI. If someone keeps an old link to a revoked cert, they can still download the historical PDF (no change to existing behaviour).

---

## 3. Verification page/API fields

Verification data is built in `CertificateVerificationService::verifyByToken()` and used by:

- **Web verification page:** `GET /certificate/verify/{token}` (Laravel view)
- **JSON API:** `GET /api/certificate/verify/{token}`

Both use the same service and expose the same contract. The verification response includes:

| Field | Description |
|-------|-------------|
| `certificate_number` | Certificate number (e.g. NM-2026-0001) |
| `participant_name` | Participant full name |
| `participant_identity_no` | NRIC / Passport (full) |
| `program_name` | Program name |
| `attendance_date` | Attendance/session date (Y-m-d) |
| `completion_status` | e.g. "Attended & Passed" |
| `tutor_name` | Tutor/user name |
| `tutor_registration_number` | Tutor registration number |
| `issue_date` | Formatted issue date (e.g. d F Y) |
| `issued_at` | ISO 8601 issued_at |
| `status` | `'valid'` or `'revoked'` |
| `revoked_at` | ISO 8601 if revoked |
| `revoked_reason` | Reason if stored (nullable) |

The Blade view `resources/views/certificate/verify.blade.php` shows these fields and clearly distinguishes valid vs revoked (badge, message, revoked date/reason).

---

## 4. Revoked certificate behaviour summary

- **Verification:** Revoked certificates still resolve by token. The page shows “Certificate Revoked”, a REVOKED badge, and optional revoked date/reason. The same data is returned by the verification API with `status: 'revoked'`.
- **Participant portal:** Revoked certificates are not shown in the participant certificate list. Only the current valid certificate per booking (if any) is listed and downloadable.
- **Reissue:** After a reissue, the booking’s active certificate is the new one. The participant sees and downloads only the new certificate; the old one remains revoked and is not offered in the portal.

---

## 5. Participant auth and portal assumptions

- **Participant = User with role `participant`:** Only users with `role === 'participant'` can use participant login. Other roles (e.g. admin, tutor) cannot use the participant login endpoint.
- **Participant linked to User:** A `Participant` record must have `user_id` set to the authenticating user. Login uses `User` (email/password); the backend resolves `Participant` via `Participant::where('user_id', $user->id)->first()`. If no participant is linked, login returns an error.
- **Linking participants to users:** The codebase does not auto-create a user when a participant registers for a class. To give a participant portal access, an admin (or a separate process) must create a `User` with `role = 'participant'` and set `Participant.user_id` to that user (e.g. after registration or via Filament). This step is outside the scope of Step 6.
- **Cookies:** Participant login sets `participant_token` (Sanctum token, HttpOnly) and `participant_session` (non-HttpOnly flag) so the Next.js app can send authenticated requests and, if desired, show “logged in” state. The existing `SanctumTokenFromCookie` middleware was extended to inject the Bearer token from either `admin_token` or `participant_token`.
- **Middleware:** `apps/web/middleware.ts` was **not** changed. Participant routes are not protected by middleware in this step; the certificates page simply shows “Log in to view your certificates” when the API returns 401.

---

## 6. Files changed/created

**Laravel (apps/admin-laravel):**

- `app/Services/CertificateVerificationService.php` – Extended to return full verification contract (participant identity, program, attendance date, completion status, tutor name/registration, issue date, status, revoked_at, revoked_reason).
- `app/Http/Controllers/CertificateVerifyController.php` – Now uses `CertificateVerificationService`, lookup by `verification_token` (not `qr_token`), returns full contract.
- `app/Http/Controllers/Api/ParticipantAuthController.php` – **New.** Participant login, logout, me (cookie-based, same pattern as admin).
- `app/Http/Controllers/Api/ParticipantCertificatesController.php` – **New.** GET certificates for authenticated participant (valid only), with download_url.
- `app/Http/Middleware/SanctumTokenFromCookie.php` – Supports both `admin_token` and `participant_token` cookies.
- `resources/views/certificate/verify.blade.php` – Shows full verification fields and clear valid/revoked state.
- `routes/api.php` – Participant auth and certificate routes added.
- `docs/certificate-step-6-participant-access-and-verification.md` – This file.

**Next.js (apps/web):**

- `lib/participant-api.ts` – **New.** Client for participant login, logout, me, and certificates.
- `app/participant/certificates/page.tsx` – Uses new certificates client; copy updated.
- `app/participant/certificates/CertificatesClient.tsx` – **New.** Fetches certificates, shows table with download link or “Log in” when 401.
- `app/participant/login/page.tsx` – **New.** Participant login form (email/password), redirects to certificates or `redirect` param.

---

## 7. Local commands to run

```bash
# Laravel
cd apps/admin-laravel
composer install
php artisan route:list

# Next.js (participant portal)
cd apps/web
npm install
npm run dev
```

To test participant login, ensure a `User` exists with `role = 'participant'` and a `Participant` has `user_id` set to that user. No new Artisan command was added for this; use tinker or Filament to link a participant to a user.

---

## 8. What to test before production

1. **Verification**
   - Open `/certificate/verify/{valid_token}` (and `/api/certificate/verify/{valid_token}`) and confirm all fields (name, NRIC/Passport, program, attendance date, completion status, tutor name/registration, certificate number, issue date, status valid).
   - Open `/certificate/verify/{revoked_token}` and confirm REVOKED badge, message, and optional revoked date/reason.

2. **Participant certificates (logged out)**
   - Visit `/participant/certificates` and confirm “Log in to view and download your certificates” and the login link.

3. **Participant login**
   - Create a User (participant role) and link a Participant (user_id). Log in at `/participant/login`. Confirm redirect to certificates (or redirect param).

4. **Participant certificates (logged in)**
   - With a participant that has at least one booking with an active certificate, confirm the list shows certificate number, program, issue date, and “Download PDF”. Click and confirm the PDF downloads. Revoked certificates must not appear.

5. **Reissue**
   - Revoke a certificate, reissue for the same booking. Log in as that participant and confirm only the new certificate appears and downloads.

6. **No routing/domain/path changes**
   - Confirm no changes to `apps/web/middleware.ts`, and that existing routes (e.g. `/certificate/verify/{token}`, `/api/certificate/download/{token}`) are unchanged.
