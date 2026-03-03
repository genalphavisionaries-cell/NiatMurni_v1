# Database Schema Spec v1 — Gap Analysis

Reference: **NiatMurni_Complete_Database_Schema_Specification_v1.pdf**

This document compares the spec to the current Laravel migrations and lists additions/alignments.

---

## 1. Spec summary (from PDF)

| Table | Key spec details |
|-------|------------------|
| **users** | uuid PK; role enum: admin, **ops**, **finance**, trainer; **phone**; **is_active**; **last_login_at** |
| **employers** | uuid PK; **company_name**; **registration_no**; **billing_address**; **stripe_customer_id**; **status** (active, inactive) |
| **participants** | uuid PK; **nationality**; **date_of_birth**; **gender**; **is_blacklisted**; **deleted_at** (soft delete) |
| **programs** | uuid PK; **delivery_mode** (physical, online, hybrid); **duration_hours**; **price**; **is_active** |
| **class_sessions** | uuid PK; **class_date** + **start_time** + **end_time**; **location**; status: **scheduled**, ongoing, completed, archived |
| **bookings** | uuid PK; **booking_reference** (unique); **payment_status** (unpaid, paid, refunded, failed); **payment_amount**; **payment_method**; **booked_by_type** (individual, corporate, admin) |
| **attendance_records** | uuid PK; **check_in_time** / **check_out_time**; **attendance_duration_minutes**; **attendance_source** (physical, zoom); **verified_by** |
| **certificates** | uuid PK; **qr_code_token**; **generated_pdf_path**; no status column (revoked_at implies revoked) |
| **stripe_events** | **New table**: event_id (unique), event_type, payload (jsonb), processed, processed_at |
| **audit_logs** | uuid PK; **action_type**; entity_id as uuid |

---

## 2. Current vs spec (differences)

- **Primary keys**: Spec uses **UUID** for all tables; current schema uses **bigint auto-increment**. Aligning would require a migration strategy and code changes (Laravel + Go).
- **users**: Missing `phone`, `is_active`, `last_login_at`; role enum in spec includes **ops**, **finance**.
- **employers**: Current uses `name` → spec `company_name`; `ssm_reg_no` → spec `registration_no`; missing `billing_address`, `stripe_customer_id`, `status`.
- **participants**: Missing `nationality`, `date_of_birth`, `gender`, `is_blacklisted`, `deleted_at` (soft deletes).
- **programs**: Missing `delivery_mode`, `duration_hours`, `price`, `is_active`; current has `slug`, `default_capacity`, `min_threshold`.
- **class_sessions**: Current uses `starts_at`/`ends_at` (datetime); spec uses `class_date` + `start_time` + `end_time`. Current `venue` → spec `location`. Status enum differs (e.g. spec has **scheduled**, no **draft**/ **confirmed**).
- **bookings**: Missing `booking_reference`, `payment_status`, `payment_amount`, `payment_method`, `booked_by_type`; spec does not list `transferred` or timestamp columns like `paid_at`/`verified_at`.
- **attendance_records**: Current uses `check_in_at`/`check_out_at`, `duration_seconds`, `source`, `recorded_by`; spec uses `check_in_time`/`check_out_time`, `attendance_duration_minutes`, `attendance_source`, `verified_by`.
- **certificates**: Current `qr_token` → spec `qr_code_token`; missing `generated_pdf_path`; current has `status` and `revoked_by`.
- **stripe_events**: Not present in current schema; spec adds it for idempotency/audit.
- **audit_logs**: Current `action` → spec `action_type`; current has no `updated_at` (spec has `created_at` only in our impl); entity_id in spec is uuid.

---

## 3. Additive changes (implemented without breaking)

The following can be added or aligned without switching to UUIDs:

- **users**: Add `phone`, `is_active`, `last_login_at`; extend role enum in code to include ops, finance.
- **employers**: Add `billing_address`, `stripe_customer_id`, `status`; optionally add aliases/accessors for company_name (name) and registration_no (ssm_reg_no) in the model.
- **participants**: Add `nationality`, `date_of_birth`, `gender`, `is_blacklisted`, `deleted_at`.
- **programs**: Add `delivery_mode`, `duration_hours`, `price`, `is_active` (keep existing columns).
- **class_sessions**: Keep `starts_at`/`ends_at`; add `location` if desired (or keep `venue` as alias); align status values in code where needed.
- **bookings**: Add `booking_reference` (unique), `payment_status`, `payment_amount`, `payment_method`, `booked_by_type`.
- **attendance_records**: Add `attendance_duration_minutes` and/or keep `duration_seconds`; add `verified_by` (or keep `recorded_by`); align source enum with `attendance_source` in code.
- **certificates**: Add `generated_pdf_path`; in code treat `qr_token` as `qr_code_token` or add a column alias.
- **stripe_events**: New table per spec.

UUID migration (all PKs/FKs to uuid) is left for a separate decision and migration plan.
