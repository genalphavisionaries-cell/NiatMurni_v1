# Event Catalog (n8n)

## Naming
Use dot-separated event names.

## Core Events
- booking.created
- reservation.created
- booking.paid
- verification.submitted
- verification.approved
- verification.rejected
- questionnaire.opened
- questionnaire.submitted
- class.completed
- admin.completion_pushed
- certificate.issued
- certificate.revoked
- shipment.posted
- shipment.tracking.updated

## Payload & Idempotency
Each event MUST include:
- event_id (UUID)
- event_name
- occurred_at (ISO8601)
- source (service)
- entity_type + entity_id
- payload (object)
- idempotency_key (string)
