package cache

import (
	"context"
	"crypto/tls"
	"net/url"

	"github.com/redis/go-redis/v9"
)

// NewClient creates a Redis client from URL (redis:// or rediss://).
// For rediss://, TLS is enabled with MinVersion TLS 1.2.
// Returns error if connection or ping fails.
func NewClient(ctx context.Context, redisURL string) (*redis.Client, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, err
	}
	u, _ := url.Parse(redisURL)
	if u.Scheme == "rediss" {
		opts.TLSConfig = &tls.Config{MinVersion: tls.VersionTLS12}
	}
	client := redis.NewClient(opts)
	if err := client.Ping(ctx).Err(); err != nil {
		_ = client.Close()
		return nil, err
	}
	return client, nil
}
