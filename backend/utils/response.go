package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Standart API response yapısı
type APIResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Data    any    `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
}

// Başarılı response
func Success(c *gin.Context, status int, message string, data any) {
	c.JSON(status, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// Hata response
func Error(c *gin.Context, status int, message string) {
	c.JSON(status, APIResponse{
		Success: false,
		Error:   message,
	})
}

// 400 Bad Request
func BadRequest(c *gin.Context, message string) {
	Error(c, http.StatusBadRequest, message)
}

// 401 Unauthorized
func Unauthorized(c *gin.Context, message string) {
	Error(c, http.StatusUnauthorized, message)
}

// 403 Forbidden
func Forbidden(c *gin.Context, message string) {
	Error(c, http.StatusForbidden, message)
}

// 404 Not Found
func NotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, message)
}

// 500 Internal Server Error
func InternalError(c *gin.Context, message string) {
	Error(c, http.StatusInternalServerError, message)
}
