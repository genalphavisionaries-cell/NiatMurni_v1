package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ParticipantRow for create response or lookup.
type ParticipantRow struct {
	ID        int64  `json:"id"`
	FullName  string `json:"full_name"`
	NRIC      string `json:"nric_passport"`
	Phone     string `json:"phone,omitempty"`
	Email     string `json:"email,omitempty"`
	EmployerID *int64 `json:"employer_id,omitempty"`
}

// GetParticipantByID returns a participant by ID or nil if not found.
func GetParticipantByID(ctx context.Context, pool *pgxpool.Pool, id int64) (*ParticipantRow, error) {
	q := `SELECT id, full_name, nric_passport, phone, email, employer_id FROM participants WHERE id = $1`
	var p ParticipantRow
	var phone, email *string
	var employerID *int64
	err := pool.QueryRow(ctx, q, id).Scan(&p.ID, &p.FullName, &p.NRIC, &phone, &email, &employerID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if phone != nil {
		p.Phone = *phone
	}
	if email != nil {
		p.Email = *email
	}
	p.EmployerID = employerID
	return &p, nil
}
