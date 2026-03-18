# Certificate Step 7: Participant account linking and access hardening

This document describes how participant portal access is linked to participant records and how admins grant or reset it.

---

## 1. How participant portal access works

- Participants access the portal at **/participant** (Next.js): certificates, profile, etc.
- Login is at **/participant/login** (email + password). The backend authenticates a **User** with `role = 'participant'` and resolves the **Participant** via `Participant.user_id`.
- So portal access requires:
  1. A **User** with `role = 'participant'` and a valid email/password.
  2. A **Participant** with `user_id` set to that User.

Only one of these needs to be created per participant; the link is `Participant.user_id` → `User.id`.

---

## 2. How participant and user are linked

- **Participant** has nullable `user_id` (FK to `users.id`). When set, that participant can log in as that user.
- **User** has `participants()` (HasMany); one user can be linked to multiple participant records (e.g. same person, multiple bookings). The participant portal uses the first linked participant for certificate listing.
- **Linking is manual** in normal operation: participants created by public registration (e.g. `RegisterForClassController`) do **not** get a User or `user_id`; they only get a Participant row with optional email. An admin (or process) must explicitly create/link portal access.

---

## 3. Model/linkage assumptions (from codebase review)

- **Participant creation:** Public registration (`POST /api/register`) uses `Participant::firstOrCreate` by `nric_passport` and sets `full_name`, `phone`, `email`, `employer_id`. It **never** sets `user_id`, so `user_id` is usually **null** for participants created by registration.
- **Participant email:** Stored on `participants.email` (nullable). Required for creating portal access because the login identifier is the User’s email; we use the participant’s email when creating the User.
- **User table:** `email` is unique. So we cannot create a second User with the same email. If a User already exists with that email and `role = 'participant'`, we link the participant to that User instead of creating a duplicate.
- **User roles:** Allowed values include `admin`, `tutor`, `staff`, `participant`. Only `participant` can use the participant portal login.

---

## 4. Where admin can see participant access status

- **Participants (Filament → Catalog → Participants):**
  - **Portal access** column: badge “No” (gray) or “Linked (email)” (success). Shows at a glance whether the participant has a linked user and that user’s email.
  - **Filter “Portal linked”:** Yes / No to list only linked or only unlinked participants.
- **Participant edit form:** The `user_id` select is restricted to users with `role = 'participant'` and has helper text pointing to the “Create portal access” action.
- **Bookings (Filament → Operations → Bookings):**
  - **Portal** column: badge “Yes” (success) or “—” (gray) based on `participant.user_id`, so admins can see whether the booking’s participant has portal access without opening the participant.

---

## 5. How admin creates/links participant login

- **Action:** On the Participants table, use **“Create portal access”** (key icon, green).
- **Behavior:**
  - If the participant **already has** `user_id`: shows a success notification that they are already linked (no change).
  - If the participant **has no email**: shows an error asking to set the participant’s email first.
  - If the participant **has email** and a User with that email **already exists**:
    - If that User has `role = 'participant'`: the participant is linked to that User (`user_id` set); no new User created.
    - If that User has another role (e.g. admin/tutor): shows an error; no link created.
  - If the participant **has email** and **no** User with that email exists: creates a new User (`name` = participant’s full name, `email` = participant’s email, `role = 'participant'`, random password), sets `Participant.user_id`, and shows a **temporary password** in the success notification. Admin copies and shares it with the participant.
- **Confirmation modal** explains what will happen (e.g. temporary password will be shown once).

---

## 6. How password/access is handled

- **New portal access:** When a new User is created, the password is a **random 12-character string** (e.g. `Str::random(12)`). It is shown **once** in the Filament success notification. The admin must copy it and share it with the participant (e.g. secure channel). No email is sent by the system.
- **Reset password:** For participants who already have a linked User, the **“Reset portal password”** action (arrow-path icon, warning) generates a new random password, updates the User, and shows it once in the notification. Admin shares it with the participant.
- **No automated email:** There is no “forgot password” or “send password by email” flow in this step. Operations are manual and admin-driven to keep the implementation simple and maintainable.

---

## 7. Limitations

- **Participant must have an email:** Portal access cannot be created if `participants.email` is null or invalid. Admin must set a valid email first.
- **Email uniqueness:** If the email is already used by a non-participant User (e.g. admin), we do not overwrite or link; admin must use a different participant email or resolve the conflict elsewhere.
- **One-time display of passwords:** Temporary and reset passwords are shown only in the Filament notification. If the admin misses copying it, they must use “Reset portal password” to generate a new one.
- **No self-service:** Participants cannot self-register for portal access or reset their own password via the app in this step; all access is granted or reset by admin.

---

## 8. Files changed/created

- **New:** `app/Services/ParticipantPortalAccessService.php` – createOrLinkAccess(), resetPassword().
- **Updated:** `app/Filament/Resources/ParticipantResource.php` – Portal access column, “Portal linked” filter, “Create portal access” and “Reset portal password” actions, `user_id` select limited to participant users with helper text.
- **Updated:** `app/Filament/Resources/BookingResource.php` – “Portal” column indicating whether the booking’s participant has a linked user.
- **New:** `docs/certificate-step-7-participant-access-linking.md` – this file.

---

## 9. Commands to run locally

```bash
cd apps/admin-laravel
composer install
php artisan route:list
```

No new routes or migrations; no new Artisan commands.

---

## 10. What to test before production

1. **Participants list:** Confirm “Portal access” column shows “No” or “Linked (email)” and “Portal linked” filter works.
2. **Create portal access (no email):** Participant with no email → run action → expect error “Participant must have an email…”
3. **Create portal access (with email):** Participant with email, no linked user → run action → confirm User created, participant linked, temporary password in notification; log in at /participant/login with that email and password.
4. **Create portal access (already linked):** Participant with user_id set → run action → confirm “already linked” message, no duplicate user.
5. **Create portal access (existing participant user):** Second participant with same email as an existing participant User → run action → confirm link to existing user, no duplicate.
6. **Reset portal password:** Linked participant → run “Reset portal password” → confirm new password in notification; log in at /participant/login with new password.
7. **Bookings list:** Confirm “Portal” column shows Yes/— for participant portal access.
8. **Edit participant:** Confirm `user_id` dropdown only lists users with role=participant.
