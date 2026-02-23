package routes

import (
	"time"

	"github.com/eray-cirit/ciryt-backend/config"
	"github.com/eray-cirit/ciryt-backend/handlers"
	"github.com/eray-cirit/ciryt-backend/middleware"
	"github.com/gin-gonic/gin"
)

func Setup(router *gin.Engine, cfg *config.Config) {
	// Handlers
	authHandler := handlers.NewAuthHandler(cfg)
	userHandler := handlers.NewUserHandler()
	businessHandler := handlers.NewBusinessHandler()
	serviceHandler := handlers.NewServiceHandler()
	appointmentHandler := handlers.NewAppointmentHandler()

	// API v1 grubu
	api := router.Group("/api/v1")

	// ==========================================
	// AUTH ROUTES (public)
	// ==========================================
	auth := api.Group("/auth")
	{
		auth.POST("/register", middleware.RateLimitMiddleware(5, time.Minute), authHandler.Register)
		auth.POST("/login", middleware.RateLimitMiddleware(10, time.Minute), authHandler.Login)
		auth.POST("/logout", middleware.AuthMiddleware(cfg.JWTSecret), authHandler.Logout)
		auth.GET("/me", middleware.AuthMiddleware(cfg.JWTSecret), authHandler.Me)
	}

	// ==========================================
	// USER ROUTES (auth required)
	// ==========================================
	users := api.Group("/users")
	users.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		users.GET("", middleware.AdminMiddleware(), userHandler.GetAll)
		users.GET("/:id", userHandler.GetByID)
		users.PUT("/:id", userHandler.Update)
		users.DELETE("/:id", middleware.AdminMiddleware(), userHandler.Delete)
	}

	// ==========================================
	// BUSINESS ROUTES
	// ==========================================
	businesses := api.Group("/businesses")
	{
		// Public
		businesses.GET("", businessHandler.GetAll)
		businesses.GET("/:id", businessHandler.GetByID)
		businesses.GET("/:id/services", serviceHandler.GetByBusiness) // İşletmenin hizmetleri

		// Auth required
		businesses.POST("", middleware.AuthMiddleware(cfg.JWTSecret), businessHandler.Create)
		businesses.PUT("/:id", middleware.AuthMiddleware(cfg.JWTSecret), businessHandler.Update)
		businesses.DELETE("/:id", middleware.AuthMiddleware(cfg.JWTSecret), businessHandler.Delete)
		businesses.POST("/:id/services", middleware.AuthMiddleware(cfg.JWTSecret), serviceHandler.Create) // Hizmet ekle
	}

	// ==========================================
	// SERVICE ROUTES (auth required)
	// ==========================================
	services := api.Group("/services")
	services.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		services.PUT("/:id", serviceHandler.Update)
		services.DELETE("/:id", serviceHandler.Delete)
	}

	// ==========================================
	// APPOINTMENT ROUTES (auth required)
	// ==========================================
	appointments := api.Group("/appointments")
	appointments.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		appointments.POST("", appointmentHandler.Create)                   // Randevu oluştur
		appointments.GET("", appointmentHandler.GetAll)                    // Listele (filtrelenmiş)
		appointments.GET("/my", appointmentHandler.GetMyAppointments)      // Benim randevularım
		appointments.GET("/:id", appointmentHandler.GetByID)               // Detay
		appointments.PATCH("/:id/status", appointmentHandler.UpdateStatus) // Durum güncelle
	}
}
