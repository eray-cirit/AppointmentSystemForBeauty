package middleware

import (
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Request ID + structured logging middleware
func RequestLoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Unique request ID
		requestID := uuid.New().String()
		c.Set("requestID", requestID)
		c.Header("X-Request-ID", requestID)

		start := time.Now()

		c.Next()

		duration := time.Since(start)

		slog.Info("HTTP Request",
			"request_id", requestID,
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
			"status", c.Writer.Status(),
			"duration_ms", duration.Milliseconds(),
			"ip", c.ClientIP(),
			"user_agent", c.Request.UserAgent(),
		)
	}
}
