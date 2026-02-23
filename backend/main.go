package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/eray-cirit/ciryt-backend/config"
	"github.com/eray-cirit/ciryt-backend/database"
	"github.com/eray-cirit/ciryt-backend/middleware"
	"github.com/eray-cirit/ciryt-backend/routes"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	Version   = "1.1.0"
	StartTime time.Time
)

func main() {
	StartTime = time.Now()

	// Structured logging (slog — JSON formatı)
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	slog.Info("🚀 Ciryt API başlatılıyor", "version", Version)

	// Config yükle
	cfg := config.Load()

	// Veritabanı bağlantıları
	database.ConnectPostgres(cfg)
	database.ConnectRedis(cfg)

	// Migration'ları çalıştır (varsa)
	if err := database.RunMigrations(cfg); err != nil {
		slog.Error("Migration hatası", "error", err)
	}

	// Gin mode
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Global middleware (sıralama önemli)
	router.Use(gin.Recovery())                       // Panic recovery
	router.Use(middleware.RequestLoggerMiddleware()) // Request ID + structured logging
	router.Use(middleware.MetricsMiddleware())       // Prometheus metrics
	router.Use(middleware.CORSMiddleware(cfg.AllowedOrigins))

	// ==========================================
	// Prometheus metrics endpoint
	// ==========================================
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// ==========================================
	// Health check (genişletilmiş)
	// ==========================================
	router.GET("/health", func(c *gin.Context) {
		sqlDB, _ := database.DB.DB()
		dbStatus := "ok"
		if err := sqlDB.Ping(); err != nil {
			dbStatus = "error: " + err.Error()
		}

		redisStatus := "ok"
		if _, err := database.Redis.Ping(database.Ctx).Result(); err != nil {
			redisStatus = "error: " + err.Error()
		}

		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "ciryt-api",
			"version": Version,
			"uptime":  time.Since(StartTime).String(),
			"checks": gin.H{
				"database": dbStatus,
				"redis":    redisStatus,
			},
		})
	})

	// ==========================================
	// API route'ları
	// ==========================================
	routes.Setup(router, cfg)

	// HTTP Server (production-grade timeouts)
	srv := &http.Server{
		Addr:              ":" + cfg.ServerPort,
		Handler:           router,
		ReadTimeout:       15 * time.Second,
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    1 << 20, // 1MB
	}

	// Sunucuyu goroutine'de başlat
	go func() {
		slog.Info("Server listening",
			"port", cfg.ServerPort,
			"version", Version,
			"metrics", "/metrics",
			"health", "/health",
		)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("Server error", "error", err)
			os.Exit(1)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit

	slog.Info("Shutting down server...", "signal", sig.String())

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("Server shutdown error", "error", err)
	}

	sqlDB, _ := database.DB.DB()
	sqlDB.Close()
	database.Redis.Close()

	slog.Info("✅ Server stopped gracefully")
}
