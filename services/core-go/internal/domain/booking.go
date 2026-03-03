package domain

// BookingStatus represents the booking lifecycle state (matches Laravel migrations).
const (
	BookingPending    = "pending"
	BookingReserved   = "reserved"
	BookingPaid      = "paid"
	BookingVerified   = "verified"
	BookingCompleted  = "completed"
	BookingCertified  = "certified"
	BookingCancelled  = "cancelled"
	BookingTransferred = "transferred"
)

// AllowedTransitions defines valid booking status transitions.
// Admin override (with audit_log) can skip; Go enforces normal flow.
var AllowedTransitions = map[string][]string{
	BookingPending:    {BookingReserved, BookingCancelled},
	BookingReserved:   {BookingPaid, BookingPending, BookingCancelled},
	BookingPaid:       {BookingVerified, BookingCancelled},
	BookingVerified:   {BookingCompleted, BookingCancelled},
	BookingCompleted:  {BookingCertified},
	BookingCertified:  {}, // terminal
	BookingCancelled:  {},
	BookingTransferred: {},
}

// CanTransition returns true if transition from current to next is allowed without admin override.
func CanTransition(current, next string) bool {
	allowed, ok := AllowedTransitions[current]
	if !ok {
		return false
	}
	for _, s := range allowed {
		if s == next {
			return true
		}
	}
	return false
}

// CanCompleteBooking returns true if the booking can transition to "completed":
// verified -> completed is allowed and totalAttendanceSeconds >= minThresholdMinutes*60.
func CanCompleteBooking(totalAttendanceSeconds int, minThresholdMinutes int) bool {
	minSeconds := minThresholdMinutes * 60
	return totalAttendanceSeconds >= minSeconds
}
