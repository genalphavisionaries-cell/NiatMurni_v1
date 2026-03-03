package config

import "os"

// Config holds environment-loaded configuration.
type Config struct {
	DBDSN    string
	RedisURL string
}

// Load reads configuration from environment variables.
// Returns error if required vars are missing.
func Load() (*Config, error) {
	dbDSN := os.Getenv("DB_DSN")
	if dbDSN == "" {
		return nil, &MissingEnvError{Var: "DB_DSN"}
	}
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		return nil, &MissingEnvError{Var: "REDIS_URL"}
	}
	return &Config{
		DBDSN:    dbDSN,
		RedisURL: redisURL,
	}, nil
}
