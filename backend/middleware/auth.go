package middleware

import (
	"strings"

	"github.com/eray-cirit/ciryt-backend/utils"
	"github.com/gin-gonic/gin"
)

// JWT auth middleware — Authorization: Bearer <token>
func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.Unauthorized(c, "Authorization header gerekli")
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			utils.Unauthorized(c, "Bearer token formatı gerekli")
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(tokenString, jwtSecret)
		if err != nil {
			utils.Unauthorized(c, "Geçersiz veya süresi dolmuş token")
			c.Abort()
			return
		}

		// Context'e kullanıcı bilgilerini ekle
		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// Admin middleware — sadece admin rolü
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role.(string) != "admin" {
			utils.Forbidden(c, "Bu işlem için admin yetkiniz gerekli")
			c.Abort()
			return
		}
		c.Next()
	}
}
