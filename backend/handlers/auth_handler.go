package handlers

import (
	"net/http"
	"strings"

	"github.com/eray-cirit/ciryt-backend/config"
	"github.com/eray-cirit/ciryt-backend/models"
	"github.com/eray-cirit/ciryt-backend/services"
	"github.com/eray-cirit/ciryt-backend/utils"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
	config      *config.Config
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		authService: services.NewAuthService(cfg),
		config:      cfg,
	}
}

// POST /api/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Geçersiz istek: "+err.Error())
		return
	}

	response, err := h.authService.Register(req)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, http.StatusCreated, "Kayıt başarılı", response)
}

// POST /api/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Email ve şifre gerekli")
		return
	}

	response, err := h.authService.Login(req)
	if err != nil {
		utils.Unauthorized(c, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Giriş başarılı", response)
}

// POST /api/auth/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	if err := h.authService.Logout(tokenString); err != nil {
		utils.InternalError(c, "Çıkış yapılırken hata oluştu")
		return
	}

	utils.Success(c, http.StatusOK, "Çıkış başarılı", nil)
}

// GET /api/auth/me
func (h *AuthHandler) Me(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.Unauthorized(c, "Kimlik doğrulanamadı")
		return
	}

	user, err := h.authService.GetCurrentUser(userID.(uint))
	if err != nil {
		utils.NotFound(c, "Kullanıcı bulunamadı")
		return
	}

	utils.Success(c, http.StatusOK, "", user)
}
