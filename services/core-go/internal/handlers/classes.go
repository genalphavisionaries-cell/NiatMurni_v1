package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niatmurni/core-go/internal/repository"
)

// ClassesHandler handles class-related endpoints.
type ClassesHandler struct {
	Pool *pgxpool.Pool
}

// ListUpcoming handles GET /public/classes/upcoming with optional query params: from_date, to_date, mode, language.
func (h *ClassesHandler) ListUpcoming(w http.ResponseWriter, r *http.Request) {
	filter := repository.ListClassesFilter{
		FromDate:  r.URL.Query().Get("from_date"),
		ToDate:    r.URL.Query().Get("to_date"),
		Mode:      r.URL.Query().Get("mode"),
		Language:  r.URL.Query().Get("language"),
	}
	list, err := repository.ListUpcomingClasses(r.Context(), h.Pool, filter)
	if err != nil {
		respondErr(w, http.StatusInternalServerError, "list_classes_failed", err.Error())
		return
	}
	if list == nil {
		list = []repository.ClassRow{}
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{"classes": list})
}

// GetByID handles GET /classes/{id}.
func (h *ClassesHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || id <= 0 {
		respondErr(w, http.StatusBadRequest, "invalid_id", "class id must be a positive integer")
		return
	}
	class, err := repository.GetClassByID(r.Context(), h.Pool, id)
	if err != nil {
		respondErr(w, http.StatusInternalServerError, "get_class_failed", err.Error())
		return
	}
	if class == nil {
		respondErr(w, http.StatusNotFound, "not_found", "class not found")
		return
	}
	respondJSON(w, http.StatusOK, class)
}

func respondJSON(w http.ResponseWriter, code int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(data)
}

func respondErr(w http.ResponseWriter, code int, codeStr, message string) {
	respondJSON(w, code, map[string]string{"error": codeStr, "message": message})
}
