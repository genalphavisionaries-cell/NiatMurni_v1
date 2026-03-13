package server

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niatmurni/core-go/internal/handlers"
)

// Server wraps the HTTP server and router.
type Server struct {
	addr   string
	router *mux.Router
	http   *http.Server
}

// New builds a new Server with routes registered. Listen address is addr (e.g. ":8080").
// pool is used for class and booking endpoints.
func New(addr string, pool *pgxpool.Pool) *Server {
	r := mux.NewRouter()
	r.HandleFunc("/healthz", handleHealthz).Methods(http.MethodGet)

	classes := &handlers.ClassesHandler{Pool: pool}
	bookings := &handlers.BookingsHandler{Pool: pool}

	r.HandleFunc("/public/classes/upcoming", classes.ListUpcoming).Methods(http.MethodGet)
	r.HandleFunc("/classes/upcoming", classes.ListUpcoming).Methods(http.MethodGet)
	r.HandleFunc("/classes/{id}", classes.GetByID).Methods(http.MethodGet)
	r.HandleFunc("/bookings", bookings.Create).Methods(http.MethodPost)
	r.HandleFunc("/bookings/{id}", bookings.GetStatus).Methods(http.MethodGet)
	r.HandleFunc("/bookings/{id}/status", bookings.UpdateStatus).Methods(http.MethodPatch, http.MethodPut)

	s := &Server{
		addr:   addr,
		router: r,
		http: &http.Server{
			Addr:         addr,
			Handler:      r,
			ReadTimeout:  15 * time.Second,
			WriteTimeout: 15 * time.Second,
			IdleTimeout:  60 * time.Second,
		},
	}
	return s
}

func handleHealthz(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("ok"))
}

// Start starts the HTTP server. It blocks until the server is shut down.
func (s *Server) Start() error {
	log.Printf("core-go api listening on %s", s.addr)
	return s.http.ListenAndServe()
}

// Shutdown gracefully shuts down the server.
func (s *Server) Shutdown(ctx context.Context) error {
	return s.http.Shutdown(ctx)
}
