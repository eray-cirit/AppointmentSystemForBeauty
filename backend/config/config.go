package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	// Database
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	// Redis
	RedisHost string
	RedisPort string

	// JWT
	JWTSecret            string
	JWTExpiration        time.Duration
	JWTRefreshExpiration time.Duration

	// Server
	ServerPort     string
	AllowedOrigins string
}

func Load() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️  .env dosyası bulunamadı, ortam değişkenleri kullanılıyor")
	}

	return &Config{
		DBHost:               getEnv("DB_HOST", "localhost"),
		DBPort:               getEnv("DB_PORT", "5432"),
		DBUser:               getEnv("DB_USER", "ciryt"),
		DBPassword:           getEnv("DB_PASSWORD", "ciryt2026"),
		DBName:               getEnv("DB_NAME", "ciryt_db"),
		RedisHost:            getEnv("REDIS_HOST", "localhost"),
		RedisPort:            getEnv("REDIS_PORT", "6379"),
		JWTSecret:            getEnv("JWT_SECRET", "default-secret"),
		JWTExpiration:        parseDuration(getEnv("JWT_EXPIRATION", "24h")),
		JWTRefreshExpiration: parseDuration(getEnv("JWT_REFRESH_EXPIRATION", "168h")),
		ServerPort:           getEnv("SERVER_PORT", "8080"),
		AllowedOrigins:       getEnv("ALLOWED_ORIGINS", "http://localhost:3000"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func parseDuration(s string) time.Duration {
	d, err := time.ParseDuration(s)
	if err != nil {
		return 24 * time.Hour
	}
	return d
}
