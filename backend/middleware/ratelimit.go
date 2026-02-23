package middleware

import (
	"fmt"
	"net/http"
	"time"

	"github.com/eray-cirit/ciryt-backend/database"
	"github.com/eray-cirit/ciryt-backend/utils"
	"github.com/gin-gonic/gin"
)

// Redis bazlı rate limiting
// maxRequests: izin verilen istek sayısı
// window: zaman penceresi
func RateLimitMiddleware(maxRequests int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		key := fmt.Sprintf("ratelimit:%s:%s", ip, c.FullPath())

		current, err := database.Redis.Incr(database.Ctx, key).Result()
		if err != nil {
			c.Next()
			return
		}

		// İlk istek — TTL ayarla
		if current == 1 {
			database.Redis.Expire(database.Ctx, key, window)
		}

		if current > int64(maxRequests) {
			utils.Error(c, http.StatusTooManyRequests, "Çok fazla istek. Lütfen bekleyin.")
			c.Abort()
			return
		}

		c.Next()
	}
}
