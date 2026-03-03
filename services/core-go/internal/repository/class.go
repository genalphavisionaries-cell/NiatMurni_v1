package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ClassRow represents a class session for API responses.
type ClassRow struct {
	ID           int64      `json:"id"`
	ProgramID    int64      `json:"program_id"`
	ProgramName  string     `json:"program_name"`
	TrainerID    *int64     `json:"trainer_id,omitempty"`
	TrainerName  string     `json:"trainer_name,omitempty"`
	StartsAt     time.Time  `json:"starts_at"`
	EndsAt       time.Time  `json:"ends_at"`
	Mode         string     `json:"mode"`
	Language     string     `json:"language,omitempty"`
	Venue        *string    `json:"venue,omitempty"`
	Capacity     int        `json:"capacity"`
	MinThreshold int        `json:"min_threshold"`
	Status       string     `json:"status"`
	ZoomJoinURL  *string    `json:"zoom_join_url,omitempty"`
}

// ListClassesFilter for GET /public/classes/upcoming.
type ListClassesFilter struct {
	FromDate string // optional date filter
	ToDate   string
	Mode     string // online | physical
	Language string
}

// ListUpcomingClasses returns upcoming class sessions with optional filters.
func ListUpcomingClasses(ctx context.Context, pool *pgxpool.Pool, filter ListClassesFilter) ([]ClassRow, error) {
	q := `
		SELECT cs.id, cs.program_id, p.name AS program_name, cs.trainer_id,
		       u.name AS trainer_name, cs.starts_at, cs.ends_at, cs.mode, cs.language,
		       cs.venue, cs.capacity, cs.min_threshold, cs.status, cs.zoom_join_url
		FROM class_sessions cs
		JOIN programs p ON p.id = cs.program_id
		LEFT JOIN users u ON u.id = cs.trainer_id
		WHERE cs.starts_at > NOW() AND cs.status IN ('draft','confirmed')
	`
	args := []interface{}{}
	n := 1
	if filter.FromDate != "" {
		q += fmt.Sprintf(" AND cs.starts_at >= $%d", n)
		args = append(args, filter.FromDate)
		n++
	}
	if filter.ToDate != "" {
		q += fmt.Sprintf(" AND cs.starts_at <= $%d", n)
		args = append(args, filter.ToDate)
		n++
	}
	if filter.Mode != "" {
		q += fmt.Sprintf(" AND cs.mode = $%d", n)
		args = append(args, filter.Mode)
		n++
	}
	if filter.Language != "" {
		q += fmt.Sprintf(" AND cs.language = $%d", n)
		args = append(args, filter.Language)
		n++
	}
	q += " ORDER BY cs.starts_at LIMIT 50"

	rows, err := pool.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []ClassRow
	for rows.Next() {
		var c ClassRow
		var trainerID *int64
		var trainerName *string
		var venue *string
		var zoomURL *string
		var lang *string
		err := rows.Scan(&c.ID, &c.ProgramID, &c.ProgramName, &trainerID, &trainerName,
			&c.StartsAt, &c.EndsAt, &c.Mode, &lang, &venue, &c.Capacity, &c.MinThreshold,
			&c.Status, &zoomURL)
		if err != nil {
			return nil, err
		}
		c.TrainerID = trainerID
		if trainerName != nil {
			c.TrainerName = *trainerName
		}
		if venue != nil {
			c.Venue = venue
		}
		if zoomURL != nil {
			c.ZoomJoinURL = zoomURL
		}
		if lang != nil {
			c.Language = *lang
		}
		list = append(list, c)
	}
	return list, rows.Err()
}

// GetClassByID returns a single class session by ID or nil if not found.
func GetClassByID(ctx context.Context, pool *pgxpool.Pool, id int64) (*ClassRow, error) {
	q := `
		SELECT cs.id, cs.program_id, p.name AS program_name, cs.trainer_id,
		       u.name AS trainer_name, cs.starts_at, cs.ends_at, cs.mode, cs.language,
		       cs.venue, cs.capacity, cs.min_threshold, cs.status, cs.zoom_join_url
		FROM class_sessions cs
		JOIN programs p ON p.id = cs.program_id
		LEFT JOIN users u ON u.id = cs.trainer_id
		WHERE cs.id = $1
	`
	var c ClassRow
	var trainerID *int64
	var trainerName *string
	var venue *string
	var zoomURL *string
	var lang *string
	err := pool.QueryRow(ctx, q, id).Scan(&c.ID, &c.ProgramID, &c.ProgramName, &trainerID, &trainerName,
		&c.StartsAt, &c.EndsAt, &c.Mode, &lang, &venue, &c.Capacity, &c.MinThreshold,
		&c.Status, &zoomURL)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	c.TrainerID = trainerID
	if trainerName != nil {
		c.TrainerName = *trainerName
	}
	if venue != nil {
		c.Venue = venue
	}
	if zoomURL != nil {
		c.ZoomJoinURL = zoomURL
	}
	if lang != nil {
		c.Language = *lang
	}
	return &c, nil
}
