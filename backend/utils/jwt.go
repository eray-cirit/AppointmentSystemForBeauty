package utils

import (
	"fmt"
	"time"

	"github.com/eray-cirit/ciryt-backend/database"
	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// Access token oluştur
func GenerateAccessToken(userID uint, email, role, secret string, expiration time.Duration) (string, error) {
	claims := JWTClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "ciryt-api",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// Refresh token oluştur
func GenerateRefreshToken(userID uint, email, role, secret string, expiration time.Duration) (string, error) {
	claims := JWTClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "ciryt-api-refresh",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// Token doğrula ve claims döndür
func ValidateToken(tokenString, secret string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("beklenmeyen imzalama yöntemi: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("geçersiz token")
	}

	// Redis blacklist kontrolü
	blacklisted, _ := database.Redis.Get(database.Ctx, "blacklist:"+tokenString).Result()
	if blacklisted != "" {
		return nil, fmt.Errorf("token iptal edilmiş")
	}

	return claims, nil
}

// Token'ı blacklist'e ekle (logout için)
func BlacklistToken(tokenString string, expiration time.Duration) error {
	return database.Redis.Set(database.Ctx, "blacklist:"+tokenString, "1", expiration).Err()
}
