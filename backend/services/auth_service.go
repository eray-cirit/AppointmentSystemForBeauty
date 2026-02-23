package services

import (
	"errors"
	"time"

	"github.com/eray-cirit/ciryt-backend/config"
	"github.com/eray-cirit/ciryt-backend/database"
	"github.com/eray-cirit/ciryt-backend/models"
	"github.com/eray-cirit/ciryt-backend/repositories"
	"github.com/eray-cirit/ciryt-backend/utils"
)

type AuthService struct {
	userRepo *repositories.UserRepository
	config   *config.Config
}

func NewAuthService(cfg *config.Config) *AuthService {
	return &AuthService{
		userRepo: repositories.NewUserRepository(),
		config:   cfg,
	}
}

// Kayıt
func (s *AuthService) Register(req models.RegisterRequest) (*models.AuthResponse, error) {
	// Email kontrolü
	if s.userRepo.ExistsByEmail(req.Email) {
		return nil, errors.New("bu email adresi zaten kullanımda")
	}

	// Şifre hashle
	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, errors.New("şifre işlenirken hata oluştu")
	}

	// Kullanıcı oluştur
	user := &models.User{
		Email:        req.Email,
		PasswordHash: hash,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Gender:       req.Gender,
		Role:         "user",
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, errors.New("kullanıcı oluşturulurken hata oluştu")
	}

	// Token'lar oluştur
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role, s.config.JWTSecret, s.config.JWTExpiration)
	if err != nil {
		return nil, errors.New("token oluşturulurken hata oluştu")
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Email, user.Role, s.config.JWTSecret, s.config.JWTRefreshExpiration)
	if err != nil {
		return nil, errors.New("refresh token oluşturulurken hata oluştu")
	}

	// Session'ı Redis'e kaydet
	database.Redis.Set(database.Ctx, sessionKey(user.ID), user.Email, 24*time.Hour)

	return &models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         *user,
	}, nil
}

// Giriş
func (s *AuthService) Login(req models.LoginRequest) (*models.AuthResponse, error) {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, errors.New("email veya şifre hatalı")
	}

	if !utils.CheckPassword(req.Password, user.PasswordHash) {
		return nil, errors.New("email veya şifre hatalı")
	}

	// Token'lar oluştur
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role, s.config.JWTSecret, s.config.JWTExpiration)
	if err != nil {
		return nil, errors.New("token oluşturulurken hata oluştu")
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Email, user.Role, s.config.JWTSecret, s.config.JWTRefreshExpiration)
	if err != nil {
		return nil, errors.New("refresh token oluşturulurken hata oluştu")
	}

	// Session'ı Redis'e kaydet
	database.Redis.Set(database.Ctx, sessionKey(user.ID), user.Email, 24*time.Hour)

	return &models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         *user,
	}, nil
}

// Çıkış — token blacklist
func (s *AuthService) Logout(tokenString string) error {
	claims, err := utils.ValidateToken(tokenString, s.config.JWTSecret)
	if err != nil {
		return nil // Zaten geçersiz token, sorun yok
	}

	// Token'ın kalan süresini hesapla
	remaining := time.Until(claims.ExpiresAt.Time)
	if remaining > 0 {
		return utils.BlacklistToken(tokenString, remaining)
	}
	return nil
}

// Mevcut kullanıcı bilgisi
func (s *AuthService) GetCurrentUser(userID uint) (*models.User, error) {
	return s.userRepo.FindByID(userID)
}

func sessionKey(userID uint) string {
	return "session:" + string(rune(userID))
}
