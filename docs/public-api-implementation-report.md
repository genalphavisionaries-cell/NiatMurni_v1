# Public API Implementation Report

## Implemented Endpoints

Public endpoints added in Laravel API:

- `GET /api/public/classes/upcoming`
- `GET /api/public/classes/{id}`
- `GET /api/public/bookings/{id}`

Controller created:

- `apps/admin-laravel/app/Http/Controllers/Api/PublicController.php`

Routes registered:

- `apps/admin-laravel/routes/api.php`

## Models Used

- `App\Models\ClassSession`
- `App\Models\Program` (via `ClassSession->program`)
- `App\Models\Booking`
- `App\Models\Participant` (via `Booking->participant`)
- `App\Models\Tutor` + `App\Models\User` (via `ClassSession->tutor->user`)

## Response Fields Returned

### 1) `GET /api/public/classes/upcoming`

Returns:

```json
{
  "data": [
    {
      "id": 1,
      "program_id": 2,
      "program_name": "Program Name",
      "title": "Program Name",
      "trainer_name": "Tutor Name",
      "starts_at": "2026-04-01T09:00:00+00:00",
      "ends_at": "2026-04-01T17:00:00+00:00",
      "mode": "online",
      "language": "English",
      "venue": "HQ",
      "location": "Kuala Lumpur",
      "capacity": 30,
      "available_slots": 12,
      "min_threshold": 60,
      "status": "scheduled",
      "zoom_join_url": null,
      "price": "120.00",
      "price_cents": 12000
    }
  ]
}
```

Filtering:
- future sessions (`starts_at >= now`)
- session status in: `scheduled`, `confirmed`, `ongoing`, `in_progress`
- program must be active (`programs.is_active = true`)

### 2) `GET /api/public/classes/{id}`

Returns:
- class + session data
- tutor summary (if exists)
- pricing (program price and session price_cents)

Response shape:

```json
{
  "data": {
    "id": 1,
    "program_id": 2,
    "program_name": "Program Name",
    "title": "Program Name",
    "description": "Program description",
    "trainer_name": "Tutor Name",
    "starts_at": "2026-04-01T09:00:00+00:00",
    "ends_at": "2026-04-01T17:00:00+00:00",
    "mode": "online",
    "language": "English",
    "venue": "HQ",
    "location": "Kuala Lumpur",
    "capacity": 30,
    "available_slots": 12,
    "min_threshold": 60,
    "status": "scheduled",
    "zoom_join_url": null,
    "price": "120.00",
    "price_cents": 12000,
    "tutor": {
      "id": 4,
      "name": "Tutor Name"
    }
  }
}
```

### 3) `GET /api/public/bookings/{id}`

Returns:
- booking status + payment status
- participant safe summary
- class/session summary

Response shape:

```json
{
  "data": {
    "id": 10,
    "status": "pending",
    "payment_status": "unpaid",
    "paid_at": null,
    "created_at": "2026-03-23T12:00:00+00:00",
    "updated_at": "2026-03-23T12:00:00+00:00",
    "participant": {
      "id": 77,
      "full_name": "Participant Name",
      "email": "participant@example.com",
      "phone": "0123456789"
    },
    "class_session": {
      "id": 1,
      "program_id": 2,
      "program_name": "Program Name",
      "starts_at": "2026-04-01T09:00:00+00:00",
      "ends_at": "2026-04-01T17:00:00+00:00",
      "mode": "online",
      "language": "English",
      "venue": "HQ",
      "location": "Kuala Lumpur",
      "trainer_name": "Tutor Name",
      "price": "120.00",
      "price_cents": 12000
    },
    "class_session_id": 1
  }
}
```

## Safety Notes

- Endpoints are public (no auth) as requested.
- Internal admin-only data is not returned.
- Sensitive fields excluded (e.g. participant NRIC/passport, Stripe internal IDs, tutor banking fields).
- Not found handling:
  - class not found -> `404 { "message": "Class not found" }`
  - booking not found -> `404 { "message": "Booking not found" }`

## Assumptions

- Public frontend needs class/session IDs to continue booking/detail flows.
- `min_threshold_minutes` is mapped to `min_threshold` for frontend compatibility.
- Session status values can vary across legacy/current data; allowed "active/upcoming-like" values are accepted.

## Missing Relationships / Caveats

- Existing admin controllers refer to `trainer` while schema migrated to `tutor`; public controller uses `tutor->user` directly to avoid architectural change.
- `available_slots` is calculated from booking count excluding `cancelled`; reservation holds are not subtracted in this minimal version.
