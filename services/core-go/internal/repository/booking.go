package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// BookingRow represents a booking for API responses.
type BookingRow struct {
	ID                  int64      `json:"id"`
	ParticipantID        int64      `json:"participant_id"`
	ClassSessionID      int64      `json:"class_session_id"`
	Status              string     `json:"status"`
	StripePaymentIntent *string    `json:"stripe_payment_intent_id,omitempty"`
	StripeInvoiceID     *string    `json:"stripe_invoice_id,omitempty"`
	PaidAt              *time.Time `json:"paid_at,omitempty"`
	VerifiedAt          *time.Time `json:"verified_at,omitempty"`
	CompletedAt         *time.Time `json:"completed_at,omitempty"`
	CertifiedAt         *time.Time `json:"certified_at,omitempty"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}

// CreateBooking creates a new booking with status pending. Returns the new booking ID.
// Participant and class_session must exist. Unique (participant_id, class_session_id) is enforced by DB.
func CreateBooking(ctx context.Context, pool *pgxpool.Pool, participantID, classSessionID int64) (int64, error) {
	q := `
		INSERT INTO bookings (participant_id, class_session_id, status)
		VALUES ($1, $2, 'pending')
		RETURNING id
	`
	var id int64
	err := pool.QueryRow(ctx, q, participantID, classSessionID).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

// GetBookingByID returns a booking by ID or nil if not found.
func GetBookingByID(ctx context.Context, pool *pgxpool.Pool, id int64) (*BookingRow, error) {
	q := `
		SELECT id, participant_id, class_session_id, status,
		       stripe_payment_intent_id, stripe_invoice_id,
		       paid_at, verified_at, completed_at, certified_at, created_at, updated_at
		FROM bookings WHERE id = $1
	`
	var b BookingRow
	var paidAt, verifiedAt, completedAt, certifiedAt *time.Time
	err := pool.QueryRow(ctx, q, id).Scan(
		&b.ID, &b.ParticipantID, &b.ClassSessionID, &b.Status,
		&b.StripePaymentIntent, &b.StripeInvoiceID,
		&paidAt, &verifiedAt, &completedAt, &certifiedAt,
		&b.CreatedAt, &b.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	b.PaidAt = paidAt
	b.VerifiedAt = verifiedAt
	b.CompletedAt = completedAt
	b.CertifiedAt = certifiedAt
	return &b, nil
}

// GetBookingStatus returns current status for a booking (for state machine checks).
func GetBookingStatus(ctx context.Context, pool *pgxpool.Pool, id int64) (string, error) {
	q := `SELECT status FROM bookings WHERE id = $1`
	var status string
	err := pool.QueryRow(ctx, q, id).Scan(&status)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil
		}
		return "", err
	}
	return status, nil
}

// SetBookingStatus updates booking status. Caller must ensure transition is allowed or admin override exists.
func SetBookingStatus(ctx context.Context, pool *pgxpool.Pool, id int64, status string) error {
	q := `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2`
	_, err := pool.Exec(ctx, q, status, id)
	return err
}
