package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niatmurni/core-go/internal/repository"
)

// BookingsHandler handles booking endpoints.
type BookingsHandler struct {
	Pool *pgxpool.Pool
}

// CreateBookingRequest is the JSON body for POST /bookings.
type CreateBookingRequest struct {
	ParticipantID   int64 `json:"participant_id"`
	ClassSessionID  int64 `json:"class_session_id"`
}

// Create handles POST /bookings - creates a booking with status pending.
func (h *BookingsHandler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Header.Get("Content-Type") != "application/json" && r.Header.Get("Content-Type") != "" {
		respondErr(w, http.StatusUnsupportedMediaType, "invalid_content_type", "expect application/json")
		return
	}
	var req CreateBookingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondErr(w, http.StatusBadRequest, "invalid_body", err.Error())
		return
	}
	if req.ParticipantID <= 0 || req.ClassSessionID <= 0 {
		respondErr(w, http.StatusBadRequest, "invalid_input", "participant_id and class_session_id required and must be positive")
		return
	}

	// Verify participant and class exist (optional but good)
	participant, err := repository.GetParticipantByID(r.Context(), h.Pool, req.ParticipantID)
	if err != nil {
		respondErr(w, http.StatusInternalServerError, "lookup_failed", err.Error())
		return
	}
	if participant == nil {
		respondErr(w, http.StatusBadRequest, "invalid_participant", "participant not found")
		return
	}
	class, err := repository.GetClassByID(r.Context(), h.Pool, req.ClassSessionID)
	if err != nil {
		respondErr(w, http.StatusInternalServerError, "lookup_failed", err.Error())
		return
	}
	if class == nil {
		respondErr(w, http.StatusBadRequest, "invalid_class", "class_session not found")
		return
	}

	id, err := repository.CreateBooking(r.Context(), h.Pool, req.ParticipantID, req.ClassSessionID)
	if err != nil {
		respondErr(w, http.StatusConflict, "create_booking_failed", err.Error()) // e.g. unique violation
		return
	}

	booking, _ := repository.GetBookingByID(r.Context(), h.Pool, id)
	respondJSON(w, http.StatusCreated, map[string]interface{}{
		"booking": booking,
		"id":     id,
	})
}

// GetStatus handles GET /bookings/{id} - returns booking status (and full booking for convenience).
func (h *BookingsHandler) GetStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || id <= 0 {
		respondErr(w, http.StatusBadRequest, "invalid_id", "booking id must be a positive integer")
		return
	}
	booking, err := repository.GetBookingByID(r.Context(), h.Pool, id)
	if err != nil {
		respondErr(w, http.StatusInternalServerError, "get_booking_failed", err.Error())
		return
	}
	if booking == nil {
		respondErr(w, http.StatusNotFound, "not_found", "booking not found")
		return
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status":  booking.Status,
		"booking": booking,
	})
}
