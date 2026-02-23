package database

import (
	"context"
	"fmt"
	"log"

	"github.com/eray-cirit/ciryt-backend/config"
	"github.com/redis/go-redis/v9"
)

var Redis *redis.Client
var Ctx = context.Background()

func ConnectRedis(cfg *config.Config) {
	addr := fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort)

	Redis = redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: "", // Şifresiz (development)
		DB:       0,
	})

	_, err := Redis.Ping(Ctx).Result()
	if err != nil {
		log.Fatalf("❌ Redis bağlantı hatası: %v", err)
	}

	log.Println("✅ Redis bağlantısı başarılı")
}
