package main

import (
	"context"
	"log"

	"github.com/niatmurni/core-go/internal/cache"
	"github.com/niatmurni/core-go/internal/config"
	"github.com/niatmurni/core-go/internal/db"
	"github.com/niatmurni/core-go/internal/server"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	ctx := context.Background()

	pool, err := db.NewPool(ctx, cfg.DBDSN)
	if err != nil {
		log.Fatalf("postgres: %v", err)
	}
	defer pool.Close()

	rdb, err := cache.NewClient(ctx, cfg.RedisURL)
	if err != nil {
		log.Fatalf("redis: %v", err)
	}
	defer rdb.Close()

	srv := server.New(":8080")
	log.Fatal(srv.Start())
}
