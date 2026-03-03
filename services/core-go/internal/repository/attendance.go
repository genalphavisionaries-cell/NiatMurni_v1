package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// GetTotalAttendanceSeconds returns the sum of duration_seconds for the booking's attendance records.
// If no records or null duration, returns 0.
func GetTotalAttendanceSeconds(ctx context.Context, pool *pgxpool.Pool, bookingID int64) (int, error) {
	q := `SELECT COALESCE(SUM(duration_seconds), 0)::int FROM attendance_records WHERE booking_id = $1`
	var total int
	err := pool.QueryRow(ctx, q, bookingID).Scan(&total)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, nil
		}
		return 0, err
	}
	return total, nil
}

// GetClassMinThresholdForBooking returns the class_sessions.min_threshold (minutes) for the given booking.
func GetClassMinThresholdForBooking(ctx context.Context, pool *pgxpool.Pool, bookingID int64) (int, error) {
	q := `SELECT cs.min_threshold FROM bookings b JOIN class_sessions cs ON cs.id = b.class_session_id WHERE b.id = $1`
	var threshold int
	err := pool.QueryRow(ctx, q, bookingID).Scan(&threshold)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, nil
		}
		return 0, err
	}
	return threshold, nil
}
