package config

import "fmt"

// MissingEnvError is returned when a required env var is missing.
type MissingEnvError struct {
	Var string
}

func (e *MissingEnvError) Error() string {
	return fmt.Sprintf("missing required env: %s", e.Var)
}
