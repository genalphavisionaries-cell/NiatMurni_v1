# Status Enums

Canonical values; Laravel migrations and Go API use these same strings.

## BookingStatus (bookings.status)
- pending
- reserved
- paid
- verified
- completed
- certified
- cancelled
- transferred

## VerificationStatus
- pending
- approved
- rejected
- overridden

## ClassStatus
- draft
- confirmed
- ongoing
- completed
- cancelled
- archived

## CertificateStatus
- valid
- revoked

## ShipmentStatus
- pending_print
- printed
- posted
- tracking_assigned
- delivered
- closed
